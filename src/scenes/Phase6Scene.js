import {
  completePhase,
  getStartingScoreForPhase,
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
const PHASE6_FILE_COUNT = 5;
const PHASE6_IMPORTANT_FILES = 3;

const PHASE6_OBJECTIVES = [
  "Objetivo: escolha os arquivos importantes.",
  "Objetivo: copie os arquivos para a memoria flash.",
  "Objetivo: leve os arquivos ao computador destino.",
  "Objetivo: remova o pen drive com seguranca.",
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
        .text(480, 48, "FASE 6: PEN DRIVE / MEMORIA FLASH", {
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
          "O pen drive usa memoria flash para guardar dados sem partes moveis.\nNesta fase voce vai transferir arquivos em passos simples.",
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
        .text(480, 382, "Escolha, copie, transfira e ejete com seguranca.", {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "18px",
          fontStyle: "900",
          color: "#ffd166",
          align: "center",
        })
        .setOrigin(0.5),
    );

    this.createButton(
      480,
      454,
      290,
      "COMECAR DESAFIO",
      () => this.startChallenge(),
      { border: 0x8ef28b, hover: 0x246a69 },
    );
    this.createBackLink();
  }

  startChallenge() {
    this.phase6Score = getStartingScoreForPhase(6, PHASE6_STARTING_SCORE);
    this.phase6MaxScore = this.phase6Score + PHASE6_STARTING_SCORE;
    this.phase6SelectedIds = new Set();
    this.phase6CopiedIds = new Set();
    this.phase6IsCopied = false;
    this.phase6IsTransferred = false;
    this.phase6IsEjected = false;
    this.phase6IsBusy = false;
    this.phase6IsComplete = false;
    this.phase6CurrentStep = 1;
    this.phase6FileCards = new Map();
    this.setupRandomChallenge();

    this.clearStage();
    this.phase6Stage = this.add.container(0, 0);
    this.phase6Body = this.add.container(0, 0);

    this.createChallengeHeader();
    this.addToStage(this.phase6Body);
    this.createBackLink();
    this.updateStep(1);

    this.phase6Stage.setAlpha(0);
    this.tweens.add({
      targets: this.phase6Stage,
      alpha: 1,
      duration: 280,
      ease: "Sine.out",
    });
  }

  createChallengeHeader() {
    this.addToStage(
      this.add
        .text(480, 28, "FASE 6: PEN DRIVE", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "14px",
          color: "#70b7ff",
        })
        .setOrigin(0.5),
    );

    this.phase6ScoreText = this.add
      .text(916, 28, `PONTOS: ${this.phase6Score}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#8ef28b",
      })
      .setOrigin(1, 0.5);
    this.addToStage(this.phase6ScoreText);

    this.phase6StepNumberText = this.add
      .text(480, 66, "Etapa 1 de 4", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#ffd166",
      })
      .setOrigin(0.5);
    this.addToStage(this.phase6StepNumberText);

    this.phase6ObjectiveText = this.add
      .text(480, 92, PHASE6_OBJECTIVES[0], {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "16px",
        fontStyle: "900",
        color: "#dce8f5",
        align: "center",
      })
      .setOrigin(0.5);
    this.addToStage(this.phase6ObjectiveText);

    this.phase6MessageText = this.add
      .text(480, 506, "Selecione os arquivos importantes.", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "14px",
        fontStyle: "900",
        color: "#8da2bd",
        align: "center",
        wordWrap: { width: 820 },
      })
      .setOrigin(0.5);
    this.addToStage(this.phase6MessageText);
  }

  setupRandomChallenge() {
    const previousSignature = this.phase6ChallengeSignature;

    for (let attempt = 0; attempt < 150; attempt += 1) {
      const generatedFiles = PHASE6_FILE_TEMPLATES.map((template) =>
        this.createFileFromTemplate(template),
      );
      const importantFiles = this.pickImportantFiles(
        generatedFiles,
        PHASE6_IMPORTANT_FILES,
      );

      if (!importantFiles) {
        continue;
      }

      const usedIds = new Set(importantFiles.map((file) => file.id));
      const selectedFiles = [...importantFiles];
      const extraCandidates = this.shuffleItems([
        ...generatedFiles.filter((file) => PHASE6_LARGE_IDS.has(file.id)),
        ...generatedFiles.filter((file) => PHASE6_BULKY_IDS.has(file.id)),
        ...generatedFiles.filter((file) => !file.canBeImportant),
      ]);

      for (const file of extraCandidates) {
        if (selectedFiles.length >= PHASE6_FILE_COUNT) {
          break;
        }

        if (!usedIds.has(file.id)) {
          selectedFiles.push(file);
          usedIds.add(file.id);
        }
      }

      const remainingFiles = this.shuffleItems(
        generatedFiles.filter((file) => !usedIds.has(file.id)),
      );

      while (selectedFiles.length < PHASE6_FILE_COUNT && remainingFiles.length > 0) {
        selectedFiles.push(remainingFiles.pop());
      }

      const importantIds = new Set(importantFiles.map((file) => file.id));
      const challengeFiles = this.shuffleItems(selectedFiles).map((file) => ({
        ...file,
        essential: importantIds.has(file.id),
      }));
      const signature = challengeFiles
        .map((file) => `${file.id}:${file.size}:${file.essential ? "I" : "N"}`)
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
      const totalSize = candidates.reduce((total, file) => total + file.size, 0);

      if (totalSize >= 220 && totalSize <= 680) {
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
    ];

    this.phase6Files = this.shuffleItems(files);
    this.phase6ImportantFiles = this.phase6Files.filter((file) => file.essential);
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

  updateStep(step) {
    this.phase6CurrentStep = step;
    this.phase6StepNumberText.setText(`Etapa ${step} de 4`);
    this.phase6ObjectiveText.setText(PHASE6_OBJECTIVES[step - 1]);
    this.renderCurrentStep();
  }

  renderCurrentStep() {
    this.tweens.killTweensOf(this.phase6Body);
    this.phase6Body.removeAll(true);
    this.phase6FileCards.clear();
    this.phase6CapacityBack = null;
    this.phase6CapacityFill = null;
    this.phase6CapacityText = null;
    this.phase6SelectionSummary = null;
    this.phase6ProgressLabel = null;
    this.phase6ProgressFill = null;
    this.phase6FlashContainer = null;
    this.phase6FlashGlow = null;

    if (this.phase6CurrentStep === 1) {
      this.renderSelectionStep();
    } else if (this.phase6CurrentStep === 2) {
      this.renderCopyStep();
    } else if (this.phase6CurrentStep === 3) {
      this.renderTransferStep();
    } else {
      this.renderEjectStep();
    }

    this.phase6Body.setAlpha(0);
    this.tweens.add({
      targets: this.phase6Body,
      alpha: 1,
      duration: 180,
      ease: "Sine.out",
    });
  }

  renderSelectionStep() {
    this.addToBody(
      createRoundedPanel(this, 480, 298, 760, 318, {
        fill: 0x0b1729,
        stroke: 0x62e7f2,
        strokeAlpha: 0.3,
        radius: 16,
      }),
    );

    this.addToBody(
      this.add
        .text(300, 166, "ARQUIVOS", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "9px",
          color: "#62e7f2",
        })
        .setOrigin(0.5),
    );

    const rows = [205, 246, 287, 328, 369];
    this.phase6Files.forEach((file, index) => {
      this.createFileRow(file, 300, rows[index]);
    });

    this.createCapacityPanel(698, 286);
    this.phase6CopyButton = this.createBodyButton(
      480,
      444,
      288,
      "COPIAR PARA O PEN DRIVE",
      () => this.copyToFlashDrive(),
      {
        border: 0x70b7ff,
        hover: 0x1c5264,
        fontSize: "7px",
        height: 44,
      },
    );
    this.updateCapacityBar();
  }

  renderCopyStep() {
    this.addToBody(
      createRoundedPanel(this, 480, 302, 620, 270, {
        fill: 0x0b1729,
        stroke: 0x70b7ff,
        strokeAlpha: 0.34,
        radius: 16,
      }),
    );

    this.createMiniComputer(302, 267, "ORIGEM", 0x62e7f2, "ENVIANDO");
    this.createFlowArrow(402, 267, 0x70b7ff);
    this.createFlashDrive(575, 267, "COPIANDO");
    this.createProgressBar(480, 372, "Copiando arquivos para o pen drive...");
  }

  renderTransferStep() {
    this.addToBody(
      createRoundedPanel(this, 480, 302, 660, 276, {
        fill: 0x0b1729,
        stroke: 0x8ef28b,
        strokeAlpha: 0.34,
        radius: 16,
      }),
    );

    this.createFlashDrive(344, 260, "PRONTO");
    this.createFlowArrow(468, 260, 0x8ef28b);
    this.createMiniComputer(650, 260, "DESTINO", 0x8ef28b, "AGUARDANDO");
    this.createProgressBar(
      480,
      356,
      this.phase6IsTransferred ? "Arquivos transferidos." : "Pronto para transferir.",
    );

    this.phase6TransferButton = this.createBodyButton(
      480,
      436,
      300,
      "TRANSFERIR PARA O DESTINO",
      () => this.transferToDestination(),
      {
        border: 0x8ef28b,
        hover: 0x246a69,
        fontSize: "7px",
        height: 44,
      },
    );
  }

  renderEjectStep() {
    this.addToBody(
      createRoundedPanel(this, 480, 302, 560, 276, {
        fill: 0x0b1729,
        stroke: 0xffd166,
        strokeAlpha: 0.36,
        radius: 16,
      }),
    );

    this.createFlashDrive(480, 238, "TRANSFERIDO");

    this.addToBody(
      this.add
        .text(
          480,
          338,
          "A ejecao segura avisa ao sistema que a gravacao terminou\ne evita corromper arquivos.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "16px",
            fontStyle: "800",
            color: "#dce8f5",
            align: "center",
            lineSpacing: 5,
            wordWrap: { width: 480 },
          },
        )
        .setOrigin(0.5),
    );

    this.phase6EjectButton = this.createBodyButton(
      480,
      436,
      270,
      "EJETAR COM SEGURANCA",
      () => this.ejectSafely(),
      {
        border: 0xffd166,
        hover: 0x5c4b22,
        fontSize: "7px",
        height: 44,
      },
    );
  }

  createFileRow(file, x, y) {
    const container = this.add.container(x, y);
    const background = this.add
      .rectangle(0, 0, 360, 32, 0x13283a, 1)
      .setStrokeStyle(2, 0x40566d, 0.78)
      .setInteractive({ useHandCursor: true });
    const nameText = this.add
      .text(-162, -1, file.name, {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "14px",
        fontStyle: "900",
        color: "#f1f7ff",
      })
      .setOrigin(0, 0.5);
    const sizeText = this.add
      .text(82, -1, `${file.size} MB`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#9fb1c6",
      })
      .setOrigin(0, 0.5);
    const importantTag = this.add
      .text(162, -1, "!", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#ffd166",
      })
      .setOrigin(0.5)
      .setVisible(file.essential);
    const selectedMark = this.add
      .text(162, -1, "OK", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#8ef28b",
      })
      .setOrigin(0.5)
      .setVisible(this.phase6SelectedIds.has(file.id));

    container.add([background, nameText, sizeText, importantTag, selectedMark]);
    this.addToBody(container);

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
    this.updateFileCard(this.phase6FileCards.get(file.id), this.phase6SelectedIds.has(file.id), false);
  }

  createCapacityPanel(x, y) {
    this.addToBody(
      createRoundedPanel(this, x, y, 250, 142, {
        fill: 0x101f35,
        stroke: 0x70b7ff,
        strokeAlpha: 0.3,
        radius: 14,
        shadow: false,
      }),
    );

    this.addToBody(
      this.add
        .text(x, y - 50, "PEN DRIVE 1 GB", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#70b7ff",
        })
        .setOrigin(0.5),
    );

    this.phase6CapacityBack = this.add
      .rectangle(x - 100, y - 12, 200, 18, 0x07101f, 1)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, 0x40566d, 0.9);
    this.phase6CapacityFill = this.add
      .rectangle(x - 97, y - 12, 194, 12, 0x8ef28b, 1)
      .setOrigin(0, 0.5)
      .setScale(0, 1);
    this.phase6CapacityText = this.add
      .text(x, y + 15, "0 / 1000 MB", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "13px",
        fontStyle: "900",
        color: "#dce8f5",
      })
      .setOrigin(0.5);
    this.phase6SelectionSummary = this.add
      .text(x, y + 44, "", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "12px",
        fontStyle: "900",
        color: "#c7d7e8",
        align: "center",
      })
      .setOrigin(0.5);

    this.addToBody([
      this.phase6CapacityBack,
      this.phase6CapacityFill,
      this.phase6CapacityText,
      this.phase6SelectionSummary,
    ]);
  }

  createMiniComputer(x, y, title, accent, status) {
    const container = this.add.container(x, y);
    const graphics = this.add.graphics();

    graphics.fillStyle(0x101f35, 1);
    graphics.fillRoundedRect(-70, -38, 140, 72, 10);
    graphics.lineStyle(2, accent, 0.58);
    graphics.strokeRoundedRect(-70, -38, 140, 72, 10);
    graphics.fillStyle(0x07101f, 1);
    graphics.fillRoundedRect(-56, -25, 112, 42, 6);
    graphics.fillStyle(accent, 0.18);
    graphics.fillRoundedRect(-45, -13, 78, 7, 2);
    graphics.fillRoundedRect(-45, 1, 92, 7, 2);
    graphics.fillStyle(0x263a52, 1);
    graphics.fillRoundedRect(-25, 34, 50, 7, 3);
    graphics.fillRoundedRect(-42, 41, 84, 6, 3);
    container.add(graphics);

    container.add(
      this.add
        .text(0, -52, title, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: this.toCssColor(accent),
        })
        .setOrigin(0.5),
    );
    container.add(
      this.add
        .text(0, -1, status, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "6px",
          color: "#dce8f5",
          align: "center",
        })
        .setOrigin(0.5),
    );

    this.addToBody(container);
    return container;
  }

  createFlashDrive(x, y, status) {
    this.phase6FlashContainer = this.add.container(x, y);
    const drive = this.add.graphics();

    drive.fillStyle(0xb7c9d6, 1);
    drive.fillRoundedRect(-68, -18, 32, 36, 5);
    drive.fillStyle(0x07101f, 0.75);
    drive.fillRect(-59, -10, 8, 8);
    drive.fillRect(-46, -10, 8, 8);
    drive.fillStyle(0x13283a, 1);
    drive.fillRoundedRect(-40, -31, 108, 62, 13);
    drive.lineStyle(3, 0x70b7ff, 0.86);
    drive.strokeRoundedRect(-40, -31, 108, 62, 13);
    drive.fillStyle(0x17344f, 1);
    drive.fillRoundedRect(-26, -20, 80, 40, 8);
    drive.fillStyle(0x8ef28b, 0.88);
    drive.fillCircle(35, 0, 7);
    drive.fillStyle(0x62e7f2, 0.22);
    drive.fillRoundedRect(-14, -10, 30, 7, 3);
    drive.fillRoundedRect(-14, 4, 38, 7, 3);
    this.phase6FlashContainer.add(drive);

    this.phase6FlashContainer.add(
      this.add
        .text(0, -50, "PEN DRIVE", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#70b7ff",
        })
        .setOrigin(0.5),
    );

    this.phase6FlashStatusText = this.add
      .text(12, 46, status, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#8da2bd",
      })
      .setOrigin(0.5);
    this.phase6FlashContainer.add(this.phase6FlashStatusText);

    const unsafeHitArea = this.add
      .rectangle(0, 0, 150, 96, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true });
    this.phase6FlashContainer.add(unsafeHitArea);
    unsafeHitArea.on("pointerdown", () => this.removeIncorrectly());

    this.phase6FlashGlow = this.add
      .rectangle(x, y, 150, 84, 0x70b7ff, 0)
      .setStrokeStyle(3, 0x70b7ff, 0);

    this.addToBody([this.phase6FlashContainer, this.phase6FlashGlow]);
    return this.phase6FlashContainer;
  }

  createFlowArrow(x, y, color) {
    const container = this.add.container(x, y);
    const line = this.add.rectangle(-8, 0, 104, 5, color, 0.82);
    const head = this.add.triangle(
      58,
      0,
      -12,
      -11,
      12,
      0,
      -12,
      11,
      color,
      0.82,
    );

    container.add([line, head]);
    this.addToBody(container);

    this.tweens.add({
      targets: container,
      scaleX: 1.06,
      duration: 430,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    return container;
  }

  createProgressBar(x, y, label) {
    this.phase6ProgressLabel = this.add
      .text(x, y - 24, label, {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "15px",
        fontStyle: "900",
        color: "#8da2bd",
      })
      .setOrigin(0.5);
    const progressBack = this.add
      .rectangle(x - 150, y + 8, 300, 18, 0x07101f, 1)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x40566d, 0.9);
    this.phase6ProgressFill = this.add
      .rectangle(x - 148, y + 8, 296, 12, 0x62e7f2, 1)
      .setOrigin(0, 0.5)
      .setScale(this.phase6IsTransferred ? 1 : 0, 1);

    this.addToBody([
      this.phase6ProgressLabel,
      progressBack,
      this.phase6ProgressFill,
    ]);
  }

  toggleFileSelection(fileId) {
    if (this.phase6IsBusy) {
      this.showFeedback("Aguarde a operacao terminar.", "warning");
      return;
    }

    if (this.phase6IsCopied) {
      this.showFeedback("Arquivos copiados.", "neutral");
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
      this.showFeedback("Espaco insuficiente.", "error");
      this.shakeCapacityBar();
    }

    if (file.essential && isSelected) {
      this.showFeedback("Arquivo importante selecionado.", "success");
    }
  }

  updateFileCard(card, isSelected, animate = true) {
    if (!card) {
      return;
    }

    card.selectedMark.setVisible(isSelected);
    card.background
      .setFillStyle(isSelected ? 0x245064 : 0x13283a)
      .setStrokeStyle(
        isSelected ? 3 : 2,
        isSelected ? 0x8ef28b : 0x40566d,
        isSelected ? 1 : 0.78,
      );

    if (animate) {
      this.tweens.add({
        targets: card.container,
        scale: isSelected ? 1.025 : 1,
        duration: 120,
        ease: "Back.out",
      });
    }
  }

  updateCapacityBar() {
    if (!this.phase6CapacityFill) {
      return;
    }

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
      .setText(`${selectedSize} / ${PHASE6_CAPACITY_MB} MB`)
      .setColor(
        overCapacity ? "#ff9b78" : nearCapacity ? "#ffd166" : "#dce8f5",
      );

    const importantSelected = this.phase6ImportantFiles.filter((file) =>
      this.phase6SelectedIds.has(file.id),
    ).length;
    this.phase6SelectionSummary.setText(
      `Importantes: ${importantSelected}/${this.phase6ImportantFiles.length}`,
    );
  }

  copyToFlashDrive() {
    if (this.phase6IsEjected || this.phase6IsComplete) {
      return;
    }

    if (this.phase6IsBusy) {
      this.showFeedback("Aguarde a operacao terminar.", "warning");
      return;
    }

    if (this.phase6IsCopied) {
      this.showFeedback("Arquivos copiados.", "neutral");
      return;
    }

    if (this.phase6SelectedIds.size === 0) {
      this.showFailure("Selecione os arquivos importantes.");
      return;
    }

    if (this.isOverCapacity()) {
      this.showFailure("Espaco insuficiente.");
      this.shakeCapacityBar();
      return;
    }

    const missingFiles = this.getMissingImportantFiles();
    if (missingFiles.length > 0) {
      this.showFailure("Faltam arquivos importantes.");
      this.animateMissingImportantFiles(missingFiles);
      return;
    }

    this.phase6IsBusy = true;
    this.updateStep(2);
    this.showFeedback("Copiando arquivos para o pen drive...", "neutral");
    this.createTransferPackets(325, 267, 525, 267, 0x70b7ff);
    this.animateProgress("COPIANDO", 0x70b7ff, () => {
      this.phase6IsBusy = false;
      this.phase6IsCopied = true;
      this.phase6CopiedIds = new Set(this.phase6SelectedIds);
      this.showFeedback("Arquivos copiados.", "success");
      this.pulseFlashDrive(0x70b7ff);
      this.time.delayedCall(450, () => this.updateStep(3));
    });
  }

  transferToDestination() {
    if (this.phase6IsEjected || this.phase6IsComplete) {
      return;
    }

    if (this.phase6IsBusy) {
      this.showFeedback("Aguarde a operacao terminar.", "warning");
      return;
    }

    if (!this.phase6IsCopied) {
      this.showFailure("Primeiro copie para o pen drive.");
      return;
    }

    if (this.phase6IsTransferred) {
      this.showFeedback("Arquivos transferidos.", "neutral");
      return;
    }

    this.phase6IsBusy = true;
    this.updateStep(3);
    this.showFeedback("Transferindo para o computador destino...", "neutral");
    this.createTransferPackets(390, 260, 590, 260, 0x8ef28b);
    this.animateProgress("TRANSFERINDO", 0x8ef28b, () => {
      this.phase6IsBusy = false;
      this.phase6IsTransferred = true;
      this.showFeedback("Arquivos transferidos.", "success");
      this.pulseFlashDrive(0x8ef28b);
      this.time.delayedCall(450, () => this.updateStep(4));
    });
  }

  ejectSafely() {
    if (this.phase6IsEjected || this.phase6IsComplete) {
      return;
    }

    if (this.phase6IsBusy) {
      this.showFailure("Remover durante a gravacao pode corromper arquivos.");
      return;
    }

    if (!this.phase6IsCopied) {
      this.showFailure("Primeiro copie para o pen drive.");
      return;
    }

    if (!this.phase6IsTransferred) {
      this.showFailure("Transfira os arquivos antes de ejetar.");
      return;
    }

    this.phase6IsEjected = true;
    this.phase6IsComplete = true;
    this.showFeedback("Pen drive ejetado com seguranca!", "success");
    this.pulseFlashDrive(0xffd166);
    this.time.delayedCall(900, () => this.showConclusion());
  }

  removeIncorrectly() {
    if (this.phase6IsEjected || this.phase6IsComplete) {
      return;
    }

    if (this.phase6IsBusy) {
      this.showFailure("Remover durante a gravacao pode corromper arquivos.");
      return;
    }

    this.showFailure("Use o botao de ejecao segura.");
  }

  animateProgress(label, color, onComplete) {
    if (!this.phase6ProgressFill || !this.phase6ProgressLabel) {
      onComplete();
      return;
    }

    this.phase6ProgressFill.setFillStyle(color, 1).setScale(0, 1);
    this.phase6ProgressLabel
      .setText(`${label} 0%`)
      .setColor(this.toCssColor(color));

    this.tweens.add({
      targets: this.phase6ProgressFill,
      scaleX: 1,
      duration: 1050,
      ease: "Sine.inOut",
      onUpdate: () => {
        const percent = Math.round(this.phase6ProgressFill.scaleX * 100);
        this.phase6ProgressLabel.setText(`${label} ${percent}%`);
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
      this.addToBody(packet);

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

      if (!card) {
        return;
      }

      card.background.setStrokeStyle(3, 0xff7b68, 1);
      this.tweens.add({
        targets: card.container,
        x: "+=5",
        duration: 55,
        yoyo: true,
        repeat: 2,
        ease: "Sine.inOut",
        onComplete: () => this.updateFileCard(card, false, false),
      });
    });
  }

  shakeCapacityBar() {
    if (!this.phase6CapacityBack || !this.phase6CapacityFill) {
      return;
    }

    const backX = this.phase6CapacityBack.x;
    const fillX = this.phase6CapacityFill.x;

    this.tweens.add({
      targets: [this.phase6CapacityBack, this.phase6CapacityFill],
      x: "+=7",
      duration: 55,
      yoyo: true,
      repeat: 3,
      ease: "Sine.inOut",
      onComplete: () => {
        this.phase6CapacityBack.setX(backX);
        this.phase6CapacityFill.setX(fillX);
      },
    });
  }

  updateScore(change) {
    this.phase6Score = Phaser.Math.Clamp(
      this.phase6Score + change,
      0,
      this.phase6MaxScore,
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
    if (!this.phase6FlashContainer || !this.phase6FlashGlow) {
      return;
    }

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

    this.addToStage(
      this.add
        .text(480, 68, "FASE CONCLUIDA!", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "20px",
          color: "#8ef28b",
        })
        .setOrigin(0.5),
    );

    this.createCompletionFlashDrive(480, 145);

    this.addToStage(
      createRoundedPanel(this, 480, 304, 720, 190, {
        stroke: 0x70b7ff,
        strokeAlpha: 0.38,
        radius: 18,
      }),
    );

    this.addToStage(
      this.add
        .text(
          480,
          282,
          "Voce transferiu arquivos com memoria flash e ejetou o pen drive com seguranca.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "18px",
            fontStyle: "700",
            color: "#dce8f5",
            align: "center",
            lineSpacing: 7,
            wordWrap: { width: 620 },
          },
        )
        .setOrigin(0.5),
    );

    this.addToStage(
      this.add
        .text(480, 364, `PONTUACAO FINAL: ${finalScore}`, {
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
      "VOLTAR A LINHA DO TEMPO",
      () => this.returnToTimeline(),
      { border: 0x62e7f2, hover: 0x1c5264, fontSize: "7px" },
    );
    this.createButton(
      480,
      462,
      240,
      "PRÓXIMA FASE",
      () => this.scene.start("Phase7Scene"),
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

    this.phase6Stage.setAlpha(0).setScale(0.97);
    this.tweens.add({
      targets: this.phase6Stage,
      alpha: 1,
      scale: 1,
      duration: 350,
      ease: "Back.out",
    });
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

  restartPhase() {
    this.startChallenge();
  }

  returnToTimeline() {
    this.scene.start("TimelineScene");
  }

  createBodyButton(x, y, width, label, callback, options = {}) {
    return createStandardButton(this, x, y, width, label, callback, {
      border: options.border ?? 0x62e7f2,
      hover: options.hover ?? 0x1c5264,
      fontSize: options.fontSize ?? "10px",
      height: options.height ?? 56,
      addToStage: (button) => this.addToBody(button),
    });
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

  addToBody(gameObjects) {
    this.phase6Body.add(gameObjects);
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
