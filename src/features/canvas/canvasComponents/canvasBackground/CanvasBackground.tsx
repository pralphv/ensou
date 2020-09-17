export const a = 1;
// import konva from "konva";
// import { destroyCanvasNodes } from "../utils";

// const ID: string = "canvasBackground";

// export function createCanvasBackground(
//   noteWidth: number,
//   canvasHeight: number,
//   layerRef: any
// ) {
//   console.log("Creating new background");
//   destroyCanvasNodes(layerRef, ID);
//   const rect = new konva.Rect({
//     width: noteWidth * 0.8,
//     height: canvasHeight + 10,
//     opacity: 0.5,
//     stroke: "rgba(232, 255, 255, 0.3)",
//     strokeWidth: 1.5,
//     fill: "#002634",
//     perfectDrawEnabled: false,
//     listening: false,
//   });
//   rect.cache();
//   [2, 5, 8, 11, 14].forEach((num: number, i: number) => {
//     const clone = rect.clone({
//       x: num * noteWidth,
//       y: -40,
//       id: `${ID}_${i}`,
//     });
//     layerRef?.current?.add(clone);
//   });
// }
