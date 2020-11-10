import React from "react";

import AddCircleIcon from "@material-ui/icons/AddCircle";
import IconButton from "@material-ui/core/IconButton";

interface IAddFxButtonProps {
  onClick: () => void;
}

export default function AddFxButton({
  onClick,
}: IAddFxButtonProps): JSX.Element {
  return (
    <IconButton size="small" onClick={onClick}>
      <AddCircleIcon />
    </IconButton>
  );
}
