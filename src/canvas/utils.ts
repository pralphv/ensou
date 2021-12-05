import myCanvas from "canvas";

export function convertMidiTickToCanvasHeight(targetTick: number, tick: number): number {
  return (
    myCanvas.app.screen.height -
    (targetTick - tick) / myCanvas.config.canvasNoteScale -
    myCanvas.config.bottomTileHeight
  );
}

export function convertCanvasHeightToMidiTick(y: number, tick: number): number {
  return (
    (myCanvas.app.screen.height - myCanvas.config.bottomTileHeight - y) *
      myCanvas.config.canvasNoteScale +
    tick
  );
}
