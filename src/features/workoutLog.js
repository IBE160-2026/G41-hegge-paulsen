export const STORAGE_KEY = 'smartokt-history';

function normalizeHistory(history = []) {
  return Array.isArray(history) ? history : [];
}

export function logWorkout(history = [], workout = {}) {
  const safeHistory = normalizeHistory(history);

  const nextEntry = {
    id: safeHistory.length + 1,
    date: workout.date || new Date().toISOString().slice(0, 10),
    type: workout.type || workout.focus || 'strength',
    duration: Number(workout.duration) || 30,
    focus: workout.focus || 'styrke',
    energy: workout.energy || 'medium',
    load: Number(workout.load) || 0,
    completed: workout.completed !== false,
    performance: workout.performance || 'good',
    ...workout
  };

  const nextId = safeHistory.reduce((maxId, entry) => Math.max(maxId, Number(entry.id) || 0), 0) + 1;

  return [...safeHistory, { ...nextEntry, id: nextId }];
}

export function getProgressSummary(history = []) {
  const safeHistory = normalizeHistory(history);

  if (!safeHistory.length) {
    return {
      totalSessions: 0,
      averageLoad: 0,
      lastFocus: 'Ingen',
      lastLoad: 0,
      recentSessions: []
    };
  }

  const totalSessions = safeHistory.length;
  const averageLoad = safeHistory.reduce((sum, entry) => sum + Number(entry.load || 0), 0) / totalSessions;
  const lastWorkout = safeHistory[safeHistory.length - 1];

  return {
    totalSessions,
    averageLoad: Number(averageLoad.toFixed(1)),
    lastFocus: lastWorkout.focus || 'ukjent',
    lastLoad: Number(lastWorkout.load || 0),
    recentSessions: [...safeHistory].slice(-3).reverse()
  };
}

export function readStoredHistory() {
  try {
    const rawHistory = localStorage.getItem(STORAGE_KEY);
    return rawHistory ? JSON.parse(rawHistory) : [];
  } catch (error) {
    return [];
  }
}

export function writeStoredHistory(history = []) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    // ignore storage failures in restricted environments
  }

  return history;
}
