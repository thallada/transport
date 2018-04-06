import Station from './Station';

export default class Train {
  public location: PIXI.Point;
  public speed: number;
  public origin: Station;
  public destination: Station;
  public passengers: number;

  constructor(location: PIXI.Point, speed: number, passengers: number, origin: Station,
              destination: Station) {
    this.location = location;
    this.speed = speed;
    this.origin = origin;
    this.destination = destination;
    this.passengers = passengers;
  }

  public boardPassengers() {
    if (this.location === this.origin.location) { // about to leave a station
    }
  }
}
