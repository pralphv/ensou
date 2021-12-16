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
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";
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
    this.loadSavedSettigns();
    this.releaseAll = this.releaseAll.bind(this);
  }

  loadSavedSettigns() {
    const savedVolume = localStorageUtils.getVolume();
    savedVolume && this.setVolume(savedVolume);
  }


  scheduleNotesToPlay(notes: Note[]) {
    this._getInstruments().forEach((instrument) => {
      // instrument.unsync(); // NEED THIS TO BE WHEN NEW MIDI IS LOADED
      instrument.sync();
      notes.forEach((note) => {
        instrument.triggerAttackRelease(
          note.name,
          note.duration,
          `${note.ticks}i`,
          note.velocity
        );
      });
    });
  }

  triggerAttackRelease(
    name: string,
    duration: number,
    ticks: number,
    velocity: number
  ) {
    this._getInstruments().forEach((instrument) => {
      instrument.triggerAttackRelease(name, duration, ticks, velocity);
    });
  }

  _getInstruments() {
    return this._useSampler ? this.samplers : this.polySynths;
  }

  play() {
    Transport.start();
  }

  stop() {
    Transport.stop();
    this.releaseAll();
  }

  pause() {
    Transport.pause();
    this.releaseAll();
  }

  releaseAll(buffer?: number) {
    setTimeout(() => {
      // a buffer to make sure no attacks
      this._getInstruments().forEach((instrument) => instrument.releaseAll());
    }, buffer || 100);
  }

  getVolume() {
    return this._getInstruments()[0].volume.value;
  }

  setVolume(volume: number) {
    if (volume <= -15) {
      volume = -1000;
    }
    this._getInstruments().forEach(instrument => {
      instrument.volume.value = volume;
      
    })
    localStorageUtils.setVolume(volume);
    // if (this.eventListeners.actioned) {
    //   this.eventListeners.actioned();
    // }
  }
}
