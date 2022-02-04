import React from "react";

import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import CustomButton from "./cutomButton/CustomButton";
import myMidiPlayer from "audio";

export default function PracticeModeButton(): JSX.Element {
  function handleOnClick() {
    if (myMidiPlayer.practiceMode) {
      myMidiPlayer.disablePracticeMode();
    } else {
      myMidiPlayer.enablePracticeMode();
    }
  }
  return (
    <CustomButton
      onClick={handleOnClick}
      size="small"
      disabled={!myMidiPlayer.isReady || myMidiPlayer.getIsPlaying()}
      selected={myMidiPlayer.practiceMode}
    >
      <FitnessCenterIcon />
    </CustomButton>
  );
}
