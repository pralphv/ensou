import myCanvas from "canvas";

export function convertMidiTickToCanvasHeight(targetTick: number, currentTick: number): number {
  return (
    myCanvas.app.screen.height -
    (targetTick - currentTick) /
    myCanvas.config.canvasNoteScale -
    myCanvas.config.bottomTileHeight
  );
}

export function convertCanvasHeightToMidiTick(y: number, currentTick: number): number {
  return (
    (myCanvas.app.screen.height - myCanvas.config.bottomTileHeight - y) *
    myCanvas.config.canvasNoteScale +
    currentTick
  );
}
