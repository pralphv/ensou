import React, { useRef, useMemo, useEffect } from "react";

import { RootState } from "app/rootReducer";
import { useSelector, useDispatch } from "react-redux";

import * as types from "audio/types";
import { createCanvasBackground } from "./canvasComponents/canvasBackground/CanvasBackground";
import * as flashingColumns from "./canvasComponents/flashingColumns/FlashingColumns";
import * as bottomTiles from "./canvasComponents/bottomTiles/BottomTiles";
import * as flashingBottomTiles from "./canvasComponents/flashingBottomTiles/FlashingBottomTiles";
import * as flashingLightsBottomTiles from "./canvasComponents/flashingLightsBottomTiles/FlashingLightsBottomTiles";
import * as fallingNotes from "./canvasComponents/fallingNotes/FallingNotes";
import * as beatLines from "./canvasComponents/beatLines/BeatLines";
import * as highlighter from "./canvasComponents/highlighter/Highlighter";
import * as mouseEvents from "./canvasComponents/mouseEventHandler/MouseEventHandler";
import { PlayRange } from "features/midiPlayerStatus/types";
import { useIsMobile, useWindow, useStateToRef } from "utils/customHooks";
import { KALIMBA_STANDARD_TUNING } from "./constants";
import { convertMidiTickToCanvasHeight } from "./utils";

import * as PIXI from "pixi.js";

interface CanvasProps {
  getCurrentTick: () => number | undefined;
  ticksPerBeat: number;
  groupedNotes: types.GroupedNotes[];
  totalTicks: number;
  setIsHovering: (hovering: boolean) => void;
}

let APP: PIXI.Application;
let PIXI_CANVAS: HTMLDivElement;

export default function Canvas({
  getCurrentTick,
  groupedNotes,
  ticksPerBeat,
  totalTicks,
  setIsHovering,
}: CanvasProps): JSX.Element {
  const isMobile: boolean = useIsMobile();
  const { width, height } = useWindow();
  const maxWidth: number = window.screen.width * 0.75;

  let canvasWidth: number = Math.min(maxWidth);
  const canvasHeight: number = isMobile
    ? height * 0.92
    : (canvasWidth / 16) * 9;
  const noOfNotes: number = Math.max(...Object.values(KALIMBA_STANDARD_TUNING));
  const noteWidth: number = canvasWidth / noOfNotes;

  const playRange: PlayRange = useSelector(
    (state: RootState) => state.midiPlayerStatus.playRange
  );
  const canvasHeightRef = useStateToRef(canvasHeight);
  const dispatch = useDispatch();

  let playingNotes: Set<number> = new Set();
  let playingNotesArray: number[] = [];
  const currentTick = getCurrentTick() || 0;
  groupedNotes.forEach((note: types.GroupedNotes) => {
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
    APP = app.current;
  }, []);

  useEffect(() => {
    fallingNotes.initFallingNotes(
      groupedNotes,
      noteWidth,
      app.current as PIXI.Application
    );
  }, [groupedNotes, canvasWidth]);

  useEffect(() => {
    if (!app.current || !currentTick) {
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
  }, [playRange.startTick, playRange.endTick, currentTick, canvasWidth]);

  useEffect(() => {
    if (app.current) {
      fallingNotes.draw(currentTick, app.current.screen.height);
      flashingColumns.draw(playingNotes);
      flashingBottomTiles.draw(playingNotes);
      flashingLightsBottomTiles.draw(playingNotes);
      beatLines.draw(app.current, currentTick, ticksPerBeat * 4);
    }
  }, [currentTick, canvasWidth]);
  mouseEvents.useMouseEvents(app.current, getCurrentTick);

  return (
    <div
      ref={(thisDiv: HTMLDivElement) => {
        PIXI_CANVAS = thisDiv;
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    ></div>
  );
}
