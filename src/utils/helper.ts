import { SamplerOptions } from "tone";
import * as types from "types";

export function validateEmail(value: string): string | undefined {
  const regExRequirement =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const correct = regExRequirement.test(value);
  let error;
  if (!correct) {
    error = "Invalid email";
  }
  return error;
}

export function getAudioContext(): AudioContext {
  const isAudioContextSupported =
    "AudioContext" in window || "webkitAudioContext" in window;
  if (!isAudioContextSupported) {
    alert("AudioContext not supported in your environment");
    throw new Error("AudioContext not supported in your environment");
  }
  const audioContext = new AudioContext();
  return audioContext;
}

export async function convertArrayBufferToAudioContext(
  arrayBufferMap: types.ArrayBufferMap,
  onProcessing?: (process: number) => void
) {
  const keys = Object.keys(arrayBufferMap);
  const sampleMap: SamplerOptions["urls"] = {};
  const context = getAudioContext();
  const total = keys.length;
  for (let i = 0; i < total; i++) {
    const key = keys[i];
    // @ts-ignore
    const arrayBuffer = arrayBufferMap[key];
    const audio = await context.decodeAudioData(arrayBuffer);
    sampleMap[key] = audio;
    onProcessing?.(i / total);
  }
  return sampleMap;
}

function minTwoDigits(number: number): string {
  return number < 10 ? `0${number}` : `${number}`;
}

export function secTotime(seconds: number): string {
  return `${minTwoDigits(Math.floor(seconds / 60) % 60)}:${minTwoDigits(
    Math.floor(seconds % 60)
  )}`;
}
