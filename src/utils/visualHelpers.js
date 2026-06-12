export const GAME_SIZE = {
  width: 960,
  height: 540,
};

export function configureSceneViewport(scene) {
  const camera = scene.cameras?.main;

  if (!camera) {
    return;
  }

  const viewWidth = scene.scale?.width || GAME_SIZE.width;
  const viewHeight = scene.scale?.height || GAME_SIZE.height;
  const zoom = Math.min(viewWidth / GAME_SIZE.width, viewHeight / GAME_SIZE.height);

  camera.setZoom(zoom);
  camera.centerOn(GAME_SIZE.width / 2, GAME_SIZE.height / 2);
  camera.setBackgroundColor("#07101f");
}

export const COLORS = {
  background: 0x07101f,
  backgroundDeep: 0x030713,
  panel: 0x0d1930,
  panelSoft: 0x101f35,
  cyan: 0x62e7f2,
  green: 0x8ef28b,
  yellow: 0xffd166,
  text: "#f1f7ff",
  muted: "#8da2bd",
};

export function drawRetroBackground(scene, options = {}) {
  configureSceneViewport(scene);

  const {
    accent = COLORS.cyan,
    bottomLeft = 0x10223b,
    bottomRight = COLORS.background,
    gridStep = 24,
    gridAlpha = 0.045,
    frameAlpha = 0.14,
  } = options;

  const graphics = scene.add.graphics();
  graphics.fillGradientStyle(
    COLORS.background,
    COLORS.background,
    bottomLeft,
    bottomRight,
    1,
  );
  graphics.fillRect(0, 0, GAME_SIZE.width, GAME_SIZE.height);

  graphics.fillStyle(accent, 0.035);
  graphics.fillCircle(126, 92, 152);
  graphics.fillCircle(846, 446, 184);
  graphics.fillStyle(COLORS.yellow, 0.025);
  graphics.fillCircle(782, 94, 118);

  graphics.lineStyle(1, accent, gridAlpha);
  for (let x = 0; x <= GAME_SIZE.width; x += gridStep) {
    graphics.lineBetween(x, 0, x, GAME_SIZE.height);
  }
  for (let y = 0; y <= GAME_SIZE.height; y += gridStep) {
    graphics.lineBetween(0, y, GAME_SIZE.width, y);
  }

  graphics.lineStyle(3, accent, 0.08);
  graphics.lineBetween(44, 72, 124, 72);
  graphics.lineBetween(124, 72, 152, 100);
  graphics.lineBetween(152, 100, 252, 100);
  graphics.lineBetween(916, 462, 836, 462);
  graphics.lineBetween(836, 462, 808, 434);
  graphics.lineBetween(808, 434, 708, 434);

  graphics.lineStyle(2, accent, frameAlpha);
  graphics.strokeRoundedRect(18, 18, 924, 504, 22);
  graphics.lineStyle(1, 0xffffff, 0.045);
  graphics.strokeRoundedRect(25, 25, 910, 490, 18);

  const pixels = [
    [55, 75, accent],
    [86, 462, COLORS.yellow],
    [884, 78, COLORS.green],
    [906, 448, accent],
  ];
  pixels.forEach(([x, y, color]) => {
    graphics.fillStyle(color, 0.52);
    graphics.fillRect(x, y, 7, 7);
    graphics.fillStyle(color, 0.13);
    graphics.fillRect(x - 4, y - 4, 15, 15);
  });

  return graphics;
}

export function createRoundedPanel(scene, x, y, width, height, options = {}) {
  const {
    fill = COLORS.panel,
    fillAlpha = 0.97,
    stroke = COLORS.cyan,
    strokeAlpha = 0.42,
    strokeWidth = 2,
    radius = 18,
    shadow = true,
    highlight = true,
  } = options;

  const container = scene.add.container(x, y);
  const graphics = scene.add.graphics();
  const left = -width / 2;
  const top = -height / 2;

  if (shadow) {
    graphics.fillStyle(0x000000, 0.25);
    graphics.fillRoundedRect(left + 7, top + 9, width, height, radius);
  }

  graphics.fillStyle(fill, fillAlpha);
  graphics.fillRoundedRect(left, top, width, height, radius);
  graphics.lineStyle(strokeWidth, stroke, strokeAlpha);
  graphics.strokeRoundedRect(left, top, width, height, radius);

  if (highlight && width > 40 && height > 40) {
    graphics.lineStyle(1, 0xffffff, 0.055);
    graphics.strokeRoundedRect(
      left + 7,
      top + 7,
      width - 14,
      height - 14,
      Math.max(6, radius - 7),
    );
  }

  container.add(graphics);
  return container;
}

export function createStandardButton(scene, x, y, width, label, callback, options = {}) {
  const {
    height = 56,
    fill = 0x15344b,
    hover = 0x1c5264,
    border = COLORS.cyan,
    fontSize = "10px",
    textColor = COLORS.text,
    hoverTextColor = "#ffd166",
    radius = 12,
    addToStage = null,
  } = options;

  const buttonContainer = scene.add.container(x, y);
  const shadow = scene.add.graphics();
  const background = scene.add.graphics();
  const hitArea = scene.add
    .rectangle(0, 0, width, height, 0xffffff, 0.001)
    .setInteractive({ useHandCursor: true });
  const text = scene.add
    .text(0, 0, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize,
      color: textColor,
      align: "center",
      wordWrap: { width: width - 24 },
    })
    .setOrigin(0.5);

  const draw = (fillColor = fill, borderAlpha = 0.9) => {
    shadow.clear();
    shadow.fillStyle(0x000000, 0.32);
    shadow.fillRoundedRect(
      -width / 2 + 4,
      -height / 2 + 6,
      width,
      height,
      radius,
    );

    background.clear();
    background.fillStyle(fillColor, 1);
    background.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
    background.lineStyle(2, border, borderAlpha);
    background.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
    background.fillStyle(0xffffff, 0.055);
    background.fillRoundedRect(
      -width / 2 + 7,
      -height / 2 + 7,
      width - 14,
      Math.max(7, height * 0.28),
      Math.max(4, radius - 5),
    );
  };

  draw();
  buttonContainer.add([shadow, background, text, hitArea]);
  buttonContainer.background = hitArea;
  buttonContainer.label = text;
  buttonContainer.buttonGraphic = background;
  buttonContainer.redrawButton = draw;

  hitArea.on("pointerover", () => {
    draw(hover, 1);
    text.setColor(hoverTextColor);
    scene.tweens.add({
      targets: buttonContainer,
      scale: 1.035,
      duration: 110,
      ease: "Sine.out",
    });
  });

  hitArea.on("pointerout", () => {
    draw(fill, 0.9);
    text.setColor(textColor);
    scene.tweens.add({
      targets: buttonContainer,
      scale: 1,
      duration: 110,
      ease: "Sine.out",
    });
  });

  hitArea.on("pointerdown", () => {
    scene.tweens.add({
      targets: buttonContainer,
      scale: 0.985,
      duration: 65,
      yoyo: true,
      ease: "Sine.inOut",
    });
    callback();
  });

  if (addToStage) {
    addToStage(buttonContainer);
  }

  return buttonContainer;
}
