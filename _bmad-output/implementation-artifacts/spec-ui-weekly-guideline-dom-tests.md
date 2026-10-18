---
title: 'DOM/jsdom test coverage for ui.js weekly-guideline wiring'
type: 'chore'
created: '2026-10-18'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `src/app/ui.js` has no test coverage at all — the project has no DOM/jsdom test environment, so vitest's default `node` environment cannot exercise it. The weekly-guideline feature's two user-visible wiring points, the badge render in `renderProgress` and the log form's intensity capture (`log-intensity` -> `logWorkout`), could silently break (e.g. an inverted badge boolean, or the field read drifting from the form's id) without any test failing.

**Approach:** Add `jsdom` as a devDependency and a `// @vitest-environment jsdom` per-file pragma on a new `tests/ui.test.js`, scoped narrowly to this project's zero-config vitest setup (no global `vitest.config.js`, keeping every other test file on the `node` environment). Load the real `index.html` markup into `document.documentElement.innerHTML` before each dynamic import of `ui.js` (via `vi.resetModules()` + `await import(...)`, since `ui.js` wires its DOM listeners and renders at module-load time, not inside an exported function), so the test exercises the actual element ids instead of a hand-maintained fixture that could drift from them. Cover exactly the two surfaces named above.

</frozen-after-approval>

## Implementation Notes

- Added `jsdom` (installed via `npm install -D jsdom`, resolved to 30.1.3) as the only new dependency; `npm audit --omit=dev` still reports 0 vulnerabilities, so jsdom introduced none (the pre-existing advisories are all in the vite/vitest/esbuild dev toolchain, unrelated to this change).
- `tests/ui.test.js` sets `document.body.innerHTML` to `index.html`'s `<body>` markup (with the `<script>` tag stripped, since the test imports `ui.js` directly) rather than `document.documentElement.innerHTML` as the Approach paragraph phrased it — same effect, simpler regex.
- **Environment surprise, worked around in-file:** this Node version (26.7.0) ships its own experimental, flag-gated `localStorage` global, and the installed vitest (2.1.9)'s jsdom-environment bridge has a hardcoded key allowlist that predates that Node global and skips re-exporting jsdom's working `localStorage` over it (confirmed by reading `node_modules/vitest/dist/chunks/index.K90BXFOx.js`'s `populateGlobal`/`KEYS`). Left unaddressed, every `globalThis.localStorage` call in the app (`trainingLog.js`, `userProfile.js`) silently no-ops under this toolchain combination. Added a minimal in-memory `Storage` polyfill at the top of `tests/ui.test.js`, installed via `Object.defineProperty(globalThis, 'localStorage', ...)` (Node's own descriptor for it is `configurable: true`, so this is safe). Scoped to this one test file only — did not touch `vitest`/Node versions or add a project-wide polyfill, since no other test file touches storage.
- `ui.js` wires its DOM listeners and does its first render as side effects of module evaluation (not inside an exported init function), so each test does `vi.resetModules()` + a fresh markup fixture + dynamic `import('../src/app/ui.js')` to get an isolated instance per test.
- Verified the badge tests actually catch a regression, not just happening to pass: temporarily inverted the `isFullScore` ternary in `renderProgress` and confirmed both new badge tests failed with the expected before/after text, then reverted via `git checkout -- src/app/ui.js`.
- `supabase` (from `supabaseClient.js`) resolves to `null` in this test environment (no `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY`), so `ui.js`'s `if (!supabase)` branch runs synchronously at import with no network calls -- no Supabase mocking was needed for these two surfaces.
- Did not add coverage for any other `ui.js` wiring (suggestion rendering, next-weight, account forms) -- out of scope per this spec's Intent, which names exactly the badge render and the log-form intensity capture.
- Review loop 1 (blind-hunter) found the test suite was not actually hermetic against a developer's own `.env.local`: added `vi.mock('../src/features/supabaseClient.js', () => ({ supabase: null }))` so the suite can't construct a live Supabase client and hit the network regardless of local env configuration.
- Review loop 1: fixed a timezone bug in `currentIsoWeekDates()` -- it built date strings via `.toISOString().slice(0, 10)` (UTC), which would shift to the wrong calendar day for part of the night in any timezone ahead of UTC (reproduced with `TZ=Europe/Oslo`). Replaced with a local-getter `toLocalDateString()` helper, matching the same convention `getISOWeekStart` in `activityGuidelines.js` already uses for this exact reason.
- Review loop 1: hardened the `index.html` body-extraction regex to tolerate `<body>` attributes and throw a clear error on no match, and made the script-tag strip global (`gi`) instead of first-match-only.
- Review loop 1: renamed the "defaults ... when left unchanged" test to "persists the log form's HTML-selected default intensity" -- its assertion only confirms the HTML default matches, not that the JS `|| 'medium'` fallback itself executes (a `<select>` can't return a falsy `FormData` value while an option is marked `selected`), so the original name overclaimed what it verifies.

## Review Triage Log

- **medium, patch** — `tests/ui.test.js` was not hermetic: on a machine with a real `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local` (plausible per `docs/supabase-setup.md`), `ui.js`'s module-scope `supabase` would resolve to a live client and the suite would call `auth.getSession()`/`auth.onAuthStateChange()` over the network. Verified by reviewer reproduction (dropping a `.env.local` produced "Multiple GoTrueClient instances detected" warnings). Fixed with a `vi.mock` forcing `supabase: null` unconditionally.
- **medium, patch** — `currentIsoWeekDates()`'s `.toISOString().slice(0, 10)` converts to UTC, so for part of the night in any timezone ahead of UTC (e.g. 00:00-01:00/02:00 in Norway) it returns the previous calendar day, misaligning the test's seeded dates with the ISO week `getWeeklyGuidelineStatus` computes from the same real clock using local-day anchoring. Verified by reviewer reproduction with `TZ=Europe/Oslo`. Fixed with a local-getter date-string helper matching `getISOWeekStart`'s existing convention.
- **low, patch** — The "defaults intensity when left unchanged" test's name overclaimed what it checks: a `<select>` with a `selected` option can never make `FormData.get()` return falsy, so the test never actually exercises `ui.js`'s `|| 'medium'` fallback, only the HTML default. Renamed to describe what it actually verifies; left the `|| 'medium'` fallback itself untouched (pre-existing code, not part of this spec's scope).
- **low, patch** — The `index.html` body-extraction regex assumed an attribute-free `<body>` tag and exactly one `<script>` tag, with no diagnostic on a no-match. Widened to `<body[^>]*>`, added an explicit error on no match, and made the script-strip global.
- **low, rejected** — `MemoryStorage` polyfill implements only `getItem`/`setItem`/`removeItem`/`clear`, omitting `.length`/`.key()`. No code path exercised by this app or these tests (`trainingLog.js`, `userProfile.js`) calls either, so there is no reachable failure to guard against.
- **defer** — No test asserts `isFullScore` for a "partial pass" (exactly one of the two rules met) at the `getWeeklyGuidelineStatus` level; every existing case in `activity-guidelines.test.js` only covers all-pass/all-fail for that combined flag. Belongs in that file, not this spec's UI-wiring tests. Logged to `deferred-work.md`.
- **defer** — `renderSuggestion`, `renderNextWeight`, the account auth/profile/recovery forms, and the equipment-panel toggle remain untested even though this spec's jsdom harness now makes that cheap. Out of this spec's named scope. Logged to `deferred-work.md`.

