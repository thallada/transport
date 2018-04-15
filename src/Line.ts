import * as tinycolor from 'tinycolor2';

import Direction, { getPointDirection } from './Direction';
import Station from './Station';
import { distance, randomInt, randomPoint } from './utils';

const CONNECTION_RADIUS = Math.floor(Math.sqrt(
  Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2),
) / 4);

export default class Line {
  public static getLinesWithStation(lines: Line[], station: Station): Line[] {
    return lines.filter(line => line.stations.indexOf(station) >= 0);
  }

  public stations: Station[];
  public color: tinycolorInstance;

  constructor(
    stations: Station[],
    start: PIXI.Point,
    startDirection: Direction,
    numStations: number,
    color: tinycolorInstance,
  ) {
    this.color = color;
    this.stations = [];
    let stationsLeft = stations.slice();
    let currentStation = Station.randomCloseLargeStation(stationsLeft, start, CONNECTION_RADIUS);
    stationsLeft = stationsLeft.filter(s => s !== currentStation);
    this.stations.push(currentStation);

    let direction = startDirection;
    while (this.stations.length < numStations) {
      const previousStation = this.stations[this.stations.length - 1];
      let candidateStations = Station.stationsWithinRadius(
        stationsLeft,
        currentStation.location,
        CONNECTION_RADIUS,
      );

      if (this.stations.length > 1) {
        const secondPreviousStation = this.stations[this.stations.length - 2];
        direction = getPointDirection(secondPreviousStation.location,
                                      previousStation.location);
      }

      const straightStations = Station.stationsInDirection(
        candidateStations, previousStation.location, direction,
      );
      const leftStations = Station.stationsInDirection(
        candidateStations, previousStation.location, (direction - 1) % 7,
      );
      const rightStations = Station.stationsInDirection(
        candidateStations, previousStation.location, (direction + 1) % 7,
      );
      candidateStations = [
        ...straightStations,
        ...leftStations,
        ...rightStations,
      ];

      currentStation = Station.randomCloseLargeStation(candidateStations, previousStation.location,
                                                       CONNECTION_RADIUS);
      if (currentStation === null || currentStation === undefined) {
        break;
      }
      stationsLeft = stationsLeft.filter(s => s !== currentStation);
      this.stations.push(currentStation);
    }
  }
}
