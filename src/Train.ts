import * as tinycolor from 'tinycolor2';

import Station from './Station';

let trainCount = 0;

export default class Train {
  public location: PIXI.Point;
  public speed: number;
  public origin: Station;
  public destination: Station;
  public passengers: number;
  public id: number;
  public label: PIXI.Text;
  public color: tinycolorInstance;
  public sprite: PIXI.Sprite;

  private textStyle: object;

  constructor(
    location: PIXI.Point,
    speed: number,
    passengers: number,
    origin: Station,
    destination: Station,
    color: tinycolorInstance,
  ) {
    this.location = location;
    this.speed = speed;
    this.origin = origin;
    this.destination = destination;
    this.passengers = passengers;
    this.color = color;

    this.sprite = new PIXI.Sprite(PIXI.loader.resources.nodeImg.texture);

    // for debugging
    trainCount += 1;
    this.id = trainCount;
    this.textStyle = {
      fill: '#AEAEAE',
      fontFamily: 'monospace',
      fontSize: '12px',
    };
    this.renderLabel();
  }

  public boardPassengers() {
    if (this.location === this.origin.location) { // about to leave a station
    }
  }

  public renderLabel() {
    this.label = new PIXI.Text(`${this.id}`, this.textStyle);
  }
}
