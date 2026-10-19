// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEY } from '../src/features/trainingLog.js';
import { WEEKLY_PLAN_STORAGE_KEY } from '../src/features/weeklyPlan.js';

const SUGGESTION_STORAGE_KEY = 'smartokt-current-suggestion';

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

  it('persists a plan with the requested number of distinct training days when #weekly-plan-form is submitted', async () => {
    await renderApp();

    document.getElementById('weekly-plan-days').value = '4';
    document.getElementById('weekly-plan-form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );

    const persisted = JSON.parse(localStorage.getItem(WEEKLY_PLAN_STORAGE_KEY));
    expect(persisted.days.length).toBe(4);
    expect(new Set(persisted.days.map((day) => day.isoWeekday)).size).toBe(4);
  });

  it('renders the persisted plan on the suggestion page (?view=forslag), not inline on the landing page', async () => {
    await renderApp();

    document.getElementById('weekly-plan-days').value = '2';
    document.getElementById('weekly-plan-form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );

    window.history.pushState({}, '', '/?view=forslag');
    await renderApp();

    const trainingDayItems = document.querySelectorAll('#weekly-plan-list li.weekly-plan-day:not(.weekly-plan-rest)');
    expect(trainingDayItems.length).toBe(2);
  });

  it('overwrites the stored plan when the day count is changed and regenerated', async () => {
    await renderApp();

    document.getElementById('weekly-plan-days').value = '1';
    document.getElementById('weekly-plan-form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    expect(JSON.parse(localStorage.getItem(WEEKLY_PLAN_STORAGE_KEY)).days.length).toBe(1);

    document.getElementById('weekly-plan-days').value = '6';
    document.getElementById('weekly-plan-form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );

    expect(JSON.parse(localStorage.getItem(WEEKLY_PLAN_STORAGE_KEY)).days.length).toBe(6);
  });

  it('uses a day-override row\'s own trainingMode and level, not the main menu\'s', async () => {
    await renderApp();

    // Set the main menu to different values than the day-override row, to
    // prove the weekly-plan path reads the row's own fields.
    document.getElementById('training-mode').value = 'gym';
    document.getElementById('level').value = 'advanced';

    document.getElementById('weekly-plan-days').value = '1';
    document.getElementById('weekly-plan-days').dispatchEvent(new Event('change', { bubbles: true }));
    document.querySelector('.weekly-plan-day-training-mode[data-day-index="0"]').value = 'home-kettlebell';
    document.querySelector('.weekly-plan-day-level[data-day-index="0"]').value = 'beginner';

    document.getElementById('weekly-plan-form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );

    const plan = JSON.parse(localStorage.getItem(WEEKLY_PLAN_STORAGE_KEY));
    expect(plan.days[0].suggestion.availableEquipment).toEqual(['kettlebell', 'bodyweight']);
  });

  it('generates and persists a weekly plan from free text via #weekly-plan-chat-form', async () => {
    await renderApp();

    document.getElementById('weekly-plan-chat-text').value = 'tre økter denne uken, hjemme med manualer, nybegynner';
    document.getElementById('weekly-plan-chat-form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );

    const plan = JSON.parse(localStorage.getItem(WEEKLY_PLAN_STORAGE_KEY));
    expect(plan.days.length).toBe(3);
    expect(plan.days.every((day) => day.suggestion.availableEquipment.includes('dumbbell'))).toBe(true);
  });

  it('never reads or writes the menu form\'s equipment/profile fields when the weekly-plan chat form is submitted', async () => {
    await renderApp();

    document.getElementById('weekly-plan-chat-text').value = 'egendefinert med kettlebell';
    document.getElementById('weekly-plan-chat-form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );

    expect(localStorage.getItem('smartokt-user-profile')).toBeNull();
    const plan = JSON.parse(localStorage.getItem(WEEKLY_PLAN_STORAGE_KEY));
    expect(plan.days[0].suggestion.availableEquipment).toEqual(['kettlebell']);
  });

  it('renders one day-override row per day at load, matching the dropdown\'s default day count', async () => {
    await renderApp();

    const rows = document.querySelectorAll('#weekly-plan-day-overrides .weekly-plan-day-override:not(.weekly-plan-day-override-header)');
    expect(rows.length).toBe(3);
  });

  it('rebuilds the day-override rows when the day-count dropdown changes', async () => {
    await renderApp();

    document.getElementById('weekly-plan-days').value = '5';
    document.getElementById('weekly-plan-days').dispatchEvent(new Event('change', { bubbles: true }));

    const rows = document.querySelectorAll('#weekly-plan-day-overrides .weekly-plan-day-override:not(.weekly-plan-day-override-header)');
    expect(rows.length).toBe(5);
  });

  it('includes exactly one column-header row above the per-day override rows', async () => {
    await renderApp();

    expect(document.querySelectorAll('#weekly-plan-day-overrides .weekly-plan-day-override-header').length).toBe(1);
  });

  it('uses a day-override row\'s own trainingMode/level instead of the main menu\'s when #weekly-plan-form is submitted', async () => {
    await renderApp();

    document.querySelector('.weekly-plan-day-training-mode[data-day-index="0"]').value = 'gym';
    document.querySelector('.weekly-plan-day-level[data-day-index="0"]').value = 'advanced';

    document.getElementById('weekly-plan-form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );

    const plan = JSON.parse(localStorage.getItem(WEEKLY_PLAN_STORAGE_KEY));
    // Gym mode's equipment-preference list is much longer than the
    // 2-item home-dumbbell default -- a clear signal the row's own
    // trainingMode was used, not the main menu's.
    expect(plan.days[0].suggestion.availableEquipment.length).toBeGreaterThan(2);
  });

  it('uses a day-override row\'s focus instead of the automatic rotation when #weekly-plan-form is submitted', async () => {
    await renderApp();

    const firstDayFocusSelect = document.querySelector('#weekly-plan-day-overrides .weekly-plan-day-focus[data-day-index="0"]');
    firstDayFocusSelect.value = 'kondisjon';

    document.getElementById('weekly-plan-form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );

    const plan = JSON.parse(localStorage.getItem(WEEKLY_PLAN_STORAGE_KEY));
    // Day 0's automatic rotation value would be 'styrke' -- the override row
    // changes it to 'kondisjon'.
    expect(plan.days[0].focus).toBe('kondisjon');
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

describe('ui.js chat input and suggestion-page wiring', () => {
  const realLocation = window.location;

  // jsdom's real `location.href` setter is a no-op (it only logs a "Not
  // implemented: navigation" warning) and never actually updates
  // `location.href`, so asserting the navigation itself requires a stub that
  // does record the assignment. Scoped to individual tests (not every test in
  // this block needs it) and restored in afterEach so the other tests here,
  // which rely on real `window.history.pushState`-driven `location.search`,
  // keep working.
  function stubLocationHref() {
    Object.defineProperty(window, 'location', {
      value: { href: '', search: realLocation.search },
      writable: true,
      configurable: true
    });
  }

  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    localStorage.clear();
    Object.defineProperty(window, 'location', { value: realLocation, writable: true, configurable: true });
    window.history.pushState({}, '', '/');
    // Restore the file-wide defaults so later tests (and re-imports) don't
    // keep a signed-in Supabase client/profile mock from this block's tests.
    vi.doMock('../src/features/supabaseClient.js', () => ({ supabase: null }));
    vi.doUnmock('../src/features/supabaseAccount.js');
  });

  it('keeps the persisted suggestion on ?view=forslag even after a signed-in session resolves asynchronously', async () => {
    const persistedSuggestion = {
      title: 'Persistert testøkt',
      exercises: [],
      exerciseDetails: [],
      duration: 42,
      intensity: 'medium',
      reason: 'marker-persisted-suggestion'
    };
    localStorage.setItem(SUGGESTION_STORAGE_KEY, JSON.stringify(persistedSuggestion));

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
          username: 'signed_in_user',
          age: 40,
          body_weight_kg: 80,
          equipment: ['bodyweight']
        })
      };
    });

    window.history.pushState({}, '', '/?view=forslag');
    await renderApp();

    // Give applySession()'s async getSession()/loadProfile() chain -- and the
    // void updateView() calls it triggers -- a chance to resolve and (if the
    // guard regresses) clobber the persisted suggestion.
    await vi.waitFor(() => {
      expect(document.getElementById('account-status').textContent).toContain('Innlogget');
    });

    expect(document.getElementById('suggestion-title').textContent).toBe('Persistert testøkt');
  });

  it('persists the computed suggestion and navigates to ?view=forslag when #workout-form is submitted', async () => {
    await renderApp();
    stubLocationHref();

    document.getElementById('workout-form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    await Promise.resolve();

    const persisted = JSON.parse(localStorage.getItem(SUGGESTION_STORAGE_KEY));
    expect(persisted.title).toBe('Styrkeøkt');
    expect(persisted.exerciseDetails.length).toBeGreaterThan(0);
    expect(window.location.href).toBe('?view=forslag');
  });

  it('parses free text from #chat-form, persists the equivalent suggestion, and navigates to ?view=forslag', async () => {
    await renderApp();
    stubLocationHref();

    document.getElementById('chat-text').value = '20 min kondisjon i senteret';
    document.getElementById('chat-form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    await Promise.resolve();

    const persisted = JSON.parse(localStorage.getItem(SUGGESTION_STORAGE_KEY));
    expect(persisted.title).toBe('Kondisjonsøkt');
    expect(persisted.duration).toBe(20);
    expect(window.location.href).toBe('?view=forslag');
  });

  it('never reads or writes the menu form\'s equipment/profile fields when the chat form is submitted', async () => {
    await renderApp();

    document.getElementById('chat-text').value = 'egendefinert med kettlebell';
    document.getElementById('chat-form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    await Promise.resolve();

    expect(localStorage.getItem('smartokt-user-profile')).toBeNull();
    const persisted = JSON.parse(localStorage.getItem(SUGGESTION_STORAGE_KEY));
    expect(persisted.availableEquipment).toEqual(['kettlebell']);
  });

  it('renders the persisted suggestion on a direct ?view=forslag visit, identical to its generated form', async () => {
    await renderApp();

    document.getElementById('workout-form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    await Promise.resolve();
    const persisted = JSON.parse(localStorage.getItem(SUGGESTION_STORAGE_KEY));

    window.history.pushState({}, '', '/?view=forslag');
    await renderApp();

    expect(document.getElementById('suggestion-title').textContent).toBe(persisted.title);
    expect(document.body.classList.contains('suggestion-page')).toBe(true);
  });

  it('shows an empty/prompt state, not an error, on a bare ?view=forslag visit with nothing persisted', async () => {
    window.history.pushState({}, '', '/?view=forslag');
    await renderApp();

    expect(document.getElementById('suggestion-title').textContent).not.toBe('Laster...');
    expect(document.getElementById('suggestion-exercises').children.length).toBe(0);
  });

  it('shows "Tilbake til økt" with href="/" on the suggestion page, like the account page', async () => {
    window.history.pushState({}, '', '/?view=forslag');
    await renderApp();

    const nav = document.getElementById('account-navigation');
    expect(nav.textContent).toBe('Tilbake til økt');
    expect(nav.getAttribute('href')).toBe('/');
  });
});
