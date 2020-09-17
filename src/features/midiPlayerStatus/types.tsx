export interface MidiPlayerStatus {
  status: string;
  instrumentLoading: boolean;
  metronome: boolean;
  tempo: number;
  loop: boolean;
  volume: number;
  playRange: PlayRange;
  isLoading: boolean;
  fileName: string;
}

export interface PlayRange {
  startTick: number;
  endTick: number;
}
