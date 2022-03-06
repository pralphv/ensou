import * as PIXI from "pixi.js";
import { Transport } from "tone";
import BeatLines from "./beatLines/beatlines";
import Fps from "./fps/fps";
import Background from "./background/background";
import FlashingColumns from "./flashingColumns/flashingColumns";
import FallingNotes from "./fallingNotes/fallingNotes";
import FlashingBottomTiles from "./flashingBottomTiles/flashingBottomTiles";
import FlashingLightsBottomTiles from "./flashingLightsBottomTiles/flashingLightsBottomTiles";
import Highlighter from "./highlighter/highlighter";
import StupidTopBottomBlockers from "./stupidTopBottomBlockers";
import DarkBotOverlay from "./darkBotOverlay";
import ProgressBar from "./progressBar";
import InteractionContainer from "./interactionContainer";
import ComboDisplay from "./comboDisplay/comboDisplay";
import SongTime from "./songTime";
import * as types from "./types";
import myMidiPlayer from "audio";
import Particles, { PARTICLE_MAX_LIFETIME } from "./particles";

class MyCanvas {
  pixiCanvas?: HTMLDivElement;
  app: PIXI.Renderer;
  stage: PIXI.Container;
  wholeCanvasStage: PIXI.Container;
  beatLines!: BeatLines;
  background!: Background;
  flashingColumns!: FlashingColumns;
  fallingNotes!: FallingNotes;
  flashingBottomTiles!: FlashingBottomTiles;
  flashingLightsBottomTiles!: FlashingLightsBottomTiles;
  particles: Particles;
  highlighter: Highlighter;
  config: types.IMyCanvasConfig;
  isHorizontal: boolean;
  comboDisplay: ComboDisplay;
  fps: Fps;
  stupidTopBottomBlockers: StupidTopBottomBlockers;
  darkBotOverlay: DarkBotOverlay;
  progressBar: ProgressBar;
  interactionContainer: InteractionContainer;
  songTime: SongTime;

  constructor(width: number, height: number) {
    this.app = new PIXI.Renderer({
      // resolution: window.devicePixelRatio || 1,
      resolution: 1,
      width,
      height,
      transparent: false,
      // antialias: true,
    });
    this.stage = new PIXI.Container();
    this.wholeCanvasStage = new PIXI.Container();
    const bigScreenHeight = this.app.screen.height;
    const bigScreenWidth = (bigScreenHeight * 16) / 9;
    const smallScreenWidth = this.app.screen.width;
    const smallScreenHeight = (smallScreenWidth / 16) * 9;
    const coreCanvasHeight =
      bigScreenWidth <= this.app.screen.width
        ? bigScreenHeight
        : smallScreenHeight;
    const coreCanvasWidth =
      bigScreenWidth <= this.app.screen.width
        ? bigScreenWidth
        : smallScreenWidth;
    const whiteKeyWidth = Math.floor(coreCanvasWidth / 52);
    this.config = {
      progressBarHeight: 4,
      coreCanvasWidth: coreCanvasWidth,
      coreCanvasHeight: coreCanvasHeight,
      canvasNoteScale: 10,
      bottomTileHeight: coreCanvasHeight * 0.08,
      whiteKeyWidth,
      blackKeyWidth: Math.floor(whiteKeyWidth * 0.55),
      // mainly because whiteKeyWidth is floored from a float.
      // etc. 17.3 -> 17
      // 0.3 * 52 is still pretty big and causes large gaps
      leftPadding: ((coreCanvasWidth / 52 - whiteKeyWidth) * 52) / 2,
      yCenterCompensate: (this.app.screen.height - coreCanvasHeight) / 2,
    };

    this.stage.position.x = (this.app.screen.width - coreCanvasWidth) / 2;
    this.stage.position.y = this.config.yCenterCompensate;
    this.isHorizontal = false;
    this.render = this.render.bind(this);
    this.setIsHorizontal = this.setIsHorizontal.bind(this);
    this.increaseCanvasNoteScale = this.increaseCanvasNoteScale.bind(this);
    this.decreaseCanvasNoteScale = this.decreaseCanvasNoteScale.bind(this);
    this.buildComponents = this.buildComponents.bind(this);
    this.runRender = this.runRender.bind(this);
    this.background = new Background(this);
    this.highlighter = new Highlighter(this);
    this.darkBotOverlay = new DarkBotOverlay(this);
    this.comboDisplay = new ComboDisplay(this.app, this.stage);
    this.fps = new Fps(this);
    this.particles = new Particles(this);
    this.stupidTopBottomBlockers = new StupidTopBottomBlockers(this);
    this.progressBar = new ProgressBar(this);
    this.interactionContainer = new InteractionContainer(this); // must put last for max zindex
    this.songTime = new SongTime(this);
  }

  flash(columnIndex: number) {
    this.flashingBottomTiles.flash(columnIndex);
    this.flashingColumns.flash(columnIndex);
    this.particles.emit(columnIndex);
  }

  unflash(columnIndex: number) {
    this.flashingBottomTiles.unflash(columnIndex);
    this.flashingColumns.unflash(columnIndex);
    setTimeout(() => {
      // wait till particles die
      this.particles.stopEmit(columnIndex);
    }, PARTICLE_MAX_LIFETIME);
  }

  runRender() {
    // for child components to render this parent
    this.render(Transport.ticks);
  }

  safeRender() {
    // does not render if already rendering
    if (!myMidiPlayer.isPlaying) {
      this.render(Transport.ticks);
    }
  }

  buildComponents() {
    this.flashingColumns && this.flashingColumns.destroy();
    this.flashingBottomTiles && this.flashingBottomTiles.destroy();
    this.flashingLightsBottomTiles && this.flashingLightsBottomTiles.destroy();
    this.flashingColumns = new FlashingColumns(this);
    this.flashingBottomTiles = new FlashingBottomTiles(this);
    this.flashingLightsBottomTiles = new FlashingLightsBottomTiles(
      this
      // this.app,
      // this.stage,
      // this.config,
      // this.background.bottomTiles.leftPadding,
      // this.background.bottomTiles.whiteKeyWidth,
      // this.background.bottomTiles.blackKeyWidth
    );
  }

  connectHTML(htmlRef: HTMLDivElement) {
    if (this.pixiCanvas) {
      return;
    }
    htmlRef.appendChild(this.app.view);
    this.pixiCanvas = htmlRef;
    this.buildComponents();
  }

  disconnectHTML() {
    myMidiPlayer.setLoopPoints(0, 0);
    this.highlighter.draw(0); // just reseting the highlighter
    this.pixiCanvas?.removeChild(this.app.view);
    this.pixiCanvas = undefined;
    // this.flashingColumns.destroy();
    // this.flashingBottomTiles.destroy();
    // this.flashingLightsBottomTiles.destroy();
    // this.fallingNotes?.destroy();
    // this.beatLines?.destroy();
  }

  buildNotes() {
    if (this.fallingNotes) {
      this.fallingNotes.destroy();
    }
    if (this.beatLines) {
      this.beatLines.destroy();
    }
    this.fallingNotes = new FallingNotes(this);
    this.beatLines = new BeatLines(this);
  }

  destroy() {
    if (this.app.view) {
      this.disconnectHTML();
      this.background.destroy();
      this.flashingColumns.destroy();
      this.beatLines.destroy();
      this.highlighter.destroy();
      this.particles.destroy();
      this.songTime.destroy();
      this.progressBar.destroy();
      this.stupidTopBottomBlockers.destroy();
      this.darkBotOverlay.destroy();
      this.interactionContainer.destroy();
      this.app.destroy();
    }
  }

  render(tick: number) {
    const time = performance.now();

    this.fallingNotes?.draw(tick);
    // for flashes, see _scheduleCanvasEvents
    this.beatLines?.draw(tick);
    this.highlighter.draw(tick);
    this.particles.draw(time);
    this.progressBar.draw(tick);
    this.fps.draw(time);
    this.songTime.draw();
    this.app.render(this.stage);
    this.app.render(this.wholeCanvasStage, undefined, false);
  }

  onBeforePlay() {
    // remove past flashes
    this.flashingBottomTiles.unFlashAll();
    this.flashingColumns.unFlashAll();
    this.particles.stopEmitAll();
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
    if (!myMidiPlayer.getIsPlaying()) {
      this.config.canvasNoteScale++;
      this._rescale();
    }
  }

  decreaseCanvasNoteScale() {
    if (!myMidiPlayer.getIsPlaying() && this.config.canvasNoteScale > 1) {
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

export default MyCanvas;
