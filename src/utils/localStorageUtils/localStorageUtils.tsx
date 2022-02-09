import * as types from "types";
import { IKeyNoteMap } from "game/types";

enum LocalStorageKeys {
  synthName = "synthName",
  synthSettings = "synthSettings",
  extraConnections = "extraConnections",
  fxSettings = "fxSettings",
  delay = "delay",
  oscillator = "oscillator",
  envelope = "envelope",
  others = "others",
  // delay = "delay",
}

// export function getExtraConnections(): types.IExtraConnection[] | null {
//   return getLocalStorage(LocalStorageKeys.extraConnections);
// }

// export function setExtraConnections(
//   extraConnections: types.IExtraConnection[]
// ) {
//   setLocalStorage(LocalStorageKeys.extraConnections, extraConnections);
// }

// export function getDelay(): number[] | null {
//   return getLocalStorage(LocalStorageKeys.delay);
// }

// export function setDelay(delay: number[]) {
//   setLocalStorage(LocalStorageKeys.delay, delay);
// }
