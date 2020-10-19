import * as types from "types";

enum LocalStorageKeys {
  isSoundEffect = "isSoundEffect",
  volume = "volume",
  samplerSource = "samplerSource",
  sampleName = "sampleName",
}

function getLocalStorage(key: string): any | null {
  let value: string | null = localStorage.getItem(key);
  value = value ? JSON.parse(value) : null;
  return value;
}
function setLocalStorage(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getIsSoundEffect(): boolean | null {
  return getLocalStorage(LocalStorageKeys.isSoundEffect);
}

export function setIsSoundEffect(bool: boolean) {
  setLocalStorage(LocalStorageKeys.isSoundEffect, bool);
}

export function getVolume(): number | null {
  return getLocalStorage(LocalStorageKeys.volume);
}

export function setVolume(volume: number) {
  setLocalStorage(LocalStorageKeys.volume, volume);
}

export function getSamplerSource(): types.SamplerSource | null {
  return getLocalStorage(LocalStorageKeys.samplerSource);
}

export function setSamplerSource(source: types.SamplerSource) {
  setLocalStorage(LocalStorageKeys.samplerSource, source);
}

export function getSampleName(): string | null {
  return getLocalStorage(LocalStorageKeys.sampleName);
}

export function setSampleName(name: string) {
  setLocalStorage(LocalStorageKeys.sampleName, name);
}
