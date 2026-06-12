const PHASE6_STARTING_SCORE = 100;
const PHASE6_CAPACITY_MB = 1024;
const PHASE6_FILES = [
  { name: "apresentacao.pptx", size: 8, essential: true },
  { name: "fotos.zip", size: 180, essential: false },
  { name: "trabalho.docx", size: 4, essential: true },
  { name: "video.mp4", size: 950, essential: false },
  { name: "musica.mp3", size: 6, essential: false },
  { name: "instalador.exe", size: 300, essential: false },
  { name: "backup.zip", size: 500, essential: true },
];
const PHASE6_ESSENTIAL_FILES = PHASE6_FILES.filter((file) => file.essential).map(
  (file) => file.name,
);

export default class Phase6Scene extends Phaser.Scene {
  constructor() {
    super("Phase6Scene");
  }

  create() {
    this.drawBackground();
    this.createIntroPanel();
    this.cameras.main.fadeIn(300, 7, 16, 31);
  }

  drawBackground() {
    const graphics = this.add.graphics();

    graphics.fillGradientStyle(0x07101f, 0x07101f, 0x10223b, 0x07101f, 1);
    graphics.fillRect(0, 0, 960, 540);

    graphics.lineStyle(1, 0x70b7ff, 0.045);
    for (let x = 0; x < 960; x += 24) {
      graphics.lineBetween(x, 0, x, 540);
    }
    for (let y = 0; y < 540; y += 24) {
      graphics.lineBetween(0, y, 960, y);
    }

    graphics.lineStyle(2, 0x70b7ff, 0.12);
    graphics.strokeRoundedRect(18, 18, 924, 504, 20);

    const lights = [
      [55, 76, 0x70b7ff],
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
    this.phase6Stage = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 48, "FASE 6: PEN DRIVE / MEMÓRIA FLASH", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "16px",
          color: "#70b7ff",
        })
        .setOrigin(0.5),
    );

    const panel = this.add.graphics();
    panel.fillStyle(0x0d1930, 0.97);
    panel.fillRoundedRect(90, 92, 780, 390, 20);
    panel.lineStyle(2, 0x70b7ff, 0.46);
    panel.strokeRoundedRect(90, 92, 780, 390, 20);
    this.addToStage(panel);

    this.createIntroFlashDrive(480, 154);

    this.addToStage(
      this.add
        .text(
          480,
          303,
          "Com a memória flash, os dados passaram a ser armazenados\neletronicamente, sem discos girando ou partes mecânicas.\nO pen drive tornou o transporte de arquivos muito mais\nsimples, rápido e prático.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "18px",
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
          397,
          "O desafio é copiar os arquivos certos e remover o pen drive\ncom segurança para evitar perda ou corrupção dos dados.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "17px",
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
    this.phase6Score = PHASE6_STARTING_SCORE;
    this.phase6SelectedFiles = new Set();
    this.phase6CopiedFiles = new Set();
    this.phase6IsCopied = false;
    this.phase6IsTransferred = false;
    this.phase6IsEjected = false;
    this.phase6IsBusy = false;
    this.phase6FileCards = [];

    this.clearStage();
    this.phase6Stage = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 29, "TRANSFERÊNCIA USB", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "16px",
          color: "#70b7ff",
        })
        .setOrigin(0.5),
    );

    this.phase6ScoreText = this.add
      .text(916, 29, "PONTOS: 100", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#8ef28b",
      })
      .setOrigin(1, 0.5);
    this.addToStage(this.phase6ScoreText);

    this.createMissionPanel();
    this.createComputers();
    this.createFlashDrive();
    this.createFileList();
    this.createCapacityBar();
    this.createEducationBox();
    this.createControls();
    this.updateCapacity();

    this.phase6MessageText = this.add
      .text(
        480,
        510,
        "Selecione os arquivos essenciais, copie, transfira e ejete com segurança.",
        {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "15px",
          fontStyle: "700",
          color: "#8da2bd",
          align: "center",
          wordWrap: { width: 860 },
        },
      )
      .setOrigin(0.5);
    this.addToStage(this.phase6MessageText);
    this.createBackLink();

    this.phase6Stage.setAlpha(0);
    this.tweens.add({
      targets: this.phase6Stage,
      alpha: 1,
      duration: 280,
      ease: "Sine.out",
    });
  }

  createMissionPanel() {
    const panel = this.add.graphics();
    panel.fillStyle(0x101f35, 0.98);
    panel.fillRoundedRect(42, 50, 645, 55, 12);
    panel.lineStyle(2, 0xffd166, 0.38);
    panel.strokeRoundedRect(42, 50, 645, 55, 12);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(
          365,
          78,
          "MISSÃO: copie os arquivos importantes e ejete o pen drive",
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

  createComputers() {
    const graphics = this.add.graphics();

    graphics.fillStyle(0x101f35, 1);
    graphics.fillRoundedRect(52, 122, 296, 274, 16);
    graphics.lineStyle(2, 0x62e7f2, 0.36);
    graphics.strokeRoundedRect(52, 122, 296, 274, 16);
    graphics.fillStyle(0x07101f, 1);
    graphics.fillRoundedRect(74, 150, 252, 202, 10);
    graphics.lineStyle(2, 0x70b7ff, 0.26);
    graphics.strokeRoundedRect(74, 150, 252, 202, 10);
    graphics.fillStyle(0x263a52, 1);
    graphics.fillRoundedRect(126, 362, 148, 16, 5);
    graphics.fillRoundedRect(98, 378, 204, 12, 5);

    graphics.fillStyle(0x101f35, 1);
    graphics.fillRoundedRect(692, 124, 218, 108, 16);
    graphics.lineStyle(2, 0x8ef28b, 0.38);
    graphics.strokeRoundedRect(692, 124, 218, 108, 16);
    graphics.fillStyle(0x07101f, 1);
    graphics.fillRoundedRect(713, 145, 176, 58, 8);
    graphics.fillStyle(0x8ef28b, 0.18);
    graphics.fillRoundedRect(724, 157, 70, 12, 3);
    graphics.fillRoundedRect(724, 178, 108, 12, 3);
    graphics.fillStyle(0x263a52, 1);
    graphics.fillRoundedRect(758, 207, 86, 10, 4);
    graphics.fillRoundedRect(738, 217, 126, 8, 4);

    graphics.lineStyle(3, 0x62e7f2, 0.24);
    graphics.lineBetween(356, 236, 416, 236);
    graphics.lineBetween(536, 236, 676, 236);
    graphics.fillStyle(0x62e7f2, 0.38);
    graphics.fillTriangle(416, 236, 400, 228, 400, 244);
    graphics.fillTriangle(676, 236, 660, 228, 660, 244);

    this.addToStage(graphics);

    this.addToStage(
      this.add
        .text(200, 139, "COMPUTADOR ORIGEM", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#62e7f2",
        })
        .setOrigin(0.5),
    );
    this.phase6DestinationText = this.add
      .text(801, 178, "DESTINO\nAGUARDANDO", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#8da2bd",
        align: "center",
        lineSpacing: 7,
      })
      .setOrigin(0.5);
    this.addToStage(this.phase6DestinationText);
  }

  createFlashDrive() {
    this.phase6FlashContainer = this.add.container(480, 236);
    this.addToStage(this.phase6FlashContainer);

    const drive = this.add.graphics();
    drive.fillStyle(0x0b1324, 1);
    drive.fillRoundedRect(-45, -78, 90, 156, 16);
    drive.lineStyle(3, 0x70b7ff, 0.84);
    drive.strokeRoundedRect(-45, -78, 90, 156, 16);
    drive.fillStyle(0x17344f, 1);
    drive.fillRoundedRect(-34, -48, 68, 96, 12);
    drive.fillStyle(0x8ef28b, 0.75);
    drive.fillCircle(0, -18, 8);
    drive.fillStyle(0x62e7f2, 0.22);
    drive.fillRoundedRect(-22, 4, 44, 10, 4);
    drive.fillRoundedRect(-22, 24, 44, 10, 4);
    drive.fillStyle(0xb7c9d6, 1);
    drive.fillRoundedRect(-28, -104, 56, 32, 6);
    drive.fillStyle(0x07101f, 0.8);
    drive.fillRect(-18, -95, 10, 12);
    drive.fillRect(8, -95, 10, 12);
    this.phase6FlashContainer.add(drive);

    this.phase6FlashGlow = this.add
      .circle(480, 236, 82, 0x70b7ff, 0)
      .setStrokeStyle(3, 0x70b7ff, 0);
    this.addToStage(this.phase6FlashGlow);

    const unsafeHitArea = this.add
      .rectangle(0, 0, 110, 180, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true });
    this.phase6FlashContainer.add(unsafeHitArea);
    unsafeHitArea.on("pointerdown", () => this.removeIncorrectly());
  }

  createFileList() {
    this.addToStage(
      this.add
        .text(200, 164, "ARQUIVOS", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#ffd166",
        })
        .setOrigin(0.5),
    );

    PHASE6_FILES.forEach((file, index) => {
      const y = 190 + index * 25;
      const card = this.add.container(200, y);
      const background = this.add
        .rectangle(0, 0, 238, 22, 0x13283a, 1)
        .setStrokeStyle(1, file.essential ? 0xffd166 : 0x34465d, 0.72)
        .setInteractive({ useHandCursor: true });
      const nameText = this.add
        .text(-105, 0, file.name, {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "12px",
          fontStyle: "800",
          color: "#dce8f5",
        })
        .setOrigin(0, 0.5);
      const sizeText = this.add
        .text(104, 0, `${file.size} MB`, {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "11px",
          fontStyle: "800",
          color: "#8da2bd",
        })
        .setOrigin(1, 0.5);
      const checkText = this.add
        .text(-118, 0, "OK", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "6px",
          color: "#8ef28b",
        })
        .setOrigin(1, 0.5)
        .setVisible(false);

      card.add([background, checkText, nameText, sizeText]);
      this.addToStage(card);

      background.on("pointerover", () => {
        if (!this.phase6IsCopied) {
          background.setFillStyle(0x1c5264);
        }
      });
      background.on("pointerout", () => {
        if (!this.phase6SelectedFiles.has(index)) {
          background.setFillStyle(0x13283a);
        }
      });
      background.on("pointerdown", () => this.toggleFileSelection(index));

      this.phase6FileCards.push({ card, background, checkText, nameText, sizeText });
    });
  }

  createCapacityBar() {
    const panel = this.add.graphics();
    panel.fillStyle(0x101f35, 0.98);
    panel.fillRoundedRect(372, 330, 216, 84, 12);
    panel.lineStyle(2, 0x70b7ff, 0.35);
    panel.strokeRoundedRect(372, 330, 216, 84, 12);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(480, 349, "PEN DRIVE 1 GB", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#70b7ff",
        })
        .setOrigin(0.5),
    );

    this.phase6CapacityBack = this.add
      .rectangle(390, 373, 180, 14, 0x07101f, 1)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x34465d, 1);
    this.addToStage(this.phase6CapacityBack);

    this.phase6CapacityFill = this.add
      .rectangle(390, 373, 180, 12, 0x8ef28b, 1)
      .setOrigin(0, 0.5)
      .setScale(0, 1);
    this.addToStage(this.phase6CapacityFill);

    this.phase6CapacityText = this.add
      .text(480, 398, "0 / 1024 MB", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "7px",
        color: "#8da2bd",
      })
      .setOrigin(0.5);
    this.addToStage(this.phase6CapacityText);

    this.phase6ProgressBack = this.add
      .rectangle(628, 370, 152, 12, 0x07101f, 1)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x34465d, 1);
    this.addToStage(this.phase6ProgressBack);

    this.phase6ProgressFill = this.add
      .rectangle(628, 370, 152, 10, 0x62e7f2, 1)
      .setOrigin(0, 0.5)
      .setScale(0, 1);
    this.addToStage(this.phase6ProgressFill);

    this.phase6ProgressText = this.add
      .text(704, 395, "PROGRESSO", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "7px",
        color: "#8da2bd",
      })
      .setOrigin(0.5);
    this.addToStage(this.phase6ProgressText);
  }

  createEducationBox() {
    const panel = this.add.graphics();
    panel.fillStyle(0x101f35, 0.98);
    panel.fillRoundedRect(692, 248, 250, 166, 16);
    panel.lineStyle(2, 0x62e7f2, 0.34);
    panel.strokeRoundedRect(692, 248, 250, 166, 16);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(817, 270, "MEMÓRIA FLASH", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#62e7f2",
        })
        .setOrigin(0.5),
    );

    this.addToStage(
      this.add
        .text(
          817,
          338,
          "Pen drives armazenam dados\neletronicamente, sem partes\nmóveis. São pequenos,\nresistentes e portáteis.\n\nRemover durante gravação\npode corromper arquivos.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "12px",
            fontStyle: "600",
            color: "#c7d7e8",
            align: "center",
            lineSpacing: 3,
          },
        )
        .setOrigin(0.5),
    );
  }

  createControls() {
    this.phase6CopyButton = this.createButton(
      182,
      462,
      250,
      "COPIAR PARA O PEN DRIVE",
      () => this.copyToFlashDrive(),
      { border: 0x70b7ff, hover: 0x1c5264, fontSize: "8px" },
    );

    this.phase6TransferButton = this.createButton(
      480,
      462,
      270,
      "TRANSFERIR AO DESTINO",
      () => this.transferToDestination(),
      { border: 0x8ef28b, hover: 0x246a69, fontSize: "8px" },
    );

    this.phase6EjectButton = this.createButton(
      778,
      462,
      250,
      "EJETAR COM SEGURANÇA",
      () => this.ejectSafely(),
      { border: 0xffd166, hover: 0x5c4b22, fontSize: "8px" },
    );
  }

  toggleFileSelection(index) {
    if (this.phase6IsBusy) {
      this.showMessage("Aguarde a operação terminar antes de mudar os arquivos.", "#ffd166");
      return;
    }

    if (this.phase6IsCopied) {
      this.showMessage("Os arquivos já foram copiados para o pen drive.", "#8da2bd");
      return;
    }

    const card = this.phase6FileCards[index];
    if (this.phase6SelectedFiles.has(index)) {
      this.phase6SelectedFiles.delete(index);
      card.background.setFillStyle(0x13283a);
      card.checkText.setVisible(false);
      this.showMessage("Arquivo removido da seleção.", "#ffd166");
    } else {
      this.phase6SelectedFiles.add(index);
      card.background.setFillStyle(0x173f4e);
      card.checkText.setVisible(true);
      this.showMessage("Arquivo selecionado para copiar.", "#8ef28b");

      if (this.getSelectedSize() > PHASE6_CAPACITY_MB) {
        this.updateScore(-5);
        this.showMessage("Espaço insuficiente no pen drive.", "#ff9b78");
        this.shakeCapacityBar();
      }
    }

    this.updateCapacity();
    this.tweens.add({
      targets: card.card,
      scale: 1.035,
      duration: 95,
      yoyo: true,
      ease: "Sine.inOut",
    });
  }

  updateCapacity() {
    const selectedSize = this.getSelectedSize();
    const ratio = Math.min(selectedSize / PHASE6_CAPACITY_MB, 1);
    const isOverCapacity = selectedSize > PHASE6_CAPACITY_MB;
    const fillColor = isOverCapacity
      ? 0xff7b68
      : selectedSize > PHASE6_CAPACITY_MB * 0.75
        ? 0xffd166
        : 0x8ef28b;

    this.phase6CapacityFill.setFillStyle(fillColor, 1);
    this.tweens.add({
      targets: this.phase6CapacityFill,
      scaleX: ratio,
      duration: 180,
      ease: "Sine.out",
    });

    this.phase6CapacityText
      .setText(`${selectedSize} / ${PHASE6_CAPACITY_MB} MB`)
      .setColor(isOverCapacity ? "#ff9b78" : "#8da2bd");
  }

  copyToFlashDrive() {
    if (this.phase6IsBusy || this.phase6IsEjected) {
      return;
    }

    const selectedSize = this.getSelectedSize();
    if (this.phase6SelectedFiles.size === 0) {
      this.updateScore(-10);
      this.showFailure("Selecione os arquivos importantes antes de copiar.");
      return;
    }

    if (selectedSize > PHASE6_CAPACITY_MB) {
      this.updateScore(-5);
      this.showFailure("O pen drive não tem espaço suficiente para essa seleção.");
      this.shakeCapacityBar();
      return;
    }

    if (!this.hasAllEssentialFiles()) {
      this.updateScore(-10);
      this.showFailure("Faltam arquivos essenciais nessa seleção.");
      return;
    }

    this.phase6IsBusy = true;
    this.phase6ProgressText.setText("COPIANDO");
    this.showMessage("Copiando arquivos para a memória flash...", "#62e7f2");
    this.animateProgress(() => {
      this.phase6IsBusy = false;
      this.phase6IsCopied = true;
      this.phase6CopiedFiles = new Set(this.phase6SelectedFiles);
      this.showSuccess("Arquivos copiados para o pen drive.");
      this.pulseFlashDrive(0x70b7ff);
    });
    this.createTransferParticles(355, 236, 452, 236, 0x70b7ff);
  }

  transferToDestination() {
    if (this.phase6IsBusy || this.phase6IsEjected) {
      return;
    }

    if (!this.phase6IsCopied) {
      this.updateScore(-10);
      this.showFailure("Primeiro copie os arquivos para o pen drive.");
      return;
    }

    if (this.phase6IsTransferred) {
      this.showMessage("Os arquivos já estão no computador destino.", "#8da2bd");
      return;
    }

    this.phase6IsBusy = true;
    this.phase6ProgressText.setText("TRANSFERINDO");
    this.showMessage("Transferindo arquivos para o computador destino...", "#62e7f2");
    this.animateProgress(() => {
      this.phase6IsBusy = false;
      this.phase6IsTransferred = true;
      this.phase6DestinationText.setText("ARQUIVOS\nRECEBIDOS").setColor("#8ef28b");
      this.showSuccess("Arquivos transferidos para o computador destino.");
      this.pulseFlashDrive(0x8ef28b);
    });
    this.createTransferParticles(528, 236, 690, 178, 0x8ef28b);
  }

  ejectSafely() {
    if (this.phase6IsEjected || this.phase6IsComplete) {
      return;
    }

    if (this.phase6IsBusy) {
      this.updateScore(-10);
      this.showFailure(
        "A transferência ainda não foi concluída. Remover agora pode corromper os dados.",
      );
      return;
    }

    if (!this.phase6IsTransferred) {
      this.updateScore(-10);
      this.showFailure(
        "A transferência ainda não foi concluída. Remover agora pode corromper os dados.",
      );
      return;
    }

    this.phase6IsEjected = true;
    this.phase6IsComplete = true;
    this.disableChallengeControls();
    this.showSuccess("Pen drive ejetado com segurança!");
    this.pulseFlashDrive(0xffd166);
    this.time.delayedCall(950, () => {
      this.showMessage("Transferência concluída com sucesso!", "#8ef28b");
      this.showConclusion();
    });
  }

  removeIncorrectly() {
    if (this.phase6IsEjected || this.phase6IsComplete || this.phase6IsBusy) {
      return;
    }

    this.updateScore(-10);
    this.showFailure("Remover sem ejetar pode corromper os dados do pen drive.");
  }

  updateScore(change) {
    this.phase6Score = Phaser.Math.Clamp(
      this.phase6Score + change,
      0,
      PHASE6_STARTING_SCORE,
    );
    this.phase6ScoreText.setText(`PONTOS: ${this.phase6Score}`);

    this.tweens.add({
      targets: this.phase6ScoreText,
      scale: 1.12,
      duration: 100,
      yoyo: true,
    });
  }

  showMessage(message, color = "#8da2bd") {
    this.phase6MessageText.setText(message).setColor(color);
  }

  showSuccess(message) {
    this.showMessage(message, "#8ef28b");
  }

  showFailure(message) {
    this.showMessage(message, "#ff9b78");
    this.cameras.main.shake(120, 0.002);
  }

  showConclusion() {
    const finalScore = this.phase6Score;
    this.clearStage();
    this.phase6Stage = this.add.container(0, 0);

    const glow = this.add
      .circle(480, 125, 78, 0x70b7ff, 0.07)
      .setStrokeStyle(2, 0x70b7ff, 0.3);
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

    this.createCompletionFlashDrive(480, 126);

    const panel = this.add.graphics();
    panel.fillStyle(0x0d1930, 0.97);
    panel.fillRoundedRect(95, 191, 770, 220, 18);
    panel.lineStyle(2, 0x70b7ff, 0.42);
    panel.strokeRoundedRect(95, 191, 770, 220, 18);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(
          480,
          278,
          "Você aprendeu que o pen drive popularizou o armazenamento\nportátil com memória flash. Ele permite transportar arquivos\nde forma prática e rápida, sem partes mecânicas. Porém, é\nimportante cuidar da capacidade, evitar perdas físicas e\nremover o dispositivo com segurança.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "17px",
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
        .text(480, 382, `PONTUAÇÃO FINAL: ${finalScore}`, {
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

    this.phase6Stage.setAlpha(0).setScale(0.97);
    this.tweens.add({
      targets: this.phase6Stage,
      alpha: 1,
      scale: 1,
      duration: 350,
      ease: "Back.out",
    });
  }

  getSelectedSize() {
    return Array.from(this.phase6SelectedFiles).reduce(
      (total, index) => total + PHASE6_FILES[index].size,
      0,
    );
  }

  hasAllEssentialFiles() {
    const selectedNames = new Set(
      Array.from(this.phase6SelectedFiles).map((index) => PHASE6_FILES[index].name),
    );
    return PHASE6_ESSENTIAL_FILES.every((name) => selectedNames.has(name));
  }

  animateProgress(onComplete) {
    this.phase6ProgressFill.setScale(0, 1);
    this.tweens.add({
      targets: this.phase6ProgressFill,
      scaleX: 1,
      duration: 850,
      ease: "Sine.inOut",
      onComplete: () => {
        this.time.delayedCall(120, () => {
          this.phase6ProgressText.setText("PROGRESSO");
          this.phase6ProgressFill.setScale(0, 1);
          onComplete();
        });
      },
    });
  }

  createTransferParticles(fromX, fromY, toX, toY, color) {
    for (let index = 0; index < 6; index += 1) {
      const particle = this.add
        .rectangle(fromX, fromY, 7, 7, color, 0.9)
        .setRotation(Math.PI / 4)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.addToStage(particle);
      this.tweens.add({
        targets: particle,
        x: toX,
        y: toY,
        alpha: 0,
        duration: 520,
        delay: index * 95,
        ease: "Sine.inOut",
        onComplete: () => particle.destroy(),
      });
    }
  }

  shakeCapacityBar() {
    this.tweens.add({
      targets: [this.phase6CapacityBack, this.phase6CapacityFill],
      x: "+=8",
      duration: 55,
      yoyo: true,
      repeat: 3,
    });
  }

  pulseFlashDrive(color) {
    this.phase6FlashGlow
      .setFillStyle(color, 0.08)
      .setStrokeStyle(3, color, 0.85)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: [this.phase6FlashContainer, this.phase6FlashGlow],
      scale: 1.08,
      alpha: { from: 1, to: 0.45 },
      duration: 260,
      yoyo: true,
      repeat: 2,
      ease: "Sine.inOut",
    });
  }

  disableChallengeControls() {
    [
      this.phase6CopyButton,
      this.phase6TransferButton,
      this.phase6EjectButton,
    ].forEach((button) => button.background.disableInteractive());

    this.phase6FileCards.forEach(({ background }) => background.disableInteractive());
  }

  createIntroFlashDrive(x, y) {
    const drive = this.add.graphics();
    drive.fillStyle(0x13283a, 1);
    drive.fillRoundedRect(x - 38, y - 60, 76, 120, 14);
    drive.lineStyle(3, 0x70b7ff, 0.84);
    drive.strokeRoundedRect(x - 38, y - 60, 76, 120, 14);
    drive.fillStyle(0xb7c9d6, 1);
    drive.fillRoundedRect(x - 24, y - 86, 48, 30, 6);
    drive.fillStyle(0x07101f, 0.75);
    drive.fillRect(x - 15, y - 78, 9, 12);
    drive.fillRect(x + 6, y - 78, 9, 12);
    drive.fillStyle(0x8ef28b, 0.82);
    drive.fillCircle(x, y - 18, 8);
    drive.fillStyle(0x62e7f2, 0.25);
    drive.fillRoundedRect(x - 22, y + 12, 44, 10, 4);
    this.addToStage(drive);
  }

  createCompletionFlashDrive(x, y) {
    const drive = this.add.graphics();
    drive.fillStyle(0x13283a, 1);
    drive.fillRoundedRect(x - 33, y - 43, 66, 86, 12);
    drive.lineStyle(3, 0x8ef28b, 0.9);
    drive.strokeRoundedRect(x - 33, y - 43, 66, 86, 12);
    drive.fillStyle(0xb7c9d6, 1);
    drive.fillRoundedRect(x - 20, y - 63, 40, 24, 5);
    drive.fillStyle(0x8ef28b, 1);
    drive.fillCircle(x, y - 12, 7);
    drive.fillStyle(0x62e7f2, 0.35);
    drive.fillRoundedRect(x - 18, y + 14, 36, 8, 4);
    this.addToStage(drive);
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
      .rectangle(0, 0, width, 56, 0x15344b, 1)
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
    this.phase6Stage.add(gameObjects);
  }

  clearStage() {
    if (this.phase6Stage) {
      this.phase6Stage.destroy(true);
      this.phase6Stage = null;
    }
  }
}
