import { exerciseData } from '../data/exerciseCatalog.js';

function formatExerciseLabel(exercise) {
  return `${exercise.name.no} (${exercise.name.en})`;
}

export function getWorkoutSuggestion({ time, focus, energy, history = [] }) {
  const normalizedFocus = focus || 'generell';

  const availableExercises = exerciseData.filter((exercise) => {
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
    return {
      title: 'Ingen passende øvelser funnet',
      exercises: [],
      exerciseDetails: [],
      intensity: 'low'
    };
  }

  let prioritizedExercises = [...availableExercises];

  if (normalizedFocus === 'styrke' && (time <= 20 || energy === 'low')) {
    const bodyweightExercises = availableExercises.filter((exercise) => exercise.category === 'bodyweight');
    const equipmentExercises = availableExercises.filter((exercise) => exercise.category !== 'bodyweight');
    prioritizedExercises = [...bodyweightExercises, ...equipmentExercises];
  }

  if (normalizedFocus === 'kondisjon' && (time <= 20 || energy === 'low')) {
    const easierExercises = availableExercises.filter((exercise) => exercise.difficulty !== 'hard');
    prioritizedExercises = [...easierExercises, ...availableExercises.filter((exercise) => exercise.difficulty === 'hard')];
  }

  const selectedExercises = prioritizedExercises.slice(0, 3);

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

  return {
    title: normalizedFocus === 'styrke' ? 'Styrkeøkt' : normalizedFocus === 'kondisjon' ? 'Kondisjonsøkt' : 'Generell treningsøkt',
    exercises: selectedExercises.map((exercise) => formatExerciseLabel(exercise)),
    exerciseDetails: selectedExercises,
    intensity,
    duration: time,
    notes: 'Basert på tilgjengelig tid, fokus og historikk.'
  };
}
