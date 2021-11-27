import React from "react";
import Switch from "@mui/material/Switch";

interface IActivateSwitch {
  checked: boolean;
  onChange: () => void;
}

export default function ActivateSwitch({ checked, onChange }: IActivateSwitch) {
  return <Switch checked={checked} onChange={onChange} />;
}
