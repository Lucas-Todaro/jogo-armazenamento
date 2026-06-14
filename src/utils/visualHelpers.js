export const GAME_SIZE = {
  // Logical 16:9 coordinate system used by the current scenes.
  // Phaser renders at 1920x1080 in main.js and this viewport scales to 2x.
  width: 960,
  height: 540,
};

export const UX_LAYOUT = {
  centerX: GAME_SIZE.width / 2,
  centerY: GAME_SIZE.height / 2,
  safeMargin: 32,
  topBarY: 31,
  titleY: 52,
  introPanel: { x: 480, y: 278, width: 780, height: 374 },
  objective: { x: 350, y: 76, width: 640, height: 56 },
  mainArea: { x: 350, y: 262, width: 640, height: 300 },
  score: { x: 858, y: 31, width: 154, height: 34 },
  feedback: { x: 480, y: 505, width: 840, height: 42 },
  tip: { x: 800, y: 260, width: 260, height: 118 },
  conclusionPanel: { x: 480, y: 301, width: 770, height: 220 },
  conclusionButtonsY: 462,
};

export const UX_SPACING = {
  panelPadding: 24,
  compactPanelPadding: 16,
  titleToBody: 24,
  bodyToButton: 34,
  buttonGap: 40,
  buttonMinHeight: 44,
  textMaxWidth: 760,
  compactTextMaxWidth: 230,
};

export const FONT_FAMILY = {
  display: '"Press Start 2P", monospace',
  body: '"Nunito", sans-serif',
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
  blue: 0x70b7ff,
  purple: 0xc49cff,
  orange: 0xff8f70,
  danger: 0xff7b68,
  text: "#f1f7ff",
  muted: "#8da2bd",
  bodyText: "#dce8f5",
  dangerText: "#ff9b78",
};

export const FEEDBACK_STYLE = {
  success: {
    color: "#8ef28b",
    accent: COLORS.green,
  },
  error: {
    color: COLORS.dangerText,
    accent: COLORS.danger,
  },
  warning: {
    color: "#ffd166",
    accent: COLORS.yellow,
  },
  neutral: {
    color: COLORS.muted,
    accent: COLORS.cyan,
  },
};

function addMaybeToStage(gameObject, addToStage) {
  if (addToStage) {
    addToStage(gameObject);
  }

  return gameObject;
}

function toCssColor(color) {
  if (typeof color === "number") {
    return `#${color.toString(16).padStart(6, "0")}`;
  }

  return color;
}

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
    addToStage = null,
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
  container.panelGraphic = graphics;
  container.panelSize = { width, height };
  return addMaybeToStage(container, addToStage);
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
  buttonContainer.setEnabled = (enabled) => {
    if (enabled) {
      hitArea.setInteractive({ useHandCursor: true });
      text.setColor(textColor);
      buttonContainer.setAlpha(1);
      draw(fill, 0.9);
      return buttonContainer;
    }

    hitArea.disableInteractive();
    text.setColor("#53657c");
    buttonContainer.setAlpha(0.68);
    draw(0x111a2d, 0.35);
    return buttonContainer;
  };

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

  return addMaybeToStage(buttonContainer, addToStage);
}

// Use the helpers below during the next phase-by-phase reforms.
// They keep each phase in the same flow: intro, challenge HUD, short tip,
// fixed feedback, and conclusion, without changing score/progress mechanics.
export function createTitle(scene, text, options = {}) {
  const {
    x = UX_LAYOUT.centerX,
    y = UX_LAYOUT.titleY,
    color = COLORS.text,
    fontSize = "20px",
    maxWidth = 820,
    addToStage = null,
  } = options;

  const title = scene.add
    .text(x, y, text, {
      fontFamily: FONT_FAMILY.display,
      fontSize,
      color: toCssColor(color),
      align: "center",
      lineSpacing: 8,
      wordWrap: { width: maxWidth },
    })
    .setOrigin(0.5);

  return addMaybeToStage(title, addToStage);
}

export function createPanel(scene, x, y, width, height, options = {}) {
  return createRoundedPanel(scene, x, y, width, height, {
    radius: 16,
    ...options,
  });
}

export function createButton(scene, x, y, width, label, callback, options = {}) {
  return createStandardButton(scene, x, y, width, label, callback, {
    ...options,
    height: Math.max(options.height ?? 54, UX_SPACING.buttonMinHeight),
  });
}

export function createPhaseIntroPanel(scene, options = {}) {
  const {
    title = "",
    description = "",
    challenge = "",
    accent = COLORS.cyan,
    onStart,
    startLabel = "COMEÇAR DESAFIO",
    addToStage = null,
  } = options;

  const container = scene.add.container(0, 0);
  container.add(
    createTitle(scene, title, {
      y: UX_LAYOUT.titleY,
      color: accent,
      fontSize: "18px",
    }),
  );
  container.add(
    createRoundedPanel(
      scene,
      UX_LAYOUT.introPanel.x,
      UX_LAYOUT.introPanel.y,
      UX_LAYOUT.introPanel.width,
      UX_LAYOUT.introPanel.height,
      {
        stroke: accent,
        strokeAlpha: 0.46,
        radius: 20,
      },
    ),
  );
  container.add(
    scene.add
      .text(UX_LAYOUT.centerX, 292, description, {
        fontFamily: FONT_FAMILY.body,
        fontSize: "19px",
        fontStyle: "600",
        color: COLORS.bodyText,
        align: "center",
        lineSpacing: 7,
        wordWrap: { width: UX_SPACING.textMaxWidth },
      })
      .setOrigin(0.5),
  );
  container.add(
    scene.add
      .text(UX_LAYOUT.centerX, 374, challenge, {
        fontFamily: FONT_FAMILY.body,
        fontSize: "17px",
        fontStyle: "800",
        color: toCssColor(COLORS.yellow),
        align: "center",
        lineSpacing: 5,
        wordWrap: { width: UX_SPACING.textMaxWidth },
      })
      .setOrigin(0.5),
  );

  if (onStart) {
    createStandardButton(scene, UX_LAYOUT.centerX, 454, 290, startLabel, onStart, {
      border: COLORS.green,
      hover: 0x246a69,
      addToStage: (button) => container.add(button),
    });
  }

  return addMaybeToStage(container, addToStage);
}

export function createObjectiveText(scene, text, options = {}) {
  const {
    x = UX_LAYOUT.objective.x,
    y = UX_LAYOUT.objective.y,
    width = UX_LAYOUT.objective.width,
    height = UX_LAYOUT.objective.height,
    accent = COLORS.yellow,
    label = "OBJETIVO",
    addToStage = null,
  } = options;

  const container = scene.add.container(x, y);
  const panel = createRoundedPanel(scene, 0, 0, width, height, {
    fill: COLORS.panelSoft,
    stroke: accent,
    strokeAlpha: 0.38,
    radius: 12,
    shadow: false,
  });
  const labelText = scene.add
    .text(0, -height / 2 + 14, label, {
      fontFamily: FONT_FAMILY.display,
      fontSize: "7px",
      color: toCssColor(accent),
      align: "center",
    })
    .setOrigin(0.5);
  const body = scene.add
    .text(0, 8, text, {
      fontFamily: FONT_FAMILY.body,
      fontSize: "16px",
      fontStyle: "800",
      color: COLORS.text,
      align: "center",
      wordWrap: { width: width - UX_SPACING.compactPanelPadding * 2 },
    })
    .setOrigin(0.5);

  container.add([panel, labelText, body]);
  container.objectiveText = body;

  return addMaybeToStage(container, addToStage);
}

export function createScoreBox(scene, score = 100, options = {}) {
  const {
    x = UX_LAYOUT.score.x,
    y = UX_LAYOUT.score.y,
    width = UX_LAYOUT.score.width,
    height = UX_LAYOUT.score.height,
    accent = COLORS.green,
    prefix = "PONTOS",
    addToStage = null,
  } = options;

  const container = scene.add.container(x, y);
  const panel = createRoundedPanel(scene, 0, 0, width, height, {
    fill: 0x091424,
    stroke: accent,
    strokeAlpha: 0.34,
    radius: 10,
    shadow: false,
    highlight: false,
  });
  const text = scene.add
    .text(0, 0, `${prefix}: ${score}`, {
      fontFamily: FONT_FAMILY.display,
      fontSize: "8px",
      color: toCssColor(accent),
      align: "center",
    })
    .setOrigin(0.5);

  container.add([panel, text]);
  container.scoreText = text;
  container.setScore = (value) => {
    text.setText(`${prefix}: ${value}`);
    scene.tweens.add({
      targets: text,
      scale: 1.12,
      duration: 100,
      yoyo: true,
      ease: "Sine.inOut",
    });
    return container;
  };

  return addMaybeToStage(container, addToStage);
}

export function createFeedbackBox(scene, initialMessage = "", options = {}) {
  const {
    x = UX_LAYOUT.feedback.x,
    y = UX_LAYOUT.feedback.y,
    width = UX_LAYOUT.feedback.width,
    height = UX_LAYOUT.feedback.height,
    type = "neutral",
    addToStage = null,
  } = options;

  const container = scene.add.container(x, y);
  const state = FEEDBACK_STYLE[type] ?? FEEDBACK_STYLE.neutral;
  const panel = createRoundedPanel(scene, 0, 0, width, height, {
    fill: 0x091424,
    stroke: state.accent,
    strokeAlpha: 0.26,
    radius: 12,
    shadow: false,
    highlight: false,
  });
  const indicator = scene.add.circle(-width / 2 + 21, 0, 5, state.accent, 0.95);
  const text = scene.add
    .text(0, 0, initialMessage, {
      fontFamily: FONT_FAMILY.body,
      fontSize: "15px",
      fontStyle: "800",
      color: state.color,
      align: "center",
      wordWrap: { width: width - 72 },
    })
    .setOrigin(0.5);

  container.add([panel, indicator, text]);
  container.feedbackText = text;
  container.setMessage = (message, nextType = "neutral") => {
    const nextState = FEEDBACK_STYLE[nextType] ?? FEEDBACK_STYLE.neutral;
    indicator.setFillStyle(nextState.accent, 0.95);
    text.setText(message).setColor(nextState.color);

    scene.tweens.killTweensOf([container, text, indicator]);

    if (nextType === "error") {
      scene.tweens.add({
        targets: container,
        x: x + 5,
        duration: 55,
        yoyo: true,
        repeat: 2,
        ease: "Sine.inOut",
        onComplete: () => container.setX(x),
      });
    } else if (nextType === "success") {
      scene.tweens.add({
        targets: [text, indicator],
        scale: 1.08,
        duration: 120,
        yoyo: true,
        ease: "Sine.inOut",
      });
    } else {
      scene.tweens.add({
        targets: indicator,
        scale: 1.28,
        duration: 120,
        yoyo: true,
        ease: "Sine.inOut",
      });
    }

    return container;
  };

  return addMaybeToStage(container, addToStage);
}

export function createEducationalTip(scene, text, options = {}) {
  const {
    x = UX_LAYOUT.tip.x,
    y = UX_LAYOUT.tip.y,
    width = UX_LAYOUT.tip.width,
    height = UX_LAYOUT.tip.height,
    title = "DICA",
    accent = COLORS.cyan,
    addToStage = null,
  } = options;

  const container = scene.add.container(x, y);
  const panel = createRoundedPanel(scene, 0, 0, width, height, {
    fill: COLORS.panelSoft,
    stroke: accent,
    strokeAlpha: 0.32,
    radius: 14,
    shadow: false,
  });
  const titleText = scene.add
    .text(0, -height / 2 + 20, title, {
      fontFamily: FONT_FAMILY.display,
      fontSize: "8px",
      color: toCssColor(accent),
      align: "center",
    })
    .setOrigin(0.5);
  const body = scene.add
    .text(0, 14, text, {
      fontFamily: FONT_FAMILY.body,
      fontSize: "13px",
      fontStyle: "700",
      color: "#c7d7e8",
      align: "center",
      lineSpacing: 3,
      wordWrap: { width: width - UX_SPACING.compactPanelPadding * 2 },
    })
    .setOrigin(0.5);

  container.add([panel, titleText, body]);
  container.tipText = body;

  return addMaybeToStage(container, addToStage);
}

export function createChallengeHud(scene, options = {}) {
  const {
    title = "",
    objective = "",
    score = 100,
    accent = COLORS.cyan,
    feedback = "",
    addToStage = null,
  } = options;

  const container = scene.add.container(0, 0);
  const titleText = createTitle(scene, title, {
    y: UX_LAYOUT.topBarY,
    color: accent,
    fontSize: "15px",
    maxWidth: 580,
  });
  const objectiveBox = createObjectiveText(scene, objective, { accent });
  const scoreBox = createScoreBox(scene, score);
  const feedbackBox = createFeedbackBox(scene, feedback);

  container.add([titleText, objectiveBox, scoreBox, feedbackBox]);
  container.titleText = titleText;
  container.objectiveBox = objectiveBox;
  container.scoreBox = scoreBox;
  container.feedbackBox = feedbackBox;

  return addMaybeToStage(container, addToStage);
}

export function createBackLink(scene, callback, options = {}) {
  const {
    x = 38,
    y = UX_LAYOUT.topBarY,
    label = "< LINHA DO TEMPO",
    addToStage = null,
  } = options;

  const text = scene.add
    .text(x, y, label, {
      fontFamily: FONT_FAMILY.body,
      fontSize: "14px",
      fontStyle: "800",
      color: COLORS.muted,
    })
    .setOrigin(0, 0.5)
    .setInteractive({ useHandCursor: true });

  text.on("pointerover", () => text.setColor(toCssColor(COLORS.cyan)));
  text.on("pointerout", () => text.setColor(COLORS.muted));
  text.on("pointerdown", callback);

  return addMaybeToStage(text, addToStage);
}

export function createConclusionPanel(scene, options = {}) {
  const {
    learnedText = "",
    score = 0,
    accent = COLORS.green,
    onTimeline,
    onReplay,
    addToStage = null,
  } = options;

  const container = scene.add.container(0, 0);
  const title = createTitle(scene, "FASE CONCLUÍDA!", {
    y: 54,
    color: COLORS.green,
    fontSize: "20px",
  });
  const panel = createRoundedPanel(
    scene,
    UX_LAYOUT.conclusionPanel.x,
    UX_LAYOUT.conclusionPanel.y,
    UX_LAYOUT.conclusionPanel.width,
    UX_LAYOUT.conclusionPanel.height,
    {
      stroke: accent,
      strokeAlpha: 0.42,
      radius: 18,
    },
  );
  const body = scene.add
    .text(UX_LAYOUT.centerX, 278, learnedText, {
      fontFamily: FONT_FAMILY.body,
      fontSize: "18px",
      fontStyle: "600",
      color: COLORS.bodyText,
      align: "center",
      lineSpacing: 7,
      wordWrap: { width: UX_LAYOUT.conclusionPanel.width - 70 },
    })
    .setOrigin(0.5);
  const scoreText = scene.add
    .text(UX_LAYOUT.centerX, 370, `PONTUAÇÃO FINAL: ${score}`, {
      fontFamily: FONT_FAMILY.display,
      fontSize: "12px",
      color: toCssColor(COLORS.yellow),
    })
    .setOrigin(0.5);

  container.add([title, panel, body, scoreText]);

  if (onTimeline) {
    createStandardButton(
      scene,
      304,
      UX_LAYOUT.conclusionButtonsY,
      310,
      "VOLTAR À LINHA DO TEMPO",
      onTimeline,
      {
        border: COLORS.cyan,
        hover: 0x1c5264,
        fontSize: "8px",
        addToStage: (button) => container.add(button),
      },
    );
  }

  if (onReplay) {
    createStandardButton(
      scene,
      656,
      UX_LAYOUT.conclusionButtonsY,
      270,
      "JOGAR NOVAMENTE",
      onReplay,
      {
        border: COLORS.green,
        hover: 0x246a69,
        fontSize: "10px",
        addToStage: (button) => container.add(button),
      },
    );
  }

  container.setAlpha(0).setScale(0.97);
  scene.tweens.add({
    targets: container,
    alpha: 1,
    scale: 1,
    duration: 350,
    ease: "Back.out",
  });

  return addMaybeToStage(container, addToStage);
}
