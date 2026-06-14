import {
  completePhase,
  isPhaseUnlocked,
  savePhaseScore,
} from "../utils/progressManager.js";
import {
  createRoundedPanel,
  createStandardButton,
  drawRetroBackground,
} from "../utils/visualHelpers.js";

const PHASE2_FILE_POOL = [
  "DADO-01",
  "DADO-02",
  "DADO-03",
  "DADO-04",
  "DADO-05",
  "DADO-06",
  "DADO-07",
  "DADO-08",
  "DADO-09",
  "DADO-10",
  "BACKUP-A",
  "LOG-72",
  "RELATORIO",
  "SISTEMA",
  "ARQUIVO-X",
];
const PHASE2_STARTING_SCORE = 100;
const PHASE2_TARGET_COUNT = 2;
const PHASE2_MOVE_PENALTY = 1;
const PHASE2_WRONG_READ_PENALTY = 10;
const PHASE2_EDGE_PENALTY = 5;

export default class Phase2Scene extends Phaser.Scene {
  constructor() {
    super("Phase2Scene");
  }

  create() {
    if (!isPhaseUnlocked(2)) {
      this.scene.start("TimelineScene", {
        message: "Conclua a fase anterior para desbloquear esta etapa.",
      });
      return;
    }

    this.drawBackground();
    this.createIntroPanel();
    this.cameras.main.fadeIn(300, 7, 16, 31);
  }

  drawBackground() {
    drawRetroBackground(this, {
      accent: 0x62e7f2,
      bottomLeft: 0x16283a,
      bottomRight: 0x0a1522,
      gridAlpha: 0.04,
      frameAlpha: 0.12,
    });
  }

  createIntroPanel() {
    this.clearStage();
    this.phase2Stage = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 48, "FASE 2: FITA MAGNÉTICA", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "19px",
          color: "#62e7f2",
        })
        .setOrigin(0.5),
    );

    const panel = createRoundedPanel(this, 480, 278, 780, 374, {
      stroke: 0x62e7f2,
      strokeAlpha: 0.48,
      radius: 20,
    });
    this.addToStage(panel);

    this.createIntroTape(480, 150);

    this.addToStage(
      this.add
        .text(
          480,
          298,
          "As fitas magnéticas armazenavam dados em uma longa faixa.\nPara encontrar um arquivo, era preciso percorrer a fita até\na posição correta.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "20px",
            fontStyle: "700",
            color: "#dce8f5",
            align: "center",
            lineSpacing: 7,
            wordWrap: { width: 710 },
          },
        )
        .setOrigin(0.5),
    );

    this.addToStage(
      this.add
        .text(
          480,
          381,
          "Use a cabeça de leitura para avançar, rebobinar e encontrar o arquivo.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "17px",
            fontStyle: "900",
            color: "#ffd166",
            align: "center",
            wordWrap: { width: 700 },
          },
        )
        .setOrigin(0.5),
    );

    this.createButton(
      480,
      452,
      290,
      "COMEÇAR DESAFIO",
      () => this.startChallenge(),
      { border: 0x8ef28b, hover: 0x246a69 },
    );
    this.createBackLink();
  }

  startChallenge() {
    this.phase2Score = PHASE2_STARTING_SCORE;
    this.phase2CurrentIndex = 0;
    this.phase2CurrentTargetIndex = 0;
    this.phase2FoundFiles = new Set();
    this.phase2IsMoving = false;
    this.phase2IsComplete = false;
    this.phase2Blocks = [];
    this.setupRandomChallenge();

    this.clearStage();
    this.phase2Stage = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 30, "FASE 2: BUSCA SEQUENCIAL", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "14px",
          color: "#62e7f2",
        })
        .setOrigin(0.5),
    );

    this.phase2ScoreText = this.add
      .text(916, 30, "PONTOS: 100", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#8ef28b",
      })
      .setOrigin(1, 0.5);
    this.addToStage(this.phase2ScoreText);

    this.createObjectivePanel();
    this.createTargetPanel();
    this.createTape();
    this.createHintBox();
    this.createControls();
    this.updateCurrentTarget();
    this.updateTapeHighlight();

    this.phase2MessageText = this.add
      .text(
        480,
        508,
        `A cabeça de leitura está em ${this.getCurrentFile()}.`,
        {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "15px",
          fontStyle: "800",
          color: "#8da2bd",
          align: "center",
          wordWrap: { width: 860 },
        },
      )
      .setOrigin(0.5);
    this.addToStage(this.phase2MessageText);
    this.createBackLink();

    this.phase2Stage.setAlpha(0);
    this.tweens.add({
      targets: this.phase2Stage,
      alpha: 1,
      duration: 280,
      ease: "Sine.out",
    });
  }

  setupRandomChallenge() {
    const previousSignature = this.phase2ChallengeSignature;

    for (let attempt = 0; attempt < 100; attempt += 1) {
      const fileCount = Phaser.Math.Between(8, 10);
      const tapeFiles = this.shuffleItems(PHASE2_FILE_POOL).slice(0, fileCount);
      const targetFiles = this.shuffleItems(tapeFiles).slice(
        0,
        PHASE2_TARGET_COUNT,
      );
      const signature = `${tapeFiles.join("|")}::${targetFiles.join("|")}`;

      if (signature !== previousSignature) {
        this.phase2TapeFiles = tapeFiles;
        this.phase2TargetFiles = targetFiles;
        this.phase2ChallengeSignature = signature;
        return;
      }
    }

    this.phase2TapeFiles = PHASE2_FILE_POOL.slice(0, 9);
    this.phase2TargetFiles = [this.phase2TapeFiles[3], this.phase2TapeFiles[7]];
    this.phase2ChallengeSignature = `${this.phase2TapeFiles.join("|")}::${this.phase2TargetFiles.join("|")}`;
  }

  shuffleItems(items) {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Phaser.Math.Between(0, index);
      [shuffled[index], shuffled[swapIndex]] = [
        shuffled[swapIndex],
        shuffled[index],
      ];
    }

    return shuffled;
  }

  createObjectivePanel() {
    const panel = createRoundedPanel(this, 480, 76, 720, 46, {
      fill: 0x101f35,
      stroke: 0xffd166,
      strokeAlpha: 0.38,
      radius: 12,
      shadow: false,
    });
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(480, 76, "Objetivo: percorra a fita até encontrar os arquivos procurados.", {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "16px",
          fontStyle: "900",
          color: "#ffd166",
          align: "center",
        })
        .setOrigin(0.5),
    );
  }

  createTargetPanel() {
    const panel = createRoundedPanel(this, 480, 130, 646, 62, {
      fill: 0x0b1729,
      stroke: 0x62e7f2,
      strokeAlpha: 0.42,
      radius: 14,
      shadow: false,
    });
    this.addToStage(panel);

    this.phase2TargetCounterText = this.add
      .text(480, 112, "ARQUIVO 1 DE 2", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#62e7f2",
        align: "center",
      })
      .setOrigin(0.5);
    this.addToStage(this.phase2TargetCounterText);

    this.phase2TargetText = this.add
      .text(480, 140, "", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "16px",
        color: "#ffd166",
        align: "center",
      })
      .setOrigin(0.5);
    this.addToStage(this.phase2TargetText);
  }

  createTape() {
    const tapePanel = createRoundedPanel(this, 480, 288, 840, 214, {
      fill: 0x0b1627,
      stroke: 0x62e7f2,
      strokeAlpha: 0.32,
      radius: 18,
    });
    this.addToStage(tapePanel);

    const graphics = this.add.graphics();
    graphics.fillStyle(0x17283a, 1);
    graphics.fillRoundedRect(72, 190, 816, 170, 16);
    graphics.lineStyle(2, 0x3f6078, 0.8);
    graphics.strokeRoundedRect(72, 190, 816, 170, 16);

    this.drawTapeReel(graphics, 119, 248);
    this.drawTapeReel(graphics, 841, 248);

    graphics.lineStyle(8, 0x544832, 1);
    graphics.beginPath();
    graphics.moveTo(119, 281);
    graphics.lineTo(119, 314);
    graphics.lineTo(841, 314);
    graphics.lineTo(841, 281);
    graphics.strokePath();

    graphics.lineStyle(2, 0xb99a5e, 0.7);
    graphics.lineBetween(119, 309, 841, 309);
    graphics.fillStyle(0x62e7f2, 0.16);
    graphics.fillRoundedRect(156, 210, 648, 35, 8);
    this.addToStage(graphics);

    const blockY = 310;
    const leftX = 162;
    const trackWidth = 636;
    const spacing =
      this.phase2TapeFiles.length > 1
        ? trackWidth / (this.phase2TapeFiles.length - 1)
        : 0;
    const blockWidth = Math.min(68, Math.max(52, spacing * 0.8));

    this.phase2TapeFiles.forEach((label, index) => {
      const x = leftX + index * spacing;
      const block = this.add
        .rectangle(x, blockY, blockWidth, 54, 0x27384a, 1)
        .setStrokeStyle(2, 0x60758a, 0.75);
      const indexText = this.add
        .text(x, blockY - 38, String(index + 1), {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "6px",
          color: "#6f849d",
        })
        .setOrigin(0.5);
      const blockText = this.add
        .text(x, blockY, this.formatFileLabel(label), {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "10px",
          fontStyle: "900",
          color: "#dce8f5",
          align: "center",
          lineSpacing: 0,
          wordWrap: { width: blockWidth - 7 },
        })
        .setOrigin(0.5);
      const foundMark = this.add
        .text(x, blockY + 37, "ENCONTRADO", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "5px",
          color: "#8ef28b",
          align: "center",
        })
        .setOrigin(0.5)
        .setVisible(false);

      this.addToStage([indexText, block, blockText, foundMark]);
      this.phase2Blocks.push({ block, text: blockText, foundMark, x });
    });

    this.createReadHead(blockY);

    this.phase2CurrentFileText = this.add
      .text(480, 370, "", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "14px",
        fontStyle: "900",
        color: "#8da2bd",
        align: "center",
      })
      .setOrigin(0.5);
    this.addToStage(this.phase2CurrentFileText);
  }

  createReadHead(blockY) {
    this.phase2ReadHead = this.add.container(this.phase2Blocks[0].x, blockY - 64);

    const glow = this.add
      .circle(0, 0, 34, 0x62e7f2, 0.15)
      .setBlendMode(Phaser.BlendModes.ADD);
    const beam = this.add
      .rectangle(0, 43, 9, 74, 0x62e7f2, 0.28)
      .setOrigin(0.5, 0)
      .setBlendMode(Phaser.BlendModes.ADD);
    const pointer = this.add
      .triangle(0, 26, -23, -8, 23, -8, 0, 31, 0x62e7f2, 0.28)
      .setStrokeStyle(2, 0x62e7f2, 0.9);
    const body = this.add
      .rectangle(0, -12, 54, 34, 0x153e50, 1)
      .setStrokeStyle(3, 0x8ef28b, 0.95);
    const light = this.add.circle(0, -12, 7, 0x8ef28b, 1);
    const label = this.add
      .text(0, -49, "CABEÇA\nDE LEITURA", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#8ef28b",
        align: "center",
        lineSpacing: 2,
      })
      .setOrigin(0.5);

    this.phase2ReadHead.add([glow, beam, pointer, body, light, label]);
    this.addToStage(this.phase2ReadHead);

    this.tweens.add({
      targets: glow,
      scale: 1.12,
      alpha: 0.08,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  formatFileLabel(label) {
    if (label.includes("-")) {
      return label.replace("-", "\n");
    }

    if (label.length > 7) {
      return `${label.slice(0, 5)}\n${label.slice(5)}`;
    }

    return label;
  }

  drawTapeReel(graphics, x, y) {
    graphics.fillStyle(0x0d1725, 1);
    graphics.fillCircle(x, y, 38);
    graphics.lineStyle(4, 0x62e7f2, 0.48);
    graphics.strokeCircle(x, y, 38);
    graphics.fillStyle(0x4a6175, 0.7);
    graphics.fillCircle(x, y, 23);
    graphics.fillStyle(0x0d1725, 1);
    graphics.fillCircle(x, y, 9);

    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
      graphics.fillStyle(0x0d1725, 1);
      graphics.fillCircle(
        x + Math.cos(angle) * 22,
        y + Math.sin(angle) * 22,
        6,
      );
    }
  }

  createHintBox() {
    const panel = createRoundedPanel(this, 765, 442, 292, 56, {
      fill: 0x101f35,
      stroke: 0x62e7f2,
      strokeAlpha: 0.35,
      radius: 12,
      shadow: false,
    });
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(
          765,
          442,
          "Acesso sequencial:\npercorra a fita, sem pular blocos.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "13px",
            fontStyle: "900",
            color: "#c7d7e8",
            align: "center",
            lineSpacing: 2,
          },
        )
        .setOrigin(0.5),
    );
  }

  createControls() {
    this.phase2RewindButton = this.createButton(
      170,
      442,
      170,
      "REBOBINAR",
      () => this.rewind(),
      { border: 0xffd166, hover: 0x564624, fontSize: "8px" },
    );
    this.phase2ForwardButton = this.createButton(
      360,
      442,
      170,
      "AVANÇAR",
      () => this.moveForward(),
      { border: 0x62e7f2, hover: 0x1c5264, fontSize: "8px" },
    );
    this.phase2ReadButton = this.createButton(
      560,
      442,
      190,
      "LER POSIÇÃO",
      () => this.readCurrentPosition(),
      { border: 0x8ef28b, hover: 0x246a69, fontSize: "8px" },
    );
  }

  moveForward() {
    if (this.phase2IsMoving || this.phase2IsComplete) {
      return;
    }

    if (this.phase2CurrentIndex >= this.phase2TapeFiles.length - 1) {
      this.updateScore(-PHASE2_EDGE_PENALTY);
      this.showFeedback("Fim da fita. Rebobine para voltar.", "warning");
      this.pulseCurrentBlock(0xffd166);
      return;
    }

    this.phase2CurrentIndex += 1;
    this.updateScore(-PHASE2_MOVE_PENALTY);
    this.animateHeadMovement("A fita avançou uma posição.", "neutral");
  }

  rewind() {
    if (this.phase2IsMoving || this.phase2IsComplete) {
      return;
    }

    if (this.phase2CurrentIndex <= 0) {
      this.updateScore(-PHASE2_EDGE_PENALTY);
      this.showFeedback("Você já está no começo da fita.", "warning");
      this.pulseCurrentBlock(0xffd166);
      return;
    }

    this.phase2CurrentIndex -= 1;
    this.updateScore(-PHASE2_MOVE_PENALTY);
    this.animateHeadMovement("A fita voltou uma posição.", "neutral");
  }

  animateHeadMovement(message, type) {
    this.phase2IsMoving = true;
    const targetX = this.phase2Blocks[this.phase2CurrentIndex].x;

    this.tweens.add({
      targets: this.phase2ReadHead,
      x: targetX,
      duration: 280,
      ease: "Sine.inOut",
      onComplete: () => {
        this.phase2IsMoving = false;
        this.updateTapeHighlight();
        this.showFeedback(
          `${message} Posição atual: ${this.getCurrentFile()}.`,
          type,
        );
      },
    });
  }

  readCurrentPosition() {
    if (this.phase2IsMoving || this.phase2IsComplete) {
      return;
    }

    if (this.getCurrentFile() === this.getCurrentTarget()) {
      this.handleCorrectRead();
      return;
    }

    this.showFailure();
  }

  handleCorrectRead() {
    const foundFile = this.getCurrentTarget();
    this.phase2FoundFiles.add(foundFile);
    this.showFeedback(`Arquivo ${foundFile} recuperado!`, "success");
    this.createSuccessSparkles(
      this.phase2Blocks[this.phase2CurrentIndex].x,
      310,
    );
    this.pulseCurrentBlock(0x8ef28b);

    if (this.phase2CurrentTargetIndex >= this.phase2TargetFiles.length - 1) {
      this.phase2IsComplete = true;
      this.disableControls();
      this.showFeedback("Todos os arquivos foram recuperados!", "success");
      this.time.delayedCall(1200, () => this.showConclusion());
      return;
    }

    this.phase2CurrentTargetIndex += 1;
    this.time.delayedCall(450, () => {
      this.updateCurrentTarget();
      this.updateTapeHighlight();
      this.showFeedback(
        `Próximo arquivo: ${this.getCurrentTarget()}. Continue pela fita.`,
        "neutral",
      );
    });
  }

  updateCurrentTarget() {
    if (!this.phase2TargetText || !this.phase2TargetCounterText) {
      return;
    }

    this.phase2TargetCounterText.setText(
      `ARQUIVO ${this.phase2CurrentTargetIndex + 1} DE ${this.phase2TargetFiles.length}`,
    );
    this.phase2TargetText.setText(this.getCurrentTarget());
  }

  updateScore(change) {
    this.phase2Score = Phaser.Math.Clamp(
      this.phase2Score + change,
      0,
      PHASE2_STARTING_SCORE,
    );
    this.phase2ScoreText.setText(`PONTOS: ${this.phase2Score}`);

    this.tweens.add({
      targets: this.phase2ScoreText,
      scale: 1.12,
      duration: 100,
      yoyo: true,
      ease: "Sine.inOut",
    });
  }

  updateTapeHighlight() {
    this.phase2Blocks.forEach(({ block, text, foundMark }, index) => {
      const file = this.phase2TapeFiles[index];
      const isCurrent = index === this.phase2CurrentIndex;
      const wasFound = this.phase2FoundFiles.has(file);

      block.setFillStyle(
        isCurrent ? 0x28576a : wasFound ? 0x143f37 : 0x27384a,
        1,
      );
      block.setStrokeStyle(
        isCurrent ? 3 : 2,
        isCurrent ? 0x8ef28b : wasFound ? 0x8ef28b : 0x60758a,
        isCurrent || wasFound ? 1 : 0.75,
      );
      text.setColor(isCurrent ? "#f1f7ff" : wasFound ? "#8ef28b" : "#c7d7e8");
      foundMark.setVisible(wasFound);
    });

    this.phase2CurrentFileText?.setText(
      `Cabeça de leitura em: ${this.getCurrentFile()}`,
    );
  }

  showFeedback(message, type = "neutral") {
    if (!this.phase2MessageText) {
      return;
    }

    const colors = {
      neutral: "#8da2bd",
      success: "#8ef28b",
      error: "#ff9b78",
      warning: "#ffd166",
    };

    this.phase2MessageText.setText(message).setColor(colors[type] ?? colors.neutral);
  }

  showFailure() {
    this.updateScore(-PHASE2_WRONG_READ_PENALTY);
    this.showFeedback(
      "Esse não é o arquivo. Continue percorrendo a fita.",
      "error",
    );

    const current = this.phase2Blocks[this.phase2CurrentIndex];
    this.tweens.add({
      targets: [current.block, current.text],
      x: "+=5",
      duration: 55,
      yoyo: true,
      repeat: 2,
    });
    this.cameras.main.shake(120, 0.002);
  }

  createSuccessSparkles(centerX, centerY) {
    const offsets = [
      [-38, -32],
      [-24, 35],
      [0, -44],
      [26, 33],
      [40, -25],
    ];

    offsets.forEach(([offsetX, offsetY], index) => {
      const sparkle = this.add
        .rectangle(
          centerX + offsetX,
          centerY + offsetY,
          8,
          8,
          index % 2 === 0 ? 0x8ef28b : 0x62e7f2,
          0.9,
        )
        .setRotation(Math.PI / 4);
      this.addToStage(sparkle);

      this.tweens.add({
        targets: sparkle,
        scale: 2.1,
        alpha: 0,
        angle: 135,
        duration: 560,
        delay: index * 55,
        ease: "Sine.out",
      });
    });
  }

  showConclusion() {
    completePhase(2);
    savePhaseScore(2, this.phase2Score);

    const finalScore = this.phase2Score;
    this.clearStage();
    this.phase2Stage = this.add.container(0, 0);

    const glow = this.add
      .circle(480, 125, 76, 0x62e7f2, 0.07)
      .setStrokeStyle(2, 0x62e7f2, 0.3);
    this.addToStage(glow);
    this.tweens.add({
      targets: glow,
      scale: 1.18,
      alpha: 0.025,
      duration: 950,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    this.addToStage(
      this.add
        .text(480, 54, "FASE CONCLUÍDA!", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "20px",
          color: "#8ef28b",
        })
        .setOrigin(0.5),
    );

    this.createCompletionTape(480, 125);

    const panel = createRoundedPanel(this, 480, 301, 770, 220, {
      stroke: 0x62e7f2,
      strokeAlpha: 0.42,
      radius: 18,
    });
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(
          480,
          278,
          "Você aprendeu que a fita magnética armazenava dados em\nsequência. Para encontrar um arquivo, era necessário avançar\nou rebobinar a fita até chegar à posição correta.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "18px",
            fontStyle: "700",
            color: "#dce8f5",
            align: "center",
            lineSpacing: 7,
            wordWrap: { width: 720 },
          },
        )
        .setOrigin(0.5),
    );

    this.addToStage(
      this.add
        .text(480, 372, `PONTUAÇÃO FINAL: ${finalScore}`, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "12px",
          color: "#ffd166",
        })
        .setOrigin(0.5),
    );

    this.createButton(
      304,
      462,
      310,
      "VOLTAR À LINHA DO TEMPO",
      () => this.returnToTimeline(),
      { border: 0x62e7f2, hover: 0x1c5264, fontSize: "8px" },
    );
    this.createButton(
      656,
      462,
      270,
      "JOGAR NOVAMENTE",
      () => this.restartPhase(),
      { border: 0x8ef28b, hover: 0x246a69, fontSize: "10px" },
    );

    this.phase2Stage.setAlpha(0).setScale(0.97);
    this.tweens.add({
      targets: this.phase2Stage,
      alpha: 1,
      scale: 1,
      duration: 350,
      ease: "Back.out",
    });
  }

  createIntroTape(x, y) {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x152739, 1);
    graphics.fillRoundedRect(x - 150, y - 60, 300, 120, 14);
    graphics.lineStyle(3, 0x62e7f2, 0.52);
    graphics.strokeRoundedRect(x - 150, y - 60, 300, 120, 14);
    this.drawTapeReel(graphics, x - 83, y - 2);
    this.drawTapeReel(graphics, x + 83, y - 2);
    graphics.lineStyle(7, 0x655437, 1);
    graphics.lineBetween(x - 83, y + 38, x + 83, y + 38);
    this.addToStage(graphics);
  }

  createCompletionTape(x, y) {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x152739, 1);
    graphics.fillRoundedRect(x - 76, y - 34, 152, 68, 9);
    graphics.lineStyle(2, 0x62e7f2, 0.55);
    graphics.strokeRoundedRect(x - 76, y - 34, 152, 68, 9);
    graphics.fillStyle(0x0d1725, 1);
    graphics.fillCircle(x - 38, y, 20);
    graphics.fillCircle(x + 38, y, 20);
    graphics.lineStyle(5, 0x655437, 1);
    graphics.lineBetween(x - 38, y + 20, x + 38, y + 20);
    graphics.fillStyle(0x8ef28b, 1);
    graphics.fillCircle(x - 38, y, 5);
    graphics.fillCircle(x + 38, y, 5);
    this.addToStage(graphics);
  }

  pulseCurrentBlock(color) {
    const current = this.phase2Blocks[this.phase2CurrentIndex];
    current.block.setStrokeStyle(3, color, 1);
    this.tweens.add({
      targets: current.block,
      scale: 1.08,
      duration: 110,
      yoyo: true,
      repeat: 1,
      onComplete: () => this.updateTapeHighlight(),
    });
  }

  disableControls() {
    [
      this.phase2RewindButton,
      this.phase2ReadButton,
      this.phase2ForwardButton,
    ].forEach((button) => button.background.disableInteractive());
  }

  getCurrentFile() {
    return this.phase2TapeFiles[this.phase2CurrentIndex];
  }

  getCurrentTarget() {
    return this.phase2TargetFiles[this.phase2CurrentTargetIndex];
  }

  restartPhase() {
    this.startChallenge();
  }

  returnToTimeline() {
    this.scene.start("TimelineScene");
  }

  createButton(x, y, width, label, callback, options = {}) {
    return createStandardButton(this, x, y, width, label, callback, {
      border: options.border ?? 0x62e7f2,
      hover: options.hover ?? 0x1c5264,
      fontSize: options.fontSize ?? "10px",
      addToStage: (button) => this.addToStage(button),
    });
  }

  createBackLink() {
    const text = this.add
      .text(38, 30, "← LINHA DO TEMPO", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "14px",
        fontStyle: "800",
        color: "#8da2bd",
      })
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true });
    this.addToStage(text);

    text.on("pointerover", () => text.setColor("#62e7f2"));
    text.on("pointerout", () => text.setColor("#8da2bd"));
    text.on("pointerdown", () => this.returnToTimeline());
  }

  addToStage(gameObjects) {
    this.phase2Stage.add(gameObjects);
  }

  clearStage() {
    this.tweens.killAll();

    if (this.phase2Stage) {
      this.phase2Stage.destroy(true);
      this.phase2Stage = null;
    }
  }
}
