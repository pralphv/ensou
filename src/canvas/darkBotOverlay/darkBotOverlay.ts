import * as PIXI from "pixi.js";
import MyCanvas from "../canvas";

export default class DarkBotOverlay {
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
    const rect = initBlackColorOverlay(
      this.myCanvas.config.coreCanvasWidth,
      this.myCanvas.config.coreCanvasHeight / 2
    );
    // @ts-ignore
    const texture = this.myCanvas.app.generateTexture(rect);
    const sprite = new PIXI.Sprite(texture);
    this._container.addChild(sprite);
    this._container.position.y = this.myCanvas.config.coreCanvasHeight / 2;

    rect.destroy({ children: true, texture: true, baseTexture: true });
  }

  show() {
    this._container.visible = true;
    this.myCanvas.runRender();
  }

  hide() {
    this._container.visible = false;
    this.myCanvas.runRender();
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
    texture: gradient("rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.4)", width, height),
  });
  rect.drawRect(0, 0, width, height);
  return rect;
}
