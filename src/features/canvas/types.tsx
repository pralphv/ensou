export interface MidiData {
  groupedNotes: GroupedNotes[];
  dataToDraw: DataToDraw[];
}

export interface GroupedNotes {
  noteName: string;
  noteNumber: number;
  on: number;
  off: number;
}

export interface NotesToDraw {
  x: number;
  y: number;
  height: number;
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

export interface Canvas{
  isHovering: boolean;
}