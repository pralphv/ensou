import React, { useState } from "react";

import { Typography } from "@material-ui/core/";
import Popover from "@material-ui/core/Popover";

import TempoChange from "features/tempoChange/TempoChange";
import { BUTTON_WIDTH, BUTTON_HEIGHT } from "../constants";
import CustomButton from "./CustomButton";
import * as types from "types";
interface ITempoButtonProps {
  getIsPlaying: types.IMidiFunctions["getIsPlaying"];
  tempoApi: types.IMidiFunctions["tempoApi"];
  forceRerender: types.forceRerender;
}

export default function TempoButton({
  getIsPlaying,
  tempoApi,
  forceRerender,
}: ITempoButtonProps): JSX.Element {
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
        style={{ width: BUTTON_WIDTH, height: BUTTON_HEIGHT }}
        disabled={getIsPlaying() === true}
      >
        <Typography variant="body2">{value}%</Typography>
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
        <TempoChange
          forceRerender={forceRerender}
          value={value}
          setValue={(tempo) => {
            tempoApi.setTempoPercent(tempo);
            // tempoApi.setTempo(tempo);
            setValue(tempo);
          }}
        />
      </Popover>
    </div>
  );
}
