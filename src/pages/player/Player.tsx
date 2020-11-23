import React, { useState, useMemo, useEffect, useRef } from "react";

import { Typography } from "@material-ui/core";
import { useFirestore } from "react-redux-firebase";

import LoadingScreen from "features/loadingScreen/LoadingScreen";
import Canvas from "features/canvas/Canvas";
import Toolbar from "features/toolbar/Toolbar";
import ProgressBar from "features/canvas/canvasComponents/progressBar/ProgressBar";

import MyMidiPlayer from "audio/midiPlayer";
import { useParams } from "react-router";

import { useEventListener } from "utils/customHooks";
import { Helmet } from "react-helmet";
// import { FullScreen, useFullScreenHandle } from "react-full-screen";
import useFullscreenStatus from "./fullscreener";
import "./styles.css";

export default function Player(): JSX.Element {
  const [instrumentLoading, setInstrumentLoading] = useState<boolean>(false);
  const [playerStatus, setPlayerStatus] = useState<string>("");
  const midiPlayerRef = useRef<MyMidiPlayer>();
  const [songName, setSongName] = useState<string>("");
  const [artist, setArtist] = useState<string>("");
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isHorizontal, setIsHorizontal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [forceRender, setForceRender] = useState<number>(0); // for re-render on volume change
  const [forceCanvasRender, setForceCanvasRender] = useState<number>(0);
  const maximizableElement = React.useRef(null);
  const [isFullscreen, setIsFullscreen, isError] = useFullscreenStatus(
    maximizableElement
  );
  const urlParams: any = useParams();
  const firestore = useFirestore();

  function forceRerender() {
    setForceRender(forceRender + 1);
  }
  function forceCanvasRerender() {
    setForceCanvasRender(forceCanvasRender + 1);
  }

  const forceRerenderRef = useRef<any>();
  const forceCanvasRerenderRef = useRef<any>();
  const setDownloadProgressRef = useRef<(status: string) => void>(
    (progress: string) => setPlayerStatus(progress)
  );
  forceRerenderRef.current = forceRerender; // reassigning may be slow?
  forceCanvasRerenderRef.current = forceCanvasRerender;

  useEffect(() => {
    const songId: string = urlParams.songId;
    async function initMidiPlayer() {
      const midiPlayer_ = new MyMidiPlayer(
        (progress: string) => {
          setDownloadProgressRef.current(progress);
        },
        setInstrumentLoading,
        () => forceCanvasRerenderRef.current()
      );
      await midiPlayer_.init();
      await midiPlayer_.downloadMidiFromFirebase(songId, forceRerender);
      midiPlayerRef.current = midiPlayer_;
    }
    async function fetchSongDetails() {
      const ref = await firestore.collection("midi").doc(songId);
      const snapshot = await ref.get();
      // please typescript this
      setSongName(snapshot.data()?.filename);
      setArtist(snapshot.data()?.artist);
    }
    initMidiPlayer();
    fetchSongDetails();
    return function cleanup() {
      midiPlayerRef.current?.cleanup();
    };
  }, []);

  const loadingScreenMemo = useMemo(() => {
    return (
      playerStatus !== "" && <LoadingScreen text={playerStatus} />
    );
  }, [instrumentLoading, isLoading, playerStatus]);

  const currentTick = midiPlayerRef.current?.midiPlayer.getCurrentTick();

  const toolbarMemo = useMemo(
    () =>
      midiPlayerRef.current && (
        <Toolbar
          midiPlayer={midiPlayerRef.current}
          isHovering={isHovering}
          setIsHovering={setIsHovering}
          forceRerender={forceRerender}
          horizontalApi={{ isHorizontal, setIsHorizontal }}
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
        />
      ),
    [
      isHovering,
      forceRender,
      midiPlayerRef.current?.getIsPlaying(),
      isFullscreen,
      midiPlayerRef.current?.myTonejs?.getSynthName(),
    ]
  );

  const canvasMemo = useMemo(
    () =>
      midiPlayerRef.current && (
        <Canvas
          midiPlayer={midiPlayerRef.current}
          setIsHovering={setIsHovering}
          getForceRerender={() => forceRerenderRef.current}
          forceRender={forceRender}
          isFullScreen={isFullscreen}
          setIsLoading={setIsLoading}
          isHorizontal={isHorizontal}
        />
      ),
    [
      isLoading,
      midiPlayerRef.current?.midiPlayer.getCurrentTick(),
      forceRender,
      isFullscreen,
      isHorizontal,
    ]
  );
  const progressBarMemo = useMemo(() => {
    const totalTicks = midiPlayerRef.current?.getTotalTicks();
    const songProgress = totalTicks
      ? ((currentTick || 0) / totalTicks) * 100
      : 0;

    return (
      <div>
        {midiPlayerRef.current && (
          <ProgressBar
            songProgress={songProgress}
            skipToTick={midiPlayerRef.current.skipToTick}
            setIsHovering={setIsHovering}
            forceRerender={forceRerender}
            totalTicks={totalTicks || 0}
            isFullScreen={isFullscreen}
            isHovering={isHovering}
            getIsPlaying={midiPlayerRef.current.getIsPlaying}
          />
        )}
      </div>
    );
  }, [currentTick, isHovering, forceRender, isFullscreen]);

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
    // e.preventDefault();
    const currentTick:
      | number
      | undefined = midiPlayerRef.current?.midiPlayer.getCurrentTick();
    const totalTicks = midiPlayerRef.current?.getTotalTicks();
    if (currentTick && totalTicks) {
      let newTick: number = currentTick + e.deltaY / 2;
      const SCROLL_BUFFER: number = 300;
      const withinUpperLimit = newTick + SCROLL_BUFFER < totalTicks;
      const withinLowerLimit = newTick > 0;
      if (withinUpperLimit && withinLowerLimit) {
        midiPlayerRef.current?.skipToTick(newTick);
        forceRerenderRef.current && forceRerenderRef.current();
      }
    }
  });

  return (
    <div className="player">
      {helmentMemo}
      <div ref={maximizableElement}>
        {canvasMemo}
        {progressBarMemo}
        {toolbarMemo}
      </div>
      {songNameMemo}
      {loadingScreenMemo}
    </div>
  );
}
