import React from "react";

import CustomButton from "./cutomButton/CustomButton";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import myCanvas from "canvas";

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
          onClick={() => {
            setIsFullscreen(false);
          }}
          size="small"
        >
          <FullscreenExitIcon />
        </CustomButton>
      ) : (
        <CustomButton
          onClick={() => {
            setIsFullscreen(true);
          }}
          size="small"
        >
          <FullscreenIcon />
        </CustomButton>
      )}
    </div>
  );
}
