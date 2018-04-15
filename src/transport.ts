import * as PIXI from 'pixi.js';
import * as tinycolor from 'tinycolor2';

import Direction from './Direction';
import Line from './Line';
import Station from './Station';
import Train from './Train';
import { distance, pointsAlmostEqual, pointsEqual, randomInt, randomPoint,
         rangeMap, weightedRandom } from './utils';

import * as imgNode from './node.png';
import './style.css';

const NODE_RES = 100;

const MAX_SPEED = 10.0;
const ACCELERATION = 0.025;
const APPROACH_DISTANCE = 3.0;
const MAX_JOURNEY = Math.floor(Math.sqrt(
  Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2),
) / 4);
const TRAIN_CAPACITY = 50;

const trainTexts: PIXI.Text[] = [];

const initStations = (numStations: number): Station[] => {
  const stations: Station[] = [];
  for (let i = 0; i < numStations; i += 1) {
    stations.push(new Station(
      Station.randomDistantPoint(stations, 30),
      randomInt(300, 2000),
      tinycolor.random()));
  }
  return stations;
};

const initTrains = (numTrains: number, stations: Station[]): Train[] => {
  const trains = [];
  for (let i = 0; i < numTrains; i += 1) {
    const originStation = stations[Math.floor(Math.random() * stations.length)];
    trains.push(new Train(
      new PIXI.Point(originStation.location.x, originStation.location.y),
      0, 0, originStation, undefined, tinycolor('grey')),
    );
  }
  return trains;
};

const moveTrains = (trains: Train[], stations: Station[]) => {
  for (const train of trains) {
    // choose a destination randomly with a bias towards larger stations
    if (train.destination === undefined) {
      const otherStations = stations.filter(station => station !== train.origin);
      const closeStations = Station.stationsWithinRadius(otherStations, train.location,
                                                         MAX_JOURNEY);
      const closeStationWeights = closeStations.map(station => station.population);
      train.destination = weightedRandom(closeStations, closeStationWeights);

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
        );
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
      );

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

const drawStations = (stations: Station[], graphics: PIXI.Graphics) => {
  for (const station of stations) {
    const radius = station.population / 60;
    graphics.beginFill(parseInt(station.color.toHex(), 16), 0.5);
    graphics.drawCircle(station.location.x, station.location.y, radius);
    graphics.endFill();
    station.label.x = station.location.x + radius + 1;
    station.label.y = station.location.y + radius + 1;
  }
};

const drawTrains = (trains: Train[], graphics: PIXI.Graphics) => {
  for (const train of trains) {
    // graphics.beginFill(parseInt(train.color.toHex(), 16), 0.8);
    // graphics.drawCircle(train.location.x, train.location.y,
                        // rangeMap(train.passengers, 0, TRAIN_CAPACITY, 1, 5));
    // graphics.endFill();
    const trainSize = rangeMap(train.passengers, 0, TRAIN_CAPACITY, 1, 5);
    const scale = trainSize / NODE_RES;
    train.sprite.x = train.location.x;
    train.sprite.y = train.location.y;
    train.sprite.scale.x = scale;
    train.sprite.scale.y = scale;
    train.sprite.tint = parseInt(train.color.toHex(), 16);
    train.label.x = train.location.x + scale + 1;
    train.label.y = train.location.y + scale + 1;
  }
};

const drawLines = (lines: Line[], graphics: PIXI.Graphics) => {
  for (const line of lines) {
    graphics.lineStyle(1, parseInt(line.color.toHex(), 16), 1);
    const start = line.stations[0].location;
    graphics.moveTo(start.x, start.y);
    for (const station of line.stations.slice(1)) {
      graphics.lineTo(station.location.x, station.location.y);
    }
  }
};

const run = () => {
  const app = new PIXI.Application({
    antialias: true,
    height: window.innerHeight,
    width: window.innerWidth,
  });
  const ticker = new PIXI.ticker.Ticker();
  const graphics = new PIXI.Graphics();
  const fpsText = new PIXI.Text('', { fontSize: '25px', fontFamily: 'monospace', fill: 'yellow' });

  fpsText.anchor = new PIXI.ObservablePoint(null, 0, 1);
  fpsText.x = window.innerWidth;
  fpsText.y = 0;

  const stations = initStations(30);
  const trains = initTrains(50, stations);
  const lines = [
    new Line(
      stations, new PIXI.Point(0, 0),
      Direction.Southeast, 12, tinycolor('red'),
    ),
    new Line(
      stations, new PIXI.Point(window.innerWidth, 0),
      Direction.Southwest, 12, tinycolor('darkcyan'),
    ),
    new Line(
      stations, new PIXI.Point(window.innerWidth, window.innerHeight),
      Direction.Northwest, 12, tinycolor('yellow'),
    ),
    new Line(
      stations, new PIXI.Point(0, window.innerHeight),
      Direction.Northeast, 12, tinycolor('green'),
    ),
  ];

  ticker.stop();
  ticker.add((deltaTime) => {
    moveTrains(trains, stations);

    graphics.clear();
    fpsText.text = `${Math.round(ticker.FPS)}`;

    graphics.lineStyle(1, 0xFFA500, 1);
    drawStations(stations, graphics);

    graphics.lineStyle(1, 0xAEAEAE, 1);
    drawTrains(trains, graphics);

    drawLines(lines, graphics);
  });
  ticker.start();

  app.stage.addChild(graphics);
  app.stage.addChild(fpsText);
  // add train sprites
  for (const train of trains) {
    app.stage.addChild(train.sprite);
  }
  // Add debug labels
  for (const train of trains) {
    app.stage.addChild(train.label);
  }
  for (const station of stations) {
    app.stage.addChild(station.label);
  }
  document.body.appendChild(app.view);

  window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
  });
};

PIXI.loader.add('nodeImg', imgNode).load(run);
