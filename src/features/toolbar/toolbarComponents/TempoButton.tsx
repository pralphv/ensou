import React from "react";

import { RootState } from "app/rootReducer";
import { useSelector } from "react-redux";

import { Typography } from "@material-ui/core/";
import Popover from "@material-ui/core/Popover";

import TempoChange from "features/tempoChange/TempoChange";
import { BUTTON_WIDTH, BUTTON_HEIGHT } from "../constants";
import CustomButton from "./CustomButton";

export default function TempoButton(): JSX.Element {
  const tempo: number = useSelector(
    (state: RootState) => state.midiPlayerStatus.tempo
  );

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(e.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <div>
      <CustomButton
        onClick={handleClick}
        style={{ width: BUTTON_WIDTH, height: BUTTON_HEIGHT }}
      >
        <Typography variant="body2">{tempo}%</Typography>
      </CustomButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <TempoChange />
      </Popover>
    </div>
  );
}
