import * as PIXI from 'pixi.js';
import Line from './Line';
import Station from './Station';
import Train from './Train';
import { distance, randomInt, randomPoint } from './utils';

import './style.css';

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
    const destStation = stations[Math.floor(Math.random() * stations.length)];
    trains.push(new Train(originStation.location, 0, 0, originStation, destStation));
  }
  return trains;
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
  let line = new Line(stations, 10);

  stations = initStations(30);
  trains = initTrains(15, stations);
  line = new Line(stations, 10);

  ticker.stop();
  ticker.add((deltaTime) => {

    graphics.clear();
    fpsText.text = `${Math.round(ticker.FPS)}`;
    graphics.lineStyle(1, 0xaeaeae, 1);

    drawStations(stations, graphics);
    drawLine(line, graphics);
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
