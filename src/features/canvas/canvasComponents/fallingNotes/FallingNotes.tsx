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

function gradient(from: string, to: string, height: number) {
  const c = document.createElement("canvas");
  c.height = height;
  let ctx = c.getContext("2d") as CanvasRenderingContext2D;
  const grd = ctx.createLinearGradient(0, 0, 0, height);
  grd.addColorStop(0, from);
  grd.addColorStop(1, to);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 100, height);
  const texture = PIXI.Texture.from(c);
  return texture;
}

function initRectangle(width: number, height: number): PIXI.Graphics {
  const rect = new PIXI.Graphics();
  rect.beginTextureFill({ texture: gradient("#63F0FF", "#35D1FC", height) });
  rect.drawRoundedRect(0, 0, width, height, width / 2.5);

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
  app.stage.addChild(container);
  app.stage.setChildIndex(container, 2);
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

export function draw(
  currentTick: number,
  canvasHeight: number,
  ticksPerBeat: number
) {
  const upperLimit = ticksPerBeat * 4 * 3; // assume 4 beats per bar, show 3 bars
  FALLING_NOTES.forEach((note: FallingNotes) => {
    const sprite = note.rectSprite;
    if (
      currentTick >= note.on * CANVAS_SLOW_DOWN_FACTOR - upperLimit &&
      currentTick <= note.off * CANVAS_SLOW_DOWN_FACTOR
    ) {
      const on = note.on - currentTick / CANVAS_SLOW_DOWN_FACTOR;
      sprite.position.x = note.x;
      sprite.position.y = canvasHeight - on - note.height - 35;
      sprite.visible = true;
    } else {
      sprite.visible = false;
    }
  });
}
