export interface MidiPlayerStatus {
  status: string;
  isPlaying: boolean;
  metronome: boolean;
  tempo: number;
  loop: boolean;
  playRange: PlayRange;
}

export interface PlayRange {
  startTick: number;
  endTick: number;
}
