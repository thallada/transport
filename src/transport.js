import * as PIXI from 'pixi.js';
import './style.css';

const app = new PIXI.Application(window.innerWidth, window.innerHeight);

document.body.appendChild(app.view);

window.addEventListener('resize', () => {
  app.renderer.resize(window.innerWidth, window.innerHeight);
});
