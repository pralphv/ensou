import React, { useState } from "react";

import { useHotkeys } from "react-hotkeys-hook";
import { makeStyles } from "@material-ui/core";
import VolumeDownIcon from "@material-ui/icons/VolumeDown";
import VolumeUpIcon from "@material-ui/icons/VolumeUp";
import VolumeOffIcon from "@material-ui/icons/VolumeOff";
import Slider from "@material-ui/core/Slider";

import { BUTTON_WIDTH, BUTTON_HEIGHT } from "../constants";
import CustomButton from "./CustomButton";

interface PlayButtonProps {
  changeVolume: (volume: number) => void;
  getVolumeDb: () => number | undefined;
  forceRerender: () => void;
}

const useStyles = makeStyles({
  slider: {
    // width: 100,
    // paddingTop: 15,
    // paddingBottom: 15,
    // marginLeft: 20,
    // marginRight: 20,
  },
});

export default function VolumeButton({
  changeVolume,
  getVolumeDb,
  forceRerender,
}: PlayButtonProps): JSX.Element {
  const classes = useStyles();
  const [muteVolume, setMuteVolume] = useState<number>(0); // for preserving pre mute value

  useHotkeys("m", () => changeVolume(-16));
  let IconToShow;

  const volume = getVolumeDb() || 0;

  if (volume <= -15) {
    IconToShow = VolumeOffIcon;
  } else if (volume <= -7.5) {
    IconToShow = VolumeDownIcon;
  } else {
    IconToShow = VolumeUpIcon;
  }

  function onClickVolume() {
    if (volume >= -15) {
      setMuteVolume(volume);
      changeVolume(-16);
    } else {
      changeVolume(muteVolume);
    }
    forceRerender();
  }

  return (
    <div>
      <CustomButton
        onClick={onClickVolume}
        // style={{ width: BUTTON_WIDTH, height: BUTTON_HEIGHT }}
        size="small"
      >
        <IconToShow />
      </CustomButton>
      <CustomButton style={{ width: BUTTON_WIDTH * 2, height: BUTTON_HEIGHT }} 
      size="small"
      >
        <Slider
          value={volume}
          color="secondary"
          onChange={(event: any, newValue: number | number[]) => {
            changeVolume(newValue as number);
            forceRerender();
          }}
          max={0}
          min={-15}
          className={classes.slider}
        />
      </CustomButton>
    </div>
  );
}
