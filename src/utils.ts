import * as PIXI from 'pixi.js';

export const randomInt = (min: number, max: number): number => (
  // inclusive of min and max
  Math.floor(Math.random() * (max - (min + 1))) + min
);

export const randomPoint = () => (
  new PIXI.Point(randomInt(0, window.innerWidth), randomInt(0, window.innerHeight))
);

export const distance = (pointA: PIXI.Point, pointB: PIXI.Point): number => {
  const distX = pointA.x - pointB.x;
  const distY = pointA.y - pointB.y;
  return Math.sqrt((distX * distX) + (distY * distY));
};
