import * as PIXI from "pixi.js";
import { PIANO_TUNING } from "audio/constants";
import myMidiPlayer from "audio";
import * as types from "../types";

export default class FlashingColumns {
  _app: PIXI.Application;
  _container: PIXI.Container;
  _columns: PIXI.Sprite[];
  constructor(
    app: PIXI.Application,
    isHorizontal: boolean = false,
    config: types.IMyCanvasConfig,
    leftPadding: number,
    whiteKeyWidth: number,
    blackKeyWidth: number
  ) {
    this._app = app;
    this._container = new PIXI.Container();
    this._columns = [];
    console.log("Constructing new Flashing Columns");
    const height = isHorizontal
      ? this._app.screen.width
      : this._app.screen.height;
    // const width = isHorizontal
      // ? this._app.screen.height
      // : this._app.screen.width;
    this._app.stage.addChild(this._container);
    this._app.stage.setChildIndex(this._container, 1);

    const whiteKeyRect = initRectangle(whiteKeyWidth, height);
    const blackKeyRect = initRectangle(blackKeyWidth, height);

    // @ts-ignore
    const whiteKeyTexture = this._app.renderer.generateTexture(whiteKeyRect);
    // @ts-ignore
    const blackKeyTexture = this._app.renderer.generateTexture(blackKeyRect);
    let x: number = leftPadding;
    let lastI: number; // to prevent duplicate notes from b and #

    Object.entries(PIANO_TUNING).forEach(([key, i]: [string, number]) => {
      if (i !== lastI) {
        lastI = i;
        const isBlackKey = key.includes("#") || key.includes("b");
        let sprite: PIXI.Sprite;
        const texture = isBlackKey ? blackKeyTexture : whiteKeyTexture;
        sprite = new PIXI.Sprite(texture);
        if (isBlackKey) {
          sprite.position.x = x - blackKeyWidth / 2;
        } else {
          sprite.position.x = x;
        }
        sprite.position.y = -config.bottomTileHeight;
        sprite.visible = false;
        this._container.addChild(sprite);
        this._columns.push(sprite);
        if (!isBlackKey) {
          x += whiteKeyWidth;
        }
      }
    });
    whiteKeyRect.destroy({ children: true, texture: true, baseTexture: true });
    blackKeyRect.destroy({ children: true, texture: true, baseTexture: true });
  }

  draw() {
    for (let i = 0; i < this._columns.length - 1; i++) {
      // flash and unflash tiles
      const flash: boolean = myMidiPlayer.playingNotes.has(i) ? true : false;
      this._columns[i].visible = flash;
    }
  }

  unFlashAll() {
    for (let i = 0; i < this._columns.length - 1; i++) {
      this._columns[i].visible = false;
    }
  }

  destroy() {
    console.log("Destroying flashing columns");

    this._container.destroy({
      children: true,
      texture: true,
      baseTexture: true,
    });
  }
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

function initRectangle(width: number, height: number): PIXI.Graphics {
  const rect = new PIXI.Graphics();
  rect.beginTextureFill({ texture: gradient("#121212", "#5efab9", height) });
  rect.alpha = 0.33;
  rect.drawRect(0, 0, width, height);
  return rect;
}
