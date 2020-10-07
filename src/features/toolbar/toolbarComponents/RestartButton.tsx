import React from "react";

import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";
import { useHotkeys } from "react-hotkeys-hook";
import CustomButton from "./CustomButton";
interface RestartButton {
  restart: () => void;
}

export default function RestartButton({ restart }: RestartButton): JSX.Element {
  useHotkeys("home", restart);

  return (
    <CustomButton onClick={restart} size="small">
      <SkipPreviousIcon />
    </CustomButton>
  );
}
