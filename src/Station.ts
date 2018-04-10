import { distance } from './utils';

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

  public static closestStation(stations: Station[], point: PIXI.Point, num: number): Station {
    return stations.reduce(
      (prev, curr) => distance(point, prev.location) > distance(point, curr.location) ? prev : curr,
    );
  }

  public location: PIXI.Point;
  public population: number;
  public connections: Station[];
  public id: number;
  public label: PIXI.Text;
  public color: number;

  constructor(location: PIXI.Point, population: number, color: number, connections?: Station[]) {
    this.location = location;
    this.population = population;
    this.color = color;
    this.connections = connections;

    // for debugging
    stationCount += 1;
    this.id = stationCount;
    this.label = new PIXI.Text(`${this.id}`, {
      fill: '#FFA500',
      fontFamily: 'monospace',
      fontSize: '12px',
    });
  }
}
