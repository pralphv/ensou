import * as PIXI from "pixi.js";
import { PIANO_TUNING } from "audio/constants";
import { BOTTOM_TILE_HEIGHT } from "../../constants";

let COLUMNS: PIXI.Sprite[] = [];
let CONTAINER: PIXI.Container;

function initRectangle(width: number, height: number): PIXI.Graphics {
  const rect = new PIXI.Graphics();
  rect.beginFill(0x7fdded);
  rect.drawRect(0, 0, width, height);
  rect.endFill();
  return rect;
}

export function initFlashingBottomTiles(
  noOfColumns: number,
  noteWidth: number,
  app: PIXI.Application
) {
  console.log("Constructing new Flashing Bottom Tiles");
  try {
    CONTAINER.destroy({ children: true, texture: true, baseTexture: true });
  } catch {}
  COLUMNS = [];

  let container = new PIXI.Container();
  app.stage.addChild(container);
  app.stage.setChildIndex(container, 4);
  const whiteKeyWidth = app.screen.width / 52;
  const blackKeyWidth = whiteKeyWidth * 0.55;

  const whiteKey = initRectangle(whiteKeyWidth + 1, BOTTOM_TILE_HEIGHT);
  const blackKey = initRectangle(blackKeyWidth + 1, BOTTOM_TILE_HEIGHT * 0.66);
  // @ts-ignore
  const whiteKeyTexture = app.renderer.generateTexture(whiteKey);
  // @ts-ignore
  const blackKeyTexture = app.renderer.generateTexture(blackKey);
  let x: number = 0;
  let lastI: number; // to prevent duplicate notes from b and #
  Object.entries(PIANO_TUNING).forEach(([key, i]: [string, number]) => {
    if (i !== lastI) {
      lastI = i;
      const isBlackKey = key.includes("#") || key.includes("b");
      let sprite: PIXI.Sprite;
      if (isBlackKey) {
        sprite = new PIXI.Sprite(blackKeyTexture);
        sprite.position.x = x - blackKeyWidth / 2;
      } else {
        sprite = new PIXI.Sprite(whiteKeyTexture);
        sprite.position.x = x;
        x += whiteKeyWidth;
      }
      sprite.position.y = app.screen.height - 51;
      sprite.visible = false;
      container.addChild(sprite);
      COLUMNS.push(sprite);
    }
  });
  CONTAINER = container;
  whiteKey.destroy({ children: true, baseTexture: true, texture: true });
  blackKey.destroy({ children: true, baseTexture: true, texture: true });
}

export function draw(playingNotes: Set<number>) {
  for (let i = 0; i < COLUMNS.length - 1; i++) {
    // flash and unflash tiles
    const flash: boolean = playingNotes.has(i) ? true : false;
    COLUMNS[i].visible = flash;
  }
}

/**
 *   const rect = initRectangle(noteWidth, 50);
  // @ts-ignore
  const texture = app.renderer.generateTexture(rect);
  for (let i = 0; i < noOfColumns + 1; i++) {
    const sprite = new PIXI.Sprite(texture);
    sprite.position.x = i * noteWidth;
    sprite.position.y = app.screen.height - 35;

 */