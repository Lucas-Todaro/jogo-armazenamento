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

const PHASE5_STARTING_SCORE = 100;
const PHASE5_READ_PENALTY = 10;
const PHASE5_SCRATCH_PENALTY = 5;
const PHASE5_MIN_SECTORS = 6;
const PHASE5_MAX_SECTORS = 8;

const PHASE5_SECTOR_SLOTS = [
  { id: "north-west", x: -73, y: -87 },
  { id: "north", x: 3, y: -111 },
  { id: "north-east", x: 82, y: -76 },
  { id: "east", x: 111, y: -4 },
  { id: "south-east", x: 78, y: 77 },
  { id: "south", x: 4, y: 109 },
  { id: "south-west", x: -82, y: 76 },
  { id: "west", x: -111, y: -5 },
  { id: "inner-north-west", x: -47, y: -40 },
  { id: "inner-north-east", x: 49, y: -39 },
  { id: "inner-south-east", x: 48, y: 42 },
  { id: "inner-south-west", x: -48, y: 42 },
];

const PHASE5_SCRATCH_SLOTS = [
  { id: "scratch-a", x: -52, y: -70, length: 64, angle: 0.42 },
  { id: "scratch-b", x: 62, y: -18, length: 76, angle: -0.68 },
  { id: "scratch-c", x: -34, y: 75, length: 70, angle: 0.2 },
  { id: "scratch-d", x: 35, y: 72, length: 58, angle: -0.34 },
  { id: "scratch-e", x: -82, y: 9, length: 60, angle: 0.78 },
  { id: "scratch-f", x: 34, y: -84, length: 56, angle: 0.12 },
];

const PHASE5_DISC = {
  x: 352,
  y: 274,
  radius: 142,
};

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
      accent: 0xc49cff,
      bottomLeft: 0x17283a,
      bottomRight: 0x0a1522,
      gridAlpha: 0.04,
      frameAlpha: 0.12,
    });
  }

  createIntroPanel() {
    this.clearStage();
    this.phase5Stage = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 48, "FASE 5: CD / DVD", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "20px",
          color: "#c49cff",
        })
        .setOrigin(0.5),
    );

    this.addToStage(
      createRoundedPanel(this, 480, 278, 780, 374, {
        stroke: 0xc49cff,
        strokeAlpha: 0.46,
        radius: 20,
      }),
    );

    this.createIntroDisc(480, 151);

    this.addToStage(
      this.add
        .text(
          480,
          298,
          "CDs e DVDs armazenam dados em discos ópticos. Um laser lê\npequenas marcas na superfície para acessar arquivos,\nmúsicas, vídeos e programas.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "19px",
            fontStyle: "700",
            color: "#dce8f5",
            align: "center",
            lineSpacing: 6,
            wordWrap: { width: 710 },
          },
        )
        .setOrigin(0.5),
    );

    this.addToStage(
      this.add
        .text(
          480,
          376,
          "Limpe a sujeira do disco e evite os danos\npara concluir a leitura.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "18px",
            fontStyle: "900",
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
    this.phase5Score = getStartingScoreForPhase(5, PHASE5_STARTING_SCORE);
    this.phase5MaxScore = this.phase5Score + PHASE5_STARTING_SCORE;
    this.phase5CleanedDirt = new Set();
    this.phase5DiscoveredScratches = new Set();
    this.phase5IsReading = false;
    this.phase5IsComplete = false;
    this.phase5SectorObjects = new Map();
    this.phase5DirtObjects = [];
    this.phase5ScratchObjects = [];
    this.setupRandomChallenge();

    this.clearStage();
    this.phase5Stage = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 29, "FASE 5: LEITURA ÓPTICA", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "14px",
          color: "#c49cff",
        })
        .setOrigin(0.5),
    );

    this.phase5ScoreText = this.add
      .text(916, 29, `PONTOS: ${this.phase5Score}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#8ef28b",
      })
      .setOrigin(1, 0.5);
    this.addToStage(this.phase5ScoreText);

    this.createObjectivePanel();
    this.createDiscArea();
    this.createDisc();
    this.createSectors();
    this.createScratches();
    this.createDirt();
    this.createLaser();
    this.createSidePanel();
    this.createControls();
    this.createFeedbackArea();
    this.createBackLink();
    this.updateReadiness();

    this.phase5Stage.setAlpha(0);
    this.tweens.add({
      targets: this.phase5Stage,
      alpha: 1,
      duration: 280,
      ease: "Sine.out",
    });
  }

  setupRandomChallenge() {
    const previousSignature = this.phase5ChallengeSignature;

    for (let attempt = 0; attempt < 150; attempt += 1) {
      const sectorCount = Phaser.Math.Between(
        PHASE5_MIN_SECTORS,
        PHASE5_MAX_SECTORS,
      );
      const importantCount = Phaser.Math.Between(3, 4);
      const selectedSlots = this.shuffleItems(PHASE5_SECTOR_SLOTS).slice(
        0,
        sectorCount,
      );
      const importantIds = new Set(
        this.shuffleItems(selectedSlots)
          .slice(0, importantCount)
          .map((slot) => slot.id),
      );
      const sectors = selectedSlots.map((slot, index) => ({
        ...slot,
        number: index + 1,
        important: importantIds.has(slot.id),
      }));

      const importantSectors = sectors.filter((sector) => sector.important);
      const optionalSectors = sectors.filter((sector) => !sector.important);
      const importantDirtCount = Phaser.Math.Between(
        Math.max(2, importantCount - 1),
        importantCount,
      );
      const optionalDirtCount = Phaser.Math.Between(
        1,
        Math.min(2, optionalSectors.length),
      );
      const dirtySectors = [
        ...this.shuffleItems(importantSectors).slice(0, importantDirtCount),
        ...this.shuffleItems(optionalSectors).slice(0, optionalDirtCount),
      ];
      const dirtSpots = dirtySectors.map((sector, index) => ({
        id: `dirt-${sector.id}`,
        sectorId: sector.id,
        x: sector.x + Phaser.Math.Between(-3, 3),
        y: sector.y + Phaser.Math.Between(-3, 3),
        size: Phaser.Math.Between(13, 17),
        important: sector.important,
        index,
      }));

      const scratchCount = Phaser.Math.Between(1, 2);
      const scratches = this.pickScratchSlots(dirtSpots, scratchCount);
      const scanDirection = Phaser.Math.Between(0, 1) === 0 ? "left" : "right";
      const signature = [
        sectors
          .map(
            (sector) =>
              `${sector.id}:${sector.important ? "I" : "N"}`,
          )
          .sort()
          .join("|"),
        dirtSpots
          .map((dirt) => `${dirt.sectorId}:${dirt.size}`)
          .sort()
          .join("|"),
        scratches
          .map((scratch) => scratch.id)
          .sort()
          .join("|"),
        scanDirection,
      ].join("::");

      if (signature !== previousSignature) {
        this.phase5Sectors = sectors;
        this.phase5DirtSpots = dirtSpots;
        this.phase5Scratches = scratches;
        this.phase5ScanDirection = scanDirection;
        this.phase5ChallengeSignature = signature;
        return;
      }
    }

    this.createFallbackChallenge();
  }

  pickScratchSlots(dirtSpots, scratchCount) {
    const preferredSlots = this.shuffleItems(PHASE5_SCRATCH_SLOTS).filter(
      (scratch) =>
        dirtSpots.every(
          (dirt) =>
            Phaser.Math.Distance.Between(
              scratch.x,
              scratch.y,
              dirt.x,
              dirt.y,
            ) > 38,
        ),
    );
    const chosenSlots = preferredSlots.slice(0, scratchCount);

    if (chosenSlots.length < scratchCount) {
      const chosenIds = new Set(chosenSlots.map((scratch) => scratch.id));
      const remainingSlots = this.shuffleItems(PHASE5_SCRATCH_SLOTS).filter(
        (scratch) => !chosenIds.has(scratch.id),
      );
      chosenSlots.push(
        ...remainingSlots.slice(0, scratchCount - chosenSlots.length),
      );
    }

    return chosenSlots;
  }

  createFallbackChallenge() {
    const sectors = PHASE5_SECTOR_SLOTS.slice(0, 7).map((slot, index) => ({
      ...slot,
      number: index + 1,
      important: [0, 2, 4, 6].includes(index),
    }));

    this.phase5Sectors = sectors;
    this.phase5DirtSpots = [sectors[0], sectors[2], sectors[4], sectors[1]].map(
      (sector, index) => ({
        id: `dirt-${sector.id}`,
        sectorId: sector.id,
        x: sector.x,
        y: sector.y,
        size: 15,
        important: sector.important,
        index,
      }),
    );
    this.phase5Scratches = [PHASE5_SCRATCH_SLOTS[2]];
    this.phase5ScanDirection = "left";
    this.phase5ChallengeSignature = "fallback-phase-4";
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
          "Objetivo: limpe os setores importantes para o laser ler os dados.",
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

  createDiscArea() {
    this.addToStage(
      createRoundedPanel(this, 350, 280, 610, 330, {
        fill: 0x0b1729,
        stroke: 0xc49cff,
        strokeAlpha: 0.32,
        radius: 16,
      }),
    );

    this.addToStage(
      this.add
        .text(350, 129, "SUPERFÍCIE DO DISCO", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#c49cff",
        })
        .setOrigin(0.5),
    );
  }

  createDisc() {
    this.phase5DiscContainer = this.add.container(
      PHASE5_DISC.x,
      PHASE5_DISC.y,
    );
    this.addToStage(this.phase5DiscContainer);

    const disc = this.add.graphics();
    disc.fillStyle(0x030713, 0.42);
    disc.fillCircle(7, 9, PHASE5_DISC.radius + 2);
    disc.fillStyle(0xbccbd8, 1);
    disc.fillCircle(0, 0, PHASE5_DISC.radius);

    const rings = [
      { radius: 130, color: 0x62e7f2, alpha: 0.34, width: 5 },
      { radius: 111, color: 0xc49cff, alpha: 0.32, width: 8 },
      { radius: 88, color: 0xffd166, alpha: 0.22, width: 7 },
      { radius: 65, color: 0x8ef28b, alpha: 0.2, width: 6 },
    ];
    rings.forEach(({ radius, color, alpha, width }) => {
      disc.lineStyle(width, color, alpha);
      disc.strokeCircle(0, 0, radius);
    });

    disc.lineStyle(3, 0xf1f7ff, 0.48);
    disc.strokeCircle(0, 0, PHASE5_DISC.radius);
    disc.fillStyle(0x0b1627, 1);
    disc.fillCircle(0, 0, 29);
    disc.lineStyle(6, 0x8799a8, 0.85);
    disc.strokeCircle(0, 0, 29);

    disc.fillStyle(0xffffff, 0.22);
    disc.beginPath();
    disc.moveTo(-108, -89);
    disc.lineTo(-20, -20);
    disc.lineTo(-53, 18);
    disc.lineTo(-128, -48);
    disc.closePath();
    disc.fillPath();

    disc.fillStyle(0x62e7f2, 0.12);
    disc.beginPath();
    disc.moveTo(92, -96);
    disc.lineTo(30, -26);
    disc.lineTo(64, 12);
    disc.lineTo(127, -51);
    disc.closePath();
    disc.fillPath();
    this.phase5DiscContainer.add(disc);

    this.phase5DiscGlow = this.add
      .circle(
        PHASE5_DISC.x,
        PHASE5_DISC.y,
        PHASE5_DISC.radius + 10,
        0xc49cff,
        0,
      )
      .setStrokeStyle(4, 0xc49cff, 0);
    this.addToStage(this.phase5DiscGlow);
  }

  createSectors() {
    this.phase5Sectors.forEach((sector) => {
      const sectorContainer = this.add.container(sector.x, sector.y);
      const halo = this.add.circle(
        0,
        0,
        sector.important ? 22 : 16,
        sector.important ? 0xffd166 : 0x62e7f2,
        sector.important ? 0.14 : 0.08,
      );
      const marker = this.add
        .circle(
          0,
          0,
          sector.important ? 13 : 10,
          sector.important ? 0x493d1c : 0x24495d,
          0.96,
        )
        .setStrokeStyle(
          sector.important ? 3 : 2,
          sector.important ? 0xffd166 : 0x62e7f2,
          sector.important ? 0.95 : 0.7,
        );
      const dataPoint = this.add.circle(
        0,
        0,
        4,
        sector.important ? 0xffd166 : 0x62e7f2,
        1,
      );
      const number = this.add
        .text(0, sector.important ? -31 : -25, String(sector.number), {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "5px",
          color: sector.important ? "#493d1c" : "#24495d",
          backgroundColor: sector.important ? "#ffd166" : "#8ed8e8",
          padding: { left: 3, right: 3, top: 2, bottom: 2 },
        })
        .setOrigin(0.5);

      sectorContainer.add([halo, marker, dataPoint, number]);
      this.phase5DiscContainer.add(sectorContainer);
      this.phase5SectorObjects.set(sector.id, {
        container: sectorContainer,
        halo,
        marker,
        dataPoint,
        number,
        sector,
      });
    });
  }

  createScratches() {
    this.phase5Scratches.forEach((scratch, index) => {
      const scratchContainer = this.add.container(scratch.x, scratch.y);
      const shadow = this.add
        .rectangle(2, 2, scratch.length, 4, 0x26333d, 0.72)
        .setRotation(scratch.angle);
      const scratchLine = this.add
        .rectangle(0, 0, scratch.length, 3, 0xe7edf2, 0.94)
        .setRotation(scratch.angle);
      const highlight = this.add
        .rectangle(
          -scratch.length * 0.08,
          -2,
          scratch.length * 0.7,
          1,
          0xffffff,
          0.92,
        )
        .setRotation(scratch.angle);
      const endMark = this.add
        .rectangle(
          scratch.length * 0.28,
          1,
          scratch.length * 0.22,
          2,
          0x8394a2,
          0.8,
        )
        .setRotation(scratch.angle + 0.08);
      const hitArea = this.add
        .rectangle(0, 0, scratch.length + 28, 26, 0xffffff, 0.001)
        .setRotation(scratch.angle)
        .setInteractive({ useHandCursor: true });

      scratchContainer.add([
        shadow,
        scratchLine,
        highlight,
        endMark,
        hitArea,
      ]);
      this.phase5DiscContainer.add(scratchContainer);
      hitArea.on("pointerdown", () => this.handleScratchClick(index));

      this.phase5ScratchObjects.push({
        container: scratchContainer,
        scratchLine,
        highlight,
        hitArea,
      });
    });
  }

  createDirt() {
    this.phase5DirtSpots.forEach((spot, index) => {
      const dirtContainer = this.add.container(spot.x, spot.y);
      const stainEdge = this.add
        .circle(0, 0, spot.size + 5, 0x3c2919, 0.25)
        .setStrokeStyle(2, 0x382618, 0.7);
      const stain = this.add.circle(0, 0, spot.size, 0x76512d, 0.94);
      const blobOne = this.add.circle(
        -spot.size * 0.55,
        3,
        spot.size * 0.55,
        0x654321,
        0.88,
      );
      const blobTwo = this.add.circle(
        spot.size * 0.52,
        -3,
        spot.size * 0.46,
        0x8a6034,
        0.9,
      );
      const speckOne = this.add.circle(-6, -6, 3, 0x332116, 0.9);
      const speckTwo = this.add.circle(7, 5, 2.5, 0x422a17, 0.9);
      const hitArea = this.add
        .circle(0, 0, spot.size + 16, 0xffffff, 0.001)
        .setInteractive({ useHandCursor: true });

      dirtContainer.add([
        stainEdge,
        stain,
        blobOne,
        blobTwo,
        speckOne,
        speckTwo,
        hitArea,
      ]);
      this.phase5DiscContainer.add(dirtContainer);

      hitArea.on("pointerover", () => {
        if (!this.phase5IsComplete && !this.phase5IsReading) {
          this.tweens.add({
            targets: dirtContainer,
            scale: 1.13,
            duration: 100,
            ease: "Sine.out",
          });
        }
      });
      hitArea.on("pointerout", () => {
        this.tweens.add({
          targets: dirtContainer,
          scale: 1,
          duration: 100,
          ease: "Sine.out",
        });
      });
      hitArea.on("pointerdown", () => this.cleanDirt(index));

      this.phase5DirtObjects.push({
        container: dirtContainer,
        hitArea,
        spot,
      });
    });
  }

  createLaser() {
    const reader = this.add.graphics();
    reader.fillStyle(0x15283b, 1);
    reader.fillRoundedRect(150, 407, 404, 40, 10);
    reader.lineStyle(2, 0x62e7f2, 0.55);
    reader.strokeRoundedRect(150, 407, 404, 40, 10);
    reader.fillStyle(0x60758a, 1);
    reader.fillRoundedRect(306, 398, 92, 22, 5);
    reader.fillStyle(0x09121f, 1);
    reader.fillCircle(352, 409, 8);
    reader.fillStyle(0x62e7f2, 1);
    reader.fillCircle(352, 409, 3);
    this.addToStage(reader);

    this.phase5LaserGlow = this.add
      .rectangle(352, 405, 22, 262, 0x62e7f2, 0)
      .setOrigin(0.5, 1)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.phase5LaserBeam = this.add
      .rectangle(352, 405, 5, 262, 0x62e7f2, 0)
      .setOrigin(0.5, 1)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.phase5LaserHead = this.add.circle(352, 409, 6, 0x62e7f2, 0.95);
    this.addToStage([
      this.phase5LaserGlow,
      this.phase5LaserBeam,
      this.phase5LaserHead,
    ]);

    this.addToStage(
      this.add
        .text(
          352,
          435,
          `UNIDADE LASER  ${this.phase5ScanDirection === "left" ? ">" : "<"}`,
          {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "7px",
            color: "#62e7f2",
          },
        )
        .setOrigin(0.5),
    );
  }

  createSidePanel() {
    this.addToStage(
      createRoundedPanel(this, 785, 280, 270, 330, {
        fill: 0x0b1729,
        stroke: 0x62e7f2,
        strokeAlpha: 0.32,
        radius: 16,
      }),
    );

    this.addToStage(
      this.add
        .text(785, 130, "STATUS DA LEITURA", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#62e7f2",
        })
        .setOrigin(0.5),
    );

    this.phase5ReadinessText = this.add
      .text(785, 162, "", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#ffd166",
        align: "center",
        lineSpacing: 4,
      })
      .setOrigin(0.5);
    this.addToStage(this.phase5ReadinessText);

    this.addToStage(
      this.add
        .text(785, 206, "LEGENDA", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: "#c49cff",
        })
        .setOrigin(0.5),
    );

    this.createLegendRow(785, 232, "important", "Anel amarelo: setor importante");
    this.createLegendRow(785, 261, "dirt", "Mancha marrom: clique para limpar");
    this.createLegendRow(785, 290, "scratch", "Risco claro: dano permanente");

    this.addToStage(
      createRoundedPanel(this, 785, 342, 230, 62, {
        fill: 0x101f35,
        stroke: 0xffd166,
        strokeAlpha: 0.3,
        radius: 12,
        shadow: false,
      }),
    );

    this.addToStage(
      this.add
        .text(
          785,
          342,
          "Dica: o laser precisa de uma\nsuperfície limpa para ler os dados.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "12px",
            fontStyle: "800",
            color: "#dce8f5",
            align: "center",
            lineSpacing: 2,
          },
        )
        .setOrigin(0.5),
    );
  }

  createLegendRow(x, y, type, label) {
    if (type === "important") {
      this.addToStage(
        this.add
          .circle(x - 103, y, 8, 0x493d1c, 1)
          .setStrokeStyle(3, 0xffd166, 1),
      );
    } else if (type === "dirt") {
      this.addToStage(
        this.add
          .circle(x - 103, y, 9, 0x76512d, 1)
          .setStrokeStyle(2, 0x382618, 0.8),
      );
    } else {
      this.addToStage(
        this.add.rectangle(x - 103, y, 19, 3, 0xe7edf2, 1).setRotation(-0.4),
      );
    }

    this.addToStage(
      this.add
        .text(x - 85, y, label, {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "11px",
          fontStyle: "800",
          color: "#c7d7e8",
        })
        .setOrigin(0, 0.5),
    );
  }

  createControls() {
    this.phase5ReadButton = this.createButton(
      785,
      416,
      230,
      "LER DISCO",
      () => this.readDisc(),
      {
        border: 0x8ef28b,
        hover: 0x246a69,
        fontSize: "10px",
        height: 50,
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

    this.phase5MessageText = this.add
      .text(
        480,
        503,
        "Clique nas manchas sobre os setores importantes.",
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
    this.addToStage(this.phase5MessageText);
  }

  cleanDirt(index) {
    if (
      this.phase5IsReading ||
      this.phase5IsComplete ||
      this.phase5CleanedDirt.has(index)
    ) {
      return;
    }

    this.phase5CleanedDirt.add(index);
    const dirt = this.phase5DirtObjects[index];
    dirt.hitArea.disableInteractive();

    this.tweens.add({
      targets: dirt.container,
      scale: 1.65,
      alpha: 0,
      angle: 35,
      duration: 280,
      ease: "Sine.out",
      onComplete: () => dirt.container.setVisible(false),
    });

    this.updateSectorVisual(dirt.spot.sectorId);
    this.updateReadiness();
    this.showFeedback(
      dirt.spot.important
        ? "Sujeira removida do setor importante."
        : "Sujeira removida. Este setor era opcional.",
      "success",
    );
    this.createCleaningSparkles(
      PHASE5_DISC.x + dirt.spot.x,
      PHASE5_DISC.y + dirt.spot.y,
    );
  }

  updateSectorVisual(sectorId) {
    const sectorObject = this.phase5SectorObjects.get(sectorId);

    if (!sectorObject?.sector.important) {
      return;
    }

    const isClean = this.isImportantSectorClean(sectorId);
    sectorObject.halo.setFillStyle(isClean ? 0x8ef28b : 0xffd166, 0.16);
    sectorObject.marker
      .setFillStyle(isClean ? 0x173d35 : 0x493d1c, 0.96)
      .setStrokeStyle(3, isClean ? 0x8ef28b : 0xffd166, 0.95);
    sectorObject.dataPoint.setFillStyle(isClean ? 0x8ef28b : 0xffd166, 1);
    sectorObject.number
      .setBackgroundColor(isClean ? "#8ef28b" : "#ffd166")
      .setColor(isClean ? "#173d35" : "#493d1c");
  }

  updateReadiness() {
    const importantSectors = this.phase5Sectors.filter(
      (sector) => sector.important,
    );
    const cleanCount = importantSectors.filter((sector) =>
      this.isImportantSectorClean(sector.id),
    ).length;
    const allClean = cleanCount === importantSectors.length;

    importantSectors.forEach((sector) => this.updateSectorVisual(sector.id));
    this.phase5ReadinessText
      .setText(
        `SETORES IMPORTANTES\nLIMPOS: ${cleanCount} / ${importantSectors.length}`,
      )
      .setColor(allClean ? "#8ef28b" : "#ffd166");
  }

  isImportantSectorClean(sectorId) {
    const dirtIndex = this.phase5DirtSpots.findIndex(
      (dirt) => dirt.sectorId === sectorId,
    );

    return dirtIndex === -1 || this.phase5CleanedDirt.has(dirtIndex);
  }

  createCleaningSparkles(x, y) {
    const offsets = [
      [-12, -10],
      [13, -7],
      [-8, 13],
      [11, 11],
    ];

    offsets.forEach(([offsetX, offsetY], index) => {
      const sparkle = this.add
        .rectangle(
          x + offsetX,
          y + offsetY,
          5,
          5,
          index % 2 === 0 ? 0x62e7f2 : 0x8ef28b,
          0.9,
        )
        .setRotation(Math.PI / 4);
      this.addToStage(sparkle);
      this.tweens.add({
        targets: sparkle,
        scale: 1.9,
        alpha: 0,
        duration: 350,
        delay: index * 35,
      });
    });
  }

  handleScratchClick(index) {
    if (this.phase5IsReading || this.phase5IsComplete) {
      return;
    }

    const wasAlreadyDiscovered =
      this.phase5DiscoveredScratches.has(index);

    if (wasAlreadyDiscovered) {
      this.updateScore(-PHASE5_SCRATCH_PENALTY);
    } else {
      this.phase5DiscoveredScratches.add(index);
    }

    const scratch = this.phase5ScratchObjects[index];
    scratch.scratchLine.setFillStyle(0xff7b68, 1);
    scratch.highlight.setFillStyle(0xffc0b3, 1);

    this.tweens.add({
      targets: scratch.container,
      scale: 1.18,
      duration: 90,
      yoyo: true,
      repeat: 2,
      ease: "Sine.inOut",
      onComplete: () => {
        scratch.scratchLine.setFillStyle(0xe7edf2, 0.94);
        scratch.highlight.setFillStyle(0xffffff, 0.92);
      },
    });

    this.showFeedback(
      wasAlreadyDiscovered
        ? "O risco é permanente. Evite insistir: -5 pontos."
        : "Arranhões podem prejudicar a leitura e não desaparecem.",
      wasAlreadyDiscovered ? "error" : "warning",
    );
  }

  readDisc() {
    if (this.phase5IsReading || this.phase5IsComplete) {
      return;
    }

    this.phase5IsReading = true;
    const remainingImportantDirt = this.phase5DirtSpots.filter(
      (dirt, index) =>
        dirt.important && !this.phase5CleanedDirt.has(index),
    );
    const isSuccessful = remainingImportantDirt.length === 0;

    this.animateLaserScan(isSuccessful, () => {
      this.phase5IsReading = false;

      if (isSuccessful) {
        this.showSuccess();
      } else {
        this.showFailure(remainingImportantDirt);
      }
    });
  }

  animateLaserScan(isSuccessful, onComplete) {
    const color = isSuccessful ? 0x8ef28b : 0xff7b68;
    const startX = this.phase5ScanDirection === "left" ? 220 : 484;
    const endX = this.phase5ScanDirection === "left" ? 484 : 220;

    this.phase5LaserBeam
      .setFillStyle(color, 0.96)
      .setAlpha(0.96)
      .setX(startX);
    this.phase5LaserGlow
      .setFillStyle(color, 0.22)
      .setAlpha(0.72)
      .setX(startX);
    this.phase5LaserHead.setFillStyle(color, 1).setX(startX);

    this.tweens.add({
      targets: [
        this.phase5LaserBeam,
        this.phase5LaserGlow,
        this.phase5LaserHead,
      ],
      x: endX,
      duration: 900,
      ease: "Sine.inOut",
      onComplete: () => {
        this.phase5LaserBeam.setAlpha(0);
        this.phase5LaserGlow.setAlpha(0);
        this.phase5LaserHead.setFillStyle(0x62e7f2, 0.95).setX(352);
        onComplete();
      },
    });
  }

  showFailure(remainingImportantDirt) {
    this.updateScore(-PHASE5_READ_PENALTY);
    this.showFeedback(
      "O laser encontrou sujeira. Limpe os setores importantes.",
      "error",
    );

    remainingImportantDirt.forEach((dirt) => {
      const dirtObject = this.phase5DirtObjects[dirt.index];
      this.tweens.add({
        targets: dirtObject.container,
        scale: 1.22,
        duration: 90,
        yoyo: true,
        repeat: 2,
        ease: "Sine.inOut",
      });
    });

    this.tweens.add({
      targets: this.phase5DiscContainer,
      x: PHASE5_DISC.x + 5,
      duration: 55,
      yoyo: true,
      repeat: 2,
      ease: "Sine.inOut",
      onComplete: () => this.phase5DiscContainer.setX(PHASE5_DISC.x),
    });
    this.cameras.main.shake(110, 0.0015);
  }

  updateScore(change) {
    this.phase5Score = Phaser.Math.Clamp(
      this.phase5Score + change,
      0,
      this.phase5MaxScore,
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

  showFeedback(message, type = "neutral") {
    const colors = {
      neutral: "#8da2bd",
      success: "#8ef28b",
      error: "#ff9b78",
      warning: "#ffd166",
    };

    this.phase5MessageText
      .setText(message)
      .setColor(colors[type] ?? colors.neutral);
  }

  showSuccess() {
    this.phase5IsComplete = true;
    this.disableChallengeControls();
    this.showFeedback("Leitura concluída com sucesso!", "success");

    this.phase5DiscGlow
      .setFillStyle(0x8ef28b, 0.1)
      .setStrokeStyle(4, 0x8ef28b, 0.9)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: this.phase5DiscGlow,
      scale: 1.12,
      alpha: 0.3,
      duration: 340,
      yoyo: true,
      repeat: 2,
      ease: "Sine.inOut",
    });
    this.tweens.add({
      targets: this.phase5DiscContainer,
      angle: 360,
      duration: 1300,
      ease: "Cubic.out",
    });

    this.createSuccessSparkles();
    this.time.delayedCall(1500, () => this.showConclusion());
  }

  createSuccessSparkles() {
    const positions = [
      [232, 170],
      [310, 120],
      [410, 124],
      [487, 180],
      [470, 348],
      [244, 350],
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
    completePhase(5);
    savePhaseScore(5, this.phase5Score);

    const finalScore = this.phase5Score;
    this.clearStage();
    this.phase5Stage = this.add.container(0, 0);

    const glow = this.add
      .circle(480, 125, 78, 0xc49cff, 0.07)
      .setStrokeStyle(2, 0xc49cff, 0.3);
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

    this.createCompletionDisc(480, 126);

    this.addToStage(
      createRoundedPanel(this, 480, 301, 770, 220, {
        stroke: 0xc49cff,
        strokeAlpha: 0.42,
        radius: 18,
      }),
    );

    this.addToStage(
      this.add
        .text(
          480,
          280,
          "Você aprendeu que CDs e DVDs armazenam dados de forma óptica,\nusando laser. Eles oferecem mais capacidade que disquetes,\nmas podem falhar quando estão sujos ou arranhados.",
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
      180,
      462,
      240,
      "VOLTAR À LINHA DO TEMPO",
      () => this.returnToTimeline(),
      { border: 0x62e7f2, hover: 0x1c5264, fontSize: "7px" },
    );
    this.createButton(
      480,
      462,
      240,
      "PRÓXIMA FASE",
      () => this.scene.start("Phase6Scene"),
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

    this.phase5Stage.setAlpha(0).setScale(0.97);
    this.tweens.add({
      targets: this.phase5Stage,
      alpha: 1,
      scale: 1,
      duration: 350,
      ease: "Back.out",
    });
  }

  createIntroDisc(x, y) {
    const disc = this.add.graphics();
    disc.fillStyle(0xb6c8d6, 1);
    disc.fillCircle(x, y, 82);
    disc.lineStyle(8, 0x62e7f2, 0.3);
    disc.strokeCircle(x, y, 67);
    disc.lineStyle(7, 0xc49cff, 0.3);
    disc.strokeCircle(x, y, 48);
    disc.fillStyle(0x0b1627, 1);
    disc.fillCircle(x, y, 18);
    disc.lineStyle(4, 0x8799a8, 0.8);
    disc.strokeCircle(x, y, 18);
    disc.fillStyle(0xffffff, 0.2);
    disc.beginPath();
    disc.moveTo(x - 59, y - 48);
    disc.lineTo(x - 12, y - 10);
    disc.lineTo(x - 32, y + 13);
    disc.lineTo(x - 72, y - 27);
    disc.closePath();
    disc.fillPath();
    this.addToStage(disc);
  }

  createCompletionDisc(x, y) {
    const disc = this.add.graphics();
    disc.fillStyle(0xb6c8d6, 1);
    disc.fillCircle(x, y, 53);
    disc.lineStyle(6, 0xc49cff, 0.35);
    disc.strokeCircle(x, y, 39);
    disc.fillStyle(0x0b1627, 1);
    disc.fillCircle(x, y, 13);
    disc.lineStyle(3, 0x8ef28b, 0.9);
    disc.strokeCircle(x, y, 53);
    disc.fillStyle(0x8ef28b, 1);
    disc.fillCircle(x, y, 5);
    this.addToStage(disc);
  }

  disableChallengeControls() {
    this.phase5ReadButton.background.disableInteractive();
    this.phase5DirtObjects.forEach(({ hitArea }) => hitArea.disableInteractive());
    this.phase5ScratchObjects.forEach(({ hitArea }) =>
      hitArea.disableInteractive(),
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
    this.phase5Stage.add(gameObjects);
  }

  clearStage() {
    this.tweens.killAll();

    if (this.phase5Stage) {
      this.phase5Stage.destroy(true);
      this.phase5Stage = null;
    }
  }
}
