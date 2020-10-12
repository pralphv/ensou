import React, { useState, useMemo } from "react";

import SettingsIcon from "@material-ui/icons/Settings";
import { useHotkeys } from "react-hotkeys-hook";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";

import CustomButton from "./CustomButton";
import SettingsMenu from "./SettingsMenu";
import * as types from "types";

interface ISettingsButton {
  soundEffect: types.IMidiFunctions["soundEffect"];
  forceRerender: types.forceRerender;
  isUseSamplerApi: types.IMidiFunctions["isUseSamplerApi"];
  getIsPlaying: types.IMidiFunctions["getIsPlaying"];
  metronomeApi: types.IMidiFunctions["metronomeApi"];
  loopApi: types.IMidiFunctions["loopApi"];

}

export default function SettingsButton({
  soundEffect,
  forceRerender,
  isUseSamplerApi,
  getIsPlaying,
  metronomeApi,
  loopApi
}: ISettingsButton): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  function handleOnClick() {
    setOpen(!open);
  }
  // ClickAwayListener must have div as child
  return (
    <ClickAwayListener
      onClickAway={() => {
        setOpen(false);
      }}
    >
      <div>
        {open ? (
          <SettingsMenu
            soundEffect={soundEffect}
            forceRerender={forceRerender}
            isUseSamplerApi={isUseSamplerApi}
            getIsPlaying={getIsPlaying}
            metronomeApi={metronomeApi}
            loopApi={loopApi}
          />
        ) : null}
        <CustomButton onClick={handleOnClick}
        size="small"
        >
          <SettingsIcon />
        </CustomButton>
      </div>
    </ClickAwayListener>
  );
}
