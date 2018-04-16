import * as tinycolor from 'tinycolor2';

import Direction, { getPointDirection } from './Direction';
import LineConnection from './LineConnection';
import Station from './Station';
import { distance, randomInt, randomPoint } from './utils';

const CONNECTION_RADIUS = Math.floor(Math.sqrt(
  Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2),
) / 8);

export default class Line {
  public name: string;
  public color: tinycolorInstance;

  constructor(
    name: string,
    color: tinycolorInstance,
  ) {
    this.name = name;
    this.color = color;
  }

  public connectStations(
    currentStation: Station,
    stations: Station[],
    visitedStations: Station[],
    connectionLimit: number,
  ) {
    visitedStations.push(currentStation);
    const otherStations = stations.filter(station => station !== currentStation);
    const closeStations = Station.stationsWithinRadius(
      otherStations,
      currentStation.location,
      CONNECTION_RADIUS,
    );
    for (let i = 0; i < connectionLimit; i += 1) {
      if (closeStations.length < 1) {
        break;
      }
      const largest = Station.largestStation(closeStations);
      currentStation.connections.push(
        new LineConnection(largest, this),
      );
      closeStations.splice(closeStations.indexOf(largest), 1);
    }
    for (const connectedStation of currentStation.connections) {
      if (visitedStations.indexOf(connectedStation.station) === -1) {
        this.connectStations(
          connectedStation.station,
          stations,
          visitedStations,
          connectionLimit,
        );
      }
    }
  }
}
