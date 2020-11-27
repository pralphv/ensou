import { PolySynth } from "tone";

import * as constants from "./constants";
import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";

export function initSynths(synth: types.AvailableSynths): PolySynth {
  let options = constants.DEFAULT_AUDIO_SETTINGS;
  options = { ...options, ...options.others };
  const oscillator = localStorageUtils.getSynthSettingsOscillator();
  const envelope = localStorageUtils.getSynthSettingsEnvelope();
  const others = localStorageUtils.getSynthSettingsOthers();
  if (oscillator) {
    options.oscillator = oscillator;
  }
  if (envelope) {
    options.envelope = envelope;
  }
  if (others) {
    options = { ...options, ...others };
  }

  const synthToUse = constants.SYNTH_MAP[synth];
  //@ts-ignore
  const polysynth = new PolySynth(synthToUse, options);
  polysynth.maxPolyphony = 176;
  return polysynth;
}
