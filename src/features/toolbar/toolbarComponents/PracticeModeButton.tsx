import React from "react";

import FitnessCenterIcon from "@material-ui/icons/FitnessCenter";
import CustomButton from "./cutomButton/CustomButton";
import myMidiPlayer from "audio";

export default function PracticeModeButton(): JSX.Element {
  function handleOnClick() {
    if (myMidiPlayer.practiceMode) {
      myMidiPlayer.disablePracticeMode();
    } else {
      myMidiPlayer.enablePracticeMode();
    }
    // forceRerender();
  }

  return (
    <CustomButton onClick={handleOnClick} size="small" disabled={myMidiPlayer.getIsPlaying()}>
      <FitnessCenterIcon />
    </CustomButton>
  );
}
