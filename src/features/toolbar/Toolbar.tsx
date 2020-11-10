import React from "react";
import clsx from "clsx";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";

import PlayButton from "./toolbarComponents/PlayButton";
import VolumeButton from "./toolbarComponents/VolumeButton";
import FileReaderButton from "./toolbarComponents/FileReaderButton";
import TempoButton from "./toolbarComponents/TempoButton";
import RestartButton from "./toolbarComponents/RestartButton";
import SettingsButton from "./toolbarComponents/SettingsButton";
import FullScreenButton from "./toolbarComponents/FullScreenButton";
import * as types from "types";
import "./styles.css";

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
  metronomeApi: types.IMidiFunctions["metronomeApi"];
  loopApi: types.IMidiFunctions["loopApi"];
  tempoApi: types.IMidiFunctions["tempoApi"];
  isFullScreen: boolean;
  openFullScreen: () => void;
  closeFullScreen: () => void;
  isFullScreening: boolean;
  samplerSourceApi: types.IMidiFunctions["samplerSourceApi"];
  sampleApi: types.IMidiFunctions["sampleApi"];
  synthSettingsApi: types.IMidiFunctions["synthSettingsApi"];
  trackFxApi: types.IMidiFunctions["trackFxApi"];
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
  metronomeApi,
  loopApi,
  tempoApi,
  isFullScreen,
  openFullScreen,
  closeFullScreen,
  isFullScreening,
  samplerSourceApi,
  sampleApi,
  synthSettingsApi,
  trackFxApi
}: ToolBarProps) {
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
      className={clsx({ toolbarFullScreen: isFullScreen })}
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
        {window.innerWidth >= 500 && (
          <VolumeButton
            getVolumeDb={getVolumeDb}
            changeVolume={changeVolume}
            forceRerender={forceRerender}
          />
        )}
      </ToggleButtonGroup>
      <ToggleButtonGroup>
        <TempoButton
          getIsPlaying={getIsPlaying}
          tempoApi={tempoApi}
          forceRerender={forceRerender}
        />
        <FileReaderButton
          loadArrayBuffer={loadArrayBuffer}
          getIsPlaying={getIsPlaying}
        />

        <SettingsButton
          forceRerender={forceRerender}
          samplerSourceApi={samplerSourceApi}
          getIsPlaying={getIsPlaying}
          metronomeApi={metronomeApi}
          loopApi={loopApi}
          sampleApi={sampleApi}
          synthSettingsApi={synthSettingsApi}
          trackFxApi={trackFxApi}
        />
        <FullScreenButton
          isFullScreening={isFullScreening}
          openFullScreen={openFullScreen}
          closeFullScreen={closeFullScreen}
        />
      </ToggleButtonGroup>
    </div>
  );
}
