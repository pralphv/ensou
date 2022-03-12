import * as PIXI from "pixi.js";
import { PIANO_TUNING } from "audio/constants";
import { GUIDE_LINES_NOTE_NUMBER } from "./constants";
import BottomTiles from "./bottomTiles";
import * as types from "../types";
import MyCanvas from "../canvas";

export default class Background {
  canvas: MyCanvas;
  _container: PIXI.Container;
  bottomTiles: BottomTiles;

  constructor(canvas: MyCanvas) {
    this.canvas = canvas;
    this.bottomTiles = new BottomTiles(canvas);
    this._container = new PIXI.Container();
    this.canvas.stage.addChild(this._container);
    this.canvas.stage.setChildIndex(this._container, 0);
    this.resize();

    this.resetBottomTiles = this.resetBottomTiles.bind(this);
  }

  resetBottomTiles(textOn: boolean = false) {
    this.bottomTiles = new BottomTiles(this.canvas);
    if (textOn) {
      this.bottomTiles.showText();
    }
  }

  resize() {
    this.bottomTiles.resize();
    this._container.children.forEach((child) => child.destroy());
    this._container.removeChildren();
    const horizontalLine = drawLine(this.canvas.config.coreCanvasHeight);
    // @ts-ignore
    const texture = this.canvas.app.generateTexture(horizontalLine);

    let x: number = this.canvas.config.leftPadding;
    let lastI: number; // to prevent duplicate notes from b and #
    const whiteKeyWidth = this.canvas.config.whiteKeyWidth;

    Object.entries(PIANO_TUNING).forEach(([key, i]: [string, number]) => {
      if (i !== lastI) {
        lastI = i;
        const isBlackKey = key.includes("#") || key.includes("b");

        if (!isBlackKey) {
          x += whiteKeyWidth;
        }
        if (GUIDE_LINES_NOTE_NUMBER.includes(i)) {
          const sprite = new PIXI.Sprite(texture);
          sprite.position.x = x;
          this._container.addChild(sprite);
        }
      }
    });
    horizontalLine.destroy({
      children: true,
      baseTexture: true,
      texture: true,
    });
  }

  destroy() {
    this._container.destroy({
      children: true,
      texture: true,
      baseTexture: true,
    });
  }
}

function drawLine(height: number): PIXI.Graphics {
  const line = new PIXI.Graphics();
  line.position.set(0, 0);
  line.lineStyle(1.5, 0x353535);
  line.moveTo(0, 0);
  line.lineTo(0, height);
  line.alpha = 0.9;
  line.endFill();
  return line;
}
