import React, { useState, useMemo } from "react";

import SettingsIcon from "@material-ui/icons/Settings";
import { useHotkeys } from "react-hotkeys-hook";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";

import { useStateToRef } from "utils/customHooks";
import CustomButton from "./CustomButton";
import SettingsMenu from "./SettingsMenu";
import * as types from "types";

interface ISettingsButton {
  soundEffect: types.IMidiFunctions["soundEffect"];
  forceRerender: types.forceRerender;
}

export default function SettingsButton({
  soundEffect,
  forceRerender,
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
          />
        ) : null}
        <CustomButton onClick={handleOnClick}>
          <SettingsIcon />
        </CustomButton>
      </div>
    </ClickAwayListener>
  );
}
