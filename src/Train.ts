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

  constructor(location: PIXI.Point, speed: number, passengers: number, origin: Station,
              destination: Station) {
    this.location = location;
    this.speed = speed;
    this.origin = origin;
    this.destination = destination;
    this.passengers = passengers;

    // for debugging
    trainCount += 1;
    this.id = trainCount;
    this.label = new PIXI.Text(`${this.id}`, {
      fill: 'white',
      fontFamily: 'monospace',
      fontSize: '12px',
    });
  }

  public boardPassengers() {
    if (this.location === this.origin.location) { // about to leave a station
    }
  }
}
