import React from "react";

import LoopIcon from "@material-ui/icons/Loop";
import { useHotkeys } from "react-hotkeys-hook";

import CustomButton from "./CustomButton";
import * as types from "types";

interface ILoopButtonProps {
  loopApi: types.IMidiFunctions["loopApi"];
  forceRerender: types.forceRerender;
}

export default function LoopButton({
  loopApi,
  forceRerender,
}: ILoopButtonProps): JSX.Element {
  function handleOnClick() {
    if (loopApi.getIsLoop()) {
      loopApi.setIsNotLoop();
    } else {
      loopApi.setIsLoop();
    }
    forceRerender();
  }
  useHotkeys("l", handleOnClick);

  return (
    <CustomButton onClick={handleOnClick} selected={loopApi.getIsLoop()} size="small">
      <LoopIcon />
    </CustomButton>
  );
}
