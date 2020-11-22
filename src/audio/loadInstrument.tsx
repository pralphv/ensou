import { useEffect, useRef, useState } from "react";
import {
  Sampler,
  Synth,
  MembraneSynth,
  SamplerOptions,
  SynthOptions,
  Gain,
  PolySynth,
} from "tone";
import { AMSynth, FMSynth } from "tone";

import { PIANO_TUNING } from "./constants";
import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";

import * as synthsApi from "./synths/synths";
import { getSamples } from "./samplers/samplers";
import { initMetronome } from "./metronome/metronome";
import { DEFAULT_AUDIO_SETTINGS } from "./synths/constants";
import { buildTrack } from "./utils";

const CONCURRENT_SYNTHS = 15; // 10 fingers + buffer for long release

type Instrument = Sampler | PolySynth;

interface IInstrumentApi {
  triggerAttack: (note: string, velocity: number) => void;
  triggerRelease: (note: string) => void;
  changeVolume: (volume: number) => void;
  getVolumeDb: () => number | undefined;
  triggerMetronome: () => void;
  instrumentLoading: boolean;
  downloadProgress: number;
  clearPlayingNotes: () => void;
  synthSettingsApi: types.ISynthSettingsApi;
  trackFxApi: types.ITrackFxApi;
  delayApi: types.IDelayApi;
}

interface ISynthOptions {
  synthName: types.AvailableSynthsEnum;
}

interface ISamplerOptions {
  instrument: types.Instrument;
  sample: string;
  sampleMap?: SamplerOptions["urls"];
}

export class Instruments {
  samplers: Sampler[];
  polySynths: PolySynth[];
  synthName: types.AvailableSynthsEnum;
  metronome: MembraneSynth;
  _playingSynths: Set<number>;
  _playingNotes: any;
  _useSampler: boolean;
  // _samplerCache: Sampler;
  _synthOptions: ISynthOptions | undefined;
  _samplerOptions: ISamplerOptions | undefined;
  _effectChains: types.AvailableEffects[][];
  _effectChainsNames: types.AvailableEffectsNames[][];
  _extraConnections: types.IExtraConnection[][];
  setDownloadProgress: (progress: number) => void;
  _effectsActivated: boolean;
  _delay: number;

  constructor(
    useSample: boolean,
    setDownloadProgress: (progress: number) => void,
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
    this.samplers = [];
    this._delay = localStorageUtils.getDelay() || 0.0;

    this.polySynths = [];
    this._playingSynths = new Set();
    this._playingNotes = {};
    this._effectChains = [];
    this._effectChainsNames = localStorageUtils.getEffectChainNames() || [];
    this._extraConnections = localStorageUtils.getExtraConnections() || [];
    this.setDownloadProgress = setDownloadProgress;
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
    this.setSynthSettings = this.setSynthSettings.bind(this);
    this.playMetronome = this.playMetronome.bind(this);
    this._buildTrack = this._buildTrack.bind(this);
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
    // const savedVolume = localStorageUtils.getVolume();
    // if (savedVolume) {
    //   this.changeVolume(savedVolume);
    // }
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
        return buildTrack(sampler, effectsChainName);
      } else {
        throw new Error("CRITICAL: no sample map provided.");
      }
    } else {
      const polySynth = synthsApi.initSynths(CONCURRENT_SYNTHS, this.synthName);
      // savedVolume && this.changeVolume(savedVolume, undefined, [synths]);
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
        this.setDownloadProgress
      );
      return sampler;
    }
  }

  // _triggerAttackSynths(
  //   note: string,
  //   velocity: number,
  //   instrumentIndex: number,
  //   isLastSynth: boolean
  // ) {
  //   for (let i = 0; i <= CONCURRENT_SYNTHS; i++) {
  //     const isFreeSynth = !this._playingSynths.has(i);
  //     const isAlreadyPlaying = this._playingNotes[note] !== undefined;
  //     if (isAlreadyPlaying) {
  //       // notes can be played twice without releasing
  //       this.triggerRelease(note);
  //     }
  //     if (isFreeSynth) {
  //       try {
  //         this.synths[instrumentIndex][i].triggerAttack(
  //           note,
  //           `+${this._delay}`,
  //           velocity
  //         );
  //       } catch (error) {
  //         console.log(
  //           "Expected error: synth not released yet. Skipping to next available synth"
  //         );
  //         /**
  //          * theres a chance where a synth's sustain is so long
  //          * that the synth wont be available even after the next
  //          * note. in this case, skip to the next synth
  //          */
  //         continue;
  //       }
  //       if (isLastSynth) {
  //         this._playingSynths.add(i);
  //         this._playingNotes[note] = i;
  //       }
  //       break;
  //     }
  //   }
  // }

  triggerAttack(note: string, velocity: number) {
    const instruments = this._useSampler ? this.samplers : this.polySynths;
    instruments.forEach((instrument: Instrument) => {
      instrument.triggerAttack(note, `+${this._delay}`, velocity);
    });
    console.log(this.polySynths[0].activeVoices)
  }

  triggerRelease(note: string) {
    const instruments = this._useSampler ? this.samplers : this.polySynths;
    instruments.forEach((instrument: Instrument) => {
      instrument.triggerRelease(note, undefined);
    });
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
    this._publishFxChange(trackIndex);
  }

  async removeFx(trackIndex: number, fxIndex: number) {
    console.log(`Removing FX ${fxIndex} from track ${trackIndex}`);
    for (let i = 0; i < this._extraConnections[trackIndex].length; i++) {
      this.changeExtraConnection(trackIndex, i, "effectorIndex", null, false);
    }

    this._extraConnections[trackIndex].splice(fxIndex, 1);
    this._effectChains[trackIndex].splice(fxIndex, 1);
    this._effectChainsNames[trackIndex].splice(fxIndex, 1);
    this._publishFxChange(trackIndex);
    localStorageUtils.deleteFxSettings(trackIndex, fxIndex);
  }

  async changeFx(
    trackIndex: number,
    fxIndex: number,
    type: types.AvailableEffectsNames
  ) {
    this._effectChainsNames[trackIndex][fxIndex] = type;
    this._publishFxChange(trackIndex);
  }

  async _publishFxChange(trackIndex: number) {
    console.log("Publishing change");
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
    this.saveSettingsToLocalStorage();

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
    if (param === "value") {
      // Gain
      let gainNode = this._effectChains[trackIndex][fxIndex] as Gain;
      gainNode.gain.rampTo(value);
    } else {
      this._effectChains[trackIndex][fxIndex].set({ [param]: value });
    }
    localStorageUtils.setFxSettings(trackIndex, fxIndex, param, value);
  }

  clearPlayingNotes() {
    this._playingNotes = {};
    this._playingSynths = new Set();
    const instruments = this._useSampler ? this.samplers : this.polySynths;
    instruments.forEach((instrument: Instrument) => {
      instrument.releaseAll();
    });
  }

  _disposeTrack(trackIndex: number) {
    console.log(`Disposing track ${trackIndex}`);
    const instruments = this._useSampler ? this.samplers : this.polySynths;
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
    return instruments[0].volume.value;
  }

  changeVolume(volume: number, samplers?: Sampler[], polySynths?: PolySynth[]) {
    if (volume <= -15) {
      volume = -1000;
    }
    if (this._useSampler) {
      const samplers_ = samplers || this.samplers;
      samplers_.forEach((sampler) => {
        sampler.volume.value = volume;
      });
    } else {
      const polySynths_: PolySynth[] = polySynths || this.polySynths;
      polySynths_.forEach((polySynth) => {
        polySynth.volume.value = volume;
      });
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
      },
      envelope: {
        attack: envelope.attack,
        decay: envelope.decay,
        sustain: envelope.sustain,
        release: envelope.release,
      },
      detune: synthSettings.detune
    };
  }

  setSynthSettings(settings: types.ISynthSettings) {
    this.polySynths.forEach((polySynth) => {
      polySynth.set({
        oscillator: { type: settings.oscillator.type },
        envelope: {
          attack: settings.envelope.attack as number,
          decay: settings.envelope.decay as number,
          sustain: settings.envelope.sustain as number,
          release: settings.envelope.release as number,
        },
        detune: settings.detune
      });
    });
    localStorageUtils.setAudioSettings(settings);
  }

  getSynthName(): types.AvailableSynthsEnum {
    return this.synthName;
  }

  setSynthName(synthName: types.AvailableSynthsEnum) {
    this.synthName = synthName;
    localStorageUtils.setSynthName(synthName);
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
  changeExtraConnection(
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
      this._publishFxChange(trackIndex);
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
    console.log("Cleaned Intrument");
  }
}

export function useInstrument(
  getInstrument: types.IMidiFunctions["instrumentApi"]["getInstrument"],
  getSample: types.IMidiFunctions["sampleApi"]["getSample"],
  getSamplerSource: types.IMidiFunctions["samplerSourceApi"]["getSamplerSource"],
  getLocalSampler: types.IMidiFunctions["samplerSourceApi"]["getLocalSampler"]
): IInstrumentApi {
  const [instrumentLoading, setInstrmentLoading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const instrumentsRef = useRef<Instruments>();

  useEffect(() => {
    console.log("Reloading useInstrument");
    async function getSamples_() {
      setInstrmentLoading(true);
      setDownloadProgress(0); // reset
      const source = getSamplerSource();
      if (source === types.SamplerSourceEnum.server) {
        instrumentsRef.current = new Instruments(
          true,
          setDownloadProgress,
          undefined,
          { instrument: getInstrument(), sample: getSample() }
        );
      } else if (
        source === types.SamplerSourceEnum.local ||
        source === types.SamplerSourceEnum.cachedLocal
      ) {
        const sampleMap = getLocalSampler() as SamplerOptions["urls"];
        instrumentsRef.current = new Instruments(
          true,
          setDownloadProgress,
          undefined,
          { instrument: getInstrument(), sample: getSample(), sampleMap }
        );
      } else {
        instrumentsRef.current = new Instruments(false, setDownloadProgress);
      }
      await instrumentsRef.current.init(); // must be here because construct cannot be async
      setInstrmentLoading(false);
    }

    getSamples_();

    return function cleanup() {
      instrumentsRef.current?.destroy();
      instrumentsRef.current?.clearPlayingNotes();
      instrumentsRef.current = undefined;
      console.log("Cleaned Intrument");
    };
  }, [getInstrument, getLocalSampler, getSample, getSamplerSource]);

  function triggerMetronome() {
    instrumentsRef.current?.playMetronome();
  }

  function getSynthName() {
    return instrumentsRef.current?.synthName || types.AvailableSynthsEnum.Synth;
  }

  function setSynthName(synthName: types.AvailableSynthsEnum) {
    instrumentsRef.current?.setSynthName(synthName);
  }

  function triggerAttack(note: string, velocity: number) {
    instrumentsRef.current?.triggerAttack(note, velocity);
  }

  function triggerRelease(note: string) {
    instrumentsRef.current?.triggerRelease(note);
  }

  function changeVolume(volume: number) {
    instrumentsRef.current?.changeVolume(volume);
  }

  function getVolume(): number {
    return instrumentsRef.current?.getVolume() || 0;
  }

  function clearPlayingNotes() {
    instrumentsRef.current?.clearPlayingNotes();
  }

  function getSynthSettings(): types.ISynthSettings {
    return instrumentsRef.current?.getSynthSettings() || DEFAULT_AUDIO_SETTINGS;
  }

  function setSynthSettings(settings: types.ISynthSettings) {
    instrumentsRef.current?.setSynthSettings(settings);
  }

  function addInstrument() {
    instrumentsRef.current?.addInstrument();
  }

  function removeInstrument(i: number) {
    instrumentsRef.current?.removeInstrument(i);
  }

  function getEffectsChain(): types.AvailableEffects[][] {
    return instrumentsRef.current?.getEffectsChain() || [[]];
  }

  function addFx(trackIndex: number) {
    instrumentsRef.current?.addFx(trackIndex);
  }

  function removeFx(trackIndex: number, fxIndex: number) {
    instrumentsRef.current?.removeFx(trackIndex, fxIndex);
  }

  function getDelay(): number {
    return instrumentsRef.current?.getDelay() || 0;
  }

  function setDelay(delay: number) {
    instrumentsRef.current?.setDelay(delay);
  }

  function changeFxSettings(
    trackIndex: number,
    fxIndex: number,
    param: string,
    value: any
  ) {
    instrumentsRef.current?.changeFxSettings(trackIndex, fxIndex, param, value);
  }

  function changeFx(
    trackIndex: number,
    fxIndex: number,
    type: types.AvailableEffectsNames
  ) {
    instrumentsRef.current?.changeFx(trackIndex, fxIndex, type);
  }

  function changeExtraConnection(
    trackIndex: number,
    fxIndex: number,
    key: keyof types.IExtraConnection,
    value: number | boolean | null | string
  ) {
    instrumentsRef.current?.changeExtraConnection(
      trackIndex,
      fxIndex,
      key,
      value
    );
  }

  function getExtraConnection(
    trackIndex: number,
    fxIndex: number
  ): types.IExtraConnection {
    return (
      instrumentsRef.current?.getExtraConnection(trackIndex, fxIndex) || {
        toMaster: false,
        effectorIndex: null,
      }
    );
  }

  function getEffectsActivated(): boolean {
    if (instrumentsRef.current) {
      return instrumentsRef.current.getEffectsActivated();
    } else {
      return true;
    }
  }

  function toggleEffectsActivated() {
    instrumentsRef.current?.toggleEffectsActivated();
  }

  const api = {
    triggerAttack,
    triggerRelease,
    changeVolume,
    getVolumeDb: getVolume,
    triggerMetronome,
    instrumentLoading,
    downloadProgress,
    clearPlayingNotes,
    synthSettingsApi: {
      getSynthName,
      setSynthName,
      getSynthSettings,
      setSynthSettings,
    },
    trackFxApi: {
      addInstrument,
      removeInstrument,
      getEffectsChain,
      addFx,
      removeFx,
      changeFxSettings,
      changeFx,
      changeExtraConnection,
      getExtraConnection,
      getEffectsActivated,
      toggleEffectsActivated,
    },
    delayApi: {
      getDelay,
      setDelay,
    },
  };
  return api;
}
