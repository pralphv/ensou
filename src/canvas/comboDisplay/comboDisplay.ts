import * as PIXI from "pixi.js";

export default class ComboDisplay {
  _app: PIXI.Application;
  _container: PIXI.Container;
  _text: PIXI.Text;

  constructor(app: PIXI.Application) {
    this._app = app;
    this._container = new PIXI.Container();
    this._text = new PIXI.Text("", {
      align: "center",
      dropShadow: true,
      dropShadowAlpha: 0.1,
      dropShadowAngle: 0,
      dropShadowDistance: 2,
      fontFamily: "Helvetica",
      fontSize: 24,
      fill: 0x7fdded,
    });
    this._container.addChild(this._text);
    this._container.position.x = this._app.screen.width / 2;
    this._container.position.y = this._container.height;
    this._text.anchor.set(0.5);
    this._app.stage.addChild(this._container);
    // this.draw(100)
  }

  draw(combo: number) {
    this._text.text = combo > 0 ? `${combo}\ncombo` : "";
  }

  destroy() {
    console.log("Destroying ComboDisplay");
    this._container.destroy({
      children: true,
      texture: true,
      baseTexture: true,
    });
  }
}
