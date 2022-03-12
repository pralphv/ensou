import * as PIXI from "pixi.js";
import { PIANO_TUNING } from "audio/constants";
import myMidiPlayer from "audio";
import * as types from "../types";
import MyCanvas from "../canvas";

export default class FlashingLightsBottomTiles {
  _container: PIXI.Container;
  _columns: PIXI.Sprite[][];
  constructor(myCanvas: MyCanvas) {
    this._container = new PIXI.Container();
    this._columns = [];

    myCanvas.stage.addChild(this._container);
    myCanvas.stage.setChildIndex(this._container, 4);

    const circle0 = initCircle(
      myCanvas.config.whiteKeyWidth * 5,
      0.7,
      myCanvas.app
    );
    const circle1 = initCircle(
      myCanvas.config.whiteKeyWidth * 5,
      0.9,
      myCanvas.app
    );
    const circle2 = initCircle(
      myCanvas.config.whiteKeyWidth * 5,
      1,
      myCanvas.app
    );

    let x: number = 0;
    let lastI: number; // to prevent duplicate notes from b and #
    Object.entries(PIANO_TUNING).forEach(([key, i]: [string, number]) => {
      if (i !== lastI) {
        lastI = i;
        const isBlackKey = key.includes("#") || key.includes("b");
        let sprites: PIXI.Sprite[] = [];
        [circle0, circle1, circle2].forEach((circle) => {
          const sprite = new PIXI.Sprite(circle);
          sprite.position.x =
            (isBlackKey ? x - myCanvas.config.blackKeyWidth / 2 : x) -
            myCanvas.config.whiteKeyWidth * 2;
          sprite.position.y =
            myCanvas.config.coreCanvasHeight -
            myCanvas.config.bottomTileHeight -
            myCanvas.config.whiteKeyWidth * 2;
          sprite.visible = false;
          this._container.addChild(sprite);
          sprites.push(sprite);
        });
        this._columns.push(sprites);
        if (!isBlackKey) {
          x += myCanvas.config.whiteKeyWidth;
        }
      }
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

function gradient(
  from: string,
  to: string,
  radius: number,
  widthPercent: number
) {
  const c = document.createElement("canvas");
  let ctx = c.getContext("2d") as CanvasRenderingContext2D;
  const grd = ctx.createRadialGradient(
    radius,
    radius,
    radius / 5,
    radius,
    radius,
    radius * widthPercent
  );
  grd.addColorStop(0, from);
  grd.addColorStop(0.2, from);
  grd.addColorStop(1, to);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, radius * 2, radius * 2);
  const texture = PIXI.Texture.from(c);
  return texture;
}

function initCircle(
  width: number,
  widthPercent: number,
  app: PIXI.Renderer
): PIXI.Texture {
  const circle = new PIXI.Graphics();
  circle.beginTextureFill({
    texture: gradient(
      "#eee",
      "rgba(255, 255, 255, 0)",
      width / 2,
      widthPercent
    ),
  });
  circle.alpha = 0.6;
  circle.drawRect(0, 0, width, width);
  // @ts-ignore
  const texture = app.generateTexture(circle);
  circle.destroy({ children: true, texture: true, baseTexture: true });
  return texture;
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
