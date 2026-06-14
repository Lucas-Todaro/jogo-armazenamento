const JORNADA_DO_BIT_STORAGE_KEY = "jornadaDoBitProgress";
const JORNADA_DO_BIT_TOTAL_PHASES = 7;

function createDefaultProgress() {
  return {
    completedPhases: [],
    unlockedPhase: 1,
    phaseScores: {},
  };
}

function normalizeProgress(progress) {
  const defaultProgress = createDefaultProgress();

  if (!progress || typeof progress !== "object") {
    return defaultProgress;
  }

  const completedPhases = Array.isArray(progress.completedPhases)
    ? progress.completedPhases
        .map((phase) => Number(phase))
        .filter(
          (phase) =>
            Number.isInteger(phase) &&
            phase >= 1 &&
            phase <= JORNADA_DO_BIT_TOTAL_PHASES,
        )
    : [];

  const uniqueCompletedPhases = [...new Set(completedPhases)].sort((a, b) => a - b);
  const sequentialCompletedPhases = [];
  let nextSequentialPhase = 1;

  uniqueCompletedPhases.forEach((phase) => {
    if (phase === nextSequentialPhase) {
      sequentialCompletedPhases.push(phase);
      nextSequentialPhase += 1;
    }
  });

  const savedUnlockedPhase = Math.min(
    Math.max(Number(progress.unlockedPhase) || 1, 1),
    JORNADA_DO_BIT_TOTAL_PHASES,
  );
  const unlockedPhase = Math.min(
    Math.max(savedUnlockedPhase, nextSequentialPhase),
    JORNADA_DO_BIT_TOTAL_PHASES,
  );
  const phaseScores = {};
  const savedPhaseScores =
    progress.phaseScores && typeof progress.phaseScores === "object"
      ? progress.phaseScores
      : {};

  for (let phase = 1; phase <= JORNADA_DO_BIT_TOTAL_PHASES; phase += 1) {
    const score = Number(savedPhaseScores[phase]);

    if (Number.isFinite(score)) {
      phaseScores[phase] = Math.round(Math.min(Math.max(score, 0), 100));
    }
  }

  return {
    completedPhases: sequentialCompletedPhases,
    unlockedPhase,
    phaseScores,
  };
}

export function getProgress() {
  if (typeof localStorage === "undefined") {
    return createDefaultProgress();
  }

  let savedProgress = null;

  try {
    savedProgress = localStorage.getItem(JORNADA_DO_BIT_STORAGE_KEY);
  } catch (error) {
    return createDefaultProgress();
  }

  if (!savedProgress) {
    return createDefaultProgress();
  }

  try {
    return normalizeProgress(JSON.parse(savedProgress));
  } catch (error) {
    return createDefaultProgress();
  }
}

export function saveProgress(progress) {
  if (typeof localStorage === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      JORNADA_DO_BIT_STORAGE_KEY,
      JSON.stringify(normalizeProgress(progress)),
    );
  } catch (error) {
    // If storage is blocked, the game still runs; progress just won't persist.
  }
}

export function completePhase(phaseNumber) {
  const normalizedPhase = Number(phaseNumber);

  if (
    !Number.isInteger(normalizedPhase) ||
    normalizedPhase < 1 ||
    normalizedPhase > JORNADA_DO_BIT_TOTAL_PHASES
  ) {
    return;
  }

  const progress = getProgress();

  if (normalizedPhase > progress.unlockedPhase) {
    return;
  }

  if (!progress.completedPhases.includes(normalizedPhase)) {
    progress.completedPhases.push(normalizedPhase);
  }

  const nextPhase = normalizedPhase + 1;

  if (
    nextPhase <= JORNADA_DO_BIT_TOTAL_PHASES &&
    progress.unlockedPhase < nextPhase
  ) {
    progress.unlockedPhase = nextPhase;
  }

  saveProgress(progress);
}

export function savePhaseScore(phaseNumber, score) {
  const normalizedPhase = Number(phaseNumber);
  const normalizedScore = Number(score);

  if (
    !Number.isInteger(normalizedPhase) ||
    normalizedPhase < 1 ||
    normalizedPhase > JORNADA_DO_BIT_TOTAL_PHASES ||
    !Number.isFinite(normalizedScore)
  ) {
    return;
  }

  const progress = getProgress();

  if (!progress.completedPhases.includes(normalizedPhase)) {
    return;
  }

  const safeScore = Math.round(Math.min(Math.max(normalizedScore, 0), 100));
  const previousScore = Number(progress.phaseScores[normalizedPhase]) || 0;
  progress.phaseScores[normalizedPhase] = Math.max(previousScore, safeScore);
  saveProgress(progress);
}

export function getPhaseScore(phaseNumber) {
  const normalizedPhase = Number(phaseNumber);

  if (
    !Number.isInteger(normalizedPhase) ||
    normalizedPhase < 1 ||
    normalizedPhase > JORNADA_DO_BIT_TOTAL_PHASES
  ) {
    return 0;
  }

  return getProgress().phaseScores[normalizedPhase] || 0;
}

export function getTotalScore() {
  const progress = getProgress();

  return Object.values(progress.phaseScores).reduce(
    (total, score) => total + score,
    0,
  );
}

export function isPhaseUnlocked(phaseNumber) {
  const progress = getProgress();
  return Number(phaseNumber) <= progress.unlockedPhase;
}

export function isPhaseCompleted(phaseNumber) {
  const progress = getProgress();
  return progress.completedPhases.includes(Number(phaseNumber));
}

export function resetProgress() {
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.removeItem(JORNADA_DO_BIT_STORAGE_KEY);
    } catch (error) {
      // Ignore storage failures so the timeline remains usable.
    }
  }
}
