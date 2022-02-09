import { IKeyNoteMap } from "game/types";
import { getLocalStorage, setLocalStorage, deleteLocalStorage } from "./common";

enum LocalStorageKeys {
  keybindings = "keybindings",
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
