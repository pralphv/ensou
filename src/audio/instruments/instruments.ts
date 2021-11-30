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
import StartAudioContext from "startaudiocontext";
import { initSynths } from "../synths/synths";
import { AvailableSynths } from "types";

export default class Instruments {
  synth: PolySynth;
  constructor() {
    this.synth = initSynths("Synth"); // change this Synth to enum
  }
}
