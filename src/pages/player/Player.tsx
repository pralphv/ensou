import React, { useState, useMemo, useEffect, useRef } from "react";

import { Typography } from "@material-ui/core";
import { useFirestore } from "react-redux-firebase";

import LoadingScreen from "features/loadingScreen/LoadingScreen";
import Canvas from "features/canvas/Canvas";
import Toolbar from "features/toolbar/Toolbar";
import ProgressBar from "features/canvas/canvasComponents/progressBar/ProgressBar";

import useMidiData from "audio/midiData";
import * as types from "types";
import { useParams } from "react-router";

import { storageRef } from "firebaseApi/firebase";
import { useEventListener } from "utils/customHooks";
import { Helmet } from "react-helmet";
import { FullScreen, useFullScreenHandle } from "react-full-screen";

async function downloadMidi(
  loadArrayBuffer: (blob: XMLHttpRequest["response"]) => void,
  fileName: string,
  onLoad: () => void,
  onError: () => void
) {
  const midiRef = storageRef.child("midi").child(fileName);
  const url = await midiRef.getDownloadURL();
  const xhr = new XMLHttpRequest();
  xhr.responseType = "arraybuffer";
  xhr.onload = () => {
    const blob = xhr.response;
    loadArrayBuffer(blob);
    onLoad();
    console.log("File Loaded");
  };
  xhr.onerror = () => {
    // probably cors
    onError();
  };
  xhr.open("GET", url);
  xhr.send();
  return true;
}

export default function Player(): JSX.Element {
  const [midiFunctions, groupedNotes]: [
    types.IMidiFunctions,
    types.IGroupedNotes[]
  ] = useMidiData();
  const [songName, setSongName] = useState<string>("");
  const [artist, setArtist] = useState<string>("");
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [forceRender, setForceRender] = useState<number>(0); // for re-render on volume change
  const urlParams: any = useParams();
  const firestore = useFirestore();
  const fullScreen = useFullScreenHandle();
  useEffect(() => {
    const songId: string = urlParams.songId;
    async function download() {
      setIsLoading(true);
      await downloadMidi(
        midiFunctions.loadArrayBuffer,
        `${songId}.mid`,
        () => {
          // on success
          // setIsLoading(false) is in initFallingNotes
          forceRerender();
          console.log("Finished downloading");
        },
        () => {
          // on error
          setIsLoading(false);
          alert("Unknown error: unable to download MIDI");
        }
      );
    }
    async function fetchSongDetails() {
      const ref = await firestore.collection("midi").doc(songId);
      const snapshot = await ref.get();
      // please typescript this
      setSongName(snapshot.data()?.filename);
      setArtist(snapshot.data()?.artist);
    }
    download();
    fetchSongDetails();
  }, []);

  const loadingScreenMemo = useMemo(() => {
    const progress = `${Math.floor(midiFunctions.downloadProgress * 100)}%`;
    return (
      (midiFunctions.instrumentLoading || isLoading) && (
        <LoadingScreen text={progress} />
      )
    );
  }, [
    midiFunctions.instrumentLoading,
    isLoading,
    midiFunctions.downloadProgress,
  ]);

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
        metronomeApi={midiFunctions.metronomeApi}
        loopApi={midiFunctions.loopApi}
        tempoApi={midiFunctions.tempoApi}
        isFullScreen={fullScreen.active}
        openFullScreen={fullScreen.enter}
        closeFullScreen={fullScreen.exit}
        isFullScreening={fullScreen.active}
        samplerSourceApi={midiFunctions.samplerSourceApi}
        sampleApi={midiFunctions.sampleApi}
        audioSettingsApi={midiFunctions.audioSettingsApi}
      />
    ),
    [
      isHovering,
      forceRender,
      midiFunctions.getIsPlaying(),
      // midiFunctions.soundEffect.getIsSoundEffect(),
      fullScreen.active,
      midiFunctions.audioSettingsApi.getSynthName(),
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
        playRangeApi={midiFunctions.playRangeApi}
        getForceRerender={() => forceRerenderRef.current}
        forceRender={forceRender}
        isFullScreen={fullScreen.active}
        pause={midiFunctions.pause}
        setIsLoading={setIsLoading}
      />
    ),
    [isLoading, currentTick, forceRender, fullScreen.active]
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
          isFullScreen={fullScreen.active}
        />
      ) : (
        <div style={{ height: 32.5 }}></div>
      ),
    [currentTick, isHovering, forceRender, fullScreen.active]
  );

  const fullScreenMemo = useMemo(
    () => (
      <FullScreen handle={fullScreen}>
        {canvasMemo}
        {progressBarMemo}
        {toolbarMemo}
      </FullScreen>
    ),
    [currentTick, isHovering, forceRender, fullScreen.active, isHovering]
  );

  const songNameMemo = useMemo(
    () => (
      <Typography variant="h6" style={{ paddingLeft: "1%" }}>
        {songName}
      </Typography>
    ),
    [songName]
  );

  const helmentMemo = useMemo(
    () => (
      <Helmet>
        <title>
          {songName} by {artist}
        </title>
        <meta
          name="description"
          content={`${songName} by ${artist} with free online MIDI player. Practice piano without downloading software with Ensou.`}
        />
      </Helmet>
    ),
    [artist]
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
      {helmentMemo}
      {fullScreenMemo}
      {songNameMemo}
      {loadingScreenMemo}
    </div>
  );
}
