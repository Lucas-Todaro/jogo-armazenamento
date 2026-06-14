import { completePhase, isPhaseUnlocked } from "../utils/progressManager.js";
import {
  createRoundedPanel,
  createStandardButton,
  drawRetroBackground,
} from "../utils/visualHelpers.js";

const PHASE7_STARTING_SCORE = 100;
const PHASE7_VERIFY_PENALTY = 10;
const PHASE7_WRONG_FILE_PENALTY = 5;
const PHASE7_CONNECTION_PENALTY = 10;
const PHASE7_CAPACITY_PENALTY = 5;
const PHASE7_MIN_FILES = 6;
const PHASE7_MAX_FILES = 8;

const PHASE7_SSD_FILES = [
  {
    id: "operating-system",
    name: "sistema_operacional.sys",
    type: "SYS",
    minSize: 115,
    maxSize: 155,
    use: "inicialização rápida",
  },
  {
    id: "video-editor",
    name: "editor_video.exe",
    type: "EXE",
    minSize: 70,
    maxSize: 110,
    use: "programa pesado",
  },
  {
    id: "heavy-game",
    name: "jogo_pesado.exe",
    type: "EXE",
    minSize: 100,
    maxSize: 150,
    use: "carrega muitos dados",
  },
  {
    id: "3d-software",
    name: "software_3d.exe",
    type: "EXE",
    minSize: 85,
    maxSize: 125,
    use: "precisa abrir rápido",
  },
  {
    id: "local-database",
    name: "banco_local.db",
    type: "DB",
    minSize: 55,
    maxSize: 90,
    use: "consultas frequentes",
  },
  {
    id: "compiled-project",
    name: "projeto_compilacao.zip",
    type: "ZIP",
    minSize: 65,
    maxSize: 105,
    use: "uso local frequente",
  },
  {
    id: "main-app",
    name: "app_principal.exe",
    type: "EXE",
    minSize: 45,
    maxSize: 80,
    use: "executado todo dia",
  },
];

const PHASE7_CLOUD_FILES = [
  {
    id: "travel-photos",
    name: "fotos_viagem.zip",
    type: "ZIP",
    minSize: 110,
    maxSize: 190,
    use: "acesso em vários aparelhos",
  },
  {
    id: "important-backup",
    name: "backup_importante.zip",
    type: "ZIP",
    minSize: 140,
    maxSize: 220,
    use: "cópia de segurança",
  },
  {
    id: "college-work",
    name: "trabalho_faculdade.docx",
    type: "DOC",
    minSize: 8,
    maxSize: 25,
    use: "documento compartilhado",
  },
  {
    id: "personal-documents",
    name: "documentos_pessoais.pdf",
    type: "PDF",
    minSize: 20,
    maxSize: 55,
    use: "backup e acesso remoto",
  },
  {
    id: "portfolio",
    name: "portfolio.pdf",
    type: "PDF",
    minSize: 15,
    maxSize: 45,
    use: "compartilhar por link",
  },
  {
    id: "final-report",
    name: "relatorio_final.pdf",
    type: "PDF",
    minSize: 12,
    maxSize: 35,
    use: "consultar de qualquer lugar",
  },
  {
    id: "family-photos",
    name: "fotos_familia.zip",
    type: "ZIP",
    minSize: 130,
    maxSize: 210,
    use: "guardar uma cópia online",
  },
];

const PHASE7_FLEX_FILES = [
  {
    id: "music",
    name: "musica.mp3",
    type: "MP3",
    minSize: 35,
    maxSize: 75,
    uses: {
      ssd: "ouvir sempre neste computador",
      cloud: "ouvir em vários aparelhos",
    },
  },
  {
    id: "image",
    name: "imagem.png",
    type: "PNG",
    minSize: 8,
    maxSize: 24,
    uses: {
      ssd: "editar com frequência",
      cloud: "compartilhar com a equipe",
    },
  },
  {
    id: "notes",
    name: "anotacoes.txt",
    type: "TXT",
    minSize: 1,
    maxSize: 5,
    uses: {
      ssd: "consulta local diária",
      cloud: "sincronizar entre aparelhos",
    },
  },
  {
    id: "slides",
    name: "apresentacao.pptx",
    type: "PPT",
    minSize: 20,
    maxSize: 55,
    uses: {
      ssd: "apresentar neste computador",
      cloud: "editar com outras pessoas",
    },
  },
];

const PHASE7_TYPE_COLORS = {
  SYS: 0x8ef28b,
  EXE: 0x8ef28b,
  DB: 0x8ef28b,
  ZIP: 0xc49cff,
  DOC: 0x70b7ff,
  PDF: 0xff7b68,
  MP3: 0xffd166,
  PNG: 0x62e7f2,
  TXT: 0x8da2bd,
  PPT: 0xff8f70,
};

export default class Phase7Scene extends Phaser.Scene {
  constructor() {
    super("Phase7Scene");
  }

  create() {
    if (!isPhaseUnlocked(7)) {
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
      bottomLeft: 0x102840,
      bottomRight: 0x07101f,
      gridAlpha: 0.04,
      frameAlpha: 0.12,
    });
  }

  createIntroPanel() {
    this.clearStage();
    this.phase7Stage = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 49, "FASE 7: SSD E NUVEM", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "18px",
          color: "#8ef28b",
        })
        .setOrigin(0.5),
    );

    this.addToStage(
      createRoundedPanel(this, 480, 278, 780, 374, {
        stroke: 0x62e7f2,
        strokeAlpha: 0.46,
        radius: 20,
      }),
    );

    this.createIntroStorageIcon(480, 157);

    this.addToStage(
      this.add
        .text(
          480,
          302,
          "SSDs usam memória flash para acessar dados rapidamente.\nA nuvem armazena arquivos em servidores acessados pela internet.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "19px",
            fontStyle: "700",
            color: "#dce8f5",
            align: "center",
            lineSpacing: 7,
            wordWrap: { width: 700 },
          },
        )
        .setOrigin(0.5),
    );

    this.addToStage(
      this.add
        .text(
          480,
          382,
          "Organize os arquivos escolhendo entre armazenamento rápido\nno SSD ou acesso remoto pela Nuvem.",
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
      292,
      "COMEÇAR DESAFIO",
      () => this.startChallenge(),
      { border: 0x8ef28b, hover: 0x246a69 },
    );
    this.createBackLink();
  }

  startChallenge() {
    this.phase7Score = PHASE7_STARTING_SCORE;
    this.phase7SelectedId = null;
    this.phase7Assignments = new Map();
    this.phase7ConnectionOnline = true;
    this.phase7ConnectionEventUsed = false;
    this.phase7ConnectionTween = null;
    this.phase7IsComplete = false;
    this.phase7FileCards = new Map();
    this.phase7ControlButtons = [];
    this.phase7WrongIds = new Set();

    this.setupRandomChallenge();
    this.clearStage();
    this.phase7Stage = this.add.container(0, 0);

    this.createChallengeHeader();
    this.createStorageAreas();
    this.createFileList();
    this.createControls();
    this.createFeedbackBox();
    this.createBackLink();
    this.updateCapacityBar();
    this.updateConnectionStatus();
    this.updateStorageLists();
    this.updateInstruction();

    this.phase7Stage.setAlpha(0);
    this.tweens.add({
      targets: this.phase7Stage,
      alpha: 1,
      duration: 280,
      ease: "Sine.out",
    });
  }

  setupRandomChallenge() {
    const previousSignature = this.phase7ChallengeSignature;

    for (let attempt = 0; attempt < 160; attempt += 1) {
      const fileCount = Phaser.Math.Between(
        PHASE7_MIN_FILES,
        PHASE7_MAX_FILES,
      );
      const selectedTemplates = [
        ...this.shuffleItems(PHASE7_SSD_FILES).slice(0, 3).map((file) => ({
          ...file,
          target: "ssd",
        })),
        ...this.shuffleItems(PHASE7_CLOUD_FILES).slice(0, 3).map((file) => ({
          ...file,
          target: "cloud",
        })),
      ];

      const selectedIds = new Set(selectedTemplates.map((file) => file.id));
      const extraPool = this.shuffleItems([
        ...PHASE7_SSD_FILES.map((file) => ({ ...file, target: "ssd" })),
        ...PHASE7_CLOUD_FILES.map((file) => ({ ...file, target: "cloud" })),
        ...PHASE7_FLEX_FILES.map((file) => {
          const target = Phaser.Math.Between(0, 1) === 0 ? "ssd" : "cloud";
          return {
            ...file,
            target,
            use: file.uses[target],
          };
        }),
      ]).filter((file) => !selectedIds.has(file.id));

      while (
        selectedTemplates.length < fileCount &&
        extraPool.length > 0
      ) {
        const nextFile = extraPool.pop();
        selectedTemplates.push(nextFile);
        selectedIds.add(nextFile.id);
      }

      const files = this.shuffleItems(
        selectedTemplates.map((template) => ({
          id: template.id,
          name: template.name,
          type: template.type,
          size: Phaser.Math.Between(template.minSize, template.maxSize),
          use: template.use,
          target: template.target,
        })),
      );
      const ssdTotal = files
        .filter((file) => file.target === "ssd")
        .reduce((total, file) => total + file.size, 0);
      const cloudCount = files.filter(
        (file) => file.target === "cloud",
      ).length;
      const ssdCount = files.length - cloudCount;

      if (ssdCount < 3 || cloudCount < 3) {
        continue;
      }

      const capacityPadding = Phaser.Math.Between(45, 105);
      const capacity = Math.min(
        700,
        Math.max(400, Math.ceil((ssdTotal + capacityPadding) / 50) * 50),
      );
      const connectionTrigger = Phaser.Math.Between(
        2,
        Math.min(4, files.length - 2),
      );
      const signature = files
        .map((file) => `${file.id}:${file.size}:${file.target}`)
        .join("|");

      if (signature !== previousSignature && ssdTotal <= capacity) {
        this.phase7Files = files;
        this.phase7SSDCapacity = capacity;
        this.phase7ConnectionTrigger = connectionTrigger;
        this.phase7ChallengeSignature = signature;
        return;
      }
    }

    this.createFallbackChallenge();
  }

  createFallbackChallenge() {
    this.phase7Files = this.shuffleItems([
      {
        id: "operating-system",
        name: "sistema_operacional.sys",
        type: "SYS",
        size: 130,
        use: "inicialização rápida",
        target: "ssd",
      },
      {
        id: "video-editor",
        name: "editor_video.exe",
        type: "EXE",
        size: 90,
        use: "programa pesado",
        target: "ssd",
      },
      {
        id: "local-database",
        name: "banco_local.db",
        type: "DB",
        size: 70,
        use: "consultas frequentes",
        target: "ssd",
      },
      {
        id: "travel-photos",
        name: "fotos_viagem.zip",
        type: "ZIP",
        size: 150,
        use: "acesso em vários aparelhos",
        target: "cloud",
      },
      {
        id: "important-backup",
        name: "backup_importante.zip",
        type: "ZIP",
        size: 180,
        use: "cópia de segurança",
        target: "cloud",
      },
      {
        id: "college-work",
        name: "trabalho_faculdade.docx",
        type: "DOC",
        size: 18,
        use: "documento compartilhado",
        target: "cloud",
      },
      {
        id: "slides",
        name: "apresentacao.pptx",
        type: "PPT",
        size: 38,
        use: "editar com outras pessoas",
        target: "cloud",
      },
    ]);
    this.phase7SSDCapacity = 400;
    this.phase7ConnectionTrigger = 3;
    this.phase7ChallengeSignature = this.phase7Files
      .map((file) => `${file.id}:${file.size}:${file.target}`)
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

  createChallengeHeader() {
    this.addToStage(
      this.add
        .text(480, 28, "FASE 7: SSD E NUVEM", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "14px",
          color: "#8ef28b",
        })
        .setOrigin(0.5),
    );

    this.addToStage(
      createRoundedPanel(this, 852, 29, 136, 30, {
        fill: 0x091424,
        stroke: 0x8ef28b,
        strokeAlpha: 0.34,
        radius: 9,
        shadow: false,
        highlight: false,
      }),
    );
    this.phase7ScoreText = this.add
      .text(852, 29, "PONTOS: 100", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#8ef28b",
      })
      .setOrigin(0.5);
    this.addToStage(this.phase7ScoreText);

    this.addToStage(
      createRoundedPanel(this, 480, 67, 760, 40, {
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
          "Objetivo: escolha o melhor local para cada arquivo: SSD ou Nuvem.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "16px",
            fontStyle: "900",
            color: "#ffd166",
          },
        )
        .setOrigin(0.5),
    );

    this.addToStage(
      createRoundedPanel(this, 480, 108, 760, 28, {
        fill: 0x091424,
        stroke: 0x62e7f2,
        strokeAlpha: 0.24,
        radius: 8,
        shadow: false,
        highlight: false,
      }),
    );
    this.phase7InstructionText = this.add
      .text(480, 108, "", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "13px",
        fontStyle: "800",
        color: "#dce8f5",
        align: "center",
      })
      .setOrigin(0.5);
    this.addToStage(this.phase7InstructionText);
  }

  createStorageAreas() {
    this.createSSDPanel();
    this.createCloudPanel();
  }

  createSSDPanel() {
    this.phase7SSDContainer = this.add.container(250, 204);
    this.addToStage(this.phase7SSDContainer);
    this.phase7SSDContainer.add(
      createRoundedPanel(this, 0, 0, 410, 150, {
        fill: 0x0d1d2d,
        stroke: 0x8ef28b,
        strokeAlpha: 0.65,
        radius: 16,
      }),
    );

    const title = this.add
      .text(0, -57, "SSD — RÁPIDO E LOCAL", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "9px",
        color: "#8ef28b",
      })
      .setOrigin(0.5);
    const subtitle = this.add
      .text(0, -39, "memória flash • sem partes mecânicas", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "11px",
        fontStyle: "800",
        color: "#9cc9b8",
      })
      .setOrigin(0.5);
    this.phase7SSDContainer.add([title, subtitle]);

    const icon = this.add.graphics();
    icon.fillStyle(0x07101f, 1);
    icon.fillRoundedRect(-183, -24, 76, 62, 9);
    icon.lineStyle(2, 0x8ef28b, 0.75);
    icon.strokeRoundedRect(-183, -24, 76, 62, 9);
    icon.fillStyle(0x8ef28b, 0.2);
    icon.fillRoundedRect(-169, -7, 48, 8, 3);
    icon.fillRoundedRect(-169, 10, 36, 8, 3);
    icon.fillStyle(0x8ef28b, 0.85);
    icon.fillCircle(-119, 25, 4);
    this.phase7SSDContainer.add(icon);

    const filesLabel = this.add
      .text(42, -20, "ARQUIVOS NO SSD", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#8ef28b",
      })
      .setOrigin(0.5);
    this.phase7SSDListText = this.add
      .text(42, 9, "Nenhum arquivo salvo", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "11px",
        fontStyle: "800",
        color: "#73879e",
        align: "center",
        lineSpacing: 1,
        wordWrap: { width: 220 },
      })
      .setOrigin(0.5);
    this.phase7SSDContainer.add([filesLabel, this.phase7SSDListText]);

    this.phase7SSDCapacityBack = this.add
      .rectangle(-176, 55, 352, 12, 0x07101f, 1)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x496078, 0.9);
    this.phase7SSDCapacityFill = this.add
      .rectangle(-175, 55, 350, 10, 0x8ef28b, 1)
      .setOrigin(0, 0.5)
      .setScale(0, 1);
    this.phase7CapacityText = this.add
      .text(0, 69, "", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#a9bdd1",
      })
      .setOrigin(0.5);
    this.phase7SSDContainer.add([
      this.phase7SSDCapacityBack,
      this.phase7SSDCapacityFill,
      this.phase7CapacityText,
    ]);
  }

  createCloudPanel() {
    this.phase7CloudContainer = this.add.container(710, 204);
    this.addToStage(this.phase7CloudContainer);
    this.phase7CloudContainer.add(
      createRoundedPanel(this, 0, 0, 410, 150, {
        fill: 0x0c1930,
        stroke: 0x70b7ff,
        strokeAlpha: 0.65,
        radius: 16,
      }),
    );

    const title = this.add
      .text(0, -57, "NUVEM — REMOTO E ONLINE", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "9px",
        color: "#70b7ff",
      })
      .setOrigin(0.5);
    const subtitle = this.add
      .text(0, -39, "servidores externos • acesso pela internet", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "11px",
        fontStyle: "800",
        color: "#9ebde4",
      })
      .setOrigin(0.5);
    this.phase7CloudContainer.add([title, subtitle]);

    const icon = this.add.graphics();
    icon.fillStyle(0x70b7ff, 0.18);
    icon.fillCircle(132, 2, 24);
    icon.fillCircle(158, -8, 29);
    icon.fillCircle(181, 5, 20);
    icon.fillRoundedRect(111, 2, 91, 38, 18);
    icon.lineStyle(2, 0x70b7ff, 0.7);
    icon.strokeRoundedRect(115, 5, 83, 32, 15);
    icon.fillStyle(0x62e7f2, 0.42);
    icon.fillRoundedRect(137, 14, 38, 5, 2);
    icon.fillRoundedRect(137, 25, 38, 5, 2);
    this.phase7CloudContainer.add(icon);

    const filesLabel = this.add
      .text(-45, -20, "ARQUIVOS NA NUVEM", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#70b7ff",
      })
      .setOrigin(0.5);
    this.phase7CloudListText = this.add
      .text(-45, 9, "Nenhum arquivo enviado", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "11px",
        fontStyle: "800",
        color: "#73879e",
        align: "center",
        lineSpacing: 1,
        wordWrap: { width: 220 },
      })
      .setOrigin(0.5);
    this.phase7CloudContainer.add([filesLabel, this.phase7CloudListText]);

    this.phase7ConnectionBadge = this.add.container(0, 56);
    this.phase7ConnectionBadgeBackground = this.add
      .rectangle(0, 0, 250, 25, 0x102b2b, 1)
      .setStrokeStyle(1, 0x8ef28b, 0.65);
    this.phase7ConnectionLight = this.add.circle(-98, 0, 5, 0x8ef28b, 1);
    this.phase7ConnectionText = this.add
      .text(8, 0, "CONEXÃO: ONLINE", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "7px",
        color: "#8ef28b",
      })
      .setOrigin(0.5);
    this.phase7ConnectionBadge.add([
      this.phase7ConnectionBadgeBackground,
      this.phase7ConnectionLight,
      this.phase7ConnectionText,
    ]);
    this.phase7CloudContainer.add(this.phase7ConnectionBadge);
  }

  createFileList() {
    this.addToStage(
      createRoundedPanel(this, 300, 382, 520, 184, {
        fill: 0x0d1930,
        stroke: 0x62e7f2,
        strokeAlpha: 0.42,
        radius: 15,
      }),
    );
    this.addToStage(
      this.add
        .text(300, 304, "ARQUIVOS DISPONÍVEIS", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#62e7f2",
        })
        .setOrigin(0.5),
    );

    this.phase7Files.forEach((file, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = column === 0 ? 173 : 427;
      const y = 331 + row * 37;
      this.createFileCard(file, x, y);
    });
  }

  createFileCard(file, x, y) {
    const card = this.add.container(x, y);
    const background = this.add
      .rectangle(0, 0, 240, 32, 0x13283a, 1)
      .setStrokeStyle(1, 0x34465d, 0.9)
      .setInteractive({ useHandCursor: true });
    const iconColor = PHASE7_TYPE_COLORS[file.type] ?? 0x62e7f2;
    const icon = this.add
      .rectangle(-105, 0, 23, 23, iconColor, 0.9)
      .setStrokeStyle(1, 0xffffff, 0.2);
    const type = this.add
      .text(-105, 0, file.type, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "5px",
        color: "#07101f",
      })
      .setOrigin(0.5);
    const nameText = this.add
      .text(-88, -7, file.name, {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "10px",
        fontStyle: "900",
        color: "#e8f1fa",
      })
      .setOrigin(0, 0.5);
    const useText = this.add
      .text(-88, 8, file.use, {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "8px",
        fontStyle: "700",
        color: "#91a7bd",
      })
      .setOrigin(0, 0.5);
    const stateText = this.add
      .text(113, -7, `${file.size} GB`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "5px",
        color: "#ffd166",
        align: "right",
      })
      .setOrigin(1, 0.5);
    const destinationText = this.add
      .text(113, 8, "NÃO ARMAZENADO", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "4px",
        color: "#5f7389",
        align: "right",
      })
      .setOrigin(1, 0.5);

    card.add([
      background,
      icon,
      type,
      nameText,
      useText,
      stateText,
      destinationText,
    ]);
    this.addToStage(card);

    background.on("pointerover", () => {
      if (this.phase7SelectedId !== file.id) {
        background.setFillStyle(0x1a4052, 1);
      }
    });
    background.on("pointerout", () => this.updateFileCard(file.id));
    background.on("pointerdown", () => this.selectFile(file.id));

    this.phase7FileCards.set(file.id, {
      card,
      background,
      destinationText,
      x,
      y,
    });
  }

  createControls() {
    this.addToStage(
      createRoundedPanel(this, 750, 382, 340, 184, {
        fill: 0x101f35,
        stroke: 0xffd166,
        strokeAlpha: 0.36,
        radius: 15,
      }),
    );
    this.addToStage(
      this.add
        .text(750, 304, "ARQUIVO SELECIONADO", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: "#ffd166",
        })
        .setOrigin(0.5),
    );
    this.phase7SelectedNameText = this.add
      .text(750, 327, "Nenhum arquivo", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "15px",
        fontStyle: "900",
        color: "#dce8f5",
      })
      .setOrigin(0.5);
    this.phase7SelectedUseText = this.add
      .text(750, 347, "Selecione um card ao lado.", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "11px",
        fontStyle: "700",
        color: "#8da2bd",
      })
      .setOrigin(0.5);
    this.addToStage(this.phase7SelectedNameText);
    this.addToStage(this.phase7SelectedUseText);

    this.phase7SSDButton = this.createButton(
      666,
      378,
      148,
      "SALVAR NO SSD",
      () => this.saveToSSD(),
      {
        height: 34,
        border: 0x8ef28b,
        hover: 0x246a69,
        fontSize: "7px",
      },
    );
    this.phase7CloudButton = this.createButton(
      834,
      378,
      148,
      "ENVIAR À NUVEM",
      () => this.uploadToCloud(),
      {
        height: 34,
        border: 0x70b7ff,
        hover: 0x1c5264,
        fontSize: "7px",
      },
    );

    this.phase7TipText = this.add
      .text(
        750,
        414,
        "SSD = velocidade local  |  Nuvem = acesso remoto",
        {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "11px",
          fontStyle: "900",
          color: "#9fb4c9",
          align: "center",
        },
      )
      .setOrigin(0.5);
    this.addToStage(this.phase7TipText);

    this.phase7RestoreButton = this.createButton(
      750,
      415,
      300,
      "RESTABELECER CONEXÃO",
      () => this.restoreConnection(),
      {
        height: 32,
        border: 0xffd166,
        hover: 0x5c4b22,
        fontSize: "7px",
      },
    );
    this.phase7RestoreButton.setVisible(false);
    this.phase7RestoreButton.setEnabled(false);

    this.phase7VerifyButton = this.createButton(
      750,
      453,
      300,
      "VERIFICAR ARMAZENAMENTO",
      () => this.verifyStorage(),
      {
        height: 34,
        border: 0x62e7f2,
        hover: 0x1c5264,
        fontSize: "7px",
      },
    );
    this.phase7ControlButtons.push(
      this.phase7SSDButton,
      this.phase7CloudButton,
      this.phase7RestoreButton,
      this.phase7VerifyButton,
    );
  }

  createFeedbackBox() {
    this.addToStage(
      createRoundedPanel(this, 480, 505, 840, 34, {
        fill: 0x091424,
        stroke: 0x62e7f2,
        strokeAlpha: 0.26,
        radius: 10,
        shadow: false,
        highlight: false,
      }),
    );
    this.phase7FeedbackDot = this.add.circle(
      80,
      505,
      5,
      0x62e7f2,
      0.95,
    );
    this.phase7FeedbackText = this.add
      .text(
        480,
        505,
        "Selecione um arquivo e escolha onde armazená-lo.",
        {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "14px",
          fontStyle: "800",
          color: "#8da2bd",
          align: "center",
          wordWrap: { width: 760 },
        },
      )
      .setOrigin(0.5);
    this.addToStage(this.phase7FeedbackDot);
    this.addToStage(this.phase7FeedbackText);
  }

  selectFile(fileId) {
    if (this.phase7IsComplete) {
      return;
    }

    this.phase7SelectedId = fileId;
    this.phase7WrongIds.delete(fileId);
    this.phase7Files.forEach((file) => this.updateFileCard(file.id));

    const file = this.getFile(fileId);
    this.phase7SelectedNameText.setText(file.name);
    this.phase7SelectedUseText.setText(
      `${file.size} GB • ${file.use}`,
    );
    this.updateInstruction();
    this.showFeedback(
      `Selecionado: ${file.name}. Qual destino combina com esse uso?`,
      "warning",
    );

    const card = this.phase7FileCards.get(fileId);
    this.tweens.add({
      targets: card.card,
      scale: 1.035,
      duration: 95,
      yoyo: true,
      ease: "Sine.inOut",
    });
  }

  saveToSSD() {
    if (!this.phase7SelectedId || this.phase7IsComplete) {
      this.showFeedback(
        "Selecione um arquivo antes de escolher o destino.",
        "error",
      );
      return;
    }

    const file = this.getFile(this.phase7SelectedId);
    const previousDestination = this.phase7Assignments.get(file.id);
    const usedWithoutCurrent =
      this.getSSDUsed() -
      (previousDestination === "ssd" ? file.size : 0);

    if (usedWithoutCurrent + file.size > this.phase7SSDCapacity) {
      this.updateScore(-PHASE7_CAPACITY_PENALTY);
      this.showFeedback("Espaço insuficiente no SSD.", "error");
      this.shakeCapacityBar();
      return;
    }

    this.phase7Assignments.set(file.id, "ssd");
    this.phase7WrongIds.delete(file.id);
    this.updateFileCard(file.id);
    this.updateCapacityBar();
    this.updateStorageLists();
    this.animateFileTo(file.id, 250, 204, 0x8ef28b);
    this.pulseStorage(this.phase7SSDContainer, 250, 204, 0x8ef28b);
    this.showFeedback("Arquivo salvo no SSD.", "success");
    this.updateInstruction();
    this.maybeTriggerConnectionInstability();
  }

  uploadToCloud() {
    if (!this.phase7SelectedId || this.phase7IsComplete) {
      this.showFeedback(
        "Selecione um arquivo antes de escolher o destino.",
        "error",
      );
      return;
    }

    if (!this.phase7ConnectionOnline) {
      this.updateScore(-PHASE7_CONNECTION_PENALTY);
      this.showFeedback(
        "Sem conexão. Restabeleça a internet antes de enviar.",
        "error",
      );
      this.flashConnectionWarning();
      return;
    }

    const file = this.getFile(this.phase7SelectedId);
    this.phase7Assignments.set(file.id, "cloud");
    this.phase7WrongIds.delete(file.id);
    this.updateFileCard(file.id);
    this.updateCapacityBar();
    this.updateStorageLists();
    this.animateFileTo(file.id, 710, 204, 0x70b7ff);
    this.pulseStorage(this.phase7CloudContainer, 710, 204, 0x70b7ff);
    this.showFeedback("Arquivo enviado para a Nuvem.", "success");
    this.updateInstruction();
    this.maybeTriggerConnectionInstability();
  }

  maybeTriggerConnectionInstability() {
    if (
      this.phase7ConnectionEventUsed ||
      this.phase7Assignments.size < this.phase7ConnectionTrigger
    ) {
      return;
    }

    this.phase7ConnectionEventUsed = true;
    this.phase7ConnectionOnline = false;
    this.updateConnectionStatus();
    this.updateInstruction();
    this.showFeedback(
      "Conexão instável. Restabeleça a internet para continuar os envios.",
      "warning",
    );
  }

  restoreConnection() {
    if (this.phase7IsComplete) {
      return;
    }

    if (this.phase7ConnectionOnline) {
      this.showFeedback("A conexão já está online.", "neutral");
      return;
    }

    this.phase7ConnectionOnline = true;
    this.updateConnectionStatus();
    this.updateInstruction();
    this.showFeedback("Conexão restabelecida.", "success");
    this.tweens.add({
      targets: this.phase7ConnectionLight,
      scale: 1.7,
      duration: 130,
      yoyo: true,
      ease: "Sine.inOut",
    });
  }

  verifyStorage() {
    if (this.phase7IsComplete) {
      return;
    }

    if (this.phase7Assignments.size < this.phase7Files.length) {
      const remaining =
        this.phase7Files.length - this.phase7Assignments.size;
      this.updateScore(-PHASE7_VERIFY_PENALTY);
      this.showFeedback(
        `Ainda faltam ${remaining} arquivo${remaining === 1 ? "" : "s"} sem destino.`,
        "error",
      );
      return;
    }

    if (!this.phase7ConnectionOnline) {
      this.updateScore(-PHASE7_CONNECTION_PENALTY);
      this.showFeedback(
        "Restabeleça a conexão antes de verificar o armazenamento.",
        "error",
      );
      this.flashConnectionWarning();
      return;
    }

    const wrongFiles = this.phase7Files.filter(
      (file) => this.phase7Assignments.get(file.id) !== file.target,
    );

    if (wrongFiles.length > 0) {
      this.updateScore(
        -(
          PHASE7_VERIFY_PENALTY +
          wrongFiles.length * PHASE7_WRONG_FILE_PENALTY
        ),
      );
      this.phase7WrongIds = new Set(wrongFiles.map((file) => file.id));
      wrongFiles.forEach((file) => {
        this.updateFileCard(file.id);
        const card = this.phase7FileCards.get(file.id);
        this.tweens.add({
          targets: card.card,
          x: card.x + 5,
          duration: 55,
          yoyo: true,
          repeat: 2,
          ease: "Sine.inOut",
          onComplete: () => card.card.setX(card.x),
        });
      });

      const firstWrong = wrongFiles[0];
      const destination =
        firstWrong.target === "ssd" ? "no SSD" : "na Nuvem";
      this.showFeedback(
        `${firstWrong.name} ficaria melhor ${destination}. Revise as escolhas.`,
        "error",
      );
      return;
    }

    this.phase7IsComplete = true;
    this.disableChallengeControls();
    this.showFeedback("Arquivos organizados corretamente!", "success");
    this.pulseStorage(this.phase7SSDContainer, 250, 204, 0x8ef28b);
    this.pulseStorage(this.phase7CloudContainer, 710, 204, 0x70b7ff);
    this.createCelebrationParticles();
    this.time.delayedCall(1000, () => this.showFinalConclusion());
  }

  updateFileCard(fileId) {
    const card = this.phase7FileCards.get(fileId);

    if (!card) {
      return;
    }

    const assignment = this.phase7Assignments.get(fileId);
    const selected = this.phase7SelectedId === fileId;
    const wrong = this.phase7WrongIds.has(fileId);
    const fillColor = selected
      ? 0x194b59
      : assignment
        ? 0x142f42
        : 0x13283a;
    let strokeColor = 0x34465d;
    let destinationText = "NÃO ARMAZENADO";
    let destinationColor = "#5f7389";

    if (assignment === "ssd") {
      strokeColor = 0x8ef28b;
      destinationText = "NO SSD";
      destinationColor = "#8ef28b";
    } else if (assignment === "cloud") {
      strokeColor = 0x70b7ff;
      destinationText = "NA NUVEM";
      destinationColor = "#70b7ff";
    }

    if (wrong) {
      strokeColor = 0xff7b68;
      destinationColor = "#ff9b78";
    }

    card.background
      .setFillStyle(fillColor, 1)
      .setStrokeStyle(selected || wrong ? 2 : 1, strokeColor, 0.95);
    card.destinationText
      .setText(wrong ? `REVISE: ${destinationText}` : destinationText)
      .setColor(destinationColor);
  }

  updateStorageLists() {
    const ssdFiles = this.getAssignedFiles("ssd");
    const cloudFiles = this.getAssignedFiles("cloud");

    this.phase7SSDListText
      .setText(
        ssdFiles.length
          ? ssdFiles.map((file) => `• ${this.shortName(file.name)}`).join("\n")
          : "Nenhum arquivo salvo",
      )
      .setColor(ssdFiles.length ? "#dce8f5" : "#73879e");
    this.phase7CloudListText
      .setText(
        cloudFiles.length
          ? cloudFiles
              .map((file) => `• ${this.shortName(file.name)}`)
              .join("\n")
          : "Nenhum arquivo enviado",
      )
      .setColor(cloudFiles.length ? "#dce8f5" : "#73879e");
  }

  updateCapacityBar() {
    const used = this.getSSDUsed();
    const ratio = Math.min(used / this.phase7SSDCapacity, 1);
    const fillColor =
      ratio >= 0.86 ? 0xffd166 : ratio >= 0.68 ? 0x62e7f2 : 0x8ef28b;

    this.phase7SSDCapacityFill.setFillStyle(fillColor, 1);
    this.tweens.add({
      targets: this.phase7SSDCapacityFill,
      scaleX: ratio,
      duration: 190,
      ease: "Sine.out",
    });
    this.phase7CapacityText
      .setText(`SSD: ${used} / ${this.phase7SSDCapacity} GB`)
      .setColor(ratio >= 0.86 ? "#ffd166" : "#a9bdd1");
  }

  updateConnectionStatus() {
    if (this.phase7ConnectionTween) {
      this.phase7ConnectionTween.stop();
      this.phase7ConnectionTween = null;
    }

    this.phase7ConnectionLight.setAlpha(1).setScale(1);

    if (this.phase7ConnectionOnline) {
      this.phase7ConnectionBadgeBackground
        .setFillStyle(0x102b2b, 1)
        .setStrokeStyle(1, 0x8ef28b, 0.7);
      this.phase7ConnectionLight.setFillStyle(0x8ef28b, 1);
      this.phase7ConnectionText
        .setText("CONEXÃO: ONLINE")
        .setColor("#8ef28b");
      this.phase7RestoreButton?.setVisible(false);
      this.phase7RestoreButton?.setEnabled(false);
      this.phase7TipText?.setVisible(true);
      return;
    }

    this.phase7ConnectionBadgeBackground
      .setFillStyle(0x3a2914, 1)
      .setStrokeStyle(2, 0xffd166, 0.95);
    this.phase7ConnectionLight.setFillStyle(0xffd166, 1);
    this.phase7ConnectionText
      .setText("CONEXÃO: INSTÁVEL")
      .setColor("#ffd166");
    this.phase7RestoreButton?.setVisible(true);
    this.phase7RestoreButton?.setEnabled(true);
    this.phase7TipText?.setVisible(false);
    this.phase7ConnectionTween = this.tweens.add({
      targets: this.phase7ConnectionLight,
      alpha: 0.3,
      scale: 1.35,
      duration: 320,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  updateInstruction() {
    if (!this.phase7InstructionText) {
      return;
    }

    if (!this.phase7ConnectionOnline) {
      this.phase7InstructionText
        .setText("Etapa atual: restabeleça a conexão da Nuvem.")
        .setColor("#ffd166");
      return;
    }

    if (this.phase7Assignments.size === this.phase7Files.length) {
      this.phase7InstructionText
        .setText("Etapa atual: revise as escolhas e verifique o armazenamento.")
        .setColor("#8ef28b");
      return;
    }

    if (this.phase7SelectedId) {
      const file = this.getFile(this.phase7SelectedId);
      this.phase7InstructionText
        .setText(`Etapa atual: escolha o destino de ${file.name}.`)
        .setColor("#dce8f5");
      return;
    }

    this.phase7InstructionText
      .setText("Etapa atual: selecione um arquivo disponível.")
      .setColor("#dce8f5");
  }

  updateScore(change) {
    this.phase7Score = Phaser.Math.Clamp(
      this.phase7Score + change,
      0,
      PHASE7_STARTING_SCORE,
    );
    this.phase7ScoreText.setText(`PONTOS: ${this.phase7Score}`);
    this.tweens.add({
      targets: this.phase7ScoreText,
      scale: 1.14,
      duration: 100,
      yoyo: true,
      ease: "Sine.inOut",
    });
  }

  showFeedback(message, type = "neutral") {
    const states = {
      neutral: { color: "#8da2bd", accent: 0x62e7f2 },
      success: { color: "#8ef28b", accent: 0x8ef28b },
      warning: { color: "#ffd166", accent: 0xffd166 },
      error: { color: "#ff9b78", accent: 0xff7b68 },
    };
    const state = states[type] ?? states.neutral;

    this.phase7FeedbackText.setText(message).setColor(state.color);
    this.phase7FeedbackDot.setFillStyle(state.accent, 0.95);
    this.tweens.killTweensOf([
      this.phase7FeedbackText,
      this.phase7FeedbackDot,
    ]);

    if (type === "error") {
      this.cameras.main.shake(100, 0.0015);
    }

    this.tweens.add({
      targets: [this.phase7FeedbackText, this.phase7FeedbackDot],
      scale: 1.055,
      duration: 100,
      yoyo: true,
      ease: "Sine.inOut",
    });
  }

  getAssignedFiles(destination) {
    return this.phase7Files.filter(
      (file) => this.phase7Assignments.get(file.id) === destination,
    );
  }

  getSSDUsed() {
    return this.getAssignedFiles("ssd").reduce(
      (total, file) => total + file.size,
      0,
    );
  }

  getFile(fileId) {
    return this.phase7Files.find((file) => file.id === fileId);
  }

  shortName(name) {
    const withoutExtension = name.replace(/\.[^.]+$/, "");
    return withoutExtension.length > 20
      ? `${withoutExtension.slice(0, 18)}…`
      : withoutExtension;
  }

  animateFileTo(fileId, endX, endY, color) {
    const card = this.phase7FileCards.get(fileId);
    const packet = this.add
      .rectangle(card.x, card.y, 32, 20, color, 0.92)
      .setStrokeStyle(1, 0xffffff, 0.45);
    const bit = this.add
      .text(card.x, card.y, "ARQ", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "5px",
        color: "#07101f",
      })
      .setOrigin(0.5);
    this.addToStage(packet);
    this.addToStage(bit);

    this.tweens.add({
      targets: [packet, bit],
      x: endX,
      y: endY,
      alpha: 0,
      scale: 0.4,
      duration: 430,
      ease: "Sine.inOut",
      onComplete: () => {
        packet.destroy();
        bit.destroy();
      },
    });
  }

  pulseStorage(target, x, y, color) {
    this.tweens.add({
      targets: target,
      scale: 1.025,
      duration: 125,
      yoyo: true,
      ease: "Sine.inOut",
    });

    const glow = this.add
      .rectangle(x, y, 390, 136, color, 0)
      .setStrokeStyle(3, color, 0.5);
    this.addToStage(glow);
    this.tweens.add({
      targets: glow,
      scale: 1.035,
      alpha: 0,
      duration: 420,
      onComplete: () => glow.destroy(),
    });
  }

  shakeCapacityBar() {
    this.phase7SSDCapacityFill.setFillStyle(0xff7b68, 1);
    this.tweens.add({
      targets: [
        this.phase7SSDCapacityBack,
        this.phase7SSDCapacityFill,
        this.phase7CapacityText,
      ],
      x: "+=6",
      duration: 55,
      yoyo: true,
      repeat: 3,
      onComplete: () => this.updateCapacityBar(),
    });
  }

  flashConnectionWarning() {
    this.tweens.add({
      targets: this.phase7ConnectionBadge,
      alpha: 0.25,
      duration: 90,
      yoyo: true,
      repeat: 3,
      ease: "Sine.inOut",
    });
  }

  disableChallengeControls() {
    this.phase7ControlButtons.forEach((button) =>
      button.setEnabled(false),
    );
    this.phase7FileCards.forEach(({ background }) =>
      background.disableInteractive(),
    );
  }

  showFinalConclusion() {
    completePhase(7);

    const finalScore = this.phase7Score;
    this.clearStage();
    this.phase7Stage = this.add.container(0, 0);

    const glow = this.add
      .circle(480, 124, 94, 0x8ef28b, 0.06)
      .setStrokeStyle(2, 0x62e7f2, 0.32);
    this.addToStage(glow);
    this.tweens.add({
      targets: glow,
      scale: 1.16,
      alpha: 0.025,
      duration: 980,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    this.addToStage(
      this.add
        .text(480, 50, "JORNADA CONCLUÍDA!", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "21px",
          color: "#8ef28b",
        })
        .setOrigin(0.5),
    );

    this.createJourneyIcon(480, 126);

    this.addToStage(
      createRoundedPanel(this, 480, 302, 790, 244, {
        fill: 0x0d1930,
        stroke: 0x62e7f2,
        strokeAlpha: 0.48,
        radius: 19,
      }),
    );

    this.addToStage(
      this.add
        .text(
          480,
          230,
          "Parabéns! Você completou a Jornada do Bit e acompanhou a evolução\ndos cartões perfurados até os SSDs e a Nuvem.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "18px",
            fontStyle: "900",
            color: "#f1f7ff",
            align: "center",
            lineSpacing: 6,
            wordWrap: { width: 720 },
          },
        )
        .setOrigin(0.5),
    );

    this.addToStage(
      this.add
        .text(
          480,
          309,
          "O armazenamento começou físico, limitado e lento; passou por mídias\nmagnéticas e ópticas; e chegou à memória flash e ao acesso online.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "16px",
            fontStyle: "700",
            color: "#c7d7e8",
            align: "center",
            lineSpacing: 5,
            wordWrap: { width: 710 },
          },
        )
        .setOrigin(0.5),
    );

    this.addToStage(
      this.add
        .text(
          480,
          377,
          `PONTUAÇÃO DA FASE: ${finalScore}`,
          {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "12px",
            color: "#ffd166",
          },
        )
        .setOrigin(0.5),
    );

    this.createButton(
      304,
      462,
      310,
      "VOLTAR À LINHA DO TEMPO",
      () => this.returnToTimeline(),
      {
        border: 0x62e7f2,
        hover: 0x1c5264,
        fontSize: "8px",
      },
    );
    this.createButton(
      656,
      462,
      270,
      "JOGAR NOVAMENTE",
      () => this.restartPhase(),
      {
        border: 0x8ef28b,
        hover: 0x246a69,
        fontSize: "9px",
      },
    );

    this.createCelebrationParticles();
  }

  restartPhase() {
    this.cameras.main.fadeOut(180, 7, 16, 31);
    this.time.delayedCall(190, () => {
      this.startChallenge();
      this.cameras.main.fadeIn(220, 7, 16, 31);
    });
  }

  returnToTimeline() {
    this.cameras.main.fadeOut(200, 7, 16, 31);
    this.time.delayedCall(210, () =>
      this.scene.start("TimelineScene"),
    );
  }

  createIntroStorageIcon(x, y) {
    const container = this.add.container(x, y);
    this.addToStage(container);

    const graphics = this.add.graphics();
    graphics.fillStyle(0x101f35, 1);
    graphics.fillRoundedRect(-156, -46, 120, 92, 12);
    graphics.lineStyle(2, 0x8ef28b, 0.85);
    graphics.strokeRoundedRect(-156, -46, 120, 92, 12);
    graphics.fillStyle(0x8ef28b, 0.2);
    graphics.fillRoundedRect(-136, -18, 78, 11, 4);
    graphics.fillRoundedRect(-136, 5, 56, 11, 4);
    graphics.fillStyle(0x8ef28b, 0.85);
    graphics.fillCircle(-51, 31, 5);

    graphics.fillStyle(0x70b7ff, 0.25);
    graphics.fillCircle(62, -8, 32);
    graphics.fillCircle(102, -19, 39);
    graphics.fillCircle(140, -4, 28);
    graphics.fillRoundedRect(48, -8, 110, 47, 24);
    graphics.lineStyle(2, 0x70b7ff, 0.8);
    graphics.strokeRoundedRect(52, -4, 102, 39, 18);
    graphics.fillStyle(0x62e7f2, 0.38);
    graphics.fillRoundedRect(79, 8, 52, 7, 3);
    graphics.fillRoundedRect(79, 22, 52, 7, 3);

    graphics.lineStyle(3, 0xffd166, 0.62);
    graphics.lineBetween(-21, 0, 28, 0);
    graphics.fillTriangle(28, 0, 14, -8, 14, 8);
    container.add(graphics);

    const label = this.add
      .text(0, -70, "FLASH LOCAL + SERVIDORES ONLINE", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#ffd166",
      })
      .setOrigin(0.5);
    container.add(label);

    this.tweens.add({
      targets: container,
      y: y + 6,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  createJourneyIcon(x, y) {
    const container = this.add.container(x, y);
    this.addToStage(container);
    const graphics = this.add.graphics();

    graphics.lineStyle(3, 0xffd166, 0.62);
    graphics.lineBetween(-150, 18, 150, 18);
    const colors = [
      0xffd166,
      0xc49cff,
      0x70b7ff,
      0xff8f70,
      0x62e7f2,
      0x8ef28b,
      0x70b7ff,
    ];
    colors.forEach((color, index) => {
      const pointX = -150 + index * 50;
      graphics.fillStyle(color, 1);
      graphics.fillCircle(pointX, 18, index === 6 ? 10 : 7);
      graphics.fillStyle(color, 0.14);
      graphics.fillCircle(pointX, 18, index === 6 ? 19 : 13);
    });
    container.add(graphics);

    const label = this.add
      .text(0, -13, "7 FASES • UMA JORNADA", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#dce8f5",
      })
      .setOrigin(0.5);
    container.add(label);
  }

  createCelebrationParticles() {
    const colors = [0x8ef28b, 0x70b7ff, 0xffd166, 0x62e7f2];

    for (let index = 0; index < 26; index += 1) {
      const x = 480 + Phaser.Math.Between(-220, 220);
      const y = 95 + Phaser.Math.Between(-20, 80);
      const particle = this.add.rectangle(
        x,
        y,
        Phaser.Math.Between(3, 7),
        Phaser.Math.Between(3, 7),
        colors[index % colors.length],
        0.9,
      );
      this.addToStage(particle);
      this.tweens.add({
        targets: particle,
        x: x + Phaser.Math.Between(-45, 45),
        y: y + Phaser.Math.Between(75, 175),
        angle: Phaser.Math.Between(-180, 180),
        alpha: 0,
        duration: Phaser.Math.Between(720, 1180),
        ease: "Sine.out",
        onComplete: () => particle.destroy(),
      });
    }
  }

  createButton(x, y, width, label, callback, options = {}) {
    const button = createStandardButton(
      this,
      x,
      y,
      width,
      label,
      callback,
      {
        height: options.height ?? 42,
        border: options.border ?? 0x62e7f2,
        hover: options.hover ?? 0x1c5264,
        fontSize: options.fontSize ?? "9px",
        radius: options.radius ?? 11,
      },
    );
    this.addToStage(button);
    return button;
  }

  createBackLink() {
    const back = this.add
      .text(38, 29, "< LINHA DO TEMPO", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "14px",
        fontStyle: "800",
        color: "#8da2bd",
      })
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true });

    back.on("pointerover", () => back.setColor("#62e7f2"));
    back.on("pointerout", () => back.setColor("#8da2bd"));
    back.on("pointerdown", () => this.returnToTimeline());
    this.addToStage(back);
  }

  addToStage(object) {
    if (this.phase7Stage) {
      this.phase7Stage.add(object);
    }
    return object;
  }

  clearStage() {
    if (this.phase7ConnectionTween) {
      this.phase7ConnectionTween.stop();
      this.phase7ConnectionTween = null;
    }

    if (this.phase7Stage) {
      this.phase7Stage.destroy(true);
      this.phase7Stage = null;
    }
  }
}
