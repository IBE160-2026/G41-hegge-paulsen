import { describe, it, expect } from 'vitest';
import { getWorkoutSuggestion } from '../src/features/workoutRecommendation.js';
import { suggestNextWeight } from '../src/features/nextWeightSuggestion.js';

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
});
