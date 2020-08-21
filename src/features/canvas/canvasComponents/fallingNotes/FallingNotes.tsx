import * as types from "audio/types";
import { KALIMBA_STANDARD_TUNING } from "audio/constants";
import * as PIXI from "pixi.js";
import { CANVAS_SLOW_DOWN_FACTOR } from "../../constants";

interface RectCache {
  [key: number]: PIXI.Graphics;
}

interface FallingNotes {
  rectSprite: PIXI.Sprite;
  on: number;
  off: number;
  height: number;
  x: number;
}

let FALLING_NOTES: FallingNotes[] = [];
let CONTAINER: PIXI.Container;

function initRectangle(width: number, height: number): PIXI.Graphics {
  const rect = new PIXI.Graphics();
  rect.beginFill(0x00e4fc);
  rect.drawRect(0, 0, width, height);
  rect.zIndex = 1;
  rect.endFill();
  return rect;
}
export function initFallingNotes(
  groupedNotes: types.GroupedNotes[],
  noteWidth: number,
  app: PIXI.Application
): FallingNotes[] {
  console.log("Constructing new FallingNotes");
  try {
    CONTAINER.destroy({ children: true, texture: true, baseTexture: true });
  } catch {}
  let container = new PIXI.Container();
  container.zIndex = 1;
  app.stage.addChild(container);
  CONTAINER = container;
  FALLING_NOTES = [];

  const rectHeightCached: RectCache = {};
  groupedNotes.forEach((note) => {
    const on = note.on / CANVAS_SLOW_DOWN_FACTOR;
    const off = note.off / CANVAS_SLOW_DOWN_FACTOR;
    const height = off - on;
    const x = KALIMBA_STANDARD_TUNING[note.noteName] * noteWidth;
    if (!rectHeightCached[height]) {
      const rect = initRectangle(noteWidth, height);
      rectHeightCached[height] = rect;
    }
    // @ts-ignore
    const texture = app.renderer.generateTexture(rectHeightCached[height]);
    const rectSprite = new PIXI.Sprite(texture);
    container.addChild(rectSprite);
    FALLING_NOTES.push({ rectSprite, on, off, height, x });
  });
  Object.values(rectHeightCached).forEach((rect: PIXI.Graphics) => {
    rect.destroy({ children: true, texture: true, baseTexture: true });
  });
  return FALLING_NOTES;
}

export function draw(currentTick: number, canvasHeight: number) {
  FALLING_NOTES.forEach((note: FallingNotes) => {
    const sprite = note.rectSprite;
    if (
      currentTick >= note.on * CANVAS_SLOW_DOWN_FACTOR - 3000 &&
      currentTick <= note.off * CANVAS_SLOW_DOWN_FACTOR
    ) {
      const on = note.on - currentTick / CANVAS_SLOW_DOWN_FACTOR;
      sprite.position.x = note.x;
      sprite.position.y = canvasHeight - on - note.height - 35;
      sprite.visible = true;
      sprite.zIndex = 1;
    } else {
      sprite.visible = false;
    }
  });
}
