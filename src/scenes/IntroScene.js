import {
  createRoundedPanel,
  createStandardButton,
  drawRetroBackground,
} from "../utils/visualHelpers.js";

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super("IntroScene");
  }

  create() {
    this.drawBackground();

    this.add
      .text(480, 68, "OLÁ, VIAJANTE!", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "20px",
        color: "#ffd166",
      })
      .setOrigin(0.5);

    createRoundedPanel(this, 480, 268, 740, 324, {
      stroke: 0x62e7f2,
      strokeAlpha: 0.5,
      radius: 22,
    });

    const bit = this.add.image(480, 161, "bit").setScale(1.25);
    this.tweens.add({
      targets: bit,
      angle: 4,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    this.add
      .text(
        480,
        278,
        "Você é Bit, um pequeno dado perdido na história da\ncomputação. Sua missão é viajar por diferentes épocas e\ndescobrir como os humanos aprenderam a guardar\ninformações, desde cartões perfurados até a nuvem.",
        {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "21px",
          fontStyle: "600",
          color: "#d9e7f5",
          align: "center",
          lineSpacing: 9,
        },
      )
      .setOrigin(0.5);

    this.createButton(480, 438, "COMEÇAR FASE 1", () => {
      this.cameras.main.fadeOut(220, 7, 16, 31);
      this.time.delayedCall(230, () => this.scene.start("TimelineScene"));
    });

    this.createBackButton();
    this.cameras.main.fadeIn(300, 7, 16, 31);
  }

  drawBackground() {
    const graphics = drawRetroBackground(this, {
      accent: 0x62e7f2,
      bottomLeft: 0x10223b,
      gridStep: 24,
      gridAlpha: 0.04,
      frameAlpha: 0.11,
    });

    graphics.lineStyle(3, 0x62e7f2, 0.18);
    graphics.beginPath();
    graphics.moveTo(58, 80);
    graphics.lineTo(130, 80);
    graphics.lineTo(156, 106);
    graphics.lineTo(250, 106);
    graphics.strokePath();
    graphics.beginPath();
    graphics.moveTo(902, 448);
    graphics.lineTo(830, 448);
    graphics.lineTo(804, 422);
    graphics.lineTo(710, 422);
    graphics.strokePath();
  }

  createButton(x, y, label, callback) {
    return createStandardButton(this, x, y, 300, label, callback, {
      height: 60,
      fill: 0x1a4c58,
      border: 0x8ef28b,
      hover: 0x246a69,
      fontSize: "12px",
    });
  }

  createBackButton() {
    const text = this.add
      .text(52, 35, "← VOLTAR", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "16px",
        fontStyle: "800",
        color: "#8da2bd",
      })
      .setInteractive({ useHandCursor: true });

    text.on("pointerover", () => text.setColor("#62e7f2"));
    text.on("pointerout", () => text.setColor("#8da2bd"));
    text.on("pointerdown", () => this.scene.start("MenuScene"));
  }
}
