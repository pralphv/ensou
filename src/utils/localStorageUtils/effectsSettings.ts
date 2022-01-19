import { getLocalStorage, setLocalStorage } from "./common";

enum LocalStorageKeys {
  fxSettings = "fxSettings",
}

interface IParamSetting {
  [key: string]: string | number;
}

export function getFxSettings(): IParamSetting[] | null {
  return getLocalStorage(LocalStorageKeys.fxSettings);
}

export function setFxSettings(fxIndex: number, param: string, value: any) {
  const fxSettings = getFxSettings() || [];
  if (fxIndex === fxSettings.length) {
    // need to push 1 more
    fxSettings.push({});
  }
  fxSettings[fxIndex][param] = value;
  setLocalStorage(LocalStorageKeys.fxSettings, fxSettings);
}

export function setEmptyFxSettings(fxIndex: number) {
  const fxSettings = getFxSettings() || [];
  if (fxIndex === fxSettings.length) {
    // need to push 1 more
    fxSettings.push({});
  } else {
    fxSettings[fxIndex] = {}
  }
  setLocalStorage(LocalStorageKeys.fxSettings, fxSettings);
}

export function deleteFxSettings(fxIndex: number) {
  const fxSettings = getFxSettings();
  if (fxSettings) {
    fxSettings.splice(fxIndex, 1);
    setLocalStorage(LocalStorageKeys.fxSettings, fxSettings);
  }
}
