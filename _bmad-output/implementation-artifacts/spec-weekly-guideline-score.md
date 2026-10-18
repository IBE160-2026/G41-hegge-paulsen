---
title: 'Weekly official activity-guideline compliance score'
type: 'feature'
created: '2026-10-18'
status: 'done'
route: 'dispatch'
review_loop_iteration: 1
context: []
baseline_commit: '551b82b997aec34e5bf253f502e6772c3f83fae9'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** SmartØkt has no concept of the official Helsedirektoratet weekly physical-activity guideline the user supplied (reference: https://www.helsedirektoratet.no/faglige-rad/fysisk-aktivitet-i-forebygging-og-behandling/voksne-og-eldre#voksne-rad-anbefaling-fysisk-aktivitet-150-300-minutter-per-uke): ≥150-300 min moderate or ≥75-150 min vigorous activity per week, or a combination; and, as part of that same weekly activity, muscle-strengthening exercise for the major muscle groups on ≥2 days/week. The app has no weekly rollup, no "approved week" concept, and no motivational messaging tied to official compliance. (The guideline's additional 65+ balance/strength threshold and the general sedentary-compensation nudge are deferred — see `deferred-work.md`; this spec covers the standard adult rule only.)

**Approach:** Add a new `activityGuidelines` module that computes a per-ISO-calendar-week compliance status from logged history (`trainingLog.js` entries). Capture each session's intensity via an explicit selector on the log form itself (decision: review loop 1 — the log form independently captures its own focus/duration/date regardless of any suggestion last viewed, so deriving intensity from "the last computed suggestion" is uncorrelated with what is actually being logged; a manual selector on the log form is the accurate, honest option and fits the app's existing pattern of logging whatever was actually done, not necessarily a shown suggestion). Surface the result as a binary "Godkjent uke" / "Ikke godkjent uke" badge in the UI — no change to which exercises get recommended.

</frozen-after-approval>

## Boundaries & Constraints

**Always:** Use ISO calendar week (Mon–Sun) as the rollup window, keyed off each history entry's `date`. Weight `high`-intensity minutes 2:1 (vigorous) and `medium`-intensity minutes 1:1 (moderate) toward the combined total, matching the guideline's "or a combination" clause; `low`-intensity minutes do not count toward the minutes rule at all (they don't meet the guideline's threshold for moderate exertion) but a `low`-intensity session's calendar day still counts toward the strength-day rule via its `focus`. Count a calendar day toward the "≥2 strength days/week" rule once, regardless of how many `styrke`-focus sessions happened that day. "Full score"/"Godkjent uke" requires both the minutes rule AND the strength-day rule.

**Never:** Do not change `recommendationEngine.js`'s exercise-selection logic to chase the score — informational only. Do not add new exercises, training modes, or catalog fields. Do not implement the 65+ elder threshold or the sedentary-compensation message in this spec (tracked in `deferred-work.md`).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| No history this week | No entries dated in the current ISO week | 0 minutes, both rules `false`, badge "Ikke godkjent uke" | N/A |
| Combined rule via mix | 60 min moderate + 40 min vigorous logged this week | weighted total = 60 + 40*2 = 140 (< 150) → minutes rule `false` | N/A |
| Exactly at threshold | 150 min moderate exactly | minutes rule `true` (inclusive ≥) | N/A |
| Strength days, same-day double session | two `styrke` sessions logged on the same date | counts as 1 strength day, not 2 | N/A |
| All rules pass | minutes rule and ≥2 distinct strength days both met | badge "Godkjent uke" | N/A |
| Entry logged before this feature shipped | entry has no `intensity` field | excluded from minutes totals (can't classify), still counts toward strength-day rule via its `focus`/`date` | Skip from minutes only, do not throw |
| Malformed/missing `date` | entry lacks a parseable `date` | entry excluded entirely from the week's totals | Skip silently |
| Low-intensity session | entry has `intensity: 'low'`, `focus: 'styrke'` | excluded from minutes totals entirely; still counts toward the strength-day rule | N/A |
| Incomplete session | entry has `completed: false` | excluded entirely — no minutes credit, no strength-day credit | N/A |

</frozen-after-approval>

## Code Map

- `src/features/trainingLog.js` -- `logWorkout(history, workout)`: add `intensity` to the persisted entry shape (default `null` when absent/not selected, for pre-existing history and any future non-UI caller).
- `src/app/ui.js:444-462` -- the log form's submit handler; read the new intensity selector's value here instead of any suggestion-derived state. Delete the previously-added `lastSuggestionIntensity` module variable and its assignment in `updateView` -- no longer needed.
- `src/app/ui.js:375-398` -- `renderProgress`: where the new weekly badge rendering call belongs alongside the existing progress summary.
- `index.html` -- add (a) a small `<select>`/radio group for intensity (`low`/`medium`/`high`, Norwegian labels) inside the existing log form, and (b) one small DOM element for the badge, near the existing progress section.
- `src/data/sampleHistory.js` -- seed entries lack `intensity`; per the matrix above they're excluded from minutes totals but still count toward strength-days — no seed-data change needed.

## Tasks & Acceptance

**Execution:**
- [x] `src/features/activityGuidelines.js` -- new module: `getWeeklyGuidelineStatus(history)` — ISO-week grouping, weighted minutes totals, strength-day counting, `isFullScore` boolean; skip any entry with `completed === false` entirely (not just unclassified-intensity entries) -- core logic requested, plus review loop 1 fix for the `completed` gap
- [x] `src/features/trainingLog.js` -- `logWorkout` accepts and persists an `intensity` field on the entry; add/extend a test asserting the field is actually returned on the logged entry (review loop 1 fix for an untested line)
- [x] `index.html` -- add the intensity selector to the log form, with a sensible default (e.g. `medium`) so submitting without changing it still yields a valid value; add the badge DOM element
- [x] `src/app/ui.js` -- read the new intensity selector on log-form submit and pass it to `logWorkout`; compute weekly status from `workoutHistory` on each render; render the "Godkjent uke"/"Ikke godkjent uke" badge
- [x] `tests/activity-guidelines.test.js` -- new file covering the I/O matrix above (including the low-intensity-exclusion row)

**Acceptance Criteria:**
- Given a week with ≥150 logged moderate-equivalent minutes (vigorous weighted 2:1) and ≥2 distinct `styrke` calendar-days, when status is computed, then `isFullScore` is `true` and the badge reads "Godkjent uke".
- Given either rule unmet, when status is computed, then `isFullScore` is `false` and the badge reads "Ikke godkjent uke".
- Given an entry with no `intensity` (pre-existing history), when status is computed, then it is excluded from minutes totals without throwing, and still counts toward the strength-day rule if its `focus` is `styrke`.
- Given an entry with `completed: false`, when status is computed, then it contributes neither minutes nor a strength day.
- Given the user submits the log form, when `logWorkout` is called, then the persisted entry's `intensity` matches the value selected in the new log-form field (verified by a test on `logWorkout` itself, independent of `ui.js`).

## Implementation Notes

- `getWeeklyGuidelineStatus(history, referenceDate = new Date())` takes an optional second parameter (not in the original Code Map signature) so callers/tests can pin "this week" to a fixed date instead of the real system clock; `ui.js` calls it with just `history`, so production behavior always uses the real current ISO week.
- Intensity-to-guideline-category mapping was underspecified beyond the "vigorous(high) weighted 2:1" rule, so `low` and `medium` intensities are both treated as moderate (weight 1:1) and only `high` is treated as vigorous (weight 2:1) -- the minimal reading consistent with the spec's wording and examples.
- Minutes totals skip entries with a non-finite or non-positive `duration` defensively (not explicitly in the I/O matrix, but needed to avoid `NaN` poisoning the weekly sum).
- Badge DOM element reuses the existing `.meta`/`.notes` styling conventions already in `styles.css` -- no new CSS was added, per the "no new fields/styling scope creep" boundary.
- Review loop 1: the above implementation was reverted (code changes discarded) due to an intent_gap finding on the intensity-capture mechanism -- see Open Questions and Review Triage Log. The notes above remain accurate for whatever is re-derived except where superseded by the Spec Change Log's KEEP list and the low-intensity-exclusion amendment.

## Spec Change Log

- Split off the 65+ elder balance/strength threshold and the sedentary-compensation motivational message into `deferred-work.md` to bring the spec within the 900-1600 token scope target (human choice at Checkpoint 1).
- Review loop 1: amended Boundaries to exclude `low`-intensity minutes from the minutes rule entirely (previously unspecified, implementation had defaulted to weighting `low` the same as `medium`) — triggered by a bad_spec finding. KEEP: ISO-week grouping logic, null/undefined-intensity exclusion-from-minutes-only behavior, strength-day-counts-once-per-date logic, and the `getWeeklyGuidelineStatus(history, referenceDate)` optional second parameter — all verified correct in review and should survive re-derivation unchanged.
- Review loop 1: resolved the intent_gap by renegotiating the frozen Approach with the human — intensity is now captured via an explicit log-form selector, not derived from the last-viewed suggestion. Also folded in the two moot `patch` findings as explicit tasks: exclude `completed === false` entries entirely (new matrix row), and test that `logWorkout` actually persists `intensity`.

## Review Triage Log

- **intent_gap** — `src/app/ui.js`: intensity is attributed to a logged entry from module-level `lastSuggestionIntensity`, set only when the separate suggestion form is submitted (or on page load) — not from the log form's own independently-typed `focus`/`duration`/`log-date`. Verified: the log form lets the user enter a workout unrelated to whatever suggestion was last viewed (different focus, different date), so the persisted `intensity` can be systematically uncorrelated with the actual logged session, undermining the whole feature's accuracy. Root cause is the frozen Approach's chosen mechanism ("pre-filled from the last computed suggestion, not a new required user input") — fixing it means renegotiating that mechanism, not a code patch.
- **bad_spec** — `src/features/activityGuidelines.js`: `'low'` intensity is weighted identically to `'medium'` (both count fully toward the 150-min moderate threshold). Verified: the frozen Boundaries only pinned down the vigorous(high) 2:1 weight, leaving low-vs-medium unspecified — a real spec gap, not a frozen-intent gap. Amended below (Spec Change Log) and will be re-derived with step-03.
- **false** — Diff-file header malformation (duplicated `new file`/`---`/`+++` lines) in the two new-file hunks. Disproof: this is an artifact of how the diff was manually assembled for review (concatenating `git diff --no-index` output with extra manual headers); the actual files on disk are valid and would diff cleanly via a normal `git add`.
- **false** — Badge shows only a binary label with no minutes/strength breakdown. Disproof: the human explicitly chose the binary-badge option over the partial-breakdown option at Checkpoint 1 in this session — this is the approved design, not an omission.
- **false** — Static placeholder "Ikke godkjent uke" in `index.html` before JS runs. Disproof: matches the existing app-wide convention (every other progress field has similar static placeholder text before `updateView()` runs); script execution is synchronous and near-instant, same risk profile as the rest of the page.
- **false** — No null-guard on `getElementById('weekly-guideline-badge')`. Disproof: the element exists with a matching id; no other DOM lookup in this file is guarded either — consistent with the file's established convention, not a state the diff shows reachable.
- **false** — Explicit `undefined` `intensity` key could be overridden by `...workout` spread after the `?? null` default. Verified technically true, but disproved as consequential: `activityGuidelines.js` treats `null` and `undefined` identically (`entry.intensity === null || entry.intensity === undefined`), so there is no observable difference anywhere in the system.
- **low, rejected** — No validation of the `intensity` enum in `logWorkout`; a typo'd value would silently weight as moderate. Unlikely to be hit: the only wired caller (`ui.js`) always supplies `null` or one of `getWorkoutSuggestion`'s three valid values, so no current path can inject an invalid string.
- **low, rejected** — No test for an ISO week spanning a year/month boundary. Verified the underlying `Date.UTC`/`setUTCDate` arithmetic handles this correctly (checked `2026-12-30` and `2027-01-01` both resolve to week `2026-12-28`..`2027-01-03`); not in the frozen I/O matrix, and the code is already provably correct.
- **patch** (moot this round — bundled with the intent_gap loopback) — `getWeeklyGuidelineStatus` doesn't check `entry.completed`; a `completed: false` entry would still count toward minutes and strength-days. Caused by this diff's new logic. Fix: skip entries with `completed === false`.
- **patch** (moot this round) — `logWorkout`'s new `intensity` persistence has no test asserting the field is actually returned/persisted; the activity-guidelines tests never call `logWorkout`, so a regression in that one line would go undetected. Fix: add an assertion to the existing "adds a logged workout to the history" test.
- **defer** — `src/app/ui.js`'s new wiring (intensity capture, badge render) has no test coverage, but no file in `ui.js` has ever been unit-tested (no DOM/jsdom harness exists in this project) — pre-existing gap, not scoped to this change. Logged to `deferred-work.md`.

### Review loop 2 (post-renegotiation re-implementation)

- **low** — `activityGuidelines.js` keys the strength-day dedup `Set` on raw, untrimmed `entry.date`, while `parseISODate` validates against a trimmed copy; two entries for the same calendar day differing only in incidental whitespace would wrongly count as two strength days. Verified by reading the code. Patch: key the Set on the parsed/normalized date string instead.
- **low** — No test isolates the "≥75 min vigorous alone" qualifying route named explicitly in the guideline (only moderate-alone and a below-threshold mix are tested). Arithmetic is already exercised by the same formula elsewhere, but this route is explicitly named in the frozen Intent and deserves its own case. Patch: add the test.
- **low** — The log-form intensity selector labels `high` as "Hard," which doesn't mirror the guideline's own "høy intensitet" terminology quoted in this spec's Intent, risking inconsistent self-assessment. Patch: relabel to "Høy".
- **low** — `logWorkout`'s documented default (`intensity` → `null` when omitted) has no test; only the explicit-`'high'` case is tested. Patch: add a test for the omitted case.
- **low** — `getWeeklyGuidelineStatus` has no guard for an invalid `referenceDate`; `NaN` boundary comparisons silently evaluate false on both sides, including every entry in history regardless of week. Not reachable via the current `ui.js` call site (always calls with no `referenceDate`, defaulting to `new Date()`), but the function is newly exported specifically for reuse/testability. Patch: add an `Number.isNaN` guard returning a safe all-false result.
- **medium** — `ui.js`'s pre-existing log-date default uses `new Date().toISOString().slice(0, 10)` (UTC-based "today"), while the new `getISOWeekStart` deliberately anchors on local-getter "today" (by design, to avoid DST/offset week-shifts). For any timezone west of UTC, these two conventions disagree for several hours every day, and disagreeing right at a Sunday/Monday boundary would misfile a just-logged "today" entry into the adjacent week. Pre-existing line, but this diff is what first makes the inconsistency consequential (exposed, not caused) — this story's problem per the triage rule. Patch: switch the log-date default(s) in `ui.js` to the same local-getter convention `getISOWeekStart` uses.
- **low, rejected** — No `aria-live` on the weekly badge. Disproof: consistent with sibling progress-card elements in the same section (`latest-workout`, `progress-trend`), which also lack it; only the unrelated auth-flow `account-status` element uses `aria-live` in this codebase. Not a deviation this diff introduced.
- **low, rejected** — Badge copy ("Godkjent uke"/"Ikke godkjent uke") duplicated between the static HTML placeholder and the `ui.js` ternary. No current harm (values match exactly); speculative future-desync risk only, and matches the same hardcoded-placeholder-plus-JS-value pattern already used throughout this file (e.g. "Ingen økter logget enda.").
- **low, patch, outcome: fixed** — The Review Triage Log's loop-1 entry claimed the `ui.js`-untested-wiring gap was "Logged to `deferred-work.md`," but it was never actually written there. Fixed directly: appended the missing entry to `deferred-work.md`.

## Verification

**Commands:**
- `npm test` -- expected: all existing and new tests pass
- Ran: all 45 tests pass (36 pre-existing + 9 new in `tests/activity-guidelines.test.js`), 3 test files, 0 failures.
