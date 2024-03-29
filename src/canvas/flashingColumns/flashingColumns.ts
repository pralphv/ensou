import * as PIXI from "pixi.js";
import { PIANO_TUNING } from "audio/constants";
import MyCanvas from "../canvas";

export default class FlashingColumns {
  _container: PIXI.Container;
  _columns: PIXI.Sprite[];
  myCanvas: MyCanvas;
  constructor(myCanvas: MyCanvas) {
    this._container = new PIXI.Container();
    this._columns = [];
    this.myCanvas = myCanvas;
    this.myCanvas.stage.addChild(this._container);
    this.myCanvas.stage.setChildIndex(this._container, 1);
    this.resize();
  }

  resize() {
    this._container.children.forEach((child) => child.destroy());
    this._container.removeChildren();
    this._columns = [];
    const height = this.myCanvas.config.coreCanvasHeight;
    // const height = isHorizontal
    //   ? stage.width
    //   : stage.height;
    // const width = isHorizontal
    // ? this._app.screen.height
    // : this._app.screen.width;

    const whiteKeyRect = initRectangle(
      this.myCanvas.config.whiteKeyWidth,
      height
    );
    const blackKeyRect = initRectangle(
      this.myCanvas.config.blackKeyWidth,
      height
    );

    // @ts-ignore
    const whiteKeyTexture = this.myCanvas.app.generateTexture(whiteKeyRect);
    // @ts-ignore
    const blackKeyTexture = this.myCanvas.app.generateTexture(blackKeyRect);
    let x: number = this.myCanvas.config.leftPadding;
    let lastI: number; // to prevent duplicate notes from b and #

    Object.entries(PIANO_TUNING).forEach(([key, i]: [string, number]) => {
      if (i !== lastI) {
        lastI = i;
        const isBlackKey = key.includes("#") || key.includes("b");
        let sprite: PIXI.Sprite;
        const texture = isBlackKey ? blackKeyTexture : whiteKeyTexture;
        sprite = new PIXI.Sprite(texture);
        if (isBlackKey) {
          sprite.position.x = x - this.myCanvas.config.blackKeyWidth / 2;
        } else {
          sprite.position.x = x;
        }
        sprite.position.y = -this.myCanvas.config.bottomTileHeight;
        sprite.visible = false;
        this._container.addChild(sprite);
        this._columns.push(sprite);
        if (!isBlackKey) {
          x += this.myCanvas.config.whiteKeyWidth;
        }
      }
    });
    whiteKeyRect.destroy({ children: true, texture: true, baseTexture: true });
    blackKeyRect.destroy({ children: true, texture: true, baseTexture: true });
  }

  flash(i: number) {
    this._columns[i].visible = true;
  }

  unflash(i: number) {
    this._columns[i].visible = false;
  }

  unFlashAll() {
    for (let i = 0; i < this._columns.length - 1; i++) {
      this._columns[i].visible = false;
    }
  }

  destroy() {
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
  rect.beginTextureFill({ texture: gradient("#121212", "#5efab9", height) });
  rect.alpha = 0.33;
  rect.drawRect(0, 0, width, height);
  return rect;
}
