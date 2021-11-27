import React from "react";

import { start, context } from "tone";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

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
          disabled={!myMidiPlayer.isReady}
        >
          <PauseIcon />
        </CustomButton>
      ) : (
        <CustomButton
          id="playButton"
          onClick={async () => {
            await start();
            await context.resume();
            myMidiPlayer.play();
          }}
          size="small"
          disabled={!myMidiPlayer.isReady}
        >
          <PlayArrowIcon />
        </CustomButton>
      )}
    </div>
  );
}
