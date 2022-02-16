import { Container, Text } from "pixi.js";
import myMidiPlayer from "audio";
import { LinkedListContainer, Emitter } from "@pixi/particle-emitter";
import { createConfig } from "./constants";
import { PIANO_TUNING } from "audio/constants";

export default class Particles {
  //   _container: LinkedListContainer;
  _container: Container;
  onChange: Function;
  //   emitter: Emitter;
  lastUpdateTime: number;
  emitters: Emitter[];
  enabled: boolean;

  constructor(
    stage: PIXI.Container,
    whiteKeyWidth: number,
    blackKeyWidth: number,
    leftPadding: number,
    screenHeight: number,
    bottomTileHeight: number,
    onChange: Function
  ) {
    // this._container = new LinkedListContainer();
    this._container = new Container();
    this.onChange = onChange;
    this.lastUpdateTime = performance.now();
    this.emitters = [];
    let x = leftPadding;
    this.enabled = true;
    let lastI: number; // to prevent duplicate notes from b and #
    Object.entries(PIANO_TUNING).forEach(([key, i]: [string, number]) => {
      if (i !== lastI) {
        lastI = i;
        const isBlackKey = key.includes("#") || key.includes("b");
        const width = isBlackKey ? blackKeyWidth : whiteKeyWidth;
        const emitterX = isBlackKey ? x - width / 2 : x;
        const emitter = new Emitter(
          this._container,
          createConfig(emitterX, screenHeight - bottomTileHeight, width)
        );
        emitter.emit = false;
        this.emitters.push(emitter);
        if (!isBlackKey) {
          x += whiteKeyWidth;
        }
      }
    });
    // this.emitter.emit = true;
    stage.addChild(this._container);
  }

  get visible() {
    return true;
    // return this._container.visible;
  }

  show() {
    // this._container.visible = true;
    this.onChange();
  }

  hide() {
    // this._container.visible = false;
    this.onChange();
  }

  draw(newTime: number) {
    for (let i = 0; i < this.emitters.length; i++) {
      try {
        // Because particles-emitter may not be ready to use
        // but user is already playing music. 
        // If particles-emitter has a ready state 
        // we could avoid doing this try catch
        this.emitters[i].update((newTime - this.lastUpdateTime) * 0.001);
      } catch(error) {
        console.log({error})
      }
    }
    this.lastUpdateTime = newTime;
  }

  emit(columnIndex: number) {
    this.emitters[columnIndex].emit = true;
  }

  stopEmit(columnIndex: number) {
    this.emitters[columnIndex].emit = false;
  }

  stopEmitAll() {
    for (let i = 0; i < this.emitters.length; i++) {
      this.emitters[i].emit = false;
    }
  }

  destroy() {
    this._container.destroy({
      children: true,
      texture: true,
      baseTexture: true,
    });
  }
}
