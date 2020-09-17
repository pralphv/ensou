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
}

interface SoundEffectApi {
  getIsSoundEffect: () => boolean;
  setIsSoundEffect: () => void;
  setIsNotSoundEffect: () => void;
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
