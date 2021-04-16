import React from "react";
import clsx from "clsx";

import "./styles.css";
import myMidiPlayer from "audio";

interface ProgressBarProps {
  isFullScreen: boolean;
  isHovering: boolean;
}

const SLIDER_COLOR = "144,238,254";
const SLIDER_LEFT_COLOR = `rgba(${SLIDER_COLOR}, 1)`;
const SLIDER_RIGHT_COLOR = `rgba(${SLIDER_COLOR}, 0.6)`;

export default function ProgressBar({
  isFullScreen,
  isHovering,
}: ProgressBarProps): JSX.Element {
  console.log("JER")
  function handleChange(e: any) {
    const value = e.target.value as number;
    myMidiPlayer.skipToTick((value / 100) * totalTicks);
  }
  const totalTicks = myMidiPlayer.getTotalTicks() || 0;
  const songProgress = totalTicks
    ? ((myMidiPlayer.getCurrentTick() || 0) / totalTicks) * 100
    : 0;

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
        hide: myMidiPlayer.getIsPlaying() && !isHovering,
      })}
    />
  );
}
