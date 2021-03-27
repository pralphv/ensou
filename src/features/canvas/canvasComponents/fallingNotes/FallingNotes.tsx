import * as types from "audio/types";
import { PIANO_TUNING } from "audio/constants";
import * as PIXI from "pixi.js";
import { CANVAS_SLOW_DOWN_FACTOR } from "../../constants";
import { BOTTOM_TILE_HEIGHT } from "features/canvas/constants";

interface IPianoNoteXMap {
  [note: string]: IPianoNote;
}

interface IPianoNote {
  width: number;
  x: number;
}

function createPianoNoteXMap(whiteKeyWidth: number): IPianoNoteXMap {
  const blackKeyWidth = whiteKeyWidth * 0.55;
  let x: number = 0;
  let lastI: number; // to prevent duplicate notes from b and #
  let pianoNoteXMap: IPianoNoteXMap = {};
  Object.entries(PIANO_TUNING).forEach(([key, i]: [string, number]) => {
    const isBlackKey = key.includes("#") || key.includes("b");
    if (isBlackKey) {
      pianoNoteXMap[key] = { width: blackKeyWidth, x: x - blackKeyWidth / 2 };
    } else {
      pianoNoteXMap[key] = { width: whiteKeyWidth, x };
    }
    if (!isBlackKey && i !== lastI) {
      x += whiteKeyWidth;
    }
    lastI = i;
  });
  return pianoNoteXMap;
}

interface RectCache {
  [key: string]: PIXI.Graphics;
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

function initRectangle(
  width: number,
  height: number,
  color1: string,
  color2: string
): PIXI.Graphics {
  const rect = new PIXI.Graphics();
  rect.beginTextureFill({ texture: gradient(color1, color2, height) });
  rect.drawRoundedRect(0, 0, width, height, width / 2.5);
  rect.endFill();
  return rect;
}

export function initFallingNotes(
  groupedNotes: types.GroupedNotes[],
  noteWidth: number,
  app: PIXI.Application,
  setIsLoading: (loading: boolean) => void,
  color1: string = "#63F0FF",
  color2: string = "#35D1FC"
): FallingNotes[] {
  console.log("Constructing new FallingNotes");
  setIsLoading(true);
  try {
    CONTAINER.destroy({ children: true, texture: true, baseTexture: true });
  } catch {}
  let container = new PIXI.Container();
  app.stage.addChild(container);
  app.stage.setChildIndex(container, 2);
  CONTAINER = container;
  FALLING_NOTES = [];
  const pianoNoteXMap = createPianoNoteXMap(app.screen.width / 52);

  const rectCached: RectCache = {};
  groupedNotes.forEach((note) => {
    const on = note.on / CANVAS_SLOW_DOWN_FACTOR;
    const off = note.off / CANVAS_SLOW_DOWN_FACTOR;
    const height = off - on;
    const x = pianoNoteXMap[note.noteName].x;
    const width = pianoNoteXMap[note.noteName].width;
    const cacheKey = `${height}_${width}`;
    if (!rectCached[cacheKey]) {
      const rect = initRectangle(width + 1, height, color1, color2);
      rectCached[cacheKey] = rect;
    }
    // @ts-ignore
    const texture = app.renderer.generateTexture(rectCached[cacheKey]);
    const rectSprite = new PIXI.Sprite(texture);
    rectSprite.visible = false;
    container.addChild(rectSprite);
    FALLING_NOTES.push({ rectSprite, on, off, height, x });
  });
  Object.values(rectCached).forEach((rect: PIXI.Graphics) => {
    rect.destroy({ children: true, texture: true, baseTexture: true });
  });
  setIsLoading(false);
  return FALLING_NOTES;
}

export function draw(
  currentTick: number,
  canvasHeight: number,
  ticksPerBeat: number
) {
  const upperLimit = ticksPerBeat * 4 * 8; // assume 4 beats per bar, show 3 bars
  for (let i = 0; i < FALLING_NOTES.length; i++) {
    if (
      currentTick >=
        FALLING_NOTES[i].on * CANVAS_SLOW_DOWN_FACTOR - upperLimit &&
      currentTick <= FALLING_NOTES[i].off * CANVAS_SLOW_DOWN_FACTOR
    ) {
      const on = FALLING_NOTES[i].on - currentTick / CANVAS_SLOW_DOWN_FACTOR;
      FALLING_NOTES[i].rectSprite.position.x = FALLING_NOTES[i].x;
      FALLING_NOTES[i].rectSprite.position.y =
        canvasHeight - on - FALLING_NOTES[i].height - BOTTOM_TILE_HEIGHT;
      FALLING_NOTES[i].rectSprite.visible = true;
    } else {
      FALLING_NOTES[i].rectSprite.visible = false;
    }
  }
}
