import { Synth, SynthOptions } from "tone";

import * as constants from "./constants";
import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";

export function initSynths(
  n: number,
  synth: types.AvailableSynths,
): Synth<SynthOptions>[] {
  const options =
    localStorageUtils.getAudioSettings() || constants.DEFAULT_AUDIO_SETTINGS;

  const synths = [];
  const synthToUse = constants.SYNTH_MAP[synth];
  for (let i = 0; i < n; i++) {
    const synth = new synthToUse(options) as Synth<SynthOptions>;
    synths.push(synth);
  }
  return synths;
}

export function initSynthsEffects(
  n: number,
  synth: types.AvailableSynths,
  effects: any // fix this to obj of effects
): any[] {
  const options =
    localStorageUtils.getAudioSettings() || constants.DEFAULT_AUDIO_SETTINGS;
  const synths = [];
  const synthToUse = constants.SYNTH_MAP[synth];
  for (let i = 0; i < n; i++) {
    console.log({ effects });
    const synth = new synthToUse(options).connect(effects);
    synth.volume.value = -10;
    synths.push(synth);
  }
  return synths;
}

export function getSynthSettings(synth: Synth): types.ISynthSettings | null {
  const envelope = synth.envelope;
  return {
    oscillator: {
      type: synth.oscillator.type as types.OscillatorType,
    },
    envelope: {
      attack: envelope.attack,
      decay: envelope.decay,
      sustain: envelope.sustain,
      release: envelope.release,
    },
  };
}

export function setSynthSettings(
  synths: Synth[],
  settings: types.ISynthSettings
) {
  for (let i = 0; i < synths.length; i++) {
    const synth = synths[i];
    synth.oscillator.type = settings.oscillator.type;
    synth.envelope.attack = settings.envelope.attack as number;
    synth.envelope.decay = settings.envelope.decay as number;
    synth.envelope.sustain = settings.envelope.sustain as number;
    synth.envelope.release = settings.envelope.release as number;
    localStorageUtils.setAudioSettings(settings);
  }
}
