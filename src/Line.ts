import Station from './Station';
import { distance, randomInt, randomPoint } from './utils';

const largestStation = (stations: Station[]): Station => {
  let largest: Station = null;
  for (const station of stations) {
    if (largest === null || station.population > largest.population) {
      largest = station;
    }
  }
  return largest;
};

const stationsWithinRadius = (stations: Station[], point: PIXI.Point,
                              radius: number): Station[] => (
  stations.filter(station => distance(point, station.location) <= radius)
);

const closestStations = (stations: Station[], point: PIXI.Point, num: number): Station[] => {
  // bleh, i'm done
  return stations;
};

export default class Line {
  public stations: Station[];

  constructor(stations: Station[], numStations: number) {
    this.stations = [];
    let stationsLeft = stations;
    let largest = largestStation(stationsLeft);
    stationsLeft = stationsLeft.filter(s => s !== largest);
    this.stations.push(largest);
    while (this.stations.length < numStations) {
      largest = largestStation(stationsWithinRadius(stationsLeft, largest.location, 500));
      if (largest === null) {
        break;
      }
      stationsLeft = stationsLeft.filter(s => s !== largest);
      this.stations.push(largest);
    }
  }
}
