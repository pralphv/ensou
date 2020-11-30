import { Sampler, MembraneSynth, SamplerOptions, PolySynth, context } from "tone";
import StartAudioContext from "startaudiocontext";

import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";

import * as synthsApi from "./synths/synths";
import { getSamples } from "./samplers/samplers";
import { initMetronome } from "./metronome/metronome";
import { buildTrack } from "./utils";

type Instrument = Sampler | PolySynth;
interface ISynthOptions {
  synthName: types.AvailableSynthsEnum;
}

interface ISamplerOptions {
  instrument: types.Instrument;
  sample: string;
  sampleMap?: SamplerOptions["urls"];
}
let first = true;

export class Instruments {
  samplers: Sampler[];
  polySynths: PolySynth[];
  synthName: types.AvailableSynthsEnum;
  metronome: MembraneSynth;
  _useSampler: boolean;
  // _samplerCache: Sampler;
  _synthOptions: ISynthOptions | undefined;
  _samplerOptions: ISamplerOptions | undefined;
  _effectChains: types.AvailableEffects[][];
  _effectChainsNames: types.AvailableEffectsNames[][];
  _extraConnections: types.IExtraConnection[][];
  _setPlayerStatus: (status: string) => void;
  _effectsActivated: boolean;
  _delay: number;
  publishingChanges: boolean;

  constructor(
    useSample: boolean,
    setPlayerStatus: (status: string) => void,
    synthOptions?: ISynthOptions,
    samplerOptions?: ISamplerOptions
  ) {
    // if (!synthOptions && !samplerOptions) {
    //   throw "Either synthOptions or samplerOptions must be provided";
    // }
    console.log("Constructing new Instruments class");

    this.synthName =
      localStorageUtils.getSynthName() || types.AvailableSynthsEnum.Synth;
    this.metronome = initMetronome();
    this._useSampler = useSample;
    this._synthOptions = synthOptions;
    this._samplerOptions = samplerOptions;
    this._effectsActivated = true;
    this.publishingChanges = false;
    this.samplers = [];
    this._delay = localStorageUtils.getDelay() || 0.01;

    this.polySynths = [];
    this._effectChains = [];
    this._effectChainsNames = localStorageUtils.getEffectChainNames() || [];
    this._extraConnections = localStorageUtils.getExtraConnections() || [];
    this._setPlayerStatus = setPlayerStatus;
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
    StartAudioContext(context, '#button').then(function(){
      //started
    })
  }

  async init() {
    // have this because constructor cant have async
    const hasSaveFromLocalStorage = this._effectChainsNames.length > 0;
    if (hasSaveFromLocalStorage) {
      for (let i = 0; i < this._effectChainsNames.length; i++) {
        await this._publishFxChange(i);
      }
    } else {
      await this.addInstrument();
    }
  }

  async addInstrument() {
    console.log("Adding instrument");
    const trackComponents = await this._buildTrack([]);
    if (this._useSampler) {
      this.samplers.push(trackComponents.track as Sampler);
      console.log(this.samplers);
    } else {
      this.polySynths.push(trackComponents.track as PolySynth);
    }
    this._effectChains.push([]);
    this._effectChainsNames.push([]);
    this._extraConnections.push([]);
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
      this._effectChains.splice(trackIndex, 1);
      this._effectChainsNames.splice(trackIndex, 1);
    }
  }

  getEffectsActivated() {
    return this._effectsActivated;
  }

  toggleEffectsActivated() {
    if (this._effectChains.length === 0) {
      return;
    }
    const instruments = this._useSampler ? this.samplers : this.polySynths;
    instruments.forEach((instrument: Instrument) => {
      instrument.disconnect();
      if (this._effectsActivated) {
        instrument.toDestination();
      } else {
        instrument.connect(this._effectChains[0][0]);
      }
    });
    this._effectsActivated = !this._effectsActivated;
  }

  async _buildTrack(
    effectsChainName: types.AvailableEffectsNames[]
  ): Promise<types.ITrackComponents> {
    console.log(`Building track for ${effectsChainName}`);
    const savedVolume = localStorageUtils.getVolume();
    if (this._useSampler) {
      const sampleMap = this._samplerOptions?.sampleMap
        ? this._samplerOptions?.sampleMap
        : await this.downloadSamplers();
      if (sampleMap) {
        const sampler = new Sampler(sampleMap, {
          attack: 0.01,
        });
        savedVolume && this.changeVolume(savedVolume, [sampler]);
        this._setPlayerStatus("");
        return buildTrack(sampler, effectsChainName);
      } else {
        this._setPlayerStatus("");
        throw new Error("CRITICAL: no sample map provided.");
      }
    } else {
      const polySynth = synthsApi.initSynths(this.synthName);
      savedVolume && this.changeVolume(savedVolume, undefined, [polySynth]);
      this._setPlayerStatus("");
      return buildTrack(polySynth, effectsChainName);
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
        this._setPlayerStatus
      );
      return sampler;
    }
  }

  triggerAttack(note: string, velocity: number) {
    if (!this.publishingChanges) {
      const instruments = this._useSampler ? this.samplers : this.polySynths;
      for (let i = 0; i < instruments.length; i++) {
        if (!instruments[i].disposed) {
          instruments[i].triggerAttack(note, `+${this._delay}`, velocity);
        }
      }
    }
  }

  triggerRelease(note: string) {
    if (!this.publishingChanges) {
      const instruments = this._useSampler ? this.samplers : this.polySynths;
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
  _setTrack(track: Instrument, trackIndex: number) {
    try {
      this._disposeTrack(trackIndex);
    } catch {
      // should only happen on init because no tracks exist on init
      console.log("No tracks to dispose");
    }
    if (this._useSampler) {
      this.samplers[trackIndex] = track as Sampler;
    } else {
      this.polySynths[trackIndex] = track as PolySynth;
    }
    console.log(`Set ${track}@${trackIndex}`);
  }

  async addFx(trackIndex: number) {
    console.log(`Adding FX to track ${trackIndex}`);
    this._effectChainsNames[trackIndex].push(types.AvailableEffectsNames.gain);
    this._extraConnections[trackIndex].push({
      toMaster: false,
      effectorIndex: null,
    });
    await this._publishFxChange(trackIndex);
  }

  async removeFx(trackIndex: number, fxIndex: number) {
    console.log(`Removing FX ${fxIndex} from track ${trackIndex}`);
    for (let i = 0; i < this._extraConnections[trackIndex].length; i++) {
      this.changeExtraConnection(trackIndex, i, "effectorIndex", null, false);
    }

    this._extraConnections[trackIndex].splice(fxIndex, 1);
    this._effectChains[trackIndex].splice(fxIndex, 1);
    this._effectChainsNames[trackIndex].splice(fxIndex, 1);
    await this._publishFxChange(trackIndex);
    localStorageUtils.deleteFxSettings(trackIndex, fxIndex);
  }

  async changeFx(
    trackIndex: number,
    fxIndex: number,
    type: types.AvailableEffectsNames
  ) {
    this._effectChainsNames[trackIndex][fxIndex] = type;
    await this._publishFxChange(trackIndex);
  }

  /**
   * Sometimes active voices dont decrease. So if retried n times,
   * just allow to publish. Active voice should be dead by then.
   */
  async _publishFxChange(trackIndex: number, retry: number = 0) {
    this.publishingChanges = true;
    if (
      retry < 50 &&
      this.polySynths.length > 0 &&
      this.polySynths[0]?.activeVoices > 0
    ) {
      console.log(
        "Preparing to publish FX change. Waiting for synths to finish"
      );
      this.polySynths[0].releaseAll();
      this.polySynths[0].unsync();
      setTimeout(() => {
        this._publishFxChange(trackIndex, retry + 1);
      }, 100);
      return;
    }
    console.log("Publishing FX Change...");
    if (!this._effectsActivated) {
      // dont add any effects if not activated
      const track = await this._buildTrack([]);
      this._setTrack(track.track, trackIndex);
    } else {
      const track = await this._buildTrack(this._effectChainsNames[trackIndex]);
      this._extraConnections[trackIndex].forEach((extraConnection, fxIndex) => {
        if (extraConnection.effectorIndex) {
          track.effectChain[fxIndex].connect(
            track.effectChain[extraConnection.effectorIndex]
          );
          if (extraConnection.toMaster) {
            track.effectChain[fxIndex].toDestination();
          }
        }
      });
      this._setTrack(track.track, trackIndex);
      this._effectChains[trackIndex] = track.effectChain;
    }

    const fxSettings = localStorageUtils.getFxSettings();
    if (fxSettings) {
      for (let i = 0; i < this._effectChainsNames[trackIndex].length; i++) {
        const fxSettingKey = localStorageUtils.createFxSettingsKey(
          trackIndex,
          i
        );
        const paramSetting = fxSettings[fxSettingKey];
        if (paramSetting) {
          this.changeFxSettings(
            trackIndex,
            i,
            paramSetting.param,
            paramSetting.value
          );
        }
      }
    }
    this.publishingChanges = false;
    this.saveSettingsToLocalStorage();
  }

  saveSettingsToLocalStorage() {
    console.log("SAVING");
    localStorageUtils.setEffectChainNames(this._effectChainsNames);
    localStorageUtils.setExtraConnections(this._extraConnections);
  }

  changeFxSettings(
    trackIndex: number,
    fxIndex: number,
    param: string,
    value: any
  ) {
    param = param === "value" ? "gain" : param;
    this._effectChains[trackIndex][fxIndex].set({ [param]: value });
    localStorageUtils.setFxSettings(trackIndex, fxIndex, param, value);
  }

  clearPlayingNotes() {
    const instruments = this._useSampler ? this.samplers : this.polySynths;
    setTimeout(() => {
      // wait till attacks are done etc. delayed
      instruments.forEach((instrument: Instrument) => {
        instrument.releaseAll();
      });
    }, 100);
  }

  _disposeTrack(trackIndex: number) {
    console.log(`Disposing track ${trackIndex}`);
    this.clearPlayingNotes();
    const instruments = this._useSampler ? this.samplers : this.polySynths;
    instruments[trackIndex].unsync();
    instruments[trackIndex].dispose();
    this._effectChains[trackIndex].forEach((chain) => {
      chain.dispose();
    });
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
    this.metronome.triggerAttackRelease("A1", 0.2, `+${this._delay}`);
  }

  getVolume() {
    const instruments = this._useSampler ? this.samplers : this.polySynths;
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
  }

  getSynthSettings(): types.ISynthSettings | null {
    const synthSettings = this.polySynths[0].get();
    const envelope = synthSettings.envelope;
    const oscillator = synthSettings.oscillator;
    return {
      oscillator: {
        type: oscillator.type as types.OscillatorType,
        //@ts-ignore
        partials: oscillator.partials,
        //@ts-ignore
        spread: oscillator.spread,
        //@ts-ignore
        count: oscillator.count,
      },
      envelope: {
        attack: envelope.attack as number,
        decay: envelope.decay as number,
        sustain: envelope.sustain,
        release: envelope.release as number,
      },
      others: {
        detune: synthSettings.detune,
      },
    };
  }

  setSynthSettingsEnvelope(key: keyof types.IEnvelope, value: any) {
    this.polySynths.forEach((polySynth) => {
      polySynth.set({
        envelope: {
          [key]: value,
        },
      });
    });
    const settings = this.polySynths[0].get();
    const envelopeSettings: types.IEnvelope = {
      attack: settings.envelope.attack as number,
      decay: settings.envelope.decay as number,
      sustain: settings.envelope.sustain,
      release: settings.envelope.release as number,
    };
    localStorageUtils.setSynthSettingsEnvelope(envelopeSettings);
  }

  setSynthSettingsOscillator(key: keyof types.IOscillator, value: any) {
    this.polySynths.forEach((polySynth) => {
      polySynth.set({
        oscillator: {
          [key]: value,
        },
      });
    });
    const settings = this.polySynths[0].get();
    const oscillatorSettings: types.IOscillator = {
      //@ts-ignore
      type: settings.oscillator.type,
      //@ts-ignore
      partials: settings.oscillator.partials,
      //@ts-ignore
      count: settings.oscillator.count,
      //@ts-ignore
      spread: settings.oscillator.spread,
    };
    localStorageUtils.setSynthSettingsOscillator(oscillatorSettings);
  }

  setSynthSettingsOther(key: keyof types.IOtherSettings, value: any) {
    this.polySynths.forEach((polySynth) => {
      polySynth.set({
        [key]: value,
      });
    });
    const settings = this.polySynths[0].get();
    const othersSettings: types.IOtherSettings = {
      detune: settings.detune,
    };
    localStorageUtils.setSynthSettingsOthers(othersSettings);
  }

  getSynthName(): types.AvailableSynthsEnum {
    return this.synthName;
  }

  async setSynthName(synthName: types.AvailableSynthsEnum) {
    this.clearPlayingNotes();
    this.synthName = synthName;
    localStorageUtils.setSynthName(synthName);
    for (let i = 0; i < this.polySynths.length; i++) {
      this.polySynths[i].disconnect();
      this.polySynths[i].dispose();
      const trackComponents = await this._buildTrack(
        this._effectChainsNames[0]
      ); // assume 0 for now
      this.polySynths[i] = trackComponents.track as PolySynth;
    }
  }

  getEffectsChain() {
    return this._effectChains;
  }

  /**
   *
   * @param trackIndex
   * @param fxIndex
   * @param key
   * @param value
   * @param publish exists solely for removeFx extraConnections
   */
  async changeExtraConnection(
    trackIndex: number,
    fxIndex: number,
    key: keyof types.IExtraConnection,
    value: number | string | null | boolean,
    publish: boolean = true
  ) {
    value = value === "" ? null : value;
    //@ts-ignore
    this._extraConnections[trackIndex][fxIndex][key] = value;
    if (publish) {
      await this._publishFxChange(trackIndex);
    }
  }

  getExtraConnection(
    trackIndex: number,
    fxIndex: number
  ): types.IExtraConnection {
    return this._extraConnections[trackIndex][fxIndex];
  }

  getDelay(): number {
    return this._delay;
  }

  setDelay(delay: number) {
    this._delay = delay;
    localStorageUtils.setDelay(delay);
  }

  cleanUp() {
    this.clearPlayingNotes();
    this.destroy();
  }
}
