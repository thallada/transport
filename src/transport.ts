import * as Viewport from 'pixi-viewport';
import * as PIXI from 'pixi.js';
import * as Stats from 'stats.js';
import * as tinycolor from 'tinycolor2';

import Direction from './Direction';
import Line from './Line';
import Station from './Station';
import StationWorker from 'worker-loader!./Station.worker';
import Train from './Train';
import { distance, pointsAlmostEqual, pointsEqual, randomInt, randomPoint,
         rangeMap, weightedRandom } from './utils';
import TrainWorker from 'worker-loader!./Train.worker';

import * as imgNode from './node.png';
import './style.css';

const NODE_RES = 100;

const CONNECTION_RADIUS = Math.floor(Math.sqrt(
  Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2),
) / 8);
const TRAIN_CAPACITY = 50;
const LINE_CONNECTION_LIMIT = 5;
const WORLD_WIDTH = 1000;
const WORLD_HEIGHT = 1000;
const ZOOM_MIN_WIDTH = 100;
const ZOOM_MIN_HEIGHT = 100;
const ZOOM_MAX_WIDTH = 4000;
const ZOOM_MAX_HEIGHT = 4000;

const trainTexts: PIXI.Text[] = [];

const drawStations = (stations: Station[], stationLabels: PIXI.Text[], graphics: PIXI.Graphics) => {
  stations.forEach((station, i) => {
    const radius = station.population / 150;
    const color = tinycolor(station.color);
    graphics.beginFill(parseInt(color.toHex(), 16), 0.5);
    graphics.drawCircle(station.location.x, station.location.y, radius);
    graphics.endFill();
    stationLabels[i].x = station.location.x + radius + 1;
    stationLabels[i].y = station.location.y + radius + 1;
  });
};

const drawTrains = (
  trains: Train[],
  trainLabels: PIXI.Text[],
  trainSprites: PIXI.Sprite[],
  graphics: PIXI.Graphics,
) => {
  trains.forEach((train, i) => {
    const trainSize = rangeMap(train.passengers, 0, TRAIN_CAPACITY, 1, 5);
    const scale = trainSize / NODE_RES;
    const color = tinycolor(train.color);
    trainSprites[i].x = train.location.x;
    trainSprites[i].y = train.location.y;
    trainSprites[i].scale.x = scale;
    trainSprites[i].scale.y = scale;
    trainSprites[i].tint = parseInt(color.toHex(), 16);
    trainLabels[i].x = train.location.x + scale + 1;
    trainLabels[i].y = train.location.y + scale + 1;
  });
};

const drawLines = (stations: Station[], graphics: PIXI.Graphics) => {
  for (const station of stations) {
    for (const connection of station.connections) {
      const color = tinycolor(connection.line.color);
      let twoWay = false;
      for (const conn of connection.station.connections) {
        if (conn.station === station) {
          twoWay = true;
        }
      }
      graphics.lineStyle(twoWay ? 2 : 1, parseInt(color.toHex(), 16), 1);
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

  let stations: Station[] = [];
  let lines: Line[] = [];
  let trains: Train[] = [];
  const stationLabels: PIXI.Text[] = [];
  const trainLabels: PIXI.Text[] = [];
  const trainSprites: PIXI.Sprite[] = [];
  const stationWorker = new StationWorker();
  const trainWorker = new TrainWorker();

  stationWorker.postMessage({ initStations: {
    connectionRadius: CONNECTION_RADIUS,
    height: window.innerHeight,
    numLines: 4,
    numStations: 30,
    width: window.innerWidth,
  }});
  stationWorker.onmessage = (event: MessageEvent) => {
    stations = event.data.stations;
    lines = event.data.lines;
    console.log(stations);
    console.log(lines);

    trainWorker.postMessage({ initTrains: {
      stations,

      numTrains: 50,
    }});
    trainWorker.onmessage = (trainEvent: MessageEvent) => {
      if ('initTrains' in trainEvent.data) {
        trains = trainEvent.data.initTrains;

        // add train sprites
        for (const train of trains) {
          const sprite = new PIXI.Sprite(PIXI.loader.resources.nodeImg.texture);
          sprite.visible = false;
          trainSprites.push(sprite);
          viewport.addChild(sprite);
        }
        // Add debug labels
        for (const train of trains) {
          const label = new PIXI.Text(
            `${train.id}`, {
              fill: '#AEAEAE',
              fontFamily: 'monospace',
              fontSize: '12px',
            },
          );
          trainLabels.push(label);
          viewport.addChild(label);
        }
      } else if ('moveTrains' in trainEvent.data) {
        trains = trainEvent.data.moveTrains;
      }
    };

    for (const station of stations) {
      const label = new PIXI.Text(
        `${station.id}`, {
          fill: '#FFA500',
          fontFamily: 'monospace',
          fontSize: '12px',
        },
      );
      stationLabels.push(label);
      viewport.addChild(label);
    }
  };

  ticker.stop();
  ticker.add((deltaTime) => {
    stats.begin();

    trainWorker.postMessage({ moveTrains: {} });

    graphics.clear();

    graphics.lineStyle(1, 0xFFA500, 1);
    drawStations(stations, stationLabels, graphics);

    graphics.lineStyle(1, 0xAEAEAE, 1);
    drawTrains(trains, trainLabels, trainSprites, graphics);

    drawLines(stations, graphics);

    stats.end();
  });
  ticker.start();

  viewport.addChild(graphics);
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
