/**
 * I wish this whole thing was a global variable
 */
import { useEffect, useRef, useState } from "react";
import { Sampler, Reverb, Synth, MembraneSynth } from "tone";
import { PIANO_TUNING } from "../constants";
import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";

import * as synthsApi from "../synths/synths";
import { getSamples } from "../samplers/samplers";

let PLAYING_NOTES: any = {};
let PLAYING_SYNTH: Set<number> = new Set();
const CONCURRENT_SYNTHS = 15; // 10 fingers + buffer

interface IInstrumentApi {
  triggerAttack: (note: string, velocity: number) => void;
  triggerRelease: (note: string) => void;
  changeVolume: (volume: number) => void;
  getVolumeDb: () => number | undefined;
  triggerMetronome: () => void;
  instrumentLoading: boolean;
  downloadProgress: number;
  clearPlayingNotes: () => void;
  synthSettingsApi: types.ISynthSettingsApi;
}

export function useInstrument(
  getInstrument: types.IMidiFunctions["instrumentApi"]["getInstrument"],
  getSample: types.IMidiFunctions["sampleApi"]["getSample"],
  getSamplerSource: types.IMidiFunctions["samplerSourceApi"]["getSamplerSource"],
): IInstrumentApi {
  const [instrumentLoading, setInstrmentLoading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const metronome = useRef<MembraneSynth>();
  const synthNameRef = useRef<types.AvailableSynthsEnum>(
    localStorageUtils.getSynthName() || types.AvailableSynthsEnum.Synth
  );
  const synths = useRef<Synth[]>();
  const sampler = useRef<Sampler>();
  const synthsEffects = useRef<Synth[]>();
  const samplerEffects = useRef<Sampler>();
  const effectsSettings = useRef<any>(); // obj of effects

  function triggerAttack(note: string, velocity: number) {
    const source = getSamplerSource();
    if (sampler.current && samplerEffects.current) {
      sampler.current?.triggerAttack(note, undefined, velocity);
    } else {
      if (synths.current && synthsEffects.current) {
        for (let i = 0; i <= CONCURRENT_SYNTHS; i++) {
          const isFreeSynth = !PLAYING_SYNTH.has(i);
          const isAlreadyPlaying = PLAYING_NOTES[note] !== undefined;
          if (isAlreadyPlaying) {
            // notes can be played twice without releasing
            triggerRelease(note);
          }
          if (isFreeSynth) {
            try {
              synths.current[i].triggerAttack(note, undefined, velocity);
            } catch (error) {
              /**
               * theres a chance where a synth's sustain is so long
               * that the synth wont be available even after the next
               * note. in this case, skip to the next synth
               */
              continue;
            }
            PLAYING_SYNTH.add(i);
            PLAYING_NOTES[note] = i;
            break;
          }
        }
      }
    }
  }

  function triggerRelease(note: string) {
    const i = PLAYING_NOTES[note];
    const source = getSamplerSource();
    if (source === "local" && sampler.current) {
      sampler.current?.triggerRelease(note, undefined);
    } else {
      if (synths.current && synthsEffects.current && i !== undefined) {
        // be careful of 0
        synths.current[i].triggerRelease();
        synthsEffects.current[i].triggerRelease();
        PLAYING_SYNTH.delete(i);
        delete PLAYING_NOTES[note];
      }
    }
  }

  function triggerMetronome() {
    metronome.current?.triggerAttackRelease("A1", 0.2);
  }

  function changeVolume(volume: number) {
    if (volume <= -15) {
      volume = -1000;
    }
    if (sampler.current && samplerEffects.current) {
      sampler.current.volume.value = volume;
      samplerEffects.current.volume.value = volume;
    }
    if (synths.current && synthsEffects.current) {
      for (let i = 0; i < CONCURRENT_SYNTHS; i++) {
        synths.current[i].volume.value = volume;
        synthsEffects.current[i].volume.value = volume;
      }
    }
    if (metronome.current) {
      metronome.current.volume.value = volume - 5;
    }
    localStorageUtils.setVolume(volume);
  }

  function getVolumeDb(): number | undefined {
    if (synths.current) {
      return synths.current[0].volume.value;
    }
    if (sampler.current) {
      return sampler.current.volume.value;
    }
    return undefined;
  }

  function clearPlayingNotes() {
    if (synths.current && synthsEffects.current) {
      for (let i = 0; i < CONCURRENT_SYNTHS; i++) {
        // python style baby
        try {
          synths.current[i].triggerRelease();
          synthsEffects.current[i].triggerRelease();
        } catch (error) {}
      }
      PLAYING_SYNTH = new Set();
      PLAYING_NOTES = {};
    }
    if (sampler.current && samplerEffects.current) {
      Object.keys(PIANO_TUNING).forEach((note) => {
        try {
          sampler.current?.triggerRelease(note);
          samplerEffects.current?.triggerRelease(note);
        } catch (error) {}
      });
    }
  }

  function getSynthName() {
    return synthNameRef.current;
  }

  function setSynthName(synthName: types.AvailableSynthsEnum) {
    synthNameRef.current = synthName;
    localStorageUtils.setSynthName(synthName);
  }


  const api = {
    triggerAttack,
    triggerRelease,
    changeVolume,
    getVolumeDb,
    triggerMetronome,
    instrumentLoading,
    downloadProgress,
    clearPlayingNotes,
    synthSettingsApi: {
      getSynthName,
      setSynthName,
      //@ts-ignore
      getSynthSettings,
      //@ts-ignore
      setSynthSettings,
    },
  };
  return api;
}
