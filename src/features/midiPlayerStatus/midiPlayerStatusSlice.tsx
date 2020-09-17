import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { MidiStatus } from "./constants";
import { MidiPlayerStatus, PlayRange } from "./types";

const initialState: MidiPlayerStatus = {
  status: MidiStatus.MidiNotLoaded,
  instrumentLoading: false,
  metronome: false,
  tempo: 100,
  volume: 100,
  loop: true,
  playRange: {
    startTick: 0,
    endTick: 0,
  },
  isLoading: false,
  fileName: "",
};

const midiPlayerStatusSlice = createSlice({
  name: "midiPlayerStatus",
  initialState,
  reducers: {
    setMidiNotLoaded(state) {
      state.status = MidiStatus.MidiNotLoaded;
      return state;
    },
    setInstrumentLoading(state) {
      state.instrumentLoading = true;
      return state;
    },
    setInstrumentNotLoading(state) {
      state.instrumentLoading = false;
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
    setVolume(state, action: PayloadAction<number>) {
      state.volume = action.payload;
      return state;
    },
    setisLoading(state) {
      state.isLoading = true;
      return state;
    },
    setisNotLoading(state) {
      state.isLoading = false;
      return state;
    },
    setFileName(state, action: PayloadAction<string>) {
      state.fileName = action.payload;
      return state;
    },
  },
});

export const {
  setMidiNotLoaded,
  setMetronomeOn,
  setMetronomeOff,
  setTempoChange,
  setLoopOn,
  setLoopOff,
  setPlayRange,
  setInstrumentLoading,
  setInstrumentNotLoading,
  setVolume,
  setisLoading,
  setisNotLoading,
  setFileName,
} = midiPlayerStatusSlice.actions;

export default midiPlayerStatusSlice.reducer;
