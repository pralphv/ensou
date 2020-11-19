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
  isFullScreen: boolean;
  openFullScreen: () => void;
  closeFullScreen: () => void;
  isFullScreening: boolean;
  horizontalApi: types.IHorizontalApi;
}

export default function ToolBar({
  midiPlayer,
  isHovering,
  setIsHovering,
  forceRerender,
  isFullScreen,
  openFullScreen,
  closeFullScreen,
  isFullScreening,
  horizontalApi,
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
      className={clsx({ toolbarFullScreen: isFullScreen })}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <ToggleButtonGroup>
        <RestartButton restart={midiPlayer.restart} />
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
          loadArrayBuffer={midiPlayer.midiPlayer.loadArrayBuffer}
          getIsPlaying={midiPlayer.getIsPlaying}
        />

        <SettingsButton
          midiPlayer={midiPlayer}
          forceRerender={forceRerender}
          horizontalApi={horizontalApi}
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
