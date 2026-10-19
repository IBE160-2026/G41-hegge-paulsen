import { describe, it, expect } from 'vitest';
import {
  getWeeklyPlan,
  getAssignedWeekdays,
  getFocusForDayIndex,
  readStoredWeeklyPlan,
  writeStoredWeeklyPlan,
  WEEKLY_PLAN_STORAGE_KEY
} from '../src/features/weeklyPlan.js';

describe('getAssignedWeekdays (day-spread formula)', () => {
  it('spreads 1 training day onto Thursday', () => {
    expect(getAssignedWeekdays(1)).toEqual([4]);
  });

  it('spreads 2 training days onto Tuesday and Friday', () => {
    expect(getAssignedWeekdays(2)).toEqual([2, 5]);
  });

  it('spreads 3 training days onto Monday, Thursday and Saturday', () => {
    expect(getAssignedWeekdays(3)).toEqual([1, 4, 6]);
  });

  it('spreads 4 training days onto 4 distinct weekdays', () => {
    expect(getAssignedWeekdays(4)).toEqual([1, 3, 4, 6]);
  });

  it('spreads 5 training days onto 5 distinct weekdays', () => {
    expect(getAssignedWeekdays(5)).toEqual([1, 2, 4, 5, 6]);
  });

  it('spreads 6 training days onto 6 distinct weekdays', () => {
    expect(getAssignedWeekdays(6)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('spreads 7 training days onto every weekday', () => {
    expect(getAssignedWeekdays(7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('produces N distinct weekdays for every N from 1 to 7', () => {
    for (let trainingDays = 1; trainingDays <= 7; trainingDays += 1) {
      const weekdays = getAssignedWeekdays(trainingDays);
      expect(weekdays.length).toBe(trainingDays);
      expect(new Set(weekdays).size).toBe(trainingDays);
      weekdays.forEach((isoWeekday) => {
        expect(isoWeekday).toBeGreaterThanOrEqual(1);
        expect(isoWeekday).toBeLessThanOrEqual(7);
      });
    }
  });

  it('clamps an invalid day count to the nearest valid value instead of throwing', () => {
    expect(() => getAssignedWeekdays(0)).not.toThrow();
    expect(getAssignedWeekdays(0)).toEqual([4]);
    expect(getAssignedWeekdays(-5)).toEqual([4]);
    expect(getAssignedWeekdays(NaN)).toEqual([4]);
    expect(getAssignedWeekdays('not-a-number')).toEqual([4]);
    expect(getAssignedWeekdays(42)).toEqual(getAssignedWeekdays(7));
  });

  it('clamps +Infinity to 7 (the nearest valid value) instead of falling back to 1', () => {
    expect(getAssignedWeekdays(Infinity)).toEqual(getAssignedWeekdays(7));
  });

  it('clamps -Infinity to 1, since it has no nearest valid value to round toward', () => {
    expect(getAssignedWeekdays(-Infinity)).toEqual([4]);
  });
});

describe('getFocusForDayIndex (focus rotation formula)', () => {
  it('follows the rotation formula for a full 7-day week', () => {
    const focuses = Array.from({ length: 7 }, (_, i) => getFocusForDayIndex(i));

    expect(focuses).toEqual([
      'styrke', 'kondisjon', 'generell', 'styrke', 'kondisjon', 'generell', 'styrke'
    ]);
  });

  it('starts with styrke on day 0', () => {
    expect(getFocusForDayIndex(0)).toBe('styrke');
  });
});

describe('getWeeklyPlan', () => {
  it('assigns the right number of distinct weekdays, each with a focus, for a typical week', () => {
    const plan = getWeeklyPlan({
      trainingDays: 4,
      time: 30,
      energy: 'medium',
      level: 'intermediate',
      trainingMode: 'home-dumbbell',
      availableEquipment: [],
      history: []
    });

    expect(plan.days.length).toBe(4);
    expect(new Set(plan.days.map((day) => day.isoWeekday)).size).toBe(4);
    plan.days.forEach((day) => {
      expect(['styrke', 'kondisjon', 'generell']).toContain(day.focus);
      expect(day.suggestion).toBeTruthy();
    });
    expect(typeof plan.generatedAt).toBe('string');
  });

  it('never returns fewer exercises than the single-session engine would once the exercise pool is exhausted', () => {
    // home-bodyweight has exactly 7 styrke-compatible exercises across 4 movement
    // patterns (squat, horizontal-push, single-leg, core) -- a 7-day week assigns
    // styrke on day indices 0, 4 and 6 (per the rotation formula), so the 2nd and
    // 3rd styrke days must reuse exercises already used earlier in the week.
    const plan = getWeeklyPlan({
      trainingDays: 7,
      time: 30,
      energy: 'medium',
      level: 'intermediate',
      trainingMode: 'home-bodyweight',
      availableEquipment: [],
      history: []
    });

    const styrkeDays = plan.days.filter((day) => day.focus === 'styrke');
    expect(styrkeDays.length).toBe(3);

    styrkeDays.forEach((day) => {
      expect(day.suggestion.exerciseDetails.length).toBe(4);
    });

    // The 2nd styrke day can't reuse the 1st day's 4 picks (one unused
    // candidate remains for 3 of the 4 movement patterns), so it differs...
    const firstIds = styrkeDays[0].suggestion.exerciseDetails.map((exercise) => exercise.id);
    const secondIds = styrkeDays[1].suggestion.exerciseDetails.map((exercise) => exercise.id);
    expect(secondIds).not.toEqual(firstIds);

    // ...but by the 3rd styrke day the entire 7-exercise pool has been used at
    // least once, so it must fall back to reusing exercises already seen.
    const thirdIds = styrkeDays[2].suggestion.exerciseDetails.map((exercise) => exercise.id);
    const usedBeforeThirdDay = new Set([...firstIds, ...secondIds]);
    expect(thirdIds.some((id) => usedBeforeThirdDay.has(id))).toBe(true);
  });

  it('leaves an exhausted custom-equipment day unaffected on other days', () => {
    const plan = getWeeklyPlan({
      trainingDays: 3,
      time: 30,
      energy: 'medium',
      level: 'intermediate',
      trainingMode: 'custom',
      availableEquipment: [],
      history: []
    });

    plan.days.forEach((day) => {
      expect(day.suggestion.exerciseDetails).toEqual([]);
      expect(day.suggestion.reason).toContain('Velg minst ett');
    });
  });

  it('uses a dayOverrides entry\'s focus for that day instead of the automatic rotation', () => {
    const plan = getWeeklyPlan({
      trainingDays: 2,
      time: 30,
      energy: 'medium',
      level: 'intermediate',
      trainingMode: 'home-dumbbell',
      availableEquipment: [],
      history: [],
      dayOverrides: [{ focus: 'kondisjon', energy: 'medium' }]
    });

    // Day 0's automatic rotation value would be 'styrke' -- the override
    // changes it to 'kondisjon'.
    expect(plan.days[0].focus).toBe('kondisjon');
    // Day 1 has no override entry -- falls back to the rotation's own
    // day-1 value ('kondisjon').
    expect(plan.days[1].focus).toBe('kondisjon');
  });

  it('uses a dayOverrides entry\'s energy for that day instead of the shared `energy` value', () => {
    // Styrke's `sets` is energy-sensitive (2 low / 3 medium / 4 high) -- a
    // more reliable observable than `intensity`, which only distinguishes
    // energy levels for some time/focus combinations.
    const baseline = getWeeklyPlan({
      trainingDays: 1,
      time: 30,
      energy: 'medium',
      level: 'intermediate',
      trainingMode: 'home-dumbbell',
      availableEquipment: [],
      history: []
    });
    const overridden = getWeeklyPlan({
      trainingDays: 1,
      time: 30,
      energy: 'medium',
      level: 'intermediate',
      trainingMode: 'home-dumbbell',
      availableEquipment: [],
      history: [],
      dayOverrides: [{ focus: 'styrke', energy: 'high' }]
    });

    expect(baseline.days[0].suggestion.exerciseDetails[0].sets).toBe(3);
    expect(overridden.days[0].suggestion.exerciseDetails[0].sets).toBe(4);
  });

  it('falls back to the automatic rotation/shared energy for any dayOverrides entry with an invalid or missing value', () => {
    const plan = getWeeklyPlan({
      trainingDays: 3,
      time: 30,
      energy: 'medium',
      level: 'intermediate',
      trainingMode: 'home-dumbbell',
      availableEquipment: [],
      history: [],
      dayOverrides: [{ focus: 'not-a-real-focus', energy: 'not-a-real-energy' }, {}, undefined]
    });

    expect(plan.days[0].focus).toBe('styrke');
    expect(plan.days[1].focus).toBe('kondisjon');
    expect(plan.days[2].focus).toBe('generell');
  });

  it('behaves identically to omitting dayOverrides when it is an empty array (the default)', () => {
    const withoutOverrides = getWeeklyPlan({
      trainingDays: 3,
      time: 30,
      energy: 'medium',
      level: 'intermediate',
      trainingMode: 'home-dumbbell',
      availableEquipment: [],
      history: []
    });
    const withEmptyOverrides = getWeeklyPlan({
      trainingDays: 3,
      time: 30,
      energy: 'medium',
      level: 'intermediate',
      trainingMode: 'home-dumbbell',
      availableEquipment: [],
      history: [],
      dayOverrides: []
    });

    expect(withEmptyOverrides.days.map((day) => day.focus)).toEqual(withoutOverrides.days.map((day) => day.focus));
  });
});

describe('weekly plan localStorage persistence', () => {
  function createMemoryStorage() {
    const values = new Map();
    return {
      getItem: (key) => (values.has(key) ? values.get(key) : null),
      setItem: (key, value) => values.set(key, value)
    };
  }

  it('returns null when no plan has been persisted yet', () => {
    const storage = createMemoryStorage();

    expect(readStoredWeeklyPlan(WEEKLY_PLAN_STORAGE_KEY, storage)).toBeNull();
  });

  it('round-trips a generated plan through storage', () => {
    const storage = createMemoryStorage();
    const plan = getWeeklyPlan({
      trainingDays: 2,
      time: 30,
      energy: 'medium',
      level: 'intermediate',
      trainingMode: 'home-dumbbell',
      availableEquipment: [],
      history: []
    });

    writeStoredWeeklyPlan(plan, WEEKLY_PLAN_STORAGE_KEY, storage);

    expect(readStoredWeeklyPlan(WEEKLY_PLAN_STORAGE_KEY, storage)).toEqual(plan);
  });

  it('overwrites a previously stored plan when regenerated', () => {
    const storage = createMemoryStorage();
    const firstPlan = getWeeklyPlan({
      trainingDays: 1,
      time: 30,
      energy: 'medium',
      level: 'intermediate',
      trainingMode: 'home-dumbbell',
      availableEquipment: [],
      history: []
    });
    const secondPlan = getWeeklyPlan({
      trainingDays: 5,
      time: 30,
      energy: 'medium',
      level: 'intermediate',
      trainingMode: 'home-dumbbell',
      availableEquipment: [],
      history: []
    });

    writeStoredWeeklyPlan(firstPlan, WEEKLY_PLAN_STORAGE_KEY, storage);
    writeStoredWeeklyPlan(secondPlan, WEEKLY_PLAN_STORAGE_KEY, storage);

    expect(readStoredWeeklyPlan(WEEKLY_PLAN_STORAGE_KEY, storage)).toEqual(secondPlan);
  });

  it('does not throw when storage access fails', () => {
    const throwingStorage = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); }
    };

    expect(() => writeStoredWeeklyPlan({ days: [] }, WEEKLY_PLAN_STORAGE_KEY, throwingStorage)).not.toThrow();
    expect(readStoredWeeklyPlan(WEEKLY_PLAN_STORAGE_KEY, throwingStorage)).toBeNull();
  });
});
