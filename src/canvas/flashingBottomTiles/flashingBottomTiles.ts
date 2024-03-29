import * as PIXI from "pixi.js";
import { PIANO_TUNING } from "audio/constants";
import MyCanvas from "../canvas";

export default class FlashingBottomTiles {
  _container: PIXI.Container;
  _columns: PIXI.Sprite[];
  myCanvas: MyCanvas;
  constructor(myCanvas: MyCanvas) {
    this._container = new PIXI.Container();
    this._columns = [];
    this.myCanvas = myCanvas;

    myCanvas.stage.addChild(this._container);
    myCanvas.stage.setChildIndex(
      this._container,
      myCanvas.stage.children.length - 1
    );
    this.resize();
  }

  resize() {
    this._container.children.forEach((child) => child.destroy());
    this._container.removeChildren();
    this._columns = [];
    const whiteKey = initRectangle(
      this.myCanvas.config.whiteKeyWidth + 1,
      this.myCanvas.config.bottomTileHeight
    );
    const blackKey = initRectangle(
      this.myCanvas.config.blackKeyWidth + 1,
      this.myCanvas.config.bottomTileHeight * 0.66
    );
    // @ts-ignore
    const whiteKeyTexture = this.myCanvas.app.generateTexture(whiteKey);
    // @ts-ignore
    const blackKeyTexture = this.myCanvas.app.generateTexture(blackKey);
    let x: number = this.myCanvas.config.leftPadding;
    let lastI: number; // to prevent duplicate notes from b and #
    Object.entries(PIANO_TUNING).forEach(([key, i]: [string, number]) => {
      if (i !== lastI) {
        lastI = i;
        const isBlackKey = key.includes("#") || key.includes("b");
        let sprite: PIXI.Sprite;
        if (isBlackKey) {
          sprite = new PIXI.Sprite(blackKeyTexture);
          sprite.position.x = x - this.myCanvas.config.blackKeyWidth / 2;
        } else {
          sprite = new PIXI.Sprite(whiteKeyTexture);
          sprite.position.x = x;
          x += this.myCanvas.config.whiteKeyWidth;
        }
        sprite.position.y =
          this.myCanvas.config.coreCanvasHeight -
          this.myCanvas.config.bottomTileHeight;
        sprite.visible = false;
        this._container.addChild(sprite);
        this._columns.push(sprite);
      }
    });
    whiteKey.destroy({ children: true, baseTexture: true, texture: true });
    blackKey.destroy({ children: true, baseTexture: true, texture: true });
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
  rect.beginTextureFill({ texture: gradient("#5efab9", "#5efab9", height) });
  rect.alpha = 0.33;
  rect.drawRect(0, 0, width, height);
  return rect;
}
