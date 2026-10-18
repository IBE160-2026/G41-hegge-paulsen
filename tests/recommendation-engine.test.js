import { describe, it, expect } from 'vitest';
import { getWorkoutSuggestion } from '../src/features/recommendationEngine.js';
import { suggestNextWeight } from '../src/features/weightProgression.js';
import { logWorkout, getProgressSummary, getLatestWorkoutSummary, readStoredHistory, writeStoredHistory } from '../src/features/trainingLog.js';
import { exerciseData, exerciseSources } from '../src/data/exerciseCatalog.js';
import { readUserProfile, writeUserProfile } from '../src/features/userProfile.js';

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
      performance: 'good',
      intensity: 'high'
    });

    expect(result.length).toBe(3);
    expect(result[result.length - 1].focus).toBe('styrke');
    expect(result[result.length - 1].load).toBe(85);
    expect(result[result.length - 1].intensity).toBe('high');
  });

  it('defaults a logged workout\'s intensity to null when omitted', () => {
    const result = logWorkout([], {
      focus: 'styrke',
      duration: 35,
      load: 85,
      performance: 'good'
    });

    expect(result[result.length - 1].intensity).toBe(null);
  });

  it('defaults a logged workout\'s date to the local calendar day, not UTC', () => {
    const now = new Date();
    const expectedLocalDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const result = logWorkout([], {
      focus: 'styrke',
      duration: 35,
      load: 85,
      performance: 'good'
    });

    expect(result[result.length - 1].date).toBe(expectedLocalDate);
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

  it('exposes a lightweight animation type for each exercise demo', () => {
    const squat = exerciseData.find((exercise) => exercise.id === 'squat');
    const pushUp = exerciseData.find((exercise) => exercise.id === 'push-up');

    expect(squat.animation).toBe('squat');
    expect(pushUp.animation).toBe('push-up');
  });

  it('lists the main muscles engaged in each exercise', () => {
    const squat = exerciseData.find((exercise) => exercise.id === 'squat');
    const pushUp = exerciseData.find((exercise) => exercise.id === 'push-up');
    const rowing = exerciseData.find((exercise) => exercise.id === 'rowing');
    const cycling = exerciseData.find((exercise) => exercise.id === 'cycling');

    expect(squat.muscles).toContain('Ben');
    expect(pushUp.muscles).toContain('Bryst');
    expect(rowing.muscles).toEqual(['Rygg', 'Armer', 'Skuldre']);
    expect(cycling.muscles).toEqual(['Ben', 'Gluteus', 'Legger']);
  });

  it('prefers bodyweight strength moves for short and low-energy sessions', () => {
    const result = getWorkoutSuggestion({
      time: 15,
      focus: 'styrke',
      energy: 'low',
      history: []
    });

    expect(result.exercises.some((exercise) => exercise.toLowerCase().includes('armheving') || exercise.toLowerCase().includes('mini-knebøy'))).toBe(true);
  });

  it('picks the gentler bodyweight variant over its harder sibling for the same movement pattern when time is short or energy is low', () => {
    const squatResult = getWorkoutSuggestion({
      time: 15,
      focus: 'styrke',
      energy: 'low',
      history: [],
      trainingMode: 'home-bodyweight',
      level: 'intermediate'
    });

    expect(squatResult.exerciseDetails.some((exercise) => exercise.id === 'air-squat')).toBe(true);
    expect(squatResult.exerciseDetails.some((exercise) => exercise.id === 'squat')).toBe(false);
    expect(squatResult.exerciseDetails.some((exercise) => exercise.id === 'step-up')).toBe(true);
    expect(squatResult.exerciseDetails.some((exercise) => exercise.id === 'lunges')).toBe(false);
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

  it('builds a realistic strength plan and a single-branch conditioning plan', () => {
    const strengthResult = getWorkoutSuggestion({
      time: 45,
      focus: 'styrke',
      energy: 'medium',
      history: []
    });

    const conditioningResult = getWorkoutSuggestion({
      time: 30,
      focus: 'kondisjon',
      energy: 'medium',
      history: []
    });

    expect(strengthResult.exercises.length).toBeGreaterThanOrEqual(4);
    expect(strengthResult.exercises.length).toBeLessThanOrEqual(10);
    expect(strengthResult.exerciseDetails[0].sets).toBeGreaterThan(0);
    expect(strengthResult.exerciseDetails[0].reps).toBeGreaterThan(0);
    expect(strengthResult.exerciseDetails[0].restSeconds).toBeGreaterThan(0);
    expect(conditioningResult.exercises.length).toBeLessThanOrEqual(2);
  });

  it('matches strength exercises to home equipment and beginner level without repeating movement patterns', () => {
    const result = getWorkoutSuggestion({
      time: 60,
      focus: 'styrke',
      energy: 'medium',
      history: [],
      trainingMode: 'home-dumbbell',
      level: 'beginner'
    });

    expect(result.exerciseDetails.length).toBeGreaterThanOrEqual(4);
    expect(result.exerciseDetails.every((exercise) => exercise.trainingModes.includes('home-dumbbell'))).toBe(true);
    expect(result.exerciseDetails.every((exercise) => exercise.level === 'beginner')).toBe(true);
    expect(result.exerciseDetails.every((exercise) => !exercise.equipment.includes('kettlebell'))).toBe(true);
    expect(new Set(result.exerciseDetails.map((exercise) => exercise.movementPattern)).size).toBe(result.exerciseDetails.length);
  });

  it('does not recommend weights in the bodyweight-only home profile', () => {
    const result = getWorkoutSuggestion({
      time: 45,
      focus: 'styrke',
      energy: 'medium',
      history: [],
      trainingMode: 'home-bodyweight',
      level: 'beginner'
    });

    expect(result.exerciseDetails.length).toBeGreaterThanOrEqual(4);
    expect(result.exerciseDetails.every((exercise) => exercise.equipment.every((item) => item === 'bodyweight'))).toBe(true);
    expect(result.exerciseDetails.find((exercise) => exercise.movementPattern === 'core').holdSeconds).toBeGreaterThan(0);
  });

  it('uses timed work and rest intervals for beginner home conditioning', () => {
    const result = getWorkoutSuggestion({
      time: 30,
      focus: 'kondisjon',
      energy: 'medium',
      history: [],
      trainingMode: 'home-bodyweight',
      level: 'beginner'
    });

    expect(result.exerciseDetails[0].rounds).toBeGreaterThan(0);
    expect(result.exerciseDetails[0].workSeconds).toBeGreaterThan(0);
    expect(result.exerciseDetails[0].restSeconds).toBeGreaterThan(0);
  });

  it('offers barbell, dumbbell, kettlebell, bodyweight, and machine squat alternatives', () => {
    const squatOptions = exerciseData.filter((exercise) => exercise.movementPattern === 'squat');
    const equipmentOptions = new Set(squatOptions.flatMap((exercise) => exercise.equipment));

    expect(equipmentOptions).toEqual(new Set(['bodyweight', 'barbell', 'dumbbell', 'kettlebell', 'machine']));
  });

  it('uses gym equipment for experienced gym recommendations', () => {
    const result = getWorkoutSuggestion({
      time: 45,
      focus: 'styrke',
      energy: 'medium',
      history: [],
      trainingMode: 'gym',
      level: 'advanced'
    });

    expect(result.exerciseDetails.some((exercise) => exercise.equipment.includes('barbell'))).toBe(true);
    expect(result.exerciseDetails.every((exercise) => exercise.trainingModes.includes('gym'))).toBe(true);
  });

  it('links exercise-specific instructions to verified sources and marks remaining entries for review', () => {
    const miniSquat = exerciseData.find((exercise) => exercise.id === 'air-squat');
    const wallPushUp = exerciseData.find((exercise) => exercise.id === 'wall-push-up');
    const barbellSquat = exerciseData.find((exercise) => exercise.id === 'barbell-squat');

    expect(miniSquat.sourceIds).toContain('nhs-strength-exercises');
    expect(wallPushUp.sourceIds).toContain('nhs-strength-exercises');
    expect(exerciseSources['nhs-strength-exercises'].url).toContain('nhs.uk');
    expect(barbellSquat.sourceIds).toEqual([]);
    expect(barbellSquat.sourceStatus).toBe('needs-review');
  });

  it('filters custom-profile recommendations to equipment saved in the user profile', () => {
    const result = getWorkoutSuggestion({
      time: 60,
      focus: 'styrke',
      energy: 'medium',
      history: [],
      trainingMode: 'custom',
      level: 'beginner',
      availableEquipment: ['bodyweight', 'kettlebell']
    });

    expect(result.exerciseDetails.length).toBeGreaterThanOrEqual(4);
    expect(result.exerciseDetails.every((exercise) => (
      exercise.equipment.every((item) => ['bodyweight', 'kettlebell'].includes(item))
    ))).toBe(true);
    expect(result.exerciseDetails.some((exercise) => exercise.id === 'kettlebell-deadlift')).toBe(true);
  });

  it('persists the selected equipment list in the user profile', () => {
    const values = new Map();
    const storage = {
      getItem: (key) => values.get(key) || null,
      setItem: (key, value) => values.set(key, value)
    };

    writeUserProfile({ equipment: ['kettlebell', 'kettlebell', 'unknown'] }, storage);

    expect(readUserProfile(storage)).toEqual({ equipment: ['kettlebell'] });
  });

  it('asks the user to select equipment when a custom profile is empty', () => {
    const result = getWorkoutSuggestion({
      time: 30,
      focus: 'styrke',
      energy: 'medium',
      trainingMode: 'custom',
      availableEquipment: []
    });

    expect(result.exerciseDetails).toEqual([]);
    expect(result.reason).toContain('Velg minst ett');
  });

  it('stores workout histories separately for different account keys', () => {
    const values = new Map();
    const storage = {
      getItem: (key) => values.get(key) || null,
      setItem: (key, value) => values.set(key, value)
    };
    const firstUserHistory = [{ id: 1, focus: 'styrke', load: 40 }];
    const secondUserHistory = [{ id: 1, focus: 'kondisjon', load: 0 }];

    writeStoredHistory(firstUserHistory, 'smartokt-history:user-1', storage);
    writeStoredHistory(secondUserHistory, 'smartokt-history:user-2', storage);

    expect(readStoredHistory('smartokt-history:user-1', storage)).toEqual(firstUserHistory);
    expect(readStoredHistory('smartokt-history:user-2', storage)).toEqual(secondUserHistory);
  });
});
