import * as PIXI from "pixi.js";

let COLUMNS: PIXI.Sprite[] = [];
let CONTAINER: PIXI.Container;


function initRectangle(width: number, height: number): PIXI.Graphics {
  const rect = new PIXI.Graphics();
  rect.beginFill(0x7fdded);
  rect.drawRect(0, 0, width, height);
  rect.endFill();
  // rect.visible = false
  return rect;
}

export function initFlashingBottomTiles(
  noOfColumns: number,
  noteWidth: number,
  app: PIXI.Application
) {
  console.log("Constructing new Flashing Bottom Tiles");
  try {
    CONTAINER.destroy({children: true, texture: true, baseTexture: true});
  } catch {}

  let container = new PIXI.Container();
  app.stage.addChild(container);

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
  rect.destroy({children:true, baseTexture: true, texture: true});
}

export function draw(playingNotes: Set<number>) {
  for (let i = 0; i < COLUMNS.length - 1; i++) {
    // flash and unflash tiles
    const flash: boolean = playingNotes.has(i) ? true : false;
    COLUMNS[i].visible = flash;
  }
}
























// export function createFlashingBottomTilesRefs(
//   noteWidth: number,
//   canvasHeight: number,
//   layerRef: any
// ) {
//   console.log("Creating new flashing bottom tiles refs");
//   REFS.forEach((ref: any) => {
//     ref.destroy();
//   });
//   REFS = [];
//   const rect = new konva.Rect({
//     visible: false,
//     cornerRadius: 5,
//     width: noteWidth * 0.8,
//     height: 35,
//     stroke: "rgba(127,221,237, 0.9)",
//     shadowBlur: 10,
//     shadowColor: "#00e4fc",
//     shadowOpacity: 1,
//     fill: "rgba(127,221,237, 0.8)",
//     perfectDrawEnabled: false,
//     listening: false,
//   });
//   rect.cache();
//   let lastI: number;
//   Object.values(KALIMBA_STANDARD_TUNING).forEach((i: number) => {
//     if (i !== lastI) {
//       // handle C# Db
//       const clone = rect.clone({
//         x: i * noteWidth,
//         y: canvasHeight - 35,
//         id: `${ID}_${i}`,
//       });
//       clone.cache();
//       REFS.push(clone);
//       layerRef?.current?.add(clone);
//     }
//     lastI = i;
//   });
// }
