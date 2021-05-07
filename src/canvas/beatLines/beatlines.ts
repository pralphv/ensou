import * as PIXI from "pixi.js";

import { convertMidiTickToCanvasHeight } from "../utils";
import { IMyCanvasConfig } from "../types";
import myMidiPlayer from "audio";

export default class BeatLines {
  _app: PIXI.Application;
  _container: PIXI.Container;
  _sprites: PIXI.Sprite[];
  _config: IMyCanvasConfig;
  constructor(app: PIXI.Application, config: IMyCanvasConfig) {
    // probably should calculate how many beat lines there would be on the screen given a song
    this._app = app;
    this._container = new PIXI.Container();
    this._config = config;
    this._app.stage.addChild(this._container);
    this._app.stage.setChildIndex(this._container, 0);

    const line = drawLine(app.screen.width);
    // @ts-ignore
    const texture = app.renderer.generateTexture(line);
    this._sprites = [];

    for (let i = 0; i < 20; i++) {
      this._sprites.push(new PIXI.Sprite(texture)); // just hardcode 20 beatlines
    }

    this._sprites.forEach((sprite) => {
      sprite.position.y = -10; // move below canvas to hide
      this._container.addChild(sprite);
    });
    // sprites already built. delete texture
    line.destroy({ children: true, baseTexture: true, texture: true });
  }

  draw() {
    const ticksPerBar = myMidiPlayer.getTicksPerBeat() * 4;
    const startTick =
      Math.ceil(myMidiPlayer.getCurrentTick() / ticksPerBar) * ticksPerBar;
    for (let i = 0; i < this._sprites.length; i++) {
      const y = convertMidiTickToCanvasHeight(startTick + ticksPerBar * i);
      this._sprites[i].position.y = y;

      if (y < 0) {
        return;
      }
    }
  }

  destroy() {
    // console.log("Destroying beat lines");
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
