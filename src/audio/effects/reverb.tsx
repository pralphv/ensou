import { Reverb } from "tone";
import * as types from "types";

export function initReverb(settings?: types.IReverbSettings) {
  if (!settings) {
  }
  const reverb = new Reverb(settings);
  reverb.decay = 6
  reverb.preDelay = 5
  return reverb;
}

// export function initReverbSettings(): types.IEffect {
//   return {
//     type: types.AvailableEffects.reverb,
//     options: {
//       wet: 1,
//       decay: 4,
//       preDelay: 0,
//     },
//   };
// }
