import * as types from "types";
import * as indexedDbUtils from "utils/indexedDbUtils/indexedDbUtils";
import { storageRef } from "firebaseApi/firebase";
import { convertArrayBufferToAudioContext } from "utils/helper";
import { ISampleCache } from "../../types";
import { onSampleDownloadStartType, onSampleDownloadingType, onApplyingSamplesType} from "./types";

// let SAMPLE_CACH: ISampleCache = {};

/**
 * This function fetches from firebase, then saves to local indexDb as cache.
 */
export async function fetchInstruments(
  instrument: types.Instrument,
  sample: string,
  onSampleDownloadStart: onSampleDownloadStartType,
  onSampleDownloading: onSampleDownloadingType,
  onApplyingSamples: onApplyingSamplesType
) {
  const cacheKey: string = `${instrument}_${sample}`;
  const cache: types.ArrayBufferMap = await indexedDbUtils.getServerSampler(
    cacheKey
  );
  let arrayBufferMap: types.ArrayBufferMap = {}; // {A1: AudioBuffer}
  if (cache) {
    console.log(`Getting ${cacheKey} from cache`);
    arrayBufferMap = cache;
    onSampleDownloading(1);
  } else {
    console.log(`No cache. Fetching ${cacheKey}...`);
    onSampleDownloadStart();

    const items = await storageRef
      .child(`samples/${instrument}/124k/${sample}`)
      // .child(`samples/piano-in-162/PedalOffMezzoForte1`)
      .listAll();
    const total: number = items.items.length;
    let progress: number = 0;
    // need error handling
    await Promise.all(
      items.items.map(async (item) => {
        const note = item.name.slice(0, item.name.length - 4);
        const url: string = await item.getDownloadURL();
        const resp = await fetch(url);
        const file: ArrayBuffer = await resp.arrayBuffer();
        arrayBufferMap[note] = file;
        progress++;
        onSampleDownloading(progress / total);
      })
    );
    console.log(`Finished downloading ${cacheKey}. Saving...`);
    await indexedDbUtils.setServerSampler(cacheKey, arrayBufferMap);
    console.log(`Saved ${cacheKey}`);
  }
  console.log("Converting to AudioBuffer...");
  onApplyingSamples();
  const sampleMap = convertArrayBufferToAudioContext(arrayBufferMap);
  console.log(`Converted ${cacheKey} to AudioBuffer!`);
  return sampleMap;
}

// TODO: find out what this function does. seems the same as the top one. just with local cache vs indexdb
// export async function getSamples(
//     instrument: types.Instrument,
//     sample: string,
//     downloadingSamples: Function
//     // downloading: (status: string) => void
//   ): Promise<SamplerOptions["urls"]> {
//     const cacheKey: string = `${instrument}_${sample}`;
//     if (SAMPLE_CACH[cacheKey]) {
//       console.log(`Getting ${cacheKey} from this session`);
//       return SAMPLE_CACH[cacheKey];
//     }
//     console.log(`Downloading ${cacheKey}`);
//     const sampleMap = await fetchInstruments(instrument, sample, downloadingSamples);
//     // const sampler = new Sampler(sampleMap, {
//     //   attack: 0.01,
//     // }).toDestination();
//     SAMPLE_CACH[cacheKey] = sampleMap;
//     return sampleMap;
//   }
