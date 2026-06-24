import {
  completePhase,
  getTotalScore,
  isPhaseUnlocked,
  savePhaseScore,
} from "../utils/progressManager.js";
import {
  createRoundedPanel,
  createStandardButton,
  drawRetroBackground,
} from "../utils/visualHelpers.js";

const PHASE7_STARTING_SCORE = 100;
const PHASE7_WRONG_CHOICE_PENALTY = 10;
const PHASE7_CONNECTION_PENALTY = 10;
const PHASE7_CAPACITY_PENALTY = 5;
const PHASE7_FILE_COUNT = 5;
const PHASE7_SSD_CAPACITY_GB = 400;

const PHASE7_SSD_FILES = [
  {
    id: "operating-system",
    name: "sistema_operacional.sys",
    type: "SYS",
    minSize: 115,
    maxSize: 155,
    description: "Precisa abrir rapido e ficar disponivel localmente.",
    correctFeedback: "Boa escolha! Sistema e programas funcionam melhor no SSD.",
    wrongFeedback: "Esse arquivo fica melhor no SSD, pois precisa de velocidade local.",
  },
  {
    id: "video-editor",
    name: "editor_video.exe",
    type: "EXE",
    minSize: 70,
    maxSize: 110,
    description: "Programa pesado usado neste computador.",
    correctFeedback: "Boa escolha! Programas pesados se beneficiam do SSD.",
    wrongFeedback: "Esse programa seria melhor no SSD para abrir mais rapido.",
  },
  {
    id: "heavy-game",
    name: "jogo_pesado.exe",
    type: "EXE",
    minSize: 100,
    maxSize: 150,
    description: "Carrega muitos dados durante o uso.",
    correctFeedback: "Boa escolha! O SSD reduz o tempo de carregamento.",
    wrongFeedback: "Esse jogo seria melhor no SSD por causa dos carregamentos.",
  },
  {
    id: "local-database",
    name: "banco_local.db",
    type: "DB",
    minSize: 55,
    maxSize: 90,
    description: "Precisa de consultas rapidas neste computador.",
    correctFeedback: "Boa escolha! Dados locais frequentes combinam com SSD.",
    wrongFeedback: "Esse banco local ficaria melhor no SSD.",
  },
  {
    id: "main-app",
    name: "app_principal.exe",
    type: "EXE",
    minSize: 45,
    maxSize: 80,
    description: "Aplicativo usado todos os dias.",
    correctFeedback: "Boa escolha! Uso diario pede acesso local rapido.",
    wrongFeedback: "Esse aplicativo seria melhor no SSD.",
  },
];

const PHASE7_CLOUD_FILES = [
  {
    id: "travel-photos",
    name: "fotos_viagem.zip",
    type: "ZIP",
    minSize: 110,
    maxSize: 190,
    description: "Voce quer acessar em varios aparelhos.",
    correctFeedback: "Boa escolha! A Nuvem facilita o acesso remoto.",
    wrongFeedback: "Esse arquivo seria melhor na Nuvem para acesso remoto.",
  },
  {
    id: "important-backup",
    name: "backup_importante.zip",
    type: "ZIP",
    minSize: 140,
    maxSize: 220,
    description: "Copia de seguranca para nao perder dados.",
    correctFeedback: "Boa escolha! Backup combina com armazenamento na Nuvem.",
    wrongFeedback: "Esse arquivo seria melhor na Nuvem, pois e um backup.",
  },
  {
    id: "college-work",
    name: "trabalho_faculdade.docx",
    type: "DOC",
    minSize: 8,
    maxSize: 25,
    description: "Documento para editar e consultar fora de casa.",
    correctFeedback: "Boa escolha! A Nuvem ajuda a acessar de qualquer lugar.",
    wrongFeedback: "Esse documento ficaria melhor na Nuvem para acesso remoto.",
  },
  {
    id: "personal-documents",
    name: "documentos_pessoais.pdf",
    type: "PDF",
    minSize: 20,
    maxSize: 55,
    description: "Arquivos importantes para guardar uma copia online.",
    correctFeedback: "Boa escolha! Copias importantes ficam protegidas na Nuvem.",
    wrongFeedback: "Esses documentos seriam melhores na Nuvem como backup.",
  },
  {
    id: "portfolio",
    name: "portfolio.pdf",
    type: "PDF",
    minSize: 15,
    maxSize: 45,
    description: "Arquivo para compartilhar por link.",
    correctFeedback: "Boa escolha! Compartilhamento combina com Nuvem.",
    wrongFeedback: "Esse portfolio seria melhor na Nuvem para compartilhar.",
  },
];

const PHASE7_FLEX_FILES = [
  {
    id: "music",
    name: "musica.mp3",
    type: "MP3",
    minSize: 35,
    maxSize: 75,
    variants: {
      ssd: {
        description: "Voce ouve sempre neste computador.",
        correctFeedback: "Boa escolha! Uso local frequente pode ficar no SSD.",
        wrongFeedback: "Neste caso, o SSD e melhor porque o uso e local.",
      },
      cloud: {
        description: "Voce quer ouvir em varios aparelhos.",
        correctFeedback: "Boa escolha! A Nuvem sincroniza entre aparelhos.",
        wrongFeedback: "Neste caso, a Nuvem e melhor para ouvir em varios aparelhos.",
      },
    },
  },
  {
    id: "image",
    name: "imagem.png",
    type: "PNG",
    minSize: 8,
    maxSize: 24,
    variants: {
      ssd: {
        description: "Voce vai editar esta imagem com frequencia.",
        correctFeedback: "Boa escolha! Edicao frequente combina com SSD.",
        wrongFeedback: "Neste caso, o SSD e melhor para editar localmente.",
      },
      cloud: {
        description: "Voce precisa compartilhar com a equipe.",
        correctFeedback: "Boa escolha! Compartilhar com a equipe combina com Nuvem.",
        wrongFeedback: "Neste caso, a Nuvem e melhor para compartilhamento.",
      },
    },
  },
  {
    id: "slides",
    name: "apresentacao.pptx",
    type: "PPT",
    minSize: 20,
    maxSize: 55,
    variants: {
      ssd: {
        description: "Voce vai apresentar neste computador.",
        correctFeedback: "Boa escolha! Apresentar localmente combina com SSD.",
        wrongFeedback: "Neste caso, o SSD e melhor para uso local.",
      },
      cloud: {
        description: "Outras pessoas tambem vao editar.",
        correctFeedback: "Boa escolha! Colaboracao combina com Nuvem.",
        wrongFeedback: "Neste caso, a Nuvem e melhor para colaboracao.",
      },
    },
  },
];

const TYPE_COLORS = {
  SYS: 0x8ef28b,
  EXE: 0x8ef28b,
  DB: 0x8ef28b,
  ZIP: 0xc49cff,
  DOC: 0x70b7ff,
  PDF: 0xff7b68,
  MP3: 0xffd166,
  PNG: 0x62e7f2,
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
          "O SSD guarda dados em memoria flash com acesso rapido.\nA Nuvem guarda arquivos online para backup e acesso remoto.",
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
        .text(480, 382, "Classifique um arquivo por vez.", {
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
      292,
      "COMECAR DESAFIO",
      () => this.startChallenge(),
      { border: 0x8ef28b, hover: 0x246a69 },
    );
    this.createBackLink();
  }

  startChallenge() {
    this.phase7Score = PHASE7_STARTING_SCORE;
    this.phase7CurrentIndex = 0;
    this.phase7SSDCount = 0;
    this.phase7CloudCount = 0;
    this.phase7SSDUsed = 0;
    this.phase7ConnectionOnline = true;
    this.phase7ConnectionEventUsed = false;
    this.phase7ConnectionTween = null;
    this.phase7IsComplete = false;
    this.phase7IsAdvancing = false;

    this.setupRandomChallenge();
    this.clearStage();
    this.phase7Stage = this.add.container(0, 0);
    this.phase7CardLayer = this.add.container(0, 0);

    this.createChallengeHeader();
    this.createStorageAreas();
    this.addToStage(this.phase7CardLayer);
    this.createFeedbackBox();
    this.createBackLink();
    this.renderCurrentFile();
    this.updateStorageSummary();
    this.updateConnectionStatus();

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

    for (let attempt = 0; attempt < 120; attempt += 1) {
      const files = [
        ...this.shuffleItems(PHASE7_SSD_FILES).slice(0, 2).map((file) =>
          this.createFile(file, "ssd"),
        ),
        ...this.shuffleItems(PHASE7_CLOUD_FILES).slice(0, 2).map((file) =>
          this.createFile(file, "cloud"),
        ),
        this.createFlexFile(this.shuffleItems(PHASE7_FLEX_FILES)[0]),
      ];
      const shuffledFiles = this.shuffleItems(files);
      const ssdTotal = shuffledFiles
        .filter((file) => file.target === "ssd")
        .reduce((total, file) => total + file.size, 0);
      const signature = shuffledFiles
        .map((file) => `${file.id}:${file.size}:${file.target}`)
        .join("|");

      if (
        shuffledFiles.length === PHASE7_FILE_COUNT &&
        ssdTotal <= PHASE7_SSD_CAPACITY_GB &&
        signature !== previousSignature
      ) {
        this.phase7Files = shuffledFiles;
        this.phase7ConnectionTrigger = Phaser.Math.Between(1, 3);
        this.phase7ChallengeSignature = signature;
        return;
      }
    }

    this.createFallbackChallenge();
  }

  createFile(template, target) {
    return {
      ...template,
      target,
      size: Phaser.Math.Between(template.minSize, template.maxSize),
    };
  }

  createFlexFile(template) {
    const target = Phaser.Math.Between(0, 1) === 0 ? "ssd" : "cloud";
    const variant = template.variants[target];

    return {
      id: template.id,
      name: template.name,
      type: template.type,
      target,
      size: Phaser.Math.Between(template.minSize, template.maxSize),
      description: variant.description,
      correctFeedback: variant.correctFeedback,
      wrongFeedback: variant.wrongFeedback,
    };
  }

  createFallbackChallenge() {
    this.phase7Files = this.shuffleItems([
      {
        id: "operating-system",
        name: "sistema_operacional.sys",
        type: "SYS",
        size: 130,
        description: "Precisa abrir rapido e ficar disponivel localmente.",
        target: "ssd",
        correctFeedback: "Boa escolha! Sistema e programas funcionam melhor no SSD.",
        wrongFeedback: "Esse arquivo fica melhor no SSD, pois precisa de velocidade local.",
      },
      {
        id: "video-editor",
        name: "editor_video.exe",
        type: "EXE",
        size: 90,
        description: "Programa pesado usado neste computador.",
        target: "ssd",
        correctFeedback: "Boa escolha! Programas pesados se beneficiam do SSD.",
        wrongFeedback: "Esse programa seria melhor no SSD para abrir mais rapido.",
      },
      {
        id: "important-backup",
        name: "backup_importante.zip",
        type: "ZIP",
        size: 180,
        description: "Copia de seguranca para nao perder dados.",
        target: "cloud",
        correctFeedback: "Boa escolha! Backup combina com armazenamento na Nuvem.",
        wrongFeedback: "Esse arquivo seria melhor na Nuvem, pois e um backup.",
      },
      {
        id: "college-work",
        name: "trabalho_faculdade.docx",
        type: "DOC",
        size: 18,
        description: "Documento para editar e consultar fora de casa.",
        target: "cloud",
        correctFeedback: "Boa escolha! A Nuvem ajuda a acessar de qualquer lugar.",
        wrongFeedback: "Esse documento ficaria melhor na Nuvem para acesso remoto.",
      },
      {
        id: "slides",
        name: "apresentacao.pptx",
        type: "PPT",
        size: 38,
        description: "Outras pessoas tambem vao editar.",
        target: "cloud",
        correctFeedback: "Boa escolha! Colaboracao combina com Nuvem.",
        wrongFeedback: "Neste caso, a Nuvem e melhor para colaboracao.",
      },
    ]);
    this.phase7ConnectionTrigger = 2;
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

    this.phase7ScoreText = this.add
      .text(916, 28, "PONTOS: 100", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#8ef28b",
      })
      .setOrigin(1, 0.5);
    this.addToStage(this.phase7ScoreText);

    this.phase7ProgressText = this.add
      .text(480, 66, "Arquivo 1 de 5", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#ffd166",
      })
      .setOrigin(0.5);
    this.addToStage(this.phase7ProgressText);

    this.addToStage(
      this.add
        .text(480, 94, "SSD = velocidade local | Nuvem = backup e acesso remoto", {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "15px",
          fontStyle: "900",
          color: "#dce8f5",
        })
        .setOrigin(0.5),
    );
  }

  createStorageAreas() {
    this.phase7SSDContainer = this.add.container(176, 284);
    this.addToStage(this.phase7SSDContainer);
    this.phase7SSDContainer.add(
      createRoundedPanel(this, 0, 0, 220, 198, {
        fill: 0x0d1d2d,
        stroke: 0x8ef28b,
        strokeAlpha: 0.56,
        radius: 15,
      }),
    );
    this.createSSDIcon(this.phase7SSDContainer, 0, -44);
    this.phase7SSDContainer.add(
      this.add
        .text(0, -78, "SSD", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "11px",
          color: "#8ef28b",
        })
        .setOrigin(0.5),
    );
    this.phase7SSDContainer.add(
      this.add
        .text(0, 14, "rapido e local", {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "14px",
          fontStyle: "900",
          color: "#dce8f5",
        })
        .setOrigin(0.5),
    );
    this.phase7SSDCountText = this.add
      .text(0, 43, "Arquivos: 0", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "13px",
        fontStyle: "900",
        color: "#9cc9b8",
      })
      .setOrigin(0.5);
    this.phase7SSDCapacityText = this.add
      .text(0, 70, "SSD: 0 / 400 GB", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#a9bdd1",
      })
      .setOrigin(0.5);
    this.phase7SSDContainer.add([
      this.phase7SSDCountText,
      this.phase7SSDCapacityText,
    ]);

    this.phase7CloudContainer = this.add.container(784, 284);
    this.addToStage(this.phase7CloudContainer);
    this.phase7CloudContainer.add(
      createRoundedPanel(this, 0, 0, 220, 198, {
        fill: 0x0c1930,
        stroke: 0x70b7ff,
        strokeAlpha: 0.56,
        radius: 15,
      }),
    );
    this.createCloudIcon(this.phase7CloudContainer, 0, -44);
    this.phase7CloudContainer.add(
      this.add
        .text(0, -78, "NUVEM", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "11px",
          color: "#70b7ff",
        })
        .setOrigin(0.5),
    );
    this.phase7CloudContainer.add(
      this.add
        .text(0, 14, "remoto e online", {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "14px",
          fontStyle: "900",
          color: "#dce8f5",
        })
        .setOrigin(0.5),
    );
    this.phase7CloudCountText = this.add
      .text(0, 43, "Arquivos: 0", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "13px",
        fontStyle: "900",
        color: "#9ebde4",
      })
      .setOrigin(0.5);
    this.phase7ConnectionText = this.add
      .text(0, 70, "Conexao: Online", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#8ef28b",
      })
      .setOrigin(0.5);
    this.phase7CloudContainer.add([
      this.phase7CloudCountText,
      this.phase7ConnectionText,
    ]);

    this.phase7RestoreButton = this.createButton(
      784,
      420,
      214,
      "RESTABELECER CONEXAO",
      () => this.restoreConnection(),
      {
        border: 0xffd166,
        hover: 0x5c4b22,
        fontSize: "6px",
        height: 36,
      },
    );
    this.phase7RestoreButton.setVisible(false);
    this.phase7RestoreButton.setEnabled(false);
  }

  renderCurrentFile() {
    this.phase7CardLayer.removeAll(true);

    if (this.phase7CurrentIndex >= this.phase7Files.length) {
      this.finishChallenge();
      return;
    }

    if (
      !this.phase7ConnectionEventUsed &&
      this.phase7CurrentIndex === this.phase7ConnectionTrigger
    ) {
      this.phase7ConnectionEventUsed = true;
      this.phase7ConnectionOnline = false;
      this.updateConnectionStatus();
      this.showFeedback("Conexao instavel. Restabeleca antes de enviar.", "warning");
    }

    const file = this.phase7Files[this.phase7CurrentIndex];
    this.phase7ProgressText.setText(
      `Arquivo ${this.phase7CurrentIndex + 1} de ${this.phase7Files.length}`,
    );

    this.phase7CardLayer.add(
      createRoundedPanel(this, 480, 292, 408, 282, {
        fill: 0x0d1930,
        stroke: 0x62e7f2,
        strokeAlpha: 0.42,
        radius: 16,
      }),
    );

    const typeColor = TYPE_COLORS[file.type] ?? 0x8da2bd;
    const fileIcon = this.add
      .rectangle(480, 194, 58, 42, typeColor, 0.92)
      .setStrokeStyle(2, 0xf1f7ff, 0.35);
    const typeText = this.add
      .text(480, 194, file.type, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: file.type.length > 3 ? "7px" : "8px",
        color: "#07101f",
      })
      .setOrigin(0.5);
    const nameText = this.add
      .text(480, 242, file.name, {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "20px",
        fontStyle: "900",
        color: "#f1f7ff",
        align: "center",
        wordWrap: { width: 350 },
      })
      .setOrigin(0.5);
    const sizeText = this.add
      .text(480, 274, `${file.size} GB`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#ffd166",
      })
      .setOrigin(0.5);
    const descriptionText = this.add
      .text(480, 316, file.description, {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "15px",
        fontStyle: "800",
        color: "#dce8f5",
        align: "center",
        wordWrap: { width: 330 },
      })
      .setOrigin(0.5);

    this.phase7CardLayer.add([
      fileIcon,
      typeText,
      nameText,
      sizeText,
      descriptionText,
    ]);

    this.phase7SaveSSDButton = this.createCardButton(
      390,
      402,
      172,
      "SALVAR NO SSD",
      () => this.chooseDestination("ssd"),
      {
        border: 0x8ef28b,
        hover: 0x246a69,
        fontSize: "7px",
        height: 42,
      },
    );
    this.phase7SendCloudButton = this.createCardButton(
      570,
      402,
      190,
      "ENVIAR PARA A NUVEM",
      () => this.chooseDestination("cloud"),
      {
        border: 0x70b7ff,
        hover: 0x1c5264,
        fontSize: "7px",
        height: 42,
      },
    );
  }

  createCardButton(x, y, width, label, callback, options = {}) {
    const button = createStandardButton(this, x, y, width, label, callback, {
      height: options.height ?? 42,
      border: options.border ?? 0x62e7f2,
      hover: options.hover ?? 0x1c5264,
      fontSize: options.fontSize ?? "8px",
      radius: 11,
    });
    this.phase7CardLayer.add(button);
    return button;
  }

  chooseDestination(destination) {
    if (this.phase7IsComplete || this.phase7IsAdvancing) {
      return;
    }

    const file = this.phase7Files[this.phase7CurrentIndex];

    if (destination === "cloud" && !this.phase7ConnectionOnline) {
      this.updateScore(-PHASE7_CONNECTION_PENALTY);
      this.showFeedback("Sem conexao. Restabeleca antes de enviar.", "error");
      this.flashConnectionWarning();
      return;
    }

    if (
      destination === "ssd" &&
      this.phase7SSDUsed + file.size > PHASE7_SSD_CAPACITY_GB
    ) {
      this.updateScore(-PHASE7_CAPACITY_PENALTY);
      this.showFeedback("SSD sem espaco para esse arquivo.", "error");
      this.pulseStorage(this.phase7SSDContainer, 0x8ef28b);
      return;
    }

    const correct = destination === file.target;

    if (!correct) {
      this.updateScore(-PHASE7_WRONG_CHOICE_PENALTY);
    }

    if (destination === "ssd") {
      this.phase7SSDCount += 1;
      this.phase7SSDUsed += file.size;
      this.pulseStorage(this.phase7SSDContainer, 0x8ef28b);
    } else {
      this.phase7CloudCount += 1;
      this.pulseStorage(this.phase7CloudContainer, 0x70b7ff);
    }

    this.updateStorageSummary();
    this.showFeedback(correct ? file.correctFeedback : file.wrongFeedback, correct ? "success" : "error");
    this.phase7IsAdvancing = true;
    this.phase7SaveSSDButton.setEnabled(false);
    this.phase7SendCloudButton.setEnabled(false);

    this.time.delayedCall(850, () => {
      this.phase7CurrentIndex += 1;
      this.phase7IsAdvancing = false;
      this.renderCurrentFile();
    });
  }

  restoreConnection() {
    if (this.phase7IsComplete || this.phase7ConnectionOnline) {
      return;
    }

    this.phase7ConnectionOnline = true;
    this.updateConnectionStatus();
    this.showFeedback("Conexao restabelecida.", "success");
  }

  updateStorageSummary() {
    this.phase7SSDCountText?.setText(`Arquivos: ${this.phase7SSDCount}`);
    this.phase7CloudCountText?.setText(`Arquivos: ${this.phase7CloudCount}`);
    this.phase7SSDCapacityText?.setText(
      `SSD: ${this.phase7SSDUsed} / ${PHASE7_SSD_CAPACITY_GB} GB`,
    );
    this.phase7SSDCapacityText?.setColor(
      this.phase7SSDUsed > PHASE7_SSD_CAPACITY_GB * 0.85 ? "#ffd166" : "#a9bdd1",
    );
  }

  updateConnectionStatus() {
    if (this.phase7ConnectionTween) {
      this.phase7ConnectionTween.stop();
      this.phase7ConnectionTween = null;
    }

    if (this.phase7ConnectionOnline) {
      this.phase7ConnectionText?.setText("Conexao: Online").setColor("#8ef28b");
      this.phase7RestoreButton?.setVisible(false);
      this.phase7RestoreButton?.setEnabled(false);
      return;
    }

    this.phase7ConnectionText?.setText("Conexao: Instavel").setColor("#ffd166");
    this.phase7RestoreButton?.setVisible(true);
    this.phase7RestoreButton?.setEnabled(true);
    this.phase7ConnectionTween = this.tweens.add({
      targets: this.phase7ConnectionText,
      alpha: 0.45,
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  finishChallenge() {
    this.phase7IsComplete = true;
    this.showFeedback("Arquivos classificados!", "success");
    this.createCelebrationParticles();
    this.time.delayedCall(850, () => this.showFinalConclusion());
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

  createFeedbackBox() {
    this.addToStage(
      createRoundedPanel(this, 480, 504, 820, 40, {
        fill: 0x091424,
        stroke: 0x62e7f2,
        strokeAlpha: 0.24,
        radius: 11,
        shadow: false,
        highlight: false,
      }),
    );

    this.phase7FeedbackDot = this.add.circle(98, 504, 5, 0x62e7f2, 0.95);
    this.phase7FeedbackText = this.add
      .text(480, 504, "Escolha o melhor destino para o arquivo atual.", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "14px",
        fontStyle: "900",
        color: "#8da2bd",
        align: "center",
        wordWrap: { width: 720 },
      })
      .setOrigin(0.5);

    this.addToStage([this.phase7FeedbackDot, this.phase7FeedbackText]);
  }

  flashConnectionWarning() {
    this.tweens.add({
      targets: this.phase7CloudContainer,
      alpha: 0.35,
      duration: 90,
      yoyo: true,
      repeat: 3,
      ease: "Sine.inOut",
      onComplete: () => this.phase7CloudContainer.setAlpha(1),
    });
  }

  pulseStorage(target, color) {
    this.tweens.add({
      targets: target,
      scale: 1.035,
      duration: 125,
      yoyo: true,
      ease: "Sine.inOut",
    });

    const glow = this.add
      .rectangle(target.x, target.y, 214, 190, color, 0)
      .setStrokeStyle(3, color, 0.46);
    this.addToStage(glow);
    this.tweens.add({
      targets: glow,
      scale: 1.035,
      alpha: 0,
      duration: 420,
      onComplete: () => glow.destroy(),
    });
  }

  showFinalConclusion() {
    completePhase(7);
    savePhaseScore(7, this.phase7Score);

    const finalScore = this.phase7Score;
    const totalScore = getTotalScore();
    this.clearStage();
    this.phase7Stage = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 54, "JORNADA CONCLUIDA!", {
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
          246,
          "Parabens! Voce completou a Jornada do Bit e acompanhou a evolucao\ndos dispositivos de armazenamento, dos cartoes perfurados ate os SSDs e a Nuvem.",
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
          366,
          `PONTUACAO DA FASE: ${finalScore}\nTOTAL DA JORNADA: ${totalScore} / 700`,
          {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "10px",
            color: "#ffd166",
            align: "center",
            lineSpacing: 8,
          },
        )
        .setOrigin(0.5),
    );

    this.createButton(
      304,
      462,
      310,
      "VOLTAR A LINHA DO TEMPO",
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

  createSSDIcon(container, x, y) {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x07101f, 1);
    graphics.fillRoundedRect(x - 44, y - 26, 88, 52, 8);
    graphics.lineStyle(2, 0x8ef28b, 0.82);
    graphics.strokeRoundedRect(x - 44, y - 26, 88, 52, 8);
    graphics.fillStyle(0x8ef28b, 0.2);
    graphics.fillRoundedRect(x - 28, y - 10, 48, 7, 3);
    graphics.fillRoundedRect(x - 28, y + 5, 36, 7, 3);
    graphics.fillStyle(0x8ef28b, 0.85);
    graphics.fillCircle(x + 31, y + 16, 4);
    container.add(graphics);
  }

  createCloudIcon(container, x, y) {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x70b7ff, 0.2);
    graphics.fillCircle(x - 26, y + 3, 20);
    graphics.fillCircle(x, y - 8, 28);
    graphics.fillCircle(x + 28, y + 5, 18);
    graphics.fillRoundedRect(x - 45, y + 1, 92, 34, 17);
    graphics.lineStyle(2, 0x70b7ff, 0.75);
    graphics.strokeRoundedRect(x - 41, y + 5, 84, 26, 14);
    graphics.fillStyle(0x62e7f2, 0.42);
    graphics.fillRoundedRect(x - 18, y + 13, 38, 5, 2);
    graphics.fillRoundedRect(x - 18, y + 23, 38, 5, 2);
    container.add(graphics);
  }

  createIntroStorageIcon(x, y) {
    const container = this.add.container(x, y);
    this.addToStage(container);

    this.createSSDIcon(container, -90, 0);
    this.createCloudIcon(container, 92, -4);

    const graphics = this.add.graphics();
    graphics.lineStyle(3, 0xffd166, 0.62);
    graphics.lineBetween(-30, 0, 28, 0);
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
      .text(0, -13, "7 FASES - UMA JORNADA", {
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
    this.tweens.killAll();

    if (this.phase7Stage) {
      this.phase7Stage.destroy(true);
      this.phase7Stage = null;
    }
  }
}
