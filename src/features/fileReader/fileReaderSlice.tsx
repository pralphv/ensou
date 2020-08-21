import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FileReaderProps {
  songName: string;
}

const initialState: FileReaderProps = {
  songName: "",
};

const fileNameSlice = createSlice({
  name: "songName",
  initialState,
  reducers: {
    setFileName(state, action: PayloadAction<string>) {
      state.songName = action.payload;
      return state;
    },
  },
});

export const { setFileName } = fileNameSlice.actions;

export default fileNameSlice.reducer;
