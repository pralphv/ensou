import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { MidiStatus } from "./constants";
import { MidiPlayerStatus, loopPoints } from "./types";

const initialState: MidiPlayerStatus = {
  status: MidiStatus.MidiNotLoaded,
  isLoading: false,
  fileName: "",
  isDownloading: false,
  downloadProgress: 0,
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
    setisDowloading(state) {
      state.isDownloading = true;
      return state;
    },
    setIsNotDowloading(state) {
      state.isDownloading = false;
      return state;
    },
    resetDownloadProgress(state) {
      state.downloadProgress = 0;
    },
    setDownloadProgress(state, action: PayloadAction<number>) {
      state.downloadProgress = action.payload;
      return state;
    },
  },
});

export const {
  setMidiNotLoaded,
  setisLoading,
  setisNotLoading,
  setFileName,
  setisDowloading,
  setIsNotDowloading,
  resetDownloadProgress,
  setDownloadProgress
} = midiPlayerStatusSlice.actions;

export default midiPlayerStatusSlice.reducer;
