const PHASE4_STARTING_SCORE = 100;
const PHASE4_DIRT_SPOTS = [
  { x: -72, y: -54, size: 17 },
  { x: 62, y: -68, size: 15 },
  { x: -82, y: 58, size: 16 },
  { x: 76, y: 48, size: 18 },
];
const PHASE4_SCRATCHES = [
  { x: -34, y: -82, length: 58, angle: 0.45 },
  { x: 62, y: 8, length: 72, angle: -0.7 },
  { x: -30, y: 70, length: 66, angle: 0.18 },
];

export default class Phase4Scene extends Phaser.Scene {
  constructor() {
    super("Phase4Scene");
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

    graphics.lineStyle(1, 0xc49cff, 0.04);
    for (let x = 0; x < 960; x += 24) {
      graphics.lineBetween(x, 0, x, 540);
    }
    for (let y = 0; y < 540; y += 24) {
      graphics.lineBetween(0, y, 960, y);
    }

    graphics.lineStyle(2, 0xc49cff, 0.1);
    graphics.strokeRoundedRect(18, 18, 924, 504, 20);

    const lights = [
      [55, 76, 0xc49cff],
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
    this.phase4Stage = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 48, "FASE 4: CD / DVD", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "20px",
          color: "#c49cff",
        })
        .setOrigin(0.5),
    );

    const panel = this.add
      .rectangle(480, 278, 780, 374, 20, 0x0d1930, 0.97)
      .setStrokeStyle(2, 0xc49cff, 0.46);
    this.addToStage(panel);

    this.createIntroDisc(480, 150);

    this.addToStage(
      this.add
        .text(
          480,
          295,
          "Com os CDs e DVDs, os dados passaram a ser armazenados em\ndiscos ópticos. Um laser lia pequenas marcas na superfície\ndo disco para acessar músicas, vídeos, jogos,\nprogramas e arquivos.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "19px",
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
          377,
          "O desafio era proteger o disco: arranhões e sujeira\npodiam atrapalhar a leitura dos dados.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "18px",
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
    this.phase4Score = PHASE4_STARTING_SCORE;
    this.phase4CleanedDirt = new Set();
    this.phase4DiscoveredScratches = new Set();
    this.phase4IsReading = false;
    this.phase4IsComplete = false;
    this.phase4DirtObjects = [];
    this.phase4ScratchObjects = [];

    this.clearStage();
    this.phase4Stage = this.add.container(0, 0);

    this.addToStage(
      this.add
        .text(480, 29, "LEITOR ÓPTICO", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "16px",
          color: "#c49cff",
        })
        .setOrigin(0.5),
    );

    this.phase4ScoreText = this.add
      .text(916, 29, "PONTOS: 100", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#8ef28b",
      })
      .setOrigin(1, 0.5);
    this.addToStage(this.phase4ScoreText);

    this.createMissionPanel();
    this.createDisc();
    this.createLaserReader();
    this.createDirtAndScratches();
    this.createEducationBox();
    this.createControls();
    this.createReadinessIndicator();

    this.phase4MessageText = this.add
      .text(480, 505, "Clique nas sujeiras para limpar os setores importantes.", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "15px",
        fontStyle: "700",
        color: "#8da2bd",
        align: "center",
        wordWrap: { width: 860 },
      })
      .setOrigin(0.5);
    this.addToStage(this.phase4MessageText);
    this.createBackLink();

    this.phase4Stage.setAlpha(0);
    this.tweens.add({
      targets: this.phase4Stage,
      alpha: 1,
      duration: 280,
      ease: "Sine.out",
    });
  }

  createMissionPanel() {
    const panel = this.add
      .rectangle(350, 73, 630, 56, 12, 0x101f35, 0.98)
      .setStrokeStyle(2, 0xffd166, 0.38);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(
          350,
          73,
          "MISSÃO: prepare o disco para o laser ler os dados importantes",
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

  createDisc() {
    this.phase4DiscContainer = this.add.container(342, 264);
    this.addToStage(this.phase4DiscContainer);

    const disc = this.add.graphics();
    disc.fillStyle(0x091522, 0.4);
    disc.fillCircle(7, 9, 142);
    disc.fillStyle(0xb6c8d6, 1);
    disc.fillCircle(0, 0, 138);

    const rings = [
      { radius: 128, color: 0x62e7f2, alpha: 0.32, width: 5 },
      { radius: 108, color: 0xc49cff, alpha: 0.32, width: 9 },
      { radius: 84, color: 0xffd166, alpha: 0.22, width: 7 },
      { radius: 62, color: 0x8ef28b, alpha: 0.2, width: 6 },
    ];
    rings.forEach(({ radius, color, alpha, width }) => {
      disc.lineStyle(width, color, alpha);
      disc.strokeCircle(0, 0, radius);
    });

    disc.lineStyle(3, 0xf1f7ff, 0.42);
    disc.strokeCircle(0, 0, 138);
    disc.fillStyle(0x0b1627, 1);
    disc.fillCircle(0, 0, 29);
    disc.lineStyle(6, 0x8799a8, 0.8);
    disc.strokeCircle(0, 0, 29);

    disc.fillStyle(0xffffff, 0.2);
    disc.beginPath();
    disc.moveTo(-102, -84);
    disc.lineTo(-20, -20);
    disc.lineTo(-52, 17);
    disc.lineTo(-123, -46);
    disc.closePath();
    disc.fillPath();

    disc.fillStyle(0x62e7f2, 0.11);
    disc.beginPath();
    disc.moveTo(90, -91);
    disc.lineTo(30, -26);
    disc.lineTo(62, 10);
    disc.lineTo(123, -48);
    disc.closePath();
    disc.fillPath();

    this.phase4DiscContainer.add(disc);

    this.phase4DiscGlow = this.add
      .circle(342, 264, 150, 0xc49cff, 0)
      .setStrokeStyle(4, 0xc49cff, 0);
    this.addToStage(this.phase4DiscGlow);

    this.tweens.add({
      targets: this.phase4DiscContainer,
      angle: 360,
      duration: 45000,
      repeat: -1,
      ease: "Linear",
    });
  }

  createLaserReader() {
    const reader = this.add.graphics();
    reader.fillStyle(0x15283b, 1);
    reader.fillRoundedRect(137, 398, 410, 42, 10);
    reader.lineStyle(2, 0x62e7f2, 0.5);
    reader.strokeRoundedRect(137, 398, 410, 42, 10);
    reader.fillStyle(0x60758a, 1);
    reader.fillRoundedRect(295, 390, 94, 22, 5);
    reader.fillStyle(0x0a111d, 1);
    reader.fillCircle(342, 401, 8);
    reader.fillStyle(0x62e7f2, 1);
    reader.fillCircle(342, 401, 3);
    this.addToStage(reader);

    this.phase4LaserBeam = this.add
      .rectangle(342, 392, 5, 250, 2, 0x62e7f2, 0)
      .setOrigin(0.5, 1)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.addToStage(this.phase4LaserBeam);

    this.phase4LaserGlow = this.add
      .rectangle(342, 392, 22, 250, 8, 0x62e7f2, 0)
      .setOrigin(0.5, 1)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.addToStage(this.phase4LaserGlow);

    this.addToStage(
      this.add
        .text(342, 426, "UNIDADE LASER", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: "#62e7f2",
        })
        .setOrigin(0.5),
    );
  }

  createDirtAndScratches() {
    PHASE4_DIRT_SPOTS.forEach((spot, index) => {
      const dirtContainer = this.add.container(spot.x, spot.y);
      const stain = this.add.circle(0, 0, spot.size, 0x765a30, 0.88);
      const stainEdge = this.add
        .circle(0, 0, spot.size + 4, 0x4a351d, 0.22)
        .setStrokeStyle(2, 0x382618, 0.65);
      const speckOne = this.add.circle(-7, -4, 4, 0x3b291a, 0.8);
      const speckTwo = this.add.circle(6, 5, 3, 0x4a321d, 0.8);
      const hitArea = this.add
        .circle(0, 0, spot.size + 18, 0xffffff, 0.001)
        .setInteractive({ useHandCursor: true });

      dirtContainer.add([stainEdge, stain, speckOne, speckTwo, hitArea]);
      this.phase4DiscContainer.add(dirtContainer);

      hitArea.on("pointerover", () => {
        if (!this.phase4IsComplete && !this.phase4IsReading) {
          this.tweens.add({
            targets: dirtContainer,
            scale: 1.14,
            duration: 100,
          });
        }
      });
      hitArea.on("pointerout", () => {
        this.tweens.add({
          targets: dirtContainer,
          scale: 1,
          duration: 100,
        });
      });
      hitArea.on("pointerdown", () => this.cleanDirt(index));

      this.phase4DirtObjects.push({ container: dirtContainer, hitArea });
    });

    PHASE4_SCRATCHES.forEach((scratch, index) => {
      const scratchContainer = this.add.container(scratch.x, scratch.y);
      const scratchLine = this.add
        .rectangle(0, 0, scratch.length, 3, 2, 0x34414d, 0.95)
        .setRotation(scratch.angle);
      const highlight = this.add
        .rectangle(0, -2, scratch.length * 0.76, 1, 1, 0xf1f7ff, 0.5)
        .setRotation(scratch.angle);
      const hitArea = this.add
        .rectangle(0, 0, scratch.length + 36, 34, 6, 0xffffff, 0.001)
        .setRotation(scratch.angle)
        .setInteractive({ useHandCursor: true });

      scratchContainer.add([scratchLine, highlight, hitArea]);
      this.phase4DiscContainer.add(scratchContainer);
      hitArea.on("pointerdown", () => this.handleScratchClick(index));

      this.phase4ScratchObjects.push({
        container: scratchContainer,
        scratchLine,
        hitArea,
      });
    });

    this.phase4DirtObjects.forEach(({ container }) => {
      this.phase4DiscContainer.bringToTop(container);
    });
  }

  createEducationBox() {
    const panel = this.add
      .rectangle(792, 245, 250, 282, 16, 0x101f35, 0.98)
      .setStrokeStyle(2, 0x62e7f2, 0.34);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(792, 124, "MÍDIA ÓPTICA", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "9px",
          color: "#62e7f2",
        })
        .setOrigin(0.5),
    );

    this.addToStage(
      this.add
        .text(
          792,
          250,
          "CDs e DVDs armazenam dados\nem pequenas marcas na\nsuperfície, lidas por laser.\n\nTinham mais capacidade que\ndisquetes e eram usados para\nmúsicas, vídeos, jogos e\nprogramas.\n\nArranhões, poeira e sujeira\npodiam impedir a leitura.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "14px",
            fontStyle: "600",
            color: "#c7d7e8",
            align: "center",
            lineSpacing: 4,
          },
        )
        .setOrigin(0.5),
    );
  }

  createControls() {
    this.phase4ReadButton = this.createButton(
      672,
      421,
      250,
      "LER DISCO",
      () => this.readDisc(),
      { border: 0x8ef28b, hover: 0x246a69, fontSize: "10px" },
    );

    this.addToStage(
      this.add
        .text(672, 459, "Clique diretamente nas manchas para limpá-las.", {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "12px",
          fontStyle: "700",
          color: "#6f849d",
          align: "center",
        })
        .setOrigin(0.5),
    );
  }

  createReadinessIndicator() {
    const panel = this.add
      .rectangle(572, 160, 178, 64, 12, 0x101f35, 0.98)
      .setStrokeStyle(2, 0xffd166, 0.36);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(572, 146, "SETORES IMPORTANTES", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#ffd166",
        })
        .setOrigin(0.5),
    );

    this.phase4ReadinessText = this.add
      .text(572, 170, "LIMPOS: 0 / 4", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#ff9b78",
      })
      .setOrigin(0.5);
    this.addToStage(this.phase4ReadinessText);
  }

  cleanDirt(index) {
    if (
      this.phase4IsReading ||
      this.phase4IsComplete ||
      this.phase4CleanedDirt.has(index)
    ) {
      return;
    }

    this.phase4CleanedDirt.add(index);
    const dirt = this.phase4DirtObjects[index];
    dirt.hitArea.disableInteractive();

    this.tweens.add({
      targets: dirt.container,
      scale: 1.7,
      alpha: 0,
      angle: 40,
      duration: 280,
      ease: "Sine.out",
      onComplete: () => dirt.container.setVisible(false),
    });

    this.phase4ReadinessText
      .setText(`LIMPOS: ${this.phase4CleanedDirt.size} / 4`)
      .setColor(
        this.phase4CleanedDirt.size === PHASE4_DIRT_SPOTS.length
          ? "#8ef28b"
          : "#ffd166",
      );

    this.showMessage(
      "Sujeira removida! O laser consegue ler melhor essa área.",
      "#8ef28b",
    );

    this.createCleaningSparkles(
      342 + PHASE4_DIRT_SPOTS[index].x,
      264 + PHASE4_DIRT_SPOTS[index].y,
    );
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
    if (this.phase4IsReading || this.phase4IsComplete) {
      return;
    }

    if (!this.phase4DiscoveredScratches.has(index)) {
      this.phase4DiscoveredScratches.add(index);
      this.updateScore(-5);
    }

    const scratch = this.phase4ScratchObjects[index];
    scratch.scratchLine.setFillStyle(0xff7b68, 1);
    this.tweens.add({
      targets: scratch.container,
      scale: 1.18,
      duration: 90,
      yoyo: true,
      repeat: 2,
      onComplete: () => scratch.scratchLine.setFillStyle(0x34414d, 0.95),
    });

    this.showMessage(
      "Arranhões podem danificar o disco e dificultar a leitura.",
      "#ff9b78",
    );
  }

  readDisc() {
    if (this.phase4IsReading || this.phase4IsComplete) {
      return;
    }

    this.phase4IsReading = true;
    const hasRemainingDirt =
      this.phase4CleanedDirt.size < PHASE4_DIRT_SPOTS.length;

    this.animateLaserScan(!hasRemainingDirt, () => {
      this.phase4IsReading = false;
      if (hasRemainingDirt) {
        this.showFailure();
      } else {
        this.showSuccess();
      }
    });
  }

  animateLaserScan(isSuccessful, onComplete) {
    const color = isSuccessful ? 0x8ef28b : 0xff7b68;
    this.phase4LaserBeam
      .setFillStyle(color, 0.95)
      .setAlpha(0.95)
      .setX(210);
    this.phase4LaserGlow
      .setFillStyle(color, 0.2)
      .setAlpha(0.65)
      .setX(210);

    this.tweens.add({
      targets: [this.phase4LaserBeam, this.phase4LaserGlow],
      x: 474,
      duration: 850,
      yoyo: true,
      ease: "Sine.inOut",
      onComplete: () => {
        this.phase4LaserBeam.setAlpha(0);
        this.phase4LaserGlow.setAlpha(0);
        onComplete();
      },
    });
  }

  updateScore(change) {
    this.phase4Score = Phaser.Math.Clamp(
      this.phase4Score + change,
      0,
      PHASE4_STARTING_SCORE,
    );
    this.phase4ScoreText.setText(`PONTOS: ${this.phase4Score}`);

    this.tweens.add({
      targets: this.phase4ScoreText,
      scale: 1.12,
      duration: 100,
      yoyo: true,
    });
  }

  showMessage(message, color = "#8da2bd") {
    this.phase4MessageText.setText(message).setColor(color);
  }

  showFailure() {
    this.updateScore(-10);
    this.showMessage(
      "O laser encontrou obstáculos. Limpe o disco antes de tentar novamente.",
      "#ff9b78",
    );

    this.phase4DirtObjects.forEach((dirt, index) => {
      if (!this.phase4CleanedDirt.has(index)) {
        dirt.container.setAlpha(1);
        this.tweens.add({
          targets: dirt.container,
          scale: 1.2,
          duration: 90,
          yoyo: true,
          repeat: 2,
        });
      }
    });
    this.cameras.main.shake(130, 0.002);
  }

  showSuccess() {
    this.phase4IsComplete = true;
    this.disableChallengeControls();
    this.showMessage(
      "Leitura concluída! O laser conseguiu acessar os dados do disco.",
      "#8ef28b",
    );

    this.phase4DiscGlow
      .setFillStyle(0x8ef28b, 0.08)
      .setStrokeStyle(4, 0x8ef28b, 0.85)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: [this.phase4DiscGlow, this.phase4DiscContainer],
      scale: 1.1,
      alpha: { from: 1, to: 0.35 },
      duration: 350,
      yoyo: true,
      repeat: 2,
      ease: "Sine.inOut",
    });

    this.createSuccessSparkles();
    this.time.delayedCall(1500, () => this.showConclusion());
  }

  createSuccessSparkles() {
    const positions = [
      [220, 165],
      [292, 115],
      [402, 125],
      [472, 184],
      [450, 337],
      [250, 350],
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
    const finalScore = this.phase4Score;
    this.clearStage();
    this.phase4Stage = this.add.container(0, 0);

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

    const panel = this.add
      .rectangle(480, 301, 770, 220, 18, 0x0d1930, 0.97)
      .setStrokeStyle(2, 0xc49cff, 0.42);
    this.addToStage(panel);

    this.addToStage(
      this.add
        .text(
          480,
          278,
          "Você aprendeu que CDs e DVDs armazenavam dados de forma\nóptica, usando um laser para leitura. Eles trouxeram mais\ncapacidade para músicas, vídeos, jogos e programas, mas eram\nsensíveis a arranhões e sujeira.",
          {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "19px",
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

    this.phase4Stage.setAlpha(0).setScale(0.97);
    this.tweens.add({
      targets: this.phase4Stage,
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
    this.phase4ReadButton.background.disableInteractive();
    this.phase4DirtObjects.forEach(({ hitArea }) => hitArea.disableInteractive());
    this.phase4ScratchObjects.forEach(({ hitArea }) =>
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
    const buttonContainer = this.add.container(x, y);
    const background = this.add
      .rectangle(0, 0, width, 56, 11, 0x15344b, 1)
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
    this.phase4Stage.add(gameObjects);
  }

  clearStage() {
    if (this.phase4Stage) {
      this.phase4Stage.destroy(true);
      this.phase4Stage = null;
    }
  }
}
