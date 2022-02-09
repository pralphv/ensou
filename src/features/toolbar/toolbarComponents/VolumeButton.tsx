import React, { useState } from "react";

import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import Slider from "@mui/material/Slider";

import { BUTTON_WIDTH, BUTTON_HEIGHT } from "../constants";
import CustomButton from "./cutomButton/CustomButton";
import myMidiPlayer from "audio";

export default function VolumeButton(): JSX.Element {
  const [muteVolume, setMuteVolume] = useState<number>(0); // for preserving pre mute value

  let IconToShow;

  const volume = myMidiPlayer?.getVolume() || 0;

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
      myMidiPlayer?.setVolume(-16);
    } else {
      myMidiPlayer?.setVolume(muteVolume);
    }
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
      <CustomButton
        style={{ width: BUTTON_WIDTH * 2, height: BUTTON_HEIGHT }}
        size="small"
      >
        <Slider
          value={volume}
          size="small"
          color="secondary"
          onChange={(event: any, newValue: number | number[]) => {
            myMidiPlayer?.setVolume(newValue as number);
          }}
          max={0}
          min={-15}
        />
      </CustomButton>
    </div>
  );
}
