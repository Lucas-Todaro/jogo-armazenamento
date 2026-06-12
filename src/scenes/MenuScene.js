import { createStandardButton, drawRetroBackground } from "../utils/visualHelpers.js";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    this.drawBackground();
    this.drawRetroDevices();

    this.add
      .text(480, 84, "A JORNADA DO", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "22px",
        color: "#62e7f2",
        align: "center",
      })
      .setOrigin(0.5);

    this.add
      .text(480, 140, "BIT", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "62px",
        color: "#f1f7ff",
        stroke: "#16364b",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(
        480,
        202,
        "Uma viagem pela evolução dos\ndispositivos de armazenamento",
        {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "22px",
          fontStyle: "600",
          color: "#b9cce2",
          align: "center",
          lineSpacing: 5,
        },
      )
      .setOrigin(0.5);

    const bit = this.add.image(480, 294, "bit").setScale(1.45);
    this.tweens.add({
      targets: bit,
      y: 284,
      duration: 1300,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    this.createButton(480, 396, "INICIAR JORNADA", () => {
      this.cameras.main.fadeOut(260, 7, 16, 31);
      this.time.delayedCall(270, () => this.scene.start("IntroScene"));
    });

    this.add
      .text(480, 487, "MEMÓRIA • HISTÓRIA • TECNOLOGIA", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "9px",
        color: "#5b7893",
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    this.cameras.main.fadeIn(350, 7, 16, 31);
  }

  drawBackground() {
    const graphics = drawRetroBackground(this, {
      accent: 0x62e7f2,
      bottomLeft: 0x0b1c30,
      gridStep: 32,
      gridAlpha: 0.055,
      frameAlpha: 0.1,
    });

    const pixels = [
      [62, 58, 0x62e7f2],
      [105, 96, 0x8ef28b],
      [880, 70, 0xffd166],
      [832, 116, 0x62e7f2],
      [72, 438, 0xffd166],
      [875, 452, 0x8ef28b],
    ];
    pixels.forEach(([x, y, color]) => {
      graphics.fillStyle(color, 0.6);
      graphics.fillRect(x, y, 8, 8);
      graphics.fillStyle(color, 0.16);
      graphics.fillRect(x - 4, y - 4, 16, 16);
    });
  }

  drawRetroDevices() {
    const graphics = this.add.graphics();

    // Punched card.
    graphics.fillStyle(0xffd166, 0.12);
    graphics.lineStyle(2, 0xffd166, 0.32);
    graphics.fillRoundedRect(52, 174, 146, 92, 8);
    graphics.strokeRoundedRect(52, 174, 146, 92, 8);
    graphics.fillStyle(0xffd166, 0.42);
    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 7; column += 1) {
        if ((row + column) % 3 !== 0) {
          graphics.fillRoundedRect(68 + column * 17, 190 + row * 16, 7, 4, 1);
        }
      }
    }

    // Magnetic tape reels.
    graphics.fillStyle(0x62e7f2, 0.08);
    graphics.lineStyle(3, 0x62e7f2, 0.26);
    graphics.fillRoundedRect(756, 168, 150, 105, 12);
    graphics.strokeRoundedRect(756, 168, 150, 105, 12);
    graphics.strokeCircle(796, 216, 26);
    graphics.strokeCircle(866, 216, 26);
    graphics.lineBetween(796, 242, 866, 242);
    graphics.fillStyle(0x62e7f2, 0.24);
    graphics.fillCircle(796, 216, 7);
    graphics.fillCircle(866, 216, 7);

    // Floppy disk.
    graphics.fillStyle(0x8ef28b, 0.08);
    graphics.lineStyle(2, 0x8ef28b, 0.28);
    graphics.fillRoundedRect(790, 340, 90, 98, 6);
    graphics.strokeRoundedRect(790, 340, 90, 98, 6);
    graphics.fillStyle(0x8ef28b, 0.18);
    graphics.fillRect(808, 340, 53, 35);
    graphics.fillRoundedRect(808, 394, 53, 34, 3);
    graphics.fillStyle(0x07101f, 0.7);
    graphics.fillRect(847, 345, 8, 22);

    // Binary decoration.
    this.add
      .text(78, 337, "0101\n1100\n0010\n1011", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "12px",
        color: "#62e7f2",
        alpha: 0.2,
        lineSpacing: 8,
      })
      .setRotation(-0.08);
  }

  createButton(x, y, label, callback) {
    return createStandardButton(this, x, y, 300, label, callback, {
      height: 64,
      border: 0x62e7f2,
      hover: 0x1c5264,
      fontSize: "13px",
      hoverTextColor: "#8ef28b",
      radius: 14,
    });
  }
}
