import { exerciseData } from '../data/exerciseCatalog.js';
import { profileEquipmentOptions } from './userProfile.js';

const validEquipmentIds = new Set(profileEquipmentOptions.map((option) => option.id));

function formatExerciseLabel(exercise) {
  return `${exercise.name.no} (${exercise.name.en})`;
}

function getExercisePlan(exercise, focus, time, energy) {
  if (focus === 'styrke') {
    if (exercise.movementPattern === 'core') {
      return {
        ...exercise,
        sets: 3,
        holdSeconds: energy === 'low' ? 15 : energy === 'high' ? 40 : 25,
        restSeconds: 45,
        type: 'styrke'
      };
    }

    const sets = energy === 'low' ? 2 : energy === 'high' ? 4 : 3;
    const baseReps = energy === 'low' ? 8 : energy === 'high' ? 10 : 8;
    const restSeconds = time <= 20 ? 75 : energy === 'low' ? 90 : 75;

    return {
      ...exercise,
      sets,
      reps: Math.max(6, baseReps + (exercise.difficulty === 'hard' ? -2 : 0)),
      restSeconds,
      type: 'styrke'
    };
  }

  const rounds = time >= 45 ? 5 : 4;
  const workSeconds = energy === 'low' ? 30 : 45;
  const restSeconds = energy === 'low' ? 60 : 45;

  return {
    ...exercise,
    rounds,
    workSeconds,
    restSeconds,
    type: 'kondisjon'
  };
}

// Selects up to `desiredCount` exercises from `list` (already in priority
// order), skipping entries whose `id` is in `excludeSet`. When the unexcluded
// candidates can't fill `desiredCount`, the remaining slots are backfilled
// from the excluded candidates (in the same priority order) so a caller never
// gets a shorter result than the unfiltered selection would have produced.
function selectWithExclusionFallback(list, desiredCount, excludeSet) {
  const selected = list.filter((exercise) => !excludeSet.has(exercise.id)).slice(0, desiredCount);

  if (selected.length < desiredCount) {
    const selectedIds = new Set(selected.map((exercise) => exercise.id));
    for (const exercise of list) {
      if (selected.length >= desiredCount) break;
      if (selectedIds.has(exercise.id)) continue;
      selected.push(exercise);
      selectedIds.add(exercise.id);
    }
  }

  return selected;
}

// Same idea as selectWithExclusionFallback, but deduplicates by movement
// pattern (one exercise per pattern) the way the existing styrke selection
// logic always has. First pass: for each pattern (in priority order), take
// the first unexcluded candidate. Second pass: for any pattern that still has
// no pick (every candidate for it was excluded), allow reuse of its first
// (excluded) candidate -- fallback reuse scoped to that one slot only.
function selectUniqueMovementPatterns(list, desiredCount, excludeSet) {
  const patterns = new Set();
  const selected = [];

  for (const exercise of list) {
    if (selected.length >= desiredCount) break;
    if (patterns.has(exercise.movementPattern)) continue;
    if (excludeSet.has(exercise.id)) continue;
    patterns.add(exercise.movementPattern);
    selected.push(exercise);
  }

  if (selected.length < desiredCount) {
    for (const exercise of list) {
      if (selected.length >= desiredCount) break;
      if (patterns.has(exercise.movementPattern)) continue;
      patterns.add(exercise.movementPattern);
      selected.push(exercise);
    }
  }

  return selected;
}

const levelRank = { beginner: 1, intermediate: 2, advanced: 3 };
const difficultyRank = { easy: 0, medium: 1, hard: 2 };
const easeScore = (exercise) => levelRank[exercise.level] * 10 + (difficultyRank[exercise.difficulty] ?? 1);
const equipmentPreference = {
  'home-bodyweight': ['bodyweight'],
  'home-dumbbell': ['dumbbell', 'bodyweight'],
  'home-kettlebell': ['kettlebell', 'bodyweight'],
  gym: ['barbell', 'machine', 'cable-machine', 'dumbbell', 'kettlebell', 'bodyweight', 'rowing-machine', 'stationary-bike', 'pull-up-bar']
};

export function getWorkoutSuggestion({ time, focus, energy, history = [], trainingMode = 'home', level = 'intermediate', availableEquipment = [], excludeExerciseIds = [] }) {
  const normalizedFocus = focus || 'generell';
  const normalizedMode = trainingMode === 'custom'
    ? 'custom'
    : equipmentPreference[trainingMode]
      ? trainingMode
      : trainingMode === 'gym'
        ? 'gym'
        : 'home-dumbbell';
  const normalizedLevel = levelRank[level] ? level : 'intermediate';
  const customEquipment = [...new Set(availableEquipment.filter((item) => validEquipmentIds.has(item)))];

  const availableExercises = exerciseData.filter((exercise) => {
    const compatibleEquipment = normalizedMode === 'custom'
      ? customEquipment.length > 0 && exercise.equipment.every((item) => customEquipment.includes(item))
      : exercise.trainingModes.includes(normalizedMode);
    if (!compatibleEquipment || levelRank[exercise.level] > levelRank[normalizedLevel]) {
      return false;
    }
    if (normalizedFocus === 'styrke') {
      return exercise.focus === 'styrke';
    }
    if (normalizedFocus === 'kondisjon') {
      return exercise.focus === 'kondisjon';
    }
    if (normalizedFocus === 'generell') {
      return exercise.focus === 'generell' || exercise.focus === 'styrke' || exercise.focus === 'kondisjon';
    }
    return exercise.focus === normalizedFocus;
  });

  if (!availableExercises.length) {
    const reason = normalizedMode === 'custom' && customEquipment.length === 0
      ? 'Velg minst ett tilgjengelig utstyr i brukerprofilen for å få et øktforslag.'
      : 'Det ble ikke funnet øvelser som passer valgene dine.';

    return {
      title: 'Ingen passende øvelser funnet',
      exercises: [],
      exerciseDetails: [],
      intensity: 'low',
      reason,
      notes: reason
    };
  }

  let prioritizedExercises = [...availableExercises];

  if (normalizedFocus === 'styrke') {
    const preference = normalizedMode === 'custom'
      ? [...customEquipment.filter((item) => item !== 'bodyweight'), 'bodyweight']
      : equipmentPreference[normalizedMode];
    prioritizedExercises.sort((first, second) => (
      preference.indexOf(first.equipment[0]) - preference.indexOf(second.equipment[0])
    ));
  }

  if (normalizedFocus === 'styrke' && (time <= 20 || energy === 'low')) {
    const bodyweightExercises = availableExercises
      .filter((exercise) => exercise.category === 'bodyweight')
      .sort((first, second) => easeScore(first) - easeScore(second));
    const equipmentExercises = availableExercises.filter((exercise) => exercise.category !== 'bodyweight');
    prioritizedExercises = [...bodyweightExercises, ...equipmentExercises];
  }

  if (normalizedFocus === 'kondisjon' && (time <= 20 || energy === 'low')) {
    const easierExercises = availableExercises.filter((exercise) => exercise.difficulty !== 'hard');
    prioritizedExercises = [...easierExercises, ...availableExercises.filter((exercise) => exercise.difficulty === 'hard')];
  }

  const excludeSet = new Set(excludeExerciseIds);

  let selectedExercises = selectWithExclusionFallback(prioritizedExercises, 3, excludeSet);

  if (normalizedFocus === 'styrke') {
    const desiredCount = Math.max(4, Math.min(10, Math.round(time / 12)));
    selectedExercises = selectUniqueMovementPatterns(prioritizedExercises, desiredCount, excludeSet);
  }

  if (normalizedFocus === 'kondisjon') {
    const branchCount = time >= 45 ? 2 : 1;
    selectedExercises = selectWithExclusionFallback(prioritizedExercises, branchCount, excludeSet);
  }

  const exerciseDetails = selectedExercises.map((exercise) => getExercisePlan(exercise, normalizedFocus, time, energy));

  let intensity = 'medium';
  if (energy === 'low') intensity = 'low';
  if (energy === 'high' && time >= 40) intensity = 'high';

  if (time <= 20) {
    intensity = energy === 'low' ? 'low' : 'medium';
  }

  const previousLoad = history.reduce((sum, entry) => sum + (entry.load || 0), 0);
  const hasRecentHardSessions = history.some((entry) => entry.performance === 'good' && entry.energy === 'high');

  if (hasRecentHardSessions && previousLoad > 200 && time >= 35) {
    intensity = 'high';
  }

  const setupLabel = normalizedMode === 'gym'
    ? 'utstyr på treningssenter'
    : normalizedMode === 'custom'
      ? 'utstyret i brukerprofilen'
    : normalizedMode === 'home-bodyweight'
      ? 'kroppsvekt hjemme'
      : normalizedMode === 'home-kettlebell'
        ? 'kettlebell hjemme'
        : 'manualer hjemme';
  const levelLabel = normalizedLevel === 'beginner' ? 'nybegynnernivå' : normalizedLevel === 'advanced' ? 'viderekommet nivå' : 'middels nivå';
  const reason = time <= 20 || energy === 'low'
    ? `Kort tid eller lav energi gir en roligere økt tilpasset ${setupLabel} og ${levelLabel}.`
    : `Forslaget er tilpasset ${normalizedFocus}, ${setupLabel} og ${levelLabel}.`;

  return {
    title: normalizedFocus === 'styrke' ? 'Styrkeøkt' : normalizedFocus === 'kondisjon' ? 'Kondisjonsøkt' : 'Generell treningsøkt',
    exercises: exerciseDetails.map((exercise) => formatExerciseLabel(exercise)),
    exerciseDetails,
    availableEquipment: normalizedMode === 'custom' ? customEquipment : equipmentPreference[normalizedMode],
    intensity,
    duration: time,
    reason,
    notes: reason
  };
}
