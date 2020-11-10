import React, { useState } from "react";

import SettingsIcon from "@material-ui/icons/Settings";
import { useHotkeys } from "react-hotkeys-hook";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";

import CustomButton from "./cutomButton/CustomButton";
import SettingsMenu from "./SettingsMenu";
import * as types from "types";

interface ISettingsButton {
  forceRerender: types.forceRerender;
  samplerSourceApi: types.IMidiFunctions["samplerSourceApi"];
  getIsPlaying: types.IMidiFunctions["getIsPlaying"];
  metronomeApi: types.IMidiFunctions["metronomeApi"];
  loopApi: types.IMidiFunctions["loopApi"];
  sampleApi: types.IMidiFunctions["sampleApi"];
  synthSettingsApi: types.IMidiFunctions["synthSettingsApi"];
  trackFxApi: types.IMidiFunctions["trackFxApi"];
}

export default function SettingsButton({
  forceRerender,
  samplerSourceApi,
  getIsPlaying,
  metronomeApi,
  loopApi,
  sampleApi,
  synthSettingsApi,
  trackFxApi
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
          <SettingsMenu
            forceRerender={forceRerender}
            samplerSourceApi={samplerSourceApi}
            getIsPlaying={getIsPlaying}
            metronomeApi={metronomeApi}
            loopApi={loopApi}
            open={open}
            sampleApi={sampleApi}
            synthSettingsApi={synthSettingsApi}
            trackFxApi={trackFxApi}
          />
        <CustomButton onClick={handleOnClick} size="small">
          <SettingsIcon />
        </CustomButton>
      </div>
    </ClickAwayListener>
  );
}
