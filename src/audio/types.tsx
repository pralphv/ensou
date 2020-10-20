import { Sampler } from "tone";

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

export interface ICachedSounds {
  main: Sampler;
  effect: Sampler;
}

export interface ISampleCache {
  [key: string]: ICachedSounds;
}
