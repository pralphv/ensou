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
import instruments from ".";

interface IIntrumentsArgs {
  useSample?: boolean;
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
    this.polySynths = [initSynths("Synth")];
    this.polySynths.forEach((polySynth) => polySynth.toDestination());
    this.releaseAll = this.releaseAll.bind(this);
  }

  scheduleNotesToPlay(notes: Note[]) {
    this._getInstruments().forEach((instrument) => {
      // intrument.unsync(); // NEED THIS TO BE WHEN NEW MIDI IS LOADED
      instrument.sync();
      notes.forEach((note) => {
        instrument.triggerAttackRelease(
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
    Transport.start();
  }

  stop() {
    this.releaseAll();
    Transport.stop();
  }

  pause() {
    this.releaseAll();
    Transport.pause();
  }

  releaseAll() {
    this._getInstruments().forEach((instrument) => instrument.releaseAll());
  }
}
