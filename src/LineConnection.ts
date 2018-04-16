import Line from './Line';
import Station from './Station';

export default class LineConnection {
  public station: Station;
  public line: Line;

  constructor(
    station: Station,
    line: Line,
  ) {
    this.station = station;
    this.line = line;
  }
}
