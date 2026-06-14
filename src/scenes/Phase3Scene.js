import { completePhase, isPhaseUnlocked } from "../utils/progressManager.js";
import {
  createRoundedPanel,
  createStandardButton,
  drawRetroBackground,
} from "../utils/visualHelpers.js";

const PHASE3_CAPACITY_MB = 1.44;
const PHASE3_STARTING_SCORE = 100;
const PHASE3_SAVE_PENALTY = 10;
const PHASE3_CAPACITY_PENALTY = 5;
const PHASE3_MIN_FILES = 6;
const PHASE3_MAX_FILES = 8;

const PHASE3_FILE_TEMPLATES = [
  {
    id: "text",
    name: "texto.txt",
    type: "TXT",
    minSize: 0.07,
    maxSize: 0.15,
    canBeImportant: true,
  },
  {
    id: "summary",
    name: "resumo.pdf",
    type: "PDF",
    minSize: 0.18,
    maxSize: 0.32,
    canBeImportant: true,
  },
  {
    id: "document",
    name: "trabalho.doc",
    type: "DOC",
    minSize: 0.16,
    maxSize: 0.3,
    canBeImportant: true,
  },
  {
    id: "sheet",
    name: "planilha.xls",
    type: "XLS",
    minSize: 0.22,
    maxSize: 0.38,
    canBeImportant: true,
  },
  {
    id: "photo",
    name: "foto.bmp",
    type: "BMP",
    minSize: 0.46,
    maxSize: 0.7,
    canBeImportant: true,
  },
  {
    id: "drawing",
    name: "desenho.bmp",
    type: "BMP",
    minSize: 0.42,
    maxSize: 0.64,
    canBeImportant: true,
  },
  {
    id: "music",
    name: "musica.wav",
    type: "WAV",
    minSize: 0.95,
    maxSize: 1.35,
    canBeImportant: false,
  },
  {
    id: "video",
    name: "video.avi",
    type: "AVI",
    minSize: 1.65,
    maxSize: 2.8,
    canBeImportant: false,
  },
  {
    id: "game",
    name: "jogo.exe",
    type: "EXE",
    minSize: 1.5,
    maxSize: 2.5,
    canBeImportant: false,
  },
  {
    id: "backup",
    name: "backup.zip",
    type: "ZIP",
    minSize: 0.72,
    maxSize: 1.18,
    canBeImportant: false,
  },
  {
    id: "code",
    name: "codigo.c",
    type: "C",
    minSize: 0.05,
    maxSize: 0.14,
    canBeImportant: true,
  },
  {
    id: "notes",
    name: "notas.txt",
    type: "TXT",
    minSize: 0.04,
    maxSize: 0.11,
    canBeImportant: true,
  },
  {
    id: "image",
    name: "imagem.gif",
    type: "GIF",
    minSize: 0.28,
    maxSize: 0.46,
    canBeImportant: true,
  },
  {
    id: "slides",
    name: "apresentacao.ppt",
    type: "PPT",
    minSize: 0.38,
    maxSize: 0.62,
    canBeImportant: true,
  },
];

const PHASE3_OVERSIZED_IDS = new Set(["video", "game"]);
const PHASE3_BULKY_IDS = new Set(["music", "backup"]);

export default class Phase3Scene extends Phaser.Scene {
  constructor() {
    super("Phase3Scene");
  }

  create() {
    if (!isPhaseUnlocked(3)) {
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
      accent: 0x8ef28b,
      bottomLeft: 0x17283a,
      bottomRight: 0x0a1522,
      gridAlpha: 0.04,
      frameAlpha: 0.12,
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

    this.addToStage(
      createRoundedPanel(this, 480, 278, 780, 374, {
        stroke: 0x8ef28b,
        strokeAlpha: 0.46,
        radius: 20,
      }),
    );

    this.createIntroFloppyDisk(480, 155);

    this.addToStage(
      this.add
        .text(
          480,
          298,
          "Os disquetes permitiam transportar arquivos entre computadores,\nmas tinham capacidade muito pequena.",
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
          372,
          "Escolha os arquivos importantes e salve no disquete\nsem ultrapassar o limite de espaço.",
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
    this.phase3SelectedIds = new Set();
    this.phase3UsedCapacity = 0;
    this.phase3Score = PHASE3_STARTING_SCORE;
    this.phase3IsComplete = false;
    this.phase3FileCards = new Map();
    this.phase3MissionCards = new Map();
    this.setupRandomChallenge();

    this.clearStage();
    this.phase3Stage = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 29, "FASE 3: DISQUETE", {
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

    this.createObjectivePanel();
    this.createFileList();
    this.createStoragePanel();
    this.createControls();
    this.createFeedbackArea();
    this.createBackLink();
    this.updateCapacityBar();
    this.updateMissionState();

    this.phase3Stage.setAlpha(0);
    this.tweens.add({
      targets: this.phase3Stage,
      alpha: 1,
      duration: 280,
      ease: "Sine.out",
    });
  }

  setupRandomChallenge() {
    const previousSignature = this.phase3ChallengeSignature;

    for (let attempt = 0; attempt < 150; attempt += 1) {
      const fileCount = Phaser.Math.Between(
        PHASE3_MIN_FILES,
        PHASE3_MAX_FILES,
      );
      const importantCount = Phaser.Math.Between(3, 4);
      const generatedFiles = PHASE3_FILE_TEMPLATES.map((template) =>
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
      const oversizedFile = this.shuffleItems(
        generatedFiles.filter((file) => PHASE3_OVERSIZED_IDS.has(file.id)),
      )[0];
      const bulkyFile = this.shuffleItems(
        generatedFiles.filter((file) => PHASE3_BULKY_IDS.has(file.id)),
      )[0];

      const selectedFiles = [...importantFiles, oversizedFile, bulkyFile];
      usedIds.add(oversizedFile.id);
      usedIds.add(bulkyFile.id);

      const remainingFiles = this.shuffleItems(
        generatedFiles.filter((file) => !usedIds.has(file.id)),
      );

      while (selectedFiles.length < fileCount && remainingFiles.length > 0) {
        const nextFile = remainingFiles.pop();
        selectedFiles.push(nextFile);
        usedIds.add(nextFile.id);
      }

      const importantIds = new Set(importantFiles.map((file) => file.id));
      const challengeFiles = this.shuffleItems(selectedFiles).map((file) => ({
        ...file,
        essential: importantIds.has(file.id),
      }));
      const signature = challengeFiles
        .map(
          (file) =>
            `${file.id}:${file.size.toFixed(2)}:${file.essential ? "I" : "N"}`,
        )
        .join("|");

      if (signature !== previousSignature) {
        this.phase3Files = challengeFiles;
        this.phase3ImportantFiles = challengeFiles.filter(
          (file) => file.essential,
        );
        this.phase3ChallengeSignature = signature;
        return;
      }
    }

    this.createFallbackChallenge();
  }

  createFileFromTemplate(template) {
    const minSize = Math.round(template.minSize * 100);
    const maxSize = Math.round(template.maxSize * 100);

    return {
      id: template.id,
      name: template.name,
      type: template.type,
      size: Phaser.Math.Between(minSize, maxSize) / 100,
      canBeImportant: template.canBeImportant,
    };
  }

  pickImportantFiles(files, importantCount) {
    const eligibleFiles = files.filter((file) => file.canBeImportant);
    const minimumUsefulCapacity = importantCount === 4 ? 0.78 : 0.58;
    const maximumUsefulCapacity = 1.3;

    for (let attempt = 0; attempt < 80; attempt += 1) {
      const candidates = this.shuffleItems(eligibleFiles).slice(
        0,
        importantCount,
      );
      const totalSize = candidates.reduce(
        (total, file) => total + file.size,
        0,
      );

      if (
        totalSize >= minimumUsefulCapacity &&
        totalSize <= maximumUsefulCapacity
      ) {
        return candidates;
      }
    }

    return null;
  }

  createFallbackChallenge() {
    const fallbackFiles = [
      { id: "notes", name: "notas.txt", type: "TXT", size: 0.1, essential: true },
      {
        id: "document",
        name: "trabalho.doc",
        type: "DOC",
        size: 0.28,
        essential: true,
      },
      {
        id: "summary",
        name: "resumo.pdf",
        type: "PDF",
        size: 0.31,
        essential: true,
      },
      {
        id: "image",
        name: "imagem.gif",
        type: "GIF",
        size: 0.39,
        essential: true,
      },
      {
        id: "music",
        name: "musica.wav",
        type: "WAV",
        size: 1.16,
        essential: false,
      },
      {
        id: "video",
        name: "video.avi",
        type: "AVI",
        size: 2.25,
        essential: false,
      },
      {
        id: "backup",
        name: "backup.zip",
        type: "ZIP",
        size: 0.88,
        essential: false,
      },
    ];

    this.phase3Files = this.shuffleItems(fallbackFiles);
    this.phase3ImportantFiles = this.phase3Files.filter(
      (file) => file.essential,
    );
    this.phase3ChallengeSignature = this.phase3Files
      .map((file) => `${file.id}:${file.size.toFixed(2)}`)
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
      createRoundedPanel(this, 480, 75, 740, 50, {
        fill: 0x101f35,
        stroke: 0xffd166,
        strokeAlpha: 0.38,
        radius: 12,
        shadow: false,
      }),
    );

    this.addToStage(
      this.add
        .text(
          480,
          75,
          "Objetivo: salve os arquivos importantes sem ultrapassar 1,44 MB.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "16px",
            fontStyle: "900",
            color: "#ffd166",
            align: "center",
          },
        )
        .setOrigin(0.5),
    );
  }

  createFileList() {
    this.addToStage(
      createRoundedPanel(this, 280, 278, 500, 330, {
        fill: 0x0b1729,
        stroke: 0x62e7f2,
        strokeAlpha: 0.32,
        radius: 16,
      }),
    );

    this.addToStage(
      this.add
        .text(280, 130, "ARQUIVOS DISPONÍVEIS", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "9px",
          color: "#62e7f2",
        })
        .setOrigin(0.5),
    );

    const columnPositions = [168, 392];
    const rowPositions = [170, 229, 288, 347];

    this.phase3Files.forEach((file, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      this.createFileCard(
        file,
        columnPositions[column],
        rowPositions[row],
      );
    });
  }

  createFileCard(file, x, y) {
    const cardContainer = this.add.container(x, y);
    const background = this.add
      .rectangle(0, 0, 210, 50, 0x16263a, 1)
      .setStrokeStyle(2, 0x40566d, 0.82)
      .setInteractive({ useHandCursor: true });
    const icon = this.add
      .rectangle(-83, 0, 31, 32, this.getFileColor(file.type), 0.94)
      .setStrokeStyle(1, 0xf1f7ff, 0.34);
    const typeText = this.add
      .text(-83, 0, file.type, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: file.type.length > 3 ? "4px" : "5px",
        color: "#07101f",
      })
      .setOrigin(0.5);
    const nameText = this.add
      .text(-61, -9, file.name, {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "13px",
        fontStyle: "900",
        color: "#f1f7ff",
      })
      .setOrigin(0, 0.5);
    const sizeText = this.add
      .text(-61, 11, `${this.formatCapacity(file.size)} MB`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#9fb1c6",
      })
      .setOrigin(0, 0.5);
    const selectedMark = this.add
      .text(91, 12, "OK", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#8ef28b",
      })
      .setOrigin(1, 0.5)
      .setVisible(false);
    const importantTag = this.add
      .text(96, -13, "IMPORTANTE", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "5px",
        color: "#ffd166",
        backgroundColor: "#493d1c",
        padding: { left: 4, right: 4, top: 3, bottom: 3 },
      })
      .setOrigin(1, 0.5)
      .setVisible(file.essential);

    cardContainer.add([
      background,
      icon,
      typeText,
      nameText,
      sizeText,
      selectedMark,
      importantTag,
    ]);
    this.addToStage(cardContainer);

    background.on("pointerover", () => {
      if (!this.phase3IsComplete) {
        background.setFillStyle(
          this.phase3SelectedIds.has(file.id) ? 0x285b68 : 0x203b50,
        );
      }
    });
    background.on("pointerout", () => {
      background.setFillStyle(
        this.phase3SelectedIds.has(file.id) ? 0x245064 : 0x16263a,
      );
    });
    background.on("pointerdown", () => this.toggleFileSelection(file.id));

    this.phase3FileCards.set(file.id, {
      container: cardContainer,
      background,
      selectedMark,
    });
  }

  createStoragePanel() {
    this.addToStage(
      createRoundedPanel(this, 755, 278, 310, 330, {
        fill: 0x0b1729,
        stroke: 0x8ef28b,
        strokeAlpha: 0.34,
        radius: 16,
      }),
    );

    this.createMissionList();
    this.createFloppyDisk();
    this.createCapacityBar();

    this.addToStage(
      this.add
        .text(
          755,
          425,
          "Dica: disquetes tinham pouco espaço.\nEscolha apenas o essencial.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "12px",
            fontStyle: "800",
            color: "#c7d7e8",
            align: "center",
            lineSpacing: 2,
          },
        )
        .setOrigin(0.5),
    );
  }

  createMissionList() {
    this.addToStage(
      this.add
        .text(755, 130, "MISSÃO: ARQUIVOS IMPORTANTES", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: "#ffd166",
        })
        .setOrigin(0.5),
    );

    const columns = [688, 822];
    const rows = [157, 184];

    this.phase3ImportantFiles.forEach((file, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const chipContainer = this.add.container(
        columns[column],
        rows[row],
      );
      const chipBackground = this.add
        .rectangle(0, 0, 124, 22, 0x2f2919, 1)
        .setStrokeStyle(1, 0xffd166, 0.55);
      const chipText = this.add
        .text(0, 0, file.name, {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "11px",
          fontStyle: "900",
          color: "#ffe39a",
        })
        .setOrigin(0.5);

      chipContainer.add([chipBackground, chipText]);
      this.addToStage(chipContainer);
      this.phase3MissionCards.set(file.id, {
        container: chipContainer,
        background: chipBackground,
        text: chipText,
      });
    });
  }

  createFloppyDisk() {
    const x = 677;
    const y = 207;
    const width = 156;
    const height = 122;
    const graphics = this.add.graphics();

    graphics.fillStyle(0x000000, 0.28);
    graphics.fillRoundedRect(x + 7, y + 8, width, height, 11);
    graphics.fillStyle(0x274c46, 1);
    graphics.fillRoundedRect(x, y, width, height, 11);
    graphics.lineStyle(3, 0x8ef28b, 0.58);
    graphics.strokeRoundedRect(x, y, width, height, 11);

    graphics.fillStyle(0xb8c2c7, 1);
    graphics.fillRoundedRect(x + 34, y, 88, 45, 4);
    graphics.fillStyle(0x26343e, 1);
    graphics.fillRect(x + 91, y + 7, 19, 31);
    graphics.fillStyle(0x8da2bd, 0.45);
    graphics.fillRect(x + 43, y + 8, 35, 29);

    graphics.fillStyle(0xd8cfaa, 1);
    graphics.fillRoundedRect(x + 27, y + 65, 102, 46, 6);
    graphics.lineStyle(2, 0x786f50, 0.55);
    graphics.strokeRoundedRect(x + 27, y + 65, 102, 46, 6);
    graphics.lineBetween(x + 41, y + 83, x + 114, y + 83);
    graphics.lineBetween(x + 41, y + 96, x + 103, y + 96);
    this.addToStage(graphics);

    this.phase3DiskGlow = this.add
      .rectangle(
        x + width / 2,
        y + height / 2,
        width + 12,
        height + 12,
        14,
      )
      .setStrokeStyle(4, 0x8ef28b, 0)
      .setFillStyle(0x8ef28b, 0);
    this.addToStage(this.phase3DiskGlow);

    this.phase3SelectionText = this.add
      .text(x + width / 2, y + 88, "0 arquivos", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#514a34",
        align: "center",
      })
      .setOrigin(0.5);
    this.addToStage(this.phase3SelectionText);
  }

  createCapacityBar() {
    this.addToStage(
      this.add
        .text(755, 347, "CAPACIDADE DO DISQUETE: 1,44 MB", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: "#ffd166",
        })
        .setOrigin(0.5),
    );

    this.addToStage(
      this.add
        .rectangle(755, 373, 250, 24, 0x07101f, 1)
        .setStrokeStyle(2, 0x60758a, 0.9),
    );

    this.phase3CapacityFill = this.add
      .rectangle(632, 373, 246, 18, 0x8ef28b, 1)
      .setOrigin(0, 0.5)
      .setScale(0, 1);
    this.addToStage(this.phase3CapacityFill);

    this.phase3CapacityText = this.add
      .text(755, 399, "Usado: 0,00 MB / 1,44 MB", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "14px",
        fontStyle: "900",
        color: "#dce8f5",
      })
      .setOrigin(0.5);
    this.addToStage(this.phase3CapacityText);
  }

  createControls() {
    this.phase3ClearButton = this.createButton(
      169,
      416,
      205,
      "LIMPAR SELEÇÃO",
      () => this.clearSelection(),
      {
        border: 0xffd166,
        hover: 0x564624,
        fontSize: "8px",
        height: 48,
      },
    );
    this.phase3SaveButton = this.createButton(
      391,
      416,
      225,
      "SALVAR NO DISQUETE",
      () => this.validateSelection(),
      {
        border: 0x8ef28b,
        hover: 0x246a69,
        fontSize: "8px",
        height: 48,
      },
    );
  }

  createFeedbackArea() {
    this.addToStage(
      createRoundedPanel(this, 480, 503, 850, 36, {
        fill: 0x091424,
        stroke: 0x62e7f2,
        strokeAlpha: 0.24,
        radius: 10,
        shadow: false,
        highlight: false,
      }),
    );

    this.phase3MessageText = this.add
      .text(
        480,
        503,
        `Selecione os ${this.phase3ImportantFiles.length} arquivos importantes.`,
        {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "14px",
          fontStyle: "800",
          color: "#8da2bd",
          align: "center",
          wordWrap: { width: 800 },
        },
      )
      .setOrigin(0.5);
    this.addToStage(this.phase3MessageText);
  }

  toggleFileSelection(fileId) {
    if (this.phase3IsComplete) {
      return;
    }

    const file = this.getFileById(fileId);
    const card = this.phase3FileCards.get(fileId);
    const wasOverCapacity = this.isOverCapacity();

    if (this.phase3SelectedIds.has(fileId)) {
      this.phase3SelectedIds.delete(fileId);
      this.showFeedback("Arquivo removido da seleção.", "neutral");
    } else {
      this.phase3SelectedIds.add(fileId);
      this.showFeedback("Arquivo selecionado.", "success");
    }

    const isSelected = this.phase3SelectedIds.has(fileId);
    this.updateFileCard(card, isSelected);
    this.updateCapacityBar();
    this.updateMissionState();

    const isOverCapacity = this.isOverCapacity();
    if (!wasOverCapacity && isOverCapacity) {
      this.updateScore(-PHASE3_CAPACITY_PENALTY);
      this.showFeedback(
        file.size > PHASE3_CAPACITY_MB
          ? "Esse arquivo é grande demais para caber no disquete."
          : "Espaço insuficiente no disquete.",
        "error",
      );
      this.animateCapacityWarning();
    }
  }

  updateFileCard(card, isSelected) {
    card.selectedMark.setVisible(isSelected);
    card.background
      .setFillStyle(isSelected ? 0x245064 : 0x16263a)
      .setStrokeStyle(
        isSelected ? 3 : 2,
        isSelected ? 0x8ef28b : 0x40566d,
        isSelected ? 1 : 0.82,
      );

    this.tweens.add({
      targets: card.container,
      scale: isSelected ? 1.035 : 1,
      duration: 140,
      ease: "Back.out",
    });
  }

  updateCapacityBar() {
    this.phase3UsedCapacity = this.phase3Files.reduce((total, file) => {
      return this.phase3SelectedIds.has(file.id) ? total + file.size : total;
    }, 0);

    const ratio = this.phase3UsedCapacity / PHASE3_CAPACITY_MB;
    const displayedRatio = Phaser.Math.Clamp(ratio, 0, 1);
    const overCapacity = this.isOverCapacity();
    const nearCapacity = ratio >= 0.82;
    const color = overCapacity
      ? 0xff7b68
      : nearCapacity
        ? 0xffd166
        : 0x8ef28b;

    this.tweens.killTweensOf(this.phase3CapacityFill);
    this.phase3CapacityFill.setFillStyle(color);
    this.tweens.add({
      targets: this.phase3CapacityFill,
      scaleX: displayedRatio,
      duration: 210,
      ease: "Sine.out",
    });

    this.phase3CapacityText
      .setText(
        `Usado: ${this.formatCapacity(this.phase3UsedCapacity)} MB / 1,44 MB`,
      )
      .setColor(
        overCapacity ? "#ff9b78" : nearCapacity ? "#ffd166" : "#dce8f5",
      );

    const selectedCount = this.phase3SelectedIds.size;
    this.phase3SelectionText.setText(
      `${selectedCount} ${selectedCount === 1 ? "arquivo" : "arquivos"}`,
    );
  }

  updateMissionState() {
    this.phase3ImportantFiles.forEach((file) => {
      const missionCard = this.phase3MissionCards.get(file.id);
      const selected = this.phase3SelectedIds.has(file.id);

      missionCard.background
        .setFillStyle(selected ? 0x173d35 : 0x2f2919, 1)
        .setStrokeStyle(
          selected ? 2 : 1,
          selected ? 0x8ef28b : 0xffd166,
          selected ? 0.9 : 0.55,
        );
      missionCard.text.setColor(selected ? "#8ef28b" : "#ffe39a");
    });
  }

  validateSelection() {
    if (this.phase3IsComplete) {
      return;
    }

    if (this.isOverCapacity()) {
      this.showFailure("Espaço insuficiente! Remova algum arquivo.");
      this.animateCapacityWarning();
      return;
    }

    const missingImportantFiles = this.phase3ImportantFiles.filter(
      (file) => !this.phase3SelectedIds.has(file.id),
    );

    if (missingImportantFiles.length > 0) {
      this.showFailure("Alguns arquivos importantes ficaram de fora.");
      this.animateMissingFiles(missingImportantFiles);
      return;
    }

    this.showSuccess();
  }

  clearSelection() {
    if (this.phase3IsComplete || this.phase3SelectedIds.size === 0) {
      return;
    }

    this.phase3SelectedIds.clear();
    this.phase3FileCards.forEach((card) => this.updateFileCard(card, false));
    this.updateCapacityBar();
    this.updateMissionState();
    this.showFeedback("Seleção limpa. Escolha novamente.", "warning");
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

    this.phase3MessageText
      .setText(message)
      .setColor(colors[type] ?? colors.neutral);
  }

  showFailure(message) {
    this.updateScore(-PHASE3_SAVE_PENALTY);
    this.showFeedback(message, "error");
    this.cameras.main.shake(120, 0.002);
  }

  animateCapacityWarning() {
    this.phase3CapacityFill.setX(632);
    this.phase3CapacityText.setX(755);
    this.tweens.add({
      targets: [this.phase3CapacityFill, this.phase3CapacityText],
      x: "+=5",
      duration: 55,
      yoyo: true,
      repeat: 2,
      ease: "Sine.inOut",
      onComplete: () => {
        this.phase3CapacityFill.setX(632);
        this.phase3CapacityText.setX(755);
      },
    });
  }

  animateMissingFiles(missingFiles) {
    missingFiles.forEach((file) => {
      const card = this.phase3FileCards.get(file.id);
      const missionCard = this.phase3MissionCards.get(file.id);

      card.background.setStrokeStyle(3, 0xff7b68, 1);
      missionCard.background.setStrokeStyle(2, 0xff7b68, 1);
      missionCard.text.setColor("#ff9b78");

      this.tweens.add({
        targets: [card.container, missionCard.container],
        x: "+=5",
        duration: 55,
        yoyo: true,
        repeat: 2,
        ease: "Sine.inOut",
        onComplete: () => {
          card.background.setStrokeStyle(2, 0x40566d, 0.82);
          this.updateMissionState();
        },
      });
    });
  }

  showSuccess() {
    this.phase3IsComplete = true;
    this.disableChallengeControls();
    this.showFeedback("Arquivos salvos com sucesso no disquete!", "success");

    this.phase3DiskGlow
      .setStrokeStyle(4, 0x8ef28b, 0.9)
      .setFillStyle(0x8ef28b, 0.1)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: this.phase3DiskGlow,
      scale: 1.14,
      alpha: 0.28,
      duration: 340,
      yoyo: true,
      repeat: 2,
      ease: "Sine.inOut",
    });

    this.createSuccessSparkles();
    this.time.delayedCall(1400, () => this.showConclusion());
  }

  createSuccessSparkles() {
    const positions = [
      [684, 225],
      [716, 196],
      [794, 196],
      [830, 230],
      [823, 308],
      [690, 319],
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
    completePhase(3);

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

    this.addToStage(
      createRoundedPanel(this, 480, 301, 770, 220, {
        stroke: 0x8ef28b,
        strokeAlpha: 0.42,
        radius: 18,
      }),
    );

    this.addToStage(
      this.add
        .text(
          480,
          280,
          "Você aprendeu que o disquete tornou os arquivos mais portáteis,\nmas tinha pouca capacidade. Por isso, era preciso escolher\nbem o que salvar.",
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

  getFileColor(type) {
    const colors = {
      TXT: 0x62e7f2,
      PDF: 0xff8f70,
      DOC: 0x70b7ff,
      XLS: 0x8ef28b,
      BMP: 0xffd166,
      WAV: 0xc49cff,
      AVI: 0xff8f70,
      EXE: 0xff7b68,
      ZIP: 0xc49cff,
      C: 0x62e7f2,
      GIF: 0xffd166,
      PPT: 0xff8f70,
    };

    return colors[type] ?? 0x8da2bd;
  }

  getFileById(fileId) {
    return this.phase3Files.find((file) => file.id === fileId);
  }

  isOverCapacity() {
    return this.phase3UsedCapacity > PHASE3_CAPACITY_MB + 0.0001;
  }

  formatCapacity(value) {
    return value.toFixed(2).replace(".", ",");
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
      .text(38, 29, "< LINHA DO TEMPO", {
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
