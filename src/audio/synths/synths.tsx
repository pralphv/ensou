import { PolySynth } from "tone";

import * as constants from "./constants";
import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";

export function initSynths(synth: types.AvailableSynths): PolySynth {
  const options =
    localStorageUtils.getAudioSettings() || constants.DEFAULT_AUDIO_SETTINGS;
  //@ts-ignore
  const synthToUse = constants.SYNTH_MAP[synth];
  //@ts-ignore
  const polysynth = new PolySynth(synthToUse, options);
  polysynth.maxPolyphony = 88;
  return polysynth;
}
