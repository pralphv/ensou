import { Sampler, Destination, SamplerOptions } from "tone";
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
    this.sample = ""; // should be samples saved in firebase
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
    let sampleMap;
    switch (this.samplerSource) {
      case types.SamplerSourceEnum.recorded:
        sampleMap = this.localSampleMap;
        break;
      case types.SamplerSourceEnum.local:
        sampleMap = this.localSampleMap;
        break;
      case types.SamplerSourceEnum.server:
        sampleMap = await this._fetchInstruments();
    }
    let sampler = new Sampler(sampleMap, {
      attack: 0.01,
    });
    // this._setPlayerStatus("");
    return sampler;
  }

  async activate() {
    if (this.samplers.length === 0) {
      await this.add();
    }
    this._eventListeners.onActivate?.(this.samplers);
  }

  deactivate() {
    this.samplers.forEach((sampler) => {sampler.disconnect()});
  }

  _setSamplerSource(source: types.SamplerSource) {
    this.samplerSource = source;
    samplerLocalStorage.setSamplerSource(source);
  }

  async processLocalSample(arrayBufferMap: types.ArrayBufferMap) {
    await this.processArrayBufferMap(arrayBufferMap);
    this._setSamplerSource(types.SamplerSourceEnum.local);
  }

  async processDownloadedSample() {
    this._setSamplerSource(types.SamplerSourceEnum.server);
  }

  async processRecordedSound(note: string, arrayBuffer: ArrayBuffer) {
    const arrayBufferMap = { [note]: arrayBuffer };
    await this.processArrayBufferMap(arrayBufferMap);
    this._setSamplerSource(types.SamplerSourceEnum.recorded);
  }

  async processArrayBufferMap(arrayBufferMap: types.ArrayBufferMap) {
    await indexedDbUtils.setLocalSamplerArrayBuffer(arrayBufferMap);
    const sampleMap: SamplerOptions["urls"] =
      await convertArrayBufferToAudioContext(arrayBufferMap);
    this.setLocalSampleMap(sampleMap);
  }

  setLocalSampleMap(sampleMap: SamplerOptions["urls"]) {
    this.localSampleMap = sampleMap;
  }

  saveUserUploadSample(sampleMap: SamplerOptions["urls"]) {
    this.setLocalSampleMap(sampleMap);
    this._setSamplerSource(types.SamplerSourceEnum.local);
  }

  async loadLocalSampler() {
    const cachedSample: types.ArrayBufferMap =
      await indexedDbUtils.getLocalSamplerArrayBuffer();
    if (cachedSample) {
      await this.processArrayBufferMap(cachedSample);
      return true;
    }
    return false;
  }
}
