import React from "react";

import IconButton from "@mui/material/IconButton";
import DialogContentText from "@mui/material/DialogContentText";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

interface IEffectHeader {
  trackIndex: number;
  onClick: () => any;
}
export default function EffectHeader({
  trackIndex,
  onClick,
}: IEffectHeader): JSX.Element {
  return (
    <DialogContentText>
      Chain {trackIndex + 1}
      <IconButton size="small" onClick={onClick}>
        <RemoveCircleIcon />
      </IconButton>
    </DialogContentText>
  );
}
