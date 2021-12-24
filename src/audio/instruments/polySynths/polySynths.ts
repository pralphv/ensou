import { PolySynth, Destination } from "tone";
import { initSynths } from "./utils";
import * as types from "types";

export default class MyPolySynth {
  polySynths: PolySynth[];
  synthTypes: types.AvailableSynthsEnum[];

  constructor() {
    this.synthTypes = [];
    this.polySynths = [];
    this.polySynths.forEach((polySynth) => polySynth.toDestination());
  }

  add(){
    // all synths start with Synth
    console.log("adding synth")
    const polySynth = initSynths(types.AvailableSynthsEnum.Synth);
    this.polySynths.push(polySynth);
  }

  activate() {
    if (this.polySynths.length === 0) {
      // starting the class probably
      this.add();
      this._connectAll();
    } else {
      this._connectAll();
    }
  }

  _connectAll() {
    this.polySynths.forEach((polySynth) => polySynth.toDestination());
  }

  deactivate() {
    this.polySynths.forEach(polySynth => polySynth.disconnect())

  }

}
