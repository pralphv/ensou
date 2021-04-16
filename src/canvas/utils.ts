import myCanvas from "canvas";
import myMidiPlayer from "audio";

export function convertMidiTickToCanvasHeight(targetTick: number): number {
  return (
    myCanvas.app.screen.height -
    (targetTick - myMidiPlayer.getCurrentTick()) /
      myCanvas.config.canvasSlowDownFactor -
    myCanvas.config.bottomTileHeight
  );
}

export function convertCanvasHeightToMidiTick(y: number): number {
  return (
    (myCanvas.app.screen.height - myCanvas.config.bottomTileHeight - y) *
      myCanvas.config.canvasSlowDownFactor +
    myMidiPlayer.getCurrentTick()
  );
}
