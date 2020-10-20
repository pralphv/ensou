import * as types from "types";
import * as indexedDbUtils from "utils/indexedDbUtils/indexedDbUtils";
import { storageRef } from "firebaseApi/firebase";
import { convertArrayBufferToAudioContext } from "utils/helper";
import { ICachedSounds, ISampleCache } from "../types";
import { Sampler, SamplerOptions } from "tone";

let SAMPLE_CACH: ISampleCache = {};

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

export function initSampler(
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

export async function getSamples(
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
