import React from "react";
import clsx from "clsx";

import { useSelector, useDispatch } from "react-redux";

import { makeStyles } from "@material-ui/core";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";

import MetronomeButton from "./toolbarComponents/MetronomeButton";
import LoopButton from "./toolbarComponents/LoopButton";
import PlayButton from "./toolbarComponents/PlayButton";
import TempoButton from "./toolbarComponents/TempoButton";
import RestartButton from "./toolbarComponents/RestartButton";
import { BUTTON_WIDTH, BUTTON_HEIGHT } from "./constants";

import { RootState } from "app/rootReducer";
import { setHovering } from "features/canvas/canvasSlice";

interface ToolBarProps {
  play: () => void;
  pause: () => void;
  restart: () => void;
  isPlaying: boolean;
}

export default function ToolBar({
  play,
  pause,
  restart,
  isPlaying,
}: ToolBarProps) {
  console.log("Toolbar Rerender");
  const dispatch = useDispatch();
  const isHoveringCanvas: boolean = useSelector(
    (state: RootState) => state.canvas.isHovering
  );
  let opacity = isPlaying ? 0 : 1;
  opacity = isHoveringCanvas ? 1 : opacity;

  return (
    <ToggleButtonGroup
      style={{ opacity, marginTop: -15 }}
      onMouseEnter={() => dispatch(setHovering(true))}
      onMouseLeave={() => dispatch(setHovering(false))}
    >
      <RestartButton restart={restart} />
      <PlayButton play={play} pause={pause} />
      <LoopButton />
      <MetronomeButton />
      <TempoButton />
    </ToggleButtonGroup>
  );
}
