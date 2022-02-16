import React from "react";
import { ToggleButtonGroup } from "@mui/material";

import PlayButton from "./toolbarComponents/PlayButton";
import VolumeButton from "./toolbarComponents/VolumeButton";
import FileReaderButton from "./toolbarComponents/FileReaderButton";
import TempoButton from "./toolbarComponents/TempoButton";
import RestartButton from "./toolbarComponents/RestartButton";
import SettingsButton from "./toolbarComponents/SettingsButton";
import FullScreenButton from "./toolbarComponents/FullScreenButton";
import PracticeModeButton from "./toolbarComponents/PracticeModeButton";
import MusicNotesToggleButton from "./toolbarComponents/MusicNotesToggleButton";
import FpsButton from "./toolbarComponents/FpsButton";
import LoopButton from "./toolbarComponents/LoopButton";
import "./styles.css";

interface ToolBarProps {
  isFullscreen: boolean;
  setIsFullscreen: (isFullscreen: boolean) => void;
}

export default function ToolBar({
  isFullscreen,
  setIsFullscreen,
}: ToolBarProps) {
  const isMobile = window.innerWidth <= 500 || window.innerHeight <= 500;
  const buttons = !(isMobile && isFullscreen)
    ? [
        <TempoButton key="tempo" />,
        <FileReaderButton key="filereader" />,
        <MusicNotesToggleButton key="musicnote" />,
        <PracticeModeButton key="practiceMode" />,
        <LoopButton key="loop" />,
        <FpsButton key="fps" />,
        <SettingsButton key="settings" />,
      ]
    : [];
  buttons.push(
    <FullScreenButton
      isFullscreen={isFullscreen}
      setIsFullscreen={setIsFullscreen}
      key="fullScreen"
    />
  );

  return (
    <div className="toolbar">
      <ToggleButtonGroup>
        <RestartButton />
        <PlayButton />
        {!isMobile && <VolumeButton />}
      </ToggleButtonGroup>
      <ToggleButtonGroup>{buttons.map((button) => button)}</ToggleButtonGroup>
    </div>
  );
}
