import React from "react";

import { Button } from "@material-ui/core";

interface IRemoveFxButtonProps {
  onClick: () => void;
}

export default function RemoveFxButton({
  onClick,
}: IRemoveFxButtonProps): JSX.Element {
  return (
    <Button size="medium" variant="contained" onClick={onClick}>
      Remove
    </Button>
  );
}
