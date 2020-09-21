import * as PIXI from "pixi.js";

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

  const circle0 = initCircle(noteWidth * 5, 0.7, app);
  const circle1 = initCircle(noteWidth * 5, 0.9, app);
  const circle2 = initCircle(noteWidth * 5, 1, app);
  for (let i = 0; i < noOfColumns + 1; i++) {
    const sprite0 = new PIXI.Sprite(circle0);
    const sprite1 = new PIXI.Sprite(circle1);
    const sprite2 = new PIXI.Sprite(circle2);
    sprite0.position.x = i * noteWidth - noteWidth * 2;
    sprite0.position.y = app.screen.height - (35 + noteWidth * 2);
    sprite0.visible = false;
    sprite1.position.x = i * noteWidth - noteWidth * 2;
    sprite1.position.y = app.screen.height - (35 + noteWidth * 2);
    sprite1.visible = false;
    sprite2.position.x = i * noteWidth - noteWidth * 2;
    sprite2.position.y = app.screen.height - (35 + noteWidth * 2);
    sprite2.visible = false;

    container.addChild(sprite0);
    container.addChild(sprite1);
    container.addChild(sprite2);
    COLUMNS.push([sprite0, sprite1, sprite2]);
  }
  CONTAINER = container;
  // circle0.destroy();
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
    COLUMNS[i].forEach((col, index: number) => {
      const flash = targetNote && index === spriteToFlash;
      COLUMNS[i][index].visible = flash;
    });
  }
}
