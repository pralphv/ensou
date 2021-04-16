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
  isFullscreen: boolean;
  setIsFullscreen: (isFullscreen: boolean) => void;
}

export default function ToolBar({
  isFullscreen,
  setIsFullscreen,
}: ToolBarProps) {
  return (
    <div className="toolbar">
      <ToggleButtonGroup>
        <RestartButton />
        <PlayButton />
        {window.innerWidth >= 500 && <VolumeButton />}
      </ToggleButtonGroup>
      <ToggleButtonGroup>
        <TempoButton />
        <FileReaderButton />
        <SettingsButton />
        <FullScreenButton
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
        />
      </ToggleButtonGroup>
    </div>
  );
}
