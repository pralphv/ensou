import { Event } from "midi-player-js";
import { Transport } from "tone";

import * as types from "./types";
import * as constants from "./constants";

export function generateDataToDraw(
  groupedNotes: types.GroupedNotes[],
  ticksPerBeat: number
): types.DataToDraw {
  const notesToDraw: types.NotesToDraw[] = [];
  const maxTick = Transport.ticks + ticksPerBeat * 5;
  for (let i = 0; i < groupedNotes.length - 1; i++) {
    const note = groupedNotes[i];
    if (note.on < maxTick && note.off >= Transport.ticks) {
      const off: number = (note.off - Transport.ticks) / 3;
      const on: number = (note.on - Transport.ticks) / 3;
      const oneNote: types.NotesToDraw = {
        y: on,
        height: off - on,
        x: constants.PIANO_TUNING[note.noteName],
        id: note.id,
      };
      notesToDraw.push(oneNote);
    }
  }
  const data = { notesToDraw };
  return data;
}
