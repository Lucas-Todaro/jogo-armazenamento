import { completePhase, savePhaseScore } from "../utils/progressManager.js";
import {
  createRoundedPanel,
  createStandardButton,
  drawRetroBackground,
} from "../utils/visualHelpers.js";

const BIT_COUNT = 8;
const STARTING_SCORE = 100;
const WRONG_ATTEMPT_PENALTY = 10;

export default class Phase1Scene extends Phaser.Scene {
  constructor() {
    super("Phase1Scene");
  }

  create() {
    this.drawBackground();
    this.createIntroPanel();
    this.cameras.main.fadeIn(300, 7, 16, 31);
  }

  drawBackground() {
    drawRetroBackground(this, {
      accent: 0xffd166,
      bottomLeft: 0x1b2636,
      bottomRight: 0x0b1421,
      gridStep: 24,
      gridAlpha: 0.04,
      frameAlpha: 0.12,
    });
  }

  createIntroPanel() {
    this.clearStage();
    this.stageContainer = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 55, "FASE 1: CARTÕES PERFURADOS", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "18px",
          color: "#ffd166",
          align: "center",
        })
        .setOrigin(0.5),
    );

    const panel = createRoundedPanel(this, 480, 278, 760, 360, {
      stroke: 0xffd166,
      strokeAlpha: 0.5,
      radius: 20,
    });
    this.addToStage(panel);

    this.createDecorativeCard(480, 162);

    this.addToStage(
      this.add
        .text(
          480,
          296,
          "Antes dos pendrives, HDs e nuvem, alguns computadores\nusavam cartões de papel perfurados para armazenar dados.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "21px",
            fontStyle: "700",
            color: "#dce8f5",
            align: "center",
            lineSpacing: 8,
            wordWrap: { width: 690 },
          },
        )
        .setOrigin(0.5),
    );

    this.addToStage(
      this.add
        .text(
          480,
          372,
          "Monte a sequência correta marcando os furos no cartão.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "18px",
            fontStyle: "900",
            color: "#ffd166",
            align: "center",
          },
        )
        .setOrigin(0.5),
    );

    this.createButton(
      480,
      445,
      290,
      "COMEÇAR DESAFIO",
      () => this.startChallenge(),
      { border: 0x8ef28b, hover: 0x246a69 },
    );
    this.createBackLink();
  }

  startChallenge() {
    this.score = STARTING_SCORE;
    this.wrongAttempts = 0;
    this.targetSequence = this.generateRandomSequence(this.targetSequence);
    this.currentBits = Array(BIT_COUNT).fill(0);
    this.isChecking = false;
    this.holes = [];

    this.clearStage();
    this.stageContainer = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 31, "FASE 1: CARTÃO DE DADOS", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "14px",
          color: "#ffd166",
          align: "center",
        })
        .setOrigin(0.5),
    );

    this.scoreText = this.add
      .text(916, 31, "PONTOS: 100", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#8ef28b",
      })
      .setOrigin(1, 0.5);
    this.addToStage(this.scoreText);

    this.createObjectivePanel();
    this.createTargetDisplay();
    this.createPunchCard();
    this.createHintBox();

    this.checkButton = this.createButton(
      334,
      454,
      286,
      "VERIFICAR CARTÃO",
      () => this.checkAnswer(),
      { border: 0x62e7f2, hover: 0x1c5264, fontSize: "9px" },
    );

    this.feedbackText = this.add
      .text(480, 508, "Clique nas posições para alternar entre 0 e 1.", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "16px",
        fontStyle: "800",
        color: "#8da2bd",
        align: "center",
        wordWrap: { width: 820 },
      })
      .setOrigin(0.5);
    this.addToStage(this.feedbackText);
    this.createBackLink();

    this.stageContainer.setAlpha(0);
    this.tweens.add({
      targets: this.stageContainer,
      alpha: 1,
      duration: 280,
      ease: "Sine.out",
    });
  }

  generateRandomSequence(previousSequence = null) {
    const previousSequenceText = previousSequence?.join("");

    for (let attempt = 0; attempt < 100; attempt += 1) {
      const sequence = Array.from({ length: BIT_COUNT }, () =>
        Phaser.Math.Between(0, 1),
      );
      const ones = sequence.filter((bit) => bit === 1).length;
      const zeros = BIT_COUNT - ones;
      const sequenceText = sequence.join("");
      const isTooEasy =
        ones < 2 ||
        zeros < 2 ||
        sequenceText === "01010101" ||
        sequenceText === "10101010" ||
        sequenceText === previousSequenceText;

      if (!isTooEasy) {
        return sequence;
      }
    }

    return [
      [1, 0, 1, 1, 0, 0, 1, 0],
      [0, 1, 1, 0, 1, 0, 0, 1],
      [1, 1, 0, 0, 1, 0, 1, 0],
    ].find((sequence) => sequence.join("") !== previousSequenceText);
  }

  createObjectivePanel() {
    const panel = createRoundedPanel(this, 480, 78, 720, 48, {
      fill: 0x101f35,
      stroke: 0xffd166,
      strokeAlpha: 0.38,
      radius: 12,
      shadow: false,
    });
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(480, 78, "Objetivo: perfure o cartão para formar a sequência binária.", {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "16px",
          fontStyle: "900",
          color: "#ffd166",
          align: "center",
        })
        .setOrigin(0.5),
    );
  }

  createTargetDisplay() {
    const panel = createRoundedPanel(this, 480, 137, 680, 68, {
      fill: 0x0b1729,
      stroke: 0x62e7f2,
      strokeAlpha: 0.42,
      radius: 14,
      shadow: false,
    });
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(480, 118, "SEQUÊNCIA-ALVO", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#62e7f2",
          align: "center",
        })
        .setOrigin(0.5),
    );

    const startX = 480 - 7 * 36;
    this.targetSequence.forEach((bit, index) => {
      const x = startX + index * 72;
      const box = this.add
        .rectangle(x, 146, 52, 32, bit === 1 ? 0x183749 : 0x151f2f, 1)
        .setStrokeStyle(2, bit === 1 ? 0x8ef28b : 0xffd166, 0.86);
      const text = this.add
        .text(x, 146, String(bit), {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "14px",
          color: bit === 1 ? "#8ef28b" : "#ffd166",
        })
        .setOrigin(0.5);

      this.addToStage([box, text]);
    });
  }

  createPunchCard() {
    const cardX = 100;
    const cardY = 195;
    const cardWidth = 760;
    const cardHeight = 220;
    this.cardContainer = this.add.container(0, 0);
    this.addToStage(this.cardContainer);

    const card = this.add.graphics();
    card.fillStyle(0x5a4322, 0.26);
    card.fillRoundedRect(cardX + 9, cardY + 11, cardWidth, cardHeight, 18);
    card.fillStyle(0xe7bf6d, 1);
    card.fillRoundedRect(cardX, cardY, cardWidth, cardHeight, 18);
    card.lineStyle(3, 0xffe4a4, 0.86);
    card.strokeRoundedRect(cardX, cardY, cardWidth, cardHeight, 18);

    card.fillStyle(0x8b682f, 0.22);
    for (let y = cardY + 18; y < cardY + cardHeight - 12; y += 14) {
      card.fillRect(cardX + 18, y, cardWidth - 36, 1);
    }

    card.lineStyle(2, 0x7b5927, 0.34);
    card.lineBetween(cardX + 34, cardY + 48, cardX + cardWidth - 34, cardY + 48);
    card.lineBetween(cardX + 34, cardY + 173, cardX + cardWidth - 34, cardY + 173);
    this.cardContainer.add(card);

    this.cardContainer.add(
      this.add
        .text(cardX + 26, cardY + 24, "BIT DATA CARD • PERFURAÇÃO BINÁRIA", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: "#684b22",
        })
        .setOrigin(0, 0.5),
    );

    this.cardContainer.add(
      this.add
        .text(cardX + cardWidth - 26, cardY + 24, "8 POSIÇÕES", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: "#684b22",
        })
        .setOrigin(1, 0.5),
    );

    const startX = cardX + 73;
    const spacing = 88;

    this.targetSequence.forEach((_, index) => {
      const x = startX + index * spacing;
      const y = cardY + 108;
      const holeContainer = this.add.container(x, y);

      const column = this.add
        .rectangle(0, 0, 64, 130, 0xf2cc79, 0.52)
        .setStrokeStyle(1, 0x8c672d, 0.42);
      const number = this.add
        .text(0, -52, String(index + 1), {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#765526",
        })
        .setOrigin(0.5);
      const hole = this.add
        .circle(0, -4, 22, 0xf7da95, 1)
        .setStrokeStyle(4, 0x8a642c, 0.74);
      const shine = this.add.circle(-7, -11, 6, 0xffedb7, 0.82);
      const bitBadge = this.add
        .rectangle(0, 50, 44, 25, 0xf5d98e, 0.9)
        .setStrokeStyle(2, 0x8a642c, 0.55);
      const bit = this.add
        .text(0, 50, "0", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "12px",
          color: "#684b22",
        })
        .setOrigin(0.5);
      const hitArea = this.add
        .rectangle(0, 0, 72, 138, 0xffffff, 0.001)
        .setInteractive({ useHandCursor: true });

      holeContainer.add([column, number, hole, shine, bitBadge, bit, hitArea]);
      this.cardContainer.add(holeContainer);

      hitArea.on("pointerover", () => {
        if (!this.isChecking) {
          column.setFillStyle(0xffdda0, 0.72);
          this.tweens.add({
            targets: holeContainer,
            scale: 1.045,
            duration: 100,
          });
        }
      });
      hitArea.on("pointerout", () => {
        column.setFillStyle(0xf2cc79, 0.52);
        this.tweens.add({
          targets: holeContainer,
          scale: 1,
          duration: 100,
        });
      });
      hitArea.on("pointerdown", () => this.toggleHole(index));

      this.holes.push({
        container: holeContainer,
        column,
        hole,
        shine,
        bitBadge,
        bit,
        hitArea,
      });
    });

    this.cardContainer.add(
      this.add
        .text(480, cardY + 194, "1 = COM FURO     |     0 = SEM FURO", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#684b22",
          align: "center",
        })
        .setOrigin(0.5),
    );
  }

  createHintBox() {
    const panel = createRoundedPanel(this, 704, 454, 302, 54, {
      fill: 0x101f35,
      stroke: 0x62e7f2,
      strokeAlpha: 0.35,
      radius: 12,
      shadow: false,
    });
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(704, 454, "Dica: 1 = com furo | 0 = sem furo", {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "14px",
          fontStyle: "900",
          color: "#c7d7e8",
          align: "center",
        })
        .setOrigin(0.5),
    );
  }

  toggleHole(index) {
    if (this.isChecking) {
      return;
    }

    this.currentBits[index] = this.currentBits[index] === 0 ? 1 : 0;
    this.updateCardVisual(index);
    this.showFeedback(`Cartão atual: ${this.currentBits.join("")}`, "neutral");
  }

  updateCardVisual(index) {
    const entry = this.holes[index];
    const isPunched = this.currentBits[index] === 1;

    entry.hole.setFillStyle(isPunched ? 0x07101f : 0xf7da95, 1);
    entry.hole.setStrokeStyle(
      isPunched ? 5 : 4,
      isPunched ? 0x5a401e : 0x8a642c,
      isPunched ? 0.95 : 0.74,
    );
    entry.shine.setVisible(!isPunched);
    entry.bitBadge
      .setFillStyle(isPunched ? 0x173f4e : 0xf5d98e, 0.95)
      .setStrokeStyle(2, isPunched ? 0x8ef28b : 0x8a642c, isPunched ? 0.9 : 0.55);
    entry.bit.setText(isPunched ? "1" : "0");
    entry.bit.setColor(isPunched ? "#8ef28b" : "#684b22");

    this.tweens.add({
      targets: [entry.hole, entry.bitBadge],
      scale: { from: 0.78, to: 1 },
      duration: 170,
      ease: "Back.out",
    });
  }

  checkAnswer() {
    if (this.isChecking) {
      return;
    }

    const isCorrect = this.currentBits.every(
      (bit, index) => bit === this.targetSequence[index],
    );

    if (isCorrect) {
      this.showSuccess();
      return;
    }

    this.showFailure();
  }

  updateScore(change) {
    this.score = Phaser.Math.Clamp(this.score + change, 0, STARTING_SCORE);
    this.scoreText.setText(`PONTOS: ${this.score}`);

    this.tweens.add({
      targets: this.scoreText,
      scale: 1.12,
      duration: 100,
      yoyo: true,
      ease: "Sine.inOut",
    });
  }

  showFeedback(message, type = "neutral") {
    const colors = {
      neutral: "#8da2bd",
      success: "#8ef28b",
      error: "#ff9b78",
      warning: "#ffd166",
    };

    this.feedbackText.setText(message).setColor(colors[type] ?? colors.neutral);
  }

  showFailure() {
    this.wrongAttempts += 1;
    this.updateScore(-WRONG_ATTEMPT_PENALTY);
    this.showFeedback(
      this.wrongAttempts >= 2
        ? "Compare cada posição do cartão com a sequência-alvo."
        : "Revise os furos marcados no cartão.",
      "error",
    );

    this.tweens.add({
      targets: this.cardContainer,
      x: "+=7",
      duration: 55,
      yoyo: true,
      repeat: 3,
      ease: "Sine.inOut",
      onComplete: () => this.cardContainer.setX(0),
    });
    this.cameras.main.shake(120, 0.002);
  }

  showSuccess() {
    this.isChecking = true;
    this.showFeedback("Cartão lido com sucesso! Sequência armazenada.", "success");

    this.holes.forEach((entry) => entry.hitArea.disableInteractive());
    this.checkButton.background.disableInteractive();

    const scannerGlow = this.add
      .rectangle(116, 305, 22, 194, 0x8ef28b, 0.28)
      .setBlendMode(Phaser.BlendModes.ADD);
    const scannerLine = this.add
      .rectangle(116, 305, 5, 194, 0xeaffd9, 0.92)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.addToStage([scannerGlow, scannerLine]);

    this.tweens.add({
      targets: [scannerGlow, scannerLine],
      x: 844,
      duration: 880,
      ease: "Sine.inOut",
      onComplete: () => this.createSuccessSparkles(),
    });

    this.tweens.add({
      targets: this.cardContainer,
      scale: 1.025,
      duration: 260,
      yoyo: true,
      repeat: 2,
      ease: "Sine.inOut",
    });

    this.time.delayedCall(1450, () => this.showConclusion());
  }

  createSuccessSparkles() {
    const positions = [
      [150, 235],
      [230, 372],
      [358, 238],
      [480, 372],
      [610, 238],
      [730, 371],
      [820, 247],
    ];

    positions.forEach(([x, y], index) => {
      const sparkle = this.add
        .rectangle(x, y, 8, 8, index % 2 === 0 ? 0x8ef28b : 0x62e7f2, 0.9)
        .setRotation(Math.PI / 4);
      this.addToStage(sparkle);
      this.tweens.add({
        targets: sparkle,
        scale: 2.2,
        alpha: 0,
        angle: 135,
        duration: 550,
        delay: index * 45,
        ease: "Sine.out",
      });
    });
  }

  showConclusion() {
    completePhase(1);
    savePhaseScore(1, this.score);

    const finalScore = this.score;
    this.clearStage();
    this.stageContainer = this.add.container(0, 0);

    const glow = this.add
      .circle(480, 118, 75, 0x8ef28b, 0.08)
      .setStrokeStyle(2, 0x8ef28b, 0.3);
    this.addToStage(glow);
    this.tweens.add({
      targets: glow,
      scale: 1.18,
      alpha: 0.03,
      duration: 950,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    this.addToStage(
      this.add
        .text(480, 56, "FASE CONCLUÍDA!", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "20px",
          color: "#8ef28b",
        })
        .setOrigin(0.5),
    );

    this.createCompletionCard();

    const panel = createRoundedPanel(this, 480, 302, 780, 224, {
      stroke: 0x8ef28b,
      strokeAlpha: 0.42,
      radius: 18,
    });
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(
          480,
          277,
          "Você aprendeu que os cartões perfurados armazenavam dados\nusando padrões físicos de furos. Cada posição podia representar\numa informação, como 1 para furo e 0 para ausência de furo.",
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
      180,
      462,
      240,
      "VOLTAR À LINHA DO TEMPO",
      () => this.returnToTimeline(),
      { border: 0x62e7f2, hover: 0x1c5264, fontSize: "7px" },
    );
    this.createButton(
      480,
      462,
      240,
      "PRÓXIMA FASE",
      () => this.scene.start("Phase2Scene"),
      { border: 0xffd166, hover: 0x5f4a1f, fontSize: "9px" },
    );
    this.createButton(
      780,
      462,
      240,
      "JOGAR NOVAMENTE",
      () => this.restartPhase(),
      { border: 0x8ef28b, hover: 0x246a69, fontSize: "9px" },
    );

    this.stageContainer.setAlpha(0);
    this.stageContainer.setScale(0.97);
    this.tweens.add({
      targets: this.stageContainer,
      alpha: 1,
      scale: 1,
      duration: 350,
      ease: "Back.out",
    });
  }

  createDecorativeCard(x, y) {
    const card = this.add.graphics();
    card.fillStyle(0xe4bd69, 1);
    card.fillRoundedRect(x - 125, y - 52, 250, 104, 10);
    card.lineStyle(3, 0xffe4a4, 0.8);
    card.strokeRoundedRect(x - 125, y - 52, 250, 104, 10);
    card.fillStyle(0x142033, 0.9);

    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 10; column += 1) {
        if ((row * 2 + column) % 3 !== 0) {
          card.fillRoundedRect(
            x - 100 + column * 21,
            y - 27 + row * 17,
            9,
            6,
            2,
          );
        }
      }
    }

    this.addToStage(card);
  }

  createCompletionCard() {
    const card = this.add.graphics();
    card.fillStyle(0xe4bd69, 1);
    card.fillRoundedRect(404, 92, 152, 60, 8);
    card.lineStyle(2, 0xffe4a4, 0.8);
    card.strokeRoundedRect(404, 92, 152, 60, 8);

    this.targetSequence.forEach((bit, index) => {
      const x = 424 + index * 16;
      if (bit === 1) {
        card.fillStyle(0x101722, 0.95);
        card.fillCircle(x, 122, 5);
      } else {
        card.lineStyle(1, 0x8a642c, 0.7);
        card.strokeCircle(x, 122, 5);
      }
    });
    this.addToStage(card);
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
      .text(38, 31, "← LINHA DO TEMPO", {
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
    this.stageContainer.add(gameObjects);
  }

  clearStage() {
    this.tweens.killAll();

    if (this.stageContainer) {
      this.stageContainer.destroy(true);
      this.stageContainer = null;
    }
  }
}
