import * as PIXI from "pixi.js";

let SPRITE: PIXI.Sprite;
let OLD_TEXTURE: PIXI.Texture;
let canBeDestroyed: boolean; // why code so shit and hacky

function initRectangle(width: number, height: number): PIXI.Graphics {
  const rect = new PIXI.Graphics();
  rect.beginFill(0x008cd9);
  rect.alpha = 0.3;
  rect.lineStyle(3, 0x4dafff, 0.6);
  rect.drawRect(0, 0, width * 0.999, height);
  rect.endFill();
  return rect;
}

export function initHighlighter(
  app: PIXI.Application,
  startY: number,
  endY: number
) {
  // console.log("Constructing new Highlighter");
  destroy();
  const rect = initRectangle(app.screen.width, Math.abs(endY - startY));
  // @ts-ignore
  const texture = app.renderer.generateTexture(rect);
  const sprite = new PIXI.Sprite(texture);
  sprite.position.y = endY > startY ? startY : endY;
  app.stage.addChild(sprite);
  SPRITE = sprite;
  OLD_TEXTURE = texture;
  canBeDestroyed = true;
  rect.destroy({ children: true, texture: true, baseTexture: true });
}

export function destroy() {
  if (canBeDestroyed) {
    SPRITE.destroy({ children: true, texture: true, baseTexture: true });
    OLD_TEXTURE.destroy(true);
    canBeDestroyed = false;
  }
}
