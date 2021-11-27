import React from "react";

import { Typography } from "@mui/material/";
import { useHotkeys } from "react-hotkeys-hook";

import CustomButton from "./cutomButton/CustomButton";
import * as types from "types";

interface IMetronomeButtonProps {
  metronomeApi: types.IMidiFunctions["metronomeApi"];
  forceRerender: types.forceRerender;
}

export default function MetronomeButton({
  metronomeApi,
  forceRerender,
}: IMetronomeButtonProps): JSX.Element {
  function handleOnClick() {
    if (metronomeApi.getIsMetronome()) {
      metronomeApi.setIsNotMetronome();
    } else {
      metronomeApi.setIsMetronome();
    }
    forceRerender();
  }
  // useHotkeys("m", handleOnClick);

  return (
    <CustomButton
      onClick={handleOnClick}
      selected={metronomeApi.getIsMetronome()}
      size="small"
    >
      <Typography>Metronome</Typography>
    </CustomButton>
  );
}
