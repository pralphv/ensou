import { Synth, PolySynth } from "tone";

import * as constants from "./constants";
import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";

export function initSynths(
  n: number,
  synth: types.AvailableSynths,
): PolySynth {
  const options =
    localStorageUtils.getAudioSettings() || constants.DEFAULT_AUDIO_SETTINGS;
  const synthToUse = constants.SYNTH_MAP[synth];
  //@ts-ignore
  return synth = new PolySynth(synthToUse, options);
}

