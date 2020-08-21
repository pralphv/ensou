import React, { useState, useEffect, useMemo } from "react";

import { Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import { useHotkeys } from "react-hotkeys-hook";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "app/rootReducer";

import LoadingScreen from "features/loadingScreen/LoadingScreen";
import LoadingSpinner from "features/loadingSpinner/LoadingSpinner";
import { useIsMobile, useWindow } from "utils/customHooks";
import Canvas from "features/canvas/Canvas";
import Toolbar from "features/toolbar/Toolbar";
import FileReader from "features/fileReader/FileReader";
import HotKeys from "features/hotKeys/HotKeys";
import ProgressBar from "features/canvas/canvasComponents/progressBar/ProgressBar";

import useMidiData from "audio/midiData";
import * as types from "audio/types";
import { Player } from "midi-player-js";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    height: "200px",
  },
  width: {
    width: "250px",
  },
  paper: {
    padding: theme.spacing(2),
    cursor: "pointer",
    "&:hover": {
      background: "#353535",
    },
  },
}));

export default function Interface(): JSX.Element {
  const [getMidiPlayer, midiFunctions, groupedNotes]: [
    () => Player | undefined,
    types.MidiFunctions,
    types.GroupedNotes[]
  ] = useMidiData();
  const songName: string = useSelector(
    (state: RootState) => state.fileName.songName
  );
  const isPlaying: boolean = useSelector(
    (state: RootState) => state.midiPlayerStatus.isPlaying
  );
  const midiPlayer = getMidiPlayer();
  const classes = useStyles();
  const isMobile: boolean = useIsMobile();
  const { width, height } = useWindow();
  const loading: boolean = false;
  const loadingScreenMemo = useMemo(() => <LoadingScreen />, []);
  const fileReaderMemo = useMemo(
    () => <FileReader loadArrayBuffer={midiFunctions.loadArrayBuffer} />,
    []
  );
  const currentTick = midiFunctions.getCurrentTick();
  const songRemaining = midiFunctions.getSongPercentRemaining();
  const toolbarMemo = useMemo(
    () => (
      <Toolbar
        play={midiFunctions.play}
        pause={midiFunctions.pause}
        restart={midiFunctions.restart}
        isPlaying={isPlaying}
      />
    ),
    [isPlaying]
  );
  const canvasMemo = useMemo(
    () => (
      <Canvas
        getCurrentTick={midiFunctions.getCurrentTick}
        groupedNotes={groupedNotes}
        ticksPerBeat={midiFunctions.getTicksPerBeat() || 0}
        totalTicks={midiFunctions.getTotalTicks() || 0}
      />
    ),
    [JSON.stringify(groupedNotes), currentTick]
  );
  const progressBarMemo = useMemo(
    () => (
      <ProgressBar
        songRemaining={songRemaining || 1}
        skipToPercent={midiFunctions.skipToPercent}
        isPlaying={isPlaying}
      />
    ),
    [songRemaining, isPlaying]
  );

  return (
    <div>
      {loadingScreenMemo}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div>
          {canvasMemo}
          {progressBarMemo}
          {toolbarMemo}
          {fileReaderMemo}
          <Typography>{songName}</Typography>
        </div>
      )}
    </div>
  );
}
