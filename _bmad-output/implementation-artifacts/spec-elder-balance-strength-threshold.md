---
title: 'Elder (65+) balance/strength threshold for the weekly guideline score'
type: 'feature'
created: '2026-10-18'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
context: []
baseline_commit: 'd4405cc990a266727bbbd50905bc1c97960dd462'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The weekly guideline score currently applies one rule to every user: muscle-strengthening (`focus: 'styrke'`) on ≥2 distinct calendar days/week. The Helsedirektoratet source already cited in the original spec gives a different rule for 65+ adults: "balanse- og styrketrening minst 2–3 ganger per uke" (balance **and** strength training, at least 2-3 times/week) — fetched and confirmed from the source page during planning. The app has no way to log balance training at all (no `'balanse'` focus value exists anywhere), so 65+ users are held to a rule that under-counts what they actually did.

**Approach:** Add `'balanse'` as a new loggable focus value on the log form only (not the suggestion/workout-config form, not the exercise catalog — this stays a compliance-tracking change, informational only, per the original spec's boundary). Extend `getWeeklyGuidelineStatus` to accept an `age` parameter: for age ≥ 65, a calendar day counts toward the strength-day rule if its focus is `'styrke'` **or** `'balanse'` (either qualifies, same as the day-count minimum). The day-count minimum itself stays ≥2 for every age — the cited "2-3" range's lower bound, matching this codebase's own existing precedent of using a cited range's lower bound as the pass threshold (the minutes rule already treats "150-300 min" as "≥150 to pass"). Wire `age` into `ui.js` from the already-synced Supabase profile (`profile.age`); guest/local-only users (no synced profile) are never subject to the elder rule, same as before.

**Human decision (2026-10-18):** Given a choice between (a) a simplified proxy raising the strength-day count to 3 for 65+, (b) this literal-guideline balance-category approach, (c) a documentation-only note with no gating change, or (d) dropping the item, the human chose **(b)** — model the actual balance+strength distinction rather than a numeric stand-in, accepting the larger footprint (new loggable focus value) over fidelity to the cited source.

</frozen-after-approval>

## Boundaries & Constraints

**Always:**
- Source `age` only from the signed-in, Supabase-synced profile (`profile.age`, read in `applySession` and after a successful profile save). Guest/local-only users and signed-in users with no saved age always get the standard (non-elder) rule.
- Elder eligibility is `Number.isFinite(age) && age >= 65`.
- For elder users, a calendar day counts toward the strength-day rule if its `focus` is `'styrke'` **or** `'balanse'`; two sessions on the same day (any mix of those two focuses) still count as one day, consistent with the existing same-day dedup rule.
- The minutes rule, the day-count minimum (≥2), the binary "Godkjent uke"/"Ikke godkjent uke" badge, and badge copy are unchanged for every user.
- `'balanse'` is added only to the log form's `log-focus` select (`index.html`) and recognized by `activityGuidelines.js`.

**Never:**
- Do not add balance exercises to `src/data/exerciseCatalog.js`, change `recommendationEngine.js`'s suggestion logic, or add `'balanse'` to the workout-config (suggestion) form's `focus` select — this is a compliance-tracking change only, not a new suggestable training focus.
- Do not raise the day-count minimum above 2 for any age group, or change the minutes rule.
- Do not add new UI copy/messaging beyond the new log-form option — the badge stays binary with no breakdown.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Elder, 2 days via styrke+balanse | age 70, one `'styrke'` day + one `'balanse'` day this week | strength-day count 2, rule met | N/A |
| Elder, only 1 qualifying day | age 70, one `'balanse'` day this week | strength-day count 1, rule not met | N/A |
| Non-elder, balanse logged | age 40, one `'styrke'` day + one `'balanse'` day | `'balanse'` day does not count; strength-day count 1, rule not met | N/A |
| No age set, signed in | `currentUser` set, `profile.age` is `null` | standard (non-elder) rule applies | N/A |
| Guest / not signed in | no Supabase session | standard (non-elder) rule applies; `age` param is `null`/absent | N/A |
| Elder, same-day double | age 70, one `'styrke'` and one `'balanse'` session on the same date | counts as 1 strength day, not 2 | N/A |
| Invalid/missing age value | `age` is `undefined`, `NaN`, or a negative number | treated as non-elder (standard rule); no throw | Skip elder branch silently |
| Elder, exactly 2 days, minutes rule unmet | age 70, 2 qualifying strength days but < 150 weighted minutes | `isFullScore` false (minutes rule still gates) | N/A |

</frozen-after-approval>

## Code Map

- `src/features/activityGuidelines.js` -- `getWeeklyGuidelineStatus(history, referenceDate, age)`: add third param `age = null`. Compute `const isElder = Number.isFinite(age) && age >= 65;` and widen the focus set checked when adding to the `strengthDays` set: `const qualifiesAsStrengthDay = entry.focus === 'styrke' || (isElder && entry.focus === 'balanse');`. Threshold (`>= 2`) and minutes logic unchanged.
- `src/app/ui.js:74` -- module state block (`let currentUser = null;` etc.): add `let currentUserAge = null;`.
- `src/app/ui.js` `applySession` (~118-164): in the `!currentUser` (guest) branch, reset `currentUserAge = null;`. In the signed-in branch, after `profileAge.value = profile?.age ?? '';`, set `currentUserAge = profile?.age ?? null;`.
- `src/app/ui.js` `accountProfileForm` submit handler (~261-287): after `profileAge.value = profile.age ?? '';` on success, set `currentUserAge = profile.age ?? null;`.
- `src/app/ui.js:397` (`renderProgress`, the `getWeeklyGuidelineStatus(history)` call): change to `getWeeklyGuidelineStatus(history, new Date(), currentUserAge)`; reads `currentUserAge` via closure, no signature change to `renderProgress` itself.
- `index.html` `#log-focus` select (~174-180): add `<option value="balanse">Balanse</option>` after the existing three options.
- `tests/activity-guidelines.test.js` -- extend with the I/O matrix's elder-branch cases above.

## Tasks & Acceptance

**Execution:**
- [x] `src/features/activityGuidelines.js` -- add the `age` param and elder-aware strength-day qualification
- [x] `index.html` -- add the `'balanse'` option to `#log-focus`
- [x] `src/app/ui.js` -- add `currentUserAge` state, set it in `applySession` and the profile-save handler, pass it into the `renderProgress` call site
- [x] `tests/activity-guidelines.test.js` -- cover the I/O matrix's elder-branch rows (qualifying mix, non-elder exclusion, missing/invalid age, same-day dedup across the two focuses)

**Acceptance Criteria:**
- Given a signed-in user with a synced age ≥ 65, when they log one `'styrke'` day and one `'balanse'` day this week (minutes rule also met), then `isFullScore` is `true`.
- Given a signed-in user with a synced age < 65, when they log a `'balanse'`-focus day, then that day does not count toward the strength-day rule.
- Given no synced age (guest, or signed in with `age: null`), when the weekly status is computed, then the standard (non-elder) rule applies with no error.
- Given an elder user profile is saved via the account-profile form, when the next render happens, then the updated age is reflected in `currentUserAge` without requiring a page reload.

## Implementation Notes

- `getWeeklyGuidelineStatus`'s new `age` parameter defaults to `null`; `isElder = Number.isFinite(age) && age >= 65` so any non-numeric/NaN/negative value safely falls back to the standard rule with no throw.
- `'balanse'` was added only to `index.html`'s `#log-focus` select (confirmed by line number: 175 for the select, 179 for the new option) -- the suggestion/workout-config form's `#focus` select (line 92) and `src/data/exerciseCatalog.js`/`recommendationEngine.js` were left untouched, matching the Never boundary.
- `currentUserAge` is read via closure at the `renderProgress` call site rather than passed as a parameter, consistent with this file's existing style (most module state like `currentUser`/`hasRemoteProfile` is also read via closure, not threaded through function signatures).
- Review loop 1 (verification-gap + blind-hunter, same root cause): the signed-in-elder wiring through `applySession`/the profile-save handler into the badge had no test anywhere -- only the pure `getWeeklyGuidelineStatus(history, date, age)` function was unit-tested directly. Added a test to `tests/ui.test.js` that mocks a signed-in Supabase session and a `loadProfile` response with `age: 70`, seeds a styrke+balanse week, and asserts the badge via `vi.waitFor` (the sign-in flow resolves asynchronously after the module's own synchronous first render). Verified this test actually catches a regression: temporarily hardcoded the `renderProgress` call site's `age` argument to `null` and confirmed the new test failed with the expected before/after badge text, then reverted via `git checkout -- src/app/ui.js`.
- Review loop 1 (edge-case-hunter + blind-hunter, same root cause): `applySession`'s `catch` branch (the `loadProfile` failure path) didn't reset `currentUserAge` to `null` the way the guest branch does, risking a stale age lingering after a failed profile fetch. Added the reset to match the guest branch's existing pattern.

## Review Triage Log

- **medium, patch** — The signed-in-elder wiring (`applySession`'s signed-in branch, the profile-save handler, and the `renderProgress` call site) had zero test coverage; only the pure `getWeeklyGuidelineStatus` function was unit-tested with an explicit `age` argument, never the path that actually supplies that argument in the running app. Independently verified by the verification-gap layer (traced every test file; confirmed the file-wide `supabase: null` mock made the signed-in branch unreachable in every existing test) and the blind-hunter layer. Fixed by adding a signed-in-session test to `tests/ui.test.js`, confirmed to catch a regression by mutation-testing the call site.
- **low, patch** — `applySession`'s `catch` branch did not reset `currentUserAge` to `null` on a failed profile fetch, unlike the guest branch. Independently verified by the edge-case-hunter and blind-hunter layers. Reachable cross-user impact is narrow (normal sign-out always runs the guest-reset branch before a new sign-in), but the fix is a trivial one-line addition matching an existing pattern, so it was not rejected as low-and-not-worth-it. Fixed.
- **defer** — `applySession` has no request-sequencing guard against overlapping/out-of-order async resolution (a late `loadProfile` could overwrite state a newer call already reset). Verified this is a pre-existing gap affecting every field `applySession` sets (`hasRemoteProfile`, `userProfile`, profile-form values, now also `currentUserAge`), not something this diff introduced — it only added one more variable to the same existing unguarded pattern. Logged to `deferred-work.md`.
- **false** — Claimed `deferred-work.md`'s matching entry for this feature was left unresolved after shipping, implying a defect. Disproven: `deferred-work.md` is used throughout this project as an append-only historical ledger (confirmed by its own "do not modify existing entries" instruction used every time a new entry is appended, and by the first deferred item from this same session, which was resolved without retroactively editing its original entry either) — not a live task tracker, so this is by design, not a regression this diff caused.
- **false** — Claimed `profile?.age` needs an explicit `Number(...)` coercion before being stored in `currentUserAge`, since `isElder` assumes a genuine JS number. Disproven: `supabase/migrations/202610110001_create_profiles.sql` declares `age integer check (age is null or age between 13 and 120)` — PostgREST always serializes a Postgres `integer` column as a native JSON number, never a string, and the range constraint further guarantees a safe value. No coercion gap exists on this path.
- **rejected (fix would edit this build's spec)** — Several findings (empty `## Implementation Notes` at review time, missing `## Verification` section, frontmatter `status` not yet `'done'`, thin rationale for why the elder range's upper bound is disposable) all point at the spec artifact itself, not the code. Per this workflow's own classify rule ("reject any finding whose fix is to edit this build's spec"), these are out of scope for patching and are instead addressed directly at finalize time below, as ordinary spec hygiene rather than classified findings.

## Verification

**Commands:**
- `npm test` -- expected: all tests pass. Ran: all 63 tests pass (4 suites: 11 + 21 + 26 + 5), including the new elder-branch unit tests in `tests/activity-guidelines.test.js` and the new signed-in-elder UI test in `tests/ui.test.js`.
- `npx vite build` -- expected: production build succeeds. Ran: succeeded with no errors (56 modules transformed).
