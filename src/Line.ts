import Station from './Station';
import { distance, randomInt, randomPoint } from './utils';

export default class Line {
  public stations: Station[];

  constructor(stations: Station[], numStations: number) {
    this.stations = [];
    let stationsLeft = stations;
    let largest = Station.largestStation(stationsLeft);
    stationsLeft = stationsLeft.filter(s => s !== largest);
    this.stations.push(largest);

    while (this.stations.length < numStations) {
      largest = Station.largestStation(
        Station.stationsWithinRadius(stationsLeft, largest.location, 500),
      );
      if (largest === null) {
        break;
      }
      stationsLeft = stationsLeft.filter(s => s !== largest);
      this.stations.push(largest);
    }
  }
}
