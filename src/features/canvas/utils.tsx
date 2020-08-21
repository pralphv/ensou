import { CANVAS_SLOW_DOWN_FACTOR } from "./constants";

export function convertMidiTickToCanvasHeight(
  targetTick: number,
  currentTick: number,
  canvasHeight: number
): number {
  return canvasHeight - (targetTick - currentTick) / CANVAS_SLOW_DOWN_FACTOR - 35;
}

export function convertCanvasHeightToMidiTick(
  y: number,
  currentTick: number,
  canvasHeight: number
): number {
  return (canvasHeight -35 - y) * CANVAS_SLOW_DOWN_FACTOR + currentTick;
}
