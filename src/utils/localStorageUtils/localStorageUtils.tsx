enum LocalStorageKeys {
  isSoundEffect = "isSoundEffect",
  volume = "volume",
  isUseSample = "isUseSample",
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

export function getIsUseSample(): boolean | null {
  return getLocalStorage(LocalStorageKeys.isUseSample);
}

export function setIsUseSample(bool: boolean) {
  setLocalStorage(LocalStorageKeys.isUseSample, bool);
}
