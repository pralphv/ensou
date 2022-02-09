import * as types from "types";
import * as utils from "./common";

enum LocalStorageKeys {
  samplerSource = "samplerSource",
  sampleName = "sampleName",
  useSampler = "useSampler",
}

export function getSamplerSource(): types.SamplerSource | null {
  return utils.getLocalStorage(LocalStorageKeys.samplerSource);
}

export function setSamplerSource(source: types.SamplerSource) {
  utils.setLocalStorage(LocalStorageKeys.samplerSource, source);
}

export function getSampleName(): string | null {
  // might be useless
  return utils.getLocalStorage(LocalStorageKeys.sampleName);
}

export function setSampleName(name: string) {
  // might be useless
  utils.setLocalStorage(LocalStorageKeys.sampleName, name);
}

export function getUseSampler(): boolean | null {
  return utils.getLocalStorage(LocalStorageKeys.useSampler);
}

export function setUseSampler(value: boolean) {
  utils.setLocalStorage(LocalStorageKeys.useSampler, value);
}
