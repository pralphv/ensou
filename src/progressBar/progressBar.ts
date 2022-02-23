import * as PIXI from "pixi.js";
import { Transport } from "tone";

import myMidiPlayer from "audio";
import myCanvas from "canvas";

class ProgressBar {
  pixiCanvas?: HTMLDivElement;
  app: PIXI.Renderer;
  stage: PIXI.Container;
  isDragging: boolean;
  interaction!: PIXI.InteractionManager;
  progressBar: PIXI.Sprite;
  container: PIXI.Container;
  playTimetextField: PIXI.Text;

  constructor() {
    this.app = new PIXI.Renderer({
      width: window.innerWidth,
      height: 8,
      transparent: true,
      antialias: false,
      clearBeforeRender: true,
    });
    this.stage = new PIXI.Container();
    this.playTimetextField = new PIXI.Text("", {
      fontSize: 15,
      fill: 0x000000,
    });

    const realProgressRect = initRectangle(this.app.screen.width, 8, 0x90eefe);
    const backgroundRect = initRectangle(this.app.screen.width, 8, 0x858585);
    // @ts-ignore
    const realProgressTexture = this.app.generateTexture(realProgressRect);
    // @ts-ignore
    const backgroundTexture = this.app.generateTexture(backgroundRect);
    this.container = new PIXI.Container();
    this.progressBar = new PIXI.Sprite(realProgressTexture);
    const background = new PIXI.Sprite(backgroundTexture);
    this.container.addChild(background);
    this.container.addChild(this.progressBar);
    this.stage.addChild(this.container);

    this.isDragging = false;
    this.render = this.render.bind(this);
    this.handleOnClick = this.handleOnClick.bind(this);
    this.fitWindow = this.fitWindow.bind(this);
    this.skipToPct = this.skipToPct.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
  }

  fitWindow() {
    if (this.app) {
      this.app.view.style.width = `${window.innerWidth}px`;
    }
  }

  handleOnClick(e: PIXI.InteractionEvent) {
    this.skipToPct(e.data.global.x);
  }

  connectHTML(htmlRef: HTMLDivElement) {
    if (this.pixiCanvas) {
      return;
    }
    console.log("Attaching ProgressBar to HTML");
    htmlRef.appendChild(this.app.view);
    this.pixiCanvas = htmlRef;
    this.interaction = new PIXI.InteractionManager(this.app);
    this.interaction
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
    window.addEventListener("resize", this.fitWindow, false);
  }

  show() {
    this.stage.alpha = 0.8;
    this.minimumRender();
  }

  hide() {
    this.stage.alpha = 0;
    this.minimumRender();
  }

  handleMouseOver(e: PIXI.InteractionEvent) {
    this.show();
    this.playTimetextField.text = "jer";
    this.playTimetextField.x = e.data.global.x;
    this.playTimetextField.y = 0;
  }

  handleMouseOut() {}

  skipToPct(x: number) {
    const pct = x / this.app.screen.width;
    myMidiPlayer.skipToPercent(pct);
    const tick = Transport.ticks;
    myMidiPlayer.setLoopPoints(tick, tick);
    this.render(tick);
    myCanvas.render(tick);
  }

  disconnectHTML() {
    this.progressBar.width = 0;
    this.interaction.destroy();
    this.pixiCanvas?.removeChild(this.app.view);
    this.pixiCanvas = undefined;
    window.removeEventListener("resize", this.fitWindow, false);
  }

  minimumRender() {
    // only renders show and hide
    this.app.render(this.stage); // the render function only renders if container is visible
  }

  render(tick: number) {
    if (this.container.visible) {
      const pct = tick / myMidiPlayer.getTotalTicks();
      this.progressBar.width = this.app.screen.width * pct;
      this.app.render(this.stage);
    }
  }

  on(event: string, func: Function) {
    this.interaction.on(event, func);
  }
}

function initRectangle(width: number, height: number, color: number) {
  const rect = new PIXI.Graphics();
  rect.beginFill(color, 0.8);
  rect.drawRect(0, 0, width, height);
  return rect;
}

const progressBar = new ProgressBar();
export default progressBar;
