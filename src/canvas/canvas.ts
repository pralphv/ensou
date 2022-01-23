import * as PIXI from "pixi.js";
import { Transport } from "tone";
import BeatLines from "./beatLines/beatlines";
import Background from "./background/background";
import FlashingColumns from "./flashingColumns/flashingColumns";
import FallingNotes from "./fallingNotes/fallingNotes";
import FlashingBottomTiles from "./flashingBottomTiles/flashingBottomTiles";
import FlashingLightsBottomTiles from "./flashingLightsBottomTiles/flashingLightsBottomTiles";
import Highlighter from "./highlighter/highlighter";
import ComboDisplay from "./comboDisplay/comboDisplay";
import * as types from "./types";
import myMidiPlayer from "audio";
import progressBar from "progressBar";
import { convertCanvasHeightToMidiTick } from "./utils";

class MyCanvas {
  pixiCanvas?: HTMLDivElement;
  app: PIXI.Renderer;
  stage: PIXI.Container;
  beatLines!: BeatLines;
  background!: Background;
  flashingColumns!: FlashingColumns;
  fallingNotes!: FallingNotes;
  flashingBottomTiles!: FlashingBottomTiles;
  flashingLightsBottomTiles!: FlashingLightsBottomTiles;
  highlighter: Highlighter;
  config: types.IMyCanvasConfig;
  isShift: boolean;
  lastClickedTick: number;
  isDragging: boolean;
  interaction!: PIXI.InteractionManager;
  isHovering: boolean;
  isHorizontal: boolean;
  comboDisplay: ComboDisplay;

  constructor(width: number, height: number) {
    this.app = new PIXI.Renderer({
      resolution: window.devicePixelRatio || 1,
      // autoDensity: true,
      width: width,
      height: height,
      transparent: false,
      antialias: true,
      clearBeforeRender: true,
    });
    this.stage = new PIXI.Container();
    this.config = {
      canvasNoteScale: 10,
      bottomTileHeight: this.app.screen.height * 0.08,
    };

    this.isShift = false;
    this.isDragging = false;
    this.isHovering = false;
    this.isHorizontal = false;
    this.lastClickedTick = 0;
    this.render = this.render.bind(this);
    this.handleKeyDownListener = this.handleKeyDownListener.bind(this);
    this.handleKeyUpListener = this.handleKeyUpListener.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.setIsHorizontal = this.setIsHorizontal.bind(this);
    this.increaseCanvasNoteScale = this.increaseCanvasNoteScale.bind(this);
    this.decreaseCanvasNoteScale = this.decreaseCanvasNoteScale.bind(this);
    this.buildComponents = this.buildComponents.bind(this);
    this.on = this.on.bind(this);
    this.runRender = this.runRender.bind(this);
    this.background = new Background(
      this.app,
      this.stage,
      this.config,
      this.runRender
    );
    this.highlighter = new Highlighter(this.app, this.stage, this.config);
    this.comboDisplay = new ComboDisplay(this.app, this.stage);
  }

  flash(columnIndex: number) {
    this.flashingBottomTiles.flash(columnIndex);
    this.flashingColumns.flash(columnIndex);
  }

  unflash(columnIndex: number) {
    this.flashingBottomTiles.unflash(columnIndex);
    this.flashingColumns.unflash(columnIndex);
  }

  runRender() {
    // for child components to render this parent
    this.render(Transport.ticks);
  }

  buildComponents() {
    if (this.flashingColumns) {
      this.flashingColumns.destroy();
    }
    if (this.flashingBottomTiles) {
      this.flashingBottomTiles.destroy();
    }
    if (this.flashingLightsBottomTiles) {
      this.flashingLightsBottomTiles.destroy();
    }
    this.flashingColumns = new FlashingColumns(
      this.app,
      this.stage,
      undefined,
      this.config,
      this.background.bottomTiles.leftPadding,
      this.background.bottomTiles.whiteKeyWidth,
      this.background.bottomTiles.blackKeyWidth
    );
    this.flashingBottomTiles = new FlashingBottomTiles(
      this.app,
      this.stage,
      this.config,
      this.background.bottomTiles.leftPadding,
      this.background.bottomTiles.whiteKeyWidth,
      this.background.bottomTiles.blackKeyWidth
    );
    this.flashingLightsBottomTiles = new FlashingLightsBottomTiles(
      this.app,
      this.stage,
      this.config,
      this.background.bottomTiles.leftPadding,
      this.background.bottomTiles.whiteKeyWidth,
      this.background.bottomTiles.blackKeyWidth
    );
  }

  connectHTML(htmlRef: HTMLDivElement) {
    if (this.pixiCanvas) {
      return;
    }
    htmlRef.appendChild(this.app.view);
    this.pixiCanvas = htmlRef;
    this.interaction = new PIXI.InteractionManager(this.app);
    this.buildComponents();
    window.addEventListener("keydown", this.handleKeyDownListener, false);
    window.addEventListener("keyup", this.handleKeyUpListener, false);
    window.addEventListener("wheel", this.handleWheel, false);

    this.on("pointermove", (e: PIXI.InteractionEvent) => {
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
        this.highlighter.draw(currentTick);
        this.render(currentTick);
      }
    });
    this.on("pointertap", () => {});
    this.on("pointerdown", (e: PIXI.InteractionEvent) => {
      if (myMidiPlayer.getIsPlaying()) {
        myMidiPlayer.pause();
        return;
      }
      this.highlighter.activate();
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
      this.render(currentTick);
    });
    this.on("pointerup", () => {
      this.isDragging = false;
    });
    this.on("pointerout", () => {
      this.isDragging = false;
    });
    this.on("mouseout", () => {
      this.isHovering = false;
    });
    this.on("mouseover", () => {
      this.isHovering = true;
    });
  }

  disconnectHTML() {
    myMidiPlayer.setLoopPoints(0, 0);
    this.highlighter.draw(0); // just reseting the highlighter
    this.pixiCanvas?.removeChild(this.app.view);
    this.pixiCanvas = undefined;
    this.flashingColumns.destroy();
    this.flashingBottomTiles.destroy();
    this.flashingLightsBottomTiles.destroy();
    this.fallingNotes?.destroy();
    this.beatLines?.destroy();
    window.removeEventListener("keydown", this.handleKeyDownListener, false);
    window.removeEventListener("keyup", this.handleKeyUpListener, false);
    window.removeEventListener("wheel", this.handleWheel, false);
    this.interaction.destroy();
  }

  buildNotes() {
    if (this.fallingNotes) {
      this.fallingNotes.destroy();
    }
    if (this.beatLines) {
      this.beatLines.destroy();
    }
    this.fallingNotes = new FallingNotes(
      this.app,
      this.stage,
      this.config,
      this.background.bottomTiles.leftPadding,
      this.background.bottomTiles.whiteKeyWidth,
      this.background.bottomTiles.blackKeyWidth,
      this.runRender
    );
    this.beatLines = new BeatLines(this.app, this.stage, this.config);
  }

  destroy() {
    if (this.app.view) {
      this.background.destroy();
      this.flashingColumns.destroy();
      this.beatLines.destroy();
      this.disconnectHTML();
      this.interaction.destroy();
      this.app.destroy();
    }
  }

  render(tick: number) {
    this.fallingNotes?.draw(tick);
    // for flashes, see _scheduleCanvasEvents
    this.beatLines?.draw(tick);
    this.highlighter.draw(tick);
    this.app.render(this.stage);
  }

  on(event: string, callback: Function) {
    this.interaction.on(event, (e: PIXI.InteractionEvent) => {
      callback(e);
    });
  }

  onBeforePlay() {
    // remove past flashes
    this.flashingBottomTiles.unFlashAll();
    this.flashingColumns.unFlashAll();
  }

  handleKeyDownListener(e: any) {
    if (e.shiftKey) {
      this.isShift = true;
    }
  }

  handleKeyUpListener(e: any) {
    if (e.key === "Shift") {
      this.isShift = false;
    }
  }

  handleWheel(e: WheelEvent) {
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
      const SCROLL_BUFFER: number = 300;
      const withinUpperLimit = newTick + SCROLL_BUFFER < totalTicks;
      const withinLowerLimit = newTick > 0;
      if (withinUpperLimit && withinLowerLimit) {
        myMidiPlayer.skipToTick(newTick);
        this.render(newTick);
        progressBar.render(newTick);
      }
    }
  }

  setIsHorizontal(value: boolean) {
    // console.log(this.app.screen);
    // this.app.stage.setTransform(
    //   this.app.screen.width / 2 + this.config.bottomTileHeight,
    //   undefined,
    //   0.7,
    //   0.95,
    //   1.5708
    // );
    // this.isHorizontal = value;
    // this.flashingColumns.destroy();
    // this.flashingColumns = new FlashingColumns(
    //   this.app,
    //   value,
    //   this.config,
    //   this.background.bottomTiles.leftPadding,
    //   this.background.bottomTiles.whiteKeyWidth,
    //   this.background.bottomTiles.blackKeyWidth
    // );
  }

  setupCanvasNoteScale(ppq: number) {
    this.config.canvasNoteScale = Math.ceil(ppq / 100);
  }

  increaseCanvasNoteScale() {
    this.config.canvasNoteScale++;
    this._rescale();
  }

  decreaseCanvasNoteScale() {
    if (this.config.canvasNoteScale > 1) {
      this.config.canvasNoteScale--;
      this._rescale();
    }
  }

  _rescale() {
    this.buildComponents();
    this.buildNotes();
    this.render(Transport.ticks);
  }
}

const myCanvas = new MyCanvas(window.innerWidth, window.innerHeight);
export default myCanvas;
