import React from "react";

import { start, context } from "tone";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import CustomButton from "./cutomButton/CustomButton";
import myMidiPlayer from "audio";
import { PlaybackStateEnum } from "audio/constants";

export default function PlayButton(): JSX.Element {
  const isPlaying = myMidiPlayer.getState() === PlaybackStateEnum.started;

  return (
    <div>
      {isPlaying ? (
        <CustomButton
          onClick={myMidiPlayer.pause}
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
