import React from "react";

import { Typography } from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";

interface IToMasterCheckbox {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ToMasterCheckbox({
  checked,
  onChange,
}: IToMasterCheckbox): JSX.Element {
  return (
    <Typography>
      To Master
      <Checkbox checked={checked} onChange={onChange} />
    </Typography>
  );
}
