import * as PIXI from "pixi.js";

let CONTAINER: PIXI.Container;

function initRectangle(width: number, height: number) {
  const rect = new PIXI.Graphics();
  rect.lineStyle(1.5, 0x7fdded);
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
    CONTAINER.destroy({children: true, texture: true, baseTexture: true});
  } catch {}

  let container = new PIXI.Container();
  app.stage.addChild(container);

  const rect = initRectangle(noteWidth, tileHeight);
  // @ts-ignore
  const texture = app.renderer.generateTexture(rect);
  for (let i = 0; i < noOfTiles; i++) {
    const sprite = new PIXI.Sprite(texture);
    sprite.position.x = i * noteWidth;
    sprite.position.y = app.screen.height - 35;
    
    container.addChild(sprite);
  }
  CONTAINER = container;
  rect.destroy({children: true, texture: true, baseTexture: true});
}
