import { Container, Text } from "pixi.js";
import FpsCounter from "./fpsCounter";
import MyCanvas from "../canvas";

export default class Fps {
  _fpsTextField: Text;
  _container: Container;
  fpsCounter: FpsCounter;
  myCanvas: MyCanvas

  constructor(myCanvas: MyCanvas) {
    this.myCanvas = myCanvas;
    this._container = new Container();
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
    myCanvas.stage.addChild(this._container);
    this._container.zIndex = 1000;
  }

  get visible() {
    return this._container.visible;
  }

  show() {
    this._container.visible = true;
    this.myCanvas.runRender();
  }

  hide() {
    this._container.visible = false;
    this.myCanvas.runRender();
  }

  draw(time: number) {
    this.fpsCounter.calculateFps(time);
    this._fpsTextField.text = `FPS: ${this.fpsCounter.fps.toFixed(0)}`;
  }
  
  destroy() {
    this._container.destroy({
      baseTexture: true,
      children: true,
      texture: true,
    });
  }
}
