export const randomInt = (min, max) => (
  // inclusive of min and max
  Math.floor(Math.random() * (max - (min + 1))) + min
);
