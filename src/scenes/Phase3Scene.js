const PHASE3_CAPACITY_MB = 1.44;
const PHASE3_STARTING_SCORE = 100;
const PHASE3_FILES = [
  { id: "text", name: "texto.txt", size: 0.1, essential: true, type: "TXT" },
  { id: "photo", name: "foto.bmp", size: 0.5, essential: true, type: "BMP" },
  {
    id: "sheet",
    name: "planilha.xls",
    size: 0.3,
    essential: true,
    type: "XLS",
  },
  { id: "music", name: "musica.wav", size: 1.2, essential: false, type: "WAV" },
  { id: "game", name: "jogo.exe", size: 2.0, essential: false, type: "EXE" },
  {
    id: "document",
    name: "trabalho.doc",
    size: 0.4,
    essential: true,
    type: "DOC",
  },
  { id: "drawing", name: "desenho.bmp", size: 0.8, essential: false, type: "BMP" },
];

export default class Phase3Scene extends Phaser.Scene {
  constructor() {
    super("Phase3Scene");
  }

  create() {
    this.drawBackground();
    this.createIntroPanel();
    this.cameras.main.fadeIn(300, 7, 16, 31);
  }

  drawBackground() {
    const graphics = this.add.graphics();

    graphics.fillGradientStyle(0x07101f, 0x07101f, 0x17283a, 0x0a1522, 1);
    graphics.fillRect(0, 0, 960, 540);

    graphics.lineStyle(1, 0x8ef28b, 0.04);
    for (let x = 0; x < 960; x += 24) {
      graphics.lineBetween(x, 0, x, 540);
    }
    for (let y = 0; y < 540; y += 24) {
      graphics.lineBetween(0, y, 960, y);
    }

    graphics.lineStyle(2, 0x8ef28b, 0.1);
    graphics.strokeRoundedRect(18, 18, 924, 504, 20);

    const lights = [
      [55, 76, 0x8ef28b],
      [86, 462, 0xffd166],
      [883, 78, 0x62e7f2],
      [905, 448, 0x8ef28b],
    ];
    lights.forEach(([x, y, color]) => {
      graphics.fillStyle(color, 0.5);
      graphics.fillRect(x, y, 7, 7);
    });
  }

  createIntroPanel() {
    this.clearStage();
    this.phase3Stage = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 48, "FASE 3: DISQUETE", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "20px",
          color: "#8ef28b",
        })
        .setOrigin(0.5),
    );

    const panel = this.add
      .rectangle(480, 278, 780, 374, 20, 0x0d1930, 0.97)
      .setStrokeStyle(2, 0x8ef28b, 0.46);
    this.addToStage(panel);

    this.createIntroFloppyDisk(480, 151);

    this.addToStage(
      this.add
        .text(
          480,
          294,
          "Com os disquetes, os dados ficaram mais fáceis de transportar\nentre computadores. Eles armazenavam informações\nmagneticamente em um disco flexível protegido por\numa capa plástica.",
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
          376,
          "O desafio era a pouca capacidade:\nnem todos os arquivos cabiam no disquete.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "18px",
            fontStyle: "800",
            color: "#ffd166",
            align: "center",
            lineSpacing: 5,
          },
        )
        .setOrigin(0.5),
    );

    this.createButton(
      480,
      454,
      290,
      "COMEÇAR DESAFIO",
      () => this.startChallenge(),
      { border: 0x8ef28b, hover: 0x246a69 },
    );
    this.createBackLink();
  }

  startChallenge() {
    this.phase3SelectedIds = new Set();
    this.phase3UsedCapacity = 0;
    this.phase3Score = PHASE3_STARTING_SCORE;
    this.phase3IsComplete = false;
    this.phase3FileCards = new Map();

    this.clearStage();
    this.phase3Stage = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 29, "GERENCIADOR DE DISQUETE", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "15px",
          color: "#8ef28b",
        })
        .setOrigin(0.5),
    );

    this.phase3ScoreText = this.add
      .text(916, 29, "PONTOS: 100", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#8ef28b",
      })
      .setOrigin(1, 0.5);
    this.addToStage(this.phase3ScoreText);

    this.createMissionPanel();
    this.createFileList();
    this.createFloppyDisk();
    this.createCapacityBar();
    this.createEducationBox();
    this.createControls();

    this.phase3MessageText = this.add
      .text(480, 505, "Selecione os quatro arquivos importantes.", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "15px",
        fontStyle: "700",
        color: "#8da2bd",
        align: "center",
        wordWrap: { width: 860 },
      })
      .setOrigin(0.5);
    this.addToStage(this.phase3MessageText);
    this.createBackLink();

    this.phase3Stage.setAlpha(0);
    this.tweens.add({
      targets: this.phase3Stage,
      alpha: 1,
      duration: 280,
      ease: "Sine.out",
    });
  }

  createMissionPanel() {
    const panel = this.add
      .rectangle(350, 73, 630, 56, 12, 0x101f35, 0.98)
      .setStrokeStyle(2, 0xffd166, 0.38);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(
          350,
          73,
          "MISSÃO: salve os arquivos importantes sem ultrapassar 1,44 MB",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "16px",
            fontStyle: "800",
            color: "#ffd166",
            align: "center",
          },
        )
        .setOrigin(0.5),
    );
  }

  createFileList() {
    this.addToStage(
      this.add
        .text(298, 113, "ARQUIVOS DISPONÍVEIS", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "9px",
          color: "#62e7f2",
        })
        .setOrigin(0.5),
    );

    const positions = [
      [165, 154],
      [427, 154],
      [165, 211],
      [427, 211],
      [165, 268],
      [427, 268],
      [165, 325],
    ];

    PHASE3_FILES.forEach((file, index) => {
      const [x, y] = positions[index];
      const cardContainer = this.add.container(x, y);
      const background = this.add
        .rectangle(0, 0, 238, 48, 8, 0x16263a, 1)
        .setStrokeStyle(2, 0x40566d, 0.8)
        .setInteractive({ useHandCursor: true });
      const icon = this.add
        .rectangle(-94, 0, 32, 32, 5, this.getFileColor(file.type), 0.9)
        .setStrokeStyle(1, 0xf1f7ff, 0.35);
      const typeText = this.add
        .text(-94, 0, file.type, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "5px",
          color: "#07101f",
        })
        .setOrigin(0.5);
      const nameText = this.add
        .text(-70, -8, file.name, {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "14px",
          fontStyle: "800",
          color: "#dce8f5",
        })
        .setOrigin(0, 0.5);
      const sizeText = this.add
        .text(-70, 11, `${file.size.toFixed(2)} MB`, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "6px",
          color: "#8da2bd",
        })
        .setOrigin(0, 0.5);
      const check = this.add
        .text(101, 0, "✓", {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "23px",
          fontStyle: "900",
          color: "#8ef28b",
        })
        .setOrigin(0.5)
        .setVisible(false);

      cardContainer.add([
        background,
        icon,
        typeText,
        nameText,
        sizeText,
        check,
      ]);
      this.addToStage(cardContainer);

      background.on("pointerover", () => {
        if (!this.phase3IsComplete) {
          background.setFillStyle(0x203b50);
        }
      });
      background.on("pointerout", () => {
        const selected = this.phase3SelectedIds.has(file.id);
        background.setFillStyle(selected ? 0x245064 : 0x16263a);
      });
      background.on("pointerdown", () => this.toggleFileSelection(file.id));

      this.phase3FileCards.set(file.id, {
        container: cardContainer,
        background,
        check,
      });
    });
  }

  getFileColor(type) {
    const colors = {
      TXT: 0x62e7f2,
      BMP: 0xffd166,
      XLS: 0x8ef28b,
      WAV: 0xc49cff,
      EXE: 0xff8f70,
      DOC: 0x70b7ff,
    };
    return colors[type] ?? 0x8da2bd;
  }

  createFloppyDisk() {
    const graphics = this.add.graphics();
    const x = 688;
    const y = 119;
    const width = 190;
    const height = 177;

    graphics.fillStyle(0x0a111d, 0.35);
    graphics.fillRoundedRect(x + 8, y + 9, width, height, 13);
    graphics.fillStyle(0x274c46, 1);
    graphics.fillRoundedRect(x, y, width, height, 13);
    graphics.lineStyle(3, 0x8ef28b, 0.58);
    graphics.strokeRoundedRect(x, y, width, height, 13);

    graphics.fillStyle(0xb8c2c7, 1);
    graphics.fillRoundedRect(x + 42, y, 106, 67, 5);
    graphics.fillStyle(0x26343e, 1);
    graphics.fillRect(x + 112, y + 8, 22, 48);
    graphics.fillStyle(0x8da2bd, 0.45);
    graphics.fillRect(x + 52, y + 9, 48, 47);

    graphics.fillStyle(0xd8cfaa, 1);
    graphics.fillRoundedRect(x + 31, y + 94, 128, 72, 7);
    graphics.lineStyle(2, 0x786f50, 0.55);
    graphics.strokeRoundedRect(x + 31, y + 94, 128, 72, 7);
    graphics.lineBetween(x + 47, y + 122, x + 142, y + 122);
    graphics.lineBetween(x + 47, y + 137, x + 142, y + 137);
    graphics.lineBetween(x + 47, y + 152, x + 119, y + 152);
    this.addToStage(graphics);

    this.phase3DiskGlow = this.add
      .rectangle(x + width / 2, y + height / 2, width + 12, height + 12, 16)
      .setStrokeStyle(4, 0x8ef28b, 0)
      .setFillStyle(0x8ef28b, 0);
    this.addToStage(this.phase3DiskGlow);

    this.addToStage(
      this.add
        .text(x + width / 2, y + 108, "A JORNADA\nDO BIT", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: "#514a34",
          align: "center",
          lineSpacing: 4,
        })
        .setOrigin(0.5),
    );
  }

  createCapacityBar() {
    this.addToStage(
      this.add
        .text(783, 317, "ESPAÇO NO DISQUETE", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#ffd166",
        })
        .setOrigin(0.5),
    );

    this.addToStage(
      this.add
        .rectangle(783, 343, 214, 22, 5, 0x09121f, 1)
        .setStrokeStyle(2, 0x60758a, 0.8),
    );

    this.phase3CapacityFill = this.add
      .rectangle(678, 343, 210, 16, 3, 0x8ef28b, 1)
      .setOrigin(0, 0.5)
      .setScale(0, 1);
    this.addToStage(this.phase3CapacityFill);

    this.phase3CapacityText = this.add
      .text(783, 370, "0,00 MB / 1,44 MB", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "7px",
        color: "#dce8f5",
      })
      .setOrigin(0.5);
    this.addToStage(this.phase3CapacityText);
  }

  createEducationBox() {
    const panel = this.add
      .rectangle(783, 424, 230, 88, 12, 0x101f35, 0.98)
      .setStrokeStyle(2, 0x62e7f2, 0.3);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(
          783,
          424,
          "Um disquete comum guardava apenas\n1,44 MB. Era portátil, mas sensível\na sujeira, calor e campos magnéticos.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "12px",
            fontStyle: "700",
            color: "#c7d7e8",
            align: "center",
            lineSpacing: 3,
          },
        )
        .setOrigin(0.5),
    );
  }

  createControls() {
    this.phase3ClearButton = this.createButton(
      178,
      434,
      230,
      "LIMPAR SELEÇÃO",
      () => this.clearSelection(),
      { border: 0xffd166, hover: 0x564624, fontSize: "9px" },
    );
    this.phase3SaveButton = this.createButton(
      449,
      434,
      270,
      "SALVAR NO DISQUETE",
      () => this.saveToDisk(),
      { border: 0x8ef28b, hover: 0x246a69, fontSize: "9px" },
    );
  }

  toggleFileSelection(fileId) {
    if (this.phase3IsComplete) {
      return;
    }

    const file = PHASE3_FILES.find((entry) => entry.id === fileId);
    const card = this.phase3FileCards.get(fileId);
    const wasOverCapacity = this.phase3UsedCapacity > PHASE3_CAPACITY_MB;

    if (this.phase3SelectedIds.has(fileId)) {
      this.phase3SelectedIds.delete(fileId);
      this.showMessage("Arquivo removido da seleção.", "#62e7f2");
    } else {
      this.phase3SelectedIds.add(fileId);
      this.showMessage("Arquivo selecionado para salvar.", "#8ef28b");
    }

    const isSelected = this.phase3SelectedIds.has(fileId);
    card.check.setVisible(isSelected);
    card.background
      .setFillStyle(isSelected ? 0x245064 : 0x16263a)
      .setStrokeStyle(
        isSelected ? 3 : 2,
        isSelected ? 0x8ef28b : 0x40566d,
        isSelected ? 1 : 0.8,
      );

    this.tweens.add({
      targets: card.container,
      scale: isSelected ? 1.035 : 1,
      duration: 150,
      ease: "Back.out",
    });

    this.updateCapacity();

    const isOverCapacity = this.phase3UsedCapacity > PHASE3_CAPACITY_MB;
    if (!wasOverCapacity && isOverCapacity) {
      this.updateScore(-5);
      if (file.size > PHASE3_CAPACITY_MB) {
        this.showMessage(
          "Esse arquivo é grande demais para caber no disquete.",
          "#ff9b78",
        );
      } else {
        this.showMessage(
          "Espaço insuficiente! O disquete não consegue guardar tudo isso.",
          "#ff9b78",
        );
      }
      this.animateCapacityWarning();
    }
  }

  updateCapacity() {
    this.phase3UsedCapacity = PHASE3_FILES.reduce((total, file) => {
      return this.phase3SelectedIds.has(file.id) ? total + file.size : total;
    }, 0);

    const ratio = this.phase3UsedCapacity / PHASE3_CAPACITY_MB;
    const displayRatio = Phaser.Math.Clamp(ratio, 0, 1);
    const overCapacity = ratio > 1;
    const color = overCapacity
      ? 0xff7b68
      : ratio > 0.82
        ? 0xffd166
        : 0x8ef28b;

    this.phase3CapacityFill.setFillStyle(color);
    this.tweens.add({
      targets: this.phase3CapacityFill,
      scaleX: displayRatio,
      duration: 220,
      ease: "Sine.out",
    });

    this.phase3CapacityText
      .setText(
        `${this.formatCapacity(this.phase3UsedCapacity)} MB / 1,44 MB`,
      )
      .setColor(overCapacity ? "#ff9b78" : "#dce8f5");
  }

  formatCapacity(value) {
    return value.toFixed(2).replace(".", ",");
  }

  saveToDisk() {
    if (this.phase3IsComplete) {
      return;
    }

    if (this.phase3UsedCapacity > PHASE3_CAPACITY_MB) {
      const hasOversizedFile = PHASE3_FILES.some(
        (file) =>
          this.phase3SelectedIds.has(file.id) &&
          file.size > PHASE3_CAPACITY_MB,
      );
      this.showFailure(
        hasOversizedFile
          ? "Esse arquivo é grande demais para caber no disquete."
          : "Espaço insuficiente! O disquete não consegue guardar tudo isso.",
      );
      this.animateCapacityWarning();
      return;
    }

    const missingEssential = PHASE3_FILES.some(
      (file) => file.essential && !this.phase3SelectedIds.has(file.id),
    );

    if (missingEssential) {
      this.showFailure(
        "Alguns arquivos importantes ficaram de fora. Revise sua seleção.",
      );
      this.animateMissingFiles();
      return;
    }

    this.showSuccess();
  }

  clearSelection() {
    if (this.phase3IsComplete || this.phase3SelectedIds.size === 0) {
      return;
    }

    this.phase3SelectedIds.clear();
    this.phase3FileCards.forEach(({ container, background, check }) => {
      check.setVisible(false);
      background
        .setFillStyle(0x16263a)
        .setStrokeStyle(2, 0x40566d, 0.8);
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 130,
      });
    });
    this.updateCapacity();
    this.showMessage("Seleção limpa. Escolha novamente os arquivos.", "#ffd166");
  }

  updateScore(change) {
    this.phase3Score = Phaser.Math.Clamp(
      this.phase3Score + change,
      0,
      PHASE3_STARTING_SCORE,
    );
    this.phase3ScoreText.setText(`PONTOS: ${this.phase3Score}`);

    this.tweens.add({
      targets: this.phase3ScoreText,
      scale: 1.12,
      duration: 100,
      yoyo: true,
    });
  }

  showMessage(message, color = "#8da2bd") {
    this.phase3MessageText.setText(message).setColor(color);
  }

  showFailure(message) {
    this.updateScore(-10);
    this.showMessage(message, "#ff9b78");
    this.cameras.main.shake(120, 0.002);
  }

  animateCapacityWarning() {
    this.tweens.add({
      targets: [this.phase3CapacityFill, this.phase3CapacityText],
      x: "+=5",
      duration: 55,
      yoyo: true,
      repeat: 2,
    });
  }

  animateMissingFiles() {
    PHASE3_FILES.filter(
      (file) => file.essential && !this.phase3SelectedIds.has(file.id),
    ).forEach((file) => {
      const card = this.phase3FileCards.get(file.id);
      card.background.setStrokeStyle(3, 0xff9b78, 1);
      this.tweens.add({
        targets: card.container,
        x: "+=5",
        duration: 55,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          card.background.setStrokeStyle(2, 0x40566d, 0.8);
        },
      });
    });
  }

  showSuccess() {
    this.phase3IsComplete = true;
    this.disableChallengeControls();
    this.showMessage("Arquivos salvos com sucesso no disquete!", "#8ef28b");

    this.phase3DiskGlow
      .setStrokeStyle(4, 0x8ef28b, 0.85)
      .setFillStyle(0x8ef28b, 0.08)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: this.phase3DiskGlow,
      scale: 1.12,
      alpha: 0.25,
      duration: 350,
      yoyo: true,
      repeat: 2,
      ease: "Sine.inOut",
    });

    this.createSuccessSparkles();
    this.time.delayedCall(1450, () => this.showConclusion());
  }

  createSuccessSparkles() {
    const positions = [
      [690, 138],
      [735, 103],
      [830, 111],
      [875, 164],
      [858, 268],
      [710, 285],
    ];

    positions.forEach(([x, y], index) => {
      const sparkle = this.add
        .rectangle(x, y, 8, 8, index % 2 === 0 ? 0x8ef28b : 0x62e7f2, 0.9)
        .setRotation(Math.PI / 4);
      this.addToStage(sparkle);

      this.tweens.add({
        targets: sparkle,
        scale: 2.1,
        alpha: 0,
        angle: 135,
        duration: 560,
        delay: index * 50,
        ease: "Sine.out",
      });
    });
  }

  showConclusion() {
    const finalScore = this.phase3Score;
    this.clearStage();
    this.phase3Stage = this.add.container(0, 0);

    const glow = this.add
      .circle(480, 125, 76, 0x8ef28b, 0.07)
      .setStrokeStyle(2, 0x8ef28b, 0.3);
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

    this.createCompletionFloppyDisk(480, 126);

    const panel = this.add
      .rectangle(480, 301, 770, 220, 18, 0x0d1930, 0.97)
      .setStrokeStyle(2, 0x8ef28b, 0.42);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(
          480,
          278,
          "Você aprendeu que o disquete tornou o armazenamento mais\nportátil, permitindo levar arquivos de um computador para\noutro. Mas sua capacidade era limitada, e arquivos grandes\nnem sempre cabiam.",
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

    this.phase3Stage.setAlpha(0).setScale(0.97);
    this.tweens.add({
      targets: this.phase3Stage,
      alpha: 1,
      scale: 1,
      duration: 350,
      ease: "Back.out",
    });
  }

  createIntroFloppyDisk(x, y) {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x274c46, 1);
    graphics.fillRoundedRect(x - 92, y - 72, 184, 144, 12);
    graphics.lineStyle(3, 0x8ef28b, 0.58);
    graphics.strokeRoundedRect(x - 92, y - 72, 184, 144, 12);
    graphics.fillStyle(0xb8c2c7, 1);
    graphics.fillRoundedRect(x - 42, y - 72, 84, 55, 4);
    graphics.fillStyle(0x26343e, 1);
    graphics.fillRect(x + 15, y - 64, 17, 39);
    graphics.fillStyle(0xd8cfaa, 1);
    graphics.fillRoundedRect(x - 58, y + 8, 116, 52, 6);
    graphics.lineStyle(2, 0x786f50, 0.55);
    graphics.lineBetween(x - 42, y + 29, x + 42, y + 29);
    graphics.lineBetween(x - 42, y + 43, x + 27, y + 43);
    this.addToStage(graphics);
  }

  createCompletionFloppyDisk(x, y) {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x274c46, 1);
    graphics.fillRoundedRect(x - 64, y - 43, 128, 86, 8);
    graphics.lineStyle(2, 0x8ef28b, 0.65);
    graphics.strokeRoundedRect(x - 64, y - 43, 128, 86, 8);
    graphics.fillStyle(0xb8c2c7, 1);
    graphics.fillRoundedRect(x - 27, y - 43, 54, 32, 3);
    graphics.fillStyle(0xd8cfaa, 1);
    graphics.fillRoundedRect(x - 39, y + 5, 78, 30, 4);
    graphics.fillStyle(0x8ef28b, 1);
    graphics.fillCircle(x, y + 20, 6);
    this.addToStage(graphics);
  }

  disableChallengeControls() {
    this.phase3FileCards.forEach(({ background }) =>
      background.disableInteractive(),
    );
    this.phase3ClearButton.background.disableInteractive();
    this.phase3SaveButton.background.disableInteractive();
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
      .text(38, 29, "← LINHA DO TEMPO", {
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
    this.phase3Stage.add(gameObjects);
  }

  clearStage() {
    if (this.phase3Stage) {
      this.phase3Stage.destroy(true);
      this.phase3Stage = null;
    }
  }
}
