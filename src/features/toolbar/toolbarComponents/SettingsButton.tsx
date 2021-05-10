import React, { useMemo, useState } from "react";

import SettingsIcon from "@material-ui/icons/Settings";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";

import CustomButton from "./cutomButton/CustomButton";
import SettingsMenu from "./SettingsMenu";

export default function SettingsButton(): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  function handleOnClick() {
    setOpen(!open);
  }

  const settingsMenuMemo = useMemo(() => <SettingsMenu open={open} />, [open]);

  // ClickAwayListener must have div as child
  return (
    <ClickAwayListener
      onClickAway={() => {
        setOpen(false);
      }}
    >
      <div>
        {settingsMenuMemo}
        <CustomButton onClick={handleOnClick} size="small">
          <SettingsIcon />
        </CustomButton>
      </div>
    </ClickAwayListener>
  );
}
