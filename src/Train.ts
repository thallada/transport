import Point from 'pixi.js/lib/core/math/Point';
import * as tinycolor from 'tinycolor2';

import Station from './Station';

let trainCount = 0;

export default class Train {
  public location: Point;
  public speed: number;
  public origin: Station;
  public destination: Station;
  public passengers: number;
  public id: number;
  public color: ColorFormats.RGBA;

  private textStyle: object;

  constructor(
    location: Point,
    speed: number,
    passengers: number,
    origin: Station,
    destination: Station,
    color: ColorFormats.RGBA,
  ) {
    this.location = location;
    this.speed = speed;
    this.origin = origin;
    this.destination = destination;
    this.passengers = passengers;
    this.color = color;

    // for debugging
    trainCount += 1;
    this.id = trainCount;
  }
}
