import React, { useState } from "react";

import { Typography } from "@material-ui/core/";
import Popover from "@material-ui/core/Popover";

import TempoChange from "features/tempoChange/TempoChange";
import CustomButton from "./cutomButton/CustomButton";
import * as types from "types";
interface ITempoButtonProps {
  getIsPlaying: types.IMidiFunctions["getIsPlaying"];
  setTempoPercent: types.IMidiFunctions["tempoApi"]["setTempoPercent"];
  forceRerender: types.forceRerender;
}

export default function TempoButton({
  getIsPlaying,
  setTempoPercent,
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
        // style={{ width: BUTTON_WIDTH, height: BUTTON_HEIGHT }}
        size="small"
        disabled={getIsPlaying() === true}
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
          forceRerender={forceRerender}
          value={value}
          setValue={(tempo) => {
            setTempoPercent(tempo);
            setValue(tempo);
          }}
        />
      </Popover>
    </div>
  );
}
