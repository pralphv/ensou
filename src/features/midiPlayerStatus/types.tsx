export interface MidiPlayerStatus {
  status: string;
  isLoading: boolean;
  fileName: string;
  isDownloading: boolean;
  downloadProgress: number;
}

export interface loopPoints {
  startTick: number;
  endTick: number;
}
