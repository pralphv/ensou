import * as PIXI from "pixi.js";
import { PIANO_TUNING } from "audio/constants";
import { BOTTOM_TILE_HEIGHT } from "../../constants";

let COLUMNS: PIXI.Sprite[][] = [];
let CONTAINER: PIXI.Container;

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
  app: PIXI.Application
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
  const texture = app.renderer.generateTexture(circle);
  circle.destroy({ children: true, texture: true, baseTexture: true });
  return texture;
}

export function initFlashingLightsBottomTiles(
  noOfColumns: number,
  noteWidth: number,
  app: PIXI.Application
) {
  console.log("Constructing new Flashing Lights Bottom Tiles");
  try {
    CONTAINER.destroy({ children: true, texture: true, baseTexture: true });
  } catch {}
  COLUMNS = [];
  let container = new PIXI.Container();
  app.stage.addChild(container);
  app.stage.setChildIndex(container, 5);

  const whiteKeyWidth = app.screen.width / 52;
  const blackKeyWidth = whiteKeyWidth * 0.55;
  const circle0 = initCircle(whiteKeyWidth * 5, 0.7, app);
  const circle1 = initCircle(whiteKeyWidth * 5, 0.9, app);
  const circle2 = initCircle(whiteKeyWidth * 5, 1, app);

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
          (isBlackKey ? x - blackKeyWidth / 2 : x) - whiteKeyWidth * 2;
        sprite.position.y = app.screen.height - BOTTOM_TILE_HEIGHT - whiteKeyWidth * 2;
        sprite.visible = false;
        container.addChild(sprite);
        sprites.push(sprite);
      });
      COLUMNS.push(sprites);
      if (!isBlackKey) {
        x += whiteKeyWidth;
      }
    }
  });
  CONTAINER = container;
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function draw(playingNotes: Set<number>) {
  for (let i = 0; i < COLUMNS.length - 1; i++) {
    // flash and unflash tiles
    const spriteToFlash = getRandomInt(0, 2);
    const targetNote: boolean = playingNotes.has(i) ? true : false;
    for (let j = 0; j < COLUMNS[i].length; j++) {
      COLUMNS[i][j].visible = targetNote && j === spriteToFlash;
    }
  }
}
