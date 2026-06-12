const JORNADA_DO_BIT_STORAGE_KEY = "jornadaDoBitProgress";
const JORNADA_DO_BIT_TOTAL_PHASES = 7;

function createDefaultProgress() {
  return {
    completedPhases: [],
    unlockedPhase: 1,
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

  const unlockedPhase = Math.min(
    Math.max(Number(progress.unlockedPhase) || 1, 1),
    JORNADA_DO_BIT_TOTAL_PHASES,
  );

  return {
    completedPhases: [...new Set(completedPhases)],
    unlockedPhase,
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
