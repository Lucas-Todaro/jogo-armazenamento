import {
  getProgress,
  isPhaseCompleted,
  isPhaseUnlocked,
  resetProgress,
} from "../utils/progressManager.js";
import {
  createRoundedPanel,
  createStandardButton,
  drawRetroBackground,
} from "../utils/visualHelpers.js";

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
    drawRetroBackground(this, {
      accent: 0x62e7f2,
      bottomLeft: 0x0d2037,
      gridAlpha: 0.04,
      frameAlpha: 0.11,
    });
  }

  createTimeline() {
    const progress = getProgress();
    const cardWidth = 176;
    const cardHeight = 116;
    const points = [
      { x: 156, y: 188 },
      { x: 372, y: 188 },
      { x: 588, y: 188 },
      { x: 804, y: 188 },
      { x: 264, y: 362 },
      { x: 480, y: 362 },
      { x: 696, y: 362 },
    ];

    this.drawTimelinePath(points, progress.unlockedPhase);

    PHASES.forEach((phase, index) => {
      this.createPhaseCard(phase, points[index], cardWidth, cardHeight);
    });

    createRoundedPanel(this, 480, 500, 792, 44, {
      fill: 0x091424,
      stroke: 0x263a52,
      strokeAlpha: 0.55,
      radius: 14,
      shadow: false,
    });

    this.timelineMessageText = this.add
      .text(480, 500, "", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "15px",
        fontStyle: "700",
        color: "#6f849d",
        align: "center",
        wordWrap: { width: 740 },
      })
      .setOrigin(0.5);

    this.showTimelineMessage(
      this.timelineInitialMessage ||
        "Conclua uma fase para desbloquear a próxima etapa neste navegador.",
      this.timelineInitialMessage ? "#ff9b78" : "#6f849d",
      false,
    );
  }

  drawTimelinePath(points, unlockedPhase) {
    const connectors = this.add.graphics();

    points.forEach((point, index) => {
      if (index >= points.length - 1) {
        return;
      }

      const nextPoint = points[index + 1];
      const active = unlockedPhase > index + 1;
      connectors.lineStyle(5, active ? 0xffd166 : 0x263a52, active ? 0.95 : 0.9);
      connectors.lineBetween(point.x, point.y, nextPoint.x, nextPoint.y);
      connectors.lineStyle(1, active ? 0xf1f7ff : 0x516278, active ? 0.3 : 0.18);
      connectors.lineBetween(point.x, point.y - 5, nextPoint.x, nextPoint.y - 5);
    });
  }

  createPhaseCard(phase, position, cardWidth, cardHeight) {
    const { x, y } = position;
    const unlocked = isPhaseUnlocked(phase.phaseNumber);
    const completed = isPhaseCompleted(phase.phaseNumber);
    const stateColor = completed ? 0x8ef28b : unlocked ? phase.color : 0x34465d;
    const fillColor = completed ? 0x143f37 : unlocked ? 0x183749 : 0x111a2d;
    const hoverColor = completed ? 0x1f5a49 : 0x23566a;
    const cardContainer = this.add.container(x, y);
    const background = this.add.graphics();
    const hitArea = this.add
      .rectangle(0, 0, cardWidth, cardHeight, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true });

    const drawCard = (color = fillColor, borderAlpha = 0.9) => {
      background.clear();
      background.fillStyle(0x000000, 0.22);
      background.fillRoundedRect(
        -cardWidth / 2 + 6,
        -cardHeight / 2 + 7,
        cardWidth,
        cardHeight,
        16,
      );
      background.fillStyle(color, unlocked ? 1 : 0.84);
      background.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 16);
      background.lineStyle(2, stateColor, borderAlpha);
      background.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 16);
      background.lineStyle(1, 0xffffff, unlocked ? 0.055 : 0.025);
      background.strokeRoundedRect(
        -cardWidth / 2 + 7,
        -cardHeight / 2 + 7,
        cardWidth - 14,
        cardHeight - 14,
        10,
      );
    };

    drawCard();
    cardContainer.add(background);
    this.add
      .circle(x, y - 72, 12, unlocked ? stateColor : 0x34465d, 1)
      .setStrokeStyle(4, 0x07101f, 1);

    cardContainer.add(
      this.add
        .text(0, -43, `FASE ${phase.phaseNumber}`, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: unlocked ? "#ffd166" : "#53657c",
        })
        .setOrigin(0.5),
    );
    cardContainer.add(
      this.add
        .text(0, -15, phase.title, {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "17px",
          fontStyle: "900",
          color: unlocked ? "#f1f7ff" : "#718198",
          align: "center",
          lineSpacing: 1,
        })
        .setOrigin(0.5),
    );
    cardContainer.add(
      this.add
        .text(0, 17, phase.year, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: unlocked ? "#ffd166" : "#53657c",
        })
        .setOrigin(0.5),
    );

    const stateLabel = completed ? "CONCLUÍDA" : unlocked ? "JOGAR" : "BLOQUEADA";
    cardContainer.add(
      this.add
        .text(0, 43, stateLabel, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: completed ? "7px" : "8px",
          color: completed ? "#8ef28b" : unlocked ? "#8ef28b" : "#53657c",
        })
        .setOrigin(0.5),
    );

    if (completed) {
      cardContainer.add(
        this.add.circle(66, -42, 13, 0x8ef28b, 1).setStrokeStyle(3, 0x07101f, 1),
      );
      cardContainer.add(
        this.add
          .text(66, -42, "OK", {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "6px",
            color: "#07101f",
          })
          .setOrigin(0.5),
      );
    }

    if (!unlocked) {
      cardContainer.add(this.add.image(66, -42, "lock").setScale(0.38).setAlpha(0.85));
    }

    cardContainer.add(hitArea);
    hitArea.on("pointerover", () => {
      drawCard(unlocked ? hoverColor : 0x172236, unlocked ? 1 : 0.65);
      this.tweens.add({
        targets: cardContainer,
        scale: unlocked ? 1.035 : 1.018,
        duration: 120,
      });
    });
    hitArea.on("pointerout", () => {
      drawCard(fillColor, 0.9);
      this.tweens.add({ targets: cardContainer, scale: 1, duration: 120 });
    });

    if (unlocked) {
      hitArea.on("pointerdown", () => {
        this.cameras.main.fadeOut(220, 7, 16, 31);
        this.time.delayedCall(230, () => this.scene.start(phase.sceneKey));
      });
      return;
    }

    hitArea.on("pointerdown", () => {
      this.showTimelineMessage(
        "Conclua a fase anterior para desbloquear esta etapa.",
        "#ff9b78",
      );
      this.cameras.main.shake(120, 0.002);
    });
  }

  createBackButton() {
    createStandardButton(this, 99, 38, 138, "INTRODUÇÃO", () => this.scene.start("IntroScene"), {
      height: 34,
      border: 0x263a52,
      hover: 0x15344b,
      fontSize: "7px",
      textColor: "#8da2bd",
      hoverTextColor: "#62e7f2",
      radius: 9,
    });
  }

  createResetButton() {
    createStandardButton(
      this,
      820,
      38,
      204,
      "RESETAR PROGRESSO",
      () => {
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
      },
      {
        height: 34,
        border: 0x263a52,
        hover: 0x432331,
        fontSize: "6px",
        textColor: "#8da2bd",
        hoverTextColor: "#ff9b78",
        radius: 9,
      },
    );
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
