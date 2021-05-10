export interface INoteKeyBinding {
  note: string;
  label: string;
}

export interface IKeyNoteMap {
  [key: string]: INoteKeyBinding;
}

export interface INoteKeyboardLabel {
    [key: string]: string;
}
