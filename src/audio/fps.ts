export default class Fps {
  fps: number;
  _oldTime: number;
  _frames: number;

  constructor() {
    this._oldTime = performance.now();
    this.fps = 60;
    this._frames = 0;
  }
  calculateFps() {
    this._frames++;
    const time = performance.now();
    if (time >= this._oldTime + 1000) {
      this.fps = (this._frames * 1000) / (time - this._oldTime);
      this._oldTime = time;
      this._frames = 0;
    }
  }
}
