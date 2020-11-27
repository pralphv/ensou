import React from "react";
import clsx from "clsx";

import { useHotkeys } from "react-hotkeys-hook";
import * as types from "types";
import "./styles.css";

interface ProgressBarProps {
  songProgress: number;
  skipToTick: types.IMidiFunctions["skipToTick"];
  getIsPlaying: types.IMidiFunctions["getIsPlaying"];
  setIsHovering: (hovering: boolean) => void;
  forceRerender: types.forceRerender;
  totalTicks: number;
  isFullScreen: boolean;
  isHovering: boolean;
}

const SLIDER_COLOR = "144,238,254";
const SLIDER_LEFT_COLOR = `rgba(${SLIDER_COLOR}, 1)`;
const SLIDER_RIGHT_COLOR = `rgba(${SLIDER_COLOR}, 0.6)`;

export default function ProgressBar({
  songProgress,
  skipToTick,
  setIsHovering,
  forceRerender,
  totalTicks,
  isFullScreen,
  isHovering,
  getIsPlaying,
}: ProgressBarProps): JSX.Element {
  function handleChange(e: any) {
    const value = e.target.value as number;
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
    <input
      type="range"
      min={0}
      max={100}
      step={0.01}
      value={songProgress}
      onInput={handleChange}
      style={{
        background: `linear-gradient(to right, ${SLIDER_LEFT_COLOR} 0%, ${SLIDER_LEFT_COLOR} ${songProgress}%, ${SLIDER_RIGHT_COLOR} ${songProgress}%, ${SLIDER_RIGHT_COLOR} 100%)`,
      }}
      className={clsx({
        fullScreenSlider: isFullScreen,
        "custom-slider": true,
        hide: getIsPlaying() && !isHovering,
      })}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    />
  );
}
