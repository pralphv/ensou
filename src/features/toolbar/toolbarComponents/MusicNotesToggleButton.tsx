import React from "react";

import TextFieldsIcon from "@mui/icons-material/TextFields";

import CustomButton from "./cutomButton/CustomButton";
import myCanvas from "canvas";
import myMidiPlayer from "audio";

export default function MusicNotesToggleButton(): JSX.Element {
  function handleOnClick() {
    if (myCanvas.fallingNotes.getIsTextOn()) {
      myCanvas.fallingNotes.hideText();
    } else {
      myCanvas.fallingNotes.showText();
    }
  }

  return (
    <CustomButton
      onClick={handleOnClick}
      size="small"
      selected={myCanvas.fallingNotes?.getIsTextOn()}
      disabled={!myMidiPlayer.isReady || myMidiPlayer.getIsPlaying()}
    >
      <TextFieldsIcon />
    </CustomButton>
  );
}
