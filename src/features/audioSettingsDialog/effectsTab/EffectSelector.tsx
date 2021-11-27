import React from "react";

import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import { AvailableEffectsNames } from "types";

interface IEffectSelector {
  value: AvailableEffectsNames;
  onChange: (e: any) => any;
}

export default function EffectSelector({
  value,
  onChange,
}: IEffectSelector): JSX.Element {
  return (
    <Select value={value} onChange={onChange}>
      {Object.values(AvailableEffectsNames).map((value) => (
        <MenuItem key={value} value={value}>
          {value}
        </MenuItem>
      ))}
    </Select>
  );
}
