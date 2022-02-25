import * as PIXI from "pixi.js";
import myMidiPlayer from "audio";
import { convertMidiTickToCanvasHeight } from "../utils";
import MyCanvas from "../canvas";

export default class Highlighter {
  _container: PIXI.Container;
  _texture!: PIXI.Texture;
  _sprite!: PIXI.Sprite;
  active: boolean;
  constructor(
    myCanvas: MyCanvas
  ) {
    this._container = new PIXI.Container();
    this.active = false;
    const rect = initRectangle(myCanvas.config.coreCanvasWidth, myCanvas.config.coreCanvasHeight);
    // @ts-ignore
    this._texture = myCanvas.app.generateTexture(rect);
    this._sprite = new PIXI.Sprite(this._texture);
    this._container.addChild(this._sprite);
    this._container.visible = false;
    this._container.position.y = 0;
    this._sprite.height = 0;
    myCanvas.stage.addChild(this._container);
    rect.destroy({ children: true, texture: true, baseTexture: true });
  }

  draw(tick: number) {
    if (this.active) {
      this._container.visible = true;
      const startY = convertMidiTickToCanvasHeight(
        myMidiPlayer.loopPoints.startTick || 0,
        tick
      );
      let endY =
        myMidiPlayer.loopPoints.endTick === myMidiPlayer.getTotalTicks()
          ? startY
          : convertMidiTickToCanvasHeight(
              myMidiPlayer.loopPoints.endTick || 0,
              tick
            );
      this._container.position.y = endY > startY ? startY : endY;
      this._sprite.height = Math.max(Math.abs(endY - startY), 2);
    }
  }

  destroy() {
    this._sprite?.destroy({ children: true, texture: true, baseTexture: true });
    this._texture?.destroy(true);
  }

  activate() {
    this.active = true;
  }

  disable() {
    this.active = false;
    this._sprite.height = 0;
  }
}

function initRectangle(width: number, height: number): PIXI.Graphics {
  const rect = new PIXI.Graphics();
  rect.beginFill(0x008cd9);
  rect.alpha = 0.3;
  rect.drawRect(0, 0, width * 0.999, height);
  rect.endFill();
  return rect;
}
