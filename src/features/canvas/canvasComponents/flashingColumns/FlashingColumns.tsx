import * as PIXI from "pixi.js";
import { PIANO_TUNING } from "audio/constants";
import { BOTTOM_TILE_HEIGHT } from "features/canvas/constants";

let COLUMNS: PIXI.Sprite[] = [];
let CONTAINER: PIXI.Container;

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

export function initFlashingColumns(
  noOfColumns: number,
  noteWidth: number,
  app: PIXI.Application
) {
  console.log("Constructing new Flashing Columns");
  try {
    CONTAINER.destroy({ children: true, texture: true, baseTexture: true });
  } catch {}

  let container = new PIXI.Container();
  app.stage.addChild(container);
  app.stage.setChildIndex(container, 1);
  const whiteKeyWidth = app.screen.width / 52;
  const blackKeyWidth = whiteKeyWidth * 0.55;

  const whiteKeyRect = initRectangle(whiteKeyWidth, app.screen.height);
  const blackKeyRect = initRectangle(blackKeyWidth, app.screen.height);
  // @ts-ignore
  const whiteKeyTexture = app.renderer.generateTexture(whiteKeyRect);
  // @ts-ignore
  const blackKeyTexture = app.renderer.generateTexture(blackKeyRect);
  let x: number = 0;
  let lastI: number; // to prevent duplicate notes from b and #

  Object.entries(PIANO_TUNING).forEach(([key, i]: [string, number]) => {
    if (i !== lastI) {
      lastI = i;
      const isBlackKey = key.includes("#") || key.includes("b");
      let sprite: PIXI.Sprite;
      const texture = isBlackKey ? blackKeyTexture : whiteKeyTexture;
      sprite = new PIXI.Sprite(texture);
      if (isBlackKey) {
        sprite.position.x = x - blackKeyWidth / 2;
      } else {
        sprite.position.x = x;
      }
      sprite.position.y = -BOTTOM_TILE_HEIGHT;
      sprite.visible = false;
      container.addChild(sprite);
      COLUMNS.push(sprite);
      if (!isBlackKey) {
        x += whiteKeyWidth;
      }
    }
  });
  CONTAINER = container;
  whiteKeyRect.destroy({ children: true, texture: true, baseTexture: true });
  blackKeyRect.destroy({ children: true, texture: true, baseTexture: true });
}

export function draw(playingNotes: Set<number>) {
  for (let i = 0; i < COLUMNS.length - 1; i++) {
    // flash and unflash tiles
    const flash: boolean = playingNotes.has(i) ? true : false;
    COLUMNS[i].visible = flash;
  }
}
