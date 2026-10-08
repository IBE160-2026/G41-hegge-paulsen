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

  const selectedExercises = availableExercises.slice(0, 3);

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
