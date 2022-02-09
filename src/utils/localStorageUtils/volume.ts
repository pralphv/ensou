import { getLocalStorage, setLocalStorage } from "./common";

enum LocalStorageKeys {
  volume = "volume",
}

export function getVolume(): number | null {
  return getLocalStorage(LocalStorageKeys.volume);
}

export function setVolume(volume: number) {
  setLocalStorage(LocalStorageKeys.volume, volume);
}
