import * as PIXI from "pixi.js";
import * as types from "../types";
import myMidiPlayer from "audio";
import { convertMidiTickToCanvasHeight } from "../utils";

export default class Highlighter {
  _app: PIXI.Application;
  _texture!: PIXI.Texture;
  _sprite!: PIXI.Sprite;
  _config: types.IMyCanvasConfig;
  constructor(app: PIXI.Application, config: types.IMyCanvasConfig) {
    console.log("Constructing Highlighter");
    this._app = app;
    this._config = config;
  }

  draw() {
    this.destroy();
    const startY = convertMidiTickToCanvasHeight(
      myMidiPlayer.playRange.startTick || 0
    );
    const endY = convertMidiTickToCanvasHeight(
      myMidiPlayer.playRange.endTick || 0
    );

    const rect = initRectangle(this._app.screen.width, Math.abs(endY - startY));
    // @ts-ignore
    const texture = this._app.renderer.generateTexture(rect);
    const sprite = new PIXI.Sprite(texture);
    sprite.position.y = endY > startY ? startY : endY;
    this._app.stage.addChild(sprite);
    this._sprite = sprite;
    this._texture = texture;
    // canBeDestroyed = true;
    rect.destroy({ children: true, texture: true, baseTexture: true });
  }

  destroy() {
    // console.log("Destroying Highlighter");
    this._sprite?.destroy({ children: true, texture: true, baseTexture: true });
    this._texture?.destroy(true);
    // canBeDestroyed = false;
  }
}

function initRectangle(width: number, height: number): PIXI.Graphics {
  const rect = new PIXI.Graphics();
  rect.beginFill(0x008cd9);
  rect.alpha = 0.3;
  rect.lineStyle(3, 0x4dafff, 0.6);
  rect.drawRect(0, 0, width * 0.999, height);
  rect.endFill();
  return rect;
}
