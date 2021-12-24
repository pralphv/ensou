import { PolySynth, Destination } from "tone";
import { initSynths } from "./utils";
import * as types from "types";

export default class MyPolySynth {
  polySynths: PolySynth[];
  synthTypes: types.AvailableSynthsEnum[];

  constructor() {
    this.synthTypes = [];
    this.polySynths = [];
    this.polySynths.forEach((polySynth) => polySynth.toDestination());
  }

  add(){
    // all synths start with Synth
    console.log("adding synth")
    const polySynth = initSynths(types.AvailableSynthsEnum.Synth);
    this.polySynths.push(polySynth);
  }

  activate() {
    if (this.polySynths.length === 0) {
      // starting the class probably
      this.add();
      this._connectAll();
    } else {
      this._connectAll();
    }
  }

  _connectAll() {
    this.polySynths.forEach((polySynth) => polySynth.toDestination());
  }

  deactivate() {
    this.polySynths.forEach(polySynth => polySynth.disconnect())
  }

  async setSynthSettingsOscillator(
    key: keyof types.IOscillator,
    value: any,
    synthIndex: number,
    retry: number = 0
  ) {
    this.publishingChanges = true;
    const needToRestart = key === "type";
    if (
      needToRestart &&
      retry < 50 &&
      this.polySynths[synthIndex]?.activeVoices > 0
    ) {
      // release all notes before restarting
      this.polySynths[synthIndex].releaseAll();
      this.polySynths[synthIndex].unsync();
      setTimeout(() => {
        this.setSynthSettingsOscillator(key, value, synthIndex, retry + 1);
      }, 100);
      return;
    }

    this.polySynths[synthIndex].set({
      oscillator: {
        [key]: value,
      },
    });
    const oscillatorSettings = this.polySynths.map((polySynth) => {
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
    localStorageUtils.setSynthSettingsOscillator(oscillatorSettings);
    if (needToRestart) {
      // if switch to new osci, the new osci will inherit the old osci settings
      // causing bugs. so just init a new one
      this._setTrack(polySynth, synthIndex);
    }
    this.publishingChanges = false;
  }


}
