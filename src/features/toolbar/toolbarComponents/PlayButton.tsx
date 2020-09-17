import React from "react";

import PauseIcon from "@material-ui/icons/Pause";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import { useHotkeys } from "react-hotkeys-hook";

import { BUTTON_WIDTH, BUTTON_HEIGHT } from "../constants";
import CustomButton from "./CustomButton";
import * as types from "types";

interface PlayButtonProps {
  play: types.IMidiFunctions["play"];
  pause: types.IMidiFunctions["pause"];
  getIsPlaying: types.IMidiFunctions["getIsPlaying"];
  forceRerender: types.forceRerender;
}

export default function PlayButton({
  play,
  pause,
  getIsPlaying,
  forceRerender,
}: PlayButtonProps): JSX.Element {
  const isPlaying = getIsPlaying() === true; // can be undefined

  function toggle() {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }
  useHotkeys("space", toggle);

  return (
    <div>
      {isPlaying ? (
        <CustomButton
          onClick={() => {
            pause();
            forceRerender();
          }}
          style={{ width: BUTTON_WIDTH, height: BUTTON_HEIGHT }}
        >
          <PauseIcon />
        </CustomButton>
      ) : (
        // make arrow function to prevent event insterting into play()
        <CustomButton
          onClick={() => {
            play();
            forceRerender();
          }}
          style={{ width: BUTTON_WIDTH }}
        >
          <PlayArrowIcon />
        </CustomButton>
      )}
    </div>
  );
}
