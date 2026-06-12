const PHASE2_DATA_BLOCKS = Array.from(
  { length: 10 },
  (_, index) => `DADO-${String(index + 1).padStart(2, "0")}`,
);
const PHASE2_TARGET_INDEX = 6;
const PHASE2_STARTING_SCORE = 100;

export default class Phase2Scene extends Phaser.Scene {
  constructor() {
    super("Phase2Scene");
  }

  create() {
    this.drawBackground();
    this.createIntroPanel();
    this.cameras.main.fadeIn(300, 7, 16, 31);
  }

  drawBackground() {
    const graphics = this.add.graphics();

    graphics.fillGradientStyle(0x07101f, 0x07101f, 0x16283a, 0x0a1522, 1);
    graphics.fillRect(0, 0, 960, 540);

    graphics.lineStyle(1, 0x62e7f2, 0.045);
    for (let x = 0; x < 960; x += 24) {
      graphics.lineBetween(x, 0, x, 540);
    }
    for (let y = 0; y < 540; y += 24) {
      graphics.lineBetween(0, y, 960, y);
    }

    graphics.lineStyle(2, 0x62e7f2, 0.11);
    graphics.strokeRoundedRect(18, 18, 924, 504, 20);

    const lights = [
      [55, 75, 0x62e7f2],
      [85, 462, 0xffd166],
      [883, 78, 0x8ef28b],
      [905, 448, 0x62e7f2],
    ];
    lights.forEach(([x, y, color]) => {
      graphics.fillStyle(color, 0.5);
      graphics.fillRect(x, y, 7, 7);
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

    const panel = this.add
      .rectangle(480, 278, 780, 374, 20, 0x0d1930, 0.97)
      .setStrokeStyle(2, 0x62e7f2, 0.48);
    this.addToStage(panel);

    this.createIntroTape(480, 148);

    this.addToStage(
      this.add
        .text(
          480,
          284,
          "Depois dos cartões perfurados, as fitas magnéticas passaram\na ser usadas para armazenar grandes quantidades de dados.\nElas funcionavam como uma longa faixa onde as informações\neram gravadas usando magnetismo.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "19px",
            fontStyle: "600",
            color: "#dce8f5",
            align: "center",
            lineSpacing: 6,
          },
        )
        .setOrigin(0.5),
    );

    this.addToStage(
      this.add
        .text(
          480,
          365,
          "O desafio é que a leitura era sequencial: para encontrar um\narquivo, era preciso percorrer a fita até a posição certa.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "17px",
            fontStyle: "700",
            color: "#ffd166",
            align: "center",
            lineSpacing: 5,
          },
        )
        .setOrigin(0.5),
    );

    this.createButton(
      480,
      449,
      290,
      "COMEÇAR DESAFIO",
      () => this.startChallenge(),
      { border: 0x8ef28b, hover: 0x246a69 },
    );
    this.createBackLink();
  }

  startChallenge() {
    this.phase2CurrentIndex = 0;
    this.phase2Score = PHASE2_STARTING_SCORE;
    this.phase2IsMoving = false;
    this.phase2IsComplete = false;
    this.phase2Blocks = [];

    this.clearStage();
    this.phase2Stage = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 30, "BUSCA SEQUENCIAL", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "16px",
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

    this.createTargetPanel();
    this.createTape();
    this.createEducationBox();
    this.createControls();

    this.phase2MessageText = this.add
      .text(480, 501, "A cabeça de leitura está em DADO-01.", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "15px",
        fontStyle: "700",
        color: "#8da2bd",
        align: "center",
        wordWrap: { width: 860 },
      })
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

  createTargetPanel() {
    const panel = this.add
      .rectangle(342, 82, 610, 66, 12, 0x101f35, 0.98)
      .setStrokeStyle(2, 0xffd166, 0.4);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(342, 66, "ARQUIVO PROCURADO", {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "12px",
          fontStyle: "800",
          color: "#8da2bd",
          letterSpacing: 1,
        })
        .setOrigin(0.5),
    );

    this.addToStage(
      this.add
        .text(342, 94, PHASE2_DATA_BLOCKS[PHASE2_TARGET_INDEX], {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "17px",
          color: "#ffd166",
        })
        .setOrigin(0.5),
    );
  }

  createTape() {
    const tapePanel = this.add
      .rectangle(342, 236, 610, 218, 16, 0x0b1627, 0.98)
      .setStrokeStyle(2, 0x62e7f2, 0.32);
    this.addToStage(tapePanel);

    const graphics = this.add.graphics();
    graphics.fillStyle(0x17283a, 1);
    graphics.fillRoundedRect(52, 147, 580, 172, 14);
    graphics.lineStyle(2, 0x3f6078, 0.8);
    graphics.strokeRoundedRect(52, 147, 580, 172, 14);

    this.drawTapeReel(graphics, 105, 197);
    this.drawTapeReel(graphics, 579, 197);

    graphics.lineStyle(8, 0x544832, 1);
    graphics.beginPath();
    graphics.moveTo(105, 227);
    graphics.lineTo(105, 264);
    graphics.lineTo(579, 264);
    graphics.lineTo(579, 227);
    graphics.strokePath();

    graphics.lineStyle(2, 0xb99a5e, 0.65);
    graphics.lineBetween(105, 259, 579, 259);
    this.addToStage(graphics);

    const startX = 83;
    const blockY = 264;
    const spacing = 57.5;

    PHASE2_DATA_BLOCKS.forEach((label, index) => {
      const x = startX + index * spacing;
      const block = this.add
        .rectangle(x, blockY, 52, 54, 6, 0x27384a, 1)
        .setStrokeStyle(2, 0x60758a, 0.75);
      const blockText = this.add
        .text(x, blockY, label.replace("-", "\n"), {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "6px",
          color: "#aebed0",
          align: "center",
          lineSpacing: 3,
        })
        .setOrigin(0.5);

      this.addToStage([block, blockText]);
      this.phase2Blocks.push({ block, text: blockText, x });
    });

    this.phase2ReadHead = this.add.container(
      this.phase2Blocks[0].x,
      blockY - 55,
    );
    const headGlow = this.add
      .triangle(0, 0, -20, -25, 20, -25, 0, 16, 0x62e7f2, 0.18)
      .setStrokeStyle(2, 0x62e7f2, 0.8);
    const headBody = this.add
      .rectangle(0, -25, 38, 30, 6, 0x153e50, 1)
      .setStrokeStyle(2, 0x8ef28b, 0.85);
    const headLight = this.add.circle(0, -25, 5, 0x8ef28b, 1);
    this.phase2ReadHead.add([headGlow, headBody, headLight]);
    this.addToStage(this.phase2ReadHead);

    this.phase2HeadLabel = this.add
      .text(this.phase2Blocks[0].x, 167, "CABEÇA\nDE LEITURA", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#8ef28b",
        align: "center",
        lineSpacing: 2,
      })
      .setOrigin(0.5);
    this.addToStage(this.phase2HeadLabel);

    this.updateTapeHighlight();
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

  createEducationBox() {
    const panel = this.add
      .rectangle(800, 238, 260, 310, 16, 0x101f35, 0.98)
      .setStrokeStyle(2, 0x62e7f2, 0.35);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(800, 108, "ACESSO SEQUENCIAL", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "9px",
          color: "#62e7f2",
        })
        .setOrigin(0.5),
    );

    this.addToStage(
      this.add
        .text(
          800,
          245,
          "Nas fitas magnéticas, os\ndados eram lidos em\nsequência.\n\nPara encontrar uma\ninformação no meio ou no\nfinal da fita, era necessário\npassar por várias partes\nantes.\n\nPor isso, o acesso podia ser\nmais lento do que em\ndispositivos modernos.",
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

  createControls() {
    this.phase2RewindButton = this.createButton(
      148,
      414,
      190,
      "« REBOBINAR",
      () => this.rewind(),
      { border: 0xffd166, hover: 0x564624, fontSize: "9px" },
    );
    this.phase2ReadButton = this.createButton(
      356,
      414,
      202,
      "LER POSIÇÃO",
      () => this.readCurrentPosition(),
      { border: 0x8ef28b, hover: 0x246a69, fontSize: "9px" },
    );
    this.phase2ForwardButton = this.createButton(
      570,
      414,
      190,
      "AVANÇAR »",
      () => this.moveForward(),
      { border: 0x62e7f2, hover: 0x1c5264, fontSize: "9px" },
    );

    this.addToStage(
      this.add
        .text(356, 459, "Cada movimento custa 2 pontos.", {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "13px",
          fontStyle: "700",
          color: "#6f849d",
        })
        .setOrigin(0.5),
    );
  }

  moveForward() {
    if (this.phase2IsMoving || this.phase2IsComplete) {
      return;
    }

    if (this.phase2CurrentIndex >= PHASE2_DATA_BLOCKS.length - 1) {
      this.showMessage("Você chegou ao final da fita.", "#ffd166");
      this.pulseCurrentBlock(0xffd166);
      return;
    }

    this.phase2CurrentIndex += 1;
    this.updateScore(-2);
    this.animateHeadMovement(
      "A fita avançou para a próxima posição.",
      "#62e7f2",
    );
  }

  rewind() {
    if (this.phase2IsMoving || this.phase2IsComplete) {
      return;
    }

    if (this.phase2CurrentIndex <= 0) {
      this.showMessage("Você já está no começo da fita.", "#ffd166");
      this.pulseCurrentBlock(0xffd166);
      return;
    }

    this.phase2CurrentIndex -= 1;
    this.updateScore(-2);
    this.animateHeadMovement("A fita voltou uma posição.", "#62e7f2");
  }

  animateHeadMovement(message, color) {
    this.phase2IsMoving = true;
    const targetX = this.phase2Blocks[this.phase2CurrentIndex].x;

    this.tweens.add({
      targets: this.phase2ReadHead,
      x: targetX,
      duration: 260,
      ease: "Sine.inOut",
    });
    this.tweens.add({
      targets: this.phase2HeadLabel,
      x: targetX,
      duration: 260,
      ease: "Sine.inOut",
      onComplete: () => {
        this.phase2IsMoving = false;
        this.updateTapeHighlight();
        this.showMessage(
          `${message} Posição atual: ${PHASE2_DATA_BLOCKS[this.phase2CurrentIndex]}.`,
          color,
        );
      },
    });
  }

  readCurrentPosition() {
    if (this.phase2IsMoving || this.phase2IsComplete) {
      return;
    }

    if (this.phase2CurrentIndex === PHASE2_TARGET_INDEX) {
      this.showSuccess();
    } else {
      this.showFailure();
    }
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
    });
  }

  updateTapeHighlight() {
    this.phase2Blocks.forEach(({ block, text }, index) => {
      const isCurrent = index === this.phase2CurrentIndex;
      block.setFillStyle(isCurrent ? 0x28576a : 0x27384a, 1);
      block.setStrokeStyle(
        isCurrent ? 3 : 2,
        isCurrent ? 0x8ef28b : 0x60758a,
        isCurrent ? 1 : 0.75,
      );
      text.setColor(isCurrent ? "#f1f7ff" : "#aebed0");
    });
  }

  showMessage(message, color = "#8da2bd") {
    this.phase2MessageText.setText(message).setColor(color);
  }

  showFailure() {
    this.updateScore(-10);
    this.showMessage(
      "Esse não é o arquivo procurado. Continue percorrendo a fita.",
      "#ff9b78",
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

  showSuccess() {
    this.phase2IsComplete = true;
    this.disableControls();
    this.showMessage(
      "Arquivo encontrado! A fita magnética foi lida corretamente.",
      "#8ef28b",
    );

    const target = this.phase2Blocks[PHASE2_TARGET_INDEX];
    const glow = this.add
      .circle(target.x, 264, 42, 0x8ef28b, 0.18)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.addToStage(glow);

    this.tweens.add({
      targets: [glow, target.block, this.phase2ReadHead],
      scale: 1.18,
      alpha: { from: 1, to: 0.3 },
      duration: 350,
      yoyo: true,
      repeat: 2,
      ease: "Sine.inOut",
    });

    this.createSuccessSparkles(target.x, 264);
    this.time.delayedCall(1450, () => this.showConclusion());
  }

  createSuccessSparkles(centerX, centerY) {
    const offsets = [
      [-55, -38],
      [-32, 38],
      [0, -52],
      [34, 35],
      [56, -28],
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

    const panel = this.add
      .rectangle(480, 301, 770, 220, 18, 0x0d1930, 0.97)
      .setStrokeStyle(2, 0x62e7f2, 0.42);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(
          480,
          278,
          "Você aprendeu que a fita magnética armazenava dados usando\nmagnetismo e permitia guardar grandes quantidades de\ninformação. Porém, como a leitura era sequencial, encontrar\num arquivo podia demorar.",
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
        .text(480, 370, `PONTUAÇÃO FINAL: ${finalScore}`, {
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
      { border: 0x62e7f2, hover: 0x1c5264, fontSize: "9px" },
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

  restartPhase() {
    this.startChallenge();
  }

  returnToTimeline() {
    this.scene.start("TimelineScene");
  }

  createButton(x, y, width, label, callback, options = {}) {
    const buttonContainer = this.add.container(x, y);
    const background = this.add
      .rectangle(0, 0, width, 56, 11, 0x15344b, 1)
      .setStrokeStyle(2, options.border ?? 0x62e7f2, 0.9)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(0, 0, label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: options.fontSize ?? "10px",
        color: "#f1f7ff",
        align: "center",
      })
      .setOrigin(0.5);

    buttonContainer.add([background, text]);
    buttonContainer.background = background;
    this.addToStage(buttonContainer);

    background.on("pointerover", () => {
      background.setFillStyle(options.hover ?? 0x1c5264);
      text.setColor("#ffd166");
      this.tweens.add({
        targets: buttonContainer,
        scale: 1.035,
        duration: 110,
      });
    });
    background.on("pointerout", () => {
      background.setFillStyle(0x15344b);
      text.setColor("#f1f7ff");
      this.tweens.add({
        targets: buttonContainer,
        scale: 1,
        duration: 110,
      });
    });
    background.on("pointerdown", callback);

    return buttonContainer;
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
    if (this.phase2Stage) {
      this.phase2Stage.destroy(true);
      this.phase2Stage = null;
    }
  }
}
