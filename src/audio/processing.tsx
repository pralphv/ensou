import { Event } from "midi-player-js";

import * as types from "./types";
import * as constants from "./constants";

function searchNoteOff(events: any, targetNote: number): types.MidiEvent {
  for (let i = 0; i < events.length; i++) {
    const isNoteOff = events[i].velocity === 0 || events[i].name === "Note off";
    const isTargetNote = events[i].noteNumber === targetNote;
    if (isNoteOff && isTargetNote) {
      return events[i];
    }
  }
  return events[0];
}

export function groupNotes(allEvents: Event[]): types.GroupedNotes[] {
  const groupedNotes: types.GroupedNotes[] = [];
  allEvents.forEach((eventGroup: any) => {
    // eventGroup is Event[]. package is wrong
    const length = eventGroup.length - 1;
    eventGroup.forEach((obj: Event, i: number) => {
      if (obj.name === "Note on") {
        if (obj.velocity !== 0 && obj.noteNumber && obj.noteName) {
          const found: types.MidiEvent | null = searchNoteOff(
            eventGroup.slice(i + 1, length),
            obj.noteNumber
          );
          groupedNotes.push({
            noteName: obj.noteName,
            noteNumber: obj.noteNumber,
            on: obj.tick,
            off: found.tick,
            id: i,
            x: constants.KALIMBA_STANDARD_TUNING[obj.noteName],
          });
        }
      }
    });
  });
  return groupedNotes;
}

export function generateDataToDraw(
  groupedNotes: types.GroupedNotes[],
  currentTick: number,
  ticksPerBeat: number
): types.DataToDraw {
  const notesToDraw: types.NotesToDraw[] = [];
  const maxTick = currentTick + ticksPerBeat * 5;
  for (let i = 0; i < groupedNotes.length - 1; i++) {
    const note = groupedNotes[i];
    if (note.on < maxTick && note.off >= currentTick) {
      const off: number = (note.off - currentTick) / 3;
      const on: number = (note.on - currentTick) / 3;
      const oneNote: types.NotesToDraw = {
        y: on,
        height: off - on,
        x: constants.KALIMBA_STANDARD_TUNING[note.noteName],
        id: note.id,
      };
      notesToDraw.push(oneNote);
    }
  }
  const data = { notesToDraw };
  return data;
}
