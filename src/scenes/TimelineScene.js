import {
  getProgress,
  isPhaseCompleted,
  isPhaseUnlocked,
  resetProgress,
} from "../utils/progressManager.js";

const PHASES = [
  {
    phaseNumber: 1,
    title: "Cartões\nperfurados",
    year: "1890",
    color: 0xffd166,
    sceneKey: "Phase1Scene",
  },
  {
    phaseNumber: 2,
    title: "Fita\nmagnética",
    year: "1951",
    color: 0x62e7f2,
    sceneKey: "Phase2Scene",
  },
  {
    phaseNumber: 3,
    title: "Disquete",
    year: "1971",
    color: 0x8ef28b,
    sceneKey: "Phase3Scene",
  },
  {
    phaseNumber: 4,
    title: "CD / DVD",
    year: "1982",
    color: 0xc49cff,
    sceneKey: "Phase4Scene",
  },
  {
    phaseNumber: 5,
    title: "HD",
    year: "POPULAR",
    color: 0xff8f70,
    sceneKey: "Phase5Scene",
  },
  {
    phaseNumber: 6,
    title: "Pen drive",
    year: "2000",
    color: 0x70b7ff,
    sceneKey: "Phase6Scene",
  },
  {
    phaseNumber: 7,
    title: "SSD e\nNuvem",
    year: "FUTURO",
    color: 0x8ef28b,
    sceneKey: "Phase7Scene",
  },
];

export default class TimelineScene extends Phaser.Scene {
  constructor() {
    super("TimelineScene");
  }

  init(data = {}) {
    this.timelineInitialMessage = data.message || "";
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
    this.createResetButton();
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
    const progress = getProgress();
    const progressEnd = startX + spacing * Math.max(progress.unlockedPhase - 1, 0);

    graphics.lineStyle(5, 0x263a52, 1);
    graphics.lineBetween(startX, lineY, startX + spacing * 6, lineY);
    graphics.lineStyle(5, 0xffd166, 1);
    graphics.lineBetween(startX, lineY, progressEnd, lineY);

    PHASES.forEach((phase, index) => {
      const x = startX + spacing * index;
      const cardY = index % 2 === 0 ? 184 : 378;
      const connectorEnd = index % 2 === 0 ? cardY + 55 : cardY - 55;
      const unlocked = isPhaseUnlocked(phase.phaseNumber);
      const completed = isPhaseCompleted(phase.phaseNumber);
      const stateColor = completed ? 0x8ef28b : unlocked ? phase.color : 0x34465d;
      const fillColor = completed ? 0x143f37 : unlocked ? 0x183749 : 0x111a2d;
      const hoverColor = completed ? 0x1f5a49 : 0x23566a;

      graphics.lineStyle(2, unlocked ? stateColor : 0x34465d, 0.8);
      graphics.lineBetween(x, lineY, x, connectorEnd);

      const card = this.add
        .rectangle(x, cardY, 112, 112, 14, fillColor, 1)
        .setStrokeStyle(2, stateColor, 0.9);

      this.add
        .circle(x, lineY, 12, unlocked ? stateColor : 0x34465d, 1)
        .setStrokeStyle(4, 0x07101f, 1);

      this.add
        .text(x, cardY - 52, `FASE ${phase.phaseNumber}`, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "6px",
          color: unlocked ? "#ffd166" : "#53657c",
        })
        .setOrigin(0.5);

      this.add
        .text(x, cardY - 31, phase.title, {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "16px",
          fontStyle: "800",
          color: unlocked ? "#f1f7ff" : "#718198",
          align: "center",
          lineSpacing: 1,
        })
        .setOrigin(0.5);

      this.add
        .text(x, cardY + 33, phase.year, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: unlocked ? "#ffd166" : "#53657c",
        })
        .setOrigin(0.5);

      if (completed) {
        this.add
          .circle(x + 39, cardY - 39, 13, 0x8ef28b, 1)
          .setStrokeStyle(3, 0x07101f, 1);
        this.add
          .text(x + 39, cardY - 39, "OK", {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "6px",
            color: "#07101f",
          })
          .setOrigin(0.5);
      }

      if (unlocked) {
        card.setInteractive({ useHandCursor: true });
        this.add
          .text(x, cardY + 67, completed ? "CONCLUÍDA" : "JOGAR", {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: completed ? "7px" : "9px",
            color: "#8ef28b",
          })
          .setOrigin(0.5);

        card.on("pointerover", () => {
          card.setFillStyle(hoverColor);
          this.tweens.add({ targets: card, scale: 1.06, duration: 120 });
        });
        card.on("pointerout", () => {
          card.setFillStyle(fillColor);
          this.tweens.add({ targets: card, scale: 1, duration: 120 });
        });
        card.on("pointerdown", () => {
          this.cameras.main.fadeOut(220, 7, 16, 31);
          this.time.delayedCall(230, () => this.scene.start(phase.sceneKey));
        });
      } else {
        card.setInteractive({ useHandCursor: true });
        this.add.image(x + 38, cardY - 38, "lock").setScale(0.42).setAlpha(0.85);
        this.add
          .text(x, cardY + 67, "BLOQUEADA", {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "7px",
            color: "#53657c",
          })
          .setOrigin(0.5);

        card.on("pointerover", () => {
          card.setFillStyle(0x172236);
          this.tweens.add({ targets: card, scale: 1.03, duration: 120 });
        });
        card.on("pointerout", () => {
          card.setFillStyle(fillColor);
          this.tweens.add({ targets: card, scale: 1, duration: 120 });
        });
        card.on("pointerdown", () => {
          this.showTimelineMessage(
            "Conclua a fase anterior para desbloquear esta etapa.",
            "#ff9b78",
          );
          this.cameras.main.shake(120, 0.002);
        });
      }
    });

    this.timelineMessageText = this.add
      .text(480, 500, "", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "15px",
        fontStyle: "600",
        color: "#6f849d",
      })
      .setOrigin(0.5);

    this.showTimelineMessage(
      this.timelineInitialMessage ||
        "Conclua uma fase para desbloquear a próxima etapa neste navegador.",
      this.timelineInitialMessage ? "#ff9b78" : "#6f849d",
      false,
    );
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

  createResetButton() {
    const text = this.add
      .text(922, 38, "RESETAR PROGRESSO", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "14px",
        fontStyle: "800",
        color: "#8da2bd",
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });

    text.on("pointerover", () => text.setColor("#ff9b78"));
    text.on("pointerout", () => text.setColor("#8da2bd"));
    text.on("pointerdown", () => {
      const shouldReset =
        typeof window === "undefined" ||
        window.confirm("Tem certeza que deseja apagar o progresso deste navegador?");

      if (!shouldReset) {
        return;
      }

      resetProgress();
      this.scene.restart({
        message: "Progresso apagado neste navegador. A Fase 1 está liberada.",
      });
    });
  }

  showTimelineMessage(message, color = "#6f849d", animate = true) {
    if (!this.timelineMessageText) {
      return;
    }

    this.timelineMessageText.setText(message).setColor(color);

    if (!animate) {
      return;
    }

    this.tweens.add({
      targets: this.timelineMessageText,
      scale: 1.04,
      duration: 120,
      yoyo: true,
      ease: "Sine.inOut",
    });
  }
}
