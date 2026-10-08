import { exerciseData } from '../data/exerciseData.js';

export function getWorkoutSuggestion({ time, focus, energy, history = [] }) {
  const availableExercises = exerciseData.filter((exercise) => {
    if (focus === 'styrke') {
      return exercise.category === 'strength';
    }
    if (focus === 'kondisjon') {
      return exercise.category === 'conditioning';
    }
    return true;
  });

  if (!availableExercises.length) {
    return {
      title: 'Ingen passende øvelser funnet',
      exercises: [],
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
    title: focus === 'styrke' ? 'Styrkeøkt' : focus === 'kondisjon' ? 'Kondisjonsøkt' : 'Generell treningsøkt',
    exercises: selectedExercises.map((exercise) => exercise.name),
    intensity,
    duration: time,
    notes: 'Basert på tilgjengelig tid, fokus og historikk.'
  };
}
