import BootScene from "./scenes/BootScene.js";
import MenuScene from "./scenes/MenuScene.js";
import IntroScene from "./scenes/IntroScene.js";
import TimelineScene from "./scenes/TimelineScene.js";
import Phase1Scene from "./scenes/Phase1Scene.js";
import Phase2Scene from "./scenes/Phase2Scene.js";

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 960,
  height: 540,
  resolution: Math.min(window.devicePixelRatio || 1, 2),
  backgroundColor: "#07101f",
  scene: [
    BootScene,
    MenuScene,
    IntroScene,
    TimelineScene,
    Phase1Scene,
    Phase2Scene,
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: true,
  },
};

window.addEventListener("load", () => {
  new Phaser.Game(config);
});
