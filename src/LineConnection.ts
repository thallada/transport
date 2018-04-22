import Line from './Line';
import Signal from './Signal';
import Station from './Station';

export default class LineConnection {
  public line: Line;
  public signals: Signal[];
  public station: Station;

  constructor(
    station: Station,
    line: Line,
  ) {
    this.station = station;
    this.line = line;
  }
}
