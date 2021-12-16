import React, { useState, useMemo, useEffect, useRef } from "react";
import clsx from "clsx";

import { Typography } from "@mui/material";
import Divider from "@mui/material/Divider";
import { useFirestore } from "react-redux-firebase";

import LoadingScreen from "features/loadingScreen/LoadingScreen";
import myCanvas from "canvas";
import progressBar from "progressBar";
import Toolbar from "features/toolbar/Toolbar";

import myMidiPlayer from "audio";
import game from "game";
import { useParams } from "react-router";

import { Helmet } from "react-helmet";

import useFullscreenStatus from "./fullscreener";
import "./styles.css";
import midiPlayer from "audio";
import { debounce } from "lodash";

interface ISongMetaData {
  artist: string;
  filename: string;
  instrument: string;
  transcribedBy: string;
  uploader: string;
  date: Date;
}

export default function Player(): JSX.Element {
  const [instrumentLoading, setInstrumentLoading] = useState<boolean>(false);
  const [midiLoading, setMidiLoading] = useState<boolean>(false);
  const [playerStatus, setPlayerStatus] = useState<string>("");
  const [songMetaData, setSongMetaData] = useState<ISongMetaData>();
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isHorizontal, setIsHorizontal] = useState<boolean>(false);
  const [forceRender, setForceRender] = useState<number>(0); // for re-render on volume change
  const maximizableElement = React.useRef(null);
  const [isFullscreen, setIsFullscreen, isError] =
    useFullscreenStatus(maximizableElement);
  const urlParams: any = useParams();
  const firestore = useFirestore();

  function forceRerender() {
    setForceRender(forceRender + 1);
  }

  const forceRerenderRef = useRef<any>();
  forceRerenderRef.current = forceRerender; // reassigning may be slow?

  useEffect(() => {
    const songId: string = urlParams.songId;
    async function initMidiPlayer() {
      myMidiPlayer.on("willDownloadMidi", () => {
        setPlayerStatus("Downloading Midi...");
        setMidiLoading(true);
      });
      myMidiPlayer.on("downloadedMidi", () => {
        setPlayerStatus("");
        setMidiLoading(false);
      });
      myMidiPlayer.on("error", () => {
        // alert("Unknown error: could not load song");
        setPlayerStatus("");
        setMidiLoading(false);
      });
      // download midi first
      await myMidiPlayer.downloadMidiFromFirebase(songId);

      myMidiPlayer.on("actioned", () => {
        forceRerenderRef.current();
      });
      myMidiPlayer.on("willSetTone", () => setPlayerStatus("Setting tone..."));
      myMidiPlayer.on("toneSet", () => setPlayerStatus(""));
      myMidiPlayer.on("willMount", () => {
        setInstrumentLoading(true);
        setPlayerStatus("0%"); // reset
      });
      myMidiPlayer.on("mounted", () => {
        setInstrumentLoading(false);
        setPlayerStatus("");
      });
      myMidiPlayer.on("import", () => {
        setPlayerStatus("Importing...");
      });
      myMidiPlayer.on("imported", () => {
        // need to rebuild notes here assuming this is import midi
        setPlayerStatus("");
      });
      myMidiPlayer.on("downloadingSamples", (status: string) => {
        setPlayerStatus(status);
      });
      // await myMidiPlayer.init();
      // myMidiPlayer.myTonejs?.on("actioned", () => forceRerenderRef.current());

      myCanvas.on(
        "pointermove",
        debounce(() => {
          setIsHovering(false);
        }, 2000)
      );
    }
    async function fetchSongDetails() {
      const ref = await firestore.collection("midi").doc(songId);
      const snapshot = await ref.get();
      const data = snapshot.data();
      if (data) {
        data.date = new Date(data?.date?.seconds * 1000);
        setSongMetaData(data as ISongMetaData);
      }
    }
    initMidiPlayer();
    fetchSongDetails();
    return function cleanup() {
      myCanvas.disconnectHTML();
      progressBar.disconnectHTML();
      midiPlayer.stop();
      midiPlayer.disablePracticeMode();
    };
  }, []);

  const loadingScreenMemo = useMemo(() => {
    return (
      (midiLoading || instrumentLoading || playerStatus !== "") && (
        <LoadingScreen text={playerStatus} />
      )
    );
  }, [midiLoading, instrumentLoading, playerStatus]);

  const canvasMemo = useMemo(
    () => (
      <div
        className={clsx({
          "player-canvas": true,
          "fullscreen-enabled": isFullscreen,
        })}
      >
        <div
          ref={(thisDiv: HTMLDivElement) => {
            if (thisDiv) {
              // undefined on cleanup
              myCanvas.connectHTML(thisDiv);
            }
          }}
          className={clsx({
            horizontal: isHorizontal && isFullscreen,
            vertical: !isFullscreen,
          })}
          onMouseEnter={handleOnEnter}
          onMouseLeave={handleOnLeave}
        ></div>
      </div>
    ),
    [
      isFullscreen,
      // isHorizontal,
    ]
  );
  const progressBarMemo = useMemo(
    () => (
      <div className="progress-bar">
        <div
          ref={(thisDiv: HTMLDivElement) => {
            if (thisDiv) {
              // undefined on cleanup
              progressBar.connectHTML(thisDiv);
            }
          }}
          onMouseEnter={handleOnEnter}
          onMouseLeave={handleOnLeave}
        ></div>
      </div>
    ),
    [isFullscreen]
  );
  const toolbarMemo = useMemo(() => {
    let opacity = myMidiPlayer.getIsPlaying() ? 0 : 1;
    opacity = isHovering ? 1 : opacity;

    return (
      <div
        style={{
          opacity,
        }}
        className={clsx({ toolbarFullScreen: isFullscreen })}
        onMouseEnter={handleOnEnter}
        onMouseLeave={handleOnLeave}
      >
        <Toolbar
          // horizontalApi={{ isHorizontal, setIsHorizontal }}
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
        />
      </div>
    );
  }, [
    isHovering,
    forceRender,
    isFullscreen,
    // midiPlayerRef.current?.myTonejs?.getSynthName(),
  ]);

  const songNameMemo = useMemo(
    () => (
      <div style={{ paddingLeft: "1%" }}>
        <Typography variant="h6">
          {songMetaData?.filename} - {songMetaData?.artist}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Transcribed By: {songMetaData?.transcribedBy} •{" "}
          {songMetaData?.date.toLocaleString("default", {
            day: "numeric",
            year: "numeric",
            month: "long",
          })}
        </Typography>
        <Divider style={{ marginTop: "8px", marginBottom: "8px" }} />
        <Typography variant="body2">{songMetaData?.uploader}</Typography>
      </div>
    ),
    [songMetaData]
  );

  const helmentMemo = useMemo(
    () => (
      <Helmet>
        <title>{`${songMetaData?.filename} by ${songMetaData?.artist}`}</title>
        <meta
          name="description"
          content={`${songMetaData?.filename} by ${songMetaData?.artist} with free online MIDI player. Practice piano without downloading software with Ensou.`}
        />
      </Helmet>
    ),
    [songMetaData]
  );

  function handleOnEnter() {
    setIsHovering(true);
    progressBar.hide(false);
  }

  function handleOnLeave() {
    setIsHovering(false);
    if (myMidiPlayer.isPlaying) {
      progressBar.hide();
    }
  }

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
