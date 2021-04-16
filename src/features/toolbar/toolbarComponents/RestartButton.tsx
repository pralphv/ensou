import React from "react";

import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";
import CustomButton from "./cutomButton/CustomButton";
import myMidiPlayer from "audio";

export default function RestartButton(): JSX.Element {
  return (
    <CustomButton onClick={myMidiPlayer.restart} size="small">
      <SkipPreviousIcon />
    </CustomButton>
  );
}
