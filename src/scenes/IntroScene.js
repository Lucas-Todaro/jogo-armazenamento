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

    const panel = this.add
      .rectangle(480, 268, 720, 314, 20, 0x0d1930, 0.96)
      .setStrokeStyle(2, 0x62e7f2, 0.45);
    panel.setShadow?.(0, 10, "#000000", 18, false, true);

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
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x07101f, 0x07101f, 0x10223b, 0x07101f, 1);
    graphics.fillRect(0, 0, 960, 540);

    graphics.lineStyle(1, 0x62e7f2, 0.055);
    for (let y = 12; y < 540; y += 18) {
      graphics.lineBetween(0, y, 960, y);
    }

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
    const button = this.add
      .rectangle(x, y, 282, 58, 12, 0x1a4c58, 1)
      .setStrokeStyle(2, 0x8ef28b, 0.85)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(x, y, label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "12px",
        color: "#f1f7ff",
      })
      .setOrigin(0.5);

    button.on("pointerover", () => {
      button.setFillStyle(0x246a69);
      text.setColor("#ffd166");
      this.tweens.add({ targets: [button, text], scale: 1.04, duration: 120 });
    });
    button.on("pointerout", () => {
      button.setFillStyle(0x1a4c58);
      text.setColor("#f1f7ff");
      this.tweens.add({ targets: [button, text], scale: 1, duration: 120 });
    });
    button.on("pointerdown", callback);
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
