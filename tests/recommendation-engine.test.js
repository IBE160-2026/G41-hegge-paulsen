import { describe, it, expect } from 'vitest';
import { getWorkoutSuggestion } from '../src/features/recommendationEngine.js';
import { suggestNextWeight } from '../src/features/weightProgression.js';
import { logWorkout, getProgressSummary, getLatestWorkoutSummary } from '../src/features/trainingLog.js';
import { exerciseData } from '../src/data/exerciseCatalog.js';

describe('Workout recommendation', () => {
  it('returns strength workout for short strength session', () => {
    const result = getWorkoutSuggestion({
      time: 30,
      focus: 'styrke',
      energy: 'medium',
      history: []
    });

    expect(result.title).toBe('Styrkeøkt');
    expect(result.exercises.length).toBeGreaterThan(0);
    expect(result.intensity).toBe('medium');
  });

  it('returns lower intensity when energy is low', () => {
    const result = getWorkoutSuggestion({
      time: 20,
      focus: 'styrke',
      energy: 'low',
      history: []
    });

    expect(result.intensity).toBe('low');
  });

  it('returns conservative next weight when no history exists', () => {
    const result = suggestNextWeight([]);

    expect(result.suggestedWeight).toBe(0);
    expect(result.message).toContain('For lite data');
  });

  it('suggests a modest increase when history exists', () => {
    const result = suggestNextWeight([
      { load: 80 },
      { load: 85 },
      { load: 90 }
    ]);

    expect(result.suggestedWeight).toBeGreaterThan(0);
  });

  it('adds a logged workout to the history', () => {
    const history = [
      { id: 1, date: '2026-09-28', focus: 'styrke', load: 80 },
      { id: 2, date: '2026-10-01', focus: 'kondisjon', load: 60 }
    ];

    const result = logWorkout(history, {
      focus: 'styrke',
      duration: 35,
      load: 85,
      performance: 'good'
    });

    expect(result.length).toBe(3);
    expect(result[result.length - 1].focus).toBe('styrke');
    expect(result[result.length - 1].load).toBe(85);
  });

  it('summarizes recent progress from workout history', () => {
    const result = getProgressSummary([
      { date: '2026-09-28', focus: 'styrke', load: 80 },
      { date: '2026-10-01', focus: 'kondisjon', load: 60 },
      { date: '2026-10-04', focus: 'styrke', load: 90 }
    ]);

    expect(result.totalSessions).toBe(3);
    expect(result.averageLoad).toBeGreaterThan(70);
    expect(result.lastFocus).toBe('styrke');
  });

  it('includes a trend message for recent training progress', () => {
    const result = getProgressSummary([
      { date: '2026-09-28', focus: 'styrke', load: 70 },
      { date: '2026-10-01', focus: 'kondisjon', load: 75 },
      { date: '2026-10-04', focus: 'styrke', load: 90 }
    ]);

    expect(result.trendMessage).toContain('økt');
    expect(result.trendMessage.length).toBeGreaterThan(10);
  });

  it('returns a clear summary for the latest logged workout', () => {
    const result = getLatestWorkoutSummary([
      { date: '2026-09-28', focus: 'styrke', load: 70, duration: 30 },
      { date: '2026-10-04', focus: 'kondisjon', load: 90, duration: 45 }
    ]);

    expect(result.focus).toBe('kondisjon');
    expect(result.load).toBe(90);
    expect(result.label).toContain('2026-10-04');
  });

  it('includes bilingual bodyweight exercises with guidance and video links', () => {
    const squat = exerciseData.find((exercise) => exercise.id === 'squat');
    const pushUp = exerciseData.find((exercise) => exercise.id === 'push-up');

    expect(squat.name.no).toBe('Knebøy');
    expect(squat.name.en).toBe('Squat');
    expect(squat.videoUrl).toContain('youtube.com');
    expect(pushUp).toBeTruthy();
    expect(pushUp.name.no).toBe('Armheving');
  });

  it('prefers bodyweight strength moves for short and low-energy sessions', () => {
    const result = getWorkoutSuggestion({
      time: 15,
      focus: 'styrke',
      energy: 'low',
      history: []
    });

    expect(result.exercises.some((exercise) => exercise.toLowerCase().includes('armheving') || exercise.toLowerCase().includes('air squat'))).toBe(true);
  });

  it('explains why the recommendation fits the current session', () => {
    const result = getWorkoutSuggestion({
      time: 15,
      focus: 'styrke',
      energy: 'low',
      history: []
    });

    expect(result.reason.toLowerCase()).toContain('kort');
    expect(result.reason.toLowerCase()).toContain('lav');
  });
});
