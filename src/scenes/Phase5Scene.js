const PHASE5_STARTING_SCORE = 100;
const PHASE5_DRIVE_POSITION = { x: 334, y: 282 };
const PHASE5_PLATTER_CENTER = { x: 0, y: -12 };
const PHASE5_HEAD_PIVOT = { x: 145, y: 122 };
const PHASE5_FILES = [
  { name: "sistema.sys", angle: -112, radius: 92, color: 0x8ef28b },
  { name: "fotos.zip", angle: -42, radius: 112, color: 0x62e7f2 },
  { name: "jogo.iso", angle: 22, radius: 84, color: 0xffd166 },
  { name: "trabalho.doc", angle: 82, radius: 108, color: 0xc49cff },
  { name: "musica.mp3", angle: 148, radius: 92, color: 0x70b7ff },
  { name: "backup.bak", angle: 210, radius: 112, color: 0xff8f70 },
];
const PHASE5_TARGET_FILES = ["sistema.sys", "trabalho.doc", "backup.bak"];

export default class Phase5Scene extends Phaser.Scene {
  constructor() {
    super("Phase5Scene");
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

    graphics.lineStyle(1, 0xff8f70, 0.04);
    for (let x = 0; x < 960; x += 24) {
      graphics.lineBetween(x, 0, x, 540);
    }
    for (let y = 0; y < 540; y += 24) {
      graphics.lineBetween(0, y, 960, y);
    }

    graphics.lineStyle(2, 0xff8f70, 0.1);
    graphics.strokeRoundedRect(18, 18, 924, 504, 20);

    const lights = [
      [55, 76, 0xff8f70],
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
    this.phase5Stage = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 48, "FASE 5: HD / DISCO RÍGIDO", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "18px",
          color: "#ff8f70",
        })
        .setOrigin(0.5),
    );

    const panel = this.add.graphics();
    panel.fillStyle(0x0d1930, 0.97);
    panel.fillRoundedRect(90, 92, 780, 390, 20);
    panel.lineStyle(2, 0xff8f70, 0.46);
    panel.strokeRoundedRect(90, 92, 780, 390, 20);
    this.addToStage(panel);

    this.createIntroHardDrive(480, 154);

    this.addToStage(
      this.add
        .text(
          480,
          303,
          "Com os HDs, os computadores passaram a armazenar muito\nmais dados. O disco rígido usa pratos magnéticos que giram\nrapidamente, enquanto uma cabeça de leitura acessa as\ninformações gravadas.",
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
          "O desafio é acessar os arquivos corretos sem causar impacto\nno disco, pois o HD possui partes mecânicas sensíveis.",
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
    this.phase5Score = PHASE5_STARTING_SCORE;
    this.phase5CurrentSectorIndex = 2;
    this.phase5TargetIndex = 0;
    this.phase5RecoveredFiles = new Set();
    this.phase5IsMoving = false;
    this.phase5IsVibrating = false;
    this.phase5IsComplete = false;
    this.phase5VibrationWasShown = false;
    this.phase5SectorObjects = [];
    this.phase5VibrationTween = null;

    this.clearStage();
    this.phase5Stage = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 29, "DISCO RÍGIDO MAGNÉTICO", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "15px",
          color: "#ff8f70",
        })
        .setOrigin(0.5),
    );

    this.phase5ScoreText = this.add
      .text(916, 29, "PONTOS: 100", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#8ef28b",
      })
      .setOrigin(1, 0.5);
    this.addToStage(this.phase5ScoreText);

    this.createMissionPanel();
    this.createHardDrive();
    this.createDiskPlatter();
    this.createFileSectors();
    this.createReadHead();
    this.createStatusPanel();
    this.createEducationBox();
    this.createControls();
    this.updateCurrentSectorVisual();

    this.phase5MessageText = this.add
      .text(480, 508, "Use os botões para mover a cabeça até o arquivo procurado.", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "15px",
        fontStyle: "700",
        color: "#8da2bd",
        align: "center",
        wordWrap: { width: 860 },
      })
      .setOrigin(0.5);
    this.addToStage(this.phase5MessageText);
    this.createBackLink();

    this.phase5Stage.setAlpha(0);
    this.tweens.add({
      targets: this.phase5Stage,
      alpha: 1,
      duration: 280,
      ease: "Sine.out",
    });
  }

  createMissionPanel() {
    const panel = this.add.graphics();
    panel.fillStyle(0x101f35, 0.98);
    panel.fillRoundedRect(42, 50, 650, 56, 12);
    panel.lineStyle(2, 0xffd166, 0.38);
    panel.strokeRoundedRect(42, 50, 650, 56, 12);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(367, 78, "MISSÃO: recupere 3 arquivos sem danificar o HD", {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "16px",
          fontStyle: "800",
          color: "#ffd166",
          align: "center",
        })
        .setOrigin(0.5),
    );
  }

  createHardDrive() {
    this.phase5DriveContainer = this.add.container(
      PHASE5_DRIVE_POSITION.x,
      PHASE5_DRIVE_POSITION.y,
    );
    this.addToStage(this.phase5DriveContainer);

    const drive = this.add.graphics();
    drive.fillStyle(0x0b1324, 1);
    drive.fillRoundedRect(-194, -172, 388, 344, 24);
    drive.lineStyle(4, 0x31445a, 1);
    drive.strokeRoundedRect(-194, -172, 388, 344, 24);
    drive.fillStyle(0x13283a, 1);
    drive.fillRoundedRect(-178, -156, 356, 312, 18);
    drive.lineStyle(2, 0x62e7f2, 0.22);
    drive.strokeRoundedRect(-178, -156, 356, 312, 18);

    drive.fillStyle(0x07101f, 0.82);
    drive.fillCircle(0, -12, 154);
    drive.lineStyle(2, 0xff8f70, 0.22);
    drive.strokeCircle(0, -12, 154);

    drive.fillStyle(0x263a52, 1);
    drive.fillRoundedRect(-170, 122, 340, 34, 8);
    drive.fillStyle(0x62e7f2, 0.32);
    drive.fillRoundedRect(-158, 132, 230, 9, 4);
    drive.fillStyle(0x8ef28b, 0.65);
    drive.fillCircle(128, 138, 5);
    drive.fillStyle(0xffd166, 0.65);
    drive.fillCircle(147, 138, 5);

    this.phase5DriveContainer.add(drive);
  }

  createDiskPlatter() {
    this.phase5PlatterSpin = this.add.container(
      PHASE5_PLATTER_CENTER.x,
      PHASE5_PLATTER_CENTER.y,
    );
    this.phase5DriveContainer.add(this.phase5PlatterSpin);

    const platter = this.add.graphics();
    platter.fillStyle(0xb7c9d6, 1);
    platter.fillCircle(0, 0, 134);

    const tracks = [
      { radius: 119, color: 0x62e7f2, alpha: 0.28, width: 4 },
      { radius: 96, color: 0xffd166, alpha: 0.25, width: 5 },
      { radius: 73, color: 0xc49cff, alpha: 0.26, width: 4 },
      { radius: 50, color: 0x8ef28b, alpha: 0.2, width: 4 },
    ];
    tracks.forEach(({ radius, color, alpha, width }) => {
      platter.lineStyle(width, color, alpha);
      platter.strokeCircle(0, 0, radius);
    });

    platter.lineStyle(3, 0xf1f7ff, 0.38);
    platter.strokeCircle(0, 0, 134);
    platter.fillStyle(0x0b1627, 1);
    platter.fillCircle(0, 0, 24);
    platter.lineStyle(5, 0x8799a8, 0.85);
    platter.strokeCircle(0, 0, 24);

    platter.fillStyle(0xffffff, 0.18);
    platter.beginPath();
    platter.moveTo(-100, -78);
    platter.lineTo(-22, -18);
    platter.lineTo(-50, 22);
    platter.lineTo(-118, -42);
    platter.closePath();
    platter.fillPath();

    platter.fillStyle(0x62e7f2, 0.1);
    platter.beginPath();
    platter.moveTo(90, -92);
    platter.lineTo(25, -18);
    platter.lineTo(58, 24);
    platter.lineTo(126, -34);
    platter.closePath();
    platter.fillPath();

    this.phase5PlatterSpin.add(platter);

    this.tweens.add({
      targets: this.phase5PlatterSpin,
      angle: 360,
      duration: 22000,
      repeat: -1,
      ease: "Linear",
    });
  }

  createReadHead() {
    this.phase5ArmGraphics = this.add.graphics();
    this.phase5DriveContainer.add(this.phase5ArmGraphics);

    this.phase5HeadPivot = this.add
      .circle(PHASE5_HEAD_PIVOT.x, PHASE5_HEAD_PIVOT.y, 18, 0x263a52, 1)
      .setStrokeStyle(4, 0x62e7f2, 0.55);
    this.phase5DriveContainer.add(this.phase5HeadPivot);

    this.phase5HeadTip = this.add
      .rectangle(0, 0, 56, 17, 0x60758a, 1)
      .setStrokeStyle(2, 0xf1f7ff, 0.35);
    this.phase5DriveContainer.add(this.phase5HeadTip);

    this.updateReadHeadPosition(false);
  }

  createFileSectors() {
    this.phase5SectorHighlight = this.add
      .circle(0, 0, 27, 0xff8f70, 0.08)
      .setStrokeStyle(3, 0xffd166, 0.9)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.phase5DriveContainer.add(this.phase5SectorHighlight);

    PHASE5_FILES.forEach((file) => {
      const position = this.getSectorPosition(file);
      const sectorContainer = this.add.container(position.x, position.y);
      const marker = this.add
        .circle(0, 0, 18, 0x101f35, 1)
        .setStrokeStyle(3, file.color, 0.85);
      const dot = this.add.circle(0, 0, 5, file.color, 0.95);
      const label = this.add
        .text(0, 31, file.name, {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "10px",
          fontStyle: "800",
          color: "#dce8f5",
          align: "center",
        })
        .setOrigin(0.5);
      const recovered = this.add
        .text(0, -2, "✓", {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "21px",
          fontStyle: "900",
          color: "#8ef28b",
        })
        .setOrigin(0.5)
        .setVisible(false);

      sectorContainer.add([marker, dot, label, recovered]);
      this.phase5DriveContainer.add(sectorContainer);
      this.phase5SectorObjects.push({ container: sectorContainer, marker, dot, recovered });
    });
  }

  createStatusPanel() {
    const panel = this.add.graphics();
    panel.fillStyle(0x101f35, 0.98);
    panel.fillRoundedRect(524, 124, 176, 128, 12);
    panel.lineStyle(2, 0xff8f70, 0.36);
    panel.strokeRoundedRect(524, 124, 176, 128, 12);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(612, 145, "ARQUIVO PROCURADO", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: "#ffd166",
        })
        .setOrigin(0.5),
    );

    this.phase5TargetText = this.add
      .text(612, 173, PHASE5_TARGET_FILES[0], {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "18px",
        fontStyle: "900",
        color: "#f1f7ff",
      })
      .setOrigin(0.5);
    this.addToStage(this.phase5TargetText);

    this.phase5CurrentSectorText = this.add
      .text(612, 207, "SETOR ATUAL: jogo.iso", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "12px",
        fontStyle: "800",
        color: "#8da2bd",
        align: "center",
        wordWrap: { width: 150 },
      })
      .setOrigin(0.5);
    this.addToStage(this.phase5CurrentSectorText);

    this.phase5RecoveredText = this.add
      .text(612, 232, "RECUPERADOS: 0 / 3", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "7px",
        color: "#8ef28b",
      })
      .setOrigin(0.5);
    this.addToStage(this.phase5RecoveredText);

    const vibrationPanel = this.add.graphics();
    vibrationPanel.fillStyle(0x101f35, 0.98);
    vibrationPanel.fillRoundedRect(524, 264, 176, 66, 12);
    vibrationPanel.lineStyle(2, 0x62e7f2, 0.34);
    vibrationPanel.strokeRoundedRect(524, 264, 176, 66, 12);
    this.addToStage(vibrationPanel);

    this.phase5VibrationText = this.add
      .text(612, 297, "HD ESTÁVEL", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#8ef28b",
        align: "center",
      })
      .setOrigin(0.5);
    this.addToStage(this.phase5VibrationText);
  }

  createEducationBox() {
    const panel = this.add.graphics();
    panel.fillStyle(0x101f35, 0.98);
    panel.fillRoundedRect(720, 112, 218, 282, 16);
    panel.lineStyle(2, 0x62e7f2, 0.34);
    panel.strokeRoundedRect(720, 112, 218, 282, 16);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(829, 137, "HD MECÂNICO", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "9px",
          color: "#62e7f2",
        })
        .setOrigin(0.5),
    );

    this.addToStage(
      this.add
        .text(
          829,
          256,
          "HDs armazenam dados\nmagneticamente em pratos\nque giram rapidamente.\n\nUma cabeça de leitura se\nmove para acessar os\nsetores do disco.\n\nEles oferecem grande\ncapacidade, mas possuem\npartes mecânicas sensíveis\na impactos e vibrações.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "13px",
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
    this.phase5BackButton = this.createButton(
      196,
      446,
      152,
      "SETOR -",
      () => this.moveHeadBackward(),
      { border: 0x62e7f2, hover: 0x1c5264, fontSize: "9px" },
    );

    this.phase5ForwardButton = this.createButton(
      364,
      446,
      152,
      "SETOR +",
      () => this.moveHeadForward(),
      { border: 0x62e7f2, hover: 0x1c5264, fontSize: "9px" },
    );

    this.phase5ReadButton = this.createButton(
      558,
      446,
      188,
      "LER SETOR",
      () => this.readSector(),
      { border: 0x8ef28b, hover: 0x246a69, fontSize: "9px" },
    );

    this.phase5StabilizeButton = this.createButton(
      792,
      446,
      230,
      "ESTABILIZAR HD",
      () => this.stabilizeHardDrive(),
      { border: 0xffd166, hover: 0x5c4b22, fontSize: "8px" },
    );
  }

  moveHeadForward() {
    this.moveHead(1);
  }

  moveHeadBackward() {
    this.moveHead(-1);
  }

  moveHead(direction) {
    if (this.phase5IsComplete || this.phase5IsMoving) {
      return;
    }

    if (this.phase5IsVibrating) {
      this.showMessage(
        "Vibração detectada! Estabilize o HD antes de continuar.",
        "#ff9b78",
      );
      this.cameras.main.shake(120, 0.002);
      return;
    }

    this.phase5CurrentSectorIndex = Phaser.Math.Wrap(
      this.phase5CurrentSectorIndex + direction,
      0,
      PHASE5_FILES.length,
    );
    this.phase5IsMoving = true;
    this.updateScore(-1);
    this.showMessage("Cabeça de leitura movida para outro setor.", "#62e7f2");
    this.updateCurrentSectorVisual();
    this.updateReadHeadPosition(true, () => {
      this.phase5IsMoving = false;
    });
    this.time.delayedCall(460, () => {
      this.phase5IsMoving = false;
    });
  }

  readSector() {
    if (this.phase5IsComplete) {
      return;
    }

    if (this.phase5IsMoving) {
      this.showMessage("Aguarde a cabeça de leitura chegar ao setor.", "#ffd166");
      return;
    }

    if (this.phase5IsVibrating) {
      this.updateScore(-10);
      this.showFailure("A leitura falhou por causa da vibração.");
      return;
    }

    const currentFile = PHASE5_FILES[this.phase5CurrentSectorIndex].name;
    const targetFile = PHASE5_TARGET_FILES[this.phase5TargetIndex];

    if (currentFile !== targetFile) {
      this.updateScore(-10);
      this.showFailure("Esse setor não contém o arquivo procurado.");
      return;
    }

    this.phase5RecoveredFiles.add(currentFile);
    this.phase5SectorObjects[this.phase5CurrentSectorIndex].recovered.setVisible(true);
    this.showSuccess("Arquivo recuperado com sucesso!");
    this.createRecoverySparkles(this.phase5CurrentSectorIndex);
    this.phase5TargetIndex += 1;

    if (this.phase5TargetIndex >= PHASE5_TARGET_FILES.length) {
      this.phase5IsComplete = true;
      this.disableChallengeControls();
      this.showMessage("Todos os arquivos importantes foram recuperados!", "#8ef28b");
      this.time.delayedCall(1400, () => this.showConclusion());
      return;
    }

    this.updateTargetPanel();
    if (!this.phase5VibrationWasShown) {
      this.phase5VibrationWasShown = true;
      this.time.delayedCall(650, () => this.triggerVibration());
    }
  }

  triggerVibration() {
    if (this.phase5IsComplete || this.phase5IsVibrating) {
      return;
    }

    this.phase5IsVibrating = true;
    this.phase5VibrationText.setText("VIBRAÇÃO DETECTADA!").setColor("#ff9b78");
    this.showMessage(
      "Vibração detectada! Estabilize o HD antes de continuar.",
      "#ff9b78",
    );

    this.phase5VibrationTween = this.tweens.add({
      targets: this.phase5DriveContainer,
      x: PHASE5_DRIVE_POSITION.x + 4,
      y: PHASE5_DRIVE_POSITION.y - 2,
      duration: 55,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  stabilizeHardDrive() {
    if (this.phase5IsComplete) {
      return;
    }

    if (!this.phase5IsVibrating) {
      this.showMessage("O HD já está estável. Continue buscando os arquivos.", "#8da2bd");
      return;
    }

    this.phase5IsVibrating = false;
    if (this.phase5VibrationTween) {
      this.phase5VibrationTween.stop();
      this.phase5VibrationTween = null;
    }
    this.phase5DriveContainer.setPosition(
      PHASE5_DRIVE_POSITION.x,
      PHASE5_DRIVE_POSITION.y,
    );
    this.phase5VibrationText.setText("HD ESTÁVEL").setColor("#8ef28b");
    this.showMessage("HD estabilizado. A leitura pode continuar.", "#8ef28b");

    this.tweens.add({
      targets: this.phase5DriveContainer,
      scale: 1.025,
      duration: 130,
      yoyo: true,
      ease: "Sine.inOut",
    });
  }

  updateScore(change) {
    this.phase5Score = Phaser.Math.Clamp(
      this.phase5Score + change,
      0,
      PHASE5_STARTING_SCORE,
    );
    this.phase5ScoreText.setText(`PONTOS: ${this.phase5Score}`);

    this.tweens.add({
      targets: this.phase5ScoreText,
      scale: 1.12,
      duration: 100,
      yoyo: true,
    });
  }

  showMessage(message, color = "#8da2bd") {
    this.phase5MessageText.setText(message).setColor(color);
  }

  showSuccess(message) {
    this.showMessage(message, "#8ef28b");

    const sector = this.phase5SectorObjects[this.phase5CurrentSectorIndex];
    this.tweens.add({
      targets: sector.container,
      scale: 1.24,
      duration: 140,
      yoyo: true,
      repeat: 1,
      ease: "Sine.inOut",
    });
  }

  showFailure(message) {
    this.showMessage(message, "#ff9b78");
    this.cameras.main.shake(130, 0.002);

    this.tweens.add({
      targets: this.phase5SectorHighlight,
      scale: 1.3,
      alpha: 0.22,
      duration: 95,
      yoyo: true,
      repeat: 2,
    });
  }

  showConclusion() {
    const finalScore = this.phase5Score;
    this.clearStage();
    this.phase5Stage = this.add.container(0, 0);

    const glow = this.add
      .circle(480, 125, 78, 0xff8f70, 0.07)
      .setStrokeStyle(2, 0xff8f70, 0.3);
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

    this.createCompletionHardDrive(480, 126);

    const panel = this.add.graphics();
    panel.fillStyle(0x0d1930, 0.97);
    panel.fillRoundedRect(95, 191, 770, 220, 18);
    panel.lineStyle(2, 0xff8f70, 0.42);
    panel.strokeRoundedRect(95, 191, 770, 220, 18);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(
          480,
          278,
          "Você aprendeu que o HD aumentou muito a capacidade de\narmazenamento dos computadores. Ele usa discos magnéticos\ngirando e uma cabeça de leitura mecânica. Apesar de poderoso,\npode ser danificado por impactos, quedas ou vibrações.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "18px",
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

    this.phase5Stage.setAlpha(0).setScale(0.97);
    this.tweens.add({
      targets: this.phase5Stage,
      alpha: 1,
      scale: 1,
      duration: 350,
      ease: "Back.out",
    });
  }

  updateTargetPanel() {
    const targetFile = PHASE5_TARGET_FILES[this.phase5TargetIndex];
    this.phase5TargetText.setText(targetFile);
    this.phase5RecoveredText.setText(
      `RECUPERADOS: ${this.phase5RecoveredFiles.size} / ${PHASE5_TARGET_FILES.length}`,
    );
  }

  updateCurrentSectorVisual() {
    const currentFile = PHASE5_FILES[this.phase5CurrentSectorIndex];
    const position = this.getSectorPosition(currentFile);
    this.phase5SectorHighlight.setPosition(position.x, position.y);
    this.phase5CurrentSectorText.setText(`SETOR ATUAL: ${currentFile.name}`);
    this.updateTargetPanel();

    this.phase5SectorObjects.forEach(({ marker }, index) => {
      const file = PHASE5_FILES[index];
      marker.setFillStyle(index === this.phase5CurrentSectorIndex ? 0x183749 : 0x101f35, 1);
      marker.setStrokeStyle(
        index === this.phase5CurrentSectorIndex ? 4 : 3,
        file.color,
        index === this.phase5CurrentSectorIndex ? 1 : 0.72,
      );
    });
  }

  updateReadHeadPosition(animate = true, onComplete = null) {
    const currentFile = PHASE5_FILES[this.phase5CurrentSectorIndex];
    const position = this.getSectorPosition(currentFile);

    const drawArm = () => {
      const angle = Phaser.Math.Angle.Between(
        PHASE5_HEAD_PIVOT.x,
        PHASE5_HEAD_PIVOT.y,
        this.phase5HeadTip.x,
        this.phase5HeadTip.y,
      );
      const distance = Phaser.Math.Distance.Between(
        PHASE5_HEAD_PIVOT.x,
        PHASE5_HEAD_PIVOT.y,
        this.phase5HeadTip.x,
        this.phase5HeadTip.y,
      );

      this.phase5ArmGraphics.clear();
      this.phase5ArmGraphics.lineStyle(13, 0x60758a, 1);
      this.phase5ArmGraphics.lineBetween(
        PHASE5_HEAD_PIVOT.x,
        PHASE5_HEAD_PIVOT.y,
        this.phase5HeadTip.x,
        this.phase5HeadTip.y,
      );
      this.phase5ArmGraphics.lineStyle(3, 0xf1f7ff, 0.28);
      this.phase5ArmGraphics.lineBetween(
        PHASE5_HEAD_PIVOT.x,
        PHASE5_HEAD_PIVOT.y,
        this.phase5HeadTip.x,
        this.phase5HeadTip.y,
      );
      this.phase5HeadTip.setRotation(angle);
      this.phase5HeadTip.setDisplaySize(Math.min(56, distance * 0.3), 17);
    };

    if (!animate) {
      this.phase5HeadTip.setPosition(position.x, position.y);
      drawArm();
      return;
    }

    this.tweens.add({
      targets: this.phase5HeadTip,
      x: position.x,
      y: position.y,
      duration: 360,
      ease: "Sine.inOut",
      onUpdate: drawArm,
      onComplete: () => {
        drawArm();
        if (onComplete) {
          onComplete();
        }
      },
    });
  }

  getSectorPosition(file) {
    const radians = Phaser.Math.DegToRad(file.angle);
    return {
      x: PHASE5_PLATTER_CENTER.x + Math.cos(radians) * file.radius,
      y: PHASE5_PLATTER_CENTER.y + Math.sin(radians) * file.radius,
    };
  }

  createRecoverySparkles(sectorIndex) {
    const file = PHASE5_FILES[sectorIndex];
    const position = this.getSectorPosition(file);
    const globalX = PHASE5_DRIVE_POSITION.x + position.x;
    const globalY = PHASE5_DRIVE_POSITION.y + position.y;
    const offsets = [
      [-13, -11],
      [13, -8],
      [-9, 13],
      [12, 12],
    ];

    offsets.forEach(([offsetX, offsetY], index) => {
      const sparkle = this.add
        .rectangle(
          globalX + offsetX,
          globalY + offsetY,
          6,
          6,
          index % 2 === 0 ? 0x8ef28b : 0x62e7f2,
          0.9,
        )
        .setRotation(Math.PI / 4);
      this.addToStage(sparkle);
      this.tweens.add({
        targets: sparkle,
        scale: 2,
        alpha: 0,
        angle: 135,
        duration: 430,
        delay: index * 35,
        ease: "Sine.out",
      });
    });
  }

  createIntroHardDrive(x, y) {
    const hd = this.add.graphics();
    hd.fillStyle(0x13283a, 1);
    hd.fillRoundedRect(x - 98, y - 58, 196, 116, 18);
    hd.lineStyle(3, 0xff8f70, 0.74);
    hd.strokeRoundedRect(x - 98, y - 58, 196, 116, 18);
    hd.fillStyle(0xb7c9d6, 1);
    hd.fillCircle(x - 22, y, 45);
    hd.lineStyle(4, 0x62e7f2, 0.28);
    hd.strokeCircle(x - 22, y, 31);
    hd.fillStyle(0x0b1627, 1);
    hd.fillCircle(x - 22, y, 12);
    hd.lineStyle(7, 0x60758a, 1);
    hd.lineBetween(x + 42, y + 36, x + 5, y + 5);
    hd.fillStyle(0xffd166, 1);
    hd.fillCircle(x + 4, y + 5, 5);
    this.addToStage(hd);
  }

  createCompletionHardDrive(x, y) {
    const hd = this.add.graphics();
    hd.fillStyle(0x13283a, 1);
    hd.fillRoundedRect(x - 58, y - 36, 116, 72, 12);
    hd.lineStyle(3, 0x8ef28b, 0.85);
    hd.strokeRoundedRect(x - 58, y - 36, 116, 72, 12);
    hd.fillStyle(0xb7c9d6, 1);
    hd.fillCircle(x - 16, y, 26);
    hd.fillStyle(0x0b1627, 1);
    hd.fillCircle(x - 16, y, 7);
    hd.lineStyle(5, 0x60758a, 1);
    hd.lineBetween(x + 28, y + 22, x + 1, y + 2);
    hd.fillStyle(0x8ef28b, 1);
    hd.fillCircle(x + 2, y + 2, 4);
    this.addToStage(hd);
  }

  disableChallengeControls() {
    [
      this.phase5BackButton,
      this.phase5ForwardButton,
      this.phase5ReadButton,
      this.phase5StabilizeButton,
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
    this.phase5Stage.add(gameObjects);
  }

  clearStage() {
    if (this.phase5VibrationTween) {
      this.phase5VibrationTween.stop();
      this.phase5VibrationTween = null;
    }

    if (this.phase5Stage) {
      this.phase5Stage.destroy(true);
      this.phase5Stage = null;
    }
  }
}
