import * as PIXI from "pixi.js";
import { Transport } from "tone";

import myMidiPlayer from "audio";
import MyCanvas from "../canvas";
import { BUTTON_HEIGHT } from "features/toolbar/constants";

class ProgressBar {
  myCanvas: MyCanvas;
  isDragging: boolean;
  interaction!: PIXI.InteractionManager;
  progressBar: PIXI.Sprite;
  background: PIXI.Sprite;
  container: PIXI.Container;
  playTimetextField: PIXI.Text;

  constructor(myCanvas: MyCanvas) {
    this.myCanvas = myCanvas;
    this.playTimetextField = new PIXI.Text("", {
      fontSize: 15,
      fill: 0x000000,
    });

    const realProgressRect = initRectangle(
      myCanvas.app.screen.width,
      myCanvas.config.progressBarHeight,
      0x90eefe
    );
    const backgroundRect = initRectangle(
      myCanvas.app.screen.width,
      myCanvas.config.progressBarHeight,
      0x858585
    );
    // @ts-ignore
    const realProgressTexture = this.myCanvas.app.generateTexture(realProgressRect);
    // @ts-ignore
    const backgroundTexture = this.myCanvas.app.generateTexture(backgroundRect);
    this.container = new PIXI.Container();
    this.progressBar = new PIXI.Sprite(realProgressTexture);
    this.background = new PIXI.Sprite(backgroundTexture);
    this.container.addChild(this.background);
    this.container.addChild(this.progressBar);
    this.container.position.y =
      myCanvas.app.screen.height - BUTTON_HEIGHT - myCanvas.config.progressBarHeight;
    myCanvas.wholeCanvasStage.addChild(this.container);

    this.isDragging = false;
    this.draw = this.draw.bind(this);
    this.handleOnClick = this.handleOnClick.bind(this);
    this.fitWindow = this.fitWindow.bind(this);
    this.skipToPct = this.skipToPct.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.startInteraction();
  }

  startInteraction() {
    [this.background, this.progressBar].forEach((sprite) => {
      sprite.interactive = true;
      sprite.buttonMode = true;
      sprite
        .on("mousedown", this.handleOnClick)
        .on("touchstart", this.handleOnClick)
        .on("pointerdown", () => {
          this.isDragging = true;
        })
        .on("pointerup", () => {
          this.isDragging = false;
        })
        .on("pointerupoutside", () => {
          this.isDragging = false;
        })
        .on("pointermove", (e: PIXI.InteractionEvent) => {
          if (this.isDragging) {
            this.skipToPct(e.data.global.x);
          }
        })
        .on("mouseover", this.handleMouseOver)
        .on("mouseout", this.handleMouseOut);
    });
  }

  fitWindow() {
    this.myCanvas.app.view.style.width = `${window.innerWidth}px`;
  }

  handleOnClick(e: PIXI.InteractionEvent) {
    this.skipToPct(e.data.global.x);
  }

  show() {
    this.container.alpha = 1;
    this.myCanvas.runRender();
  }

  hide() {
    this.container.alpha = 0;
    this.myCanvas.runRender();
  }

  handleMouseOver(e: PIXI.InteractionEvent) {
    this.show();
    this.playTimetextField.text = "jer";
    this.playTimetextField.x = e.data.global.x;
    this.playTimetextField.y = 0;
  }

  handleMouseOut() {}

  skipToPct(x: number) {
    const pct = x / this.myCanvas.app.screen.width;
    myMidiPlayer.skipToPercent(pct);
    const tick = Transport.ticks;
    myMidiPlayer.setLoopPoints(tick, tick);
  }

  disconnectHTML() {
    this.progressBar.width = 0;
    window.removeEventListener("resize", this.fitWindow, false);
  }

  draw(tick: number) {
    if (this.container.visible) {
      const pct = tick / myMidiPlayer.getTotalTicks();
      this.progressBar.width = this.myCanvas.app.screen.width * pct;
    }
  }

  on(event: string, func: Function) {
    this.interaction.on(event, func);
  }
}

function initRectangle(width: number, height: number, color: number) {
  const rect = new PIXI.Graphics();
  rect.beginFill(color, 1);
  rect.drawRect(0, 0, width, height);
  return rect;
}

export default ProgressBar;
