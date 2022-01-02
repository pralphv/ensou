import * as types from "types";
import { IKeyNoteMap } from "game/types";

enum LocalStorageKeys {
  volume = "volume",
  useSampler = "useSampler",
  samplerSource = "samplerSource",
  sampleName = "sampleName",
  isLoop = "isLoop",
  synthName = "synthName",
  synthSettings = "synthSettings",
  effectChainsNames = "effectChainsNames",
  extraConnections = "extraConnections",
  fxSettings = "fxSettings",
  delay = "delay",
  oscillator = "oscillator",
  envelope = "envelope",
  others = "others",
  keybindings = "keybindings",
  // delay = "delay",
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

export function getSynthSettings(): types.ISynthSettings | null {
  return getLocalStorage(LocalStorageKeys.synthSettings);
}

export function setSynthSettings(synthSettings: types.ISynthSettings) {
  setLocalStorage(LocalStorageKeys.synthSettings, synthSettings);
}

export function getSynthSettingsOscillator(): types.IOscillator[] | null {
  return getLocalStorage(LocalStorageKeys.oscillator);
}

export function setSynthSettingsOscillator(settings: types.IOscillator[]) {
  setLocalStorage(LocalStorageKeys.oscillator, settings);
}
export function getSynthSettingsEnvelope(): types.IEnvelope[] | null {
  return getLocalStorage(LocalStorageKeys.envelope);
}

export function setSynthSettingsEnvelope(settings: types.IEnvelope[]) {
  setLocalStorage(LocalStorageKeys.envelope, settings);
}

export function getSynthSettingsOthers(): types.IOtherSettings[] | null {
  return getLocalStorage(LocalStorageKeys.others);
}

export function setSynthSettingsOthers(settings: types.IOtherSettings[]) {
  setLocalStorage(LocalStorageKeys.others, settings);
}

export function getSynthNames(): types.AvailableSynthsEnum[] | null {
  return getLocalStorage(LocalStorageKeys.synthName);
}

export function setSynthName(synthName: types.AvailableSynthsEnum[]) {
  setLocalStorage(LocalStorageKeys.synthName, synthName);
}

export function getEffectChainNames(): types.AvailableEffectsNames[] | null {
  return getLocalStorage(LocalStorageKeys.effectChainsNames);
}

export function setEffectChainNames(
  effectChainNames: types.AvailableEffectsNames[]
) {
  setLocalStorage(LocalStorageKeys.effectChainsNames, effectChainNames);
}
export function getExtraConnections(): types.IExtraConnection[] | null {
  return getLocalStorage(LocalStorageKeys.extraConnections);
}

export function setExtraConnections(
  extraConnections: types.IExtraConnection[]
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

export function getFxSettings(): IFxSettings | null {
  return getLocalStorage(LocalStorageKeys.fxSettings);
}

export function setFxSettings(fxIndex: number, param: string, value: any) {
  const fxSetting = getFxSettings() || {};
  fxSetting[fxIndex] = { param, value };
  setLocalStorage(LocalStorageKeys.fxSettings, fxSetting);
}

export function deleteFxSettings(fxIndex: number) {
  const fxSetting = getFxSettings();
  if (fxSetting) {
    delete fxSetting[fxIndex];
    setLocalStorage(LocalStorageKeys.fxSettings, fxSetting);
  }
}

export function getDelay(): number[] | null {
  return getLocalStorage(LocalStorageKeys.delay);
}

export function setDelay(delay: number[]) {
  setLocalStorage(LocalStorageKeys.delay, delay);
}

export function getKeyBindings(): IKeyNoteMap | null {
  return getLocalStorage(LocalStorageKeys.keybindings);
}

export function setKeyBindings(rows: IKeyNoteMap) {
  setLocalStorage(LocalStorageKeys.keybindings, rows);
}

export function deleteKeyBindings() {
  deleteLocalStorage(LocalStorageKeys.keybindings);
}

export function getUseSampler(): boolean | null {
  return getLocalStorage(LocalStorageKeys.useSampler);
}

export function setUseSampler(value: boolean) {
  setLocalStorage(LocalStorageKeys.useSampler, value);
}
