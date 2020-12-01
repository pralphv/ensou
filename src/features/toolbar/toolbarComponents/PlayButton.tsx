import React from "react";

import { start } from "tone";
import PauseIcon from "@material-ui/icons/Pause";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import { useHotkeys } from "react-hotkeys-hook";

import CustomButton from "./cutomButton/CustomButton";
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

  // useHotkeys("space", toggle);

  return (
    <div>
      {isPlaying ? (
        <CustomButton
          onClick={() => {
            pause();
            forceRerender();
          }}
          // style={{ width: BUTTON_WIDTH, height: BUTTON_HEIGHT }}
          size="small"
        >
          <PauseIcon />
        </CustomButton>
      ) : (
        // make arrow function to prevent event insterting into play()
        <CustomButton
          id="playButton"
          onClick={() => {
            play();
            start();
            forceRerender();
          }}
          size="small"
          // style={{ width: BUTTON_WIDTH }}
        >
          <PlayArrowIcon />
        </CustomButton>
      )}
    </div>
  );
}
