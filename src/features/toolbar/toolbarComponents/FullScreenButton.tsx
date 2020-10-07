import React, { useState, useMemo } from "react";

import SettingsIcon from "@material-ui/icons/Settings";
import { useHotkeys } from "react-hotkeys-hook";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";

import { useStateToRef } from "utils/customHooks";
import CustomButton from "./CustomButton";
import SettingsMenu from "./SettingsMenu";
import FullscreenExitIcon from "@material-ui/icons/FullscreenExit";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import * as types from "types";
import { BUTTON_WIDTH, BUTTON_HEIGHT } from "../constants";

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
        <CustomButton onClick={openFullScreen}
        //  style={{ width: BUTTON_WIDTH }}
         size="small"
         >
          <FullscreenIcon />
        </CustomButton>
      )}
    </div>
  );
}
