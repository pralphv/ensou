/**
 * source -> effect board -> destination
 * source (duplicate) -> etc reverb wet 100% -> destination
 */
import { initReverb } from "./reverb";
import { initDelay } from "./delay";
import * as types from "types";
export const j = 1
// type I_TYPE_EFFECT_MAP = {
//   [key in types.AvailableEffects]: (params?: any) => any;
// };

// const TYPE_EFFECT_MAP: I_TYPE_EFFECT_MAP = {
//   reverb: initReverb,
//   delay: initDelay,
// };

// type EffectsObj = {
//   [key in types.AvailableEffects]?: any;
// };

// export function initEffectChain(effectChain: types.IEffect[]) {
//   let chain;
//   const effectsObj: EffectsObj = {};
//   for (let i = 0; i < effectChain.length; i++) {
//     const effectObj = effectChain[i];
//     const effectType = effectObj.type;
//     const effectFunction = TYPE_EFFECT_MAP[effectType];
//     const effect = effectFunction(effectObj.options);
//     effectsObj[effectType] = effect;
//     if (!chain) {
//       chain = effect;
//     } else {
//       chain.connect(effect);
//     }
//   }
//   return chain.toDestination();
// }
