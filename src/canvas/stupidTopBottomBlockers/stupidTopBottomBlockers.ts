import * as PIXI from "pixi.js";
import MyCanvas from "../canvas";

export default class StupidTopBottomBlockers {
  _container: PIXI.Container;
  myCanvas: MyCanvas;
  constructor(myCanvas: MyCanvas) {
    this.myCanvas = myCanvas;
    this._container = new PIXI.Container();
    this.myCanvas.stage.addChild(this._container);
    this.myCanvas.stage.setChildIndex(
      this._container,
      this.myCanvas.stage.children.length - 1
    );
    this.resize();
  }

  resize() {
    this._container.children.forEach((child) => child.destroy());
    this._container.removeChildren();
    const rect = initRectangle(
      this.myCanvas.config.coreCanvasWidth,
      this.myCanvas.config.yCenterCompensate + 2 // just add a bit more
    );
    // @ts-ignore
    const texture = this.myCanvas.app.generateTexture(rect);
    const topSprite = new PIXI.Sprite(texture);
    const botSprite = new PIXI.Sprite(texture);
    this._container.addChild(topSprite);
    this._container.addChild(botSprite);
    topSprite.position.y = -this.myCanvas.config.yCenterCompensate;
    botSprite.position.y = this.myCanvas.config.coreCanvasHeight;

    rect.destroy({ children: true, texture: true, baseTexture: true });
  }

  destroy() {
    this._container.destroy({
      children: true,
      texture: true,
      baseTexture: true,
    });
  }
}

function initRectangle(width: number, height: number): PIXI.Graphics {
  const rect = new PIXI.Graphics();
  rect.beginFill(0x000000);
  rect.drawRect(0, 0, width, height);
  rect.endFill();
  return rect;
}
