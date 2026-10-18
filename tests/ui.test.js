// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEY } from '../src/features/trainingLog.js';

// Force the module-scope `supabase` client to null regardless of the machine's
// own .env.local -- otherwise a dev with real Supabase credentials configured
// (per docs/supabase-setup.md) would have this suite construct a live client
// and hit the network via auth.getSession()/onAuthStateChange().
vi.mock('../src/features/supabaseClient.js', () => ({ supabase: null }));

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const indexHtml = readFileSync(path.join(projectRoot, 'index.html'), 'utf-8');
const bodyMatch = /<body[^>]*>([\s\S]*)<\/body>/i.exec(indexHtml);
if (!bodyMatch) {
  throw new Error('tests/ui.test.js: could not find a <body> element in index.html -- update the extraction regex');
}
const bodyMarkup = bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, '');

// Node 22+ ships its own experimental, disabled-by-default `localStorage` global,
// and vitest 2.1.x's jsdom bridge doesn't know to override it with jsdom's working
// implementation (its key list predates that Node global). Without this, every
// `globalThis.localStorage` call the app makes (trainingLog.js, userProfile.js)
// silently no-ops. Polyfill it once so this file's tests see real persistence.
class MemoryStorage {
  #store = new Map();
  getItem(key) {
    return this.#store.has(key) ? this.#store.get(key) : null;
  }
  setItem(key, value) {
    this.#store.set(key, String(value));
  }
  removeItem(key) {
    this.#store.delete(key);
  }
  clear() {
    this.#store.clear();
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: new MemoryStorage(),
  configurable: true,
  writable: true
});

// Builds date strings from local y/m/d getters, not `toISOString()` (which
// converts to UTC and would shift to the wrong calendar day for part of the
// night in any timezone ahead of UTC) -- matching the same local-anchoring
// convention `getISOWeekStart` in activityGuidelines.js already relies on.
function toLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function currentIsoWeekDates(count) {
  const today = new Date();
  const isoDayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (isoDayOfWeek - 1));

  return Array.from({ length: count }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return toLocalDateString(day);
  });
}

async function renderApp() {
  document.body.innerHTML = bodyMarkup;
  vi.resetModules();
  await import('../src/app/ui.js');
  // updateView() is declared async but, with the default (non-custom) training
  // mode, never reaches an await -- flush microtasks defensively anyway.
  await Promise.resolve();
}

describe('ui.js weekly-guideline wiring', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('badges an empty history as "Ikke godkjent uke"', async () => {
    await renderApp();

    expect(document.getElementById('weekly-guideline-badge').textContent).toBe('Ikke godkjent uke');
  });

  it('badges a week meeting both guideline rules as "Godkjent uke"', async () => {
    const [monday, tuesday] = currentIsoWeekDates(2);
    const history = [
      { id: 1, date: monday, focus: 'kondisjon', duration: 75, intensity: 'high', completed: true },
      { id: 2, date: monday, focus: 'styrke', duration: 30, intensity: 'medium', completed: true },
      { id: 3, date: tuesday, focus: 'styrke', duration: 30, intensity: 'medium', completed: true }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

    await renderApp();

    expect(document.getElementById('weekly-guideline-badge').textContent).toBe('Godkjent uke');
  });

  it('persists the log form\'s selected intensity on logWorkout, not a hardcoded value', async () => {
    await renderApp();

    document.getElementById('log-intensity').value = 'high';
    document.getElementById('workout-log-form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(persisted[persisted.length - 1].intensity).toBe('high');
  });

  it('persists the log form\'s HTML-selected default intensity ("medium") on logWorkout', async () => {
    await renderApp();

    document.getElementById('workout-log-form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(persisted[persisted.length - 1].intensity).toBe('medium');
  });
});
