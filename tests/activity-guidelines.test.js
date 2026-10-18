import { describe, it, expect } from 'vitest';
import { getWeeklyGuidelineStatus } from '../src/features/activityGuidelines.js';

// Reference date pinned inside ISO week 2026-10-12 (Mon) .. 2026-10-18 (Sun).
const REFERENCE_DATE = new Date('2026-10-15T12:00:00');

describe('getWeeklyGuidelineStatus', () => {
  it('reports 0 minutes and both rules false when there is no history this week', () => {
    const result = getWeeklyGuidelineStatus([], REFERENCE_DATE);

    expect(result.weightedMinutes).toBe(0);
    expect(result.minutesRuleMet).toBe(false);
    expect(result.strengthDaysRuleMet).toBe(false);
    expect(result.isFullScore).toBe(false);
  });

  it('weights vigorous minutes 2:1 when combined with moderate minutes, below threshold', () => {
    const history = [
      { date: '2026-10-13', focus: 'kondisjon', duration: 60, intensity: 'medium', completed: true },
      { date: '2026-10-14', focus: 'kondisjon', duration: 40, intensity: 'high', completed: true }
    ];

    const result = getWeeklyGuidelineStatus(history, REFERENCE_DATE);

    expect(result.weightedMinutes).toBe(140);
    expect(result.minutesRuleMet).toBe(false);
  });

  it('meets the minutes rule via vigorous activity alone (75 min high = 150 weighted minutes)', () => {
    const history = [
      { date: '2026-10-13', focus: 'kondisjon', duration: 75, intensity: 'high', completed: true }
    ];

    const result = getWeeklyGuidelineStatus(history, REFERENCE_DATE);

    expect(result.weightedMinutes).toBe(150);
    expect(result.minutesRuleMet).toBe(true);
  });

  it('meets the minutes rule at exactly 150 moderate minutes (inclusive threshold)', () => {
    const history = [
      { date: '2026-10-13', focus: 'kondisjon', duration: 150, intensity: 'medium', completed: true }
    ];

    const result = getWeeklyGuidelineStatus(history, REFERENCE_DATE);

    expect(result.weightedMinutes).toBe(150);
    expect(result.minutesRuleMet).toBe(true);
  });

  it('counts two styrke sessions on the same date as a single strength day', () => {
    const history = [
      { date: '2026-10-13', focus: 'styrke', duration: 30, intensity: 'medium', completed: true },
      { date: '2026-10-13', focus: 'styrke', duration: 20, intensity: 'medium', completed: true }
    ];

    const result = getWeeklyGuidelineStatus(history, REFERENCE_DATE);

    expect(result.strengthDayCount).toBe(1);
    expect(result.strengthDaysRuleMet).toBe(false);
  });

  it('returns isFullScore true when both the minutes rule and the strength-day rule are met', () => {
    const history = [
      { date: '2026-10-12', focus: 'styrke', duration: 40, intensity: 'medium', completed: true },
      { date: '2026-10-14', focus: 'styrke', duration: 40, intensity: 'medium', completed: true },
      { date: '2026-10-16', focus: 'kondisjon', duration: 80, intensity: 'medium', completed: true }
    ];

    const result = getWeeklyGuidelineStatus(history, REFERENCE_DATE);

    expect(result.weightedMinutes).toBe(160);
    expect(result.minutesRuleMet).toBe(true);
    expect(result.strengthDayCount).toBe(2);
    expect(result.strengthDaysRuleMet).toBe(true);
    expect(result.isFullScore).toBe(true);
  });

  it('excludes entries with no intensity field from minutes but still counts them toward strength-days', () => {
    const history = [
      { date: '2026-10-13', focus: 'styrke', duration: 45, completed: true }
    ];

    const result = getWeeklyGuidelineStatus(history, REFERENCE_DATE);

    expect(result.weightedMinutes).toBe(0);
    expect(result.strengthDayCount).toBe(1);
  });

  it('excludes entries with a malformed or missing date entirely', () => {
    const history = [
      { date: 'not-a-date', focus: 'styrke', duration: 45, intensity: 'high', completed: true },
      { focus: 'styrke', duration: 45, intensity: 'high', completed: true }
    ];

    const result = getWeeklyGuidelineStatus(history, REFERENCE_DATE);

    expect(result.weightedMinutes).toBe(0);
    expect(result.strengthDayCount).toBe(0);
  });

  it('excludes low-intensity sessions from minutes entirely but still counts them toward strength-days', () => {
    const history = [
      { date: '2026-10-13', focus: 'styrke', duration: 30, intensity: 'low', completed: true }
    ];

    const result = getWeeklyGuidelineStatus(history, REFERENCE_DATE);

    expect(result.weightedMinutes).toBe(0);
    expect(result.strengthDayCount).toBe(1);
  });

  it('excludes incomplete sessions entirely, with no minutes or strength-day credit', () => {
    const history = [
      { date: '2026-10-13', focus: 'styrke', duration: 150, intensity: 'high', completed: false }
    ];

    const result = getWeeklyGuidelineStatus(history, REFERENCE_DATE);

    expect(result.weightedMinutes).toBe(0);
    expect(result.strengthDayCount).toBe(0);
  });

  it('counts two styrke sessions on the same date as one strength day even with incidental date whitespace', () => {
    const history = [
      { date: '2026-10-13', focus: 'styrke', duration: 30, intensity: 'medium', completed: true },
      { date: ' 2026-10-13 ', focus: 'styrke', duration: 20, intensity: 'medium', completed: true }
    ];

    const result = getWeeklyGuidelineStatus(history, REFERENCE_DATE);

    expect(result.strengthDayCount).toBe(1);
  });

  it('returns a safe all-false result when referenceDate is invalid instead of matching every entry', () => {
    const history = [
      { date: '2026-01-01', focus: 'styrke', duration: 200, intensity: 'high', completed: true }
    ];

    const result = getWeeklyGuidelineStatus(history, new Date('not-a-date'));

    expect(result.weightedMinutes).toBe(0);
    expect(result.strengthDayCount).toBe(0);
    expect(result.isFullScore).toBe(false);
  });
});
