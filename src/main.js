import BootScene from "./scenes/BootScene.js";
import MenuScene from "./scenes/MenuScene.js";
import IntroScene from "./scenes/IntroScene.js";
import TimelineScene from "./scenes/TimelineScene.js";
import Phase1Scene from "./scenes/Phase1Scene.js";
import Phase2Scene from "./scenes/Phase2Scene.js";
import Phase3Scene from "./scenes/Phase3Scene.js";
import Phase4Scene from "./scenes/Phase4Scene.js";
import Phase5Scene from "./scenes/Phase5Scene.js";
import Phase6Scene from "./scenes/Phase6Scene.js";
import Phase7Scene from "./scenes/Phase7Scene.js";

const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  resolution: 1,
  backgroundColor: "#07101f",
  scene: [
    BootScene,
    MenuScene,
    IntroScene,
    TimelineScene,
    Phase1Scene,
    Phase2Scene,
    Phase3Scene,
    Phase4Scene,
    Phase5Scene,
    Phase6Scene,
    Phase7Scene,
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false,
  },
};

window.addEventListener("load", () => {
  const game = new Phaser.Game(config);
  const refreshScale = () => game.scale.refresh();

  window.addEventListener("resize", refreshScale);
  window.addEventListener("orientationchange", refreshScale);

  if (document.fonts) {
    document.fonts.ready.then(refreshScale);
  }
});
