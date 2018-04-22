import Point from 'pixi.js/lib/core/math/Point';
import * as tinycolor from 'tinycolor2';

import Station from './Station';
import Train from './Train';
import { distance, pointsAlmostEqual, randomInt, weightedRandom } from './utils';

// TODO: define these in a common constants file
const MAX_SPEED = 10.0;
const ACCELERATION = 0.025;
const APPROACH_DISTANCE = 3.0;
const TRAIN_CAPACITY = 50;

const ctx: Worker = self as any;

let stations: Station[] = [];
let trains: Train[] = [];

const initTrains = (numTrains: number, stations: Station[]): Train[] => {
  const trains = [];
  const stationsWithConnections = stations.filter(station => station.connections.length > 0);
  for (let i = 0; i < numTrains; i += 1) {
    const originStation = stationsWithConnections[
      Math.floor(Math.random() * stationsWithConnections.length)
    ];
    trains.push(new Train(
      new Point(originStation.location.x, originStation.location.y),
      0, 0, originStation, undefined, tinycolor('grey').toRgb()),
    );
  }
  return trains;
};

const moveTrains = (trains: Train[], stations: Station[]) => {
  for (const train of trains) {
    if (train.origin.connections.length === 0) {
      // train is stuck at an orphaned station
      continue;
    }
    // choose a destination randomly with a bias towards larger stations
    if (train.destination === undefined) {
      const otherStations = train.origin.connections.map(conn => conn.station);
      const closeStationWeights = otherStations.map(station => station.population);
      train.destination = weightedRandom(otherStations, closeStationWeights);

      // board passengers
      const boardingPassengers = randomInt(0, Math.min(TRAIN_CAPACITY - train.passengers,
                                                       train.origin.population));
      // set or mix train color with the color of new passenger origin
      if (train.passengers === 0) {
        train.color = train.origin.color;
      } else {
        train.color = tinycolor.mix(
          train.color,
          train.origin.color,
          Math.round((boardingPassengers / train.passengers) * 100),
        ).toRgb();
      }
      train.passengers += boardingPassengers;
      train.origin.population -= boardingPassengers;
    }

    // train reached destination, stop moving and let passengers off
    if (pointsAlmostEqual(train.location, train.destination.location)) {
      train.speed = 0;

      // average destination color with passenger color weighted by ratio
      // (a simulation of culture mixing)
      train.destination.color = tinycolor.mix(
        train.destination.color,
        train.origin.color,
        Math.round((train.passengers / train.destination.population) * 100),
      ).toRgb();

      // transfer passengers to destination
      const disembarkingPassengers = randomInt(0, train.passengers);
      train.destination.population += disembarkingPassengers;
      train.passengers -= disembarkingPassengers;

      // prepare for next journey
      train.origin = train.destination;
      train.destination = undefined;
      continue;
    }

    const journeyLeft = distance(train.location, train.destination.location);

    if ((train.speed / ACCELERATION) >= ((journeyLeft / train.speed) - APPROACH_DISTANCE) &&
        train.speed !== ACCELERATION) {
      // slowing down
      train.speed -= ACCELERATION;
    } else if (train.speed < MAX_SPEED) {
      // speeding up
      train.speed += ACCELERATION;
    }

    // advance train
    const progress = train.speed / journeyLeft;
    train.location.x += ((train.destination.location.x - train.location.x) * progress);
    train.location.y += ((train.destination.location.y - train.location.y) * progress);
  }
};

ctx.addEventListener('message', (event: MessageEvent) => {
  if ('initTrains' in event.data) {
    const { numTrains } = event.data.initTrains;
    stations = event.data.initTrains.stations;
    trains = initTrains(numTrains, stations);
    ctx.postMessage({ initTrains: trains });
  } else if ('moveTrains' in event.data) {
    // trains = event.data.moveTrains.trains;
    // stations = event.data.moveTrains.stations;
    moveTrains(trains, stations);
    ctx.postMessage({ moveTrains: trains });
  }
});
