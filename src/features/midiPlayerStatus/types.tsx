export interface MidiPlayerStatus {
  status: string;
  isLoading: boolean;
  fileName: string;
  isDownloading: boolean;
  downloadProgress: number;
}

export interface PlayRange {
  startTick: number;
  endTick: number;
}
