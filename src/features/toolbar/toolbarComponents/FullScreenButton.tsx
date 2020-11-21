import React from "react";

import CustomButton from "./cutomButton/CustomButton";
import FullscreenExitIcon from "@material-ui/icons/FullscreenExit";
import FullscreenIcon from "@material-ui/icons/Fullscreen";

interface IFullScreenButton {
  isFullscreen: boolean;
  setIsFullscreen: (isFullScreen: boolean) => void;
}

export default function FullScreenButton({
  isFullscreen,
  setIsFullscreen,
}: IFullScreenButton): JSX.Element {
  return (
    <div>
      {isFullscreen ? (
        <CustomButton
          onClick={() => setIsFullscreen(false)}
          // style={{ width: BUTTON_WIDTH, height: BUTTON_HEIGHT }}
          size="small"
        >
          <FullscreenExitIcon />
        </CustomButton>
      ) : (
        <CustomButton
          onClick={() => setIsFullscreen(true)}
          //  style={{ width: BUTTON_WIDTH }}
          size="small"
        >
          <FullscreenIcon />
        </CustomButton>
      )}
    </div>
  );
}
