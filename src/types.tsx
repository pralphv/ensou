import { SamplerOptions } from "tone";
import { EnvelopeOptions } from "tone";

import * as types from "types";
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
  soundEffect: SoundEffectApi;
  instrumentLoading: boolean;
  playRangeApi: IPlayRangeApi;
  metronomeApi: MetronomeApi;
  loopApi: LoopApi;
  tempoApi: TempoApi;
  instrumentApi: IInstrumentApi;
  sampleApi: ISampleApi;
  samplerSourceApi: ISamplerSource;
  downloadProgress: number;
  audioSettingsApi: IAudioSettingsApi;
}

interface SoundEffectApi {
  getIsSoundEffect: () => boolean;
  setIsSoundEffect: () => void;
  setIsNotSoundEffect: () => void;
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
  getInstrument: () => types.Instrument;
  setInstrument: (instrument: types.Instrument) => void;
}

interface ISampleApi {
  getSample: () => string;
  setSample: (sample: string) => void;
}
interface ISamplerSource {
  getSamplerSource: () => types.SamplerSource;
  setSamplerSource: (source: types.SamplerSource) => void;
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

export interface IAudioSettingsApi {
  getSynthName: () => types.AvailableSynthsEnum;
  setSynthName: (synthName: types.AvailableSynthsEnum) => void;
  getAudioSettings: () => types.IAudioSettings | null;
  setAudioSettings: (settings: types.IAudioSettings) => void;
}

export type AvailableSynths = "Synth" | "AMSynth" | "FMSynth";
export enum AvailableSynthsEnum {
  Synth = "Synth",
  AMSynth = "AMSynth",
  FMSynth = "FMSynth",
}

export interface IAudioSettings {
  oscillator: IOscillatorType;
  envelope: Partial<EnvelopeOptions>;
}

interface IOscillatorType {
  type: OscillatorType;
}

export enum OscillatorType {
  custom = "custom",
  sawtooth = "sawtooth",
  sine = "sine",
  square = "square",
  triangle = "triangle",
}
