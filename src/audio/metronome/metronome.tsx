import { MembraneSynth } from "tone";

export function initMetronome() {
  const metronomeSynth = new MembraneSynth().toDestination();
  metronomeSynth.volume.value = -10;
  return metronomeSynth;
}
