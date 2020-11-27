import { Sampler, SamplerOptions, Gain, PolySynth } from "tone";
import { EnvelopeOptions } from "tone";
import { Time, NormalRange } from "tone/Tone/core/type/Units";
import {
  Reverb,
  FeedbackDelay,
  Chorus,
  Phaser,
  Filter,
  StereoWidener,
} from "tone";
import { OmniOscillatorSynthOptions } from "tone/build/esm/source/oscillator/OscillatorInterface";

// import * as types from "types";
export interface IMidiFunctions {
  play: () => void;
  pause: () => void;
  stop: () => void;
  skipToPercent: (percent: number) => void;
  skipToTick: (tick: number) => void;
  restart: () => void;
  getIsPlaying: () => boolean | undefined;
  getCurrentTick: () => number | undefined;
  getTicksPerBeat: () => number | undefined;
  getTotalTicks: () => number | undefined;
  getSongPercentRemaining: () => number | undefined;
  loadArrayBuffer: (blob: XMLHttpRequest["response"]) => void;
  changeVolume: (volume: number) => void;
  getVolumeDb: () => number | undefined;
  instrumentLoading: boolean;
  playRangeApi: IPlayRangeApi;
  metronomeApi: MetronomeApi;
  loopApi: LoopApi;
  tempoApi: TempoApi;
  instrumentApi: IInstrumentApi;
  sampleApi: ISampleApi;
  samplerSourceApi: ISamplerSource;
  downloadProgress: number;
  synthSettingsApi: ISynthSettingsApi;
  trackFxApi: ITrackFxApi;
  delayApi: IDelayApi;
}

interface MetronomeApi {
  getIsMetronome: () => boolean;
  setIsMetronome: () => void;
  setIsNotMetronome: () => void;
}

interface LoopApi {
  getIsLoop: () => boolean;
  setIsLoop: () => void;
  setIsNotLoop: () => void;
}

interface IInstrumentApi {
  getInstrument: () => Instrument;
  setInstrument: (instrument: Instrument) => void;
}

interface ISampleApi {
  getSample: () => string;
  setSample: (sample: string) => void;
}
interface ISamplerSource {
  getSamplerSource: () => SamplerSource;
  setSamplerSource: (source: SamplerSource) => void;
  checkIfSampler: () => boolean;
  getLocalSampler: () => SamplerOptions["urls"] | undefined;
  setLocalSampler: (sampler: SamplerOptions["urls"]) => void;
}

export interface IPlayRangeApi {
  getPlayRange: () => PlayRange;
  setPlayRange: (playRange: PlayRange) => void;
}

export interface TempoApi {
  getTempo: () => number;
  setTempo: (tempo: number, isPercent?: boolean) => void;
  setTempoPercent: (percent: number) => void;
}

export interface IGroupedNotes {
  noteName: string;
  noteNumber: number;
  on: number;
  off: number;
  id: number;
  x: number;
}

export type forceRerender = () => void;

export interface PlayRange {
  startTick: number;
  endTick: number;
}

export type Instrument = "piano" | "kalimba";

export enum SamplerSourceEnum {
  synth = "synth",
  local = "local",
  server = "server",
  cachedLocal = "cachedLocal",
}

export type SamplerSource =
  | SamplerSourceEnum.synth
  | SamplerSourceEnum.local
  | SamplerSourceEnum.server
  | SamplerSourceEnum.cachedLocal;

export interface ArrayBufferMap {
  [key: string]: ArrayBuffer;
}

export interface ISynthSettingsApi {
  getSynthName: () => AvailableSynthsEnum;
  setSynthName: (synthName: AvailableSynthsEnum) => void;
  getSynthSettings: () => ISynthSettings | null;
  setSynthSettings: (settings: ISynthSettings) => void;
}

export interface ITrackFxApi {
  addInstrument: () => void;
  removeInstrument: (i: number) => void;
  getEffectsChain: () => AvailableEffects[][];
  addFx: (trackIndex: number) => void;
  removeFx: (trackIndex: number, fxIndex: number) => void;
  changeFxSettings: (
    trackIndex: number,
    fxIndex: number,
    param: string,
    value: any
  ) => void;
  changeFx: (
    trackIndex: number,
    fxIndex: number,
    type: AvailableEffectsNames
  ) => void;
  getExtraConnection: (trackIndex: number, fxIndex: number) => IExtraConnection;
  changeExtraConnection: (
    trackIndex: number,
    fxIndex: number,
    key: keyof IExtraConnection,
    value: number | string | null | boolean
  ) => void;
  getEffectsActivated: () => boolean;
  toggleEffectsActivated: () => void;
}

export interface IDelayApi {
  getDelay: () => number;
  setDelay: (delay: number) => void;
}

export type AvailableSynths = "Synth" | "AMSynth" | "FMSynth" | "MembraneSynth";
export enum AvailableSynthsEnum {
  Synth = "Synth",
  AMSynth = "AMSynth",
  FMSynth = "FMSynth",
  MembraneSynth = "MembraneSynth",
}

export type oscillator = Partial<OmniOscillatorSynthOptions>;
export type envelope = Partial<EnvelopeOptions>;
export type detune = number;

export interface ISynthSettings {
  oscillator: IOscillator;
  envelope: IEnvelope;
  others: IOtherSettings;
}

/**
 * '["context" | "decay" | "attack" | "sustain" | "release" | "attackCurve" | "releaseCurve" | "decayCurve", any]'.
 */

export interface IEnvelope {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export interface IOtherSettings {
  detune: number;
}
export interface IOscillator {
  type: OscillatorType;
  partials: number[];
  spread: number;
  count: number;
}

export enum OscillatorType {
  sawtooth = "sawtooth",
  sine = "sine",
  square = "square",
  triangle = "triangle",
  fatsawtooth = "fatsawtooth",
  fatsine = "fatsine",
  fatsquare = "fatsquare",
  fattriangle = "fattriangle",
  fmsawtooth = "fmsawtooth",
  fmsine = "fmsine",
  fmsquare = "fmsquare",
  fmtriangle = "fmtriangle",
  amsine = "amsine",
  amsquare = "amsquare",
  amsawtooth = "amsawtooth",
  amtriangle = "amtriangle",
  pulse = "pulse",
  pwm = "pwm",
}

// export enum AvailableEffects {
// reverb = "reverb",
// delay = "delay",
// }

export interface IReverbSettings {
  wet: NormalRange;
  decay: number;
  preDelay: number;
}

export interface IDelaySettings {
  feedback: NormalRange;
  delayTime: Time;
}

export type AvailableEffects =
  | Reverb
  | FeedbackDelay
  | Chorus
  | Phaser
  | Gain
  | Filter
  | StereoWidener;

export enum AvailableEffectsNames {
  reverb = "Reverb",
  delay = "FeedbackDelay",
  chorus = "Chorus",
  phaser = "Phaser",
  gain = "Gain",
  filter = "Filter",
  stereoWidener = "StereoWidener",
}

export type Track = Sampler | PolySynth;

export interface ITrackComponents {
  effectChain: AvailableEffects[];
  track: Track;
}

export type forceLocalRender = (skipWait?: boolean) => void;

export interface IExtraConnection {
  toMaster: boolean;
  effectorIndex: number | null;
}

export interface IHorizontalApi {
  isHorizontal: boolean;
  setIsHorizontal: (isHorizontal: boolean) => void;
}
