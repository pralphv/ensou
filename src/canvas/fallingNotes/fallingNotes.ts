import * as PIXI from "pixi.js";
import * as types from "audio/types";
import { PIANO_TUNING } from "audio/constants";
import { IMyCanvasConfig } from "../types";
import myMidiPlayer from "audio";

export default class FallingNotes {
  _app: PIXI.Application;
  _container: PIXI.Container;
  _fallingNotes: IFallingNotes[];
  _totalFallingNotes: number;
  _screenHeight: number;
  _bottomTileHeight: number;
  _canvasNoteScale: number;
  _textArray: PIXI.Text[];
  isTextOn: boolean;

  constructor(
    app: PIXI.Application,
    groupedNotes: types.GroupedNotes[],
    config: IMyCanvasConfig,
    leftPadding: number,
    whiteKeyWidth: number,
    blackKeyWidth: number
  ) {
    this._app = app;
    this._bottomTileHeight = config.bottomTileHeight;
    this._canvasNoteScale = config.canvasNoteScale;
    this._screenHeight = app.screen.height;
    this._container = new PIXI.Container();
    this._textArray = [];
    this.isTextOn = false;

    this._fallingNotes = [];
    this._totalFallingNotes = 0;
    console.log("Constructing new Falling Notes");
    // setIsLoading(true);
    const color1 = "#63F0FF";
    const color2 = "#35D1FC";

    this._app.stage.addChild(this._container);
    this._app.stage.setChildIndex(this._container, 2);
    const pianoNoteXMap = createPianoNoteXMap(whiteKeyWidth, blackKeyWidth);

    const rectCached: RectCache = {};
    groupedNotes.forEach((note) => {
      const on = note.on / this._canvasNoteScale;
      const off = note.off / this._canvasNoteScale;
      const height = off - on;
      const x = pianoNoteXMap[note.noteName].x + leftPadding;
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
      const text = new PIXI.Text(note.noteName.slice(0, -1), {
        fontFamily: "Helvetica",
        fontSize: 12,
        fill: 0x1f1d1d,
        align: "center",
      });
      this._textArray.push(text);
      rectSprite.addChild(text);
      text.anchor.x = 0.5;
      text.position.x = width / 2;
      text.position.y = height - 12 - 5;
      this._container.addChild(rectSprite);
      this._fallingNotes.push({ rectSprite, on, off, height, x });
    });
    Object.values(rectCached).forEach((rect: PIXI.Graphics) => {
      rect.destroy({ children: true, texture: true, baseTexture: true });
    });
    this._totalFallingNotes = this._fallingNotes.length;
    this.hideText();
  }

  draw() {
    const upperLimit = myMidiPlayer.ticksPerBeat * 4 * 8; // assume 4 beats per bar, show 3 bars
    for (const note of this._fallingNotes) {
      if (
        myMidiPlayer.getCurrentTick() >=
          note.on * this._canvasNoteScale - upperLimit &&
        myMidiPlayer.getCurrentTick() <= note.off * this._canvasNoteScale
      ) {
        const on =
          note.on - myMidiPlayer.getCurrentTick() / this._canvasNoteScale;
        note.rectSprite.position.x = note.x;
        note.rectSprite.position.y =
          this._screenHeight - on - note.height - this._bottomTileHeight;
        note.rectSprite.visible = true;
      } else {
        note.rectSprite.visible = false;
      }
    }
  }

  showText() {
    for (const text of this._textArray) {
      text.visible = true;
    }
    this.isTextOn = true;
  }

  hideText() {
    for (const text of this._textArray) {
      text.visible = false;
    }
    this.isTextOn = false;
  }

  getIsTextOn() {
    return this.isTextOn;
  }

  destroy() {
    console.log("Destroying falling notes");
    this._container.destroy({
      children: true,
      texture: true,
      baseTexture: true,
    });
  }
}

interface IFallingNotes {
  rectSprite: PIXI.Sprite;
  on: number;
  off: number;
  height: number;
  x: number;
}

interface IPianoNoteXMap {
  [note: string]: IPianoNote;
}

interface IPianoNote {
  width: number;
  x: number;
}

interface RectCache {
  [key: string]: PIXI.Graphics;
}

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
  rect.alpha = 1;
  rect.lineStyle(2, 0xffffff, 0.5);
  rect.drawRect(0, 0, width, height);
  rect.endFill();
  return rect;
}

function createPianoNoteXMap(
  whiteKeyWidth: number,
  blackKeyWidth: number
): IPianoNoteXMap {
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
