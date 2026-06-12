export default class Phase1Scene extends Phaser.Scene {
  constructor() {
    super("Phase1Scene");
  }

  create() {
    this.drawBackground();

    this.add
      .text(480, 72, "FASE 1", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "18px",
        color: "#ffd166",
      })
      .setOrigin(0.5);

    this.add
      .text(480, 125, "Cartões Perfurados", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "38px",
        fontStyle: "900",
        color: "#f1f7ff",
      })
      .setOrigin(0.5);

    this.drawPunchCard();

    this.add
      .text(480, 385, "A aventura desta fase será construída em breve.", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "18px",
        fontStyle: "600",
        color: "#9fb2c8",
      })
      .setOrigin(0.5);

    this.createButton(480, 455, "VOLTAR PARA LINHA DO TEMPO", () => {
      this.scene.start("TimelineScene");
    });

    this.cameras.main.fadeIn(300, 7, 16, 31);
  }

  drawBackground() {
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x07101f, 0x07101f, 0x18263a, 0x07101f, 1);
    graphics.fillRect(0, 0, 960, 540);

    graphics.lineStyle(1, 0xffd166, 0.05);
    for (let y = 16; y < 540; y += 16) {
      graphics.lineBetween(0, y, 960, y);
    }
  }

  drawPunchCard() {
    const graphics = this.add.graphics();
    const x = 330;
    const y = 190;
    const width = 300;
    const height = 145;

    graphics.fillStyle(0xe9c46a, 1);
    graphics.fillRoundedRect(x, y, width, height, 12);
    graphics.lineStyle(4, 0xffe7a8, 0.7);
    graphics.strokeRoundedRect(x, y, width, height, 12);

    graphics.fillStyle(0x0d1727, 0.88);
    for (let row = 0; row < 6; row += 1) {
      for (let column = 0; column < 13; column += 1) {
        const shouldPunch = (row * 3 + column * 5) % 4 !== 0;
        if (shouldPunch) {
          graphics.fillRoundedRect(
            x + 24 + column * 20,
            y + 24 + row * 17,
            9,
            6,
            2,
          );
        }
      }
    }

    this.add
      .text(480, 352, "DADOS EM PAPEL", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#ffd166",
        letterSpacing: 2,
      })
      .setOrigin(0.5);
  }

  createButton(x, y, label, callback) {
    const button = this.add
      .rectangle(x, y, 360, 58, 12, 0x15344b, 1)
      .setStrokeStyle(2, 0x62e7f2, 0.85)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(x, y, label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#f1f7ff",
      })
      .setOrigin(0.5);

    button.on("pointerover", () => {
      button.setFillStyle(0x1c5264);
      text.setColor("#8ef28b");
      this.tweens.add({ targets: [button, text], scale: 1.04, duration: 120 });
    });
    button.on("pointerout", () => {
      button.setFillStyle(0x15344b);
      text.setColor("#f1f7ff");
      this.tweens.add({ targets: [button, text], scale: 1, duration: 120 });
    });
    button.on("pointerdown", callback);
  }
}
