import {
  Reverb,
  FeedbackDelay,
  Chorus,
  Phaser,
  Gain,
  Filter,
  StereoWidener,
  PingPongDelay,
  PitchShift,
  Distortion,
} from "tone";

import * as types from "types";

const NAME_TO_EFFECT_MAP = {
  Reverb,
  FeedbackDelay,
  Chorus,
  Phaser,
  Gain,
  Filter,
  StereoWidener,
  PingPongDelay,
  PitchShift,
  Distortion,
};

/**
 * source -> gain -> eq -> chorus -> delay -> reverb -> eq
 *                            ----------------->
 */
export function buildEffectsChain(
  effectChainNames: types.AvailableEffectsNames[]
): types.AvailableEffects[] {
  const effectChain = effectChainNames.map(
    //@ts-ignore
    (effectName) => new NAME_TO_EFFECT_MAP[effectName]()
  );
  //@ts-ignore
  return effectChain;
}
