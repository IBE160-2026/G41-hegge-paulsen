import { describe, it, expect } from 'vitest';
import { parseWorkoutRequest } from '../src/features/chatParser.js';

describe('parseWorkoutRequest', () => {
  it('recognizes every field from a full Norwegian sentence', () => {
    const result = parseWorkoutRequest('30 min styrke, lite energi, hjemme med manualer, nybegynner');

    expect(result).toEqual({
      time: 30,
      focus: 'styrke',
      energy: 'low',
      trainingMode: 'home-dumbbell',
      level: 'beginner',
      equipment: []
    });
  });

  it('recognizes focus and training mode from partial input, defaulting the rest', () => {
    const result = parseWorkoutRequest('kondisjon i senteret');

    expect(result.focus).toBe('kondisjon');
    expect(result.trainingMode).toBe('gym');
    expect(result.time).toBe(30);
    expect(result.energy).toBe('medium');
    expect(result.level).toBe('intermediate');
  });

  it('falls back to every default for empty text', () => {
    const result = parseWorkoutRequest('');

    expect(result).toEqual({
      time: 30,
      focus: 'styrke',
      energy: 'medium',
      trainingMode: 'home-dumbbell',
      level: 'intermediate',
      equipment: []
    });
  });

  it('falls back to every default for unrecognized text, still producing a valid request', () => {
    const result = parseWorkoutRequest('hei på deg');

    expect(result).toEqual({
      time: 30,
      focus: 'styrke',
      energy: 'medium',
      trainingMode: 'home-dumbbell',
      level: 'intermediate',
      equipment: []
    });
  });

  it('never throws and never returns null/undefined fields when called with no argument', () => {
    const result = parseWorkoutRequest();

    Object.values(result).forEach((value) => {
      expect(value).not.toBeNull();
      expect(value).not.toBeUndefined();
    });
  });

  it('never throws for a non-string argument, falling back to defaults', () => {
    expect(() => parseWorkoutRequest(null)).not.toThrow();
    expect(parseWorkoutRequest(null)).toEqual({
      time: 30,
      focus: 'styrke',
      energy: 'medium',
      trainingMode: 'home-dumbbell',
      level: 'intermediate',
      equipment: []
    });
  });

  it('is case-insensitive and tolerant of Norwegian compound/variant phrasing', () => {
    expect(parseWorkoutRequest('STYRKETRENING i dag').focus).toBe('styrke');
    expect(parseWorkoutRequest('Styrke på høyt nivå').focus).toBe('styrke');
  });

  it('extracts custom-mode equipment, ordered by the menu form\'s own declared equipment order (not by text-mention order)', () => {
    const result = parseWorkoutRequest('egendefinert med kettlebell og manualer');

    expect(result.trainingMode).toBe('custom');
    // profileEquipmentOptions declares dumbbell before kettlebell, so the
    // chat path must match that order even though "kettlebell" is mentioned
    // first in the text -- this keeps it consistent with the menu form's
    // checkbox order, which getWorkoutSuggestion's custom-mode selection
    // treats as significant.
    expect(result.equipment).toEqual(['dumbbell', 'kettlebell']);
  });

  it('returns an empty equipment list for custom mode when no equipment is named', () => {
    const result = parseWorkoutRequest('egendefinert treningsøkt');

    expect(result.trainingMode).toBe('custom');
    expect(result.equipment).toEqual([]);
  });

  it('never populates equipment for a non-custom training mode, even if equipment words appear', () => {
    const result = parseWorkoutRequest('hjemme med manualer');

    expect(result.trainingMode).toBe('home-dumbbell');
    expect(result.equipment).toEqual([]);
  });

  it('resolves ambiguous "middels" to energy, not level', () => {
    const result = parseWorkoutRequest('middels energi og erfaring');

    expect(result.energy).toBe('medium');
    expect(result.level).toBe('intermediate');
  });

  it('matches bare "middels" (no "energi" suffix) to energy', () => {
    const result = parseWorkoutRequest('middels');

    expect(result.energy).toBe('medium');
    expect(result.level).toBe('intermediate');
  });

  it('recognizes the more specific level keywords: nybegynner, erfaren, viderekommet', () => {
    expect(parseWorkoutRequest('nybegynner i styrke').level).toBe('beginner');
    expect(parseWorkoutRequest('erfaren utøver').level).toBe('advanced');
    expect(parseWorkoutRequest('viderekommet nivå').level).toBe('advanced');
  });

  it('recognizes high energy from "høy" or "mye"', () => {
    expect(parseWorkoutRequest('høy energi i dag').energy).toBe('high');
    expect(parseWorkoutRequest('mye energi i dag').energy).toBe('high');
  });

  it('recognizes home-bodyweight and home-kettlebell training modes explicitly', () => {
    expect(parseWorkoutRequest('kroppsvekt hjemme').trainingMode).toBe('home-bodyweight');
    expect(parseWorkoutRequest('hjemme med kettlebell').trainingMode).toBe('home-kettlebell');
  });

  it('parses an explicit minute count', () => {
    expect(parseWorkoutRequest('45 minutter kondisjon').time).toBe(45);
    expect(parseWorkoutRequest('15 min styrke').time).toBe(15);
  });

  it('does not false-positive "gym" inside an unrelated word like "gymnastikk"', () => {
    expect(parseWorkoutRequest('gymnastikk i dag').trainingMode).toBe('home-dumbbell');
  });

  it('still recognizes "gym" and "senter" (including inflected/compound forms) as gym mode', () => {
    expect(parseWorkoutRequest('gym i dag').trainingMode).toBe('gym');
    expect(parseWorkoutRequest('kondisjon i senteret').trainingMode).toBe('gym');
  });

  it('recognizes the English loanword "dumbbell" as custom-mode equipment', () => {
    const result = parseWorkoutRequest('egendefinert med dumbbell');

    expect(result.trainingMode).toBe('custom');
    expect(result.equipment).toEqual(['dumbbell']);
  });
});
