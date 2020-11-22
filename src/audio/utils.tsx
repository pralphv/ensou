import {
  Reverb,
  FeedbackDelay,
  Chorus,
  Phaser,
  Gain,
  Destination,
  Filter,
} from "tone";

import * as types from "types";

const NAME_TO_EFFECT_MAP = {
  Reverb,
  FeedbackDelay,
  Chorus,
  Phaser,
  Gain,
  Filter,
};

/**
 * source -> gain -> eq -> chorus -> delay -> reverb -> eq
 *                            ----------------->
 */

export function buildTrack(
  source: types.Track,
  effectChainNames: types.AvailableEffectsNames[]
): types.ITrackComponents {
  const effectChain = effectChainNames.map(
    //@ts-ignore
    (effectName) => new NAME_TO_EFFECT_MAP[effectName]()
  ); // must have this object
  const noEffects = effectChainNames.length === 0;
  const chain = noEffects
    ? source.toDestination()
    : source.chain(...effectChain, Destination);
  //@ts-ignore
  return { track: chain, effectChain };
}
