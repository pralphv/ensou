import React from "react";

import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

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
