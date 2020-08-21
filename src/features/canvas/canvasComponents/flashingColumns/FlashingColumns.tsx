import * as PIXI from "pixi.js";

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
  rect.zIndex = 1;
  return rect;
}

export function initFlashingColumns(
  noOfColumns: number,
  noteWidth: number,
  app: PIXI.Application
) {
  console.log("Constructing new Flashing Columns");
  try {
    CONTAINER.destroy({children: true, texture: true, baseTexture: true});
  } catch {}

  let container = new PIXI.Container();
  app.stage.addChild(container);

  const rect = initRectangle(noteWidth, app.screen.height);
  // @ts-ignore
  const texture = app.renderer.generateTexture(rect);
  for (let i = 0; i < noOfColumns + 1; i++) {
    const sprite = new PIXI.Sprite(texture);
    sprite.position.x = i * noteWidth;
    // sprite.position.y = app.screen.height - 35;
    container.addChild(sprite);
    COLUMNS.push(sprite);
  }
  CONTAINER = container;
  rect.destroy({children: true, texture: true, baseTexture: true});
}

export function draw(playingNotes: Set<number>) {
  for (let i = 0; i < COLUMNS.length - 1; i++) {
    // flash and unflash tiles
    const flash: boolean = playingNotes.has(i) ? true : false;
    COLUMNS[i].visible = flash;
  }
}
