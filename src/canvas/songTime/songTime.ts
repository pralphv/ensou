import { Container, Text } from "pixi.js";
import MyCanvas from "../canvas";
import myMidiPlayer from "audio";

import { BUTTON_HEIGHT } from "features/toolbar/constants";

export default class SongTime {
  _textField: Text;
  _container: Container;
  myCanvas: MyCanvas;

  constructor(myCanvas: MyCanvas) {
    this.myCanvas = myCanvas;
    this._container = new Container();

    this._textField = new Text("", {
      fontSize: 15,
      fill: 0xffffff,
    });
    this._container.visible = true;
    this._container.addChild(this._textField);
    this._container.position.x = BUTTON_HEIGHT * 6 + 8;
    this.resize();
    this._textField.anchor.set(0.5);
    myCanvas.wholeCanvasStage.addChild(this._container);
  }

  resize() {
    this._container.position.y = this.myCanvas.app.screen.height - BUTTON_HEIGHT / 2;
  }

  show() {
    this._container.visible = true;
    this.myCanvas.safeRender();
  }

  hide() {
    this._container.visible = false;
    this.myCanvas.safeRender();
  }

  draw() {
    this._textField.text = `${myMidiPlayer.playTime} / ${myMidiPlayer.totalTime}`;
  }

  destroy() {
    this._container.destroy({
      baseTexture: true,
      children: true,
      texture: true,
    });
  }
}
