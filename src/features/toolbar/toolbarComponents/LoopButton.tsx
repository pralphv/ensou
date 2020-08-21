import React from "react";
import { RootState } from "app/rootReducer";
import { useSelector, useDispatch } from "react-redux";

import LoopIcon from "@material-ui/icons/Loop";
import { useHotkeys } from "react-hotkeys-hook";

import {
  setLoopOn,
  setLoopOff,
} from "features/midiPlayerStatus/midiPlayerStatusSlice";
import { useStateToRef } from "utils/customHooks";
import CustomButton from "./CustomButton";

export default function LoopButton(): JSX.Element {
  const dispatch = useDispatch();
  const isLoop: boolean = useSelector(
    (state: RootState) => state.midiPlayerStatus.loop
  );
  const isLoopRef = useStateToRef(isLoop);

  function handleOnClick() {
    if (isLoopRef.current) {
      dispatch(setLoopOff());
    } else {
      dispatch(setLoopOn());
    }
  }
  useHotkeys("l", handleOnClick);

  return (
    <CustomButton onClick={handleOnClick} selected={isLoop} >
      <LoopIcon />
    </CustomButton>
  );
}
