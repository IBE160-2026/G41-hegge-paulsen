// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEY } from '../src/features/trainingLog.js';
import { WEEKLY_PLAN_STORAGE_KEY } from '../src/features/weeklyPlan.js';

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

describe('ui.js weekly plan wiring', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('shows an empty-state prompt, not an error, when no plan has been persisted yet', async () => {
    await renderApp();

    const items = document.querySelectorAll('#weekly-plan-list li');
    expect(items.length).toBe(1);
    expect(items[0].className).toContain('weekly-plan-empty');
  });

  it('generates and renders a plan with the requested number of distinct training days, and persists it', async () => {
    await renderApp();

    document.getElementById('weekly-plan-days').value = '4';
    document.getElementById('weekly-plan-form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );

    const trainingDayItems = document.querySelectorAll('#weekly-plan-list li.weekly-plan-day:not(.weekly-plan-rest)');
    const restDayItems = document.querySelectorAll('#weekly-plan-list li.weekly-plan-rest');
    expect(trainingDayItems.length).toBe(4);
    expect(restDayItems.length).toBe(3);

    const persisted = JSON.parse(localStorage.getItem(WEEKLY_PLAN_STORAGE_KEY));
    expect(persisted.days.length).toBe(4);
  });

  it('renders the previously persisted plan again after a reload, without regenerating', async () => {
    await renderApp();

    document.getElementById('weekly-plan-days').value = '2';
    document.getElementById('weekly-plan-form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    const persistedAfterGenerate = localStorage.getItem(WEEKLY_PLAN_STORAGE_KEY);

    await renderApp();

    const trainingDayItems = document.querySelectorAll('#weekly-plan-list li.weekly-plan-day:not(.weekly-plan-rest)');
    expect(trainingDayItems.length).toBe(2);
    expect(localStorage.getItem(WEEKLY_PLAN_STORAGE_KEY)).toBe(persistedAfterGenerate);
  });

  it('overwrites the stored plan in the UI when the day count is changed and regenerated', async () => {
    await renderApp();

    document.getElementById('weekly-plan-days').value = '1';
    document.getElementById('weekly-plan-form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    expect(document.querySelectorAll('#weekly-plan-list li.weekly-plan-day:not(.weekly-plan-rest)').length).toBe(1);

    document.getElementById('weekly-plan-days').value = '6';
    document.getElementById('weekly-plan-form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );

    expect(document.querySelectorAll('#weekly-plan-list li.weekly-plan-day:not(.weekly-plan-rest)').length).toBe(6);
    expect(JSON.parse(localStorage.getItem(WEEKLY_PLAN_STORAGE_KEY)).days.length).toBe(6);
  });

  it('reads live custom-equipment checkbox state, not stale userProfile, when generating without first submitting #workout-form', async () => {
    await renderApp();

    document.getElementById('training-mode').value = 'custom';
    document.getElementById('training-mode').dispatchEvent(new Event('change', { bubbles: true }));
    document.querySelectorAll('input[name="profile-equipment"]').forEach((input) => {
      input.checked = input.value === 'kettlebell';
    });

    document.getElementById('weekly-plan-days').value = '1';
    document.getElementById('weekly-plan-form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    await Promise.resolve();

    const plan = JSON.parse(localStorage.getItem(WEEKLY_PLAN_STORAGE_KEY));
    expect(plan.days.length).toBe(1);
    expect(plan.days[0].suggestion.availableEquipment).toEqual(['kettlebell']);
    expect(plan.days[0].suggestion.exerciseDetails.length).toBeGreaterThan(0);
    expect(plan.days[0].suggestion.exerciseDetails.every(
      (exercise) => exercise.equipment.every((item) => item === 'kettlebell')
    )).toBe(true);
  });
});

describe('ui.js elder (65+) weekly-guideline wiring (signed-in session)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    // Restore the file-wide defaults so later tests (and re-imports) don't
    // keep this test's signed-in Supabase client/profile mocks.
    vi.doMock('../src/features/supabaseClient.js', () => ({ supabase: null }));
    vi.doUnmock('../src/features/supabaseAccount.js');
  });

  it('badges a signed-in elder user\'s styrke+balanse week as "Godkjent uke"', async () => {
    const [monday, tuesday] = currentIsoWeekDates(2);
    const history = [
      { id: 1, date: monday, focus: 'styrke', duration: 80, intensity: 'medium', completed: true },
      { id: 2, date: tuesday, focus: 'balanse', duration: 80, intensity: 'medium', completed: true }
    ];
    localStorage.setItem(`${STORAGE_KEY}:user-1`, JSON.stringify(history));

    vi.doMock('../src/features/supabaseClient.js', () => ({
      supabase: {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { user: { id: 'user-1', email: 'a@b.no' } } },
            error: null
          }),
          onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe() {} } } }))
        }
      }
    }));

    vi.doMock('../src/features/supabaseAccount.js', async () => {
      const actual = await vi.importActual('../src/features/supabaseAccount.js');
      return {
        ...actual,
        loadProfile: vi.fn().mockResolvedValue({
          username: 'elder_user',
          age: 70,
          body_weight_kg: 70,
          equipment: ['bodyweight']
        })
      };
    });

    await renderApp();

    await vi.waitFor(() => {
      expect(document.getElementById('weekly-guideline-badge').textContent).toBe('Godkjent uke');
    });
  });

  it('loads the signed-in user\'s own weekly plan on sign-in, not the guest plan already in storage', async () => {
    const guestPlan = {
      days: [{ isoWeekday: 1, focus: 'styrke', suggestion: { title: 'Guest', exercises: [], exerciseDetails: [], duration: 30, intensity: 'low', reason: 'marker-guest-plan' } }],
      generatedAt: '2026-01-01T00:00:00.000Z'
    };
    const userPlan = {
      days: [{ isoWeekday: 2, focus: 'kondisjon', suggestion: { title: 'User', exercises: [], exerciseDetails: [], duration: 20, intensity: 'medium', reason: 'marker-user1-plan' } }],
      generatedAt: '2026-01-02T00:00:00.000Z'
    };

    localStorage.setItem(WEEKLY_PLAN_STORAGE_KEY, JSON.stringify(guestPlan));
    localStorage.setItem(`${WEEKLY_PLAN_STORAGE_KEY}:user-1`, JSON.stringify(userPlan));

    vi.doMock('../src/features/supabaseClient.js', () => ({
      supabase: {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { user: { id: 'user-1', email: 'a@b.no' } } },
            error: null
          }),
          onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe() {} } } }))
        }
      }
    }));

    vi.doMock('../src/features/supabaseAccount.js', async () => {
      const actual = await vi.importActual('../src/features/supabaseAccount.js');
      return {
        ...actual,
        loadProfile: vi.fn().mockResolvedValue({
          username: 'user_one',
          age: 40,
          body_weight_kg: 80,
          equipment: ['bodyweight']
        })
      };
    });

    await renderApp();

    await vi.waitFor(() => {
      expect(document.getElementById('weekly-plan-list').textContent).toContain('marker-user1-plan');
    });
    expect(document.getElementById('weekly-plan-list').textContent).not.toContain('marker-guest-plan');
  });
});
