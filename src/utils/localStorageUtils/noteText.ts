import * as utils from "./common";

enum LocalStorageKeys {
  noteText = "noteText",
}

export function getNoteText(): boolean {
  return utils.getLocalStorage(LocalStorageKeys.noteText);
}

export function setNoteText(value: boolean) {
  utils.setLocalStorage(LocalStorageKeys.noteText, value);
}
