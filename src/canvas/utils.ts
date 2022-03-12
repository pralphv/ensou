import myCanvas from "canvas";

export function convertMidiTickToCanvasHeight(
  targetTick: number,
  tick: number
): number {
  // baseline is canvas
  return (
    myCanvas.config.coreCanvasHeight -
    myCanvas.config.bottomTileHeight -
    (targetTick - tick) / myCanvas.config.canvasNoteScale
  );
}

export function convertCanvasHeightToMidiTick(y: number, tick: number): number {
  // baseline is whole screen
  return (
    (myCanvas.app.screen.height -
      myCanvas.config.yCenterCompensate -
      myCanvas.config.bottomTileHeight -
      y) *
      myCanvas.config.canvasNoteScale +
    tick
  );
}
