import React from "react";

import TextFieldsIcon from "@material-ui/icons/TextFields";

import CustomButton from "./cutomButton/CustomButton";
import myCanvas from "canvas";

export default function MusicNotesToggleButton(): JSX.Element {
  function handleOnClick() {
    if (myCanvas.fallingNotes.getIsTextOn()) {
      myCanvas.fallingNotes.hideText();
    } else {
      myCanvas.fallingNotes.showText();
    }
    // forceRerender();
  }

  return (
    <CustomButton onClick={handleOnClick} size="small">
      <TextFieldsIcon />
    </CustomButton>
  );
}
