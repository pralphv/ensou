import React from "react";

import { Typography } from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import { range } from "lodash";
import Select from "@material-ui/core/Select";

interface IExtraOutput {
  trackIndex: number;
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
      <Select value={value} onChange={onChange}>
        {noOfTracks - fxIndex > 2 &&
          range(fxIndex + 2, noOfTracks).map((value) => (
            // fxIndex + 2 because the next effect is already connected
            <MenuItem key={`effect_${value}`} value={value}>
              Effect {value + 1}
            </MenuItem>
          ))}
        <MenuItem key={`effect_blank`} value={""}>
          N/A
        </MenuItem>
      </Select>
    </div>
  );
}
