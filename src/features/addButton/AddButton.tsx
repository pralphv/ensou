import React from "react";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import IconButton from "@mui/material/IconButton";

interface IAddButtonProps {
  onClick: () => void;
}

export default function AddButton({ onClick }: IAddButtonProps): JSX.Element {
  return (
    <IconButton size="small" onClick={onClick}>
      <AddCircleIcon />
    </IconButton>
  );
}
