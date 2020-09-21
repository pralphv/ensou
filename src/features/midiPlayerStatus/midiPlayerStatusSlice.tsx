import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { MidiStatus } from "./constants";
import { MidiPlayerStatus, PlayRange } from "./types";

const initialState: MidiPlayerStatus = {
  status: MidiStatus.MidiNotLoaded,
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
  setisLoading,
  setisNotLoading,
  setFileName,
} = midiPlayerStatusSlice.actions;

export default midiPlayerStatusSlice.reducer;
