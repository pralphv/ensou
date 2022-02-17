import React from "react";
import SixtyFpsIcon from "@mui/icons-material/SixtyFps";

import CustomButton from "./cutomButton/CustomButton";
import myCanvas from "canvas";

export default function FpsButton(): JSX.Element {
  function handleOnClick() {
    if (myCanvas.fps.visible) {
      myCanvas.fps.hide();
    } else {
      myCanvas.fps.show();
    }
  }

  return (
    <CustomButton
      onClick={handleOnClick}
      selected={myCanvas.fps.visible}
      size="small"
    >
      <SixtyFpsIcon />
    </CustomButton>
  );
}
