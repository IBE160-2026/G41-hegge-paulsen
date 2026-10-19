import { getWorkoutSuggestion } from './recommendationEngine.js';

export const WEEKLY_PLAN_STORAGE_KEY = 'smartokt-weekly-plan';

const FOCUS_ROTATION = ['styrke', 'kondisjon', 'generell'];
const VALID_FOCUSES = new Set(FOCUS_ROTATION);
const VALID_ENERGIES = new Set(['low', 'medium', 'high']);
// 'custom' is deliberately excluded: a per-day custom-equipment panel would
// duplicate the shared equipment-checkbox UI across every day row.
const VALID_TRAINING_MODES = new Set(['home-bodyweight', 'home-dumbbell', 'home-kettlebell', 'gym']);
const VALID_LEVELS = new Set(['beginner', 'intermediate', 'advanced']);

// Spreads `trainingDays` (clamped to 1-7) evenly across the ISO week
// (1=Mon..7=Sun): for i in 0..N-1, isoWeekday = round((i + 0.5) * 7 / N).
// This produces N distinct, evenly-spread weekdays for every N in 1-7.
export function getAssignedWeekdays(trainingDays) {
  const numericDays = Number(trainingDays);
  // Number.isFinite() is false for Infinity/-Infinity as well as NaN, but an
  // out-of-range count should clamp to the *nearest* valid value (per the
  // spec's I/O matrix) -- so +Infinity clamps to 7, while -Infinity and NaN
  // (no sensible "nearest" direction) fall back to 1.
  let clampedDays;
  if (numericDays === Infinity) {
    clampedDays = 7;
  } else if (Number.isFinite(numericDays)) {
    clampedDays = Math.min(7, Math.max(1, Math.round(numericDays)));
  } else {
    clampedDays = 1;
  }

  return Array.from({ length: clampedDays }, (_, i) => {
    const isoWeekday = Math.round(((i + 0.5) * 7) / clampedDays);
    return Math.min(7, Math.max(1, isoWeekday));
  });
}

// Fixed rotation by position in the week (0-indexed), not by weekday number:
// day 0=styrke, 1=kondisjon, 2=generell, 3=styrke, 4=kondisjon, 5=generell, repeating.
export function getFocusForDayIndex(i) {
  return FOCUS_ROTATION[i % 3];
}

export function getWeeklyPlan({
  trainingDays,
  time,
  energy,
  level,
  trainingMode,
  availableEquipment,
  history = [],
  dayOverrides = []
}) {
  const assignedWeekdays = getAssignedWeekdays(trainingDays);
  const excludeExerciseIds = [];

  const days = assignedWeekdays.map((isoWeekday, i) => {
    const override = dayOverrides[i];
    const focus = VALID_FOCUSES.has(override?.focus) ? override.focus : getFocusForDayIndex(i);
    const dayEnergy = VALID_ENERGIES.has(override?.energy) ? override.energy : energy;
    const dayTrainingMode = VALID_TRAINING_MODES.has(override?.trainingMode) ? override.trainingMode : trainingMode;
    const dayLevel = VALID_LEVELS.has(override?.level) ? override.level : level;
    const suggestion = getWorkoutSuggestion({
      time,
      focus,
      energy: dayEnergy,
      history,
      trainingMode: dayTrainingMode,
      level: dayLevel,
      availableEquipment,
      excludeExerciseIds: [...excludeExerciseIds]
    });

    (suggestion.exerciseDetails || []).forEach((exercise) => {
      if (exercise?.id && !excludeExerciseIds.includes(exercise.id)) {
        excludeExerciseIds.push(exercise.id);
      }
    });

    return { isoWeekday, focus, suggestion };
  });

  return {
    days,
    generatedAt: new Date().toISOString()
  };
}

export function readStoredWeeklyPlan(storageKey = WEEKLY_PLAN_STORAGE_KEY, storage = globalThis.localStorage) {
  try {
    const rawPlan = storage.getItem(storageKey);
    return rawPlan ? JSON.parse(rawPlan) : null;
  } catch (error) {
    return null;
  }
}

export function writeStoredWeeklyPlan(plan, storageKey = WEEKLY_PLAN_STORAGE_KEY, storage = globalThis.localStorage) {
  try {
    storage.setItem(storageKey, JSON.stringify(plan));
  } catch (error) {
    // ignore storage failures in restricted environments
  }

  return plan;
}
