import React from "react";
import Switch from "@material-ui/core/Switch";

interface IActivateSwitch {
  checked: boolean;
  onChange: () => void;
}

export default function ActivateSwitch({ checked, onChange }: IActivateSwitch) {
  return <Switch checked={checked} onChange={onChange} />;
}
