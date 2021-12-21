import { PolySynth, Destination } from "tone";
import { initSynths } from "./utils";

export default class MyPolySynth {
  polySynths: PolySynth[];

  constructor() {
    this.polySynths = [initSynths("Synth")];
    this.polySynths.forEach((polySynth) => polySynth.toDestination());
  }

  add(){
    const polySynth = initSynths("Synth");
    this.polySynths.push(polySynth);
  }
}
