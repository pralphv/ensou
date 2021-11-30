import { Transport, Part } from "tone";
import { Midi } from "@tonejs/midi";
import instruments from "./instruments";

export default class MyMidiPlayer {
  midi: Midi;

  constructor() {
    this.midi = new Midi();
  }

  async loadArrayBuffer(arrayBuffer: ArrayBuffer) {
    this.midi = new Midi(arrayBuffer);
  }

  _loadMidi() {
  }

  _scheduleNotesToPlay() {
  }

  play() {
    Transport.start();
  }

  stop() {
    Transport.stop();
  }
}
