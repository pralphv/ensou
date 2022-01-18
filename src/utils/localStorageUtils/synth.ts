import * as types from "types";
import { getLocalStorage, setLocalStorage } from "./common";

enum LocalStorageKeys {
  synthName = "synthName",
  synthSettings = "synthSettings",
  oscillator = "oscillator",
  envelope = "envelope",
  others = "others",
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
