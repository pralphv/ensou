import * as PIXI from "pixi.js";
import { PIANO_TUNING } from "audio/constants";

let CONTAINER: PIXI.Container;

const GUIDE_LINES_NOTE_NUMBER = [
  2,
  7,
  14,
  19,
  26,
  31,
  38,
  43,
  50,
  55,
  62,
  67,
  74,
  79,
  86,
];

function drawLine(height: number): PIXI.Graphics {
  const line = new PIXI.Graphics();
  line.position.set(0, 0);
  line.lineStyle(1.5, 0x353535);
  line.moveTo(0, 0);
  line.lineTo(0, height);
  line.alpha = 0.9;
  line.endFill();
  return line;
}

export function initGuideLine(app: PIXI.Application) {
  console.log("Constructing new Guide Line");
  try {
    CONTAINER.destroy({ children: true, texture: true, baseTexture: true });
  } catch {}
  let container = new PIXI.Container();
  app.stage.addChild(container);
  app.stage.setChildIndex(container, 0);

  const horizontalLine = drawLine(app.screen.height);
  // @ts-ignore
  const texture = app.renderer.generateTexture(horizontalLine);

  let x: number = 0;
  let lastI: number; // to prevent duplicate notes from b and #
  const whiteKeyWidth = app.screen.width / 52;

  Object.entries(PIANO_TUNING).forEach(([key, i]: [string, number]) => {
    if (i !== lastI) {
      lastI = i;
      const isBlackKey = key.includes("#") || key.includes("b");

      if (!isBlackKey) {
        x += whiteKeyWidth;
      }
      if (GUIDE_LINES_NOTE_NUMBER.includes(i)) {
        const sprite = new PIXI.Sprite(texture);
        sprite.position.x = x;
        container.addChild(sprite);
      }

    }
  });
  horizontalLine.destroy({ children: true, baseTexture: true, texture: true });
}
