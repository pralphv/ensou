import React from "react";
import { RootState } from "app/rootReducer";
import { useSelector } from "react-redux";

import PauseIcon from "@material-ui/icons/Pause";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import { useHotkeys } from "react-hotkeys-hook";
import { makeStyles } from "@material-ui/core";

import { useStateToRef } from "utils/customHooks";
import { BUTTON_WIDTH, BUTTON_HEIGHT } from "../constants";
import CustomButton from "./CustomButton";

interface PlayButtonProps {
  play: () => void;
  pause: () => void;
}

const useStyles = makeStyles({
  nonFocus: {
    tabIndex: -1,
  },
});

export default function PlayButton({
  play,
  pause,
}: PlayButtonProps): JSX.Element {
  const classes = useStyles();
  const isPlaying: boolean = useSelector(
    (state: RootState) => state.midiPlayerStatus.isPlaying
  );
  const isPlayingRef = useStateToRef(isPlaying);

  function toggle() {
    if (isPlayingRef.current) {
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
          onClick={pause}
          style={{ width: BUTTON_WIDTH, height: BUTTON_HEIGHT }}
        >
          <PauseIcon />
        </CustomButton>
      ) : (
        // make arrow function to prevent event insterting into play()
        <CustomButton onClick={() => play()} style={{ width: BUTTON_WIDTH }}>
          <PlayArrowIcon />
        </CustomButton>
      )}
    </div>
  );
}
