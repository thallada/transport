import * as Viewport from 'pixi-viewport';
import * as PIXI from 'pixi.js';
import * as Stats from 'stats.js';
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
const TRAIN_CAPACITY = 50;
const LINE_CONNECTION_LIMIT = 5;
const WORLD_WIDTH = 1000;
const WORLD_HEIGHT = 1000;
const ZOOM_MIN_WIDTH = 100;
const ZOOM_MIN_HEIGHT = 100;
const ZOOM_MAX_WIDTH = 4000;
const ZOOM_MAX_HEIGHT = 4000;

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
  const stationsWithConnections = stations.filter(station => station.connections.length > 0);
  for (let i = 0; i < numTrains; i += 1) {
    const originStation = stationsWithConnections[
      Math.floor(Math.random() * stationsWithConnections.length)
    ];
    trains.push(new Train(
      new PIXI.Point(originStation.location.x, originStation.location.y),
      0, 0, originStation, undefined, tinycolor('grey')),
    );
  }
  return trains;
};

const initLines = (numLines: number, stations: Station[]): Line[] => {
  const lines = [];
  for (let i = 0; i < numLines; i += 1) {
    let color = tinycolor.random();
    while (color.isDark()) {
      color = tinycolor.random();
    }
    const stationsWithoutConnections = stations.filter(station =>
      station.connections.length === 0,
    );
    const centralHub = Station.largestStation(stationsWithoutConnections);
    const line = new Line(`line-${i}`, tinycolor.random());
    const stationsLeft = stations.slice(0);
    line.connectStations(centralHub, stationsLeft, [], LINE_CONNECTION_LIMIT);
    lines.push(line);
  }
  return lines;
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
    const radius = station.population / 150;
    graphics.beginFill(parseInt(station.color.toHex(), 16), 0.5);
    graphics.drawCircle(station.location.x, station.location.y, radius);
    graphics.endFill();
    station.label.x = station.location.x + radius + 1;
    station.label.y = station.location.y + radius + 1;
  }
};

const drawTrains = (trains: Train[], graphics: PIXI.Graphics) => {
  for (const train of trains) {
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

const drawLines = (stations: Station[], graphics: PIXI.Graphics) => {
  for (const station of stations) {
    for (const connection of station.connections) {
      let twoWay = false;
      for (const conn of connection.station.connections) {
        if (conn.station === station) {
          twoWay = true;
        }
      }
      graphics.lineStyle(twoWay ? 2 : 1, parseInt(connection.line.color.toHex(), 16), 1);
      graphics.moveTo(station.location.x, station.location.y);
      graphics.lineTo(connection.station.location.x, connection.station.location.y);
    }
  }
};

const run = () => {
  const app = new PIXI.Application({
    antialias: true,
    height: window.innerHeight,
    width: window.innerWidth,
  });
  const viewport = new Viewport({
    screenHeight: window.innerHeight,
    screenWidth: window.innerWidth,
    worldHeight: WORLD_HEIGHT,
    worldWidth: WORLD_WIDTH,
  });
  const stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
  const ticker = new PIXI.ticker.Ticker();
  const graphics = new PIXI.Graphics();

  const stations = initStations(30);
  const lines = initLines(4, stations);
  const trains = initTrains(50, stations);

  ticker.stop();
  ticker.add((deltaTime) => {
    stats.begin();

    moveTrains(trains, stations);

    graphics.clear();

    graphics.lineStyle(1, 0xFFA500, 1);
    drawStations(stations, graphics);

    graphics.lineStyle(1, 0xAEAEAE, 1);
    drawTrains(trains, graphics);

    drawLines(stations, graphics);

    stats.end();
  });
  ticker.start();

  viewport.addChild(graphics);
  // add train sprites
  for (const train of trains) {
    viewport.addChild(train.sprite);
  }
  // Add debug labels
  for (const train of trains) {
    viewport.addChild(train.label);
  }
  for (const station of stations) {
    viewport.addChild(station.label);
  }
  document.body.appendChild(app.view);
  app.stage.addChild(viewport);
  viewport.drag().pinch().wheel().clampZoom({
    maxHeight: ZOOM_MAX_HEIGHT,
    maxWidth: ZOOM_MAX_WIDTH,
    minHeight: ZOOM_MIN_HEIGHT,
    minWidth: ZOOM_MIN_WIDTH,
  }).decelerate();

  window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
  });
};

PIXI.loader.add('nodeImg', imgNode).load(run);
