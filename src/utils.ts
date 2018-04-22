import Point from 'pixi.js/lib/core/math/Point';

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

export const randomPoint = (height: number, width: number): Point => (
  new Point(randomInt(0, width), randomInt(0, height))
);

export const pointsEqual = (pointA: Point, pointB: Point): boolean => (
  (pointA.x === pointB.x && pointA.y === pointB.y)
);

export const pointsAlmostEqual = (pointA: Point, pointB: Point): boolean => (
  Math.abs(pointA.x - pointB.x) < EPSILON &&
  Math.abs(pointA.y - pointB.y) < EPSILON
);

export const distance = (pointA: Point, pointB: Point): number => {
  const distX = pointA.x - pointB.x;
  const distY = pointA.y - pointB.y;
  return Math.sqrt((distX * distX) + (distY * distY));
};

export const rangeMap = (num: number, inMin: number, inMax: number,
                         outMin: number, outMax: number): number => (
  (num - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
);

export const angleRadians = (pointA: Point, pointB: Point): number => (
  Math.atan2(-(pointB.x - pointA.x), pointB.y - pointA.y)
);

export const angleDegrees = (pointA: Point, pointB: Point): number => (
  180 + angleRadians(pointA, pointB) * (180 / Math.PI)
);
