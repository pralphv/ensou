import { CANVAS_SLOW_DOWN_FACTOR } from "./constants";
import { BOTTOM_TILE_HEIGHT } from "features/canvas/constants";

export function convertMidiTickToCanvasHeight(
  targetTick: number,
  currentTick: number,
  canvasHeight: number
): number {
  return (
    canvasHeight -
    (targetTick - currentTick) / CANVAS_SLOW_DOWN_FACTOR -
    BOTTOM_TILE_HEIGHT
  );
}

export function convertCanvasHeightToMidiTick(
  y: number,
  currentTick: number,
  canvasHeight: number
): number {
  // forgot what 50 is
  return (
    (canvasHeight - BOTTOM_TILE_HEIGHT - y) * CANVAS_SLOW_DOWN_FACTOR +
    currentTick
  );
}
