import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Sampler, Reverb } from "tone";
import { storageRef } from "firebaseApi/firebase";
import { set, get } from "idb-keyval";

import * as types from "types";

interface ICachedSounds {
  main: Sampler;
  effect: Sampler;
  effectsSettings: Object;
}

let MAIN_CACHED: ICachedSounds;

function getAudioContext(): AudioContext {
  const isAudioContextSupported =
    "AudioContext" in window || "webkitAudioContext" in window;
  if (!isAudioContextSupported) {
    console.error("AudioContext not supported in your environment");
    throw new Error("AudioContext not supported in your environment");
  }
  const audioContext = new AudioContext();
  return audioContext;
}

interface InstrumentApi {
  triggerAttack: (note: string, velocity: number) => void;
  triggerRelease: (note: string) => void;
  changeVolume: (volume: number) => void;
  getVolumeDb: () => number | undefined;
  triggerMetronome: () => void;
  instrumentLoading: boolean;
}

async function fetchInstruments() {
  const cache: any = await get("sampleArrayBuffer");
  let sampleMap: any = {}; // {A1: AudioBuffer}
  if (cache) {
    console.log("Getting from cache");
    sampleMap = cache;
  } else {
    console.log("No cache. Fetching...");
    const items = await storageRef
      .child("samples/piano-in-162/PedalOffMezzoForte1")
      .listAll();
    await Promise.all(
      items.items.map(async (item) => {
        const note = item.name.slice(0, item.name.length - 4);
        const url: string = await item.getDownloadURL();
        const resp = await fetch(url);
        const file: ArrayBuffer = await resp.arrayBuffer();
        sampleMap[note] = file;
      })
    );
    console.log("Finished downloading. Saving...");
    await set("sampleArrayBuffer", sampleMap);
    console.log("Saved");
  }
  console.log("Converting to AudioBuffer...");
  const keys = Object.keys(sampleMap);
  for (let i = 0; i <= keys.length - 1; i++) {
    const note = keys[i];
    const context = getAudioContext();
    const audio = await context.decodeAudioData(sampleMap[note]);
    sampleMap[note] = audio;
  }
  console.log("Converted to AudioBuffer!");
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

async function getSamples(): Promise<ICachedSounds> {
  if (MAIN_CACHED) {
    return MAIN_CACHED;
  }
  const sampleMap = await fetchInstruments();
  const main = new Sampler(sampleMap, {
    attack: 0.01,
  }).toDestination();
  const reverb = new Reverb({ wet: 1, decay: 4 }).toDestination();
  const effect = new Sampler(sampleMap).connect(reverb);
  const soundObj = { main, effect, effectsSettings: { reverb } };
  MAIN_CACHED = soundObj;
  return soundObj;
}

export function useInstrument(
  getIsSoundEffect: types.IMidiFunctions["soundEffect"]["getIsSoundEffect"]
): InstrumentApi {
  const [instrumentLoading, setInstrmentLoading] = useState<boolean>(false);
  const dispatch = useDispatch();
  const metronome = useRef<Sampler>();
  const sampler = useRef<Sampler>();
  const effects = useRef<Sampler>();
  const effectsSettings = useRef<any>();

  useEffect(() => {
    console.log("Reloading useInstrument");
    async function getSamples_() {
      setInstrmentLoading(true);
      const soundObj = await getSamples();
      sampler.current = soundObj.main;
      effects.current = soundObj.effect;
      effectsSettings.current = soundObj.effectsSettings;
      const metronomeSampler = await fetchMetronome();
      metronome.current = metronomeSampler;
      setInstrmentLoading(false);

    }
    getSamples_();
    return function cleanup() {
      sampler.current = undefined;
      effects.current = undefined;
      metronome.current = undefined;
    };
  }, []);

  function triggerAttack(note: string, velocity: number) {
    sampler.current?.triggerAttack(note, undefined, velocity);
    if (getIsSoundEffect()) {
      effects.current?.triggerAttack(note, undefined, velocity);
    }
  }

  function triggerRelease(note: string) {
    sampler.current?.triggerRelease(note, undefined);
    // effects.current?.triggerRelease(note, undefined);
  }

  function triggerMetronome() {
    metronome.current?.triggerAttackRelease("A1", "64n");
  }

  function changeVolume(volume: number) {
    if (sampler.current) {
      if (volume <= -15) {
        volume = -1000;
      }
      sampler.current.volume.value = volume;
    }
    if (effects.current) {
      effects.current.volume.value = volume;
    }
    if (metronome.current) {
      metronome.current.volume.value = volume;
    }
  }

  function getVolumeDb(): number | undefined {
    return sampler.current?.volume.value;
  }

  const api = {
    triggerAttack,
    triggerRelease,
    changeVolume,
    getVolumeDb,
    triggerMetronome,
    instrumentLoading
  };
  return api;
}
