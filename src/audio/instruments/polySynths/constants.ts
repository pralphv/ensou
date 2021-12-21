import { Synth, AMSynth, FMSynth, MembraneSynth } from "tone";
import * as types from "types";

export const SYNTH_MAP = {
  Synth,
  AMSynth,
  FMSynth,
  MembraneSynth,
};

export const DEFAULT_AUDIO_SETTINGS: types.ISynthSettings = {
  oscillator: {
    type: types.OscillatorType.triangle,
    //@ts-ignore
    partials: [0, 0, 0, 0, 0],
    spread: 0,
    count: 0,
    harmonicity: 1,
  },
  envelope: {
    attack: 0.005,
    decay: 0.1,
    sustain: 0.3,
    release: 1,
  },
  others: {
    detune: 0,
    volume: 0,
  },
};
