import * as PIXI from "pixi.js";
import { Transport } from "tone";

import myMidiPlayer from "audio";
import MyCanvas from "../canvas";
import { BUTTON_HEIGHT } from "features/toolbar/constants";
import { secTotime } from "utils/helper";

class ProgressBar {
  myCanvas: MyCanvas;
  isDragging: boolean;
  progressBar: PIXI.Sprite;
  background: PIXI.Sprite;
  container: PIXI.Container;
  playTimetextField: PIXI.Text;
  isHovering: boolean;

  constructor(myCanvas: MyCanvas) {
    this.myCanvas = myCanvas;
    this.isHovering = false;
    this.playTimetextField = new PIXI.Text("", {
      fontSize: 15,
      fill: 0xffffff,
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
    const realProgressTexture = myCanvas.app.generateTexture(realProgressRect);
    // @ts-ignore
    const backgroundTexture = this.myCanvas.app.generateTexture(backgroundRect);
    this.container = new PIXI.Container();
    this.progressBar = new PIXI.Sprite(realProgressTexture);
    this.background = new PIXI.Sprite(backgroundTexture);
    this.container.addChild(this.background);
    this.container.addChild(this.progressBar);
    this.container.addChild(this.playTimetextField);
    this.playTimetextField.anchor.set(0.5);
    this.progressBar.anchor.y = 0.5;
    this.background.anchor.y = 0.5;

    myCanvas.wholeCanvasStage.addChild(this.container);

    this.resize();

    this.isDragging = false;
    this.draw = this.draw.bind(this);
    this.handleOnClick = this.handleOnClick.bind(this);
    this.fitWindow = this.fitWindow.bind(this);
    this.skipToPct = this.skipToPct.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.startInteraction();
  }

  resize() {
    [this.background, this.progressBar].forEach((sprite) => {
      sprite.width = this.myCanvas.app.screen.width
    })
    this.container.position.y =
    this.myCanvas.app.screen.height -
    BUTTON_HEIGHT -
    this.myCanvas.config.progressBarHeight;
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
          this.hideSongTime();
          this.isDragging = false;
          this.myCanvas.safeRender();
        })
        .on("pointermove", (e: PIXI.InteractionEvent) => {
          if (this.isDragging) {
            this.skipToPct(e.data.global.x);
          }
          if (this.isHovering || this.isDragging) {
            const pct = e.data.global.x / this.myCanvas.app.screen.width;
            this.playTimetextField.text = secTotime(
              myMidiPlayer.totalTimeSeconds * pct
            );
            this.playTimetextField.x = e.data.global.x;
            this.playTimetextField.y = -20;
            this.showSongTime();
            this.myCanvas.safeRender();
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
    this.myCanvas.safeRender();
  }

  hide() {
    this.container.alpha = 0;
    this.myCanvas.safeRender();
  }

  handleMouseOver(e: PIXI.InteractionEvent) {
    this.show();
    this.isHovering = true;
    this.background.height = this.myCanvas.config.progressBarHeight * 1.5;
    this.progressBar.height = this.myCanvas.config.progressBarHeight * 1.5;
  }

  handleMouseOut() {
    this.isHovering = false;
    this.hideSongTime();
    this.background.height = this.myCanvas.config.progressBarHeight;
    this.progressBar.height = this.myCanvas.config.progressBarHeight;
    this.myCanvas.safeRender();
    // this.show();
  }

  showSongTime() {
    this.playTimetextField.alpha = 1;
  }

  hideSongTime() {
    this.playTimetextField.alpha = 0;
  }

  skipToPct(x: number) {
    const pct = x / this.myCanvas.app.screen.width;
    myMidiPlayer.skipToPercent(pct);
    const tick = Transport.ticks;
    myMidiPlayer.setLoopPoints(tick, tick);
    this.myCanvas.safeRender();
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

  destroy() {
    this.progressBar.destroy({
      baseTexture: true,
      children: true,
      texture: true,
    });
    this.background.destroy({
      baseTexture: true,
      children: true,
      texture: true,
    });
  }
}

function initRectangle(width: number, height: number, color: number) {
  const rect = new PIXI.Graphics();
  rect.beginFill(color, 1);
  rect.drawRect(0, 0, width, height);
  return rect;
}

export default ProgressBar;
