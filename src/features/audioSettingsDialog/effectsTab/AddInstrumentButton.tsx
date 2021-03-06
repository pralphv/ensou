import React from "react";

import IconButton from "@material-ui/core/IconButton";
import AddCircleIcon from "@material-ui/icons/AddCircle";

import * as types from "types";

export interface IAddInstrumentButtonProps {
  forceLocalRender: types.forceLocalRender;
  addInstrument: types.IMidiFunctions["trackFxApi"]["addInstrument"];
}

export default function AddInstrumentButton({
  addInstrument,
  forceLocalRender,
}: IAddInstrumentButtonProps): JSX.Element {
  return (
    <IconButton
      size="small"
      onClick={() => {
        addInstrument();
        forceLocalRender();
      }}
    >
      <AddCircleIcon />
    </IconButton>
  );
}
