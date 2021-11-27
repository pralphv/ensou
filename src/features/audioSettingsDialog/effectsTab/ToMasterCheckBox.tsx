import React from "react";

import { Typography } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";

interface IToMasterCheckboxProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ToMasterCheckbox({
  checked,
  onChange,
}: IToMasterCheckboxProps): JSX.Element {
  return (
    <Typography>
      To Master
      <Checkbox checked={checked} onChange={onChange} />
    </Typography>
  );
}
