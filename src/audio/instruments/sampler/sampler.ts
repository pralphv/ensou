import { Sampler, SamplerOptions } from "tone";
import * as types from "types";
import { ISampleEventsMap } from "./types";
import * as indexedDbUtils from "utils/indexedDbUtils/indexedDbUtils";
import { storageRef } from "firebaseApi/firebase";
import { convertArrayBufferToAudioContext } from "utils/helper";
import { samplerLocalStorage } from "utils/localStorageUtils";

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
  localSampleMap?: SamplerOptions["urls"];
  samplerSource: types.SamplerSource | null;

  constructor() {
    this._eventListeners = {};
    this.samplers = [];
    this.instrument = "piano";
    this.sample = samplerLocalStorage.getSampleName() || ""; // should be samples saved in firebase
    this.samplerSource = samplerLocalStorage.getSamplerSource();
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
    // [{"method": ["GET", "POST"], "origin": ["https://ensoumidi.com"]}]
    if (!this.sample) {
      throw Error(
        "this.sample is empty. Please specify before calling this function"
      );
    }
    // const cacheKey: string = `${this.instrument}_${this.sample}`;
    const cacheKey: string = `${this.sample}`;
    const cache: types.ArrayBufferMap = await indexedDbUtils.getSample(
      indexedDbUtils.IndexedDbKeys.online,
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
      await indexedDbUtils.setSample(
        indexedDbUtils.IndexedDbKeys.online,
        cacheKey,
        arrayBufferMap
      );
      console.log(`Saved ${cacheKey}`);
    }
    return arrayBufferMap;
  }

  async getInstrument() {
    let arrayBufferMap;
    switch (this.samplerSource) {
      case types.SamplerSourceEnum.recorded:
        arrayBufferMap = await indexedDbUtils.getSample(
          indexedDbUtils.IndexedDbKeys.recorded,
          "filler"
        );
        break;
      case types.SamplerSourceEnum.local:
        arrayBufferMap = await indexedDbUtils.getSample(
          indexedDbUtils.IndexedDbKeys.local,
          "filler"
        );
        break;
      case types.SamplerSourceEnum.server:
        arrayBufferMap = await this._fetchInstruments();
        break;
      default:
        throw Error(`samplerSource ${this.samplerSource} is not supported`);
    }
    console.log("Converting to AudioBuffer...");
    const sampleMap = await convertArrayBufferToAudioContext(
      arrayBufferMap,
      this._eventListeners.onApplyingSamples
    );
    let sampler = new Sampler(sampleMap, {
      attack: 0.01,
    });
    this._eventListeners.onAppliedSamples?.();
    return sampler;
  }

  async activate() {
    if (this.samplers.length === 0) {
      await this.add();
    } else {
      // there should only be 1 sampler
      this.samplers[0].unsync().disconnect().dispose();
      const sampler = await this.getInstrument();
      this.samplers[0] = sampler;
    }
    this._eventListeners.onActivate?.(this.samplers);
  }

  deactivate() {
    this.samplers.forEach((sampler) => {
      sampler.disconnect();
    });
  }

  _setSamplerSource(source: types.SamplerSource) {
    this.samplerSource = source;
    samplerLocalStorage.setSamplerSource(source);
  }

  async processLocalSample(arrayBufferMap: types.ArrayBufferMap) {
    await indexedDbUtils.setSample(
      indexedDbUtils.IndexedDbKeys.local,
      "filler",
      arrayBufferMap
    );
    this._setSamplerSource(types.SamplerSourceEnum.local);
  }

  async processOnlineSample(value: string) {
    // actual downloading is in getInstrument
    this.sample = value;
    samplerLocalStorage.setSampleName(value);
    this._setSamplerSource(types.SamplerSourceEnum.server);
  }

  async processRecordedSound(note: string, arrayBuffer: ArrayBuffer) {
    const arrayBufferMap = { [note]: arrayBuffer };
    await indexedDbUtils.setSample(
      indexedDbUtils.IndexedDbKeys.recorded,
      "filler",
      arrayBufferMap
    );
    this._setSamplerSource(types.SamplerSourceEnum.recorded);
  }

  saveUserUploadSample(sampleMap: SamplerOptions["urls"]) {
    // this.setLocalSampleMap(sampleMap);
    this._setSamplerSource(types.SamplerSourceEnum.local);
  }

  // async loadLocalSampler(): Promise<SamplerOptions["urls"] | null> {
  //   const cachedSample: types.ArrayBufferMap =
  //     await indexedDbUtils.getLocalSamplerArrayBuffer();
  //   if (cachedSample) {
  //     return await convertArrayBufferToAudioContext(cachedSample);
  //   }
  //   return null;
  // }
}
