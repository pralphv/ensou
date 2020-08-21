export interface MidiData {
  groupedNotes: GroupedNotes[];
  dataToDraw: DataToDraw[];
}

export interface GroupedNotes {
  noteName: string;
  noteNumber: number;
  on: number;
  off: number;
  id: number;
  x: number;
}

export interface NotesToDraw {
  x: number;
  y: number;
  height: number;
  id: number;
}

export interface DataToDraw {
  notesToDraw: NotesToDraw[];
  beatsToDraw: number[];
}

export interface Tick {
  tick: number;
}

export interface MidiEvent {
  byteIndex: number;
  data: number;
  delta: number;
  name: string;
  tick: number;
  track: number;
  velocity: number;
  note: string;
  noteName: string;
  noteNumber: number;
}

export interface MidiFunctions {
  play: () => void;
  pause: () => void;
  stop: () => void;
  skipToPercent: (percent: number) => void;
  restart: () => void;
  getCurrentTick: () => number | undefined;
  getTicksPerBeat: () => number | undefined;
  getTotalTicks: () => number | undefined;
  getSongPercentRemaining: () => number | undefined;
  loadArrayBuffer: (blob: XMLHttpRequest["response"]) => void;
}
