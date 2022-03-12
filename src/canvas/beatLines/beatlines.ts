import * as PIXI from "pixi.js";

import { convertMidiTickToCanvasHeight } from "../utils";
import myMidiPlayer from "audio";
import MyCanvas from "../canvas";

export default class BeatLines {
  _container: PIXI.Container;
  _sprites: PIXI.Sprite[];
  _noOfSprites: number;
  myCanvas: MyCanvas;

  constructor(myCanvas: MyCanvas) {
    // probably should calculate how many beat lines there would be on the screen given a song
    this.myCanvas = myCanvas;
    this._container = new PIXI.Container();
    this._noOfSprites = 0;
    this._sprites = [];
    myCanvas.stage.addChild(this._container);
    myCanvas.stage.setChildIndex(this._container, 0);
    this.resize();
  }

  resize() {
    this._container.children.forEach((child) => child.destroy());
    this._container.removeChildren();
    this._sprites = [];

    const line = drawLine(this.myCanvas.config.coreCanvasWidth);
    // @ts-ignore
    const texture = this.myCanvas.app.generateTexture(line);

    for (let i = 0; i < 20; i++) {
      this._sprites.push(new PIXI.Sprite(texture)); // just hardcode 20 beatlines
    }

    this._sprites.forEach((sprite) => {
      sprite.position.y = -10; // move below canvas to hide
      this._container.addChild(sprite);
    });
    this._noOfSprites = this._sprites.length;
    // sprites already built. delete texture
    line.destroy({ children: true, baseTexture: true, texture: true });
  }

  draw(tick: number) {
    const ticksPerBar = myMidiPlayer.getPPQ() * 4;
    const startTick = Math.ceil(tick / ticksPerBar) * ticksPerBar;
    for (let i = 0; i < this._noOfSprites; i++) {
      const y = convertMidiTickToCanvasHeight(
        startTick + ticksPerBar * i,
        tick
      );
      this._sprites[i].position.y = y;

      if (y < 0) {
        return;
      }
    }
  }

  destroy() {
    this._container.destroy({
      baseTexture: true,
      children: true,
      texture: true,
    });
  }
}

function drawLine(width: number): PIXI.Graphics {
  const line = new PIXI.Graphics();
  line.position.set(0, 0);
  line.lineStyle(3, 0x003e4d);
  line.moveTo(0, 0);
  line.lineTo(width, 0);
  line.alpha = 0.5;
  line.endFill();
  return line;
}
