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

export function getLatestWorkoutSummary(history = []) {
  const safeHistory = normalizeHistory(history);

  if (!safeHistory.length) {
    return {
      label: 'Ingen økter logget enda',
      focus: 'Ingen',
      load: 0,
      duration: 0,
      date: null
    };
  }

  const latestWorkout = [...safeHistory].slice(-1)[0];

  return {
    label: `Siste økt: ${latestWorkout.date || 'Ukjent dato'}`,
    focus: latestWorkout.focus || 'ukjent',
    load: Number(latestWorkout.load || 0),
    duration: Number(latestWorkout.duration || 0),
    date: latestWorkout.date || null
  };
}

export function getProgressSummary(history = []) {
  const safeHistory = normalizeHistory(history);

  if (!safeHistory.length) {
    return {
      totalSessions: 0,
      averageLoad: 0,
      lastFocus: 'Ingen',
      lastLoad: 0,
      recentSessions: [],
      trendMessage: 'Logg minst to økter for å se utvikling.'
    };
  }

  const totalSessions = safeHistory.length;
  const averageLoad = safeHistory.reduce((sum, entry) => sum + Number(entry.load || 0), 0) / totalSessions;
  const lastWorkout = safeHistory[safeHistory.length - 1];
  const recentSessions = [...safeHistory].slice(-3);
  const recentAverage = recentSessions.reduce((sum, entry) => sum + Number(entry.load || 0), 0) / recentSessions.length;
  const olderSessions = safeHistory.length > 3 ? safeHistory.slice(0, -3) : [];
  const olderAverage = olderSessions.length
    ? olderSessions.reduce((sum, entry) => sum + Number(entry.load || 0), 0) / olderSessions.length
    : recentAverage;

  let trendMessage = 'Logg minst to økter for å se utvikling.';

  if (safeHistory.length >= 2) {
    const delta = recentAverage - olderAverage;
    const percentage = olderAverage ? (delta / olderAverage) * 100 : 0;

    if (delta > 0) {
      trendMessage = `Du har økt belastningen med ${Math.abs(percentage).toFixed(0)}% de siste øktene.`;
    } else if (delta < 0) {
      trendMessage = `Belastningen er ned ${Math.abs(percentage).toFixed(0)}% de siste øktene.`;
    } else {
      trendMessage = 'Belastningen er stabil de siste øktene.';
    }
  }

  return {
    totalSessions,
    averageLoad: Number(averageLoad.toFixed(1)),
    lastFocus: lastWorkout.focus || 'ukjent',
    lastLoad: Number(lastWorkout.load || 0),
    recentSessions: [...safeHistory].slice(-3).reverse(),
    trendMessage
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
