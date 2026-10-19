---
title: 'Auto-generated weekly training plan'
type: 'feature'
created: '2026-10-19'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
context: []
baseline_commit: 'af127463c6e8bf19c355c6ff2467b27042253f30'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** SmartØkt only suggests one workout at a time (`getWorkoutSuggestion`). `docs/mvp-status.md` names "ukeplanlegging" (weekly planning) as the next feature once the catalog and single-session recommendations are reliable — both now true — but never defines what it means.

**Approach:** Add a new "Ukeplan" section that generates a full week's schedule from the user's existing time/energy/level/equipment inputs: the user enters how many days they want to train this week; the app spreads that many training days evenly across Mon-Sun, assigns each a focus via a fixed rotation (styrke, kondisjon, generell, repeating), and calls the existing `getWorkoutSuggestion` once per day — extended with an exclusion list so a day's plan prefers exercises not already used earlier in the same week's plan, falling back to reuse only when a movement-pattern slot has no unused alternative. The generated plan persists to `localStorage` (keyed like `trainingLog.js`'s history) so it survives a reload until regenerated.

**Human decisions (2026-10-19):**
1. Day input: a day-count only (e.g. "3 days"), not specific weekdays or a fixed pattern.
2. Focus assignment: a simple fixed rotation, not a user-chosen distribution or per-day manual picking.
3. Repeat-day variety: the engine should actively avoid exact repeats within a week, not just call the suggestion engine unchanged per day.
4. Persistence: the plan should survive a reload.
5. **Scope split (this agent's call, not yet confirmed with the human — flag at checkpoint):** Supabase-sync for signed-in users (mentioned as a nice-to-have alongside persistence) is split into its own deferred-work.md entry. This spec covers local generation, display, and `localStorage` persistence only — matching this codebase's own precedent (history and the user profile were local-only features first; Supabase sync was added later as its own commit). Keeping sync out lets this spec stay reviewable as one cohesive unit; sync is independently shippable on top of it later.

## Boundaries & Constraints

**Always:**
- Reuse `getWorkoutSuggestion` per planned day — do not build a parallel exercise-selection mechanism.
- Day spread formula for `N` training days (1-7): for `i` in `0..N-1`, `isoWeekday = round((i + 0.5) * 7 / N)` (1=Mon..7=Sun), clamped to `[1,7]`. This produces `N` distinct, evenly-spread weekdays for every `N` in 1-7 (verified by hand for all 7 cases during planning).
- Focus rotation per assigned training day, 0-indexed by position in the week (not by weekday number): `['styrke', 'kondisjon', 'generell'][i % 3]` -- i.e. day 0=styrke, 1=kondisjon, 2=generell, 3=styrke, 4=kondisjon, 5=generell, repeating.
- Exclusion: accumulate `exerciseDetails[].id` from each day's suggestion into a running set; pass it to the next day's `getWorkoutSuggestion` call so it prefers unused exercises. When a movement-pattern slot (or, for kondisjon/generell, any slot) has no unused candidate left, reuse is allowed for that slot only — never return fewer exercises than the existing single-session logic would for the same inputs.
- Persist the generated plan to `localStorage` only, under a new key mirroring `trainingLog.js`'s pattern (not reusing `STORAGE_KEY`). Guest and signed-in users both get this local persistence; no Supabase table/column is added in this spec.
- The existing single-session suggestion form, its result cards, and `recommendationEngine.js`'s public behavior for existing callers (no `excludeExerciseIds` argument) are unchanged — the new parameter must default to an empty exclusion so current call sites behave identically.

**Never:**
- Do not add a Supabase table, column, or sync call for the weekly plan — deferred (see Intent).
- Do not change the exercise catalog's data or add new exercises to cover variety -- work within the existing 27-exercise catalog, accepting that small modes/focuses (e.g. home-bodyweight has 7 styrke exercises total) will legitimately reuse exercises within a week once the pool is exhausted.
- Do not change `activityGuidelines.js` or couple the weekly plan's day/focus assignment to guideline compliance (e.g. forcing ≥2 styrke days) -- that coupling is out of scope here.
- Do not remove or replace the existing single-session suggestion workflow -- the weekly plan is an additional section.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Typical 3-day week | `trainingDays: 3`, home-dumbbell, intermediate | 3 days assigned (Mon/Thu/Sat per the spread formula), focuses styrke/kondisjon/generell | N/A |
| Full week | `trainingDays: 7` | All 7 weekdays assigned, rotation continues through generell/styrke/kondisjon twice | N/A |
| Single day | `trainingDays: 1` | 1 day assigned (Thursday per the formula), focus styrke (day 0) | N/A |
| Invalid day count | `trainingDays` is `0`, negative, non-numeric, or > 7 | Clamp to the nearest valid value in `[1,7]`; never throw | Clamp silently |
| Exclusion pool exhausted | home-bodyweight + styrke on 3+ days (only 7 total styrke exercises available in that mode) | Later days reuse previously-used exercises rather than returning an empty/short list | N/A |
| No equipment selected (custom mode) | `trainingMode: 'custom'`, `availableEquipment: []` | That day's entry carries `getWorkoutSuggestion`'s existing "no suitable exercises" result; other days are unaffected | N/A |
| No persisted plan yet | First visit, `localStorage` has no weekly-plan key | Ukeplan section shows an empty/prompt state, not an error | N/A |
| Regenerate | User changes `trainingDays` and generates again | New plan overwrites the old one in storage and in the UI | N/A |

</frozen-after-approval>

## Code Map

- `src/features/recommendationEngine.js:58` -- `getWorkoutSuggestion({..., excludeExerciseIds = []})`: thread the new param through; when building `prioritizedExercises`/`selectedExercises`, prefer candidates whose `id` is not in `excludeExerciseIds`, falling back to the existing unfiltered candidate for a slot only when every candidate for that slot is excluded. Keep all existing sorting/dedup logic (`easeScore`, movement-pattern dedup) operating on the preferred (unexcluded) subset first.
- New `src/features/weeklyPlan.js` -- exports `getWeeklyPlan({ trainingDays, time, energy, level, trainingMode, availableEquipment, history })`: clamps `trainingDays` to `[1,7]`, computes assigned ISO weekdays via the spread formula, assigns focus via the rotation formula, loops calling `getWorkoutSuggestion` with an accumulating `excludeExerciseIds` set, returns `{ days: [{ isoWeekday, focus, suggestion }], generatedAt }`. Also exports `WEEKLY_PLAN_STORAGE_KEY`, `readStoredWeeklyPlan(storageKey, storage)`, `writeStoredWeeklyPlan(plan, storageKey, storage)` mirroring `trainingLog.js:102-119`'s exact try/catch-around-`globalThis.localStorage` pattern.
- `index.html` -- new card/section (placed after the existing `#log-section`, matching the page's card styling): a number input for `trainingDays` (min 1, max 7), a "Generer ukeplan" submit button, and a render container (e.g. `#weekly-plan-list`) for the 7 day rows.
- `src/app/ui.js` -- new DOM refs for the above; a submit handler that calls `getWeeklyPlan` with the same `time`/`energy`/`level`/`trainingMode`/`availableEquipment` values already read elsewhere in this file, writes the result via `writeStoredWeeklyPlan`, and renders it; a `renderWeeklyPlan(plan)` function (rest days rendered as a simple "Hviledag" label, training days showing focus + exercise list reusing the existing suggestion-exercise rendering convention); load any persisted plan at module-load time (mirroring `workoutHistory = readStoredHistory()`) and render it immediately if present.
- `tests/weekly-plan.test.js` (new) -- cover the I/O matrix: day-spread formula for `trainingDays` 1-7, focus rotation sequence, exclusion/fallback-reuse behavior, and the invalid-day-count clamp.
- `tests/recommendation-engine.test.js` -- extend with cases for the new `excludeExerciseIds` param: a call with no exclusions behaves exactly as before (regression guard), and a call with exclusions prefers unexcluded candidates while still returning a full-length result when the pool is exhausted.

## Tasks & Acceptance

**Execution:**
- [x] `src/features/recommendationEngine.js` -- add `excludeExerciseIds` param with the preferred-then-fallback selection behavior
- [x] `src/features/weeklyPlan.js` -- new module: day spread, focus rotation, per-day generation loop, `localStorage` persistence helpers
- [x] `index.html` -- new Ukeplan card: day-count input, generate button, render container
- [x] `src/app/ui.js` -- wiring: generate handler, render function, load-persisted-plan-on-start
- [x] `tests/weekly-plan.test.js` -- new, covering the I/O matrix
- [x] `tests/recommendation-engine.test.js` -- extended for `excludeExerciseIds`

**Acceptance Criteria:**
- Given `trainingDays: 4` and no prior plan, when the user generates a plan, then exactly 4 distinct weekdays are shown with a focus each, following the rotation, and the rest are shown as rest days.
- Given a generated plan, when the page is reloaded without regenerating, then the same plan renders from `localStorage`.
- Given a 3+ day week with a small exercise pool for the selected mode/focus, when the plan is generated, then every day still shows a non-empty exercise list (reuse, not an empty result) where the single-session engine would have returned one.
- Given an existing call to `getWorkoutSuggestion` with no `excludeExerciseIds` argument, when it runs, then its output is unchanged from before this spec (regression guard via the extended existing test file).

## Implementation Notes

- Implementation subagent flagged a real arithmetic bug in this spec's own frozen Boundaries before writing any code against it: the literal formula `['styrke','kondisjon','generell'][i % 3 === 2 ? 2 : i % 2]` only matches its own prose illustration for `i` in `{0,1,2}` and diverges at `i=3,4` (producing kondisjon,styrke there instead of the stated styrke,kondisjon). The subagent correctly implemented the literal formula as written (per "the spec is the sole source of truth") and surfaced the discrepancy rather than guessing, instead of silently picking one reading. Corrected directly (not a human loopback -- the prose illustration is unambiguous and matches a dead-simple `i % 3` cycle, the exactly-one-possible-reading exception to the intent_gap route) -- see Spec Change Log.
- `getAssignedWeekdays`, `getWeeklyPlan`'s exclusion-accumulation loop, and the `localStorage` helpers all match the Code Map exactly as specified -- verified by reading the diff directly, not just the subagent's report.
- `recommendationEngine.js`'s exclusion logic uses two different strategies depending on focus: `selectUniqueMovementPatterns` for styrke (preserves the existing one-per-movement-pattern dedup, now exclusion-aware) and a simpler slice-based `selectWithExclusionFallback` for kondisjon/generell (which never had movement-pattern dedup to begin with). Both guarantee the result is never shorter than the unfiltered call would have produced.
- The existing suggestion-exercise rendering markup in `ui.js` was extracted into shared helpers (`getDisplayExerciseDetails`/`renderExerciseListItems`) so the new weekly view could reuse it instead of duplicating markup -- a pure refactor verified to not change the single-session card's existing rendered output (covered by the pre-existing `tests/ui.test.js` cases, which still pass unmodified).
- Review loop 1 found a second, independent drafting slip in this spec (not the formula, the Intent prose): the Approach paragraph's informal rotation description read "styrke, kondisjon, styrke, generell, repeating" -- a garbled 4-term list that never matched the Boundaries' precise (and correctly implemented/tested) 3-term cycle. Corrected in-place for the same reason as the formula fix -- the Boundaries' formula was already independently verified correct, leaving exactly one sensible reading.
- Review loop 1 also found the frozen-tag markup itself was malformed: a stray, unmatched `</frozen-after-approval>` closing tag appeared right after the Intent's "Human decisions" list, with no second opening tag before Boundaries -- meaning Boundaries and the I/O matrix were technically outside the frozen wrapper despite this spec's own Implementation Notes describing the formula fix as a correction to frozen content. Fixed by removing the stray premature closing tag so the single open/close pair now spans Intent through the I/O matrix, matching the convention used in `spec-elder-balance-strength-threshold.md`.
- Review loop 1 (verification-gap + blind-hunter, same root cause): the new `weeklyPlanForm` submit handler sourced `availableEquipment` from `userProfile.equipment` directly, unlike `updateView()`, which re-reads the live custom-equipment checkboxes before use when `trainingMode === 'custom'`. Fixed by extracting the submit handler into a `generateWeeklyPlan()` function that mirrors `updateView`'s custom-mode block exactly before calling `getWeeklyPlan`.
- Review loop 1 (blind-hunter): the weekly plan had no per-user storage keying or reload-on-session-change, unlike `workoutHistory`/`historyStorageKey` (which `applySession` already re-keys and reloads per signed-in user) -- different accounts on a shared browser would see each other's weekly plan. Fixed by adding an equivalent `weeklyPlanStorageKey`, reset/reloaded in both `applySession` branches exactly like `historyStorageKey`, with `renderWeeklyPlan` called after each reload. Added a dedicated regression test myself after noticing the implementation subagent's patch pass fixed this in code but didn't add a covering test for it specifically (unlike the other three patches) -- verified the test actually catches the regression by temporarily reverting the fix and confirming the test failed, then reverting the revert.
- Review loop 1 (blind-hunter): weekly-plan day cards omitted `duration`/`intensity`, shown in the single-session card for the same data. Added both lines to each training-day card.
- Review loop 1 (edge-case-hunter): `getAssignedWeekdays`'s non-finite-input clamp lumped `Infinity` in with `NaN`/`-Infinity`, falling back to 1 instead of clamping to the nearest valid value (7) per the spec's own I/O matrix. Fixed with an explicit `Infinity` case.

## Spec Change Log

- Fixed a bad_spec arithmetic error in the frozen Boundaries' focus-rotation formula: the literal JS expression didn't match its own prose illustration for days 3 and 4 of a week (see Implementation Notes for the exact discrepancy). Replaced `['styrke','kondisjon','generell'][i % 3 === 2 ? 2 : i % 2]` with the simpler, correct `['styrke','kondisjon','generell'][i % 3]`, which matches the prose for every `i`. Corrected in-place without a human loopback since the prose left exactly one possible reading. KEEP: the day-spread formula (`getAssignedWeekdays`), the exclusion-accumulation design, and the `localStorage` persistence helpers were all independently verified correct and unaffected by this fix.
- Review loop 1: corrected the Intent's own garbled rotation description ("styrke, kondisjon, styrke, generell") to match the Boundaries' verified-correct 3-term cycle, and fixed the frozen-tag markup so Boundaries and the I/O matrix are actually inside the frozen wrapper, consistent with how this spec's own Implementation Notes already described them. Neither change altered any requirement -- both are documentation-only corrections to match what was already correctly specified and implemented elsewhere in the same frozen block.

## Review Triage Log

- **medium, patch** — The weekly-plan generate handler used stale `userProfile.equipment` in custom-equipment mode instead of the live checkboxes, unlike the single-session flow. Independently verified by the verification-gap and blind-hunter layers (same root cause). Fixed by extracting a `generateWeeklyPlan()` function mirroring `updateView`'s existing custom-mode handling; covered by a new test that checks a specific equipment box without submitting the main form first and asserts the generated plan reflects only that equipment.
- **medium, patch** — The weekly plan had no per-user storage keying or reload on sign-in/sign-out, unlike history. Verified by reading `applySession`'s existing per-user reload pattern for `workoutHistory` and confirming the weekly plan was excluded from it -- a real cross-account data-visibility issue on a shared browser. Fixed by mirroring `historyStorageKey`'s exact pattern for a new `weeklyPlanStorageKey`. Covered by a regression test (added directly, not by the implementation subagent) verified to fail without the fix via a temporary revert-and-confirm.
- **low, patch** — Weekly-plan day cards didn't show duration/intensity, present in the equivalent single-session card for the same already-computed data. Fixed by adding both lines.
- **low, patch** — `getAssignedWeekdays` lumped `Infinity` into the same fallback as `NaN`/`-Infinity`, clamping to 1 instead of the nearest valid value (7) the spec's own I/O matrix calls for. Fixed with an explicit case; covered by two new tests.
- **false** — Claimed a persisted weekly-plan day with a missing/undefined `suggestion` field would crash `renderWeeklyPlan`. Disproven: the only writer of the weekly-plan storage key (`getWeeklyPlan`) always populates every day's `suggestion` with a full object (even the "no matching exercises" case returns a valid object with empty arrays, never `undefined`), and no other code path writes to that key -- consistent with every other `localStorage`-backed read path in this codebase (e.g. `readStoredHistory`), none of which validate the stored shape beyond JSON-parseability either.
- **false (as stated), fixed anyway as documentation** — Claimed the weekly-plan list's `innerHTML`-interpolation of `day.suggestion.reason`/`notes` was a less-safe pattern than the single-session card's `textContent` convention. Disproven as a *new* risk: this is the same unescaped-interpolation-via-`innerHTML`+`join` pattern already used throughout this file for every other list render (e.g. `progressList.innerHTML` interpolating `entry.date`/`entry.focus`/`entry.load`), and `reason`/`notes` are machine-generated from a closed set of Norwegian phrase templates in `recommendationEngine.js`, never raw user free-text -- not a deviation this diff introduced. The single-session comparison point (`suggestionNotes.textContent`) is a single fixed node outside any list-building loop, not a comparable case.
- **defer** — The deferred Supabase-sync follow-up work (already logged to `deferred-work.md`) doesn't yet address how pre-existing `localStorage`-only weekly plans would be migrated once that sync ships. Noted directly in that entry rather than raised as a separate one, since it's an addition to an already-deferred item, not new code behavior in this diff.

## Verification

**Commands:**
- `npm test` -- expected: all tests pass. Ran: all 92 tests pass (5 suites: 11 + 21 + 20 + 29 + 11).
- `npx vite build` -- expected: production build succeeds. Ran: succeeded with no errors (57 modules transformed).

