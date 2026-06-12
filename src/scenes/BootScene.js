export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    // Textures are generated in code so the starter project needs no image files.
    this.createBitTexture();
    this.createLockTexture();
    document.body.classList.add("game-ready");
    this.scene.start("MenuScene");
  }

  createBitTexture() {
    const graphics = this.make.graphics({ add: false });

    graphics.fillStyle(0x62e7f2, 1);
    graphics.fillRoundedRect(3, 3, 42, 42, 10);
    graphics.lineStyle(3, 0xc9fbff, 1);
    graphics.strokeRoundedRect(3, 3, 42, 42, 10);
    graphics.fillStyle(0x07101f, 1);
    graphics.fillCircle(17, 22, 3);
    graphics.fillCircle(31, 22, 3);
    graphics.lineStyle(2, 0x07101f, 1);
    graphics.beginPath();
    graphics.arc(24, 27, 9, 0.25, Math.PI - 0.25);
    graphics.strokePath();
    graphics.generateTexture("bit", 48, 48);
    graphics.destroy();
  }

  createLockTexture() {
    const graphics = this.make.graphics({ add: false });

    graphics.lineStyle(5, 0x66758c, 1);
    graphics.strokeRoundedRect(10, 4, 20, 24, 10);
    graphics.fillStyle(0x66758c, 1);
    graphics.fillRoundedRect(5, 19, 30, 24, 5);
    graphics.fillStyle(0x111a2d, 1);
    graphics.fillCircle(20, 29, 3);
    graphics.fillRect(18.5, 29, 3, 7);
    graphics.generateTexture("lock", 40, 48);
    graphics.destroy();
  }
}
