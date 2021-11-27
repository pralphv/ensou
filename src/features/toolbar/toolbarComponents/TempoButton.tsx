import React, { useState } from "react";

import { Typography } from "@mui/material/";
import Popover from "@mui/material/Popover";

import TempoChange from "features/tempoChange/TempoChange";
import CustomButton from "./cutomButton/CustomButton";
import myMidiPlayer from "audio";

export default function TempoButton(): JSX.Element {
  const [value, setValue] = useState<number>(100);

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
        // style={{ width: BUTTON_WIDTH, height: BUTTON_HEIGHT }}
        size="small"
        disabled={myMidiPlayer.getIsPlaying() === true}
      >
        <Typography variant="body2">{value}%</Typography>
      </CustomButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <TempoChange
          value={value}
          setValue={(tempo) => {
            myMidiPlayer.setTempoPercent(tempo);
            setValue(tempo);
          }}
        />
      </Popover>
    </div>
  );
}
