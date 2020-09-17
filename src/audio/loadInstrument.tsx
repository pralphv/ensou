import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  setInstrumentLoading,
  setInstrumentNotLoading,
} from "features/midiPlayerStatus/midiPlayerStatusSlice";

import { Sampler, Reverb } from "tone";
import { storageRef } from "firebaseApi/firebase";
import { set, get } from "idb-keyval";

import * as types from "types";

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
        console.log(item);
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

export function useInstrument(
  getIsSoundEffect: types.IMidiFunctions["soundEffect"]["getIsSoundEffect"]
): InstrumentApi {
  const dispatch = useDispatch();
  const sampler = useRef<Sampler>();
  const effects = useRef<Sampler>();

  useEffect(() => {
    console.log("Reloading useInstrument");
    async function getSamples() {
      const reverb = new Reverb({ wet: 1, decay: 4 }).toDestination();
      dispatch(setInstrumentLoading());
      const sampleMap = await fetchInstruments();
      sampler.current = new Sampler(sampleMap, {
        attack: 0.01,
        onload: () => {
          console.log("Instrument loaded");
        },
      }).toDestination();
      effects.current = new Sampler(sampleMap, {
        onload: () => {
          console.log("Effects loaded");
          dispatch(setInstrumentNotLoading());
        },
      }).connect(reverb);
    }
    getSamples();
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
  }

  function getVolumeDb(): number | undefined {
    return sampler.current?.volume.value;
  }

  const api = {
    triggerAttack,
    triggerRelease,
    changeVolume,
    getVolumeDb,
  };
  return api;
}
