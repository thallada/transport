import * as tinycolor from 'tinycolor2';

import Line from './Line';
import Station from './Station';
import { randomInt } from './utils';

const LINE_CONNECTION_LIMIT = 5;
const ctx: Worker = self as any;

const initStations = (numStations: number, height: number, width: number): Station[] => {
  const stations: Station[] = [];
  for (let i = 0; i < numStations; i += 1) {
    stations.push(new Station(
      Station.randomDistantPoint(stations, 30, height, width),
      randomInt(300, 2000),
      tinycolor.random().toRgb()));
  }
  return stations;
};

const initLines = (numLines: number, stations: Station[], connectionRadius: number): Line[] => {
  const lines = [];
  for (let i = 0; i < numLines; i += 1) {
    let color = tinycolor.random();
    while (color.isDark()) {
      color = tinycolor.random();
    }
    const lineColor = color.toRgb();
    const stationsWithoutConnections = stations.filter(station =>
      station.connections.length === 0,
    );
    let centralHub: Station;
    if (stationsWithoutConnections.length > 0) {
      centralHub = Station.largestStation(stationsWithoutConnections);
    } else {
      centralHub = stations[randomInt(0, stations.length - 1)];
    }
    const line = new Line(`line-${i}`, lineColor);
    const stationsLeft = stations.slice(0);
    line.connectStations(centralHub, stationsLeft, [], LINE_CONNECTION_LIMIT, connectionRadius);
    lines.push(line);
  }
  return lines;
};

ctx.addEventListener('message', (event: MessageEvent) => {
  if ('initStations' in event.data) {
    const { connectionRadius, height, numLines, numStations, width } = event.data.initStations;
    let stations: Station[] = [];
    let lines: Line[] = [];
    let stationsWithConnections: Station[] = [];
    while (stationsWithConnections.length === 0) {
      // If all stations are too far away to connect, try generating again
      stations = initStations(numStations, height, width);
      lines = initLines(numLines, stations, connectionRadius);
      stationsWithConnections = stations.filter(station => station.connections.length > 0);
    }
    ctx.postMessage({ stations, lines });
  }
});
