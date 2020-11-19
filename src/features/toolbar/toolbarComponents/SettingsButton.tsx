import React, { useState } from "react";

import SettingsIcon from "@material-ui/icons/Settings";
import { useHotkeys } from "react-hotkeys-hook";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import MyMidiPlayer from "audio/midiPlayer";

import CustomButton from "./cutomButton/CustomButton";
import SettingsMenu from "./SettingsMenu";
import * as types from "types";

interface ISettingsButton {
  midiPlayer: MyMidiPlayer;
  forceRerender: types.forceRerender;
  horizontalApi: types.IHorizontalApi;
}

export default function SettingsButton({
  forceRerender,
  midiPlayer,
  horizontalApi,
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
            midiPlayer={midiPlayer}
            open={open}
            horizontalApi={horizontalApi}
          />
        <CustomButton onClick={handleOnClick} size="small">
          <SettingsIcon />
        </CustomButton>
      </div>
    </ClickAwayListener>
  );
}
