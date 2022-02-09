import { PolySynth, Destination } from "tone";
import { initSynth, saveEnvelopeSettings } from "./utils";
import { synthLocalStorage } from "utils/localStorageUtils";
import * as types from "types";

interface IMyPolySynthEvents {
  [key: string]: Function;
}

export default class MyPolySynth {
  // dont do destination connection here
  // because in instruments.ts, need to connect
  // to either destination, or chain effects
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
    }
  }

  loadSavedSettings() {
    const synthNames = synthLocalStorage.getSynthNames();
    if (synthNames) {
      this.synthNames = synthNames;
      synthNames.forEach((synthName, i) => {
        const polySynth = initSynth(synthName, i);
        this.polySynths.push(polySynth);
      });
    }
  }

  add() {
    // all synths start with Synth
    const synthName = types.AvailableSynthsEnum.Synth;
    const polySynth = initSynth(synthName);
    this.synthNames.push(synthName);
    this.polySynths.push(polySynth);
    this.eventListeners.needsConnection?.(this.polySynths);  // connect with effectors, then destination
    this.saveState();
  }

  saveState() {
    this.saveSynthNames();
    this.saveOscilatorSettingsToLocalStorage();
    this.saveOtherSettingsToLocalStorage();
    saveEnvelopeSettings(this.polySynths);
  }

  saveOtherSettingsToLocalStorage() {
    const otherSettings = this.getOtherSettings();
    synthLocalStorage.setSynthSettingsOthers(otherSettings);
  }

  remove(synthIndex: number) {
    // do not remove if only 1 polysynth left
    if (this.polySynths.length > 1) {
      this.disposeTrack(synthIndex);
      this.synthNames.splice(synthIndex, 1);
      this.polySynths.splice(synthIndex, 1);
      this.saveState();
    }
  }

  activate() {
    this.eventListeners.needsConnection?.(this.polySynths);  // connect with effectors, then destination
    // bug: when sample -> polysynth, synth will triggerattack
    this.polySynths.forEach((polySynth) => polySynth.releaseAll());
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

    this.saveState();
    if (needToRestart) {
      // if switch to new osci, the new osci will inherit the old osci settings
      // causing bugs. so just init a new one
      this.replaceSynth(value, synthIndex);
      this.eventListeners.restart?.();
      this.eventListeners.needsConnection?.(this.polySynths);
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
    this.saveState();
  }

  setSynthSettingsOther(
    key: keyof types.IOtherSettings,
    value: any,
    synthIndex: number
  ) {
    this.polySynths[synthIndex].set({
      [key]: value,
    });
    this.saveState();
  }

  disposeTrack(polySynthIndex: number) {
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

  getOtherSettings(): types.IOtherSettings[] {
    const otherSettings = this.polySynths.map((polySynth) => {
      const settings = polySynth.get();
      const othersSetting: types.IOtherSettings = {
        detune: settings.detune,
        volume: settings.volume,
      };
      return othersSetting;
    });
    return otherSettings;
  }

  saveOscilatorSettingsToLocalStorage() {
    const oscillatorSettings = this.getOscillatorSettings();
    synthLocalStorage.setSynthSettingsOscillator(oscillatorSettings);
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

  saveSynthNames() {
    synthLocalStorage.setSynthName(this.synthNames);
  }

  async setSynthName(synthName: types.AvailableSynthsEnum, synthIndex: number) {
    // this.publishingChanges = true;
    const polySynth = this.polySynths[synthIndex];
    polySynth.unsync();
    _tryRelease(polySynth);
    this._setSynthName(synthIndex, synthName);
    this.replaceSynth(synthName, synthIndex);
    this.eventListeners.restart?.();
    this.eventListeners.needsConnection?.(this.polySynths);
    this.saveState();
  }

  replaceSynth(synthName: types.AvailableSynthsEnum, synthIndex: number) {
    this.disposeTrack(synthIndex);
    const newSynth = initSynth(synthName, synthIndex);
    this.eventListeners.needsConnection?.(this.polySynths);  // connect with effectors, then destination
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
