import * as constants from "./constants";
import * as types from "types";


export function initSynths(
  n: number,
  synth: types.AvailableSynths,
  options?: any | undefined
): any {
  // ): Synth[] | AMSynth[] | FMSynth[] {
    console.log({synth, options})
  const oscilators = [];
  const synthToUse = constants.SYNTH_MAP[synth];
  if (!options) {
    options = constants.DEFAULT_AUDIO_SETTINGS
  }
  for (let i = 0; i < n; i++) {
    oscilators.push(new synthToUse(options).toDestination());
  }
  return oscilators;
}

//   export function initSynthsEffects(
//     n: number,
//     effects: any // fix this to obj of effects
//   ): Synth[] {
//     const oscilators = [];
//     for (let i = 0; i < n; i++) {
//       const synth = new Synth().connect(effects.reverb);
//       synth.volume.value = -10;
//       oscilators.push(synth);
//     }
//     return oscilators;
//   }
