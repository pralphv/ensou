import * as constants from "./constants";
import * as types from "types";

function defaultSettings() {
  return {
    Synth: {
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 1,
      },
    },
    AMSynth: {
      harmonicity: 3,
      detune: 0,
      oscillator: {
        type: "sine",
      },
      envelope: {
        attack: 0.01,
        decay: 0.01,
        sustain: 1,
        release: 0.5,
      },
      modulation: {
        type: "square",
      },
      modulationEnvelope: {
        attack: 0.5,
        decay: 0,
        sustain: 1,
        release: 0.5,
      },
    },
    FMSynth: {
      harmonicity: 3,
      modulationIndex: 10,
      detune: 0,
      oscillator: {
        type: "sine",
      },
      envelope: {
        attack: 0.01,
        decay: 0.01,
        sustain: 1,
        release: 0.5,
      },
      modulation: {
        type: "square",
      },
      modulationEnvelope: {
        attack: 0.5,
        decay: 0,
        sustain: 1,
        release: 0.5,
      },
    },
  };
}

export function initSynths(
  n: number,
  synth: types.AvailableSynths,
  options?: any | undefined
): any {
  // ): Synth[] | AMSynth[] | FMSynth[] {
  const oscilators = [];
  const synthToUse = constants.SYNTH_MAP[synth];
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
