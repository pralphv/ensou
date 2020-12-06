import React from "react";

import { Button } from "@material-ui/core";

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
