import * as PIXI from "pixi.js";
import { PIANO_TUNING } from "audio/constants";
import { TEXT_CONFIG } from "./constants";
import * as types from "../types";
import game from "game";

export default class BottomTiles {
  _app: PIXI.Renderer;
  _container: PIXI.Container;
  leftPadding: number;
  whiteKeyWidth: number;
  blackKeyWidth: number;
  _config: types.IMyCanvasConfig;
  _textArray: PIXI.Text[];
  onTextChange: () => void;

  constructor(app: PIXI.Renderer, stage: PIXI.Container, config: types.IMyCanvasConfig, onTextChange: () => void) {
    this._app = app;
    this._container = new PIXI.Container();
    this._config = config;
    this.onTextChange = onTextChange;

    stage.addChild(this._container);
    stage.setChildIndex(
      this._container,
      stage.children.length - 1
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
    const whiteKeyTexture = this._app.generateTexture(whiteKey);
    // @ts-ignore
    const blackKeyTexture = this._app.generateTexture(blackKey);
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
        if (isBlackKey) {
          const text = new PIXI.Text(game.noteLabelMap[key], {
            ...TEXT_CONFIG,
            fontSize: Math.min(12, blackKeyWidth * 0.8),
          });
          this._textArray.push(text);
          sprite = new PIXI.Sprite(blackKeyTexture);
          sprite.addChild(text);
          blackKeyContainer.addChild(sprite);
          sprite.position.x = x;
          sprite.position.x = x - blackKeyWidth / 2;
          text.anchor.x = 0.5;
          text.position.x = blackKeyWidth / 2;
          text.position.y = tileHeight * 0.66 - text.style.fontSize - 5;
          text.visible = false;
        } else {
          const text = new PIXI.Text(game.noteLabelMap[key], {
            ...TEXT_CONFIG,
            fontSize: Math.min(12, whiteKeyWidth * 0.8),
          });
          this._textArray.push(text);

          sprite = new PIXI.Sprite(whiteKeyTexture);
          sprite.addChild(text);
          whiteKeyContainer.addChild(sprite);
          sprite.position.x = x;
          text.anchor.x = 0.5;
          text.position.x = whiteKeyWidth / 2;
          text.position.y = tileHeight - text.style.fontSize - 5;
          x += whiteKeyWidth;
          text.visible = false;
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
    const blackTexture = app.generateTexture(blackRect);
    const sprite = new PIXI.Sprite(blackTexture);
    sprite.position.x = 0;
    sprite.position.y = 0;
    this._container.addChild(sprite);
    whiteKey.destroy({ children: true, baseTexture: true, texture: true });
    blackKey.destroy({ children: true, baseTexture: true, texture: true });
  }

  showText() {
    for (const text of this._textArray) {
      text.visible = true;
    }
    this.onTextChange();
  }

  hideText() {
    for (const text of this._textArray) {
      text.visible = false;
    }
    this.onTextChange();
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
