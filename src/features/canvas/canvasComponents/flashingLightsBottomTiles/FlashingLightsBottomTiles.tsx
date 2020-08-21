import * as PIXI from "pixi.js";

let COLUMNS: PIXI.Sprite[] = [];
let CONTAINER: PIXI.Container;

function gradient(from: string, to: string, width: number) {
  const c = document.createElement("canvas");
  let ctx = c.getContext("2d") as CanvasRenderingContext2D;
  // ctx.beginPath();
  // ctx.arc(width, width, width / 2, 0, Math.PI * 2);
  const grd = ctx.createRadialGradient(
    width * 0.7,
    width * 0.7,
    width * 0.01,
    width * 0.8,
    width * 0.8,
    width * 0.5
  );
  grd.addColorStop(0, from);
  grd.addColorStop(1, to);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width * 2, width * 2);
  const texture = PIXI.Texture.from(c);
  return texture;
}

function initCircle(width: number): PIXI.Graphics {
  const circle = new PIXI.Graphics();
  circle.beginTextureFill({ texture: gradient("#eee", "#121212", width * 2) });
  // circle.alpha = 0.33;
  circle.drawCircle(width + width / 2, width + width / 2, width);
  circle.zIndex = 1;
  return circle;
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

  let container = new PIXI.Container();
  app.stage.addChild(container);

  const circle = initCircle(noteWidth);
  // @ts-ignore
  const texture = app.renderer.generateTexture(circle);
  for (let i = 0; i < noOfColumns + 1; i++) {
    const sprite = new PIXI.Sprite(texture);
    sprite.position.x = i * noteWidth - noteWidth / 2;
    sprite.position.y = app.screen.height - 50;
    container.addChild(sprite);
    COLUMNS.push(sprite);
  }
  CONTAINER = container;
  circle.destroy({ children: true, texture: true, baseTexture: true });
}
function randomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}export function draw(playingNotes: Set<number>) {
  for (let i = 0; i < COLUMNS.length - 1; i++) {
    // flash and unflash tiles
    const flash: boolean = playingNotes.has(i) ? true : false;
    // COLUMNS[i].height = randomNumber(0.9, 1.1) * COLUMNS[i].height;
    COLUMNS[i].visible = flash;
  }
}
