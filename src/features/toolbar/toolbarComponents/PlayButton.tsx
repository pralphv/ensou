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
        <CustomButton
          id="playButton"
          onClick={async () => {
            await start();
            myMidiPlayer.play();
          }}
          size="small"
        >
          <PlayArrowIcon />
        </CustomButton>
      )}
    </div>
  );
}
