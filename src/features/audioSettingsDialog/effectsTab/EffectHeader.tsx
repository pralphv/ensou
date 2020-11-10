import React from "react";

import IconButton from "@material-ui/core/IconButton";
import DialogContentText from "@material-ui/core/DialogContentText";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";

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
