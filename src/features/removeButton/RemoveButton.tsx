import React from "react";

import { Button } from "@mui/material";

interface IRemoveButtonProps {
  onClick: () => void;
}

export default function RemoveButton({
  onClick,
}: IRemoveButtonProps): JSX.Element {
  return (
    <Button size="medium" variant="contained" onClick={onClick}>
      Remove
    </Button>
  );
}
