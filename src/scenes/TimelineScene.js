const PHASES = [
  {
    title: "Cartões\nperfurados",
    year: "1890",
    color: 0xffd166,
    unlocked: true,
    sceneKey: "Phase1Scene",
  },
  {
    title: "Fita\nmagnética",
    year: "1951",
    color: 0x62e7f2,
    unlocked: true,
    sceneKey: "Phase2Scene",
  },
  {
    title: "Disquete",
    year: "1971",
    color: 0x8ef28b,
    unlocked: true,
    sceneKey: "Phase3Scene",
  },
  { title: "CD / DVD", year: "1982", color: 0xc49cff },
  { title: "HD", year: "POPULAR", color: 0xff8f70 },
  { title: "Pen drive", year: "2000", color: 0x70b7ff },
  { title: "SSD e\nNuvem", year: "FUTURO", color: 0x8ef28b },
];

export default class TimelineScene extends Phaser.Scene {
  constructor() {
    super("TimelineScene");
  }

  create() {
    this.drawBackground();

    this.add
      .text(480, 48, "LINHA DO TEMPO", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "21px",
        color: "#f1f7ff",
      })
      .setOrigin(0.5);

    this.add
      .text(480, 83, "Explore a evolução do armazenamento", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "18px",
        fontStyle: "600",
        color: "#8da2bd",
      })
      .setOrigin(0.5);

    this.createTimeline();
    this.createBackButton();
    this.cameras.main.fadeIn(300, 7, 16, 31);
  }

  drawBackground() {
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x07101f, 0x07101f, 0x0d2037, 0x07101f, 1);
    graphics.fillRect(0, 0, 960, 540);

    graphics.lineStyle(1, 0x62e7f2, 0.045);
    for (let x = 0; x < 960; x += 24) {
      graphics.lineBetween(x, 0, x, 540);
    }
    for (let y = 0; y < 540; y += 24) {
      graphics.lineBetween(0, y, 960, y);
    }
  }

  createTimeline() {
    const startX = 90;
    const spacing = 130;
    const lineY = 284;
    const graphics = this.add.graphics();

    graphics.lineStyle(5, 0x263a52, 1);
    graphics.lineBetween(startX, lineY, startX + spacing * 6, lineY);
    graphics.lineStyle(5, 0xffd166, 1);
    graphics.lineBetween(startX, lineY, startX + spacing * 2.45, lineY);

    PHASES.forEach((phase, index) => {
      const x = startX + spacing * index;
      const cardY = index % 2 === 0 ? 184 : 378;
      const connectorEnd = index % 2 === 0 ? cardY + 55 : cardY - 55;

      graphics.lineStyle(2, phase.unlocked ? phase.color : 0x34465d, 0.8);
      graphics.lineBetween(x, lineY, x, connectorEnd);

      const card = this.add
        .rectangle(
          x,
          cardY,
          112,
          112,
          14,
          phase.unlocked ? 0x183749 : 0x111a2d,
          1,
        )
        .setStrokeStyle(2, phase.unlocked ? phase.color : 0x34465d, 0.9);

      this.add
        .circle(x, lineY, 12, phase.unlocked ? phase.color : 0x34465d, 1)
        .setStrokeStyle(4, 0x07101f, 1);

      this.add
        .text(x, cardY - 31, phase.title, {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "16px",
          fontStyle: "800",
          color: phase.unlocked ? "#f1f7ff" : "#718198",
          align: "center",
          lineSpacing: 1,
        })
        .setOrigin(0.5);

      this.add
        .text(x, cardY + 33, phase.year, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: phase.unlocked ? "#ffd166" : "#53657c",
        })
        .setOrigin(0.5);

      if (phase.unlocked) {
        card.setInteractive({ useHandCursor: true });
        this.add
          .text(x, cardY + 67, "JOGAR", {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "9px",
            color: "#8ef28b",
          })
          .setOrigin(0.5);

        card.on("pointerover", () => {
          card.setFillStyle(0x23566a);
          this.tweens.add({ targets: card, scale: 1.06, duration: 120 });
        });
        card.on("pointerout", () => {
          card.setFillStyle(0x183749);
          this.tweens.add({ targets: card, scale: 1, duration: 120 });
        });
        card.on("pointerdown", () => {
          this.cameras.main.fadeOut(220, 7, 16, 31);
          this.time.delayedCall(230, () => this.scene.start(phase.sceneKey));
        });
      } else {
        this.add.image(x + 38, cardY - 38, "lock").setScale(0.42).setAlpha(0.85);
      }
    });

    this.add
      .text(480, 500, "As próximas fases serão desbloqueadas durante a jornada.", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "15px",
        fontStyle: "600",
        color: "#6f849d",
      })
      .setOrigin(0.5);
  }

  createBackButton() {
    const text = this.add
      .text(38, 38, "← INTRODUÇÃO", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "15px",
        fontStyle: "800",
        color: "#8da2bd",
      })
      .setInteractive({ useHandCursor: true });

    text.on("pointerover", () => text.setColor("#62e7f2"));
    text.on("pointerout", () => text.setColor("#8da2bd"));
    text.on("pointerdown", () => this.scene.start("IntroScene"));
  }
}
