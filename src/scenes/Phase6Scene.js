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

const PHASE6_STARTING_SCORE = 100;
const PHASE6_CAPACITY_MB = 1000;
const PHASE6_ERROR_PENALTY = 10;
const PHASE6_CAPACITY_PENALTY = 5;
const PHASE6_MIN_FILES = 6;
const PHASE6_MAX_FILES = 8;

const PHASE6_STEPS = [
  "SELECIONAR",
  "COPIAR",
  "TRANSFERIR",
  "EJETAR",
];

const PHASE6_FILE_TEMPLATES = [
  {
    id: "presentation",
    name: "apresentacao.pptx",
    type: "PPT",
    minSize: 60,
    maxSize: 130,
    canBeImportant: true,
  },
  {
    id: "document",
    name: "trabalho.docx",
    type: "DOC",
    minSize: 20,
    maxSize: 60,
    canBeImportant: true,
  },
  {
    id: "photos",
    name: "fotos.zip",
    type: "ZIP",
    minSize: 380,
    maxSize: 620,
    canBeImportant: false,
  },
  {
    id: "video",
    name: "video.mp4",
    type: "MP4",
    minSize: 760,
    maxSize: 930,
    canBeImportant: false,
  },
  {
    id: "music",
    name: "musica.mp3",
    type: "MP3",
    minSize: 50,
    maxSize: 120,
    canBeImportant: true,
  },
  {
    id: "installer",
    name: "instalador.exe",
    type: "EXE",
    minSize: 300,
    maxSize: 480,
    canBeImportant: false,
  },
  {
    id: "backup",
    name: "backup.zip",
    type: "ZIP",
    minSize: 520,
    maxSize: 720,
    canBeImportant: false,
  },
  {
    id: "source",
    name: "codigo-fonte.zip",
    type: "ZIP",
    minSize: 120,
    maxSize: 220,
    canBeImportant: true,
  },
  {
    id: "report",
    name: "relatorio.pdf",
    type: "PDF",
    minSize: 30,
    maxSize: 90,
    canBeImportant: true,
  },
  {
    id: "sheet",
    name: "planilha.xlsx",
    type: "XLS",
    minSize: 25,
    maxSize: 80,
    canBeImportant: true,
  },
  {
    id: "project",
    name: "projeto-final.zip",
    type: "ZIP",
    minSize: 180,
    maxSize: 320,
    canBeImportant: true,
  },
  {
    id: "lecture",
    name: "aula-gravada.mp4",
    type: "MP4",
    minSize: 800,
    maxSize: 980,
    canBeImportant: false,
  },
  {
    id: "image",
    name: "imagem.png",
    type: "PNG",
    minSize: 15,
    maxSize: 55,
    canBeImportant: true,
  },
  {
    id: "portfolio",
    name: "portfolio.pdf",
    type: "PDF",
    minSize: 40,
    maxSize: 110,
    canBeImportant: true,
  },
];

const PHASE6_LARGE_IDS = new Set(["video", "lecture"]);
const PHASE6_BULKY_IDS = new Set(["photos", "installer", "backup"]);

export default class Phase6Scene extends Phaser.Scene {
  constructor() {
    super("Phase6Scene");
  }

  create() {
    if (!isPhaseUnlocked(6)) {
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
      accent: 0x70b7ff,
      bottomLeft: 0x10223b,
      bottomRight: 0x07101f,
      gridAlpha: 0.04,
      frameAlpha: 0.12,
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

    this.addToStage(
      createRoundedPanel(this, 480, 278, 780, 374, {
        stroke: 0x70b7ff,
        strokeAlpha: 0.46,
        radius: 20,
      }),
    );

    this.createIntroFlashDrive(480, 154);

    this.addToStage(
      this.add
        .text(
          480,
          302,
          "O pen drive usa memória flash para armazenar dados eletronicamente,\nsem partes móveis. Ele tornou o transporte de arquivos\nmuito mais prático.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "19px",
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
          382,
          "Copie os arquivos corretos, transfira para outro computador\ne remova o pen drive com segurança.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "18px",
            fontStyle: "900",
            color: "#ffd166",
            align: "center",
            lineSpacing: 5,
            wordWrap: { width: 700 },
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
    this.phase6SelectedIds = new Set();
    this.phase6CopiedIds = new Set();
    this.phase6IsCopied = false;
    this.phase6IsTransferred = false;
    this.phase6IsEjected = false;
    this.phase6IsBusy = false;
    this.phase6IsComplete = false;
    this.phase6CurrentStep = 1;
    this.phase6FileCards = new Map();
    this.phase6StepCards = [];
    this.setupRandomChallenge();

    this.clearStage();
    this.phase6Stage = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 28, "FASE 6: TRANSFERÊNCIA USB", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "14px",
          color: "#70b7ff",
        })
        .setOrigin(0.5),
    );

    this.phase6ScoreText = this.add
      .text(916, 28, "PONTOS: 100", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#8ef28b",
      })
      .setOrigin(1, 0.5);
    this.addToStage(this.phase6ScoreText);

    this.createObjectivePanel();
    this.createStepIndicator();
    this.createTransferLayout();
    this.createFileList();
    this.createStatusPanel();
    this.createControls();
    this.createFeedbackArea();
    this.createBackLink();
    this.updateCapacityBar();
    this.updateStep(1);

    this.phase6Stage.setAlpha(0);
    this.tweens.add({
      targets: this.phase6Stage,
      alpha: 1,
      duration: 280,
      ease: "Sine.out",
    });
  }

  setupRandomChallenge() {
    const previousSignature = this.phase6ChallengeSignature;

    for (let attempt = 0; attempt < 150; attempt += 1) {
      const fileCount = Phaser.Math.Between(
        PHASE6_MIN_FILES,
        PHASE6_MAX_FILES,
      );
      const importantCount = Phaser.Math.Between(3, 4);
      const generatedFiles = PHASE6_FILE_TEMPLATES.map((template) =>
        this.createFileFromTemplate(template),
      );
      const importantFiles = this.pickImportantFiles(
        generatedFiles,
        importantCount,
      );

      if (!importantFiles) {
        continue;
      }

      const usedIds = new Set(importantFiles.map((file) => file.id));
      const largeFile = this.shuffleItems(
        generatedFiles.filter((file) => PHASE6_LARGE_IDS.has(file.id)),
      )[0];
      const bulkyFile = this.shuffleItems(
        generatedFiles.filter((file) => PHASE6_BULKY_IDS.has(file.id)),
      )[0];
      const selectedFiles = [...importantFiles, largeFile, bulkyFile];

      usedIds.add(largeFile.id);
      usedIds.add(bulkyFile.id);

      const remainingFiles = this.shuffleItems(
        generatedFiles.filter((file) => !usedIds.has(file.id)),
      );

      while (selectedFiles.length < fileCount && remainingFiles.length > 0) {
        selectedFiles.push(remainingFiles.pop());
      }

      const importantIds = new Set(importantFiles.map((file) => file.id));
      const challengeFiles = this.shuffleItems(selectedFiles).map((file) => ({
        ...file,
        essential: importantIds.has(file.id),
      }));
      const signature = challengeFiles
        .map(
          (file) =>
            `${file.id}:${file.size}:${file.essential ? "I" : "N"}`,
        )
        .join("|");

      if (signature !== previousSignature) {
        this.phase6Files = challengeFiles;
        this.phase6ImportantFiles = challengeFiles.filter(
          (file) => file.essential,
        );
        this.phase6ChallengeSignature = signature;
        return;
      }
    }

    this.createFallbackChallenge();
  }

  createFileFromTemplate(template) {
    return {
      id: template.id,
      name: template.name,
      type: template.type,
      size: Phaser.Math.Between(template.minSize, template.maxSize),
      canBeImportant: template.canBeImportant,
    };
  }

  pickImportantFiles(files, importantCount) {
    const eligibleFiles = files.filter((file) => file.canBeImportant);

    for (let attempt = 0; attempt < 100; attempt += 1) {
      const candidates = this.shuffleItems(eligibleFiles).slice(
        0,
        importantCount,
      );
      const totalSize = candidates.reduce(
        (total, file) => total + file.size,
        0,
      );

      if (totalSize >= 280 && totalSize <= 680) {
        return candidates;
      }
    }

    return null;
  }

  createFallbackChallenge() {
    const files = [
      {
        id: "presentation",
        name: "apresentacao.pptx",
        type: "PPT",
        size: 90,
        essential: true,
      },
      {
        id: "source",
        name: "codigo-fonte.zip",
        type: "ZIP",
        size: 170,
        essential: true,
      },
      {
        id: "report",
        name: "relatorio.pdf",
        type: "PDF",
        size: 65,
        essential: true,
      },
      {
        id: "project",
        name: "projeto-final.zip",
        type: "ZIP",
        size: 240,
        essential: true,
      },
      {
        id: "video",
        name: "video.mp4",
        type: "MP4",
        size: 850,
        essential: false,
      },
      {
        id: "photos",
        name: "fotos.zip",
        type: "ZIP",
        size: 480,
        essential: false,
      },
      {
        id: "image",
        name: "imagem.png",
        type: "PNG",
        size: 30,
        essential: false,
      },
    ];

    this.phase6Files = this.shuffleItems(files);
    this.phase6ImportantFiles = this.phase6Files.filter(
      (file) => file.essential,
    );
    this.phase6ChallengeSignature = this.phase6Files
      .map((file) => `${file.id}:${file.size}`)
      .join("|");
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
    this.addToStage(
      createRoundedPanel(this, 480, 67, 760, 42, {
        fill: 0x101f35,
        stroke: 0xffd166,
        strokeAlpha: 0.38,
        radius: 11,
        shadow: false,
      }),
    );

    this.addToStage(
      this.add
        .text(
          480,
          67,
          "Objetivo: copie, transfira e ejete o pen drive com segurança.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "15px",
            fontStyle: "900",
            color: "#ffd166",
            align: "center",
          },
        )
        .setOrigin(0.5),
    );
  }

  createStepIndicator() {
    this.addToStage(
      createRoundedPanel(this, 480, 113, 840, 36, {
        fill: 0x091424,
        stroke: 0x70b7ff,
        strokeAlpha: 0.28,
        radius: 10,
        shadow: false,
        highlight: false,
      }),
    );

    const connector = this.add.graphics();
    connector.lineStyle(3, 0x34465d, 0.75);
    connector.lineBetween(250, 113, 330, 113);
    connector.lineBetween(440, 113, 520, 113);
    connector.lineBetween(630, 113, 710, 113);
    this.addToStage(connector);

    const positions = [195, 385, 575, 765];

    PHASE6_STEPS.forEach((label, index) => {
      const container = this.add.container(positions[index], 113);
      const background = this.add
        .rectangle(0, 0, 158, 25, 0x13283a, 1)
        .setStrokeStyle(2, 0x40566d, 0.7);
      const text = this.add
        .text(0, 0, `${index + 1} ${label}`, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "6px",
          color: "#8da2bd",
        })
        .setOrigin(0.5);

      container.add([background, text]);
      this.addToStage(container);
      this.phase6StepCards.push({ container, background, text });
    });
  }

  createTransferLayout() {
    this.addToStage(
      createRoundedPanel(this, 480, 205, 850, 136, {
        fill: 0x0b1729,
        stroke: 0x70b7ff,
        strokeAlpha: 0.28,
        radius: 16,
      }),
    );

    this.createComputer(170, 198, "COMPUTADOR ORIGEM", 0x62e7f2, true);
    this.createFlashDrive(480, 198);
    this.createComputer(790, 198, "COMPUTADOR DESTINO", 0x8ef28b, false);
    this.phase6ArrowToFlash = this.createFlowArrow(350, 198);
    this.phase6ArrowToDestination = this.createFlowArrow(640, 198);

    this.addToStage(
      this.add
        .text(
          480,
          257,
          "Dica: remover durante a gravação pode corromper os dados.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "12px",
            fontStyle: "800",
            color: "#c7d7e8",
            align: "center",
          },
        )
        .setOrigin(0.5),
    );
  }

  createComputer(x, y, title, accent, isSource) {
    const container = this.add.container(x, y);
    const graphics = this.add.graphics();

    graphics.fillStyle(0x101f35, 1);
    graphics.fillRoundedRect(-78, -42, 156, 78, 10);
    graphics.lineStyle(2, accent, 0.58);
    graphics.strokeRoundedRect(-78, -42, 156, 78, 10);
    graphics.fillStyle(0x07101f, 1);
    graphics.fillRoundedRect(-64, -28, 128, 48, 6);
    graphics.fillStyle(accent, 0.14);
    graphics.fillRoundedRect(-53, -17, isSource ? 72 : 42, 7, 2);
    graphics.fillRoundedRect(-53, -3, isSource ? 96 : 74, 7, 2);
    graphics.fillRoundedRect(-53, 11, isSource ? 58 : 90, 5, 2);
    graphics.fillStyle(0x263a52, 1);
    graphics.fillRoundedRect(-28, 36, 56, 7, 3);
    graphics.fillRoundedRect(-48, 43, 96, 6, 3);
    container.add(graphics);

    const titleText = this.add
      .text(0, -53, title, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: this.toCssColor(accent),
      })
      .setOrigin(0.5);
    container.add(titleText);

    const statusText = this.add
      .text(0, -2, isSource ? "ARQUIVOS\nPRONTOS" : "AGUARDANDO", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: isSource ? "#62e7f2" : "#8da2bd",
        align: "center",
        lineSpacing: 4,
      })
      .setOrigin(0.5);
    container.add(statusText);

    this.addToStage(container);

    if (isSource) {
      this.phase6SourceContainer = container;
      this.phase6SourceStatusText = statusText;
    } else {
      this.phase6DestinationContainer = container;
      this.phase6DestinationStatusText = statusText;
    }
  }

  createFlashDrive(x, y) {
    this.phase6FlashContainer = this.add.container(x, y);
    this.addToStage(this.phase6FlashContainer);

    const drive = this.add.graphics();
    drive.fillStyle(0xb7c9d6, 1);
    drive.fillRoundedRect(-67, -18, 32, 36, 5);
    drive.fillStyle(0x07101f, 0.75);
    drive.fillRect(-59, -10, 8, 8);
    drive.fillRect(-46, -10, 8, 8);
    drive.fillStyle(0x13283a, 1);
    drive.fillRoundedRect(-39, -30, 106, 60, 13);
    drive.lineStyle(3, 0x70b7ff, 0.86);
    drive.strokeRoundedRect(-39, -30, 106, 60, 13);
    drive.fillStyle(0x17344f, 1);
    drive.fillRoundedRect(-25, -19, 78, 38, 8);
    drive.fillStyle(0x8ef28b, 0.88);
    drive.fillCircle(35, 0, 7);
    drive.fillStyle(0x62e7f2, 0.22);
    drive.fillRoundedRect(-14, -10, 30, 7, 3);
    drive.fillRoundedRect(-14, 4, 38, 7, 3);
    this.phase6FlashContainer.add(drive);

    const label = this.add
      .text(0, -48, "PEN DRIVE 1 GB", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "7px",
        color: "#70b7ff",
      })
      .setOrigin(0.5);
    this.phase6FlashContainer.add(label);

    this.phase6FlashStatusText = this.add
      .text(13, 44, "VAZIO", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#8da2bd",
      })
      .setOrigin(0.5);
    this.phase6FlashContainer.add(this.phase6FlashStatusText);

    const unsafeHitArea = this.add
      .rectangle(0, 0, 150, 92, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true });
    this.phase6FlashContainer.add(unsafeHitArea);
    unsafeHitArea.on("pointerdown", () => this.removeIncorrectly());

    this.phase6FlashGlow = this.add
      .rectangle(x, y, 150, 82, 0x70b7ff, 0)
      .setStrokeStyle(3, 0x70b7ff, 0);
    this.addToStage(this.phase6FlashGlow);
  }

  createFlowArrow(x, y) {
    const container = this.add.container(x, y);
    const line = this.add.rectangle(-8, 0, 92, 5, 0x34465d, 0.72);
    const head = this.add.triangle(
      51,
      0,
      -12,
      -11,
      12,
      0,
      -12,
      11,
      0x34465d,
      0.72,
    );

    container.add([line, head]);
    this.addToStage(container);
    return { container, line, head };
  }

  createFileList() {
    this.addToStage(
      createRoundedPanel(this, 310, 360, 560, 156, {
        fill: 0x0b1729,
        stroke: 0x62e7f2,
        strokeAlpha: 0.3,
        radius: 14,
      }),
    );

    this.addToStage(
      this.add
        .text(310, 296, "ARQUIVOS DISPONÍVEIS", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#62e7f2",
        })
        .setOrigin(0.5),
    );

    const columns = [175, 445];
    const rows = [322, 357, 392, 427];

    this.phase6Files.forEach((file, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      this.createFileCard(file, columns[column], rows[row]);
    });
  }

  createFileCard(file, x, y) {
    const container = this.add.container(x, y);
    const background = this.add
      .rectangle(0, 0, 250, 30, 0x13283a, 1)
      .setStrokeStyle(2, 0x40566d, 0.78)
      .setInteractive({ useHandCursor: true });
    const icon = this.add
      .rectangle(-108, 0, 25, 23, this.getFileColor(file.type), 0.94)
      .setStrokeStyle(1, 0xf1f7ff, 0.34);
    const typeText = this.add
      .text(-108, 0, file.type, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: file.type.length > 3 ? "4px" : "5px",
        color: "#07101f",
      })
      .setOrigin(0.5);
    const nameText = this.add
      .text(-91, -6, file.name, {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "10px",
        fontStyle: "900",
        color: "#f1f7ff",
      })
      .setOrigin(0, 0.5);
    const sizeText = this.add
      .text(-91, 8, `${file.size} MB`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "5px",
        color: "#9fb1c6",
      })
      .setOrigin(0, 0.5);
    const importantTag = this.add
      .text(116, -7, "IMPORTANTE", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "4px",
        color: "#ffd166",
        backgroundColor: "#493d1c",
        padding: { left: 3, right: 3, top: 2, bottom: 2 },
      })
      .setOrigin(1, 0.5)
      .setVisible(file.essential);
    const selectedMark = this.add
      .text(116, 8, "OK", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "5px",
        color: "#8ef28b",
      })
      .setOrigin(1, 0.5)
      .setVisible(false);

    container.add([
      background,
      icon,
      typeText,
      nameText,
      sizeText,
      importantTag,
      selectedMark,
    ]);
    this.addToStage(container);

    background.on("pointerover", () => {
      if (!this.phase6IsCopied && !this.phase6IsBusy) {
        background.setFillStyle(
          this.phase6SelectedIds.has(file.id) ? 0x285b68 : 0x1c4054,
        );
      }
    });
    background.on("pointerout", () => {
      background.setFillStyle(
        this.phase6SelectedIds.has(file.id) ? 0x245064 : 0x13283a,
      );
    });
    background.on("pointerdown", () => this.toggleFileSelection(file.id));

    this.phase6FileCards.set(file.id, {
      container,
      background,
      selectedMark,
    });
  }

  createStatusPanel() {
    this.addToStage(
      createRoundedPanel(this, 760, 360, 300, 156, {
        fill: 0x0b1729,
        stroke: 0x70b7ff,
        strokeAlpha: 0.32,
        radius: 14,
      }),
    );

    this.addToStage(
      this.add
        .text(760, 296, "CAPACIDADE E PROGRESSO", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: "#70b7ff",
        })
        .setOrigin(0.5),
    );

    this.addToStage(
      this.add
        .text(760, 316, "PEN DRIVE: 1000 MB", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "6px",
          color: "#ffd166",
        })
        .setOrigin(0.5),
    );

    this.phase6CapacityBack = this.add
      .rectangle(640, 338, 240, 18, 0x07101f, 1)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, 0x40566d, 0.9);
    this.phase6CapacityFill = this.add
      .rectangle(643, 338, 234, 12, 0x8ef28b, 1)
      .setOrigin(0, 0.5)
      .setScale(0, 1);
    this.phase6CapacityText = this.add
      .text(760, 356, "Usado: 0 MB / 1000 MB", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "11px",
        fontStyle: "900",
        color: "#dce8f5",
      })
      .setOrigin(0.5);
    this.addToStage([
      this.phase6CapacityBack,
      this.phase6CapacityFill,
      this.phase6CapacityText,
    ]);

    this.phase6ProgressLabel = this.add
      .text(760, 375, "PROGRESSO: AGUARDANDO", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "5px",
        color: "#8da2bd",
      })
      .setOrigin(0.5);
    this.phase6ProgressBack = this.add
      .rectangle(640, 393, 240, 15, 0x07101f, 1)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x40566d, 0.9);
    this.phase6ProgressFill = this.add
      .rectangle(642, 393, 236, 10, 0x62e7f2, 1)
      .setOrigin(0, 0.5)
      .setScale(0, 1);
    this.addToStage([
      this.phase6ProgressLabel,
      this.phase6ProgressBack,
      this.phase6ProgressFill,
    ]);

    this.phase6SelectionSummary = this.add
      .text(760, 421, "", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "11px",
        fontStyle: "900",
        color: "#c7d7e8",
        align: "center",
      })
      .setOrigin(0.5);
    this.addToStage(this.phase6SelectionSummary);
  }

  createControls() {
    this.phase6ClearButton = this.createButton(
      125,
      466,
      170,
      "LIMPAR SELEÇÃO",
      () => this.clearSelection(),
      {
        border: 0xffd166,
        hover: 0x5c4b22,
        fontSize: "7px",
        height: 44,
      },
    );
    this.phase6CopyButton = this.createButton(
      335,
      466,
      220,
      "COPIAR PARA O PEN DRIVE",
      () => this.copyToFlashDrive(),
      {
        border: 0x70b7ff,
        hover: 0x1c5264,
        fontSize: "7px",
        height: 44,
      },
    );
    this.phase6TransferButton = this.createButton(
      585,
      466,
      240,
      "TRANSFERIR AO DESTINO",
      () => this.transferToDestination(),
      {
        border: 0x8ef28b,
        hover: 0x246a69,
        fontSize: "7px",
        height: 44,
      },
    );
    this.phase6EjectButton = this.createButton(
      825,
      466,
      220,
      "EJETAR COM SEGURANÇA",
      () => this.ejectSafely(),
      {
        border: 0xffd166,
        hover: 0x5c4b22,
        fontSize: "7px",
        height: 44,
      },
    );
  }

  createFeedbackArea() {
    this.addToStage(
      createRoundedPanel(this, 480, 513, 850, 32, {
        fill: 0x091424,
        stroke: 0x62e7f2,
        strokeAlpha: 0.24,
        radius: 10,
        shadow: false,
        highlight: false,
      }),
    );

    this.phase6MessageText = this.add
      .text(
        480,
        513,
        `Etapa 1: selecione os ${this.phase6ImportantFiles.length} arquivos importantes.`,
        {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "13px",
          fontStyle: "800",
          color: "#8da2bd",
          align: "center",
          wordWrap: { width: 800 },
        },
      )
      .setOrigin(0.5);
    this.addToStage(this.phase6MessageText);
  }

  toggleFileSelection(fileId) {
    if (this.phase6IsBusy) {
      this.showFeedback(
        "Aguarde a operação terminar antes de alterar os arquivos.",
        "warning",
      );
      return;
    }

    if (this.phase6IsCopied) {
      this.showFeedback(
        "Os arquivos já foram copiados para o pen drive.",
        "neutral",
      );
      return;
    }

    const file = this.getFileById(fileId);
    const card = this.phase6FileCards.get(fileId);
    const wasOverCapacity = this.isOverCapacity();

    if (this.phase6SelectedIds.has(fileId)) {
      this.phase6SelectedIds.delete(fileId);
      this.showFeedback("Arquivo removido.", "neutral");
    } else {
      this.phase6SelectedIds.add(fileId);
      this.showFeedback("Arquivo selecionado.", "success");
    }

    const isSelected = this.phase6SelectedIds.has(fileId);
    this.updateFileCard(card, isSelected);
    this.updateCapacityBar();

    if (!wasOverCapacity && this.isOverCapacity()) {
      this.updateScore(-PHASE6_CAPACITY_PENALTY);
      this.showFeedback(
        file.size > PHASE6_CAPACITY_MB
          ? "Esse arquivo não cabe no pen drive."
          : "Capacidade excedida. Remova algum arquivo.",
        "error",
      );
      this.shakeCapacityBar();
    }
  }

  updateFileCard(card, isSelected) {
    card.selectedMark.setVisible(isSelected);
    card.background
      .setFillStyle(isSelected ? 0x245064 : 0x13283a)
      .setStrokeStyle(
        isSelected ? 3 : 2,
        isSelected ? 0x8ef28b : 0x40566d,
        isSelected ? 1 : 0.78,
      );

    this.tweens.add({
      targets: card.container,
      scale: isSelected ? 1.025 : 1,
      duration: 120,
      ease: "Back.out",
    });
  }

  clearSelection() {
    if (this.phase6IsBusy) {
      this.showFeedback("Aguarde a operação terminar.", "warning");
      return;
    }

    if (this.phase6IsCopied) {
      this.showFeedback(
        "A seleção está bloqueada porque a cópia já terminou.",
        "neutral",
      );
      return;
    }

    if (this.phase6SelectedIds.size === 0) {
      return;
    }

    this.phase6SelectedIds.clear();
    this.phase6FileCards.forEach((card) => this.updateFileCard(card, false));
    this.updateCapacityBar();
    this.showFeedback("Seleção limpa.", "warning");
  }

  updateCapacityBar() {
    const selectedSize = this.getSelectedSize();
    const ratio = selectedSize / PHASE6_CAPACITY_MB;
    const displayRatio = Phaser.Math.Clamp(ratio, 0, 1);
    const overCapacity = this.isOverCapacity();
    const nearCapacity = ratio >= 0.8;
    const color = overCapacity
      ? 0xff7b68
      : nearCapacity
        ? 0xffd166
        : 0x8ef28b;

    this.tweens.killTweensOf(this.phase6CapacityFill);
    this.phase6CapacityFill.setFillStyle(color, 1);
    this.tweens.add({
      targets: this.phase6CapacityFill,
      scaleX: displayRatio,
      duration: 190,
      ease: "Sine.out",
    });

    this.phase6CapacityText
      .setText(`Usado: ${selectedSize} MB / ${PHASE6_CAPACITY_MB} MB`)
      .setColor(
        overCapacity ? "#ff9b78" : nearCapacity ? "#ffd166" : "#dce8f5",
      );

    const importantSelected = this.phase6ImportantFiles.filter((file) =>
      this.phase6SelectedIds.has(file.id),
    ).length;
    this.phase6SelectionSummary.setText(
      `Selecionados: ${this.phase6SelectedIds.size}  |  Importantes: ${importantSelected}/${this.phase6ImportantFiles.length}`,
    );
  }

  copyToFlashDrive() {
    if (this.phase6IsEjected || this.phase6IsComplete) {
      return;
    }

    if (this.phase6IsBusy) {
      this.showFeedback("A operação atual ainda não terminou.", "warning");
      return;
    }

    if (this.phase6IsCopied) {
      this.showFeedback("Os arquivos já estão no pen drive.", "neutral");
      return;
    }

    if (this.phase6SelectedIds.size === 0) {
      this.showFailure("Selecione os arquivos importantes antes de copiar.");
      return;
    }

    if (this.isOverCapacity()) {
      this.showFailure("O pen drive não tem espaço para essa seleção.");
      this.shakeCapacityBar();
      return;
    }

    const missingFiles = this.getMissingImportantFiles();
    if (missingFiles.length > 0) {
      this.showFailure("Alguns arquivos importantes ficaram de fora.");
      this.animateMissingImportantFiles(missingFiles);
      return;
    }

    this.phase6IsBusy = true;
    this.updateStep(2);
    this.showFeedback("Copiando arquivos para a memória flash...", "neutral");
    this.createTransferPackets(255, 198, 420, 198, 0x70b7ff);
    this.animateProgress("COPIANDO", 0x70b7ff, () => {
      this.phase6IsBusy = false;
      this.phase6IsCopied = true;
      this.phase6CopiedIds = new Set(this.phase6SelectedIds);
      this.phase6FlashStatusText.setText("ARQUIVOS\nCOPIADOS").setColor("#70b7ff");
      this.phase6ProgressLabel
        .setText("PROGRESSO: CÓPIA CONCLUÍDA")
        .setColor("#70b7ff");
      this.showFeedback("Arquivos copiados para o pen drive.", "success");
      this.pulseFlashDrive(0x70b7ff);
      this.updateStep(3);
    });
  }

  transferToDestination() {
    if (this.phase6IsEjected || this.phase6IsComplete) {
      return;
    }

    if (this.phase6IsBusy) {
      this.showFeedback("A operação atual ainda não terminou.", "warning");
      return;
    }

    if (!this.phase6IsCopied) {
      this.showFailure("Primeiro copie os arquivos para o pen drive.");
      return;
    }

    if (this.phase6IsTransferred) {
      this.showFeedback(
        "Os arquivos já estão no computador destino.",
        "neutral",
      );
      return;
    }

    this.phase6IsBusy = true;
    this.updateStep(3);
    this.showFeedback(
      "Transferindo arquivos para o computador destino...",
      "neutral",
    );
    this.createTransferPackets(545, 198, 705, 198, 0x8ef28b);
    this.animateProgress("TRANSFERINDO", 0x8ef28b, () => {
      this.phase6IsBusy = false;
      this.phase6IsTransferred = true;
      this.phase6DestinationStatusText
        .setText("ARQUIVOS\nRECEBIDOS")
        .setColor("#8ef28b");
      this.phase6ProgressLabel
        .setText("PROGRESSO: TRANSFERÊNCIA CONCLUÍDA")
        .setColor("#8ef28b");
      this.showFeedback(
        "Arquivos transferidos para o computador destino.",
        "success",
      );
      this.pulseFlashDrive(0x8ef28b);
      this.updateStep(4);
    });
  }

  ejectSafely() {
    if (this.phase6IsEjected || this.phase6IsComplete) {
      return;
    }

    if (this.phase6IsBusy) {
      this.showFailure(
        "A gravação ainda não terminou. Remover agora pode corromper os arquivos.",
      );
      return;
    }

    if (!this.phase6IsCopied) {
      this.showFailure("Primeiro copie os arquivos para o pen drive.");
      return;
    }

    if (!this.phase6IsTransferred) {
      this.showFailure(
        "Transfira os arquivos ao destino antes de ejetar.",
      );
      return;
    }

    this.phase6IsEjected = true;
    this.phase6IsComplete = true;
    this.updateStep(4);
    this.disableChallengeControls();
    this.phase6FlashStatusText
      .setText("EJETADO\nCOM SEGURANÇA")
      .setColor("#ffd166");
    this.phase6ProgressLabel
      .setText("PROGRESSO: DISPOSITIVO SEGURO")
      .setColor("#ffd166");
    this.showFeedback("Pen drive ejetado com segurança!", "success");
    this.pulseFlashDrive(0xffd166);

    this.time.delayedCall(1100, () => this.showConclusion());
  }

  removeIncorrectly() {
    if (this.phase6IsEjected || this.phase6IsComplete) {
      return;
    }

    if (this.phase6IsBusy) {
      this.showFailure(
        "A gravação ainda não terminou. Remover agora pode corromper os arquivos.",
      );
      return;
    }

    this.showFailure(
      "Não puxe o pen drive: use a ejeção segura para evitar corrupção.",
    );
  }

  animateProgress(label, color, onComplete) {
    this.phase6ProgressFill
      .setFillStyle(color, 1)
      .setScale(0, 1);
    this.phase6ProgressLabel
      .setText(`PROGRESSO: ${label} 0%`)
      .setColor(this.toCssColor(color));

    this.tweens.add({
      targets: this.phase6ProgressFill,
      scaleX: 1,
      duration: 1050,
      ease: "Sine.inOut",
      onUpdate: () => {
        const percent = Math.round(this.phase6ProgressFill.scaleX * 100);
        this.phase6ProgressLabel.setText(
          `PROGRESSO: ${label} ${percent}%`,
        );
      },
      onComplete,
    });
  }

  createTransferPackets(fromX, fromY, toX, toY, color) {
    for (let index = 0; index < 7; index += 1) {
      const packet = this.add
        .rectangle(fromX, fromY, 8, 8, color, 0.92)
        .setRotation(Math.PI / 4)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.addToStage(packet);

      this.tweens.add({
        targets: packet,
        x: toX,
        y: toY + Phaser.Math.Between(-10, 10),
        alpha: 0,
        scale: 0.65,
        duration: 620,
        delay: index * 105,
        ease: "Sine.inOut",
        onComplete: () => packet.destroy(),
      });
    }
  }

  updateStep(step) {
    this.phase6CurrentStep = step;

    this.phase6StepCards.forEach((card, index) => {
      const stepNumber = index + 1;
      const completed = stepNumber < step;
      const current = stepNumber === step;
      const fill = completed ? 0x173d35 : current ? 0x17344f : 0x13283a;
      const border = completed
        ? 0x8ef28b
        : current
          ? 0x70b7ff
          : 0x40566d;
      const textColor = completed
        ? "#8ef28b"
        : current
          ? "#f1f7ff"
          : "#6f849d";

      card.background
        .setFillStyle(fill, 1)
        .setStrokeStyle(current ? 3 : 2, border, current || completed ? 1 : 0.7);
      card.text.setColor(textColor);
    });

    this.updateFlowVisual();
    this.updateControlEmphasis();
  }

  updateFlowVisual() {
    const leftColor =
      this.phase6CurrentStep <= 2 ? 0x70b7ff : 0x8ef28b;
    const rightColor =
      this.phase6CurrentStep < 3 ? 0x40566d : 0x8ef28b;

    this.setArrowColor(
      this.phase6ArrowToFlash,
      leftColor,
      this.phase6CurrentStep <= 2 ? 1 : 0.75,
    );
    this.setArrowColor(
      this.phase6ArrowToDestination,
      rightColor,
      this.phase6CurrentStep >= 3 ? 1 : 0.55,
    );

    this.tweens.killTweensOf([
      this.phase6ArrowToFlash.container,
      this.phase6ArrowToDestination.container,
    ]);
    this.phase6ArrowToFlash.container.setScale(1);
    this.phase6ArrowToDestination.container.setScale(1);

    const activeArrow =
      this.phase6CurrentStep <= 2
        ? this.phase6ArrowToFlash.container
        : this.phase6CurrentStep === 3
          ? this.phase6ArrowToDestination.container
          : null;

    if (activeArrow) {
      this.tweens.add({
        targets: activeArrow,
        scaleX: 1.07,
        duration: 420,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
    }
  }

  updateControlEmphasis() {
    const buttons = [
      { button: this.phase6ClearButton, active: this.phase6CurrentStep === 1 },
      { button: this.phase6CopyButton, active: this.phase6CurrentStep <= 2 },
      { button: this.phase6TransferButton, active: this.phase6CurrentStep === 3 },
      { button: this.phase6EjectButton, active: this.phase6CurrentStep === 4 },
    ];

    buttons.forEach(({ button, active }) => {
      button.setAlpha(this.phase6IsBusy ? 0.72 : active ? 1 : 0.78);
    });
  }

  setArrowColor(arrow, color, alpha) {
    arrow.line.setFillStyle(color, alpha);
    arrow.head.setFillStyle(color, alpha);
  }

  getSelectedSize() {
    return this.phase6Files.reduce((total, file) => {
      return this.phase6SelectedIds.has(file.id) ? total + file.size : total;
    }, 0);
  }

  getMissingImportantFiles() {
    return this.phase6ImportantFiles.filter(
      (file) => !this.phase6SelectedIds.has(file.id),
    );
  }

  getFileById(fileId) {
    return this.phase6Files.find((file) => file.id === fileId);
  }

  isOverCapacity() {
    return this.getSelectedSize() > PHASE6_CAPACITY_MB;
  }

  animateMissingImportantFiles(files) {
    files.forEach((file) => {
      const card = this.phase6FileCards.get(file.id);
      card.background.setStrokeStyle(3, 0xff7b68, 1);
      this.tweens.add({
        targets: card.container,
        x: "+=5",
        duration: 55,
        yoyo: true,
        repeat: 2,
        ease: "Sine.inOut",
        onComplete: () =>
          card.background.setStrokeStyle(2, 0x40566d, 0.78),
      });
    });
  }

  shakeCapacityBar() {
    this.phase6CapacityBack.setX(640);
    this.phase6CapacityFill.setX(643);
    this.tweens.add({
      targets: [this.phase6CapacityBack, this.phase6CapacityFill],
      x: "+=7",
      duration: 55,
      yoyo: true,
      repeat: 3,
      ease: "Sine.inOut",
      onComplete: () => {
        this.phase6CapacityBack.setX(640);
        this.phase6CapacityFill.setX(643);
      },
    });
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

    this.phase6MessageText
      .setText(message)
      .setColor(colors[type] ?? colors.neutral);
  }

  showFailure(message) {
    this.updateScore(-PHASE6_ERROR_PENALTY);
    this.showFeedback(message, "error");
    this.cameras.main.shake(115, 0.0018);
  }

  pulseFlashDrive(color) {
    this.phase6FlashGlow
      .setFillStyle(color, 0.09)
      .setStrokeStyle(3, color, 0.88)
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

  showConclusion() {
    completePhase(6);
    savePhaseScore(6, this.phase6Score);

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

    this.addToStage(
      createRoundedPanel(this, 480, 301, 770, 220, {
        stroke: 0x70b7ff,
        strokeAlpha: 0.42,
        radius: 18,
      }),
    );

    this.addToStage(
      this.add
        .text(
          480,
          280,
          "Você aprendeu que o pen drive usa memória flash para transportar\narquivos sem partes móveis. Também viu que é importante\nejetar com segurança para evitar corrupção dos dados.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "18px",
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

    this.phase6Stage.setAlpha(0).setScale(0.97);
    this.tweens.add({
      targets: this.phase6Stage,
      alpha: 1,
      scale: 1,
      duration: 350,
      ease: "Back.out",
    });
  }

  getFileColor(type) {
    const colors = {
      PPT: 0xff8f70,
      DOC: 0x70b7ff,
      ZIP: 0xc49cff,
      MP4: 0xff7b68,
      MP3: 0x8ef28b,
      EXE: 0xff8f70,
      PDF: 0xffd166,
      XLS: 0x8ef28b,
      PNG: 0x62e7f2,
    };

    return colors[type] ?? 0x8da2bd;
  }

  toCssColor(color) {
    return `#${color.toString(16).padStart(6, "0")}`;
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

  disableChallengeControls() {
    [
      this.phase6ClearButton,
      this.phase6CopyButton,
      this.phase6TransferButton,
      this.phase6EjectButton,
    ].forEach((button) => button.background.disableInteractive());

    this.phase6FileCards.forEach(({ background }) =>
      background.disableInteractive(),
    );
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
      height: options.height ?? 56,
      addToStage: (button) => this.addToStage(button),
    });
  }

  createBackLink() {
    const text = this.add
      .text(38, 28, "< LINHA DO TEMPO", {
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
    this.tweens.killAll();

    if (this.phase6Stage) {
      this.phase6Stage.destroy(true);
      this.phase6Stage = null;
    }
  }
}
