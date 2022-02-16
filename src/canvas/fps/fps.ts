import { Container, Text } from "pixi.js";
import myMidiPlayer from "audio";
import FpsCounter from "./fpsCounter";
export default class Fps {
  _fpsTextField: Text;
  _container: Container;
  onChange: Function;
  fpsCounter: FpsCounter;

  constructor(stage: PIXI.Container, onChange: Function) {
    this._container = new Container();
    this.onChange = onChange;
    this.fpsCounter = new FpsCounter();

    this._fpsTextField = new Text("", {
      fontSize: 15,
      fill: 0x63f0ff,
    });
    this._container.visible = false;
    this._container.addChild(this._fpsTextField);
    this._container.position.x = 30;
    this._container.position.y = 10;
    this._fpsTextField.anchor.set(0.5);
    stage.addChild(this._container);
    this._container.zIndex = 1000;
  }

  get visible() {
    return this._container.visible;
  }

  show() {
    this._container.visible = true;
    this.onChange();
  }

  hide() {
    this._container.visible = false;
    this.onChange();
  }

  draw(time: number) {
    this.fpsCounter.calculateFps(time);
    this._fpsTextField.text = `FPS: ${this.fpsCounter.fps.toFixed(0)}`;
  }
}
