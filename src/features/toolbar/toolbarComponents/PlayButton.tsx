import React from "react";

import { start } from "tone";
import PauseIcon from "@material-ui/icons/Pause";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";

import CustomButton from "./cutomButton/CustomButton";
import myMidiPlayer from "audio";

export default function PlayButton(): JSX.Element {
  const isPlaying = myMidiPlayer.getIsPlaying() === true; // can be undefined

  return (
    <div>
      {isPlaying ? (
        <CustomButton
          onClick={myMidiPlayer.pause}
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
            start();
            myMidiPlayer.play();
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
