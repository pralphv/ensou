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
  downloadingSamples: Function
  // downloading: (status: string) => void
) {
  const cacheKey: string = `${instrument}_${sample}`;
  const cache: types.ArrayBufferMap = await indexedDbUtils.getServerSampler(
    cacheKey
  );
  let arrayBufferMap: types.ArrayBufferMap = {}; // {A1: AudioBuffer}
  if (cache) {
    console.log(`Getting ${cacheKey} from cache`);
    arrayBufferMap = cache;
    downloadingSamples("100%");
  } else {
    console.log(`No cache. Fetching ${cacheKey}...`);
    downloadingSamples("Preparing files...");

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
        downloadingSamples(`${Math.floor((progress / total) * 100)}%`);
      })
    );
    console.log(`Finished downloading ${cacheKey}. Saving...`);
    await indexedDbUtils.setServerSampler(cacheKey, arrayBufferMap);
    console.log(`Saved ${cacheKey}`);
  }
  console.log("Converting to AudioBuffer...");
  downloadingSamples("Applying samples. This may take a while...");
  const sampleMap = convertArrayBufferToAudioContext(arrayBufferMap);
  console.log(`Converted ${cacheKey} to AudioBuffer!`);
  // downloadingSamples("");
  return sampleMap;
}

export async function getSamples(
  instrument: types.Instrument,
  sample: string,
  downloadingSamples: Function
  // downloading: (status: string) => void
): Promise<SamplerOptions["urls"]> {
  const cacheKey: string = `${instrument}_${sample}`;
  if (SAMPLE_CACH[cacheKey]) {
    console.log(`Getting ${cacheKey} from this session`);
    return SAMPLE_CACH[cacheKey];
  }
  console.log(`Downloading ${cacheKey}`);
  const sampleMap = await fetchInstruments(instrument, sample, downloadingSamples);
  // const sampler = new Sampler(sampleMap, {
  //   attack: 0.01,
  // }).toDestination();
  SAMPLE_CACH[cacheKey] = sampleMap;
  return sampleMap;
}
