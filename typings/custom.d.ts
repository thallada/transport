declare module '*.png';

declare module 'worker-loader!*' {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}

declare module 'pixi.js/lib/core/math/Point' {
  export default PIXI.Point;
}

declare module 'pixi.js/lib/core/text/Text' {
  export default PIXI.Text;
}
