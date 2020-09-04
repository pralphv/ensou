import React from "react";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";

import MetronomeButton from "./toolbarComponents/MetronomeButton";
import LoopButton from "./toolbarComponents/LoopButton";
import PlayButton from "./toolbarComponents/PlayButton";
import VolumeButton from "./toolbarComponents/VolumeButton";

import TempoButton from "./toolbarComponents/TempoButton";
import RestartButton from "./toolbarComponents/RestartButton";
import { BUTTON_WIDTH, BUTTON_HEIGHT } from "./constants";

interface ToolBarProps {
  play: () => void;
  pause: () => void;
  restart: () => void;
  isPlaying: boolean;
  isHovering: boolean;
  setIsHovering: (hovering: boolean) => void;
  changeVolume: (volume: number) => void;
  getVolumeDb: () => number | undefined;
  forceRerender: () => void;
}

export default function ToolBar({
  play,
  pause,
  restart,
  isPlaying,
  isHovering,
  setIsHovering,
  changeVolume,
  getVolumeDb,
  forceRerender,
}: ToolBarProps) {
  console.log("Toolbar Rerender");
  let opacity = isPlaying ? 0 : 1;
  opacity = isHovering ? 1 : opacity;

  return (
    <ToggleButtonGroup
      style={{ opacity, marginTop: -15 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <RestartButton restart={restart} />
      <PlayButton play={play} pause={pause} />
      <VolumeButton
        getVolumeDb={getVolumeDb}
        changeVolume={changeVolume}
        forceRerender={forceRerender}
      />
      <LoopButton />
      <MetronomeButton />
      <TempoButton />
    </ToggleButtonGroup>
  );
}
