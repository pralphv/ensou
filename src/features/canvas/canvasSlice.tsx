import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Canvas } from "./types";

const initialState: Canvas = {
  isHovering: false,
};

const canvasSlice = createSlice({
  name: "canvasSlice",
  initialState,
  reducers: {
    setHovering(state, action: PayloadAction<boolean>) {
        state.isHovering = action.payload;
        return state;
      },
    },
});

export const { setHovering } = canvasSlice.actions;

export default canvasSlice.reducer;
