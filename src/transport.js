import * as PIXI from 'pixi.js';
import { randomInt } from './utils';
import './style.css';

const app = new PIXI.Application(window.innerWidth, window.innerHeight);
const ticker = new PIXI.ticker.Ticker();
const graphics = new PIXI.Graphics();
const fpsText = new PIXI.Text('', { fontSize: '25px', fontFamily: 'monospace', fill: 'yellow' });

fpsText.anchor = new PIXI.Point(1, 0);
fpsText.x = window.innerWidth - 1;
fpsText.y = 0;

ticker.stop();
ticker.add((deltaTime) => {
  fpsText.setText(Math.round(ticker.FPS));
  graphics.lineStyle(1, 0xaeaeae, 1);

  graphics.moveTo(randomInt(9, window.innerWidth), randomInt(0, window.innerHeight));
  graphics.lineTo(randomInt(9, window.innerWidth), randomInt(0, window.innerHeight));
});
ticker.start();

app.stage.addChild(graphics);
app.stage.addChild(fpsText);
document.body.appendChild(app.view);

window.addEventListener('resize', () => {
  app.renderer.resize(window.innerWidth, window.innerHeight);
});
