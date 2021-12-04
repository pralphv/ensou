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

  constructor() {
    this.app = new PIXI.Renderer({
      width: window.innerWidth,
      height: 8,
      transparent: false,
      antialias: true,
      clearBeforeRender: true,
    });
    this.stage = new PIXI.Container();

    const realProgressRect = initRectangle(this.app.screen.width, 8, 0x90eefe);
    const backgroundRect = initRectangle(this.app.screen.width, 8, 0x5c969f);
    // @ts-ignore
    const realProgressTexture = this.app.generateTexture(
      realProgressRect
    );  
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
    this.interaction.on("mousedown", this.handleOnClick);
    this.interaction.on("touchstart", this.handleOnClick);
    this.interaction.on("pointerup", () => {
      this.isDragging = false;
    });
    this.interaction.on("pointerupoutside", () => {
      this.isDragging = false;
    });

    this.interaction.on("pointermove", (e: PIXI.InteractionEvent) => {
      if (this.isDragging) {
        this.skipToPct(e.data.global.x);
      }
    });
    this.interaction.on("pointerdown", () => {
      this.isDragging = true;
    });
    window.addEventListener("resize", this.fitWindow, false);
  }

  skipToPct(x: number) {
    const pct = x / this.app.screen.width;
    myMidiPlayer.skipToPercent(pct * 100);
    this.render();
    myCanvas.render();
  }

  disconnectHTML() {
    this.progressBar.width = 0;
    this.interaction.destroy();
    this.pixiCanvas?.removeChild(this.app.view);
    this.pixiCanvas = undefined;
    window.removeEventListener("resize", this.fitWindow, false);
  }

  render() {
    if (this.container.visible) {
      const pct = Transport.ticks / myMidiPlayer.getTotalTicks();
      this.progressBar.width = this.app.screen.width * pct;
      this.app.render(this.stage);
    }
  }

  on(event: string, func: Function) {
    this.interaction.on(event, func);
  }

  hide(value?: boolean) {
    value = value === undefined ? true : value;
    this.container.visible = !value;
  }
}

function initRectangle(width: number, height: number, color: number) {
  const rect = new PIXI.Graphics();
  rect.lineStyle(height, color);
  //   rect.beginFill(0x000000);
  rect.drawRect(0, 0, width, height);
  return rect;
}

const progressBar = new ProgressBar();
export default progressBar;
