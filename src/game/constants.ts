interface IKeyNoteMap {
  [key: string]: string;
}

export const KEY_NOTE_MAP: IKeyNoteMap = {
  Digit1: "C4",
  Digit2: "C#4",
  Digit3: "D4",
  Digit4: "D#4",
  Digit5: "E4",
  Digit6: "F4",
  Digit7: "F#4",
  Digit8: "G4",
  Digit9: "G#4",
  Digit0: "A4",
  Minus: "A#4",
  Equal: "B4",

  KeyQ: "C5",
  KeyW: "C#5",
  KeyE: "D5",
  KeyR: "D#5",
  KeyT: "E5",
  KeyY: "F5",
  KeyU: "F#5",
  KeyI: "G5",
  KeyO: "G#5",
  KeyP: "A5",
  BracketLeft: "A#5",
  BracketRight: "B5",

  KeyA: "C6",
  KeyS: "C#6",
  KeyD: "D6",
  KeyF: "D#6",
  KeyG: "E6",
  KeyH: "F6",
  KeyJ: "F#6",
  KeyK: "G6",
  KeyL: "G#6",
  Semicolon: "A6",
  Quote: "A#6",
  Enter: "B6",

  KeyZ: "C7",
  KeyX: "C#7",
  KeyC: "D7",
  KeyV: "D#7",
  KeyB: "E7",
  KeyN: "F7",
  KeyM: "F#7",
  Comma: "G7",
  Period: "G#7",
  Slash: "A7",
  // Quote: "A#6",
  // Enter: "B6",
};

export const AVAILABLE_KEYS = new Set(Object.keys(KEY_NOTE_MAP));
