import React from "react";

import CustomButton from "./cutomButton/CustomButton";
import FullscreenExitIcon from "@material-ui/icons/FullscreenExit";
import FullscreenIcon from "@material-ui/icons/Fullscreen";

interface IFullScreenButton {
  isFullScreening: boolean;
  openFullScreen: () => void;
  closeFullScreen: () => void;
}

export default function FullScreenButton({
  isFullScreening,
  openFullScreen,
  closeFullScreen,
}: IFullScreenButton): JSX.Element {
  return (
    <div>
      {isFullScreening ? (
        <CustomButton
          onClick={closeFullScreen}
          // style={{ width: BUTTON_WIDTH, height: BUTTON_HEIGHT }}
          size="small"
        >
          <FullscreenExitIcon />
        </CustomButton>
      ) : (
        <CustomButton
          onClick={openFullScreen}
          //  style={{ width: BUTTON_WIDTH }}
          size="small"
        >
          <FullscreenIcon />
        </CustomButton>
      )}
    </div>
  );
}
