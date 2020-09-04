import React from "react";
import clsx from "clsx";

import { withStyles } from "@material-ui/core/styles";
import { Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import Slider from "@material-ui/core/Slider";
import { useHotkeys } from "react-hotkeys-hook";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "app/rootReducer";

interface ProgressBarProps {
  songRemaining: number;
  skipToPercent: (percent: number) => void;
  isPlaying: boolean;
  isHovering: boolean;
  setIsHovering: (hovering: boolean) => void;
}

const PrettoSlider = withStyles({
  root: {
    color: "#90EEFE",
    "&:hover": {
      "& $track": {
        height: 5,
      },
      "& $rail": {
        height: 5,
      },
      "& $thumb": {
        display: "inline",
      },
    },
  },
  thumb: {
    display: "none",
    height: 15,
    width: 15,
    marginTop: -5,
    marginLeft: -10,
    "&:focus, &:hover, &$active": {
      boxShadow: "inherit",
    },
  },
  valueLabel: {
    display: "none",
  },
  track: {
    height: 3,
    borderRadius: 2,
  },
  rail: {
    height: 3,
    borderRadius: 2,
  },
})(Slider);

const useStyles = makeStyles((theme) => ({
  root: {
    "&:hover": {
      opacity: 1,
    },
    zIndex: 1000,
  },
  hide: {
    opacity: 0,
  },
  show: {
    opacity: 1,
  },
}));

export default function ProgressBar({
  songRemaining,
  skipToPercent,
  isPlaying,
  isHovering,
  setIsHovering,
}: ProgressBarProps): JSX.Element {
  console.log("Rendering ProgressBar");
  const dispatch = useDispatch();

  const classes = useStyles();

  function handleChange(e: any, newValue: number | number[]) {
    const value = newValue as number;
    skipToPercent(value);
  }

  // no loops rip
  useHotkeys("0", () => skipToPercent(0));
  useHotkeys("1", () => skipToPercent(10));
  useHotkeys("2", () => skipToPercent(20));
  useHotkeys("3", () => skipToPercent(30));
  useHotkeys("4", () => skipToPercent(40));
  useHotkeys("5", () => skipToPercent(50));
  useHotkeys("6", () => skipToPercent(60));
  useHotkeys("7", () => skipToPercent(70));
  useHotkeys("8", () => skipToPercent(80));
  useHotkeys("9", () => skipToPercent(90));

  return (
    <PrettoSlider
      valueLabelDisplay="auto"
      defaultValue={0}
      value={100 - songRemaining}
      max={100}
      onChange={handleChange}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={clsx({
        [classes.root]: true,
        [classes.hide]: isPlaying,
        [classes.show]: !isPlaying || isHovering,
      })}
    />
  );
}
