import { PolySynth } from "tone";

import * as constants from "./constants";
import * as types from "types";
import { synthLocalStorage } from "utils/localStorageUtils";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";

/**
 * Starts a new synth. Will use saved settings if synthIndex is given
 * @param synth type of synth. starts if "Synth" if not provided
 * @param synthIndex Loads settings from local storage if given
 * @returns
 */
export function initSynth(
  synth: types.AvailableSynths = "Synth",
  synthIndex?: number
): PolySynth {
  let options = constants.DEFAULT_AUDIO_SETTINGS;
  options = { ...options, ...options.others };
  const oscillator = synthLocalStorage.getSynthSettingsOscillator();
  const envelope = synthLocalStorage.getSynthSettingsEnvelope();
  const others = synthLocalStorage.getSynthSettingsOthers();
  // const synthNames = localStorageUtils.getSynthNames();
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
  const synthToUse = constants.SYNTH_MAP[synth];
  //@ts-ignore
  const polysynth = new PolySynth(synthToUse, options);
  polysynth.maxPolyphony = 176;
  return polysynth;
}

export function saveEnvelopeSettings(polySynths: PolySynth[]) {
  const allSettings = polySynths.map((polySynth) => {
    const settings = polySynth.get();
    const envelopeSettings: types.IEnvelope = {
      attack: settings.envelope.attack as number,
      decay: settings.envelope.decay as number,
      sustain: settings.envelope.sustain,
      release: settings.envelope.release as number,
    };
    return envelopeSettings;
  });
  synthLocalStorage.setSynthSettingsEnvelope(allSettings);
}
