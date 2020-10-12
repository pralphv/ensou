import * as types from "types";
// export type getIsPlaying = () => boolean | undefined;
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
  isUseSamplerApi: IIsUseSamplerApi;
  downloadProgress: number;
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
interface IIsUseSamplerApi {
  getIsUseSampler: () => boolean;
  setIsUseSampler: () => void;
  setIsNotUseSampler: () => void;
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
