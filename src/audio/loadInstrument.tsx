/**
 * I wish this whole thing was a global variable
 */
import { useEffect, useRef, useState } from "react";
import { Sampler, Reverb, Synth, MembraneSynth, SamplerOptions } from "tone";
import { storageRef } from "firebaseApi/firebase";
import { PIANO_TUNING } from "./constants";
import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";
import * as indexedDbUtils from "utils/indexedDbUtils/indexedDbUtils";
import {
  getAudioContext,
  convertArrayBufferToAudioContext,
} from "utils/helper";

let PLAYING_NOTES: any = {};
let PLAYING_SYNTH: Set<number> = new Set();
const CONCURRENT_SYNTHS = 10; // 10 fingers

interface ICachedSounds {
  main: Sampler;
  effect: Sampler;
}

interface ISampleCache {
  [key: string]: ICachedSounds;
}

let SAMPLE_CACH: ISampleCache = {};

interface IInstrumentApi {
  triggerAttack: (note: string, velocity: number) => void;
  triggerRelease: (note: string) => void;
  changeVolume: (volume: number) => void;
  getVolumeDb: () => number | undefined;
  triggerMetronome: () => void;
  instrumentLoading: boolean;
  downloadProgress: number;
  clearPlayingNotes: () => void;
}

async function fetchInstruments(
  instrument: types.Instrument,
  sample: string,
  setDownloadProgress: (progress: number) => void
) {
  const cacheKey: string = `${instrument}_${sample}`;
  const cache: types.ArrayBufferMap = await indexedDbUtils.getServerSampler(
    cacheKey
  );
  let arrayBufferMap: types.ArrayBufferMap = {}; // {A1: AudioBuffer}
  if (cache) {
    console.log(`Getting ${cacheKey} from cache`);
    arrayBufferMap = cache;
    setDownloadProgress(1);
  } else {
    console.log(`No cache. Fetching ${cacheKey}...`);
    const items = await storageRef
      .child(`samples/${instrument}/124k/${sample}`)
      // .child(`samples/piano-in-162/PedalOffMezzoForte1`)
      .listAll();
    const total: number = items.items.length;
    let progress: number = 0;
    await Promise.all(
      items.items.map(async (item) => {
        const note = item.name.slice(0, item.name.length - 4);
        const url: string = await item.getDownloadURL();
        const resp = await fetch(url);
        const file: ArrayBuffer = await resp.arrayBuffer();
        arrayBufferMap[note] = file;
        progress++;
        setDownloadProgress(progress / total);
      })
    );
    console.log(`Finished downloading ${cacheKey}. Saving...`);
    await indexedDbUtils.setServerSampler(cacheKey, arrayBufferMap);
    console.log(`Saved ${cacheKey}`);
  }
  console.log("Converting to AudioBuffer...");
  const sampleMap = convertArrayBufferToAudioContext(arrayBufferMap);
  console.log(`Converted ${cacheKey} to AudioBuffer!`);
  return sampleMap;
}

function initSampler(
  sampleMap: SamplerOptions["urls"],
  effects: any
): ICachedSounds {
  // fix this
  const main = new Sampler(sampleMap, {
    attack: 0.01,
  }).toDestination();
  const effect = new Sampler(sampleMap).connect(effects.reverb);
  const soundObj = { main, effect };
  return soundObj;
}

async function getSamples(
  instrument: types.Instrument,
  sample: string,
  setDownloadProgress: (progress: number) => void,
  effects: any // fix this to obj of effects
): Promise<ICachedSounds> {
  const cacheKey: string = `${instrument}_${sample}`;
  if (SAMPLE_CACH[cacheKey]) {
    console.log(`Getting ${cacheKey} from this session`);
    return SAMPLE_CACH[cacheKey];
  }
  console.log(`Downloading ${cacheKey}`);
  const sampleMap = await fetchInstruments(
    instrument,
    sample,
    setDownloadProgress
  );
  const soundObj = initSampler(sampleMap, effects);
  SAMPLE_CACH[cacheKey] = soundObj;
  return soundObj;
}

function initSynths(n: number): Synth[] {
  const oscilators = [];
  for (let i = 0; i < n; i++) {
    oscilators.push(new Synth().toDestination());
  }
  return oscilators;
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
        synths.current = initSynths(CONCURRENT_SYNTHS);
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
  }, [getSamplerSource(), getSample()]);

  function triggerAttack(note: string, velocity: number) {
    const source = getSamplerSource();
    if (source === "synth" && synths.current && synthsEffects.current) {
      for (let i = 0; i <= CONCURRENT_SYNTHS; i++) {
        const isFreeSynth = !PLAYING_SYNTH.has(i);
        const isAlreadyPlaying = PLAYING_NOTES[note] !== undefined;
        if (isAlreadyPlaying) {
          // notes can be played twice without releasing
          triggerRelease(note);
        }
        if (isFreeSynth) {
          // console.log("REALLY PLAYING", note)
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

  const api = {
    triggerAttack,
    triggerRelease,
    changeVolume,
    getVolumeDb,
    triggerMetronome,
    instrumentLoading,
    downloadProgress,
    clearPlayingNotes,
  };
  return api;
}
