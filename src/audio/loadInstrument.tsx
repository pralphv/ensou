/**
 * I wish this whole thing was a global variable
 */
import { useEffect, useRef, useState } from "react";
import { Sampler, Reverb, Synth, MembraneSynth, SamplerOptions } from "tone";
import { PIANO_TUNING } from "./constants";
import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";

import { initSynths } from "./synths/synths";
import { initSampler, getSamples } from "./samplers/samplers";

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
  audioSettingsApi: types.IAudioSettingsApi;
}

function initSynthsEffects(
  n: number,
  effects: any // fix this to obj of effects
): Synth[] {
  const oscilators = [];
  for (let i = 0; i < n; i++) {
    const synth = new Synth().connect(effects.reverb);
    synth.volume.value = -10;
    oscilators.push(synth);
  }
  return oscilators;
}

export function useInstrument(
  getIsSoundEffect: types.IMidiFunctions["soundEffect"]["getIsSoundEffect"],
  getInstrument: types.IMidiFunctions["instrumentApi"]["getInstrument"],
  getSample: types.IMidiFunctions["sampleApi"]["getSample"],
  getSamplerSource: types.IMidiFunctions["samplerSourceApi"]["getSamplerSource"],
  getLocalSampler: types.IMidiFunctions["samplerSourceApi"]["getLocalSampler"]
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

  useEffect(() => {
    console.log("Reloading useInstrument");
    async function getSamples_() {
      clearPlayingNotes();
      setInstrmentLoading(true);
      setDownloadProgress(0); // reset
      const reverb = new Reverb({ wet: 1, decay: 4 }).toDestination();
      const source = getSamplerSource();
      if (source === types.SamplerSourceEnum.server) {
        const soundObj = await getSamples(
          getInstrument(),
          getSample(),
          setDownloadProgress,
          { reverb }
        );
        sampler.current = soundObj.main;
        samplerEffects.current = soundObj.effect;
      } else if (
        source === types.SamplerSourceEnum.local ||
        source === types.SamplerSourceEnum.cachedLocal
      ) {
        const sampleMap = getLocalSampler() as SamplerOptions["urls"];
        const soundObj = initSampler(sampleMap, { reverb });
        sampler.current = soundObj.main;
        samplerEffects.current = soundObj.effect;
      } else {
        const audioSettings = localStorageUtils.getAudioSettings();
        synths.current = initSynths(
          CONCURRENT_SYNTHS,
          synthNameRef.current,
          audioSettings
        );
        synthsEffects.current = initSynthsEffects(CONCURRENT_SYNTHS, {
          reverb,
        });
      }
      effectsSettings.current = { reverb };
      const metronomeSynth = new MembraneSynth().toDestination();
      metronomeSynth.volume.value = -5;
      metronome.current = metronomeSynth;
      const cachedVolume = localStorageUtils.getVolume();
      if (cachedVolume) {
        changeVolume(cachedVolume);
      }
      setInstrmentLoading(false);
    }

    getSamples_();

    return function cleanup() {
      clearPlayingNotes();
      Object.values(samplerEffects).forEach((effector) => {
        sampler.current?.disconnect(effector);
        samplerEffects.current?.disconnect(effector);
        synths.current?.forEach((synth) => {
          synth.disconnect(effector);
        });
      });
      sampler.current?.dispose();
      samplerEffects.current?.dispose();
      metronome.current?.dispose();
      synths.current?.forEach((synth) => {
        synth.dispose();
      });
      sampler.current = undefined;
      samplerEffects.current = undefined;
      synths.current = undefined;
      synthsEffects.current = undefined;
      metronome.current = undefined;
      console.log("Cleaned Intrument");
    };
  }, [getSamplerSource(), getSample(), getSynthName()]);

  function triggerAttack(note: string, velocity: number) {
    const source = getSamplerSource();
    if (
      source === types.SamplerSourceEnum.synth &&
      synths.current &&
      synthsEffects.current
    ) {
      for (let i = 0; i <= CONCURRENT_SYNTHS; i++) {
        const isFreeSynth = !PLAYING_SYNTH.has(i);
        const isAlreadyPlaying = PLAYING_NOTES[note] !== undefined;
        if (isAlreadyPlaying) {
          // notes can be played twice without releasing
          triggerRelease(note);
        }
        if (isFreeSynth) {
          PLAYING_SYNTH.add(i);
          PLAYING_NOTES[note] = i;
          synths.current[i].triggerAttack(note, undefined, velocity);
          if (getIsSoundEffect()) {
            synthsEffects.current[i]?.triggerAttack(note, undefined, velocity);
          }
          break;
        }
      }
    } else if (sampler.current && samplerEffects.current) {
      sampler.current?.triggerAttack(note, undefined, velocity);
      if (getIsSoundEffect()) {
        samplerEffects.current?.triggerAttack(note, undefined, velocity);
      }
    }
  }

  function triggerRelease(note: string) {
    const i = PLAYING_NOTES[note];
    const source = getSamplerSource();
    if (
      source === "synth" &&
      synths.current &&
      synthsEffects.current &&
      i !== undefined
    ) {
      // be careful of 0
      synths.current[i].triggerRelease();
      synthsEffects.current[i].triggerRelease();
      PLAYING_SYNTH.delete(i);
      delete PLAYING_NOTES[note];
    } else if (sampler.current && samplerEffects.current) {
      sampler.current?.triggerRelease(note, undefined);
      if (getIsSoundEffect()) {
        // samplerEffects.current?.triggerRelease(note, undefined);
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
    if (
      getSamplerSource() === "synth" &&
      synths.current &&
      synthsEffects.current
    ) {
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

  function getAudioSettings(): types.IAudioSettings | null {
    if (synths.current) {
      const envelope = synths.current[0].envelope;
      return {
        oscillator: {
          type: synths.current[0].oscillator.type as types.OscillatorType,
        },
        envelope: {
          attack: envelope.attack,
          decay: envelope.decay,
          sustain: envelope.sustain,
          release: envelope.release,
        },
      };
    }
    return null;
  }

  function setAudioSettings(settings: types.IAudioSettings) {
    if (synths.current) {
      for (let i = 0; i < synths.current.length; i++) {
        const synth = synths.current[i];
        synth.oscillator.type = settings.oscillator.type;
        synth.envelope.attack = settings.envelope.attack as number;
        synth.envelope.decay = settings.envelope.decay as number;
        synth.envelope.sustain = settings.envelope.sustain as number;
        synth.envelope.release = settings.envelope.release as number;
      }
      localStorageUtils.setAudioSettings(settings);
    }
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
    audioSettingsApi: {
      getSynthName,
      setSynthName,
      getAudioSettings,
      setAudioSettings,
    },
  };
  return api;
}
