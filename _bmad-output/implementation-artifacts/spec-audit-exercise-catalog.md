---
title: 'Audit exercise catalog: fix category/equipment and muscle-tag mislabels'
type: 'bugfix'
created: '2026-10-18'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** In `src/data/exerciseCatalog.js`, `squat` and `lunges` are zero-equipment movements (`equipment: ['bodyweight']`) but are tagged `category: 'strength'` instead of `'bodyweight'`. `category` is read in exactly one place (`recommendationEngine.js`'s short-time/low-energy bodyweight-priority sort), so these two exercises are wrongly skipped when the app should prioritize equipment-free moves. Separately, the `muscles` tag (rendered verbatim as "muscle" chips in the UI) for `rowing` and `cycling` includes non-muscle entries ("Kondisjon", "Cardio"). A related test asserts the substring `'air squat'`, which never appears in the rendered label for `air-squat` (whose English name is "Supported Mini Squat"), so that half of the assertion never actually exercises the branch it claims to cover.

**Approach:** Add `category: 'bodyweight'` to the `squat` and `lunges` entries in the `exerciseAttributes` override map (not the shared `baseExerciseData` literal, since equipment-based variants such as `barbell-squat` and `step-up` inherit their base's `category` by spreading `baseExerciseData` directly and must keep `'strength'`). Replace the non-muscle entries in `rowing` and `cycling`'s `muscles` arrays with actual worked muscles. Fix the test assertion to check a substring that genuinely appears in `air-squat`'s rendered label.

</frozen-after-approval>

## Implementation Notes

- Added `category: 'bodyweight'` to `exerciseAttributes.squat` and `exerciseAttributes.lunges` in `src/data/exerciseCatalog.js`. Deliberately placed in the override map (merged into `baseExercisesWithAttributes`), not the shared `baseExerciseData` literal — `createVariant` reads `category` straight off `baseExerciseData`, so editing the literal would have also flipped `category` on `barbell-squat`, `dumbbell-goblet-squat`, `kettlebell-goblet-squat`, `leg-press`, and `step-up`, which correctly need equipment and must keep `category: 'strength'`.
- Replaced non-muscle entries in `rowing` (`'Kondisjon'` → `'Skuldre'`) and `cycling` (`'Kondisjon'`, `'Cardio'` → `'Gluteus'`, `'Legger'`) `muscles` arrays — this field renders as "muscle" chips in the UI (`src/app/ui.js:317`), so training-system labels there were misleading.
- Fixed `tests/recommendation-engine.test.js`'s "prefers bodyweight strength moves" assertion: it OR-checked for `'air squat'`, a substring that never appears in `air-squat`'s rendered label (English name is "Supported Mini Squat"), so that half of the check was dead. Replaced with `'mini-knebøy'`, which matches the exercise's actual Norwegian name.
- Ran `npm test` before and after: 35/35 passing both times.
- Did not touch: Norwegian instruction-text phrasing (e.g. "Høyne vekten" in the deadlift instructions reads awkwardly but is a style call, not a correctness bug); source-verification coverage in `docs/exercise-sources.md` (unchanged — still only NHS-backed for air-squat/wall-push-up); adding new exercises or training-mode coverage (e.g. no home vertical-pull alternative to `pull-up`) — out of scope per `docs/mvp-status.md`'s explicit "avoid expanding scope" guidance during this review pass.
- Blind-hunter review (see Review Triage Log) found a real regression the `category` fix introduced, plus a same-pattern gap it missed. Both patched in this cycle: `recommendationEngine.js`'s bodyweight-priority sort now orders by an `easeScore` (level + difficulty) so the gentler variant wins a movement-pattern slot instead of whichever appears first positionally; `step-up` (a `lunges` variant, also pure bodyweight) now carries its own `category: 'bodyweight'` override, matching `wall-push-up`/`plank`. Added a regression test and extended the muscle-list test to cover the new `rowing`/`cycling` values. Re-ran `npm test` after patching: 36/36 passing.

## Review Triage Log

- **patch (high)** — `category: 'bodyweight'` on `squat`/`lunges` caused `squat` to beat its purpose-built easier variant `air-squat` (and `lunges` to beat `step-up`) for the same `movementPattern` slot in the short-time/low-energy branch, because the dedup kept first-occurrence-by-array-order with no difficulty/level awareness. Verified by exercising `getWorkoutSuggestion` with `time:15, energy:'low'`. Fixed by sorting the bodyweight-priority list by `easeScore` (level, then difficulty) before dedup, and by giving `step-up` its own `category: 'bodyweight'` override (it inherited `'strength'` from `lunges`'s `baseExerciseData` entry via `createVariant`, the same gap the original fix was meant to close but missed for this sibling).
- **patch (low)** — The `'air squat'` → `'mini-knebøy'` test-string swap didn't actually strengthen the assertion, since the surrounding `||` with `'armheving'` meant the test passed via the push-up branch regardless. Added a dedicated test asserting `air-squat`/`step-up` are selected and `squat`/`lunges` are not, for the exact scenario the regression above affected — this is what would have caught it.
- **patch (low)** — No test covered the `rowing`/`cycling` muscle-list changes. Extended the existing `'lists the main muscles engaged in each exercise'` test to assert both new arrays.
- **low, rejected** — Rowing's muscle list now mixes a generic term (`'Armer'`) with a specific one (`'Skuldre'`) versus siblings like `pull-up` using `'Biceps'`. Real but cosmetic; not worth a further edit absent a clearer naming convention to apply consistently across the whole catalog.
- **low, accepted (documentation only)** — `category` is set in two places (`baseExerciseData` literal vs. the `exerciseAttributes` override map) with different inheritance behavior for variants; this is exactly the shape that let the `step-up` gap slip through. Added a short comment above `exerciseAttributes` documenting which source `createVariant` reads from.

