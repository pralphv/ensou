import { PolySynth, Destination } from "tone";
import { initSynth, saveEnvelopeSettings } from "./utils";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";
import * as types from "types";

interface IMyPolySynthEvents {
  [key: string]: Function;
}

export default class MyPolySynth {
  polySynths: PolySynth[];
  synthTypes: types.AvailableSynthsEnum[];
  synthNames: types.AvailableSynthsEnum[];
  eventListeners: IMyPolySynthEvents;

  constructor() {
    this.synthTypes = [];
    this.polySynths = [];
    this.synthNames = [];
    this.eventListeners = {};
    this.loadSavedSettings();
    if (this.polySynths.length === 0) {
      this.add();
      this._connectAll();
    }
  }

  loadSavedSettings() {
    const synthNames = localStorageUtils.getSynthNames();
    if (synthNames) {
      this.synthNames = synthNames;
      synthNames.forEach((synthName, i) => {
        const polySynth = initSynth(synthName, i);
        this.polySynths.push(polySynth);
      });
      this._connectAll();
    }
  }

  add() {
    // all synths start with Synth
    console.log("adding synth");
    const synthName = types.AvailableSynthsEnum.Synth;
    const polySynth = initSynth(synthName);
    this.synthNames.push(synthName);
    this.polySynths.push(polySynth);
  }

  activate() {
    this._connectAll();
  }

  _connectAll() {
    this.polySynths.forEach((polySynth) => polySynth.toDestination());
  }

  deactivate() {
    this.polySynths.forEach((polySynth) => polySynth.disconnect());
  }

  async setSynthSettingsOscillator(
    key: keyof types.IOscillator,
    value: any,
    synthIndex: number
  ) {
    // this.publishingChanges = true;
    const needToRestart = key === "type";
    const polySynth = this.polySynths[synthIndex];
    if (needToRestart) {
      polySynth.unsync();
      _tryRelease(polySynth);
    }

    polySynth.set({
      oscillator: {
        [key]: value,
      },
    });

    this.saveOscilatorSettingsToLocalStorage();
    if (needToRestart) {
      // if switch to new osci, the new osci will inherit the old osci settings
      // causing bugs. so just init a new one
      this.replaceSynth(value, synthIndex);
      this.eventListeners.restart?.();
    }
    // this.publishingChanges = false;
  }

  setSynthSettingsEnvelope(
    key: keyof types.IEnvelope,
    value: any,
    synthIndex: number
  ) {
    this.polySynths[synthIndex].set({
      envelope: {
        [key]: value,
      },
    });
    saveEnvelopeSettings(this.polySynths);
    // need event listener actioned
  }

  disposeTrack(polySynthIndex: number) {
    console.log(`Disposing polySynthIndex ${polySynthIndex}`);
    this.polySynths[polySynthIndex].unsync().disconnect().dispose();
  }

  getOscillatorSettings(): types.IOscillator[] {
    return this.polySynths.map((polySynth) => {
      const synthSetting = polySynth.get();
      const oscillatorSetting: types.IOscillator = {
        //@ts-ignore
        type: synthSetting.oscillator.type,
        //@ts-ignore
        partials: synthSetting.oscillator.partials,
        //@ts-ignore
        count: synthSetting.oscillator.count,
        //@ts-ignore
        spread: synthSetting.oscillator.spread,
        //@ts-ignore
        harmonicity: synthSetting.oscillator.harmonicity,
      };
      return oscillatorSetting;
    });
  }

  saveOscilatorSettingsToLocalStorage() {
    const oscillatorSettings = this.getOscillatorSettings();
    localStorageUtils.setSynthSettingsOscillator(oscillatorSettings);
  }

  getSynthSettings(synthIndex: number): types.ISynthSettings {
    const synthSettings = this.polySynths[synthIndex].get();
    const envelope = synthSettings.envelope;
    const oscillator = synthSettings.oscillator;
    const settings = {
      oscillator: {
        type: oscillator.type as types.OscillatorType,
        //@ts-ignore
        spread: oscillator.spread,
        //@ts-ignore
        count: oscillator.count,
        //@ts-ignore
        harmonicity: oscillator.harmonicity,
      },
      envelope: {
        attack: envelope.attack as number,
        decay: envelope.decay as number,
        sustain: envelope.sustain,
        release: envelope.release as number,
      },
      others: {
        detune: synthSettings.detune,
        volume: synthSettings.volume,
      },
    };
    return settings;
  }

  async setSynthName(synthName: types.AvailableSynthsEnum, synthIndex: number) {
    // this.publishingChanges = true;
    const polySynth = this.polySynths[synthIndex];
    polySynth.unsync();
    _tryRelease(polySynth);
    this._setSynthName(synthIndex, synthName);
    localStorageUtils.setSynthName(this.synthNames);
    this.replaceSynth(synthName, synthIndex);
    this.eventListeners.restart?.();

    // let polySynth = await this._buildTrack(
    //   synthIndex // not here originally
    // );
    // if (this._effectChainsNames.length > 0) {
    //   // const effectsChain = buildEffectsChain(this._effectChainsNames);
    //   polySynth = polySynth.chain(...this._effectChains, Destination);
    // } else {
    //   polySynth = polySynth.toDestination();
    // }
    // this.polySynths[synthIndex] = polySynth as PolySynth;
    // this.publishingChanges = false;
  }

  replaceSynth(synthName: types.AvailableSynthsEnum, synthIndex: number) {
    this.disposeTrack(synthIndex);
    const newSynth = initSynth(synthName, synthIndex);
    newSynth.toDestination();
    this.polySynths[synthIndex] = newSynth;
  }

  getSynthName(synthIndex: number) {
    return this.synthNames[synthIndex];
  }

  _setSynthName(synthIndex: number, synthName: types.AvailableSynthsEnum) {
    this.synthNames[synthIndex] = synthName;
  }

  on(event: string, callback: Function) {
    this.eventListeners[event] = callback;
  }
}

/**
 * This function is to be used while the player is playing
 * AND the polysynth needs to be restarted
 * use case is when user changes the oscilator type
 * @param polySynth synth to be shut down
 * @param retries number of retries already did. for recursion
 */
function _tryRelease(polySynth: PolySynth, retries = 0) {
  if (retries < 50 && polySynth.activeVoices > 0) {
    polySynth.releaseAll();
    setTimeout(() => {
      _tryRelease(polySynth, retries + 1);
    }, 100);
    return;
  }
}
