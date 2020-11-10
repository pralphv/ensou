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

const extraConnections = [2, null, null];

export function buildTrack(
  source: types.Track,
  effectChainNames: types.AvailableEffectsNames[]
): types.ITrackComponents {
  const effectChain = effectChainNames.map(
    //@ts-ignore
    (effectName) => new NAME_TO_EFFECT_MAP[effectName]()
  ); // must have this object
  let chain;

  if (effectChainNames.length === 0) {
    if (Array.isArray(source)) {
      chain = source.map((unconnected) => unconnected.toDestination());
      return { track: chain, effectChain };
    } else {
      chain = source.toDestination();
    }
  }
  if (Array.isArray(source)) {
    chain = source.map((synth) => {
      return effectChain.length > 0
        ? synth.chain(...effectChain, Destination)
        : // ? synth.connect(chainComponents.chain).toDestination()
          synth;
    });
  } else {
    chain = source.chain(...effectChain, Destination);
  }
  //@ts-ignore
  return { track: chain, effectChain };
}
