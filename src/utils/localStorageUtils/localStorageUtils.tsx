import * as types from "types";

enum LocalStorageKeys {
  volume = "volume",
  samplerSource = "samplerSource",
  sampleName = "sampleName",
  isLoop = "isLoop",
  synthName = "synthName",
  audioSettings = "audioSettings",
  effectChainsNames = "effectChainsNames",
  extraConnections = "extraConnections",
  fxSettings = "fxSettings",
  delay = "delay",
}

function getLocalStorage(key: string): any | null {
  console.log(`Getting ${key} from localStorage`);
  let value: string | null = localStorage.getItem(key);
  value = value ? JSON.parse(value) : null;
  return value;
}

function setLocalStorage(key: string, value: any) {
  value = JSON.stringify(value);
  console.log(`Setting ${key}: ${value} to localStorage`);
  localStorage.setItem(key, value);
}

function deleteLocalStorage(key: string) {
  console.log(`Deleting ${key} from localStorage`);
  localStorage.removeItem(key);
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

export function getIsLoop(): boolean | null {
  return getLocalStorage(LocalStorageKeys.isLoop);
}

export function setIsLoop(bool: boolean) {
  setLocalStorage(LocalStorageKeys.isLoop, bool);
}

export function setIsNotLoop(bool: boolean) {
  setLocalStorage(LocalStorageKeys.isLoop, bool);
}

export function getAudioSettings(): types.ISynthSettings | null {
  return getLocalStorage(LocalStorageKeys.audioSettings);
}

export function setAudioSettings(audioSettings: types.ISynthSettings) {
  setLocalStorage(LocalStorageKeys.audioSettings, audioSettings);
}

export function getSynthName(): types.AvailableSynthsEnum | null {
  return getLocalStorage(LocalStorageKeys.synthName);
}

export function setSynthName(synthName: types.AvailableSynthsEnum) {
  setLocalStorage(LocalStorageKeys.synthName, synthName);
}

export function getEffectChainNames(): types.AvailableEffectsNames[][] | null {
  return getLocalStorage(LocalStorageKeys.effectChainsNames);
}

export function setEffectChainNames(
  effectChainNames: types.AvailableEffectsNames[][]
) {
  setLocalStorage(LocalStorageKeys.effectChainsNames, effectChainNames);
}
export function getExtraConnections(): types.IExtraConnection[][] | null {
  return getLocalStorage(LocalStorageKeys.extraConnections);
}

export function setExtraConnections(
  extraConnections: types.IExtraConnection[][]
) {
  setLocalStorage(LocalStorageKeys.extraConnections, extraConnections);
}

interface IParamSetting {
  param: string;
  value: string | number;
}

interface IFxSettings {
  [key: string]: IParamSetting;
}

export function createFxSettingsKey(
  trackIndex: number,
  fxIndex: number
): string {
  return `${trackIndex}_${fxIndex}`;
}

export function getFxSettings(): IFxSettings | null {
  return getLocalStorage(LocalStorageKeys.fxSettings);
}

export function setFxSettings(
  trackIndex: number,
  fxIndex: number,
  param: string,
  value: any
) {
  const fxSetting = getFxSettings() || {};
  fxSetting[createFxSettingsKey(trackIndex, fxIndex)] = { param, value };
  setLocalStorage(LocalStorageKeys.fxSettings, fxSetting);
}

export function deleteFxSettings(trackIndex: number, fxIndex: number) {
  const fxSetting = getFxSettings();
  if (fxSetting) {
    const key = createFxSettingsKey(trackIndex, fxIndex);
    delete fxSetting[key];
    setLocalStorage(LocalStorageKeys.fxSettings, fxSetting);
  }
}

export function getDelay(): number | null {
  return getLocalStorage(LocalStorageKeys.delay);
}

export function setDelay(delay: number) {
  setLocalStorage(LocalStorageKeys.delay, delay);
}
