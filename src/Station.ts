export default class Station {
  public location: PIXI.Point;
  public population: number;
  public connections: Station[];

  constructor(location: PIXI.Point, population: number, connections?: Station[]) {
    this.location = location;
    this.population = population;
    this.connections = connections;
  }
}
