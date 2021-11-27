import React from "react";

import { Typography } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { range } from "lodash";
import Select from "@mui/material/Select";

interface IExtraOutput {
  fxIndex: number;
  noOfTracks: number;
  value: number | null;
  onChange: (e: any) => void;
}

export default function ExtraOutput({
  fxIndex,
  noOfTracks,
  value,
  onChange,
}: IExtraOutput): JSX.Element {
  return (
    <div>
      <Typography gutterBottom>Extra Output</Typography>
      <Select value={value || ""} onChange={onChange}>
        {noOfTracks - fxIndex > 2 &&
          range(fxIndex + 2, noOfTracks).map((option_) => {
            // fxIndex + 2 because the next effect is already connected
            return (
              <MenuItem key={`effect_${option_}`} value={option_}>
                Effect {option_ + 1}
              </MenuItem>
            );
          })}
        <MenuItem key={`effect_blank`} value={""}>
          N/A
        </MenuItem>
      </Select>
    </div>
  );
}
