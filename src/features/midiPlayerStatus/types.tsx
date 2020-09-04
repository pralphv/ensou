export interface MidiPlayerStatus {
  status: string;
  isPlaying: boolean;
  instrumentLoading: boolean;
  metronome: boolean;
  tempo: number;
  loop: boolean;
  volume: number;
  playRange: PlayRange;
}

export interface PlayRange {
  startTick: number;
  endTick: number;
}
