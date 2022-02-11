import { Container, Text } from "pixi.js";
import myMidiPlayer from "audio";

export default class Fps {
  _fpsTextField: Text;
  _container: Container;

  constructor(app: PIXI.Renderer, stage: PIXI.Container) {
    this._container = new Container();

    this._fpsTextField = new Text("", {
      fontSize: 15,
      fill: 0x63F0FF,
    });

    this._container.addChild(this._fpsTextField);
    this._container.position.x = 30;
    this._container.position.y = 10;
    this._fpsTextField.anchor.set(0.5);
    stage.addChild(this._container);
    this._container.zIndex = 1000;
  }

  draw() {
    this._fpsTextField.text = `FPS: ${myMidiPlayer.fps.fps.toFixed(0)}`;
  }
}
