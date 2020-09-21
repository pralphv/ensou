import React from "react";

import { Typography } from "@material-ui/core/";
import { useHotkeys } from "react-hotkeys-hook";

import CustomButton from "./CustomButton";
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
  useHotkeys("m", handleOnClick);

  return (
    <CustomButton
      onClick={handleOnClick}
      selected={metronomeApi.getIsMetronome()}
    >
      <Typography>Metronome</Typography>
    </CustomButton>
  );
}
