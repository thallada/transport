import * as PIXI from 'pixi.js';

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

export const distance = (pointA: PIXI.Point, pointB: PIXI.Point): number => {
  const distX = pointA.x - pointB.x;
  const distY = pointA.y - pointB.y;
  return Math.sqrt((distX * distX) + (distY * distY));
};
