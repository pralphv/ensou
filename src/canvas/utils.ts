import myCanvas from "canvas";

export function convertMidiTickToCanvasHeight(
  targetTick: number,
  tick: number
): number {
  return (
    myCanvas.config.coreCanvasHeight -
    (targetTick - tick) / myCanvas.config.canvasNoteScale -
    myCanvas.config.bottomTileHeight
  );
}

export function convertCanvasHeightToMidiTick(y: number, tick: number): number {
  return (
    (myCanvas.config.coreCanvasHeight - myCanvas.config.bottomTileHeight - y) *
      myCanvas.config.canvasNoteScale +
    tick
  );
}
