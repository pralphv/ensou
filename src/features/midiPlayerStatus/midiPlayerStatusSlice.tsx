import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { MidiStatus } from "./constants";
import { MidiPlayerStatus, PlayRange } from "./types";

const initialState: MidiPlayerStatus = {
  status: MidiStatus.MidiNotLoaded,
  isPlaying: false,
  metronome: false,
  tempo: 100,
  loop: true,
  playRange: {
    startTick: 0,
    endTick: 0
  }
};

const midiPlayerStatusSlice = createSlice({
  name: "midiPlayerStatus",
  initialState,
  reducers: {
    setMidiPlaying(state) {
      state.status = MidiStatus.Playing;
      state.isPlaying = true;
      return state;
    },
    setMidiNotPlaying(state) {
      state.status = MidiStatus.NotPlaying;
      state.isPlaying = false;
      return state;
    },
    setMidiNotLoaded(state) {
      state.status = MidiStatus.MidiNotLoaded;
      return state;
    },
    setMetronomeOn(state) {
      state.metronome = true;
      return state;
    },
    setMetronomeOff(state) {
      state.metronome = false;
      return state;
    },
    setTempoChange(state, action: PayloadAction<number>) {
      state.tempo = action.payload;
      return state;
    },
    setLoopOn(state) {
      state.loop = true;
      return state;
    },
    setLoopOff(state) {
      state.loop = false;
      return state;
    },
    setPlayRange(state, action: PayloadAction<PlayRange>) {
      const playRange = action.payload;
      state.playRange = playRange;
      return state;
    },

  },
});

export const {
  setMidiPlaying,
  setMidiNotPlaying,
  setMidiNotLoaded,
  setMetronomeOn,
  setMetronomeOff,
  setTempoChange,
  setLoopOn,
  setLoopOff,
  setPlayRange
} = midiPlayerStatusSlice.actions;

export default midiPlayerStatusSlice.reducer;
