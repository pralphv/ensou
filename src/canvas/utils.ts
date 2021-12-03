import myCanvas from "canvas";
import { Transport } from "tone";

export function convertMidiTickToCanvasHeight(targetTick: number): number {
  return (
    myCanvas.app.screen.height -
    (targetTick - Transport.ticks) / myCanvas.config.canvasNoteScale -
    myCanvas.config.bottomTileHeight
  );
}

export function convertCanvasHeightToMidiTick(y: number): number {
  return (
    (myCanvas.app.screen.height - myCanvas.config.bottomTileHeight - y) *
      myCanvas.config.canvasNoteScale +
    Transport.ticks
  );
}
