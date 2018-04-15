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

  constructor(location: PIXI.Point, speed: number, passengers: number, origin: Station,
              destination: Station, color: tinycolorInstance) {
    this.location = location;
    this.speed = speed;
    this.origin = origin;
    this.destination = destination;
    this.passengers = passengers;
    this.color = color;

    // for debugging
    trainCount += 1;
    this.id = trainCount;
    this.label = new PIXI.Text(`${this.id}`, {
      fill: '#AEAEAE',
      fontFamily: 'monospace',
      fontSize: '12px',
    });
  }

  public boardPassengers() {
    if (this.location === this.origin.location) { // about to leave a station
    }
  }
}
