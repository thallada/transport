import * as PIXI from 'pixi.js';

export default class Signal {
  public location: PIXI.Point;

  constructor(
    location: PIXI.Point,
  ) {
    this.location = location;
  }
}
