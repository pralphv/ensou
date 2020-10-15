import { useEffect, useRef, useState } from "react";
import { Sampler, Reverb, Synth, MembraneSynth } from "tone";
import { storageRef } from "firebaseApi/firebase";
import { set, get } from "idb-keyval";
import { PIANO_TUNING } from "./constants";
import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";

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

function getAudioContext(): AudioContext {
  const isAudioContextSupported =
    "AudioContext" in window || "webkitAudioContext" in window;
  if (!isAudioContextSupported) {
    alert("AudioContext not supported in your environment");
    throw new Error("AudioContext not supported in your environment");
  }
  const audioContext = new AudioContext();
  return audioContext;
}

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
  const cacheKey: string = `${instrument}_${sample}qweqweqwe`;
  const cache: any = await get(cacheKey);
  let sampleMap: any = {}; // {A1: AudioBuffer}
  if (cache) {
    console.log(`Getting ${cacheKey} from cache`);
    sampleMap = cache;
    setDownloadProgress(1);
  } else {
    console.log(`No cache. Fetching ${cacheKey}...`);
    const items = await storageRef
      .child(`samples/misc/gura`)
      // .child(`samples/${instrument}/124k/${sample}`)
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
        sampleMap[note] = file;
        progress++;
        setDownloadProgress(progress / total);
      })
    );
    console.log(`Finished downloading ${cacheKey}. Saving...`);
    await set(cacheKey, sampleMap);
    console.log(`Saved ${cacheKey}`);
  }
  console.log("Converting to AudioBuffer...");
  const keys = Object.keys(sampleMap);
  for (let i = 0; i <= keys.length - 1; i++) {
    const note = keys[i];
    const context = getAudioContext();
    const audio = await context.decodeAudioData(sampleMap[note]);
    sampleMap[note] = audio;
  }
  console.log(`Converted ${cacheKey} to AudioBuffer!`);
  return sampleMap;
}

async function fetchMetronome(): Promise<Sampler> {
  const cache: any = await get("metronome");
  let metronome: ArrayBuffer;
  if (cache) {
    console.log("Getting metronome from cache");
    metronome = cache;
  } else {
    console.log("No cache. Fetching metronome...");
    const item = await storageRef.child("samples/metronome/metronome.mp3");
    const url: string = await item.getDownloadURL();
    const resp = await fetch(url);
    metronome = await resp.arrayBuffer();

    console.log("Finished downloading metronome. Saving...");
    await set("metronome", metronome);
    console.log("Saved");
  }
  console.log("Converting metronome to AudioBuffer...");
  const context = getAudioContext();
  // const audio = await context.decodeAudioData(metronome);
  const audio = await context.decodeAudioData(metronome);
  console.log("Converted metronome to AudioBuffer!");
  const metronomeSampler = new Sampler(
    { A1: audio },
    {
      attack: 0.01,
    }
  ).toDestination();

  return metronomeSampler;
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
  const sampleMap = await fetchInstruments(
    instrument,
    sample,
    setDownloadProgress
  );
  const main = new Sampler(sampleMap, {
    attack: 0.01,
  }).toDestination();
  const effect = new Sampler(sampleMap).connect(effects.reverb);
  const soundObj = { main, effect };
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
  getIsUseSampler: types.IMidiFunctions["isUseSamplerApi"]["getIsUseSampler"]
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
      if (getIsUseSampler()) {
        const soundObj = await getSamples(
          getInstrument(),
          getSample(),
          setDownloadProgress,
          { reverb }
        );
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
      sampler.current = undefined;
      samplerEffects.current = undefined;
      synths.current = undefined;
      synthsEffects.current = undefined;
      metronome.current = undefined;
      console.log("Cleaned Intrument");
    };
  }, [getIsUseSampler()]);

  function triggerAttack(note: string, velocity: number) {
    if (!getIsUseSampler() && synths.current && synthsEffects.current) {
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
    } else if (getIsUseSampler() && sampler.current && samplerEffects.current) {
      sampler.current?.triggerAttack(note, undefined, velocity);
      if (getIsSoundEffect()) {
        samplerEffects.current?.triggerAttack(note, undefined, velocity);
      }
    }
  }

  function triggerRelease(note: string) {
    const i = PLAYING_NOTES[note];
    if (
      !getIsUseSampler() &&
      synths.current &&
      synthsEffects.current &&
      i !== undefined
    ) {
      // be careful of 0
      synths.current[i].triggerRelease();
      synthsEffects.current[i].triggerRelease();
      PLAYING_SYNTH.delete(i);
      delete PLAYING_NOTES[note];
    } else if (getIsUseSampler() && sampler.current && samplerEffects.current) {
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
    if (!getIsUseSampler() && synths.current && synthsEffects.current) {
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
    if (getIsUseSampler() && sampler.current && samplerEffects.current) {
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
