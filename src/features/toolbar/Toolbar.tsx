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
import MyMidiPlayer from "audio/midiPlayer";

interface ToolBarProps {
  midiPlayer: MyMidiPlayer;
  isHovering: boolean;
  setIsHovering: (hovering: boolean) => void;
  forceRerender: types.forceRerender;
  horizontalApi: types.IHorizontalApi;
  isFullscreen: boolean;
  setIsFullscreen: (isFullscreen: boolean) => void
}

export default function ToolBar({
  midiPlayer,
  isHovering,
  setIsHovering,
  forceRerender,
  horizontalApi,
  isFullscreen,
  setIsFullscreen
}: ToolBarProps) {
  let opacity = midiPlayer.getIsPlaying() === true ? 0 : 1;
  opacity = isHovering ? 1 : opacity;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        opacity,
        marginTop: -15,
      }}
      className={clsx({ toolbarFullScreen: isFullscreen })}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <ToggleButtonGroup>
        <RestartButton restart={() => {midiPlayer.restart(); forceRerender()}} />
        <PlayButton
          play={midiPlayer.play}
          pause={midiPlayer.pause}
          getIsPlaying={midiPlayer.getIsPlaying}
          forceRerender={forceRerender}
        />
        {window.innerWidth >= 500 && midiPlayer.myTonejs && (
          <VolumeButton
            getVolumeDb={midiPlayer.myTonejs.getVolume}
            changeVolume={midiPlayer.myTonejs.changeVolume}
            forceRerender={forceRerender}
          />
        )}
      </ToggleButtonGroup>
      <ToggleButtonGroup>
        <TempoButton
          getIsPlaying={midiPlayer.getIsPlaying}
          setTempoPercent={midiPlayer.setTempoPercent}
          forceRerender={forceRerender}
        />
        <FileReaderButton
          loadArrayBuffer={midiPlayer.loadArrayBuffer}
          getIsPlaying={midiPlayer.getIsPlaying}
        />

        <SettingsButton
          midiPlayer={midiPlayer}
          forceRerender={forceRerender}
          horizontalApi={horizontalApi}
        />
        <FullScreenButton
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
        />
      </ToggleButtonGroup>
    </div>
  );
}
