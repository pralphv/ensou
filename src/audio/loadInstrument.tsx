import soundFontPlayer from "soundfont-player";
import { Player } from "soundfont-player";

function getAudioContext(): AudioContext {
  const isAudioContextSupported =
    "AudioContext" in window || "webkitAudioContext" in window;
  if (!isAudioContextSupported) {
    console.error("AudioContext not supported in your environment");
    throw new Error("AudioContext not supported in your environment");
  }
  const audioContext = new AudioContext();
  return audioContext;
}

export async function loadInstruments(): Promise<Player> {
  const audioContext = getAudioContext();
  const instrument = await soundFontPlayer.instrument(audioContext, "acoustic_grand_piano");
  return instrument;
}
