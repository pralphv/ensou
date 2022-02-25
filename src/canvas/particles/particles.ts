import { Container } from "pixi.js";
import { Emitter } from "@pixi/particle-emitter";
import { createConfig } from "./constants";
import { PIANO_TUNING } from "audio/constants";
import MyCanvas from "../canvas";

export default class Particles {
  _container: Container;
  lastUpdateTime: number;
  emitters: Emitter[];
  enabled: boolean;

  constructor(myCanvas: MyCanvas) {
    this._container = new Container();
    this.lastUpdateTime = performance.now();
    this.emitters = [];
    this.enabled = true;
    this.toggle = this.toggle.bind(this);
    let x = myCanvas.config.leftPadding;

    let lastI: number; // to prevent duplicate notes from b and #
    Object.entries(PIANO_TUNING).forEach(([key, i]: [string, number]) => {
      if (i !== lastI) {
        lastI = i;
        const isBlackKey = key.includes("#") || key.includes("b");
        const width = isBlackKey
          ? myCanvas.config.blackKeyWidth
          : myCanvas.config.whiteKeyWidth;
        const emitterX = isBlackKey ? x - width / 2 : x;
        const emitter = new Emitter(
          this._container,
          createConfig(
            emitterX,
            myCanvas.config.coreCanvasHeight - myCanvas.config.bottomTileHeight,
            width
          )
        );
        emitter.emit = false;
        this.emitters.push(emitter);
        if (!isBlackKey) {
          x += myCanvas.config.whiteKeyWidth;
        }
      }
    });
    myCanvas.stage.addChild(this._container);
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    for (let i = 0; i < this.emitters.length; i++) {
      this.emitters[i].cleanup();
      // update to remove particles from screen
      this.emitters[i].update(1);
    }
    this.enabled = false;
  }

  toggle() {
    // use if else so that the functions are used
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  draw(newTime: number) {
    if (!this.enabled) {
      return;
    }
    for (let i = 0; i < this.emitters.length; i++) {
      try {
        // Because particles-emitter may not be ready to use
        // but user is already playing music.
        // If particles-emitter has a ready state
        // we could avoid doing this try catch
        this.emitters[i].update((newTime - this.lastUpdateTime) * 0.001);
      } catch (e) {
        // expected error dont need to do anything
      }
    }
    this.lastUpdateTime = newTime;
  }

  emit(columnIndex: number) {
    if (!this.enabled) {
      return;
    }
    this.emitters[columnIndex].emit = true;
  }

  stopEmit(columnIndex: number) {
    if (!this.enabled) {
      return;
    }
    this.emitters[columnIndex].emit = false;
  }

  stopEmitAll() {
    for (let i = 0; i < this.emitters.length; i++) {
      this.emitters[i].emit = false;
    }
  }

  destroy() {
    for (let i = 0; i < this.emitters.length; i++) {
      this.emitters[i].cleanup();
      this.emitters[i].destroy();
    }
    this._container.destroy({
      children: true,
      texture: true,
      baseTexture: true,
    });
  }
}
