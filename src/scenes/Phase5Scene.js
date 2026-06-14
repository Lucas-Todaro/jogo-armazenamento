import {
  completePhase,
  isPhaseUnlocked,
  savePhaseScore,
} from "../utils/progressManager.js";
import { createStandardButton, drawRetroBackground } from "../utils/visualHelpers.js";

const PHASE5_STARTING_SCORE = 100;
const PHASE5_TARGET_COUNT = 3;
const PHASE5_DRIVE_POSITION = { x: 342, y: 278 };
const PHASE5_PLATTER_CENTER = { x: -10, y: -8 };
const PHASE5_HEAD_PIVOT = { x: 148, y: 124 };
const PHASE5_FILE_POOL = [
  "sistema.sys",
  "fotos.zip",
  "jogo.iso",
  "trabalho.doc",
  "musica.mp3",
  "backup.bak",
  "dados.db",
  "projeto.zip",
  "video.mp4",
  "config.ini",
];
const PHASE5_SECTOR_SLOTS = [
  { angle: -126, radius: 96, color: 0x8ef28b },
  { angle: -82, radius: 118, color: 0x62e7f2 },
  { angle: -38, radius: 92, color: 0xffd166 },
  { angle: 8, radius: 116, color: 0xc49cff },
  { angle: 52, radius: 94, color: 0x70b7ff },
  { angle: 96, radius: 116, color: 0xff8f70 },
  { angle: 142, radius: 92, color: 0x8ef28b },
  { angle: 188, radius: 116, color: 0x62e7f2 },
];

export default class Phase5Scene extends Phaser.Scene {
  constructor() {
    super("Phase5Scene");
  }

  create() {
    if (!isPhaseUnlocked(5)) {
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
      accent: 0xff8f70,
      bottomLeft: 0x17283a,
      bottomRight: 0x0a1522,
      gridAlpha: 0.035,
      frameAlpha: 0.12,
    });
  }

  createIntroPanel() {
    this.clearStage();
    this.phase5Stage = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 54, "FASE 5: HD / DISCO RÍGIDO", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "18px",
          color: "#ff8f70",
        })
        .setOrigin(0.5),
    );

    const panel = this.add.graphics();
    panel.fillStyle(0x0d1930, 0.97);
    panel.fillRoundedRect(96, 94, 768, 384, 18);
    panel.lineStyle(2, 0xff8f70, 0.5);
    panel.strokeRoundedRect(96, 94, 768, 384, 18);
    this.addToStage(panel);

    this.createIntroHardDrive(480, 162);

    this.addToStage(
      this.add
        .text(
          480,
          304,
          "O HD armazena dados em pratos magnéticos que giram rapidamente.\nUma cabeça de leitura se move até os setores para acessar os arquivos.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "19px",
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
          390,
          "Recupere os arquivos corretos movendo a cabeça de leitura,\nmas cuidado com vibrações.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "17px",
            fontStyle: "900",
            color: "#ffd166",
            align: "center",
            lineSpacing: 6,
            wordWrap: { width: 650 },
          },
        )
        .setOrigin(0.5),
    );

    this.createButton(
      480,
      454,
      292,
      "COMEÇAR DESAFIO",
      () => this.startChallenge(),
      { border: 0x8ef28b, hover: 0x246a69, fontSize: "10px" },
    );
    this.createBackLink();
  }

  startChallenge() {
    this.phase5Score = PHASE5_STARTING_SCORE;
    this.phase5RecoveredFiles = new Set();
    this.phase5SectorObjects = [];
    this.phase5IsMoving = false;
    this.phase5IsVibrating = false;
    this.phase5IsComplete = false;
    this.phase5ActionCount = 0;
    this.phase5VibrationTween = null;
    this.phase5VibrationPulse = null;

    this.setupRandomChallenge();
    this.clearStage();
    this.phase5Stage = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 31, "DISCO RÍGIDO MAGNÉTICO", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "15px",
          color: "#ff8f70",
        })
        .setOrigin(0.5),
    );

    this.phase5ScoreText = this.add
      .text(910, 31, "PONTOS: 100", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "9px",
        color: "#8ef28b",
      })
      .setOrigin(1, 0.5);
    this.addToStage(this.phase5ScoreText);

    this.createObjectivePanel();
    this.createHardDriveLayout();
    this.createStatusPanel();
    this.createTipBox();
    this.createControls();
    this.createFeedbackBox();
    this.createBackLink();

    this.updateCurrentSectorVisual();
    this.updateTargetPanel();
    this.updateStabilizeButton();

    this.phase5Stage.setAlpha(0);
    this.tweens.add({
      targets: this.phase5Stage,
      alpha: 1,
      duration: 260,
      ease: "Sine.out",
    });
  }

  setupRandomChallenge() {
    const previousSignature = this.phase5ChallengeSignature;
    const slotCount = PHASE5_SECTOR_SLOTS.length;

    for (let attempt = 0; attempt < 100; attempt += 1) {
      const shuffledFiles = Phaser.Utils.Array.Shuffle([
        ...PHASE5_FILE_POOL,
      ]);
      const files = PHASE5_SECTOR_SLOTS.map((slot, index) => ({
        ...slot,
        name: shuffledFiles[index],
        sector: index + 1,
      }));
      const targetFiles = Phaser.Utils.Array.Shuffle(
        files.map((file) => file.name),
      ).slice(0, PHASE5_TARGET_COUNT);
      const signature = `${files
        .map((file) => file.name)
        .join("|")}::${targetFiles.join("|")}`;

      if (signature !== previousSignature) {
        this.phase5Files = files;
        this.phase5TargetFiles = targetFiles;
        this.phase5ChallengeSignature = signature;
        this.phase5TargetIndex = 0;
        this.phase5CurrentSectorIndex = Phaser.Math.Between(
          0,
          slotCount - 1,
        );
        this.phase5NextVibrationAt = Phaser.Math.Between(3, 5);
        return;
      }
    }

    this.phase5Files = PHASE5_SECTOR_SLOTS.map((slot, index) => ({
      ...slot,
      name: PHASE5_FILE_POOL[(index + 1) % PHASE5_FILE_POOL.length],
      sector: index + 1,
    }));
    this.phase5TargetFiles = [
      this.phase5Files[1].name,
      this.phase5Files[4].name,
      this.phase5Files[7].name,
    ];
    this.phase5ChallengeSignature = `${this.phase5Files
      .map((file) => file.name)
      .join("|")}::${this.phase5TargetFiles.join("|")}`;
    this.phase5TargetIndex = 0;
    this.phase5CurrentSectorIndex = 0;
    this.phase5NextVibrationAt = 4;
  }

  createObjectivePanel() {
    const panel = this.add.graphics();
    panel.fillStyle(0x101f35, 0.98);
    panel.fillRoundedRect(142, 52, 676, 58, 12);
    panel.lineStyle(2, 0xffd166, 0.4);
    panel.strokeRoundedRect(142, 52, 676, 58, 12);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(
          480,
          81,
          "Objetivo: mova a cabeça de leitura até o setor correto e recupere os arquivos.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "16px",
            fontStyle: "900",
            color: "#f1f7ff",
            align: "center",
            wordWrap: { width: 620 },
          },
        )
        .setOrigin(0.5),
    );
  }

  createHardDriveLayout() {
    this.phase5DriveContainer = this.add.container(
      PHASE5_DRIVE_POSITION.x,
      PHASE5_DRIVE_POSITION.y,
    );
    this.addToStage(this.phase5DriveContainer);

    this.createDriveShell();
    this.createDiskPlatter();
    this.createReadHead();
    this.createSectors();

    this.phase5VibrationBanner = this.add.container(0, -182).setVisible(false);
    const bannerBg = this.add.graphics();
    bannerBg.fillStyle(0x2d1212, 0.97);
    bannerBg.fillRoundedRect(-164, -18, 328, 36, 10);
    bannerBg.lineStyle(2, 0xff7b68, 0.92);
    bannerBg.strokeRoundedRect(-164, -18, 328, 36, 10);
    const bannerText = this.add
      .text(0, 0, "VIBRACAO DETECTADA!", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#ff9b78",
      })
      .setOrigin(0.5);
    this.phase5VibrationBanner.add([bannerBg, bannerText]);
    this.phase5DriveContainer.add(this.phase5VibrationBanner);
  }

  createDriveShell() {
    const drive = this.add.graphics();
    drive.fillStyle(0x0b1324, 1);
    drive.fillRoundedRect(-204, -166, 408, 332, 22);
    drive.lineStyle(4, 0x31445a, 1);
    drive.strokeRoundedRect(-204, -166, 408, 332, 22);
    drive.fillStyle(0x13283a, 1);
    drive.fillRoundedRect(-188, -150, 376, 300, 16);
    drive.lineStyle(2, 0x62e7f2, 0.22);
    drive.strokeRoundedRect(-188, -150, 376, 300, 16);
    drive.fillStyle(0x07101f, 0.78);
    drive.fillCircle(PHASE5_PLATTER_CENTER.x, PHASE5_PLATTER_CENTER.y, 150);
    drive.lineStyle(2, 0xff8f70, 0.25);
    drive.strokeCircle(PHASE5_PLATTER_CENTER.x, PHASE5_PLATTER_CENTER.y, 150);
    drive.fillStyle(0x263a52, 1);
    drive.fillRoundedRect(-174, 118, 348, 32, 8);
    drive.fillStyle(0x62e7f2, 0.3);
    drive.fillRoundedRect(-160, 129, 226, 8, 4);
    drive.fillStyle(0x8ef28b, 0.72);
    drive.fillCircle(130, 134, 5);
    drive.fillStyle(0xffd166, 0.72);
    drive.fillCircle(150, 134, 5);
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
    platter.fillCircle(0, 0, 132);
    platter.lineStyle(5, 0xf1f7ff, 0.34);
    platter.strokeCircle(0, 0, 132);

    [116, 92, 68, 44].forEach((radius, index) => {
      const colors = [0x62e7f2, 0xffd166, 0xc49cff, 0x8ef28b];
      platter.lineStyle(4, colors[index], 0.2 + index * 0.02);
      platter.strokeCircle(0, 0, radius);
    });

    platter.fillStyle(0xffffff, 0.18);
    platter.beginPath();
    platter.moveTo(-98, -72);
    platter.lineTo(-20, -16);
    platter.lineTo(-48, 22);
    platter.lineTo(-116, -38);
    platter.closePath();
    platter.fillPath();
    platter.fillStyle(0x62e7f2, 0.12);
    platter.beginPath();
    platter.moveTo(88, -86);
    platter.lineTo(22, -16);
    platter.lineTo(55, 24);
    platter.lineTo(120, -30);
    platter.closePath();
    platter.fillPath();
    platter.fillStyle(0x0b1627, 1);
    platter.fillCircle(0, 0, 24);
    platter.lineStyle(5, 0x8799a8, 0.85);
    platter.strokeCircle(0, 0, 24);

    this.phase5PlatterSpin.add(platter);
    this.tweens.add({
      targets: this.phase5PlatterSpin,
      angle: 360,
      duration: 20000,
      repeat: -1,
      ease: "Linear",
    });
  }

  createSectors() {
    this.phase5SectorHighlight = this.add
      .circle(0, 0, 29, 0xffd166, 0.1)
      .setStrokeStyle(4, 0xffd166, 0.95)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.phase5DriveContainer.add(this.phase5SectorHighlight);

    this.phase5Files.forEach((file, index) => {
      const position = this.getSectorPosition(file);
      const sectorContainer = this.add
        .container(position.x, position.y)
        .setDepth(2);
      const centerOffsetX = position.x - PHASE5_PLATTER_CENTER.x;
      const centerOffsetY = position.y - PHASE5_PLATTER_CENTER.y;
      const distance = Math.hypot(centerOffsetX, centerOffsetY) || 1;
      const labelX = (centerOffsetX / distance) * 30;
      const labelY = (centerOffsetY / distance) * 30;
      const marker = this.add
        .circle(0, 0, 17, 0x07101f, 1)
        .setStrokeStyle(3, file.color, 0.9);
      const dot = this.add.circle(0, 0, 5, file.color, 1);
      const tag = this.add.rectangle(
        labelX,
        labelY,
        92,
        20,
        0xf1f7ff,
        0.96,
      );
      const label = this.add
        .text(labelX, labelY, file.name, {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "10px",
          fontStyle: "900",
          color: "#07101f",
          align: "center",
        })
        .setOrigin(0.5);
      const recovered = this.add
        .text(0, -1, "OK", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#8ef28b",
        })
        .setOrigin(0.5)
        .setVisible(false);

      sectorContainer.add([marker, dot, tag, label, recovered]);
      this.phase5DriveContainer.add(sectorContainer);
      this.phase5SectorObjects.push({
        container: sectorContainer,
        marker,
        dot,
        tag,
        label,
        recovered,
        file,
        index,
      });
    });
  }

  createReadHead() {
    this.phase5ArmGraphics = this.add.graphics();
    this.phase5DriveContainer.add(this.phase5ArmGraphics);

    this.phase5HeadPivot = this.add
      .circle(PHASE5_HEAD_PIVOT.x, PHASE5_HEAD_PIVOT.y, 18, 0x263a52, 1)
      .setStrokeStyle(4, 0x62e7f2, 0.58);
    this.phase5DriveContainer.add(this.phase5HeadPivot);

    this.phase5HeadTip = this.add
      .rectangle(0, 0, 58, 18, 0x60758a, 1)
      .setStrokeStyle(2, 0xf1f7ff, 0.42);
    this.phase5DriveContainer.add(this.phase5HeadTip);

    this.updateReadHeadPosition(false);
  }

  createStatusPanel() {
    const panel = this.add.graphics();
    panel.fillStyle(0x101f35, 0.98);
    panel.fillRoundedRect(568, 124, 334, 140, 14);
    panel.lineStyle(2, 0xff8f70, 0.4);
    panel.strokeRoundedRect(568, 124, 334, 140, 14);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(735, 146, "ARQUIVO PROCURADO", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#ffd166",
        })
        .setOrigin(0.5),
    );

    this.phase5TargetText = this.add
      .text(735, 181, "", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "24px",
        fontStyle: "900",
        color: "#f1f7ff",
        align: "center",
        wordWrap: { width: 292 },
      })
      .setOrigin(0.5);
    this.addToStage(this.phase5TargetText);

    this.phase5CurrentSectorText = this.add
      .text(735, 222, "", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "13px",
        fontStyle: "800",
        color: "#c7d7e8",
        align: "center",
        wordWrap: { width: 288 },
      })
      .setOrigin(0.5);
    this.addToStage(this.phase5CurrentSectorText);

    this.phase5RecoveredText = this.add
      .text(735, 246, "", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#8ef28b",
      })
      .setOrigin(0.5);
    this.addToStage(this.phase5RecoveredText);
  }

  createTipBox() {
    const panel = this.add.graphics();
    panel.fillStyle(0x101f35, 0.98);
    panel.fillRoundedRect(592, 286, 286, 84, 12);
    panel.lineStyle(2, 0x62e7f2, 0.34);
    panel.strokeRoundedRect(592, 286, 286, 84, 12);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(735, 308, "DICA", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#62e7f2",
        })
        .setOrigin(0.5),
    );

    this.addToStage(
      this.add
        .text(
          735,
          340,
          "O HD usa uma cabeça mecânica para acessar setores nos pratos magnéticos.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "13px",
            fontStyle: "800",
            color: "#c7d7e8",
            align: "center",
            lineSpacing: 3,
            wordWrap: { width: 246 },
          },
        )
        .setOrigin(0.5),
    );
  }

  createControls() {
    this.phase5BackButton = this.createButton(
      190,
      454,
      170,
      "SETOR ANTERIOR",
      () => this.moveToPreviousSector(),
      { border: 0x62e7f2, hover: 0x1c5264, fontSize: "8px" },
    );

    this.phase5ForwardButton = this.createButton(
      382,
      454,
      170,
      "PRÓXIMO SETOR",
      () => this.moveToNextSector(),
      { border: 0x62e7f2, hover: 0x1c5264, fontSize: "8px" },
    );

    this.phase5ReadButton = this.createButton(
      574,
      454,
      170,
      "LER SETOR",
      () => this.readCurrentSector(),
      { border: 0x8ef28b, hover: 0x246a69, fontSize: "9px" },
    );

    this.phase5StabilizeButton = this.createButton(
      782,
      454,
      214,
      "ESTABILIZAR HD",
      () => this.stabilizeHardDrive(),
      { border: 0xffd166, hover: 0x5c4b22, fontSize: "8px" },
    );
  }

  createFeedbackBox() {
    const panel = this.add.graphics();
    panel.fillStyle(0x091424, 0.98);
    panel.fillRoundedRect(90, 492, 780, 34, 10);
    panel.lineStyle(2, 0x62e7f2, 0.25);
    panel.strokeRoundedRect(90, 492, 780, 34, 10);
    this.addToStage(panel);

    this.phase5FeedbackText = this.add
      .text(480, 509, "Use os botões para mover a cabeça até o arquivo procurado.", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "14px",
        fontStyle: "900",
        color: "#8da2bd",
        align: "center",
        wordWrap: { width: 720 },
      })
      .setOrigin(0.5);
    this.addToStage(this.phase5FeedbackText);
  }

  moveToPreviousSector() {
    this.moveReadHead(-1);
  }

  moveToNextSector() {
    this.moveReadHead(1);
  }

  moveReadHead(direction) {
    if (this.phase5IsComplete || this.phase5IsMoving) {
      return;
    }

    if (this.phase5IsVibrating) {
      this.showFeedback("Vibração detectada! Estabilize o HD antes de continuar.", "warning");
      this.cameras.main.shake(120, 0.002);
      return;
    }

    this.phase5CurrentSectorIndex = Phaser.Math.Wrap(
      this.phase5CurrentSectorIndex + direction,
      0,
      this.phase5Files.length,
    );
    this.phase5IsMoving = true;
    this.updateScore(-1);
    this.countActionAndMaybeVibrate();
    this.updateCurrentSectorVisual();
    this.showFeedback("Cabeça movida. Confira o setor antes de ler.", "neutral");
    this.updateReadHeadPosition(true, () => {
      this.phase5IsMoving = false;
    });
  }

  readCurrentSector() {
    if (this.phase5IsComplete) {
      return;
    }

    if (this.phase5IsMoving) {
      this.showFeedback("Aguarde a cabeça chegar ao setor.", "warning");
      return;
    }

    if (this.phase5IsVibrating) {
      this.updateScore(-10);
      this.showFailure("A leitura falhou por causa da vibração.");
      return;
    }

    const currentFile = this.phase5Files[this.phase5CurrentSectorIndex].name;
    const targetFile = this.phase5TargetFiles[this.phase5TargetIndex];

    if (currentFile !== targetFile) {
      this.updateScore(-10);
      this.countActionAndMaybeVibrate();
      this.showFailure("Esse setor não contém o arquivo procurado.");
      return;
    }

    this.phase5RecoveredFiles.add(currentFile);
    this.phase5SectorObjects[this.phase5CurrentSectorIndex].recovered.setVisible(true);
    this.showSuccess("Arquivo recuperado com sucesso!");
    this.createRecoverySparkles(this.phase5CurrentSectorIndex);
    this.phase5TargetIndex += 1;

    if (this.phase5TargetIndex >= this.phase5TargetFiles.length) {
      this.phase5IsComplete = true;
      this.disableChallengeControls();
      this.showFeedback("Todos os arquivos importantes foram recuperados!", "success");
      this.time.delayedCall(1300, () => this.showConclusion());
      return;
    }

    this.countActionAndMaybeVibrate();
    this.updateTargetPanel();
  }

  countActionAndMaybeVibrate() {
    if (this.phase5IsComplete || this.phase5IsVibrating) {
      return;
    }

    this.phase5ActionCount += 1;
    if (this.phase5ActionCount >= this.phase5NextVibrationAt) {
      this.triggerVibration();
    }
  }

  triggerVibration() {
    if (this.phase5IsComplete || this.phase5IsVibrating) {
      return;
    }

    this.phase5IsVibrating = true;
    this.phase5VibrationBanner.setVisible(true);
    this.updateStabilizeButton();
    this.showFeedback("Vibração detectada! Estabilize o HD antes de continuar.", "warning");

    this.phase5VibrationTween = this.tweens.add({
      targets: this.phase5DriveContainer,
      x: PHASE5_DRIVE_POSITION.x + 4,
      y: PHASE5_DRIVE_POSITION.y - 2,
      duration: 55,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    this.phase5VibrationPulse = this.tweens.add({
      targets: this.phase5VibrationBanner,
      scale: 1.06,
      duration: 170,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  stabilizeHardDrive() {
    if (this.phase5IsComplete || !this.phase5IsVibrating) {
      return;
    }

    this.phase5IsVibrating = false;
    this.stopVibrationTweens();
    this.phase5DriveContainer.setPosition(
      PHASE5_DRIVE_POSITION.x,
      PHASE5_DRIVE_POSITION.y,
    );
    this.phase5VibrationBanner.setVisible(false).setScale(1);
    this.phase5ActionCount = 0;
    this.phase5NextVibrationAt = Phaser.Math.Between(3, 6);
    this.updateStabilizeButton();
    this.showFeedback("HD estabilizado. A leitura pode continuar.", "success");

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
      ease: "Sine.inOut",
    });
  }

  updateTargetPanel() {
    const targetFile = this.phase5TargetFiles[this.phase5TargetIndex];
    this.phase5TargetText.setText(targetFile);
    this.phase5RecoveredText.setText(
      `RECUPERADOS: ${this.phase5RecoveredFiles.size} / ${this.phase5TargetFiles.length}`,
    );
  }

  updateCurrentSectorVisual() {
    const currentFile = this.phase5Files[this.phase5CurrentSectorIndex];
    const position = this.getSectorPosition(currentFile);

    this.phase5SectorHighlight.setPosition(position.x, position.y);
    this.phase5CurrentSectorText.setText(
      `Setor atual: ${currentFile.sector} - ${currentFile.name}`,
    );
    this.updateTargetPanel();

    this.phase5SectorObjects.forEach(({ marker, dot, tag, label, file }, index) => {
      const isCurrent = index === this.phase5CurrentSectorIndex;
      const isRecovered = this.phase5RecoveredFiles.has(file.name);
      marker.setFillStyle(isCurrent ? 0x183749 : 0x07101f, 1);
      marker.setStrokeStyle(isCurrent ? 4 : 3, file.color, isCurrent ? 1 : 0.76);
      dot.setAlpha(isRecovered ? 0.35 : 1);
      tag.setFillStyle(isCurrent ? 0xfff2c2 : 0xf1f7ff, 0.95);
      label.setColor(isRecovered ? "#35714a" : "#07101f");
      label.setText(isRecovered ? `${file.name}` : file.name);
    });
  }

  updateReadHeadPosition(animate = true, onComplete = null) {
    const currentFile = this.phase5Files[this.phase5CurrentSectorIndex];
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
      this.phase5ArmGraphics.lineStyle(3, 0xf1f7ff, 0.32);
      this.phase5ArmGraphics.lineBetween(
        PHASE5_HEAD_PIVOT.x,
        PHASE5_HEAD_PIVOT.y,
        this.phase5HeadTip.x,
        this.phase5HeadTip.y,
      );
      this.phase5HeadTip.setRotation(angle);
      this.phase5HeadTip.setDisplaySize(Math.min(60, distance * 0.32), 18);
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
      duration: 340,
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

  updateStabilizeButton() {
    if (!this.phase5StabilizeButton) {
      return;
    }

    this.phase5StabilizeButton.setVisible(this.phase5IsVibrating);
    if (this.phase5IsVibrating) {
      this.phase5StabilizeButton.setEnabled(true);
    } else {
      this.phase5StabilizeButton.setEnabled(false);
    }
  }

  showFeedback(message, type = "neutral") {
    const colors = {
      success: "#8ef28b",
      error: "#ff9b78",
      warning: "#ffd166",
      neutral: "#8da2bd",
    };
    this.phase5FeedbackText.setText(message).setColor(colors[type] ?? colors.neutral);

    this.tweens.killTweensOf(this.phase5FeedbackText);
    this.tweens.add({
      targets: this.phase5FeedbackText,
      scale: type === "error" ? 1.03 : 1.02,
      duration: 100,
      yoyo: true,
      ease: "Sine.inOut",
    });
  }

  showSuccess(message) {
    this.showFeedback(message, "success");

    const sector = this.phase5SectorObjects[this.phase5CurrentSectorIndex];
    this.tweens.add({
      targets: sector.container,
      scale: 1.22,
      duration: 130,
      yoyo: true,
      repeat: 1,
      ease: "Sine.inOut",
    });
  }

  showFailure(message) {
    this.showFeedback(message, "error");
    this.cameras.main.shake(130, 0.002);

    this.tweens.add({
      targets: this.phase5SectorHighlight,
      scale: 1.28,
      alpha: 0.22,
      duration: 90,
      yoyo: true,
      repeat: 2,
      ease: "Sine.inOut",
    });
  }

  showConclusion() {
    completePhase(5);
    savePhaseScore(5, this.phase5Score);

    const finalScore = this.phase5Score;
    this.clearStage();
    this.phase5Stage = this.add.container(0, 0);

    const glow = this.add
      .circle(480, 124, 80, 0xff8f70, 0.07)
      .setStrokeStyle(2, 0xff8f70, 0.28);
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
    panel.fillRoundedRect(96, 194, 768, 220, 18);
    panel.lineStyle(2, 0xff8f70, 0.42);
    panel.strokeRoundedRect(96, 194, 768, 220, 18);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(
          480,
          280,
          "Você aprendeu que o HD oferece grande capacidade de armazenamento,\nmas depende de partes mecânicas, como pratos giratórios e cabeça de leitura.\nPor isso, impactos e vibrações podem causar falhas.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "18px",
            fontStyle: "700",
            color: "#dce8f5",
            align: "center",
            lineSpacing: 7,
            wordWrap: { width: 690 },
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

    this.phase5Stage.setAlpha(0).setScale(0.97);
    this.tweens.add({
      targets: this.phase5Stage,
      alpha: 1,
      scale: 1,
      duration: 350,
      ease: "Back.out",
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
    const file = this.phase5Files[sectorIndex];
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
    hd.fillRoundedRect(x - 105, y - 62, 210, 124, 16);
    hd.lineStyle(3, 0xff8f70, 0.74);
    hd.strokeRoundedRect(x - 105, y - 62, 210, 124, 16);
    hd.fillStyle(0xb7c9d6, 1);
    hd.fillCircle(x - 26, y, 48);
    hd.lineStyle(4, 0x62e7f2, 0.28);
    hd.strokeCircle(x - 26, y, 33);
    hd.fillStyle(0x0b1627, 1);
    hd.fillCircle(x - 26, y, 12);
    hd.lineStyle(7, 0x60758a, 1);
    hd.lineBetween(x + 46, y + 38, x + 5, y + 5);
    hd.fillStyle(0xffd166, 1);
    hd.fillCircle(x + 5, y + 5, 5);
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
    ].forEach((button) => {
      if (button?.setEnabled) {
        button.setEnabled(false);
      } else if (button?.background) {
        button.background.disableInteractive();
      }
    });
  }

  stopVibrationTweens() {
    if (this.phase5VibrationTween) {
      this.phase5VibrationTween.stop();
      this.phase5VibrationTween = null;
    }

    if (this.phase5VibrationPulse) {
      this.phase5VibrationPulse.stop();
      this.phase5VibrationPulse = null;
    }
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
      .text(38, 31, "< LINHA DO TEMPO", {
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
    this.stopVibrationTweens();
    this.tweens.killAll();

    if (this.phase5Stage) {
      this.phase5Stage.destroy(true);
      this.phase5Stage = null;
    }
  }
}
