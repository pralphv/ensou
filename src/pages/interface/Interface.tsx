import React, { useState, useMemo, useEffect, useRef } from "react";

import { Grid, makeStyles, Typography } from "@material-ui/core";
import { useSelector } from "react-redux";
import { RootState } from "app/rootReducer";
import { useFirestore } from "react-redux-firebase";

import LoadingScreen from "features/loadingScreen/LoadingScreen";
import LoadingSpinner from "features/loadingSpinner/LoadingSpinner";
import { useIsMobile, useWindow } from "utils/customHooks";
import Canvas from "features/canvas/Canvas";
import Toolbar from "features/toolbar/Toolbar";
import FileReader from "features/fileReader/FileReader";
import ProgressBar from "features/canvas/canvasComponents/progressBar/ProgressBar";

import useMidiData from "audio/midiData";
import * as types from "types";
import { useParams } from "react-router";

import { storageRef } from "firebaseApi/firebase";
import { useEventListener, useStateToRef } from "utils/customHooks";

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

async function downloadMidi(
  loadArrayBuffer: (blob: XMLHttpRequest["response"]) => void,
  fileName: string
) {
  const midiRef = storageRef.child("midi").child(fileName);
  const url = await midiRef.getDownloadURL();
  const xhr = new XMLHttpRequest();
  xhr.responseType = "arraybuffer";
  xhr.onload = () => {
    const blob = xhr.response;
    loadArrayBuffer(blob);
    console.log("File Loaded");
  };
  xhr.open("GET", url);
  xhr.send();
  return true;
}

export default function Interface(): JSX.Element {
  const [midiFunctions, groupedNotes]: [
    types.IMidiFunctions,
    types.IGroupedNotes[]
  ] = useMidiData();
  const [songName, setSongName] = useState<string>("");
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [forceRender, setForceRender] = useState<number>(0); // for re-render on volume change

  const instrumentLoading: boolean = useSelector(
    (state: RootState) => state.midiPlayerStatus.instrumentLoading
  );
  const urlParams: any = useParams();
  const firestore = useFirestore();

  // const classes = useStyles();
  // const isMobile: boolean = useIsMobile();
  // const { width, height } = useWindow();
  // const loading: boolean = false;
  useEffect(() => {
    const songId: string = urlParams.songId;
    async function download() {
      await downloadMidi(midiFunctions.loadArrayBuffer, `${songId}.mid`);
    }
    async function fetchSongDetails() {
      const ref = await firestore.collection("midi").doc(songId);
      const snapshot = await ref.get();
      setSongName(snapshot.data()?.filename);
    }
    download();
    fetchSongDetails();
  }, []);

  const loadingScreenMemo = useMemo(
    () => instrumentLoading && <LoadingScreen />,
    [instrumentLoading]
  );

  const x = useMemo(
    () => <FileReader loadArrayBuffer={midiFunctions.loadArrayBuffer} />,
    []
  );
  const currentTick = midiFunctions.getCurrentTick();

  function forceRerender() {
    setForceRender(forceRender + 1);
  }
  const forceRerenderRef = useRef<any>();
  forceRerenderRef.current = forceRerender; // reassigning may be slow?

  const toolbarMemo = useMemo(
    () => (
      <Toolbar
        play={midiFunctions.play}
        pause={midiFunctions.pause}
        restart={midiFunctions.restart}
        isHovering={isHovering}
        setIsHovering={setIsHovering}
        changeVolume={midiFunctions.changeVolume}
        getVolumeDb={midiFunctions.getVolumeDb}
        forceRerender={forceRerender}
        loadArrayBuffer={midiFunctions.loadArrayBuffer}
        getIsPlaying={midiFunctions.getIsPlaying}
        soundEffect={midiFunctions.soundEffect}
      />
    ),
    [
      isHovering,
      forceRender,
      midiFunctions.getIsPlaying(),
      midiFunctions.soundEffect.getIsSoundEffect(),
    ]
  );

  const canvasMemo = useMemo(
    () => (
      <Canvas
        getCurrentTick={midiFunctions.getCurrentTick}
        getTicksPerBeat={midiFunctions.getTicksPerBeat}
        groupedNotes={groupedNotes}
        ticksPerBeat={midiFunctions.getTicksPerBeat() || 0}
        setIsHovering={setIsHovering}
        getIsPlaying={midiFunctions.getIsPlaying}
      />
    ),
    [currentTick, forceRender]
  );
  const totalTicks = midiFunctions.getTotalTicks();
  const songProgress = totalTicks ? ((currentTick || 0) / totalTicks) * 100 : 0;
  const progressBarMemo = useMemo(
    () =>
      !midiFunctions.getIsPlaying() || isHovering ? (
        <ProgressBar
          songProgress={songProgress}
          skipToTick={midiFunctions.skipToTick}
          setIsHovering={setIsHovering}
          forceRerender={forceRerender}
          totalTicks={totalTicks || 0}
        />
      ) : (
        <div style={{ height: 32.5 }}></div>
      ),
    [currentTick, isHovering, forceRender]
  );

  const songNameMemo = useMemo(
    () => (
      <Typography variant="h6" style={{ paddingLeft: "1%" }}>
        {songName}
      </Typography>
    ),
    [songName]
  );

  useEventListener("wheel", (e) => {
    // scroll up and down
    const currentTick: number | undefined = midiFunctions.getCurrentTick();
    const totalTicks = midiFunctions.getTotalTicks();
    if (currentTick && totalTicks) {
      let newTick: number = currentTick + e.deltaY / 2;
      const SCROLL_BUFFER: number = 300;
      const withinUpperLimit = newTick + SCROLL_BUFFER < totalTicks;
      const withinLowerLimit = newTick > 0;
      if (withinUpperLimit && withinLowerLimit) {
        midiFunctions.skipToTick(newTick);
        forceRerenderRef.current && forceRerenderRef.current();
      }
    }
  });

  return (
    <div
      style={{ width: "100vw", left: 0, position: "absolute", padding: "0.5%" }}
    >
      {canvasMemo}
      {progressBarMemo}
      {toolbarMemo}
      {songNameMemo}
      {loadingScreenMemo}
    </div>
  );
}
