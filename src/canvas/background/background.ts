import * as PIXI from "pixi.js";
import { PIANO_TUNING } from "audio/constants";
import { GUIDE_LINES_NOTE_NUMBER } from "./constants";
import BottomTiles from "./bottomTiles";
import * as types from "../types";

export default class Background {
  _app: PIXI.Application;
  _container: PIXI.Container;
  bottomTiles: BottomTiles;
  _config: types.IMyCanvasConfig;

  constructor(app: PIXI.Application, config: types.IMyCanvasConfig) {
    this._app = app;
    this.bottomTiles = new BottomTiles(this._app, config);
    this.drawGuidingLines();
    this._container = new PIXI.Container();
    this._config = config;

    this.resetBottomTiles = this.resetBottomTiles.bind(this);
  }

  resetBottomTiles(textOn: boolean = false) {
    this.bottomTiles.destroy();
    // recreate bottom tiles with latest key bindings
    this.bottomTiles = new BottomTiles(this._app, this._config);
    if (textOn) {
      this.bottomTiles.showText();
    }
  }

  drawGuidingLines() {
    let container = new PIXI.Container();
    this._app.stage.addChild(container);
    this._app.stage.setChildIndex(container, 0);

    const horizontalLine = drawLine(this._app.screen.height);
    // @ts-ignore
    const texture = this._app.renderer.generateTexture(horizontalLine);

    let x: number = 0;
    let lastI: number; // to prevent duplicate notes from b and #
    const whiteKeyWidth = this.bottomTiles.whiteKeyWidth;

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
          container.addChild(sprite);
        }
      }
    });
    this._container = container;
    horizontalLine.destroy({
      children: true,
      baseTexture: true,
      texture: true,
    });
  }

  destroy() {
    console.log("Destroying beat lines");
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
