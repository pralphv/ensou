import React from "react";

import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";

import MetronomeButton from "./toolbarComponents/MetronomeButton";
import LoopButton from "./toolbarComponents/LoopButton";
import PlayButton from "./toolbarComponents/PlayButton";
import VolumeButton from "./toolbarComponents/VolumeButton";
import FileReaderButton from "./toolbarComponents/FileReaderButton";
import TempoButton from "./toolbarComponents/TempoButton";
import RestartButton from "./toolbarComponents/RestartButton";
import SettingsButton from "./toolbarComponents/SettingsButton";
import { BUTTON_WIDTH, BUTTON_HEIGHT } from "./constants";
import * as types from "types";

interface ToolBarProps {
  play: types.IMidiFunctions["play"];
  pause: types.IMidiFunctions["pause"];
  restart: types.IMidiFunctions["restart"];
  isHovering: boolean;
  setIsHovering: (hovering: boolean) => void;
  changeVolume: (volume: number) => void;
  getVolumeDb: types.IMidiFunctions["getVolumeDb"];
  forceRerender: types.forceRerender;
  loadArrayBuffer: types.IMidiFunctions["loadArrayBuffer"];
  getIsPlaying: types.IMidiFunctions["getIsPlaying"];
  soundEffect: types.IMidiFunctions["soundEffect"];
  metronomeApi: types.IMidiFunctions["metronomeApi"];
  loopApi: types.IMidiFunctions["loopApi"];
  tempoApi: types.IMidiFunctions["tempoApi"];
}

export default function ToolBar({
  play,
  pause,
  restart,
  isHovering,
  setIsHovering,
  changeVolume,
  getVolumeDb,
  forceRerender,
  loadArrayBuffer,
  getIsPlaying,
  soundEffect,
  metronomeApi,
  loopApi,
  tempoApi,
}: ToolBarProps) {
  console.log("Toolbar Rerender");
  let opacity = getIsPlaying() === true ? 0 : 1;
  opacity = isHovering ? 1 : opacity;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        opacity,
        marginTop: -15,
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <ToggleButtonGroup>
        <RestartButton restart={restart} />
        <PlayButton
          play={play}
          pause={pause}
          getIsPlaying={getIsPlaying}
          forceRerender={forceRerender}
        />
        <VolumeButton
          getVolumeDb={getVolumeDb}
          changeVolume={changeVolume}
          forceRerender={forceRerender}
        />
        <LoopButton loopApi={loopApi} forceRerender={forceRerender} />
        <MetronomeButton
          metronomeApi={metronomeApi}
          forceRerender={forceRerender}
        />
        <TempoButton
          getIsPlaying={getIsPlaying}
          tempoApi={tempoApi}
          forceRerender={forceRerender}
        />
        <FileReaderButton
          loadArrayBuffer={loadArrayBuffer}
          getIsPlaying={getIsPlaying}
        />
      </ToggleButtonGroup>
      <SettingsButton soundEffect={soundEffect} forceRerender={forceRerender} />
    </div>
  );
}
