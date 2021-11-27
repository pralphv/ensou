import React from "react";

import LoopIcon from "@mui/icons-material/Loop";

import CustomButton from "./cutomButton/CustomButton";
import myMidiPlayer from "audio";

export default function LoopButton(): JSX.Element {
  function handleOnClick() {
    if (myMidiPlayer.getIsLoop()) {
      myMidiPlayer.setIsLoop(false);
    } else {
      myMidiPlayer.setIsLoop(true);
    }
  }

  return (
    <CustomButton
      onClick={handleOnClick}
      selected={myMidiPlayer.getIsLoop()}
      size="small"
    >
      <LoopIcon />
    </CustomButton>
  );
}
