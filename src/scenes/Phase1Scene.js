import { completePhase } from "../utils/progressManager.js";
import {
  createRoundedPanel,
  createStandardButton,
  drawRetroBackground,
} from "../utils/visualHelpers.js";

const TARGET_SEQUENCE = [1, 0, 1, 1, 0, 0, 1, 0];

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

    const panel = createRoundedPanel(this, 480, 277, 760, 360, {
      stroke: 0xffd166,
      strokeAlpha: 0.5,
      radius: 20,
    });
    this.addToStage(panel);

    this.createDecorativeCard(480, 158);

    this.addToStage(
      this.add
        .text(
          480,
          287,
          "Antes dos pendrives, HDs e nuvem, muitos computadores\narmazenavam informações em cartões de papel perfurados.\nCada furo representava uma informação, funcionando como\numa forma física de guardar dados.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "20px",
            fontStyle: "600",
            color: "#dce8f5",
            align: "center",
            lineSpacing: 8,
          },
        )
        .setOrigin(0.5),
    );

    this.createButton(
      480,
      434,
      290,
      "COMEÇAR DESAFIO",
      () => this.startChallenge(),
      { border: 0x8ef28b, hover: 0x246a69 },
    );
    this.createBackLink();
  }

  startChallenge() {
    this.score = 100;
    this.currentBits = Array(TARGET_SEQUENCE.length).fill(0);
    this.isChecking = false;
    this.holes = [];

    this.clearStage();
    this.stageContainer = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 32, "CARTÃO DE DADOS", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "16px",
          color: "#ffd166",
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

    this.createTargetDisplay();
    this.createPunchCard();
    this.createEducationBox();

    this.checkButton = this.createButton(
      344,
      438,
      280,
      "VERIFICAR CARTÃO",
      () => this.checkAnswer(),
      { border: 0x62e7f2, hover: 0x1c5264 },
    );

    this.feedbackText = this.add
      .text(480, 493, "Clique nas posições para alternar entre 0 e 1.", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "16px",
        fontStyle: "700",
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

  createTargetDisplay() {
    const panel = createRoundedPanel(this, 344, 91, 590, 72, {
      fill: 0x101f35,
      stroke: 0x62e7f2,
      strokeAlpha: 0.38,
      radius: 13,
      shadow: false,
    });
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(344, 70, "SEQUÊNCIA NECESSÁRIA", {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "13px",
          fontStyle: "800",
          color: "#8da2bd",
          letterSpacing: 1,
        })
        .setOrigin(0.5),
    );

    const sequence = TARGET_SEQUENCE.join("  ");
    this.addToStage(
      this.add
        .text(344, 102, sequence, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "17px",
          color: "#f1f7ff",
          letterSpacing: 2,
        })
        .setOrigin(0.5),
    );
  }

  createPunchCard() {
    const cardX = 48;
    const cardY = 145;
    const cardWidth = 592;
    const cardHeight = 238;
    const card = this.add.graphics();

    card.fillStyle(0x5a4322, 0.28);
    card.fillRoundedRect(cardX + 8, cardY + 10, cardWidth, cardHeight, 16);
    card.fillStyle(0xe4bd69, 1);
    card.fillRoundedRect(cardX, cardY, cardWidth, cardHeight, 16);
    card.lineStyle(3, 0xffe4a4, 0.8);
    card.strokeRoundedRect(cardX, cardY, cardWidth, cardHeight, 16);

    card.fillStyle(0x8b682f, 0.28);
    for (let y = cardY + 17; y < cardY + cardHeight - 10; y += 15) {
      card.fillRect(cardX + 16, y, cardWidth - 32, 1);
    }

    card.lineStyle(2, 0x7b5927, 0.35);
    card.lineBetween(cardX + 28, cardY + 51, cardX + cardWidth - 28, cardY + 51);
    card.lineBetween(cardX + 28, cardY + 188, cardX + cardWidth - 28, cardY + 188);
    this.addToStage(card);

    this.addToStage(
      this.add
        .text(cardX + 25, cardY + 23, "BIT DATA CARD • MODELO 1890", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: "#684b22",
        })
        .setOrigin(0, 0.5),
    );

    const startX = cardX + 62;
    const spacing = 67;

    TARGET_SEQUENCE.forEach((_, index) => {
      const x = startX + index * spacing;
      const y = cardY + 120;
      const holeContainer = this.add.container(x, y);

      const column = this.add
        .rectangle(0, 0, 52, 118, 0xf0cc7a, 0.5)
        .setStrokeStyle(1, 0x8c672d, 0.42);
      const hole = this.add
        .circle(0, 0, 18, 0xf5d98e, 1)
        .setStrokeStyle(3, 0x8a642c, 0.72);
      const shine = this.add.circle(-5, -5, 5, 0xffedb7, 0.7);
      const number = this.add
        .text(0, -45, String(index + 1), {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#785625",
        })
        .setOrigin(0.5);
      const bit = this.add
        .text(0, 45, "0", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "13px",
          color: "#684b22",
        })
        .setOrigin(0.5);
      const hitArea = this.add
        .rectangle(0, 0, 56, 122, 0xffffff, 0.001)
        .setInteractive({ useHandCursor: true });

      holeContainer.add([column, hole, shine, number, bit, hitArea]);
      this.addToStage(holeContainer);

      hitArea.on("pointerover", () => {
        if (!this.isChecking) {
          column.setFillStyle(0xffdda0, 0.72);
          this.tweens.add({
            targets: holeContainer,
            scale: 1.04,
            duration: 100,
          });
        }
      });
      hitArea.on("pointerout", () => {
        column.setFillStyle(0xf0cc7a, 0.5);
        this.tweens.add({
          targets: holeContainer,
          scale: 1,
          duration: 100,
        });
      });
      hitArea.on("pointerdown", () => this.toggleHole(index));

      this.holes.push({
        container: holeContainer,
        hole,
        shine,
        bit,
        hitArea,
      });
    });

    this.addToStage(
      this.add
        .text(344, cardY + 211, "FURO = 1     •     SEM FURO = 0", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#684b22",
        })
        .setOrigin(0.5),
    );
  }

  toggleHole(index) {
    if (this.isChecking) {
      return;
    }

    this.currentBits[index] = this.currentBits[index] === 0 ? 1 : 0;
    const entry = this.holes[index];
    const isPunched = this.currentBits[index] === 1;

    entry.hole.setFillStyle(isPunched ? 0x101722 : 0xf5d98e, 1);
    entry.hole.setStrokeStyle(
      3,
      isPunched ? 0x5a401e : 0x8a642c,
      isPunched ? 0.9 : 0.72,
    );
    entry.shine.setVisible(!isPunched);
    entry.bit.setText(isPunched ? "1" : "0");
    entry.bit.setColor(isPunched ? "#12344a" : "#684b22");

    this.tweens.add({
      targets: entry.hole,
      scale: { from: 0.72, to: 1 },
      duration: 180,
      ease: "Back.out",
    });

    this.feedbackText
      .setText(`Cartão atual: ${this.currentBits.join("")}`)
      .setColor("#8da2bd");
  }

  checkAnswer() {
    if (this.isChecking) {
      return;
    }

    const isCorrect = this.currentBits.every(
      (bit, index) => bit === TARGET_SEQUENCE[index],
    );

    if (isCorrect) {
      this.showSuccess();
    } else {
      this.showFailure();
    }
  }

  showFailure() {
    this.score = Math.max(0, this.score - 10);
    this.scoreText.setText(`PONTOS: ${this.score}`);
    this.feedbackText
      .setText(
        "Alguns furos estão incorretos. Revise o cartão e tente novamente.",
      )
      .setColor("#ff9b78");

    this.holes.forEach((entry, index) => {
      if (this.currentBits[index] !== TARGET_SEQUENCE[index]) {
        this.tweens.add({
          targets: entry.container,
          x: "+=5",
          duration: 55,
          yoyo: true,
          repeat: 2,
        });
      }
    });

    this.cameras.main.shake(130, 0.002);
  }

  showSuccess() {
    this.isChecking = true;
    this.feedbackText
      .setText(
        `Cartão lido com sucesso! Os dados foram armazenados corretamente. Pontuação final: ${this.score}.`,
      )
      .setColor("#8ef28b");

    this.holes.forEach((entry) => entry.hitArea.disableInteractive());
    this.checkButton.background.disableInteractive();

    const scannerGlow = this.add
      .rectangle(72, 264, 18, 220, 0x8ef28b, 0.3)
      .setBlendMode(Phaser.BlendModes.ADD);
    const scannerLine = this.add
      .rectangle(72, 264, 4, 220, 0xeaffd9, 0.95)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.addToStage([scannerGlow, scannerLine]);

    this.tweens.add({
      targets: [scannerGlow, scannerLine],
      x: 616,
      duration: 850,
      ease: "Sine.inOut",
      onComplete: () => this.createSuccessSparkles(),
    });

    this.time.delayedCall(1550, () => this.showConclusion());
  }

  createSuccessSparkles() {
    const positions = [
      [110, 182],
      [185, 338],
      [310, 177],
      [438, 347],
      [550, 185],
      [610, 330],
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

    const panel = createRoundedPanel(this, 480, 298, 760, 220, {
      stroke: 0x8ef28b,
      strokeAlpha: 0.42,
      radius: 18,
    });
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(
          480,
          273,
          "Você aprendeu que os cartões perfurados armazenavam dados\nde forma física, usando padrões de furos. Eles tinham pouca\ncapacidade e exigiam muito cuidado, mas foram fundamentais\nno início da computação.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "19px",
            fontStyle: "600",
            color: "#dce8f5",
            align: "center",
            lineSpacing: 7,
          },
        )
        .setOrigin(0.5),
    );

    this.addToStage(
      this.add
        .text(480, 365, `PONTUAÇÃO FINAL: ${finalScore}`, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "12px",
          color: "#ffd166",
        })
        .setOrigin(0.5),
    );

    this.createButton(
      304,
      458,
      310,
      "VOLTAR À LINHA DO TEMPO",
      () => this.scene.start("TimelineScene"),
      { border: 0x62e7f2, hover: 0x1c5264, fontSize: "9px" },
    );
    this.createButton(
      656,
      458,
      270,
      "JOGAR NOVAMENTE",
      () => this.startChallenge(),
      { border: 0x8ef28b, hover: 0x246a69, fontSize: "10px" },
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

  createEducationBox() {
    const panel = createRoundedPanel(this, 796, 264, 270, 286, {
      fill: 0x101f35,
      stroke: 0x62e7f2,
      strokeAlpha: 0.35,
      radius: 16,
    });
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(796, 146, "VOCÊ SABIA?", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "10px",
          color: "#62e7f2",
        })
        .setOrigin(0.5),
    );

    this.addToStage(
      this.add
        .text(
          796,
          275,
          "Nos cartões perfurados, a\npresença ou ausência de\nfuros podia representar\ninformações.\n\nEsse conceito lembra a\nlógica binária usada pelos\ncomputadores:\n\n1 = ligado / presente\n0 = desligado / ausente",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "14px",
            fontStyle: "600",
            color: "#c7d7e8",
            align: "center",
            lineSpacing: 4,
          },
        )
        .setOrigin(0.5),
    );
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
    card.fillRoundedRect(415, 92, 130, 60, 8);
    card.lineStyle(2, 0xffe4a4, 0.8);
    card.strokeRoundedRect(415, 92, 130, 60, 8);
    card.fillStyle(0x101722, 0.95);

    TARGET_SEQUENCE.forEach((bit, index) => {
      if (bit === 1) {
        card.fillCircle(431 + index * 14, 122, 5);
      } else {
        card.lineStyle(1, 0x8a642c, 0.7);
        card.strokeCircle(431 + index * 14, 122, 5);
      }
    });
    this.addToStage(card);
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
    text.on("pointerdown", () => this.scene.start("TimelineScene"));
  }

  addToStage(gameObjects) {
    this.stageContainer.add(gameObjects);
  }

  clearStage() {
    if (this.stageContainer) {
      this.stageContainer.destroy(true);
      this.stageContainer = null;
    }
  }
}
