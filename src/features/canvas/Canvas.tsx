import React, { useRef, useEffect, useState } from "react";

import clsx from "clsx";

import * as canvasBackround from "./canvasComponents/canvasBackground/CanvasBackground";
import * as flashingColumns from "./canvasComponents/flashingColumns/FlashingColumns";
import * as bottomTiles from "./canvasComponents/bottomTiles/BottomTiles";
import * as flashingBottomTiles from "./canvasComponents/flashingBottomTiles/FlashingBottomTiles";
import * as flashingLightsBottomTiles from "./canvasComponents/flashingLightsBottomTiles/FlashingLightsBottomTiles";
import * as fallingNotes from "./canvasComponents/fallingNotes/FallingNotes";
import * as beatLines from "./canvasComponents/beatLines/BeatLines";
import * as highlighter from "./canvasComponents/highlighter/Highlighter";
import * as mouseEvents from "./canvasComponents/mouseEventHandler/MouseEventHandler";
import { PIANO_TUNING } from "audio/constants";
import { convertMidiTickToCanvasHeight } from "./utils";
import MyMidiPlayer from "audio/midiPlayer";

import * as PIXI from "pixi.js";
import * as types from "types";
import { throttle } from "lodash";
import "./styles.css";

interface CanvasProps {
  midiPlayer: MyMidiPlayer;
  setIsHovering: (hovering: boolean) => void;
  getForceRerender: () => types.forceRerender;
  forceRender: number;
  isFullScreen: boolean;
  isHorizontal: boolean;
  setIsLoading: (loading: boolean) => void;
}

let PIXI_CANVAS: HTMLDivElement;

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

let TIMER: NodeJS.Timeout;

// function hideToolBarOnMouseInactive(
//   setIsHovering: (hovering: boolean) => void
// ) {
//   return throttle(() => {
//     clearTimeout(TIMER);
//     setIsHovering(true);
//     const timer = setTimeout(() => setIsHovering(false), 3000);
//     TIMER = timer;
//   }, 1000);
// }
let canvasWidth: number = WIDTH;
let canvasHeight: number = HEIGHT;
const NO_OF_NOTES: number = Math.max(...Object.values(PIANO_TUNING));
const NOTE_WIDTH: number = WIDTH / NO_OF_NOTES;

export default function Canvas({
  midiPlayer,
  setIsHovering,
  getForceRerender,
  forceRender,
  isFullScreen,
  isHorizontal,
  setIsLoading,
}: CanvasProps): JSX.Element {
  const [lastHorizontal, setLastHorizontal] = useState(false);

  let playingNotes: Set<number> = new Set();
  const currentTick = midiPlayer.midiPlayer.getCurrentTick() || 0;
  midiPlayer.groupedNotes.forEach((note: types.IGroupedNotes) => {
    if (currentTick >= note.on && currentTick <= note.off) {
      playingNotes.add(note.x);
    }
  });

  function initCanvasComponents() {
    if (app.current) {
      canvasBackround.initGuideLine(app.current);
      beatLines.initBeatLine(app.current);
      beatLines.draw(app.current, currentTick, midiPlayer.ticksPerBeat * 4); // to init container, + 1 zIndex
      flashingColumns.initFlashingColumns(NO_OF_NOTES, NOTE_WIDTH, app.current);
      fallingNotes.initFallingNotes(
        // to init container, + 1 zIndex
        midiPlayer.groupedNotes,
        NOTE_WIDTH,
        app.current as PIXI.Application,
        setIsLoading
      );
      bottomTiles.initBottomTiles(NOTE_WIDTH, 33, NO_OF_NOTES, app.current);

      flashingBottomTiles.initFlashingBottomTiles(
        NO_OF_NOTES,
        NOTE_WIDTH,
        app.current
      );

      flashingLightsBottomTiles.initFlashingLightsBottomTiles(
        NO_OF_NOTES,
        NOTE_WIDTH,
        app.current
      );
    }
  }

  const app = useRef<PIXI.Application>();
  useEffect(() => {
    console.log("Starting new canvas...");
    app.current = new PIXI.Application({
      width: canvasWidth,
      height: canvasHeight,
      transparent: false,
      antialias: true,
      clearBeforeRender: true,
      // resolution: 1
    });
    PIXI_CANVAS.appendChild(app.current.view);

    app.current.start();
    initCanvasComponents();
    return function cleanup() {
      console.log("Destroying app");
      if (app.current?.view) {
        PIXI_CANVAS.removeChild(app.current.view);
        app.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (isHorizontal && app.current) {
      setLastHorizontal(true);
      if (isFullScreen) {
        app.current?.renderer.resize(window.outerHeight, window.outerWidth);
      } else {
        app.current?.renderer.resize(WIDTH, HEIGHT);
      }
      initCanvasComponents();
    } else {
      if (isHorizontal && !lastHorizontal) {
        // cancel full screen and not horizontal anymore
        initCanvasComponents();
      }
      setLastHorizontal(false);
    }
  }, [isHorizontal, isFullScreen]);

  useEffect(() => {
    fallingNotes.initFallingNotes(
      midiPlayer.groupedNotes,
      NOTE_WIDTH,
      app.current as PIXI.Application,
      setIsLoading
    );
  }, [midiPlayer.groupedNotes]);

  useEffect(() => {
    //highlighter
    const playRange_ = midiPlayer.playRange;
    if (!app.current || !currentTick) {
      return;
    }
    const ticksPerBeat = midiPlayer.ticksPerBeat;
    const upperLimit = ticksPerBeat * 4 * 3; // 4 beats, 3 bars
    if (
      !(
        playRange_.startTick < currentTick + upperLimit &&
        playRange_.endTick > currentTick
      )
    ) {
      // destroy only when highlighter is near current tick
      // maybe a pre-mature optimization
      highlighter.destroy();
      return;
    }
    const endY = convertMidiTickToCanvasHeight(
      midiPlayer.playRange.endTick || 0,
      currentTick,
      app.current.screen.height
    );
    const startY = convertMidiTickToCanvasHeight(
      midiPlayer.playRange.startTick || 0,
      currentTick,
      app.current.screen.height
    );
    highlighter.initHighlighter(app.current, startY, endY);
  }, [forceRender, currentTick]);

  useEffect(() => {
    if (app.current) {
      fallingNotes.draw(
        currentTick,
        app.current.screen.height,
        midiPlayer.ticksPerBeat
      );
      flashingColumns.draw(playingNotes);
      flashingBottomTiles.draw(playingNotes);
      flashingLightsBottomTiles.draw(playingNotes);
      beatLines.draw(app.current, currentTick, midiPlayer.ticksPerBeat * 4);
    }
  }, [currentTick]);

  mouseEvents.useMouseEvents(
    app.current,
    midiPlayer.getCurrentTick,
    midiPlayer.getIsPlaying,
    (playRange: types.PlayRange) => {
      midiPlayer.setPlayRange(playRange.startTick, playRange.endTick);
      getForceRerender()();
    },
    () => {
      midiPlayer.pause();
      getForceRerender()();
    }
  );

  // const throttleMemo = useMemo(
  //   () => hideToolBarOnMouseInactive(setIsHovering),
  //   []
  // );
  return (
    <div
      className={clsx({
        "player-canvas": true,
        "fullscreen-enabled": isFullScreen
      })}
    >
      <div
        ref={(thisDiv: HTMLDivElement) => {
          PIXI_CANVAS = thisDiv;
        }}
        className={clsx({
          horizontal: isHorizontal && isFullScreen,
          vertical: !isFullScreen,
        })}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        // onMouseMove={throttleMemo}
      ></div>
    </div>
  );
}
