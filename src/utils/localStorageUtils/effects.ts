import * as types from "types";
import { getLocalStorage, setLocalStorage } from "./common";

enum LocalStorageKeys {
  effectChainsNames = "effectChainsNames",
}

export function getEffectChainNames(): types.AvailableEffectsNames[] | null {
  return getLocalStorage(LocalStorageKeys.effectChainsNames);
}

export function setEffectChainNames(
  effectChainNames: types.AvailableEffectsNames[]
) {
  setLocalStorage(LocalStorageKeys.effectChainsNames, effectChainNames);
}
