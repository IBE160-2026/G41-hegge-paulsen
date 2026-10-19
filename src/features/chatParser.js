// Pure, rule-based Norwegian free-text -> workout-request parser.
// No DOM/storage access, no external AI/LLM API -- keyword/pattern matching
// only (see spec-chat-input-and-suggestion-page.md). Every field falls back
// to the #workout-form menu's own default whenever it isn't recognized in
// the text; this function never throws and never returns a field as
// null/undefined.

import { profileEquipmentOptions } from './userProfile.js';

// Equipment order matters to getWorkoutSuggestion's custom-mode exercise
// selection, so the chat path must produce the same order as the menu
// form's checkboxes do -- the declared order of profileEquipmentOptions --
// regardless of the order equipment words happen to appear in the text.
const EQUIPMENT_ORDER = profileEquipmentOptions.map((option) => option.id);

const DEFAULTS = {
  time: 30,
  focus: 'styrke',
  energy: 'medium',
  trainingMode: 'home-dumbbell',
  level: 'intermediate',
  equipment: []
};

const TIME_PATTERN = /(\d{1,3})\s*(min|minutt)/i;

const LOW_ENERGY_WORDS = ['lav', 'lite'];
const HIGH_ENERGY_WORDS = ['høy', 'mye'];
const MEDIUM_ENERGY_WORDS = ['middels'];

const BEGINNER_WORDS = ['nybegynner'];
const ADVANCED_WORDS = ['erfaren', 'viderekommet'];

// id -> Norwegian keyword(s) recognized in free text. Kept non-overlapping
// (e.g. "vektstang"/"styrkeapparat" rather than the generic "stang"/
// "apparat") so one piece of equipment never accidentally matches another's
// keyword as a substring (e.g. "pull-up-stang" vs. "vektstang").
const EQUIPMENT_KEYWORDS = [
  { id: 'bodyweight', words: ['kroppsvekt'] },
  { id: 'dumbbell', words: ['manualer', 'manual', 'dumbbell'] },
  { id: 'kettlebell', words: ['kettlebell'] },
  { id: 'barbell', words: ['vektstang'] },
  { id: 'cable-machine', words: ['kabelapparat'] },
  { id: 'machine', words: ['styrkeapparat'] },
  { id: 'rowing-machine', words: ['romaskin'] },
  { id: 'stationary-bike', words: ['ergometersykkel'] },
  { id: 'pull-up-bar', words: ['pull-up-stang', 'pullupstang'] }
];

function includesAny(lowerText, words) {
  return words.some((word) => lowerText.includes(word));
}

function parseTime(text) {
  const match = TIME_PATTERN.exec(text);
  if (!match) return DEFAULTS.time;
  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? value : DEFAULTS.time;
}

function parseFocus(lowerText) {
  if (lowerText.includes('kondisjon')) return 'kondisjon';
  if (lowerText.includes('generell')) return 'generell';
  if (lowerText.includes('styrke')) return 'styrke';
  return DEFAULTS.focus;
}

// "middels" only ever resolves energy, never level -- "intermediate" is
// already the form's own default and needs no explicit trigger.
function parseEnergy(lowerText) {
  if (includesAny(lowerText, LOW_ENERGY_WORDS)) return 'low';
  if (includesAny(lowerText, HIGH_ENERGY_WORDS)) return 'high';
  if (includesAny(lowerText, MEDIUM_ENERGY_WORDS)) return 'medium';
  return DEFAULTS.energy;
}

function parseLevel(lowerText) {
  if (includesAny(lowerText, BEGINNER_WORDS)) return 'beginner';
  if (includesAny(lowerText, ADVANCED_WORDS)) return 'advanced';
  return DEFAULTS.level;
}

// "gym" needs a strict whole-word boundary -- unlike "senter" (left
// substring-tolerant so inflected/compound forms like "senteret" and
// "treningssenter" still match per the spec's own compound-word tolerance),
// "gym" is a short loanword that collides with unrelated Norwegian words
// (e.g. "gymnastikk") if matched as a bare substring.
const GYM_WORD_PATTERN = /\bgym\b/i;

function parseTrainingMode(lowerText) {
  if (lowerText.includes('egendefinert')) return 'custom';
  if (lowerText.includes('senter') || GYM_WORD_PATTERN.test(lowerText)) return 'gym';
  if (lowerText.includes('kroppsvekt')) return 'home-bodyweight';
  if (lowerText.includes('kettlebell')) return 'home-kettlebell';
  if (lowerText.includes('manualer') || lowerText.includes('manual') || lowerText.includes('dumbbell')) {
    return 'home-dumbbell';
  }
  return DEFAULTS.trainingMode;
}

// Equipment is only meaningful for trainingMode 'custom' -- for every other
// mode the chat form never touches equipment, matching the menu form's own
// equipment-only-for-custom behavior. Matches are ordered by their position
// in EQUIPMENT_ORDER (not by where they appear in the text), so the same
// logical equipment set always produces the same order getWorkoutSuggestion
// sees, whether it came from the chat form or the menu form's checkboxes.
function parseEquipment(text, lowerText, trainingMode) {
  if (trainingMode !== 'custom') return [];

  const matchedIds = EQUIPMENT_KEYWORDS
    .filter(({ words }) => includesAny(lowerText, words))
    .map(({ id }) => id);

  return matchedIds.sort((first, second) => EQUIPMENT_ORDER.indexOf(first) - EQUIPMENT_ORDER.indexOf(second));
}

export function parseWorkoutRequest(text = '') {
  const safeText = typeof text === 'string' ? text : '';
  const lowerText = safeText.toLowerCase();

  const trainingMode = parseTrainingMode(lowerText);

  return {
    time: parseTime(safeText),
    focus: parseFocus(lowerText),
    energy: parseEnergy(lowerText),
    trainingMode,
    level: parseLevel(lowerText),
    equipment: parseEquipment(safeText, lowerText, trainingMode)
  };
}
