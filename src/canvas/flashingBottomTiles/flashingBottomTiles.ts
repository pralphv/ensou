import * as PIXI from "pixi.js";
import { PIANO_TUNING } from "audio/constants";
import myMidiPlayer from "audio";
import * as types from "../types";

export default class FlashingBottomTiles {
  _container: PIXI.Container;
  _columns: PIXI.Sprite[];
  constructor(
    app: PIXI.Renderer,
    stage: PIXI.Container,
    config: types.IMyCanvasConfig,
    leftPadding: number,
    whiteKeyWidth: number,
    blackKeyWidth: number
  ) {
    this._container = new PIXI.Container();
    this._columns = [];
    console.log("Constructing new Flashing Bottom Tiles");

    stage.addChild(this._container);
    stage.setChildIndex(this._container, stage.children.length - 1);

    const whiteKey = initRectangle(whiteKeyWidth + 1, config.bottomTileHeight);
    const blackKey = initRectangle(
      blackKeyWidth + 1,
      config.bottomTileHeight * 0.66
    );
    // @ts-ignore
    const whiteKeyTexture = app.generateTexture(whiteKey);
    // @ts-ignore
    const blackKeyTexture = app.generateTexture(blackKey);
    let x: number = leftPadding;
    let lastI: number; // to prevent duplicate notes from b and #
    Object.entries(PIANO_TUNING).forEach(([key, i]: [string, number]) => {
      if (i !== lastI) {
        lastI = i;
        const isBlackKey = key.includes("#") || key.includes("b");
        let sprite: PIXI.Sprite;
        if (isBlackKey) {
          sprite = new PIXI.Sprite(blackKeyTexture);
          sprite.position.x = x - blackKeyWidth / 2;
        } else {
          sprite = new PIXI.Sprite(whiteKeyTexture);
          sprite.position.x = x;
          x += whiteKeyWidth;
        }
        sprite.position.y = app.screen.height - config.bottomTileHeight;
        sprite.visible = false;
        this._container.addChild(sprite);
        this._columns.push(sprite);
      }
    });
    whiteKey.destroy({ children: true, baseTexture: true, texture: true });
    blackKey.destroy({ children: true, baseTexture: true, texture: true });
  }

  flash(i: number) {
    this._columns[i].visible = true;
  }

  unflash(i: number) {
    this._columns[i].visible = false;
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
    console.log("Destroying flashing bottom tiles");
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
  rect.beginTextureFill({ texture: gradient("#5efab9", "#5efab9", height) });
  rect.alpha = 0.33;
  rect.drawRect(0, 0, width, height);
  return rect;
}
