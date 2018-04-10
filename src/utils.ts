import * as PIXI from 'pixi.js';

const EPSILON = 1.0;

export const randomInt = (min: number, max: number): number => (
  // inclusive of min and max
  Math.floor(Math.random() * (max - (min + 1))) + min
);

export const weightedRandom = (choices: any[], weights: number[]): any => {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const rand = randomInt(0, totalWeight);
  let cumulWeight = 0;
  for (let i = 0; i < weights.length; i += 1) {
    cumulWeight += weights[i];
    if (rand < cumulWeight) {
      return choices[i];
    }
  }
};

export const randomPoint = () => (
  new PIXI.Point(randomInt(0, window.innerWidth), randomInt(0, window.innerHeight))
);

export const pointsEqual = (pointA: PIXI.Point, pointB: PIXI.Point): boolean => (
  (pointA.x === pointB.x && pointA.y === pointB.y)
);

export const pointsAlmostEqual = (pointA: PIXI.Point, pointB: PIXI.Point): boolean => (
  Math.abs(pointA.x - pointB.x) < EPSILON &&
  Math.abs(pointA.y - pointB.y) < EPSILON
);

export const distance = (pointA: PIXI.Point, pointB: PIXI.Point): number => {
  const distX = pointA.x - pointB.x;
  const distY = pointA.y - pointB.y;
  return Math.sqrt((distX * distX) + (distY * distY));
};

export const rangeMap = (num: number, inMin: number, inMax: number,
                         outMin: number, outMax: number): number => (
  (num - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
);

// tslint:disable no-bitwise
export const nthByte = (num: number, n: number): number => ((num >> (8 * n)) & 0xff);

// FIXME: pretty sure this is wrong, just use a color library instead and then convert to hex
export const avgHexColor = (colorA: number, colorB: number): number => (
  (Math.round((nthByte(colorA, 2) + nthByte(colorB, 2)) / 2) & 0xFF) |
  ((Math.round((nthByte(colorA, 1) + nthByte(colorB, 1)) / 2) & 0xFF) << 8) |
  ((Math.round((nthByte(colorA, 0) + nthByte(colorB, 0)) / 2) & 0x0F) << 16)
);
