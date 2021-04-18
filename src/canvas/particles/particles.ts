import * as PIXI from "pixi.js";
import { PIANO_TUNING } from "audio/constants";
import myMidiPlayer from "audio";
import * as types from "../types";
import { Emitter } from "pixi-particles";

export default class Particles {
  _app: PIXI.Application;
  _container: PIXI.Container;
  emitter: Emitter;
  elapsed: number; // date.now()
  constructor(
    app: PIXI.Application,
    config: types.IMyCanvasConfig,
    leftPadding: number,
    whiteKeyWidth: number,
    blackKeyWidth: number
  ) {
    this._app = app;
    this._container = new PIXI.Container();
    console.log("Constructing new Particles");
    this._container = new PIXI.Container();
    const texture = PIXI.Texture.from("/particle.png", { width: 1, height: 1 });
    this.emitter = new Emitter(this._container, [texture], {
      alpha: {
        start: 1,
        end: 0.,
      },
      scale: {
        start: 0.1,
        end: 0.1,
        minimumScaleMultiplier: 0.1,
      },
      color: {
        start: "ffffff",
        end: "ffffff",
      },
      speed: {
        start: 150,
        end: 100,
      },
      startRotation: {
        min: 270,
        max: 270,
      },
      rotationSpeed: {
        min: 0,
        max: 50,
      },
      lifetime: {
        min: 1.8,
        max: 2,
      },
      blendMode: "normal",
      frequency: 0.016,
      emitterLifetime: 0.5,
      maxParticles: 100,
      pos: {
        x: 200,
        y: 200,
      },
      addAtBack: false,
      spawnType: "rect",
      spawnRect: {
          x: 0,
          w: 10,
          y: 0,
          h: 0
      },
      extraData: {
        path: "sin(x/10)*20",
      },
    });

    this._app.stage.addChild(this._container);
    this._app.stage.setChildIndex(
      this._container,
      this._app.stage.children.length - 1
    );

    let x: number = leftPadding;
    let lastI: number; // to prevent duplicate notes from b and #
    Object.entries(PIANO_TUNING).forEach(([key, i]: [string, number]) => {
      if (i !== lastI) {
        lastI = i;
        const isBlackKey = key.includes("#") || key.includes("b");
        let sprite: PIXI.Sprite;
        if (isBlackKey) {
          //   sprite = new PIXI.Sprite(blackKeyTexture);
          //   sprite.position.x = x - blackKeyWidth / 2;
        } else {
          //   sprite = new PIXI.Sprite(whiteKeyTexture);
          //   sprite.position.x = x;
          x += whiteKeyWidth;
        }
        // sprite.position.y = app.screen.height - 51;
        // sprite.visible = false;
        // this._container.addChild(sprite);
        // this._columns.push(sprite);
      }
    });
    this.elapsed = Date.now();
    this.update = this.update.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.emitter.emit = false;

    this.update();
  }

  update() {
    requestAnimationFrame(this.update);
    var now = Date.now();
    this.emitter.update((now - this.elapsed) * 0.001);
    this.elapsed = now;
    // Should re-render the PIXI Stage
    // renderer.render(stage);
  }

  start() {
    console.log("Start emitter");
    this.emitter.emit = true;
    this.update();
  }

  stop() {
    console.log("Stop emitter");
    this.emitter.emit = false;
  }

  destroy() {
    console.log("Destroying flashing bottom tiles");
    this._container.destroy({
      children: true,
      texture: true,
      baseTexture: true,
    });
  }
}
