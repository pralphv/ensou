export interface MidiPlayerStatus {
  status: string;
  isLoading: boolean;
  fileName: string;
}

export interface PlayRange {
  startTick: number;
  endTick: number;
}
