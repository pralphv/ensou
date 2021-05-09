interface INoteKeyBinding {
  note: string;
  label: string;
}

interface IKeyNoteMap {
  [key: string]: INoteKeyBinding;
}

export const KEY_NOTE_MAP: IKeyNoteMap = {
  Digit1: { note: "C4", label: "1" },
  Digit2: { note: "C#4", label: "2" },
  Digit3: { note: "D4", label: "3" },
  Digit4: { note: "D#4", label: "4" },
  Digit5: { note: "E4", label: "5" },
  Digit6: { note: "F4", label: "6" },
  Digit7: { note: "F#4", label: "7" },
  Digit8: { note: "G4", label: "8" },
  Digit9: { note: "G#4", label: "9" },
  Digit0: { note: "A4", label: "0" },
  Minus: { note: "A#4", label: "-" },
  Equal: { note: "B4", label: "=" },

  KeyQ: { note: "C5", label: "Q" },
  KeyW: { note: "C#5", label: "W" },
  KeyE: { note: "D5", label: "E" },
  KeyR: { note: "D#5", label: "R" },
  KeyT: { note: "E5", label: "T" },
  KeyY: { note: "F5", label: "Y" },
  KeyU: { note: "F#5", label: "U" },
  KeyI: { note: "G5", label: "I" },
  KeyO: { note: "G#5", label: "O" },
  KeyP: { note: "A5", label: "P" },
  BracketLeft: { note: "A#5", label: "[" },
  BracketRight: { note: "B5", label: "]" },

  KeyA: { note: "C6", label: "A" },
  KeyS: { note: "C#6", label: "S" },
  KeyD: { note: "D6", label: "D" },
  KeyF: { note: "D#6", label: "F" },
  KeyG: { note: "E6", label: "G" },
  KeyH: { note: "F6", label: "H" },
  KeyJ: { note: "F#6", label: "J" },
  KeyK: { note: "G6", label: "K" },
  KeyL: { note: "G#6", label: "L" },
  Semicolon: { note: "A6", label: " ;" },
  Quote: { note: "A#6", label: " '" },
  Enter: { note: "B6", label: "Ent" },

  KeyZ: { note: "C7", label: "Z" },
  KeyX: { note: "C#7", label: "X" },
  KeyC: { note: "D7", label: "C" },
  KeyV: { note: "D#7", label: "V" },
  KeyB: { note: "E7", label: "B" },
  KeyN: { note: "F7", label: "N" },
  KeyM: { note: "F#7", label: "M" },
  Comma: { note: "G7", label: " ," },
  Period: { note: "G#7", label: " ." },
  Slash: { note: "A7", label: " /" },
  // Quote: "A#6",
  // Enter: "B6",
};

export const AVAILABLE_KEYS = new Set(Object.keys(KEY_NOTE_MAP));

interface INoteKeyboardLabel {
  [key: string]: string;
}
export const NOTE_KEYBOARD_LABEL: INoteKeyboardLabel = {};

Object.values(KEY_NOTE_MAP).forEach((obj) => {
  NOTE_KEYBOARD_LABEL[obj.note] = obj.label;
});
