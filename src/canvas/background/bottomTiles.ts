import * as PIXI from "pixi.js";
import { PIANO_TUNING } from "audio/constants";
import { TEXT_CONFIG } from "./constants";
import game from "game";
import MyCanvas from "../canvas";

export default class BottomTiles {
  canvas: MyCanvas;
  _container: PIXI.Container;
  _textArray: PIXI.Text[];

  constructor(canvas: MyCanvas) {
    this.canvas = canvas;
    this._container = new PIXI.Container();
    this._textArray = [];

    canvas.stage.addChild(this._container);
    canvas.stage.setChildIndex(
      this._container,
      canvas.stage.children.length - 1
    );
    this.resize();
  }

  resize() {
    this._container.children.forEach((child) => child.destroy());
    this._container.removeChildren();
    this._textArray.forEach((text) =>
      text.destroy({ children: true, texture: true, baseTexture: true })
    );
    this._textArray = [];

    const whiteKey = initRectangle(
      this.canvas.config.whiteKeyWidth,
      this.canvas.config.bottomTileHeight,
      0x000000
    );
    const blackKey = initRectangle(
      this.canvas.config.blackKeyWidth,
      this.canvas.config.bottomTileHeight * 0.66,
      0x7fdded
    );

    // @ts-ignore
    const whiteKeyTexture = this.canvas.app.generateTexture(whiteKey);
    // @ts-ignore
    const blackKeyTexture = this.canvas.app.generateTexture(blackKey);
    let x: number = this.canvas.config.leftPadding;

    let lastI: number; // to prevent duplicate notes from b and #
    const whiteKeyContainer = new PIXI.Container();
    const blackKeyContainer = new PIXI.Container();

    Object.entries(PIANO_TUNING).forEach(([key, i]: [string, number]) => {
      if (i !== lastI) {
        lastI = i;
        const isBlackKey = key.includes("#") || key.includes("b");
        let sprite: PIXI.Sprite;
        if (isBlackKey) {
          const text = new PIXI.Text(game.noteLabelMap[key], {
            ...TEXT_CONFIG,
            fontSize: Math.min(12, this.canvas.config.blackKeyWidth * 0.8),
            fill: 0x2d353f,
            fontWeight: 800,
          });
          this._textArray.push(text);
          sprite = new PIXI.Sprite(blackKeyTexture);
          sprite.addChild(text);
          blackKeyContainer.addChild(sprite);
          // sprite.position.x = x;
          sprite.position.x = x - this.canvas.config.blackKeyWidth / 2;
          text.anchor.x = 0.5;
          text.position.x = this.canvas.config.blackKeyWidth / 2;
          text.position.y =
            this.canvas.config.bottomTileHeight * 0.66 -
            text.style.fontSize -
            5;
          text.visible = false;
        } else {
          const text = new PIXI.Text(game.noteLabelMap[key], {
            ...TEXT_CONFIG,
            fontSize: Math.min(12, this.canvas.config.whiteKeyWidth * 0.8),
          });
          this._textArray.push(text);

          sprite = new PIXI.Sprite(whiteKeyTexture);
          sprite.addChild(text);
          whiteKeyContainer.addChild(sprite);
          sprite.position.x = x;
          text.anchor.x = 0.5;
          text.position.x = this.canvas.config.whiteKeyWidth / 2;
          text.position.y =
            this.canvas.config.bottomTileHeight - text.style.fontSize - 5;
          x += this.canvas.config.whiteKeyWidth;
          text.visible = false;
        }
        sprite.position.y =
          this.canvas.config.coreCanvasHeight -
          this.canvas.config.bottomTileHeight -
          1;
      }
    });
    this._container.addChild(whiteKeyContainer);
    this._container.addChild(blackKeyContainer);

    whiteKey.destroy({ children: true, baseTexture: true, texture: true });
    blackKey.destroy({ children: true, baseTexture: true, texture: true });
  }

  showText() {
    for (const text of this._textArray) {
      text.visible = true;
    }
    this.canvas.runRender();
  }

  hideText() {
    for (const text of this._textArray) {
      text.visible = false;
    }
    this.canvas.runRender();
  }

  destroy() {
    this._container.destroy({
      children: true,
      texture: true,
      baseTexture: true,
    });
  }
}

function gradient(from: string, to: string, width: number, height: number) {
  const c = document.createElement("canvas");
  c.height = height;
  let ctx = c.getContext("2d") as CanvasRenderingContext2D;
  const grd = ctx.createLinearGradient(0, 0, 0, height);
  grd.addColorStop(0, from);
  grd.addColorStop(1, to);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, height);
  const texture = PIXI.Texture.from(c);
  return texture;
}

function initRectangle(width: number, height: number, fill: number) {
  const rect = new PIXI.Graphics();
  rect.lineStyle(1.5, 0x7fdded);
  if (fill !== undefined) {
    rect.beginFill(fill);
  }
  rect.drawRect(0, 0, width, height);
  return rect;
}
