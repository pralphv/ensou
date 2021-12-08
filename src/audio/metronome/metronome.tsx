import { MembraneSynth, Transport } from "tone";

export default class Metronome {
  metronomeSynth: MembraneSynth;
  scheduleId: number;
  activated: boolean;

  constructor() {
    this.metronomeSynth = new MembraneSynth().toDestination();
    this.metronomeSynth.volume.value = -10;
    this.scheduleId = 0;
    this.activated = false;
  }

  activate() {
    this.scheduleId = Transport.scheduleRepeat((time) => {
      this.metronomeSynth.triggerAttackRelease("A1", 0.5, time, 2);
    }, "4n");
    this.activated = true;
  }

  deactivate() {
    Transport.clear(this.scheduleId);
    this.activated = false;
  }
}
