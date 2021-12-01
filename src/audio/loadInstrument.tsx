import {
  Sampler,
  MembraneSynth,
  SamplerOptions,
  PolySynth,
  context,
  Destination,
  UserMedia,
  now,
  Transport
} from "tone";
import { Note } from "@tonejs/midi/dist/Note";
import StartAudioContext from "startaudiocontext";

import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";

import * as synthsApi from "./synths/synths";
import { getSamples } from "./samplers/samplers";
import { initMetronome } from "./metronome/metronome";
import { buildEffectsChain } from "./utils";

type Instrument = Sampler | PolySynth;
interface ISynthOptions {
  synthName: types.AvailableSynthsEnum;
}

interface ISamplerOptions {
  instrument: types.Instrument;
  sample: string;
  sampleMap?: SamplerOptions["urls"];
}

interface IInstrumentsEvents {
  [key: string]: Function;
}

export class Instruments {
  samplers: Sampler[];
  polySynths: PolySynth[];
  synthNames: types.AvailableSynthsEnum[];
  metronome: MembraneSynth;
  _useSampler: boolean;
  // _samplerCache: Sampler;
  _synthOptions: ISynthOptions | undefined;
  _samplerOptions: ISamplerOptions | undefined;
  _effectChains: types.AvailableEffects[];
  _effectChainsNames: types.AvailableEffectsNames[];
  _extraConnections: types.IExtraConnection[];
  // _setPlayerStatus: (status: string) => void;
  _effectsActivated: boolean;
  _delays: number[];
  _microphone: UserMedia | null;
  publishingChanges: boolean;
  eventListeners: IInstrumentsEvents;

  constructor(
    useSample: boolean,
    synthOptions?: ISynthOptions,
    samplerOptions?: ISamplerOptions
  ) {
    // if (!synthOptions && !samplerOptions) {
    //   throw "Either synthOptions or samplerOptions must be provided";
    // }
    console.log("Constructing new Instruments class");

    this.synthNames = localStorageUtils.getSynthName() || [
      types.AvailableSynthsEnum.Synth,
    ];
    this.metronome = initMetronome();
    this._useSampler = useSample;
    this._synthOptions = synthOptions;
    this._samplerOptions = samplerOptions;
    this._effectsActivated = true;
    this.publishingChanges = false;
    this.samplers = [];
    this._delays = localStorageUtils.getDelay() || [];
    this._microphone = null;

    this.polySynths = [];
    this._effectChains = [];
    this.eventListeners = {};
    this._effectChainsNames = localStorageUtils.getEffectChainNames() || [];
    this._extraConnections = localStorageUtils.getExtraConnections() || [];
    // this._setPlayerStatus = setPlayerStatus;
    this.addInstrument = this.addInstrument.bind(this);
    this.removeInstrument = this.removeInstrument.bind(this);
    this.downloadSamplers = this.downloadSamplers.bind(this);
    // this._triggerAttackSynths = this._triggerAttackSynths.bind(this);
    this.triggerAttack = this.triggerAttack.bind(this);
    this.triggerRelease = this.triggerRelease.bind(this);
    this.changeFxSettings = this.changeFxSettings.bind(this);
    this.clearPlayingNotes = this.clearPlayingNotes.bind(this);
    this.getVolume = this.getVolume.bind(this);
    this.changeVolume = this.changeVolume.bind(this);
    this.getSynthSettings = this.getSynthSettings.bind(this);
    this.playMetronome = this.playMetronome.bind(this);
    this._buildTrack = this._buildTrack.bind(this);
    this._disposeTrack = this._disposeTrack.bind(this);
    this.setSynthSettingsOscillator = this.setSynthSettingsOscillator.bind(
      this
    );
    this._getInstruments = this._getInstruments.bind(this);
    StartAudioContext(context, "#playButton").then(function () {
      //started
    });
  }

  async init() {
    // have this because constructor cant have async
    const settings = localStorageUtils.getDelay() || [0]; // just to get number of instruments dont really need delay
    for (let i = 0; i < settings.length; i++) {
      await this.addInstrument(i);
    }
    const hasSaveFromLocalStorage = this._effectChainsNames.length > 0;
    if (hasSaveFromLocalStorage) {
      await this._publishFxChange();
    }
  }

  on(event: string, callback: Function) {
    this.eventListeners[event] = callback;
  }

  _activateMicrophone() {
    console.log("Activating microphone...");
    if (this._microphone) {
      this.closeMicrophone();
    }
    const mic = new UserMedia();
    mic.chain(...this._effectChains, Destination);
    this._microphone = mic;
  }

  openMicrophone() {
    console.log("Opening microphone...");
    if (!this._microphone) {
      this._activateMicrophone();
    }
    this._microphone?.open();
    this.eventListeners.actioned();
  }

  closeMicrophone() {
    console.log("Closing Microphone...");
    this._microphone?.close();
    this._microphone?.disconnect();
    this._microphone?.dispose();
    this._microphone = null;
    this.eventListeners?.actioned();
  }

  isMicrophoneOn() {
    return Boolean(this._microphone);
  }

  /**
   * If there is trackIndex, then it is not just adding instrument
   * Saved settings will be loaded
   * @param trackIndex actually only for synths not samplers
   */
  async addInstrument(trackIndex?: number) {
    console.log("Adding instrument");
    const instrument = await this._buildTrack(trackIndex);
    // need to connect to effectChain if have effects
    instrument.toDestination();
    if (this._useSampler) {
      this.samplers.push(instrument as Sampler);
    } else {
      this.polySynths.push(instrument as PolySynth);
    }

    const savedVolume = localStorageUtils.getVolume();
    if (savedVolume) {
      this.changeVolume(savedVolume);
    }
  }

  removeInstrument(trackIndex: number) {
    console.log(`Removing instrument ${trackIndex}`);
    const instrument = this._useSampler ? this.samplers : this.polySynths;
    if (instrument.length > 1) {
      this._disposeTrack(trackIndex);
      instrument.splice(trackIndex, 1);
    }
  }

  getEffectsActivated() {
    return this._effectsActivated;
  }

  toggleEffectsActivated() {
    if (this._effectChains.length === 0) {
      return;
    }
    const instruments = this._getInstruments();
    instruments.forEach((instrument: Instrument) => {
      instrument.disconnect();
      if (this._effectsActivated) {
        instrument.toDestination();
      } else {
        instrument.connect(this._effectChains[0]); // wrong?
      }
    });
    this._effectsActivated = !this._effectsActivated;
  }

  /**
   * will load synth settings if synthIndex
   * @param effectsChainName
   * @param synthIndex
   */
  async _buildTrack(synthIndex?: number): Promise<Sampler | PolySynth> {
    const savedVolume = localStorageUtils.getVolume();
    if (this._useSampler) {
      const sampleMap = this._samplerOptions?.sampleMap
        ? this._samplerOptions?.sampleMap
        : await this.downloadSamplers();
      if (sampleMap) {
        let sampler = new Sampler(sampleMap, {
          attack: 0.01,
        });
        savedVolume && this.changeVolume(savedVolume, [sampler]);
        // this._setPlayerStatus("");
        return sampler;
      } else {
        // this._setPlayerStatus("");
        throw new Error("CRITICAL: no sample map provided.");
      }
    } else {
      let polySynth = synthsApi.initSynths(
        synthIndex !== undefined
          ? this.synthNames[synthIndex]
          : types.AvailableSynthsEnum.Synth,
        synthIndex
      );
      savedVolume && this.changeVolume(savedVolume, undefined, [polySynth]);
      // this._setPlayerStatus("");
      return polySynth;
    }
  }

  async downloadSamplers() {
    if (
      this._useSampler &&
      this._samplerOptions?.instrument &&
      this._samplerOptions?.sample
    ) {
      console.log(
        `Downloading sample ${this._samplerOptions.instrument} ${this._samplerOptions.sample}`
      );
      const sampler = await getSamples(
        this._samplerOptions.instrument,
        this._samplerOptions.sample,
        this.eventListeners?.downloadingSamples
      );
      return sampler;
    }
  }

  triggerAttack(note: string, velocity: number) {
    if (!this.publishingChanges) {
      const instruments = this._getInstruments();
      for (let i = 0; i < instruments.length; i++) {
        if (!instruments[i].disposed) {
          try {
            instruments[i].triggerAttack(
              note,
              `+${this._delays[i] || 0}`,
              velocity
            );
          } catch (error) {
            console.log({ error });
          }
        }
      }
    }
  }

  triggerRelease(note: string) {
    if (!this.publishingChanges) {
      const instruments = this._getInstruments();
      for (let i = 0; i < instruments.length; i++) {
        if (!instruments[i].disposed) {
          instruments[i].triggerRelease(note, "+0.01");
        }
      }
    }
  }

  /**
   * Disposes and sets tracks
   * @param track track to be set
   * @param trackIndex index to track to
   */
  _setTrack(newTrack: Instrument, trackIndex: number) {
    try {
      this._disposeTrack(trackIndex);
    } catch {
      // should only happen on init because no tracks exist on init
      console.log("No tracks to dispose");
    }
    if (this._useSampler) {
      this.samplers[trackIndex] = newTrack as Sampler;
    } else {
      this.polySynths[trackIndex] = newTrack as PolySynth;
    }
    console.log(`Set ${newTrack}@${trackIndex}`);
  }

  async addFx() {
    console.log(`Adding FX`);
    this._effectChainsNames.push(types.AvailableEffectsNames.gain);
    this._extraConnections.push({
      toMaster: false,
      effectorIndex: null,
    });
    await this._publishFxChange();
  }

  async removeFx(fxIndex: number) {
    console.log(`Removing FX ${fxIndex}`);
    for (let i = 0; i < this._extraConnections.length; i++) {
      this.changeExtraConnection(i, "effectorIndex", null, false);
    }

    this._extraConnections.splice(fxIndex, 1);
    this._effectChains.splice(fxIndex, 1);
    this._effectChainsNames.splice(fxIndex, 1);
    await this._publishFxChange();
    localStorageUtils.deleteFxSettings(fxIndex);
  }

  async changeFx(fxIndex: number, type: types.AvailableEffectsNames) {
    this._effectChainsNames[fxIndex] = type;
    await this._publishFxChange();
  }

  async _publishFxChange(retry: number = 0) {
    this.publishingChanges = true;
    /**
     * Sometimes active voices dont decrease. So if retried n times,
     * just allow to publish. Active voice should be dead by then.
     */
    if (
      !this._useSampler &&
      retry < 20 &&
      this.polySynths.length > 0 &&
      this.polySynths[0]?.activeVoices > 0
    ) {
      console.log(
        "Preparing to publish FX change. Waiting for synths to finish"
      );
      this.polySynths.forEach((polySynth) => {
        polySynth.releaseAll();
        polySynth.unsync();
      });
      setTimeout(() => {
        this._publishFxChange(retry + 1);
      }, 100);
      return;
    }
    console.log("Publishing FX Change...");
    const noOfExistingTracks = this._useSampler
      ? this.samplers.length
      : this.polySynths.length;
    if (!this._effectsActivated) {
      // dont add any effects if not activated
      for (let i = 0; i < noOfExistingTracks; i++) {
        const instrument = await this._buildTrack();
        instrument.toDestination();
        this._setTrack(instrument, i);
      }
    } else {
      if (this._effectChainsNames.length > 0) {
        const effectsChain = buildEffectsChain(this._effectChainsNames);
        this._effectChains = effectsChain;
        for (let i = 0; i < noOfExistingTracks; i++) {
          let instrument = await this._buildTrack(i);
          instrument = instrument.chain(...effectsChain, Destination);
          this._extraConnections.forEach((extraConnection, fxIndex) => {
            if (extraConnection.effectorIndex) {
              effectsChain[fxIndex].connect(
                effectsChain[extraConnection.effectorIndex]
              );
              if (extraConnection.toMaster) {
                effectsChain[fxIndex].toDestination();
              }
            }
          });
          this._setTrack(instrument, i);
        }
      } else {
        for (let i = 0; i < noOfExistingTracks; i++) {
          let instrument = await this._buildTrack(i);
          instrument = instrument.toDestination();
          this._setTrack(instrument, i);
        }
      }
    }

    const fxSettings = localStorageUtils.getFxSettings();
    if (fxSettings) {
      for (let i = 0; i < this._effectChainsNames.length; i++) {
        const paramSetting = fxSettings[i];
        if (paramSetting) {
          this.changeFxSettings(i, paramSetting.param, paramSetting.value);
        }
      }
    }
    this.publishingChanges = false;
    this.saveSettingsToLocalStorage();
    if (this._microphone) {
      this._activateMicrophone(); // restart mic
      this.openMicrophone();
    }
  }

  saveSettingsToLocalStorage() {
    console.log("SAVING");
    localStorageUtils.setEffectChainNames(this._effectChainsNames);
    localStorageUtils.setExtraConnections(this._extraConnections);
  }

  changeFxSettings(fxIndex: number, param: string, value: any) {
    param = param === "value" ? "gain" : param;
    this._effectChains[fxIndex].set({ [param]: value });
    localStorageUtils.setFxSettings(fxIndex, param, value);
  }

  clearPlayingNotes() {
    const instruments = this._getInstruments();
    setTimeout(() => {
      // wait till attacks are done etc. delayed
      instruments.forEach((instrument: Instrument) => {
        instrument.releaseAll();
      });
    }, 100);
  }

  scheduleNotesToPlay(notes: Note[]) {
    notes.forEach(note => {
      const instruments = this._getInstruments();
      instruments.forEach(intrument => {
        intrument.unsync();  // remove the old schedule
        intrument.sync();
        intrument.triggerAttackRelease(
          note.name,
          note.duration,
          note.time,
          note.velocity
        );
      })
      });
  }

  _disposeTrack(trackIndex: number) {
    console.log(`Disposing track ${trackIndex}`);
    this.clearPlayingNotes();
    const instruments = this._getInstruments();
    instruments[trackIndex].unsync();
    instruments[trackIndex].dispose();
    // this._effectChains.forEach((chain) => {
    //   chain.dispose();
    // });
  }

  destroy() {
    console.log("Destroying Instrument");
    const range = this._useSampler
      ? this.samplers.length
      : this.polySynths.length;
    for (let i = 0; i < range; i++) {
      this._disposeTrack(i);
    }
    this.metronome.dispose();
  }

  playMetronome() {
    this.metronome.triggerAttackRelease("A1", 0.2, `+${this._delays[0]}`);
  }

  getVolume() {
    const instruments = this._getInstruments();
    return instruments[0]?.volume.value;
  }

  changeVolume(volume: number, samplers?: Sampler[], polySynths?: PolySynth[]) {
    if (volume <= -15) {
      volume = -1000;
    }
    if (this._useSampler) {
      const samplers_ = samplers || this.samplers;
      for (let i = 0; i < samplers_.length; i++) {
        samplers_[i].volume.value = volume;
      }
    } else {
      const polySynths_: PolySynth[] = polySynths || this.polySynths;
      for (let i = 0; i < polySynths_.length; i++) {
        polySynths_[i].volume.value = volume;
      }
    }
    this.metronome.volume.value = volume - 5;
    localStorageUtils.setVolume(volume);
    if (this.eventListeners.actioned) {
      this.eventListeners.actioned();
    }
  }

  _getInstruments() {
    return this._useSampler ? this.samplers : this.polySynths;
  }

  getSynthSettings(synthIndex: number): types.ISynthSettings | null {
    const synthSettings = this.polySynths[synthIndex].get();
    const envelope = synthSettings.envelope;
    const oscillator = synthSettings.oscillator;
    const settings = {
      oscillator: {
        type: oscillator.type as types.OscillatorType,
        //@ts-ignore
        spread: oscillator.spread,
        //@ts-ignore
        count: oscillator.count,
        //@ts-ignore
        harmonicity: oscillator.harmonicity,
      },
      envelope: {
        attack: envelope.attack as number,
        decay: envelope.decay as number,
        sustain: envelope.sustain,
        release: envelope.release as number,
      },
      others: {
        detune: synthSettings.detune,
        volume: synthSettings.volume,
      },
    };
    return settings;
  }

  setSynthSettingsEnvelope(
    key: keyof types.IEnvelope,
    value: any,
    synthIndex: number
  ) {
    this.polySynths[synthIndex].set({
      envelope: {
        [key]: value,
      },
    });
    const allSettings = this.polySynths.map((polySynth) => {
      const settings = polySynth.get();
      const envelopeSettings: types.IEnvelope = {
        attack: settings.envelope.attack as number,
        decay: settings.envelope.decay as number,
        sustain: settings.envelope.sustain,
        release: settings.envelope.release as number,
      };
      return envelopeSettings;
    });
    localStorageUtils.setSynthSettingsEnvelope(allSettings);
  }

  async setSynthSettingsOscillator(
    key: keyof types.IOscillator,
    value: any,
    synthIndex: number,
    retry: number = 0
  ) {
    this.publishingChanges = true;
    if (
      key === "type" &&
      retry < 50 &&
      this.polySynths.length > 0 &&
      this.polySynths[synthIndex]?.activeVoices > 0
    ) {
      this.polySynths[synthIndex].releaseAll();
      this.polySynths[synthIndex].unsync();
      setTimeout(() => {
        this.setSynthSettingsOscillator(key, value, synthIndex, retry + 1);
      }, 100);
      return;
    }

    this.polySynths[synthIndex].set({
      oscillator: {
        [key]: value,
      },
    });
    const oscillatorSettings = this.polySynths.map((polySynth) => {
      const synthSetting = polySynth.get();
      const oscillatorSetting: types.IOscillator = {
        //@ts-ignore
        type: synthSetting.oscillator.type,
        //@ts-ignore
        partials: synthSetting.oscillator.partials,
        //@ts-ignore
        count: synthSetting.oscillator.count,
        //@ts-ignore
        spread: synthSetting.oscillator.spread,
        //@ts-ignore
        harmonicity: synthSetting.oscillator.harmonicity,
      };
      return oscillatorSetting;
    });
    localStorageUtils.setSynthSettingsOscillator(oscillatorSettings);
    if (key === "type") {
      // if switch to new osci, the new osci will inherit the old osci settings
      // causing bugs. so just init a new one
      let polySynth = (await this._buildTrack(synthIndex)) as PolySynth;
      if (this._effectChainsNames.length > 0) {
        polySynth = polySynth.chain(...this._effectChains, Destination);
      } else {
        polySynth = polySynth.toDestination();
      }
      this._setTrack(polySynth, synthIndex);
    }
    this.publishingChanges = false;
  }

  setSynthSettingsOther(
    key: keyof types.IOtherSettings,
    value: any,
    synthIndex: number
  ) {
    this.polySynths[synthIndex].set({
      [key]: value,
    });
    const otherSettings = this.polySynths.map((polySynth) => {
      const settings = polySynth.get();
      const othersSetting: types.IOtherSettings = {
        detune: settings.detune,
        volume: settings.volume,
      };
      return othersSetting;
    });
    localStorageUtils.setSynthSettingsOthers(otherSettings);
  }

  getSynthName(synthIndex: number): types.AvailableSynthsEnum {
    return this.synthNames[synthIndex];
  }

  async setSynthName(
    synthName: types.AvailableSynthsEnum,
    synthIndex: number,
    retry: number = 0
  ) {
    this.publishingChanges = true;
    this.clearPlayingNotes();
    this.synthNames[synthIndex] = synthName;
    if (
      retry < 50 &&
      this.polySynths.length > 0 &&
      this.polySynths[synthIndex]?.activeVoices > 0
    ) {
      this.polySynths[synthIndex].releaseAll();
      this.polySynths[synthIndex].unsync();
      setTimeout(() => {
        this.setSynthName(synthName, synthIndex, retry + 1);
      }, 100);
      return;
    }
    localStorageUtils.setSynthName(this.synthNames);
    this.polySynths[synthIndex].releaseAll();
    this.polySynths[synthIndex].disconnect();
    this.polySynths[synthIndex].dispose();
    let polySynth = await this._buildTrack(
      synthIndex // not here originally
    );
    if (this._effectChainsNames.length > 0) {
      // const effectsChain = buildEffectsChain(this._effectChainsNames);
      polySynth = polySynth.chain(...this._effectChains, Destination);
    } else {
      polySynth = polySynth.toDestination();
    }
    this.polySynths[synthIndex] = polySynth as PolySynth;
    this.publishingChanges = false;
  }

  getEffectsChain() {
    return this._effectChains;
  }

  /**
   *
   * @param fxIndex
   * @param key
   * @param value
   * @param publish exists solely for removeFx extraConnections
   */
  async changeExtraConnection(
    fxIndex: number,
    key: keyof types.IExtraConnection,
    value: number | string | null | boolean,
    publish: boolean = true
  ) {
    value = value === "" ? null : value;
    //@ts-ignore
    this._extraConnections[fxIndex][key] = value;
    if (publish) {
      await this._publishFxChange();
    }
  }

  getExtraConnection(fxIndex: number): types.IExtraConnection {
    return this._extraConnections[fxIndex];
  }

  getDelay(trackIndex: number): number {
    if (this._delays[trackIndex] === undefined) {
      // delay not set up yet. just push a slot
      this._delays.push(0);
      this.setDelay(0, trackIndex);
    }
    return this._delays[trackIndex];
  }

  setDelay(delay: number, trackIndex: number) {
    this._delays[trackIndex] = delay;
    localStorageUtils.setDelay(this._delays);
  }

  cleanUp() {
    this.clearPlayingNotes();
    this.destroy();
  }
}
