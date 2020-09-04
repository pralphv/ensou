import { useEffect, useRef } from "react";

import { useDispatch } from "react-redux";
import * as PIXI from "pixi.js";

import { setPlayRange } from "features/midiPlayerStatus/midiPlayerStatusSlice";
import { PlayRange } from "features/midiPlayerStatus/types";
import { convertCanvasHeightToMidiTick } from "../../utils";

export function useMouseEvents(
  app: PIXI.Application | undefined,
  getCurrentTick: () => number | undefined
) {
  const dispatch = useDispatch();
  const lastClickedTick = useRef<number>(0);
  const isShift = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);

  function handleKeyDownListener(e: any) {
    if (e.shiftKey) {
      isShift.current = true;
    }
  }

  function handleKeyUpListener(e: any) {
    if (e.key === "Shift") {
      isShift.current = false;
    }
  }
  useEffect(() => {
    if (!app) {
      return;
    }
    window.addEventListener("keydown", handleKeyDownListener, false);
    window.addEventListener("keyup", handleKeyUpListener, false);

    const interaction = new PIXI.InteractionManager(app.renderer);
    interaction.on("pointermove", (e: PIXI.InteractionEvent) => {
      if (isDraggingRef.current) {
        const y: number = e.data.global.y;
        let tick: number = convertCanvasHeightToMidiTick(
          y,
          getCurrentTick() || 0,
          app.screen.height
        );
        const newIsLarger: boolean = tick >= lastClickedTick.current;
        const startTick = newIsLarger ? lastClickedTick.current : tick;
        let endTick = newIsLarger ? tick : lastClickedTick.current;
        // prevent small ranges due to slow clicks
        endTick = endTick - startTick > 10 ? endTick : startTick;
        dispatch(setPlayRange({ startTick, endTick }));
      }
    });
    interaction.on("pointerdown", (e: PIXI.InteractionEvent) => {
      isDraggingRef.current = true;
      const y: number = e.data.global.y;
      let tick: number = convertCanvasHeightToMidiTick(
        y,
        getCurrentTick() || 0,
        app.screen.height
      );

      const startTick: number = isShift.current
        ? Math.min(lastClickedTick.current, tick)
        : tick;
      const endTick: number = isShift.current
        ? Math.max(lastClickedTick.current, tick)
        : tick;
      const newRange: PlayRange = { startTick, endTick };
      dispatch(setPlayRange(newRange));

      if (!isShift.current) {
        // for multi shift clicking
        lastClickedTick.current = convertCanvasHeightToMidiTick(
          y,
          getCurrentTick() || 0,
          app.screen.height
        );
      }
    });
    interaction.on("pointerup", (e: PIXI.InteractionEvent) => {
      isDraggingRef.current = false;
    });
    return () => {
      interaction.destroy();
      window.removeEventListener("keydown", handleKeyDownListener, false);
      window.removeEventListener("keyup", handleKeyUpListener, false);
    };
  }, [app, dispatch, getCurrentTick]);
}
