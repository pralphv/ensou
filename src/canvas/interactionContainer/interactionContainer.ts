import * as PIXI from "pixi.js";
import { Transport } from "tone";

import myMidiPlayer from "audio";
import MyCanvas from "../canvas";
import { convertCanvasHeightToMidiTick } from "../utils";
import { BUTTON_HEIGHT } from "features/toolbar/constants";

const SCROLL_BUFFER: number = 300;

export default class InteractionContainer {
  _container: PIXI.Container;
  isDragging: boolean;
  isHovering: boolean;
  isShift: boolean;
  lastClickedTick: number;
  myCanvas: MyCanvas;
  interactionSprite: PIXI.Sprite;

  constructor(myCanvas: MyCanvas) {
    this.myCanvas = myCanvas;
    this.isDragging = false;
    this.isHovering = false;
    this.isShift = false;
    this.lastClickedTick = 0;

    this._container = new PIXI.Container();
    const filler = initRectangle(
      myCanvas.app.screen.width,
      myCanvas.config.yCenterCompensate * 2 +
        myCanvas.config.coreCanvasHeight -
        BUTTON_HEIGHT -
        myCanvas.config.progressBarHeight * 2
    );
    // @ts-ignore
    const fillerTexture = myCanvas.app.generateTexture(filler);
    this.interactionSprite = new PIXI.Sprite(fillerTexture);
    this._container.addChild(this.interactionSprite);
    myCanvas.wholeCanvasStage.addChild(this._container);
    myCanvas.wholeCanvasStage.setChildIndex(
      this._container,
      myCanvas.wholeCanvasStage.children.length - 1
    );
    this.interactionSprite.interactive = true;
    this.interactionSprite
      .on("pointermove", (e: PIXI.InteractionEvent) => {
        if (this.isDragging) {
          const y: number = e.data.global.y;
          let tick: number = convertCanvasHeightToMidiTick(y, Transport.ticks);
          const newIsLarger: boolean = tick >= this.lastClickedTick;
          const startTick = newIsLarger ? this.lastClickedTick : tick;
          let endTick = newIsLarger ? tick : this.lastClickedTick;
          // prevent small ranges due to slow clicks
          endTick = endTick - startTick > 10 ? endTick : startTick;
          myMidiPlayer.setLoopPoints(startTick, endTick);
          const currentTick = Transport.ticks;
          myCanvas.highlighter.draw(currentTick);
          myCanvas.render(currentTick);
        }
      })
      .on("pointertap", () => {})
      .on("pointerdown", (e: PIXI.InteractionEvent) => {
        if (myMidiPlayer.getIsPlaying()) {
          myMidiPlayer.pause();
          return;
        }
        myCanvas.highlighter.activate();
        const currentTick = Transport.ticks;
        this.isDragging = true;
        const y: number = e.data.global.y;
        let tick: number = convertCanvasHeightToMidiTick(y, currentTick);

        const startTick: number = this.isShift
          ? Math.min(this.lastClickedTick, tick)
          : tick;
        const endTick: number = this.isShift
          ? Math.max(this.lastClickedTick, tick)
          : tick;
        myMidiPlayer.setLoopPoints(startTick, endTick);

        if (!this.isShift) {
          // for multi shift clicking
          this.lastClickedTick = convertCanvasHeightToMidiTick(y, currentTick);
        }
        myCanvas.render(currentTick);
      })
      .on("pointerup", () => {
        this.isDragging = false;
      })
      .on("pointerout", () => {
        this.isDragging = false;
      })
      .on("mouseout", () => {
        this.isHovering = false;
      })
      .on("mouseover", () => {
        this.isHovering = true;
      });
    window.addEventListener("keydown", (e) => {
      if (e.shiftKey) {
        this.isShift = true;
      }
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "Shift") {
        this.isShift = false;
      }
    });
    window.addEventListener("wheel", (e) => {
      if (!this.isHovering) {
        return;
      }
      const totalTicks = myMidiPlayer.getTotalTicks();
      if (e.ctrlKey) {
        // maybe zoom in out
      }
      if (totalTicks) {
        // if (Transport.ticks && totalTicks) {
        let newTick: number = Transport.ticks + e.deltaY / 2;
        const withinUpperLimit = newTick + SCROLL_BUFFER < totalTicks;
        const withinLowerLimit = newTick > 0;
        if (withinUpperLimit && withinLowerLimit) {
          myMidiPlayer.skipToTick(newTick);
          myCanvas.render(newTick);
        }
      }
    });
  }

  resize() {
    this.interactionSprite.height =
      this.myCanvas.config.yCenterCompensate * 2 +
      this.myCanvas.config.coreCanvasHeight -
      BUTTON_HEIGHT -
      this.myCanvas.config.progressBarHeight * 2;
  }

  destroy() {
    this._container.destroy({
      children: true,
      texture: true,
      baseTexture: true,
    });
  }
}

function initRectangle(width: number, height: number) {
  const rect = new PIXI.Graphics();
  //   rect.beginFill(0x7fdded, 1);
  rect.drawRect(0, 0, width, height);
  return rect;
}
