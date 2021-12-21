import { Sampler, Destination } from "tone";
import * as types from "types";
import { ISampleEventsMap } from "./types";
import * as indexedDbUtils from "utils/indexedDbUtils/indexedDbUtils";
import { storageRef } from "firebaseApi/firebase";
import { convertArrayBufferToAudioContext } from "utils/helper";

// interface ISamplerOptions {
//   instrument: types.Instrument;
//   sample: string;
//   sampleMap?: SamplerOptions["urls"];
// }

export default class MySampler {
  _eventListeners: ISampleEventsMap;
  samplers: Sampler[];
  instrument: types.Instrument;
  sample: string;
  // sampleMap?: SamplerOptions["urls"];

  constructor() {
    this._eventListeners = {};
    this.samplers = [];
    this.instrument = "piano";
    this.sample = ""; // should be samples saved in firebase
  }

  async add() {
    const sampler = await this.getInstrument();
    this.samplers.push(sampler);
  }

  on<K extends keyof ISampleEventsMap>(
    event: K,
    callback: ISampleEventsMap[K]
  ) {
    this._eventListeners[event] = callback;
  }

  async _fetchInstruments() {
    const cacheKey: string = `${this.instrument}_${this.sample}`;
    const cache: types.ArrayBufferMap = await indexedDbUtils.getServerSampler(
      cacheKey
    );
    let arrayBufferMap: types.ArrayBufferMap = {}; // {A1: AudioBuffer}
    if (cache) {
      console.log(`Getting ${cacheKey} from cache`);
      arrayBufferMap = cache;
      this._eventListeners.onSampleDownloading?.(1);
    } else {
      console.log(`No cache. Fetching ${cacheKey}...`);
      this._eventListeners.onSampleDownloadStart?.();

      const items = await storageRef
        .child(`samples/${this.instrument}/124k/${this.sample}`)
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
          this._eventListeners.onSampleDownloading?.(progress / total);
        })
      );
      console.log(`Finished downloading ${cacheKey}. Saving...`);
      await indexedDbUtils.setServerSampler(cacheKey, arrayBufferMap);
      console.log(`Saved ${cacheKey}`);
    }
    console.log("Converting to AudioBuffer...");
    this._eventListeners.onApplyingSamples?.();
    const sampleMap = convertArrayBufferToAudioContext(arrayBufferMap);
    console.log(`Converted ${cacheKey} to AudioBuffer!`);
    return sampleMap;
  }

  async getInstrument() {
    const sampleMap = await this._fetchInstruments();
      // throw new Error("CRITICAL: no sample map provided.");
    let sampler = new Sampler(sampleMap, {
      attack: 0.01,
    });
    // this._setPlayerStatus("");
    return sampler;
  }
}
