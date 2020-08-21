import React from "react";

import { RootState } from "app/rootReducer";
import { useSelector, useDispatch } from "react-redux";

import { Typography } from "@material-ui/core/";
import { useHotkeys } from "react-hotkeys-hook";

import {
  setMetronomeOn,
  setMetronomeOff,
} from "features/midiPlayerStatus/midiPlayerStatusSlice";
import { useStateToRef } from "utils/customHooks";
import CustomButton from "./CustomButton";

export default function MetronomeButton(): JSX.Element {
  const dispatch = useDispatch();
  const isMetronome: boolean = useSelector(
    (state: RootState) => state.midiPlayerStatus.metronome
  );
  const isMetronomeRef = useStateToRef(isMetronome);

  function handleOnClick() {
    if (isMetronomeRef.current) {
      dispatch(setMetronomeOff());
    } else {
      dispatch(setMetronomeOn());
    }
  }
  useHotkeys("m", handleOnClick);

  return (
    <CustomButton onClick={handleOnClick} selected={isMetronome}>
      <Typography>Metronome</Typography>
    </CustomButton>
  );
}
