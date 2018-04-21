import * as tinycolor from 'tinycolor2';

import Direction, { getPointDirection } from './Direction';
import LineConnection from './LineConnection';
import { distance, randomPoint, weightedRandom } from './utils';

let stationCount = 0;

export default class Station {
  // Utility methods for working with arrays of Stations
  public static largestStation(stations: Station[]): Station {
    let largest: Station = null;
    for (const station of stations) {
      if (largest === null || station.population > largest.population) {
        largest = station;
      }
    }
    return largest;
  }

  public static stationsWithinRadius(stations: Station[], point: PIXI.Point,
                                     radius: number): Station[] {
    return stations.filter(station => distance(point, station.location) <= radius);
  }

  public static stationsInDirection(stations: Station[], point: PIXI.Point,
                                    direction: Direction): Station[] {
    return stations.filter(station => getPointDirection(point, station.location) === direction);
  }

  public static closestStation(stations: Station[], point: PIXI.Point): Station {
    return stations.reduce(
      (prev, curr) => distance(point, prev.location) < distance(point, curr.location) ? prev : curr,
    );
  }

  public static randomCloseLargeStation(stations: Station[], point: PIXI.Point,
                                        radius: number): Station {
    const closeStations = Station.stationsWithinRadius(stations, point,
                                                       radius);
    const closeStationWeights = closeStations.map(station => station.population);
    return weightedRandom(closeStations, closeStationWeights);
  }

  public static isPointDistant(point: PIXI.Point, stations: Station[],
                               minDistance: number): boolean {
    for (const station of stations) {
      if (distance(point, station.location) < minDistance) {
        return false;
      }
    }
    return true;
  }

  public static randomDistantPoint(stations: Station[], minDistance: number): PIXI.Point | null {
    let tries = 100;
    while (tries > 0) {
      const point = randomPoint();
      if (Station.isPointDistant(point, stations, minDistance)) {
        return point;
      }
      tries -= 1;
    }
    return null;
  }

  public location: PIXI.Point;
  public population: number;
  public connections: LineConnection[];
  public id: number;
  public label: PIXI.Text;
  public color: tinycolorInstance;

  private textStyle: object;

  constructor(
    location: PIXI.Point,
    population: number,
    color: tinycolorInstance,
    connections?: LineConnection[],
  ) {
    this.location = location;
    this.population = population;
    this.color = color;
    this.connections = connections || [];

    // for debugging
    stationCount += 1;
    this.id = stationCount;
    this.textStyle = {
      fill: '#FFA500',
      fontFamily: 'monospace',
      fontSize: '12px',
    };
    this.renderLabel();
  }

  public renderLabel() {
    this.label = new PIXI.Text(`${this.id}`, this.textStyle);
  }
}
