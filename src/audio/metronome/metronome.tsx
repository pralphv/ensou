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
    if (this.scheduleId !== 0) {
      // bug: canvas could not render if no conditional
      Transport.clear(this.scheduleId); // for clearing past metronome schedule
    }
    this.scheduleId = Transport.scheduleRepeat((time) => {
      this.metronomeSynth.triggerAttackRelease("A1", 0.5, time, 5);
    }, "4n");
    this.activated = true;
  }

  deactivate() {
    Transport.clear(this.scheduleId);
    this.activated = false;
  }
}
