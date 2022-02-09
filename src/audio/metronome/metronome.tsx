import { MembraneSynth, Transport } from "tone";
import {
  volumeLocalStorage,
} from "utils/localStorageUtils";

export default class Metronome {
  metronomeSynth: MembraneSynth;
  scheduleId: number;
  activated: boolean;

  constructor() {
    this.metronomeSynth = new MembraneSynth().toDestination();
    const savedVolume = volumeLocalStorage.getVolume();
    savedVolume && this.setVolume(savedVolume - 20);
    this.scheduleId = 0;
    this.activated = false;
  }

  activate() {
    if (this.scheduleId !== 0) {
      // 0 means no previous schedules
      Transport.clear(this.scheduleId);
    }
    this.scheduleId = Transport.scheduleRepeat(
      (time) => {
        this.metronomeSynth.triggerAttackRelease("A1", 0.5, time, 5);
      },
      "4n",
      0
    );
    this.activated = true;
  }

  deactivate() {
    Transport.clear(this.scheduleId);
    this.activated = false;
  }

  setVolume(value: number) {
    this.metronomeSynth.volume.value = value - 20;
  }
}
