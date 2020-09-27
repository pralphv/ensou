import * as PIXI from "pixi.js";
import { PIANO_TUNING } from "audio/constants";
import { BOTTOM_TILE_HEIGHT } from "../../constants";

let CONTAINER: PIXI.Container;
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
    texture: gradient("#000000", "rgba(0, 0, 0, 0)", width, height),
  });
  rect.drawRect(0, 0, width, height);
  return rect;
}

function initRectangle(width: number, height: number, fill: boolean) {
  const rect = new PIXI.Graphics();
  rect.lineStyle(1.5, 0x7fdded);
  if (fill) {
    rect.beginFill(0x000000);
  }
  rect.drawRect(0, 0, width, height);
  return rect;
}

export function initBottomTiles(
  noteWidth: number,
  tileHeight: number,
  noOfTiles: number,
  app: PIXI.Application
) {
  console.log("Constructing new bottom tiles");
  try {
    CONTAINER.destroy({ children: true, texture: true, baseTexture: true });
  } catch {}

  let container = new PIXI.Container();
  app.stage.addChild(container);
  app.stage.setChildIndex(container, 3);

  const whiteKeyWidth = app.screen.width / 52;
  const blackKeyWidth = whiteKeyWidth * 0.55;

  const whiteKey = initRectangle(whiteKeyWidth, BOTTOM_TILE_HEIGHT, true);
  const blackKey = initRectangle(
    blackKeyWidth,
    BOTTOM_TILE_HEIGHT * 0.66,
    true
  );

  // @ts-ignore
  const whiteKeyTexture = app.renderer.generateTexture(whiteKey);
  // @ts-ignore
  const blackKeyTexture = app.renderer.generateTexture(blackKey);
  let x: number = 0;
  let lastI: number; // to prevent duplicate notes from b and #
  const whiteKeyContainer = new PIXI.Container();
  const blackKeyContainer = new PIXI.Container();

  Object.entries(PIANO_TUNING).forEach(([key, i]: [string, number]) => {
    if (i !== lastI) {
      lastI = i;
      const isBlackKey = key.includes("#") || key.includes("b");
      let sprite: PIXI.Sprite;
      if (isBlackKey) {
        sprite = new PIXI.Sprite(blackKeyTexture);
        blackKeyContainer.addChild(sprite);
        sprite.position.x = x - blackKeyWidth / 2;
      } else {
        sprite = new PIXI.Sprite(whiteKeyTexture);
        whiteKeyContainer.addChild(sprite);
        sprite.position.x = x;
        x += whiteKeyWidth;
      }
      sprite.position.y = app.screen.height - 51;
    }
  });
  container.addChild(whiteKeyContainer);
  container.addChild(blackKeyContainer);

  // black top overlay
  const blackRect = initBlackColorOverlay(
    app.screen.width,
    app.screen.height * 0.3
  );
  // @ts-ignore
  const blackTexture = app.renderer.generateTexture(blackRect);
  const sprite = new PIXI.Sprite(blackTexture);
  sprite.position.x = 0;
  sprite.position.y = 0;
  container.addChild(sprite);

  CONTAINER = container;
  whiteKey.destroy({ children: true, baseTexture: true, texture: true });
  blackKey.destroy({ children: true, baseTexture: true, texture: true });
}

/**
 *   const rect = initRectangle(noteWidth, tileHeight);
  // @ts-ignore
  const texture = app.renderer.generateTexture(rect);
  for (let i = 0; i < noOfTiles; i++) {
    const sprite = new PIXI.Sprite(texture);
    sprite.position.x = i * noteWidth;
    sprite.position.y = app.screen.height - 35;


 */
