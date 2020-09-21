export interface MidiPlayerStatus {
  status: string;
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
