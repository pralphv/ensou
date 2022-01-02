import { Transport } from "tone";
import { Note } from "@tonejs/midi/dist/Note";
import StartAudioContext from "startaudiocontext";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";
import MySampler from "./sampler";
import MyPolySynth from "./polySynths";

// interface IInstrumentsEvents {
//   // [key: string]: Function;
//   onSampleDownloadStart?: types.onSampleDownloadStart,
//   onSampleDownloading?: types.onSampleDownloading,
//   onApplyingSamples?: types.onApplyingSamples
// }

export default class Instruments {
  useSampler: boolean;
  mySampler: MySampler;
  myPolySynth: MyPolySynth;
  // _eventListeners: IInstrumentsEvents;

  constructor() {
    this.myPolySynth = new MyPolySynth();
    this.mySampler = new MySampler();
    this.useSampler = false;
    this.loadSavedSettings();
    // this._eventListeners = {};

    this.releaseAll = this.releaseAll.bind(this);
  }

  async loadSavedSettings() {
    const savedVolume = localStorageUtils.getVolume();
    savedVolume && this.setVolume(savedVolume);
    if (localStorageUtils.getUseSampler()) {
      const cacheLoaded = await this.mySampler.loadLocalSampler();
      if (!cacheLoaded) {
        throw Error("useSampler in localStorage is true but sampler not found")
      }
      await this.activateSampler();
    } else {
      this.activatePolySynth();
    }

  }

  scheduleNotesToPlay(notes: Note[]) {
    this._getInstruments().forEach((instrument) => {
      instrument.sync();
      notes.forEach((note) => {
        instrument.triggerAttackRelease(
          note.name,
          note.duration,
          `${note.ticks}i`,
          note.velocity
        );
      });
    });
  }

  triggerAttackRelease(
    name: string,
    duration: number,
    ticks: number,
    velocity: number
  ) {
    this._getInstruments().forEach((instrument) => {
      instrument.triggerAttackRelease(name, duration, ticks, velocity);
    });
  }

  _getInstruments() {
    return this.useSampler
      ? this.mySampler.samplers
      : this.myPolySynth.polySynths;
  }

  play() {
    Transport.start();
  }

  stop() {
    Transport.stop();
    this.releaseAll();
  }

  pause() {
    Transport.pause();
    this.releaseAll();
  }

  releaseAll(buffer?: number) {
    setTimeout(() => {
      // a buffer to make sure no attacks
      this._getInstruments().forEach((instrument) => instrument.releaseAll());
    }, buffer || 100);
  }

  getVolume() {
    return this._getInstruments()[0].volume.value;
  }

  setVolume(volume: number) {
    if (volume <= -15) {
      volume = -1000;
    }
    this._getInstruments().forEach((instrument) => {
      instrument.volume.value = volume;
    });
    localStorageUtils.setVolume(volume);
  }

  async processRecordedSound(note: string, arrayBuffer: ArrayBuffer) {
    await this.mySampler.processRecordedSound(note, arrayBuffer);
  }

  async activateSampler() {
    this.myPolySynth.deactivate();
    await this.mySampler.activate();
    this.useSampler = true;
    localStorageUtils.setUseSampler(true);
  }

  activatePolySynth() {
    this.mySampler.deactivate();
    this.myPolySynth.activate();
    this.useSampler = false;
    localStorageUtils.setUseSampler(false);
  }

  cancelEvents() {
    Transport.cancel(0);
  }

  /**
   * will load synth settings if synthIndex
   */
  // async _buildTrack(synthIndex?: number): Promise<Sampler | PolySynth> {
  //   if (this._useSampler) {
  //     const sampler = await this.mySampler.getInstrument();
  //     return sampler;
  //   } else {
  //     let polySynth = synthsApi.initSynths(
  //       synthIndex !== undefined
  //         ? this.synthNames[synthIndex]
  //         : types.AvailableSynthsEnum.Synth,
  //       synthIndex
  //     );
  //     return polySynth;
  //   }
  //   const savedVolume = localStorageUtils.getVolume();
  //   savedVolume && this.setVolume(savedVolume);
  // }

  // on<K extends keyof ISampleEventsMap>(event: K, callback: ISampleEventsMap[K]) {
  //   this._eventListeners[event] = callback;
  // }
}
