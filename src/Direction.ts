import * as PIXI from 'pixi.js';

import { angleDegrees } from './utils';

enum Direction {
  North, // 0
  Northeast, // 1
  East, // 2
  Southeast, // 3
  South, // 4
  Southwest, // 5
  West, // 6
  Northwest, // 7
}

export const getPointDirection = (pointA: PIXI.Point, pointB: PIXI.Point): Direction => {
  const angle = angleDegrees(pointA, pointB);
  let direction = null;
  if (angle >= 337.5 || angle < 22.5) {
    direction = Direction.North;
  } else if (angle >= 22.5 && angle < 67.5) {
    direction = Direction.Northeast;
  } else if (angle >= 67.5 && angle < 112.5) {
    direction = Direction.East;
  } else if (angle >= 112.5 && angle < 157.5) {
    direction = Direction.Southeast;
  } else if (angle >= 157.5 && angle < 202.5) {
    direction = Direction.South;
  } else if (angle >= 202.5 && angle < 247.5) {
    direction = Direction.Southwest;
  } else if (angle >= 247.5 && angle < 292.5) {
    direction = Direction.West;
  } else if (angle >= 292.5 && angle < 337.5) {
    direction = Direction.Northwest;
  } else {
    throw Error('Angle between points is not a valid degree');
  }
  return direction;
};

export default Direction;
