import * as PIXI from "pixi.js";

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

  const rect = initRectangle(noteWidth, 50);
  // @ts-ignore
  const texture = app.renderer.generateTexture(rect);
  for (let i = 0; i < noOfColumns + 1; i++) {
    const sprite = new PIXI.Sprite(texture);
    sprite.position.x = i * noteWidth;
    sprite.position.y = app.screen.height - 35;
    container.addChild(sprite);
    COLUMNS.push(sprite);
  }
  CONTAINER = container;
  rect.destroy({ children: true, baseTexture: true, texture: true });
}

export function draw(playingNotes: Set<number>) {
  for (let i = 0; i < COLUMNS.length - 1; i++) {
    // flash and unflash tiles
    const flash: boolean = playingNotes.has(i) ? true : false;
    COLUMNS[i].visible = flash;
  }
}
