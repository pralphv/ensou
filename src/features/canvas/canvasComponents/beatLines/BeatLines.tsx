import * as PIXI from "pixi.js";

import { convertMidiTickToCanvasHeight } from "../../utils";

let CONTAINER: PIXI.Container;
let LINE_TEXTURE: PIXI.RenderTexture;

function drawLine(width: number): PIXI.Graphics {
  const line = new PIXI.Graphics();
  line.position.set(0, 0);
  line.lineStyle(3, 0x003e4d);
  line.moveTo(0, 0);
  line.lineTo(width, 0);
  line.alpha = 0.5;
  line.endFill();
  return line;
}

export function initBeatLine(app: PIXI.Application) {
  console.log("Constructing new Beat Line");
  try {
    CONTAINER.destroy({ children: true, texture: true, baseTexture: true });
  } catch {}

  const line = drawLine(app.screen.width);
  // @ts-ignore
  const texture = app.renderer.generateTexture(line);
  LINE_TEXTURE = texture;
}

export function draw(
  app: PIXI.Application,
  currentTick: number,
  ticksPerBar: number
) {
  try {
    CONTAINER.destroy({ children: true });
  } catch {}
  let container = new PIXI.Container();
  app.stage.addChild(container);
  const startTick = Math.ceil(currentTick / ticksPerBar) * ticksPerBar;
  for (let i = 0; i < 3; i++) {
    const tick = startTick + ticksPerBar * i;
    const sprite = new PIXI.Sprite(LINE_TEXTURE);
    const y = convertMidiTickToCanvasHeight(
      tick,
      currentTick,
      app.screen.height
    );
    sprite.position.y = y;
    container.addChild(sprite);
    break;
  }
  CONTAINER = container;
}
