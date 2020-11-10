import { Synth, AMSynth, FMSynth } from "tone";
import * as types from "types";

export const SYNTH_MAP = {
  Synth: Synth,
  AMSynth: AMSynth,
  FMSynth: FMSynth,
};

export const DEFAULT_AUDIO_SETTINGS: types.ISynthSettings = {
  oscillator: {
    type: types.OscillatorType.triangle,
  },
  envelope: {
    attack: 0.005,
    decay: 0.1,
    sustain: 0.3,
    release: 1,
  },
};
