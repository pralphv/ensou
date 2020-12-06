import React from "react";

import AddCircleIcon from "@material-ui/icons/AddCircle";
import IconButton from "@material-ui/core/IconButton";

interface IAddButtonProps {
  onClick: () => void;
}

export default function AddButton({ onClick }: IAddButtonProps): JSX.Element {
  return (
    <IconButton size="small" onClick={onClick} disableFocusRipple={true}>
      <AddCircleIcon />
    </IconButton>
  );
}
