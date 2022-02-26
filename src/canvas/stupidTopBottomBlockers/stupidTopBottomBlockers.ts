import * as PIXI from "pixi.js";
import MyCanvas from "../canvas";

export default class StupidTopBottomBlockers {
  _container: PIXI.Container;
  constructor(myCanvas: MyCanvas) {
    this._container = new PIXI.Container();
    const rect = initRectangle(
      myCanvas.config.coreCanvasWidth,
      myCanvas.config.yCenterCompensate + 2 // just add a bit more
    );
    // @ts-ignore
    const texture = myCanvas.app.generateTexture(rect);
    const topSprite = new PIXI.Sprite(texture);
    const botSprite = new PIXI.Sprite(texture);
    this._container.addChild(topSprite);
    this._container.addChild(botSprite);
    topSprite.position.y = -myCanvas.config.yCenterCompensate;
    botSprite.position.y =
      myCanvas.config.coreCanvasHeight;

    myCanvas.stage.addChild(this._container);
    myCanvas.stage.setChildIndex(this._container, myCanvas.stage.children.length - 1);
    rect.destroy({ children: true, texture: true, baseTexture: true });
    // texture.destroy();
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
