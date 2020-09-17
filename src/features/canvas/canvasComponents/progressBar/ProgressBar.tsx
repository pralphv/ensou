import React from "react";

import { withStyles } from "@material-ui/core/styles";
import Slider from "@material-ui/core/Slider";
import { useHotkeys } from "react-hotkeys-hook";
import * as types from "types";

interface ProgressBarProps {
  songProgress: number;
  skipToTick: types.IMidiFunctions["skipToTick"];
  setIsHovering: (hovering: boolean) => void;
  forceRerender: types.forceRerender;
  totalTicks: number;
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

export default function ProgressBar({
  songProgress,
  skipToTick,
  setIsHovering,
  forceRerender,
  totalTicks,
}: ProgressBarProps): JSX.Element {
  // console.log("Progressbar Rerender");

  function handleChange(e: any, newValue: number | number[]) {
    const value = newValue as number;
    skipToTick((value / 100) * totalTicks);
    forceRerender();
  }

  // no loops rip
  // useHotkeys("0", () => skipToPercent(0));
  // useHotkeys("1", () => skipToPercent(10));
  // useHotkeys("2", () => skipToPercent(20));
  // useHotkeys("3", () => skipToPercent(30));
  // useHotkeys("4", () => skipToPercent(40));
  // useHotkeys("5", () => skipToPercent(50));
  // useHotkeys("6", () => skipToPercent(60));
  // useHotkeys("7", () => skipToPercent(70));
  // useHotkeys("8", () => skipToPercent(80));
  // useHotkeys("9", () => skipToPercent(90));

  return (
    <PrettoSlider
      valueLabelDisplay="auto"
      defaultValue={0}
      value={songProgress}
      max={100}
      onChange={handleChange}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    />
  );
}
