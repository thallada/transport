import * as PIXI from 'pixi.js';
import Line from './Line';
import Station from './Station';
import Train from './Train';
import { distance, pointsEqual, randomInt, randomPoint, weightedRandom } from './utils';

import './style.css';

const maxSpeed = 10.0;
const acceleration = 0.25;

const isPointDistant = (point: PIXI.Point, stations: Station[], minDistance: number): boolean => {
  for (const station of stations) {
    if (distance(point, station.location) < minDistance) {
      return false;
    }
  }
  return true;
};

const randomDistantPoint = (stations: Station[], minDistance: number): PIXI.Point | null => {
  let tries = 100;
  while (tries > 0) {
    const point = randomPoint();
    if (isPointDistant(point, stations, minDistance)) {
      return point;
    }
    tries -= 1;
  }
  return null;
};

const initStations = (numStations: number): Station[] => {
  const stations: Station[] = [];
  for (let i = 0; i < numStations; i += 1) {
    stations.push(new Station(randomDistantPoint(stations, 30), randomInt(100, 1000)));
  }
  return stations;
};

const drawStations = (stations: Station[], graphics: PIXI.Graphics) => {
  for (const station of stations) {
    graphics.drawCircle(station.location.x, station.location.y, station.population / 60);
  }
};

const initTrains = (numTrains: number, stations: Station[]): Train[] => {
  const trains = [];
  for (let i = 0; i < numTrains; i += 1) {
    const originStation = stations[Math.floor(Math.random() * stations.length)];
    // const destStation = stations[Math.floor(Math.random() * stations.length)];
    trains.push(new Train(originStation.location, 0, 0, originStation, undefined));
  }
  return trains;
};

const moveTrains = (trains: Train[], stations: Station[]) => {
  for (const train of trains) {
    // choose a destination randomly with a bias towards larger stations
    if (train.destination === undefined) {
      const closeStations = Station.stationsWithinRadius(stations, train.location, 500);
      const closeStationWeights = closeStations.map(station => station.population);
      train.destination = weightedRandom(closeStations, closeStationWeights);
    }

    // train reached destination, stop moving.
    if (pointsEqual(train.location, train.destination.location)) {
      train.speed = 0;
      continue;
    }

    const journeyLeft = distance(train.location, train.destination.location);
    // speeding up
    if (train.speed < maxSpeed) {
      train.speed += acceleration;
    }

    // slowing down
    if ((train.speed / acceleration) >= (journeyLeft / train.speed)) {
      train.speed -= acceleration;
    }

    // advance train
    const progress = train.speed / journeyLeft;
    train.location = new PIXI.Point(
      train.location.x + (Math.abs(train.location.x - train.destination.location.x) * progress),
      train.location.y + (Math.abs(train.location.y - train.destination.location.y) * progress),
    );
  }
};

const drawTrains = (trains: Train[], graphics: PIXI.Graphics) => {
  for (const train of trains) {
    graphics.drawCircle(train.location.x, train.location.y, 2);
  }
};

const drawLine = (line: Line, graphics: PIXI.Graphics) => {
  const start = line.stations[0].location;
  graphics.moveTo(start.x, start.y);
  for (const station of line.stations.slice(1)) {
    graphics.lineTo(station.location.x, station.location.y);
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

  // make these const
  let stations = initStations(30);
  let trains = initTrains(15, stations);
  // let line = new Line(stations, 10);

  stations = initStations(30);
  trains = initTrains(15, stations);

  ticker.stop();
  ticker.add((deltaTime) => {
    moveTrains(trains, stations);

    graphics.clear();
    fpsText.text = `${Math.round(ticker.FPS)}`;
    graphics.lineStyle(1, 0xaeaeae, 1);

    drawStations(stations, graphics);
    drawTrains(trains, graphics);
    // drawLine(line, graphics);
  });
  ticker.start();

  app.stage.addChild(graphics);
  app.stage.addChild(fpsText);
  document.body.appendChild(app.view);

  window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
  });
};

run();
