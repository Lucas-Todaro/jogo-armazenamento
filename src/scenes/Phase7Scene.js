import { completePhase, isPhaseUnlocked } from "../utils/progressManager.js";
import { drawRetroBackground } from "../utils/visualHelpers.js";

const PHASE7_STARTING_SCORE = 100;
const PHASE7_SSD_CAPACITY_GB = 500;
const PHASE7_FILES = [
  {
    name: "sistema_operacional.sys",
    size: 120,
    target: "ssd",
    hint: "Precisa iniciar rapido no computador.",
  },
  {
    name: "jogo_pesado.exe",
    size: 160,
    target: "ssd",
    hint: "Executa melhor com acesso local veloz.",
  },
  {
    name: "fotos_viagem.zip",
    size: 180,
    target: "cloud",
    hint: "Bom para acessar de varios dispositivos.",
  },
  {
    name: "trabalho_faculdade.docx",
    size: 20,
    target: "cloud",
    hint: "Documento que combina com acesso remoto.",
  },
  {
    name: "backup_importante.zip",
    size: 220,
    target: "cloud",
    hint: "Backup fica mais seguro em outro lugar.",
  },
  {
    name: "editor_video.exe",
    size: 140,
    target: "ssd",
    hint: "Programa pesado precisa de velocidade.",
  },
  {
    name: "musica.mp3",
    size: 30,
    target: "cloud",
    hint: "Arquivo leve para ouvir em varios aparelhos.",
  },
];

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
        .text(480, 48, "FASE 7: SSD E NUVEM", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "17px",
          color: "#8ef28b",
        })
        .setOrigin(0.5),
    );

    const panel = this.add.graphics();
    panel.fillStyle(0x0d1930, 0.97);
    panel.fillRoundedRect(88, 92, 784, 390, 20);
    panel.lineStyle(2, 0x62e7f2, 0.45);
    panel.strokeRoundedRect(88, 92, 784, 390, 20);
    this.addToStage(panel);

    this.createIntroStorageIcon(480, 160);

    this.addToStage(
      this.add
        .text(
          480,
          306,
          "Com os SSDs, o armazenamento ficou muito mais rapido,\npois os dados sao acessados eletronicamente, sem discos girando.\nCom a nuvem, os arquivos passaram a poder ser acessados\npela internet em diferentes dispositivos.",
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
          398,
          "O desafio e escolher onde armazenar cada arquivo:\nno SSD, para acesso rapido, ou na nuvem, para acesso remoto.",
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
      292,
      "COMEÇAR DESAFIO",
      () => this.startChallenge(),
      { border: 0x8ef28b, hover: 0x246a69 },
    );
    this.createBackLink();
  }

  startChallenge() {
    this.phase7Score = PHASE7_STARTING_SCORE;
    this.phase7SelectedIndex = null;
    this.phase7Assignments = new Map();
    this.phase7ConnectionStable = true;
    this.phase7ConnectionEventUsed = false;
    this.phase7IsComplete = false;
    this.phase7FileCards = [];
    this.phase7ControlButtons = [];
    this.phase7StorageLabels = {};

    this.clearStage();
    this.phase7Stage = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 29, "SSD E ARMAZENAMENTO EM NUVEM", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "14px",
          color: "#8ef28b",
        })
        .setOrigin(0.5),
    );

    this.phase7ScoreText = this.add
      .text(916, 29, "PONTOS: 100", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#8ef28b",
      })
      .setOrigin(1, 0.5);
    this.addToStage(this.phase7ScoreText);

    this.createMissionPanel();
    this.createStorageAreas();
    this.createFileList();
    this.createConnectionIndicator();
    this.createCapacityBar();
    this.createEducationBox();
    this.createControls();
    this.updateCapacity();
    this.updateStorageLists();

    this.phase7MessageText = this.add
      .text(
        480,
        517,
        "Selecione um arquivo e escolha entre SSD ou Nuvem.",
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
    this.addToStage(this.phase7MessageText);
    this.createBackLink();

    this.phase7Stage.setAlpha(0);
    this.tweens.add({
      targets: this.phase7Stage,
      alpha: 1,
      duration: 280,
      ease: "Sine.out",
    });
  }

  createMissionPanel() {
    const panel = this.add.graphics();
    panel.fillStyle(0x101f35, 0.98);
    panel.fillRoundedRect(42, 50, 605, 52, 12);
    panel.lineStyle(2, 0xffd166, 0.38);
    panel.strokeRoundedRect(42, 50, 605, 52, 12);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(
          345,
          76,
          "MISSÃO: organize os arquivos entre SSD e Nuvem",
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

  createStorageAreas() {
    this.createSSDPanel();
    this.createCloudPanel();

    const graphics = this.add.graphics();
    graphics.lineStyle(3, 0x62e7f2, 0.2);
    graphics.lineBetween(300, 236, 338, 236);
    graphics.lineBetween(622, 236, 660, 236);
    graphics.fillStyle(0x62e7f2, 0.32);
    graphics.fillTriangle(338, 236, 324, 228, 324, 244);
    graphics.fillTriangle(622, 236, 636, 228, 636, 244);
    this.addToStage(graphics);
  }

  createSSDPanel() {
    this.phase7SSDContainer = this.add.container(172, 220);
    this.addToStage(this.phase7SSDContainer);

    const graphics = this.add.graphics();
    graphics.fillStyle(0x101f35, 1);
    graphics.fillRoundedRect(-130, -98, 260, 204, 16);
    graphics.lineStyle(2, 0x8ef28b, 0.42);
    graphics.strokeRoundedRect(-130, -98, 260, 204, 16);
    graphics.fillStyle(0x07101f, 1);
    graphics.fillRoundedRect(-100, -62, 200, 112, 10);
    graphics.lineStyle(2, 0x62e7f2, 0.34);
    graphics.strokeRoundedRect(-100, -62, 200, 112, 10);
    graphics.fillStyle(0x8ef28b, 0.18);
    graphics.fillRoundedRect(-76, -36, 152, 12, 4);
    graphics.fillRoundedRect(-76, -12, 124, 12, 4);
    graphics.fillRoundedRect(-76, 12, 92, 12, 4);
    graphics.fillStyle(0x263a52, 1);
    graphics.fillRoundedRect(-60, 58, 120, 12, 4);
    graphics.fillRoundedRect(-84, 70, 168, 10, 4);
    this.phase7SSDContainer.add(graphics);

    const label = this.add
      .text(0, -78, "SSD LOCAL", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "9px",
        color: "#8ef28b",
      })
      .setOrigin(0.5);
    this.phase7SSDContainer.add(label);

    this.phase7StorageLabels.ssd = this.add
      .text(0, 92, "Nenhum arquivo salvo", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "11px",
        fontStyle: "800",
        color: "#8da2bd",
        align: "center",
        wordWrap: { width: 220 },
      })
      .setOrigin(0.5);
    this.phase7SSDContainer.add(this.phase7StorageLabels.ssd);
  }

  createCloudPanel() {
    this.phase7CloudContainer = this.add.container(788, 220);
    this.addToStage(this.phase7CloudContainer);

    const graphics = this.add.graphics();
    graphics.fillStyle(0x101f35, 1);
    graphics.fillRoundedRect(-130, -98, 260, 204, 16);
    graphics.lineStyle(2, 0x70b7ff, 0.44);
    graphics.strokeRoundedRect(-130, -98, 260, 204, 16);

    graphics.fillStyle(0x0b1324, 1);
    graphics.fillRoundedRect(-70, -10, 140, 78, 14);
    graphics.lineStyle(2, 0x70b7ff, 0.44);
    graphics.strokeRoundedRect(-70, -10, 140, 78, 14);
    graphics.fillStyle(0x70b7ff, 0.25);
    graphics.fillCircle(-45, -24, 36);
    graphics.fillCircle(0, -42, 44);
    graphics.fillCircle(46, -23, 34);
    graphics.fillRoundedRect(-78, -28, 156, 54, 28);

    graphics.fillStyle(0x62e7f2, 0.18);
    graphics.fillRoundedRect(-42, 10, 84, 10, 4);
    graphics.fillRoundedRect(-42, 31, 84, 10, 4);
    graphics.fillRoundedRect(-42, 52, 84, 10, 4);
    this.phase7CloudContainer.add(graphics);

    const label = this.add
      .text(0, -78, "NUVEM ONLINE", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "9px",
        color: "#70b7ff",
      })
      .setOrigin(0.5);
    this.phase7CloudContainer.add(label);

    this.phase7StorageLabels.cloud = this.add
      .text(0, 92, "Nenhum arquivo enviado", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "11px",
        fontStyle: "800",
        color: "#8da2bd",
        align: "center",
        wordWrap: { width: 220 },
      })
      .setOrigin(0.5);
    this.phase7CloudContainer.add(this.phase7StorageLabels.cloud);
  }

  createFileList() {
    const panel = this.add.graphics();
    panel.fillStyle(0x101f35, 0.98);
    panel.fillRoundedRect(334, 116, 292, 224, 16);
    panel.lineStyle(2, 0x62e7f2, 0.34);
    panel.strokeRoundedRect(334, 116, 292, 224, 16);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(480, 136, "ARQUIVOS", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "9px",
          color: "#ffd166",
        })
        .setOrigin(0.5),
    );

    PHASE7_FILES.forEach((file, index) => {
      const y = 164 + index * 24;
      const card = this.add.container(480, y);
      const background = this.add
        .rectangle(0, 0, 254, 21, 0x13283a, 1)
        .setStrokeStyle(1, 0x34465d, 0.82)
        .setInteractive({ useHandCursor: true });
      const nameText = this.add
        .text(-117, -2, file.name, {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "11px",
          fontStyle: "800",
          color: "#dce8f5",
        })
        .setOrigin(0, 0.5);
      const sizeText = this.add
        .text(115, -2, `${file.size} GB`, {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "10px",
          fontStyle: "800",
          color: "#8da2bd",
        })
        .setOrigin(1, 0.5);
      const placeText = this.add
        .text(0, 8, "sem destino", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "5px",
          color: "#53657c",
        })
        .setOrigin(0.5);

      card.add([background, nameText, sizeText, placeText]);
      this.addToStage(card);

      background.on("pointerover", () => {
        if (this.phase7SelectedIndex !== index) {
          background.setFillStyle(0x1c5264);
        }
      });
      background.on("pointerout", () => this.updateFileCard(index));
      background.on("pointerdown", () => this.selectFile(index));

      this.phase7FileCards.push({
        card,
        background,
        nameText,
        sizeText,
        placeText,
      });
    });
  }

  createConnectionIndicator() {
    const panel = this.add.graphics();
    panel.fillStyle(0x101f35, 0.98);
    panel.fillRoundedRect(672, 50, 246, 52, 12);
    panel.lineStyle(2, 0x70b7ff, 0.38);
    panel.strokeRoundedRect(672, 50, 246, 52, 12);
    this.addToStage(panel);

    this.phase7ConnectionLight = this.add.circle(704, 76, 9, 0x8ef28b, 1);
    this.addToStage(this.phase7ConnectionLight);

    this.phase7ConnectionText = this.add
      .text(820, 76, "CONEXÃO ESTÁVEL", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#8ef28b",
      })
      .setOrigin(0.5);
    this.addToStage(this.phase7ConnectionText);
  }

  createCapacityBar() {
    const panel = this.add.graphics();
    panel.fillStyle(0x101f35, 0.98);
    panel.fillRoundedRect(42, 334, 258, 74, 12);
    panel.lineStyle(2, 0x8ef28b, 0.34);
    panel.strokeRoundedRect(42, 334, 258, 74, 12);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(171, 352, "CAPACIDADE DO SSD", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#8ef28b",
        })
        .setOrigin(0.5),
    );

    this.phase7CapacityBack = this.add
      .rectangle(66, 376, 210, 14, 0x07101f, 1)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x34465d, 1);
    this.addToStage(this.phase7CapacityBack);

    this.phase7CapacityFill = this.add
      .rectangle(66, 376, 210, 12, 0x8ef28b, 1)
      .setOrigin(0, 0.5)
      .setScale(0, 1);
    this.addToStage(this.phase7CapacityFill);

    this.phase7CapacityText = this.add
      .text(171, 397, `0 / ${PHASE7_SSD_CAPACITY_GB} GB`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "7px",
        color: "#8da2bd",
      })
      .setOrigin(0.5);
    this.addToStage(this.phase7CapacityText);
  }

  createEducationBox() {
    const panel = this.add.graphics();
    panel.fillStyle(0x101f35, 0.98);
    panel.fillRoundedRect(320, 354, 598, 58, 14);
    panel.lineStyle(2, 0x62e7f2, 0.32);
    panel.strokeRoundedRect(320, 354, 598, 58, 14);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(
          619,
          383,
          "SSDs usam memoria flash, sem partes moveis, por isso sao rapidos e resistentes.\nA nuvem guarda arquivos em servidores pela internet, facilitando backup e acesso remoto.",
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
    this.phase7ControlButtons = [
      this.createButton(
        185,
        444,
        248,
        "SALVAR NO SSD",
        () => this.saveToSSD(),
        { border: 0x8ef28b, hover: 0x246a69, fontSize: "8px" },
      ),
      this.createButton(
        480,
        444,
        248,
        "ENVIAR PARA A NUVEM",
        () => this.uploadToCloud(),
        { border: 0x70b7ff, hover: 0x1c5264, fontSize: "8px" },
      ),
      this.createButton(
        775,
        444,
        248,
        "RESTABELECER CONEXÃO",
        () => this.restoreConnection(),
        { border: 0xffd166, hover: 0x5c4b22, fontSize: "7px" },
      ),
      this.createButton(
        480,
        486,
        320,
        "VERIFICAR ARMAZENAMENTO",
        () => this.verifyStorage(),
        { border: 0x62e7f2, hover: 0x1c5264, fontSize: "8px" },
      ),
    ];
  }

  selectFile(index) {
    if (this.phase7IsComplete) {
      return;
    }

    this.phase7SelectedIndex = index;
    PHASE7_FILES.forEach((_, fileIndex) => this.updateFileCard(fileIndex));

    const file = PHASE7_FILES[index];
    this.showMessage(`Arquivo selecionado: ${file.name}. Dica: ${file.hint}`, "#ffd166");

    this.tweens.add({
      targets: this.phase7FileCards[index].card,
      scale: 1.04,
      duration: 95,
      yoyo: true,
      ease: "Sine.inOut",
    });
  }

  saveToSSD() {
    if (this.phase7SelectedIndex === null || this.phase7IsComplete) {
      this.showFailure("Selecione um arquivo antes de escolher o destino.");
      return;
    }

    const file = PHASE7_FILES[this.phase7SelectedIndex];
    const previous = this.phase7Assignments.get(this.phase7SelectedIndex);
    const usedWithoutCurrent =
      this.getSSDUsed() - (previous === "ssd" ? file.size : 0);

    if (usedWithoutCurrent + file.size > PHASE7_SSD_CAPACITY_GB) {
      this.updateScore(-5);
      this.showFailure("Espaço insuficiente no SSD.");
      this.shakeCapacityBar();
      return;
    }

    this.phase7Assignments.set(this.phase7SelectedIndex, "ssd");
    this.updateFileCard(this.phase7SelectedIndex);
    this.updateCapacity();
    this.updateStorageLists();
    this.animateFileTo(480, 164 + this.phase7SelectedIndex * 24, 172, 220, 0x8ef28b);
    this.pulseStorage(this.phase7SSDContainer, 0x8ef28b);
    this.showSuccess("Arquivo salvo no SSD. Acesso rapido garantido.");
    this.maybeTriggerConnectionInstability();
  }

  uploadToCloud() {
    if (this.phase7SelectedIndex === null || this.phase7IsComplete) {
      this.showFailure("Selecione um arquivo antes de escolher o destino.");
      return;
    }

    if (!this.phase7ConnectionStable) {
      this.updateScore(-10);
      this.showFailure("Sem conexão com a internet. A nuvem depende de acesso online.");
      this.flashConnectionWarning();
      return;
    }

    this.phase7Assignments.set(this.phase7SelectedIndex, "cloud");
    this.updateFileCard(this.phase7SelectedIndex);
    this.updateCapacity();
    this.updateStorageLists();
    this.animateFileTo(480, 164 + this.phase7SelectedIndex * 24, 788, 220, 0x70b7ff);
    this.pulseStorage(this.phase7CloudContainer, 0x70b7ff);
    this.showSuccess(
      "Arquivo enviado para a nuvem. Agora ele pode ser acessado remotamente.",
    );
    this.maybeTriggerConnectionInstability();
  }

  restoreConnection() {
    if (this.phase7IsComplete) {
      return;
    }

    if (this.phase7ConnectionStable) {
      this.showMessage("A conexão ja esta estavel.", "#8da2bd");
      return;
    }

    this.phase7ConnectionStable = true;
    this.updateConnectionIndicator();
    this.showSuccess("Conexão restabelecida. A nuvem esta disponivel novamente.");

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

    if (this.phase7Assignments.size < PHASE7_FILES.length) {
      this.updateScore(-10);
      this.showFailure("Ainda existem arquivos sem destino. Organize todos antes de verificar.");
      return;
    }

    if (!this.phase7ConnectionStable) {
      this.updateScore(-10);
      this.showFailure("Restabeleça a conexão antes de concluir os envios para a nuvem.");
      this.flashConnectionWarning();
      return;
    }

    const wrongIndexes = PHASE7_FILES
      .map((file, index) => (this.phase7Assignments.get(index) === file.target ? null : index))
      .filter((index) => index !== null);

    if (wrongIndexes.length > 0) {
      this.updateScore(-10 - wrongIndexes.length * 5);
      wrongIndexes.forEach((index) => {
        const card = this.phase7FileCards[index];
        card.background.setStrokeStyle(2, 0xff7b68, 0.95);
        this.tweens.add({
          targets: card.card,
          x: card.card.x + 5,
          duration: 55,
          yoyo: true,
          repeat: 2,
        });
      });
      this.showFailure(
        "Alguns arquivos poderiam estar em um local mais adequado. Revise sua organização.",
      );
      return;
    }

    this.phase7IsComplete = true;
    this.disableChallengeControls();
    this.showSuccess("Arquivos organizados corretamente entre SSD e Nuvem!");
    this.pulseStorage(this.phase7SSDContainer, 0x8ef28b);
    this.pulseStorage(this.phase7CloudContainer, 0x70b7ff);
    this.createCelebrationParticles();

    this.time.delayedCall(950, () => this.showConclusion());
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
      scale: 1.12,
      duration: 100,
      yoyo: true,
    });
  }

  updateCapacity() {
    const used = this.getSSDUsed();
    const ratio = Math.min(used / PHASE7_SSD_CAPACITY_GB, 1);
    const fillColor =
      used > PHASE7_SSD_CAPACITY_GB * 0.82
        ? 0xffd166
        : used > PHASE7_SSD_CAPACITY_GB
          ? 0xff7b68
          : 0x8ef28b;

    this.phase7CapacityFill.setFillStyle(fillColor, 1);
    this.tweens.add({
      targets: this.phase7CapacityFill,
      scaleX: ratio,
      duration: 180,
      ease: "Sine.out",
    });
    this.phase7CapacityText
      .setText(`${used} / ${PHASE7_SSD_CAPACITY_GB} GB`)
      .setColor(used > PHASE7_SSD_CAPACITY_GB ? "#ff9b78" : "#8da2bd");
  }

  showMessage(message, color = "#8da2bd") {
    this.phase7MessageText.setText(message).setColor(color);
  }

  showSuccess(message) {
    this.showMessage(message, "#8ef28b");
  }

  showFailure(message) {
    this.showMessage(message, "#ff9b78");
    this.cameras.main.shake(120, 0.002);
  }

  showConclusion() {
    completePhase(7);

    const finalScore = this.phase7Score;
    this.clearStage();
    this.phase7Stage = this.add.container(0, 0);

    const glow = this.add
      .circle(480, 108, 80, 0x8ef28b, 0.07)
      .setStrokeStyle(2, 0x62e7f2, 0.32);
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
        .text(480, 50, "FASE CONCLUÍDA!", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "20px",
          color: "#8ef28b",
        })
        .setOrigin(0.5),
    );

    this.createConclusionIcon(480, 118);

    const panel = this.add.graphics();
    panel.fillStyle(0x0d1930, 0.97);
    panel.fillRoundedRect(86, 190, 788, 246, 18);
    panel.lineStyle(2, 0x62e7f2, 0.42);
    panel.strokeRoundedRect(86, 190, 788, 246, 18);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(
          480,
          270,
          "Você aprendeu que o SSD tornou o armazenamento local muito mais rapido,\nusando memoria flash sem partes mecanicas. Tambem viu que a nuvem\npermite acessar arquivos pela internet em diferentes dispositivos,\nmas depende de conexão e servidores externos.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "16px",
            fontStyle: "600",
            color: "#dce8f5",
            align: "center",
            lineSpacing: 5,
          },
        )
        .setOrigin(0.5),
    );

    this.addToStage(
      this.add
        .text(
          480,
          356,
          "Parabéns! Você completou a Jornada do Bit e acompanhou a evolução\ndo armazenamento, dos cartões perfurados ate a nuvem.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "16px",
            fontStyle: "800",
            color: "#ffd166",
            align: "center",
            lineSpacing: 5,
          },
        )
        .setOrigin(0.5),
    );

    this.addToStage(
      this.add
        .text(480, 413, `PONTUAÇÃO FINAL: ${finalScore}`, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "12px",
          color: "#8ef28b",
        })
        .setOrigin(0.5),
    );

    this.createButton(
      304,
      475,
      310,
      "VOLTAR À LINHA DO TEMPO",
      () => this.returnToTimeline(),
      { border: 0x62e7f2, hover: 0x1c5264, fontSize: "9px" },
    );
    this.createButton(
      656,
      475,
      270,
      "JOGAR NOVAMENTE",
      () => this.restartPhase(),
      { border: 0x8ef28b, hover: 0x246a69, fontSize: "9px" },
    );

    this.createCelebrationParticles();
  }

  restartPhase() {
    this.cameras.main.fadeOut(180, 7, 16, 31);
    this.time.delayedCall(190, () => {
      this.createIntroPanel();
      this.cameras.main.fadeIn(220, 7, 16, 31);
    });
  }

  returnToTimeline() {
    this.cameras.main.fadeOut(200, 7, 16, 31);
    this.time.delayedCall(210, () => this.scene.start("TimelineScene"));
  }

  updateFileCard(index) {
    const card = this.phase7FileCards[index];
    const assignment = this.phase7Assignments.get(index);
    const isSelected = this.phase7SelectedIndex === index;

    const fill = isSelected ? 0x173f4e : assignment ? 0x132f42 : 0x13283a;
    const stroke = assignment === "ssd" ? 0x8ef28b : assignment === "cloud" ? 0x70b7ff : 0x34465d;
    const text = assignment === "ssd" ? "SSD" : assignment === "cloud" ? "NUVEM" : "sem destino";
    const textColor = assignment === "ssd" ? "#8ef28b" : assignment === "cloud" ? "#70b7ff" : "#53657c";

    card.background.setFillStyle(fill).setStrokeStyle(isSelected ? 2 : 1, stroke, 0.9);
    card.placeText.setText(text).setColor(textColor);
  }

  updateStorageLists() {
    const ssdFiles = [];
    const cloudFiles = [];
    this.phase7Assignments.forEach((destination, index) => {
      const name = PHASE7_FILES[index].name.split(".")[0];
      if (destination === "ssd") {
        ssdFiles.push(name);
      } else {
        cloudFiles.push(name);
      }
    });

    this.phase7StorageLabels.ssd
      .setText(ssdFiles.length ? ssdFiles.join("\n") : "Nenhum arquivo salvo")
      .setColor(ssdFiles.length ? "#dce8f5" : "#8da2bd");
    this.phase7StorageLabels.cloud
      .setText(cloudFiles.length ? cloudFiles.join("\n") : "Nenhum arquivo enviado")
      .setColor(cloudFiles.length ? "#dce8f5" : "#8da2bd");
  }

  getSSDUsed() {
    let total = 0;
    this.phase7Assignments.forEach((destination, index) => {
      if (destination === "ssd") {
        total += PHASE7_FILES[index].size;
      }
    });
    return total;
  }

  maybeTriggerConnectionInstability() {
    if (this.phase7ConnectionEventUsed || this.phase7Assignments.size < 3) {
      return;
    }

    this.phase7ConnectionEventUsed = true;
    this.phase7ConnectionStable = false;
    this.updateConnectionIndicator();
    this.showMessage("Conexão instavel! Restabeleça antes de enviar mais arquivos para a nuvem.", "#ffd166");
  }

  updateConnectionIndicator() {
    if (this.phase7ConnectionStable) {
      this.phase7ConnectionLight.setFillStyle(0x8ef28b, 1).setScale(1);
      this.phase7ConnectionText.setText("CONEXÃO ESTÁVEL").setColor("#8ef28b");
      if (this.phase7ConnectionTween) {
        this.phase7ConnectionTween.stop();
        this.phase7ConnectionTween = null;
      }
      return;
    }

    this.phase7ConnectionLight.setFillStyle(0xffd166, 1);
    this.phase7ConnectionText.setText("CONEXÃO INSTÁVEL").setColor("#ffd166");
    this.phase7ConnectionTween = this.tweens.add({
      targets: this.phase7ConnectionLight,
      alpha: 0.25,
      scale: 1.35,
      duration: 320,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  disableChallengeControls() {
    this.phase7ControlButtons.forEach(({ button, text }) => {
      button.disableInteractive();
      button.setFillStyle(0x111a2d, 0.78);
      text.setColor("#53657c");
    });
    this.phase7FileCards.forEach(({ background }) => background.disableInteractive());
  }

  animateFileTo(startX, startY, endX, endY, color) {
    const particle = this.add
      .rectangle(startX, startY, 28, 18, color, 0.9)
      .setStrokeStyle(1, 0xffffff, 0.45);
    this.addToStage(particle);

    this.tweens.add({
      targets: particle,
      x: endX,
      y: endY,
      alpha: 0,
      scale: 0.35,
      duration: 430,
      ease: "Sine.inOut",
      onComplete: () => particle.destroy(),
    });

    for (let i = 0; i < 5; i += 1) {
      const dot = this.add.circle(startX, startY, 3, color, 0.7);
      this.addToStage(dot);
      this.tweens.add({
        targets: dot,
        x: Phaser.Math.Linear(startX, endX, (i + 1) / 6),
        y: Phaser.Math.Linear(startY, endY, (i + 1) / 6),
        alpha: 0,
        duration: 260 + i * 50,
        delay: i * 28,
        onComplete: () => dot.destroy(),
      });
    }
  }

  pulseStorage(target, color) {
    this.tweens.add({
      targets: target,
      scale: 1.04,
      duration: 130,
      yoyo: true,
      ease: "Sine.inOut",
    });

    const bounds = target === this.phase7SSDContainer ? [172, 220] : [788, 220];
    const ring = this.add
      .circle(bounds[0], bounds[1], 105, color, 0)
      .setStrokeStyle(3, color, 0.45);
    this.addToStage(ring);
    this.tweens.add({
      targets: ring,
      scale: 1.18,
      alpha: 0,
      duration: 420,
      onComplete: () => ring.destroy(),
    });
  }

  shakeCapacityBar() {
    this.tweens.add({
      targets: [this.phase7CapacityBack, this.phase7CapacityFill],
      x: "+=6",
      duration: 55,
      yoyo: true,
      repeat: 3,
    });
  }

  flashConnectionWarning() {
    this.tweens.add({
      targets: [this.phase7ConnectionLight, this.phase7ConnectionText],
      alpha: 0.25,
      duration: 90,
      yoyo: true,
      repeat: 3,
    });
  }

  createCelebrationParticles() {
    const colors = [0x8ef28b, 0x70b7ff, 0xffd166, 0x62e7f2];
    for (let i = 0; i < 22; i += 1) {
      const x = 480 + Phaser.Math.Between(-160, 160);
      const y = 110 + Phaser.Math.Between(-20, 70);
      const dot = this.add.circle(x, y, Phaser.Math.Between(2, 5), colors[i % colors.length], 0.9);
      this.addToStage(dot);
      this.tweens.add({
        targets: dot,
        y: y + Phaser.Math.Between(60, 155),
        x: x + Phaser.Math.Between(-35, 35),
        alpha: 0,
        duration: Phaser.Math.Between(650, 1050),
        ease: "Sine.out",
        onComplete: () => dot.destroy(),
      });
    }
  }

  createIntroStorageIcon(x, y) {
    const container = this.add.container(x, y);
    this.addToStage(container);

    const graphics = this.add.graphics();
    graphics.fillStyle(0x101f35, 1);
    graphics.fillRoundedRect(-154, -44, 118, 88, 12);
    graphics.lineStyle(2, 0x8ef28b, 0.8);
    graphics.strokeRoundedRect(-154, -44, 118, 88, 12);
    graphics.fillStyle(0x8ef28b, 0.18);
    graphics.fillRoundedRect(-132, -18, 74, 10, 4);
    graphics.fillRoundedRect(-132, 4, 54, 10, 4);

    graphics.fillStyle(0x70b7ff, 0.26);
    graphics.fillCircle(62, -8, 32);
    graphics.fillCircle(102, -18, 38);
    graphics.fillCircle(140, -4, 28);
    graphics.fillRoundedRect(48, -8, 110, 46, 24);
    graphics.lineStyle(2, 0x70b7ff, 0.75);
    graphics.strokeRoundedRect(52, -4, 102, 38, 18);

    graphics.lineStyle(3, 0xffd166, 0.5);
    graphics.lineBetween(-20, 0, 28, 0);
    graphics.fillTriangle(28, 0, 14, -8, 14, 8);
    container.add(graphics);

    const bit = this.add
      .text(0, -68, "FLASH + INTERNET", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#ffd166",
      })
      .setOrigin(0.5);
    container.add(bit);

    this.tweens.add({
      targets: container,
      y: y + 6,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  createConclusionIcon(x, y) {
    const container = this.add.container(x, y);
    this.addToStage(container);

    const graphics = this.add.graphics();
    graphics.fillStyle(0x101f35, 1);
    graphics.fillRoundedRect(-82, -32, 70, 64, 10);
    graphics.lineStyle(2, 0x8ef28b, 0.9);
    graphics.strokeRoundedRect(-82, -32, 70, 64, 10);
    graphics.fillStyle(0x8ef28b, 0.24);
    graphics.fillRoundedRect(-68, -8, 42, 8, 3);
    graphics.fillRoundedRect(-68, 10, 32, 8, 3);

    graphics.fillStyle(0x70b7ff, 0.28);
    graphics.fillCircle(34, 4, 28);
    graphics.fillCircle(72, -8, 34);
    graphics.fillCircle(108, 6, 24);
    graphics.fillRoundedRect(28, 0, 96, 38, 20);
    graphics.lineStyle(2, 0x70b7ff, 0.9);
    graphics.strokeRoundedRect(30, 2, 92, 34, 18);

    graphics.lineStyle(3, 0xffd166, 0.7);
    graphics.lineBetween(-2, 8, 22, 8);
    graphics.fillTriangle(22, 8, 10, 1, 10, 15);
    container.add(graphics);

    this.tweens.add({
      targets: container,
      scale: 1.06,
      duration: 760,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  createButton(x, y, width, label, callback, options = {}) {
    const border = options.border ?? 0x62e7f2;
    const hover = options.hover ?? 0x1c5264;
    const fontSize = options.fontSize ?? "9px";

    const shadow = this.add
      .rectangle(x + 4, y + 5, width, 34, 0x000000, 0.35)
      .setOrigin(0.5);
    const button = this.add
      .rectangle(x, y, width, 34, 0x15344b, 1)
      .setStrokeStyle(2, border, 0.85)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(x, y, label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize,
        color: "#f1f7ff",
        align: "center",
      })
      .setOrigin(0.5);

    this.addToStage(shadow);
    this.addToStage(button);
    this.addToStage(text);

    button.on("pointerover", () => {
      button.setFillStyle(hover, 1);
      this.tweens.add({ targets: [button, text], scale: 1.035, duration: 100 });
    });
    button.on("pointerout", () => {
      button.setFillStyle(0x15344b, 1);
      this.tweens.add({ targets: [button, text], scale: 1, duration: 100 });
    });
    button.on("pointerdown", callback);

    return { button, text, shadow };
  }

  createBackLink() {
    const back = this.add
      .text(38, 38, "← LINHA DO TEMPO", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "15px",
        fontStyle: "800",
        color: "#8da2bd",
      })
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
