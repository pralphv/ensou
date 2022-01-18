import { getLocalStorage, setLocalStorage } from "./common";

enum LocalStorageKeys {
  fxSettings = "fxSettings",
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
