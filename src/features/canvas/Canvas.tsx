import React, { useRef, useEffect } from "react";

import { RootState } from "app/rootReducer";
import { useSelector } from "react-redux";

// import { createCanvasBackground } from "./canvasComponents/canvasBackground/CanvasBackground";
import * as flashingColumns from "./canvasComponents/flashingColumns/FlashingColumns";
import * as bottomTiles from "./canvasComponents/bottomTiles/BottomTiles";
import * as flashingBottomTiles from "./canvasComponents/flashingBottomTiles/FlashingBottomTiles";
import * as flashingLightsBottomTiles from "./canvasComponents/flashingLightsBottomTiles/FlashingLightsBottomTiles";
import * as fallingNotes from "./canvasComponents/fallingNotes/FallingNotes";
import * as beatLines from "./canvasComponents/beatLines/BeatLines";
import * as highlighter from "./canvasComponents/highlighter/Highlighter";
import * as mouseEvents from "./canvasComponents/mouseEventHandler/MouseEventHandler";
import { PlayRange } from "features/midiPlayerStatus/types";
import { useIsMobile, useWindow } from "utils/customHooks";
import { KALIMBA_STANDARD_TUNING } from "./constants";
import { convertMidiTickToCanvasHeight } from "./utils";

import * as PIXI from "pixi.js";
import * as types from "types";

interface CanvasProps {
  getCurrentTick: types.IMidiFunctions["getCurrentTick"];
  getTicksPerBeat: types.IMidiFunctions["getTicksPerBeat"];
  ticksPerBeat: number;
  groupedNotes: types.IGroupedNotes[];
  setIsHovering: (hovering: boolean) => void;
  getIsPlaying: types.IMidiFunctions["getIsPlaying"];
}

let PIXI_CANVAS: HTMLDivElement;

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

export default function Canvas({
  getCurrentTick,
  getTicksPerBeat,
  groupedNotes,
  ticksPerBeat,
  setIsHovering,
  getIsPlaying,
}: CanvasProps): JSX.Element {
  const canvasWidth: number = WIDTH >= 800 ? window.innerWidth * 0.75 : WIDTH;
  const canvasHeight: number = (canvasWidth / 16) * 9;
  const noOfNotes: number = Math.max(...Object.values(KALIMBA_STANDARD_TUNING));
  const noteWidth: number = canvasWidth / noOfNotes;

  const playRange: PlayRange = useSelector(
    (state: RootState) => state.midiPlayerStatus.playRange
  );

  let playingNotes: Set<number> = new Set();
  const currentTick = getCurrentTick() || 0;
  groupedNotes.forEach((note: types.IGroupedNotes) => {
    if (currentTick >= note.on && currentTick <= note.off) {
      playingNotes.add(note.x);
    }
  });

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

    beatLines.initBeatLine(app.current);
    beatLines.draw(app.current, currentTick, ticksPerBeat * 4); // to init container, + 1 zIndex
    flashingColumns.initFlashingColumns(noOfNotes, noteWidth, app.current);
    fallingNotes.initFallingNotes(
      // to init container, + 1 zIndex
      groupedNotes,
      noteWidth,
      app.current as PIXI.Application
    );
    bottomTiles.initBottomTiles(noteWidth, 33, noOfNotes, app.current);

    flashingBottomTiles.initFlashingBottomTiles(
      noOfNotes,
      noteWidth,
      app.current
    );
    flashingLightsBottomTiles.initFlashingLightsBottomTiles(
      noOfNotes,
      noteWidth,
      app.current
    );
    app.current.start();
  }, []);

  useEffect(() => {
    fallingNotes.initFallingNotes(
      groupedNotes,
      noteWidth,
      app.current as PIXI.Application
    );
  }, [groupedNotes]);

  useEffect(() => {
    if (!app.current || !currentTick) {
      return;
    }
    const ticksPerBeat = getTicksPerBeat() as number;
    const upperLimit = ticksPerBeat * 4 * 3; // 4 beats, 3 bars
    if (
      !(
        playRange.startTick < currentTick + upperLimit &&
        playRange.endTick > currentTick
      )
    ) {
      // destroy only when highlighter is near current tick
      // maybe a pre-mature optimization
      highlighter.destroy();
      return;
    }
    const endY = convertMidiTickToCanvasHeight(
      playRange.endTick || 0,
      currentTick,
      app.current.screen.height
    );
    const startY = convertMidiTickToCanvasHeight(
      playRange.startTick || 0,
      currentTick,
      app.current.screen.height
    );
    highlighter.initHighlighter(app.current, startY, endY);
  }, [playRange.startTick, playRange.endTick, currentTick]);

  useEffect(() => {
    if (app.current) {
      fallingNotes.draw(
        currentTick,
        app.current.screen.height,
        getTicksPerBeat() as number
      );
      flashingColumns.draw(playingNotes);
      flashingBottomTiles.draw(playingNotes);
      flashingLightsBottomTiles.draw(playingNotes);
      beatLines.draw(app.current, currentTick, ticksPerBeat * 4);
    }
  }, [currentTick]);
  mouseEvents.useMouseEvents(app.current, getCurrentTick, getIsPlaying);

  return (
    <div
      ref={(thisDiv: HTMLDivElement) => {
        PIXI_CANVAS = thisDiv;
      }}
      style={{ background: "black" }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    ></div>
  );
}
