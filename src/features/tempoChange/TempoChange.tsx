import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import Slider from "@material-ui/core/Slider";

import * as types from "types";

const useStyles = makeStyles({
  slider: {
    width: 100,
    paddingTop: 20,
    paddingBottom: 20,
    marginLeft: 20,
    marginRight: 20,
  },
});

interface ITempoChange {
  forceRerender: types.forceRerender;
  value: number;
  setValue: (value: number) => void;
}

function TempoChange({
  forceRerender,
  value,
  setValue,
}: ITempoChange) {
  const classes = useStyles();
  const handleChange = (e: any, newValue: number | number[]) => {
    newValue = newValue as number;
    setValue(Math.round(newValue));
    forceRerender();
  };

  return (
    <Slider
      color="secondary"
      value={value}
      onChange={handleChange}
      min={0}
      max={200}
      className={classes.slider}
    />
  );
}

export default TempoChange;
