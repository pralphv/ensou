import * as PIXI from "pixi.js";
import { PIANO_TUNING, NOTE_KEYBOARD_LABEL } from "audio/constants";
import { TEXT_CONFIG } from "./constants";
import * as types from "../types";

export default class BottomTiles {
  _app: PIXI.Application;
  _container: PIXI.Container;
  leftPadding: number;
  whiteKeyWidth: number;
  blackKeyWidth: number;
  _config: types.IMyCanvasConfig;
  _textArray: PIXI.Text[];

  constructor(app: PIXI.Application, config: types.IMyCanvasConfig) {
    this._app = app;
    this._container = new PIXI.Container();
    this._config = config;

    this._app.stage.addChild(this._container);
    this._app.stage.setChildIndex(
      this._container,
      this._app.stage.children.length - 1
    );

    this._textArray = [];
    const whiteKeyWidth = Math.floor(this._app.screen.width / 52);
    const blackKeyWidth = Math.floor(whiteKeyWidth * 0.55);

    const leftPadding = (this._app.screen.width - whiteKeyWidth * 52) * 0.75;
    this.leftPadding = leftPadding;
    this.whiteKeyWidth = whiteKeyWidth;
    this.blackKeyWidth = blackKeyWidth;

    const whiteKey = initRectangle(
      whiteKeyWidth,
      this._config.bottomTileHeight,
      true
    );
    const blackKey = initRectangle(
      blackKeyWidth,
      this._config.bottomTileHeight * 0.66,
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
    const screenHeight = app.screen.height;
    const tileHeight = this._config.bottomTileHeight;

    Object.entries(PIANO_TUNING).forEach(([key, i]: [string, number]) => {
      if (i !== lastI) {
        lastI = i;
        const isBlackKey = key.includes("#") || key.includes("b");
        let sprite: PIXI.Sprite;
        const text = new PIXI.Text(NOTE_KEYBOARD_LABEL[key], TEXT_CONFIG);
        this._textArray.push(text);
        if (isBlackKey) {
          sprite = new PIXI.Sprite(blackKeyTexture);
          sprite.addChild(text);
          blackKeyContainer.addChild(sprite);
          sprite.position.x = x - blackKeyWidth / 2;
          text.position.x = blackKeyWidth / 3;
          text.position.y = tileHeight * 0.66 - TEXT_CONFIG.fontSize - 2;
        } else {
          sprite = new PIXI.Sprite(whiteKeyTexture);
          sprite.addChild(text);
          whiteKeyContainer.addChild(sprite);
          sprite.position.x = x;
          text.position.x = whiteKeyWidth / 3;
          text.position.y = tileHeight - TEXT_CONFIG.fontSize - 2;
          x += whiteKeyWidth;
        }
        sprite.position.y = screenHeight - tileHeight - 1;
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
    console.log("JER")
    console.log(this._container)
    this.hideText();
  }

  showText() {
    this._textArray.forEach(text => {
      text.visible = true;
    })
  }

  hideText() {
    this._textArray.forEach(text => {
      text.visible = false;
    })
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
