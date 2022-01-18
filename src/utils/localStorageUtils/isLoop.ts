import { getLocalStorage, setLocalStorage } from "./common";

enum LocalStorageKeys {
  isLoop = "isLoop",
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
