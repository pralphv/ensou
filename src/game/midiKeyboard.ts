let _MY_MIDI_KEYBOARD: WebMidi.MIDIAccess;

export async function enableMidiKeyboard() {
  if (_MY_MIDI_KEYBOARD) {
    return true;
  }
  if (navigator.requestMIDIAccess) {
    _MY_MIDI_KEYBOARD = await navigator.requestMIDIAccess();
    console.log("Finished loading midi access");
    return true;
  } else {
    console.error("WebMIDI is not supported in this browser.");
    return false;
  }
}

export function onClick(callback: Function) {
  if (!_MY_MIDI_KEYBOARD) {
    throw Error(
      "Either enableMidiKeyboard hasn't been called or this device does not support MIDI devices."
    );
  }
  //@ts-ignore
  for (const input of _MY_MIDI_KEYBOARD.inputs.values()) {
    //@ts-ignore
    input.onmidimessage = callback;
  }
}
