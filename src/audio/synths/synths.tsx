import { PolySynth } from "tone";

import * as constants from "./constants";
import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";

export function initSynths(
  synth: types.AvailableSynths,
  synthIndex?: number
): PolySynth {
  let options = constants.DEFAULT_AUDIO_SETTINGS;
  options = { ...options, ...options.others };
  const oscillator = localStorageUtils.getSynthSettingsOscillator();
  const envelope = localStorageUtils.getSynthSettingsEnvelope();
  const others = localStorageUtils.getSynthSettingsOthers();
  if (oscillator && synthIndex !== undefined) {
    options.oscillator = oscillator[synthIndex];
  }
  if (envelope && synthIndex !== undefined) {
    options.envelope = envelope[synthIndex];
  }
  if (others && synthIndex !== undefined) {
    // doesnt work
    options = { ...options, ...others[synthIndex] };
  }
  console.log({synth})
  const synthToUse = constants.SYNTH_MAP[synth];
  console.log(synthToUse)
  //@ts-ignore
  const polysynth = new PolySynth(synthToUse, options);
  polysynth.maxPolyphony = 176;
  return polysynth;
}
