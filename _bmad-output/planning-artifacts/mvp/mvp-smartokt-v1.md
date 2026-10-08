---
title: MVP Plan
status: draft
created: 2026-10-08
updated: 2026-10-08
---

# MVP Plan for SmartØkt

## Goal
The goal of this MVP is to build a working, testable core flow that proves the app solves the main user problem: giving a realistic workout recommendation based on time, energy, focus, and history.

This MVP is intentionally narrow and focused on what the evaluation rubric rewards most:
- clear process and documentation
- working core functionality
- runnable app with local fallback data
- testable logic
- readable repo and project structure

---

## MVP Core Flow
The MVP must support the following flow without major bugs or missing logic:

1. User logs in or chooses guest mode
2. User enters available time, focus area, energy level, and workout goal
3. App generates a recommended workout
4. User can accept, reject, or adjust the recommendation
5. User logs the workout
6. App suggests the next weight to use
7. User sees a simple progress overview / trend

---

## In Scope for MVP
- login or guest mode
- user profile / workout goal
- workout logging
- weight plate calculator
- workout recommendation by time, focus, energy, history, and weekly goal
- next-weight suggestion based on previous workouts
- simple progression view
- local fallback exercise database
- basic README with setup instructions
- tests for core logic

---

## Out of Scope for MVP
- live external API in first version
- advanced video analysis
- AI coach in real time
- social / team features
- complex multi-user systems
- advanced visual analytics beyond a simple progress view

---

## User Stories

### Story 1: Workout recommendation
As a user, I want to enter my available time and energy so that I can get a realistic workout suggestion.

Acceptance criteria:
- user can choose time
- user can choose focus area
- user can choose energy level
- app returns a workout suggestion based on the selected inputs
- app handles invalid or missing input

### Story 2: Workout logging
As a user, I want to log a completed workout so that I can track history and improve future recommendations.

Acceptance criteria:
- user can add a workout log
- workout includes relevant fields such as type, duration, difficulty, and performance
- log is stored in app state or database
- history is available to the recommendation logic

### Story 3: Next-weight suggestion
As a user, I want a suggested next weight so that I can progress without guessing.

Acceptance criteria:
- app uses previous workout history
- app suggests a conservative weight change
- app handles low-data situations clearly
- app explains uncertainty when there is not enough history

### Story 4: Progress overview
As a user, I want to see a simple progress trend so that I understand my development over time.

Acceptance criteria:
- progress is shown in a basic graph or overview
- the user can understand the trend without extra explanation
- the app handles low-sample situations honestly

---

## Definition of Done
The MVP is complete when:
- the main flow works end-to-end
- app can run locally without secret keys
- fallback exercise data works
- core logic is testable
- README explains how to install and run the app
- key decisions are documented in repo
- the repo is reasonably clean and structured

---

## Priority Order
1. Project setup and repo cleanliness
2. Local fallback data and env configuration
3. Workout recommendation logic
4. Workout logging and history
5. Next-weight suggestion
6. Simple progress overview
7. README and testing
8. Final polish and QA

---

## Risk Notes
- External API dependency is a risk and should not be required for MVP
- Recommendation logic must be clear and transparent to make testing possible
- We should avoid expanding scope before the core flow works
- We must store documentation and decisions in the repo so the process is traceable
