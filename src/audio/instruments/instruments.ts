import {
  Sampler,
  MembraneSynth,
  SamplerOptions,
  PolySynth,
  context,
  Destination,
  UserMedia,
  now,
  Transport,
} from "tone";
import { Note } from "@tonejs/midi/dist/Note";
import StartAudioContext from "startaudiocontext";
import { initSynths } from "../synths/synths";
import { AvailableSynths } from "types";

interface IIntrumentsArgs {
  useSample?:boolean;
}

export default class Instruments {
  synth: PolySynth;
  _useSampler: boolean;
  samplers: Sampler[];
  polySynths: PolySynth[];

  constructor(args: IIntrumentsArgs) {
    this._useSampler = args.useSample || false;
    this.synth = initSynths("Synth"); // change this Synth to enum
    this.samplers = [];
    this.polySynths = [];
  }

  scheduleNotesToPlay(notes: Note[]) {
    const instruments = this._getInstruments();
    instruments.forEach((intrument) => {
      intrument.unsync(); // remove the old schedule
      intrument.sync();
      notes.forEach((note) => {
        intrument.triggerAttackRelease(
          note.name,
          note.duration,
          note.time,
          note.velocity
        );  
      });  
    });
  }

  _getInstruments() {
    return this._useSampler ? this.samplers : this.polySynths;
  }
  
  play() {
    console.log("PLAY BABY")
    Transport.start();
  }

  stop() {
    Transport.stop();
  }

  pause() {
    Transport.pause();
  }

}
