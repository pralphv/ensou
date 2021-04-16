import * as PIXI from "pixi.js";
import { PIANO_TUNING } from "audio/constants";
import { BOTTOM_TILE_HEIGHT } from "../constants";

export default class BottomTiles {
  _app: PIXI.Application;
  _container: PIXI.Container;
  leftPadding: number;
  whiteKeyWidth: number;
  blackKeyWidth: number;

  constructor(app: PIXI.Application) {
    this._app = app;
    this._container = new PIXI.Container();

    this._app.stage.addChild(this._container);
    this._app.stage.setChildIndex(
      this._container,
      this._app.stage.children.length - 1
    );

    const whiteKeyWidth = Math.floor(this._app.screen.width / 52);
    const blackKeyWidth = Math.floor(whiteKeyWidth * 0.55);

    const leftPadding = (this._app.screen.width - whiteKeyWidth * 52) * 0.75;
    console.log({ whiteKeyWidth, width: this._app.screen.width, leftPadding });
    this.leftPadding = leftPadding;
    this.whiteKeyWidth = whiteKeyWidth;
    this.blackKeyWidth = blackKeyWidth;

    const whiteKey = initRectangle(whiteKeyWidth, BOTTOM_TILE_HEIGHT, true);
    const blackKey = initRectangle(
      blackKeyWidth,
      BOTTOM_TILE_HEIGHT * 0.66,
      true
    );

    // @ts-ignore
    const whiteKeyTexture = this._app.renderer.generateTexture(whiteKey);
    // @ts-ignore
    const blackKeyTexture = this._app.renderer.generateTexture(blackKey);
    let x: number = leftPadding;

    let lastI: number; // to prevent duplicate notes from b and #
    const whiteKeyContainer = new PIXI.Container();
    const blackKeyContainer = new PIXI.Container();

    Object.entries(PIANO_TUNING).forEach(([key, i]: [string, number]) => {
      if (i !== lastI) {
        lastI = i;
        const isBlackKey = key.includes("#") || key.includes("b");
        let sprite: PIXI.Sprite;
        if (isBlackKey) {
          sprite = new PIXI.Sprite(blackKeyTexture);
          blackKeyContainer.addChild(sprite);
          sprite.position.x = x - blackKeyWidth / 2;
        } else {
          sprite = new PIXI.Sprite(whiteKeyTexture);
          whiteKeyContainer.addChild(sprite);
          sprite.position.x = x;
          x += whiteKeyWidth;
        }
        sprite.position.y = app.screen.height - 51;
      }
    });
    this._container.addChild(whiteKeyContainer);
    this._container.addChild(blackKeyContainer);

    // black top overlay. should not be here
    const blackRect = initBlackColorOverlay(
      app.screen.width,
      app.screen.height * 0.3
    );
    // @ts-ignore
    const blackTexture = app.renderer.generateTexture(blackRect);
    const sprite = new PIXI.Sprite(blackTexture);
    sprite.position.x = 0;
    sprite.position.y = 0;
    this._container.addChild(sprite);

    whiteKey.destroy({ children: true, baseTexture: true, texture: true });
    blackKey.destroy({ children: true, baseTexture: true, texture: true });
  }

  destroy() {
    console.log("Destroying beat lines");
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

function initBlackColorOverlay(width: number, height: number): PIXI.Graphics {
  const rect = new PIXI.Graphics();
  rect.beginTextureFill({
    texture: gradient("#000000", "rgba(0, 0, 0, 0)", width, height),
  });
  rect.drawRect(0, 0, width, height);
  return rect;
}

function initRectangle(width: number, height: number, fill: boolean) {
  const rect = new PIXI.Graphics();
  rect.lineStyle(1.5, 0x7fdded);
  if (fill) {
    rect.beginFill(0x000000);
  }
  rect.drawRect(0, 0, width, height);
  return rect;
}
