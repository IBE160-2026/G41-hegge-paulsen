import { getWorkoutSuggestion } from '../features/recommendationEngine.js';
import { parseWorkoutRequest, parseWeeklyPlanRequest } from '../features/chatParser.js';
import { exerciseSources } from '../data/exerciseCatalog.js';
import { profileEquipmentOptions, readUserProfile, writeUserProfile } from '../features/userProfile.js';
import { supabase } from '../features/supabaseClient.js';
import {
  loadProfile,
  saveProfile,
  saveProfileEquipment,
  sendPasswordReset,
  signIn,
  signOut,
  signUp,
  updatePassword
} from '../features/supabaseAccount.js';
import { suggestNextWeight } from '../features/weightProgression.js';
import {
  getLatestWorkoutSummary,
  getProgressSummary,
  logWorkout,
  readStoredHistory,
  writeStoredHistory,
  STORAGE_KEY
} from '../features/trainingLog.js';
import { getWeeklyGuidelineStatus } from '../features/activityGuidelines.js';
import {
  getWeeklyPlan,
  getFocusForDayIndex,
  readStoredWeeklyPlan,
  writeStoredWeeklyPlan,
  WEEKLY_PLAN_STORAGE_KEY
} from '../features/weeklyPlan.js';
import { userHistory } from '../data/sampleHistory.js';

const viewParam = new URLSearchParams(window.location.search).get('view');
const accountPage = viewParam === 'account';
const suggestionPage = viewParam === 'forslag';
const weeklyPlanPage = viewParam === 'ukeplan';
const pageTitle = document.getElementById('page-title');
const accountNavigation = document.getElementById('account-navigation');

document.body.classList.toggle('account-page', accountPage);
document.body.classList.toggle('suggestion-page', suggestionPage);
document.body.classList.toggle('weekly-plan-page', weeklyPlanPage);
if (accountPage || suggestionPage || weeklyPlanPage) {
  pageTitle.textContent = accountPage ? 'Konto' : weeklyPlanPage ? 'Ukeplan' : 'Øktforslag';
  accountNavigation.href = '/';
  accountNavigation.textContent = 'Tilbake til økt';
}

// Local, ui.js-internal persistence for the generated suggestion -- mirrors
// trainingLog.js's try/catch-around-localStorage pattern. Not exported:
// nothing outside this file needs the current suggestion.
const SUGGESTION_STORAGE_KEY = 'smartokt-current-suggestion';

function readStoredSuggestion(storage = globalThis.localStorage) {
  try {
    const raw = storage.getItem(SUGGESTION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function writeStoredSuggestion(suggestion, storage = globalThis.localStorage) {
  try {
    storage.setItem(SUGGESTION_STORAGE_KEY, JSON.stringify(suggestion));
  } catch (error) {
    // ignore storage failures in restricted environments
  }

  return suggestion;
}

const form = document.getElementById('workout-form');
const chatForm = document.getElementById('chat-form');
const chatText = document.getElementById('chat-text');
const suggestionTitle = document.getElementById('suggestion-title');
const suggestionExercises = document.getElementById('suggestion-exercises');
const suggestionDuration = document.getElementById('suggestion-duration');
const suggestionIntensity = document.getElementById('suggestion-intensity');
const suggestionNotes = document.getElementById('suggestion-notes');
const nextWeight = document.getElementById('next-weight');
const nextWeightMessage = document.getElementById('next-weight-message');
const progressTotal = document.getElementById('progress-total');
const progressAverage = document.getElementById('progress-average');
const progressFocus = document.getElementById('progress-focus');
const latestWorkout = document.getElementById('latest-workout');
const progressTrend = document.getElementById('progress-trend');
const progressList = document.getElementById('progress-list');
const weeklyGuidelineBadge = document.getElementById('weekly-guideline-badge');
const logForm = document.getElementById('workout-log-form');
const weeklyPlanForm = document.getElementById('weekly-plan-form');
const weeklyPlanDaysSelect = document.getElementById('weekly-plan-days');
const weeklyPlanDayOverrides = document.getElementById('weekly-plan-day-overrides');
const weeklyPlanChatForm = document.getElementById('weekly-plan-chat-form');
const weeklyPlanChatText = document.getElementById('weekly-plan-chat-text');
const weeklyPlanList = document.getElementById('weekly-plan-list');
const trainingModeSelect = document.getElementById('training-mode');
const customEquipmentPanel = document.getElementById('custom-equipment-panel');
const profileEquipmentOptionsContainer = document.getElementById('profile-equipment-options');
const accountStatus = document.getElementById('account-status');
const accountAuthForm = document.getElementById('account-auth-form');
const accountProfileForm = document.getElementById('account-profile-form');
const accountRecoveryForm = document.getElementById('account-recovery-form');
const accountEquipmentOptionsContainer = document.getElementById('account-equipment-options');
const accountEmail = document.getElementById('account-email');
const accountPassword = document.getElementById('account-password');
const signUpButton = document.getElementById('sign-up-button');
const resetPasswordButton = document.getElementById('reset-password-button');
const signOutButton = document.getElementById('sign-out-button');
const profileUsername = document.getElementById('profile-username');
const profileAge = document.getElementById('profile-age');
const profileBodyWeight = document.getElementById('profile-body-weight');

let workoutHistory = readStoredHistory();
let historyStorageKey = STORAGE_KEY;
let weeklyPlanStorageKey = WEEKLY_PLAN_STORAGE_KEY;
let weeklyPlan = readStoredWeeklyPlan(weeklyPlanStorageKey);
let userProfile = readUserProfile();
let currentUser = null;
let currentUserAge = null;
let hasRemoteProfile = false;

function renderEquipmentOptions(container, inputName, selectedEquipment) {
  container.innerHTML = profileEquipmentOptions
    .map((option) => `
      <label class="equipment-option">
        <input type="checkbox" name="${inputName}" value="${option.id}" ${selectedEquipment.includes(option.id) ? 'checked' : ''} />
        <span>${option.label}</span>
      </label>
    `)
    .join('');
}

function syncEquipmentSelections(equipment) {
  document.querySelectorAll('input[name="profile-equipment"], input[name="account-equipment"]')
    .forEach((input) => {
      input.checked = equipment.includes(input.value);
    });
}

function todayLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function setAccountStatus(message, isError = false) {
  accountStatus.textContent = message;
  accountStatus.classList.toggle('account-error', isError);
}

renderEquipmentOptions(profileEquipmentOptionsContainer, 'profile-equipment', userProfile.equipment);
renderEquipmentOptions(accountEquipmentOptionsContainer, 'account-equipment', userProfile.equipment);

function updateCustomEquipmentVisibility() {
  customEquipmentPanel.hidden = trainingModeSelect.value !== 'custom';
}

trainingModeSelect.addEventListener('change', updateCustomEquipmentVisibility);
updateCustomEquipmentVisibility();

// Incremented at the start of every applySession call; a call checks this
// after its one await point and bails out if a newer call has since started,
// so a slow/late-resolving loadProfile fetch can never overwrite state a
// newer call already set (e.g. sign-out firing, or a token refresh, while an
// earlier fetch is still in flight).
let sessionRequestId = 0;

async function applySession(session) {
  const requestId = ++sessionRequestId;
  currentUser = session?.user || null;
  accountAuthForm.hidden = Boolean(currentUser);
  accountProfileForm.hidden = !currentUser;
  accountRecoveryForm.hidden = true;
  signOutButton.hidden = !currentUser;

  if (!currentUser) {
    hasRemoteProfile = false;
    currentUserAge = null;
    historyStorageKey = STORAGE_KEY;
    workoutHistory = readStoredHistory(historyStorageKey);
    if (!workoutHistory.length) {
      workoutHistory = [...userHistory];
      writeStoredHistory(workoutHistory, historyStorageKey);
    }
    weeklyPlanStorageKey = WEEKLY_PLAN_STORAGE_KEY;
    weeklyPlan = readStoredWeeklyPlan(weeklyPlanStorageKey);
    renderWeeklyPlan(weeklyPlan);
    userProfile = readUserProfile();
    syncEquipmentSelections(userProfile.equipment);
    setAccountStatus('Ikke logget inn. Treningsforslag kan fortsatt brukes lokalt.');
    void updateView();
    return;
  }

  historyStorageKey = `${STORAGE_KEY}:${currentUser.id}`;
  workoutHistory = readStoredHistory(historyStorageKey);
  if (!workoutHistory.length) {
    workoutHistory = [...userHistory];
    writeStoredHistory(workoutHistory, historyStorageKey);
  }
  weeklyPlanStorageKey = `${WEEKLY_PLAN_STORAGE_KEY}:${currentUser.id}`;
  weeklyPlan = readStoredWeeklyPlan(weeklyPlanStorageKey);
  renderWeeklyPlan(weeklyPlan);
  setAccountStatus(`Innlogget som ${currentUser.email}. Henter profilen ...`);

  try {
    const profile = await loadProfile(supabase, currentUser.id);
    if (requestId !== sessionRequestId) return;
    hasRemoteProfile = Boolean(profile);
    profileUsername.value = profile?.username || '';
    profileAge.value = profile?.age ?? '';
    currentUserAge = profile?.age ?? null;
    profileBodyWeight.value = profile?.body_weight_kg ?? '';
    userProfile = writeUserProfile({ equipment: profile?.equipment || ['bodyweight', 'dumbbell'] });
    syncEquipmentSelections(userProfile.equipment);
    setAccountStatus(profile
      ? `Innlogget som ${currentUser.email}. Profilen er synkronisert.`
      : `Innlogget som ${currentUser.email}. Fyll ut og lagre profilen for å synkronisere den.`);
    void updateView();
  } catch (error) {
    if (requestId !== sessionRequestId) return;
    currentUserAge = null;
    setAccountStatus(`Kunne ikke hente profilen: ${error.message}`, true);
    void updateView();
  }
}

function accountErrorMessage(error) {
  if (error.code === '23505') return 'Brukernavnet er allerede i bruk. Velg et annet.';
  if (error.code === '23514') return 'Kontroller brukernavn, alder, vekt og utstyrsvalg.';
  return error.message || 'Noe gikk galt. Prøv igjen.';
}

if (!supabase) {
  accountAuthForm.hidden = true;
  setAccountStatus('Supabase er ikke konfigurert ennå. Legg prosjekt-URL og publishable key i .env.local.');
} else {
  supabase.auth.onAuthStateChange((event, session) => {
    window.setTimeout(() => {
      if (event === 'PASSWORD_RECOVERY') {
        accountAuthForm.hidden = true;
        accountProfileForm.hidden = true;
        accountRecoveryForm.hidden = false;
        signOutButton.hidden = false;
        setAccountStatus('Velg et nytt passord for kontoen din.');
      } else {
        void applySession(session);
      }
    }, 0);
  });
  supabase.auth.getSession()
    .then(({ data, error }) => {
      if (error) throw error;
      return applySession(data.session);
    })
    .catch((error) => setAccountStatus(`Kunne ikke kontrollere innlogging: ${error.message}`, true));
}

accountAuthForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!accountAuthForm.reportValidity()) return;
  try {
    await signIn(supabase, accountEmail.value.trim(), accountPassword.value);
    accountPassword.value = '';
  } catch (error) {
    setAccountStatus(accountErrorMessage(error), true);
  }
});

signUpButton.addEventListener('click', async () => {
  if (!accountAuthForm.reportValidity()) return;
  try {
    const result = await signUp(supabase, accountEmail.value.trim(), accountPassword.value, window.location.origin);
    accountPassword.value = '';
    setAccountStatus(result.session
      ? 'Konto opprettet. Fullfør profilen din nedenfor.'
      : 'Konto opprettet. Sjekk e-posten din for å bekrefte kontoen før du logger inn.');
  } catch (error) {
    setAccountStatus(accountErrorMessage(error), true);
  }
});

resetPasswordButton.addEventListener('click', async () => {
  if (!accountEmail.value.trim()) {
    accountEmail.reportValidity();
    setAccountStatus('Skriv inn e-postadressen din først.', true);
    return;
  }
  if (!accountEmail.checkValidity()) {
    accountEmail.reportValidity();
    setAccountStatus('Skriv inn en gyldig e-postadresse.', true);
    return;
  }
  try {
    await sendPasswordReset(supabase, accountEmail.value.trim(), window.location.origin);
    setAccountStatus('Hvis adressen har en konto, får du en e-post med lenke for å tilbakestille passordet.');
  } catch (error) {
    setAccountStatus(accountErrorMessage(error), true);
  }
});

signOutButton.addEventListener('click', async () => {
  try {
    await signOut(supabase);
  } catch (error) {
    setAccountStatus(accountErrorMessage(error), true);
  }
});

accountRecoveryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const password = new FormData(accountRecoveryForm).get('password');
  try {
    await updatePassword(supabase, password);
    accountRecoveryForm.reset();
    await applySession((await supabase.auth.getSession()).data.session);
    setAccountStatus('Passordet er oppdatert.');
  } catch (error) {
    setAccountStatus(accountErrorMessage(error), true);
  }
});

accountProfileForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!currentUser) return;

  const formData = new FormData(accountProfileForm);
  const age = formData.get('age');
  const bodyWeightKg = formData.get('bodyWeightKg');
  const equipment = formData.getAll('account-equipment');

  try {
    const profile = await saveProfile(supabase, {
      id: currentUser.id,
      username: String(formData.get('username')).trim(),
      age: age ? Number(age) : null,
      body_weight_kg: bodyWeightKg ? Number(bodyWeightKg) : null,
      equipment
    });
    hasRemoteProfile = true;
    userProfile = writeUserProfile({ equipment: profile.equipment });
    profileAge.value = profile.age ?? '';
    currentUserAge = profile.age ?? null;
    profileBodyWeight.value = profile.body_weight_kg ?? '';
    syncEquipmentSelections(userProfile.equipment);
    setAccountStatus('Profilen er lagret og synkronisert.');
  } catch (error) {
    setAccountStatus(accountErrorMessage(error), true);
  }
});

if (!workoutHistory.length) {
  workoutHistory = [...userHistory];
  writeStoredHistory(workoutHistory, historyStorageKey);
}

function renderExerciseDemo(exercise) {
  const animationType = exercise.animation || 'generic';
  return `
    <div class="exercise-demo ${animationType}" aria-hidden="true">
      <div class="demo-head"></div>
      <div class="demo-body"></div>
      <div class="demo-arm left"></div>
      <div class="demo-arm right"></div>
      <div class="demo-leg left"></div>
      <div class="demo-leg right"></div>
    </div>
  `;
}

function getDisplayExerciseDetails(data) {
  return data.exerciseDetails && data.exerciseDetails.length
    ? data.exerciseDetails
    : (data.exercises || []).map((exerciseName) => ({
        name: { no: exerciseName, en: exerciseName },
        instructions: { no: 'Se mer om øvelsen i treningskatalogen.', en: 'See more about the exercise in the training catalog.' },
        videoUrl: '',
        animation: 'generic',
        muscles: ['Generell styrke']
      }));
}

function renderExerciseListItems(exerciseDetails) {
  return exerciseDetails
    .map((exercise) => {
      const label = exercise.name && exercise.name.no && exercise.name.en
        ? `${exercise.name.no} (${exercise.name.en})`
        : exercise;
      const instruction = exercise.instructions?.no || exercise.description?.no || '';
      const muscleTags = (exercise.muscles || []).map((muscle) => `<span class="muscle-tag">${muscle}</span>`).join('');
      const planInfo = exercise.holdSeconds
        ? `${exercise.sets} x ${exercise.holdSeconds} sek hold • ${exercise.restSeconds} sek pause`
        : exercise.rounds
          ? `${exercise.rounds} x ${exercise.workSeconds} sek arbeid • ${exercise.restSeconds} sek pause`
          : exercise.sets && exercise.reps
            ? `${exercise.sets} x ${exercise.reps} reps • ${exercise.restSeconds} sek pause`
            : '';
      const exercisePlanInfo = planInfo
        ? `<div class="exercise-plan"><strong>Anbefalt:</strong> ${planInfo}</div>`
        : '';
      const equipmentNames = {
        bodyweight: 'kroppsvekt', dumbbell: 'manualer', kettlebell: 'kettlebell', barbell: 'stang',
        machine: 'apparat', 'cable-machine': 'kabelapparat', 'rowing-machine': 'romaskin',
        'stationary-bike': 'ergometersykkel', 'pull-up-bar': 'pull-up-stang'
      };
      const equipmentInfo = exercise.equipment?.length
        ? `<div class="exercise-equipment">Utstyr: ${exercise.equipment.map((item) => equipmentNames[item] || item).join(', ')}</div>`
        : '';
      const citedSources = (exercise.sourceIds || [])
        .map((sourceId) => exerciseSources[sourceId])
        .filter(Boolean);
      const sourceInfo = citedSources.length
        ? `<div class="exercise-source">Kilde: ${citedSources.map((source) => `<a href="${source.url}" target="_blank" rel="noreferrer">${source.title}</a>`).join(', ')}</div>`
        : '<div class="exercise-source source-needs-review">Kildegrunnlag ikke kontrollert ennå</div>';
      const videoLink = exercise.videoUrl
        ? `<a href="${exercise.videoUrl}" target="_blank" rel="noreferrer">Se video</a>`
        : '';

      return `
        <li>
          <div class="exercise-row">
            ${renderExerciseDemo(exercise)}
            <div class="exercise-copy">
              <strong>${label}</strong>
              ${instruction ? `<div class="exercise-instruction"><strong>Korrekt utførelse:</strong> ${instruction}</div>` : ''}
              ${exercisePlanInfo}
              ${equipmentInfo}
              ${sourceInfo}
              ${muscleTags ? `<div class="muscle-list">Muskelgrupper: ${muscleTags}</div>` : ''}
              ${videoLink ? `<div class="exercise-link">${videoLink}</div>` : ''}
            </div>
          </div>
        </li>
      `;
    })
    .join('');
}

function renderSuggestion(data) {
  suggestionTitle.textContent = data.title;
  suggestionExercises.innerHTML = renderExerciseListItems(getDisplayExerciseDetails(data));
  suggestionDuration.textContent = `Varighet: ${data.duration} min`;
  suggestionIntensity.textContent = `Intensitet: ${data.intensity}`;
  suggestionNotes.textContent = data.reason || data.notes;
}

function renderNextWeight(data) {
  nextWeight.textContent = `${data.suggestedWeight} kg`;
  nextWeightMessage.textContent = data.message;
}

function renderProgress(history) {
  const summary = getProgressSummary(history);
  const latestSummary = getLatestWorkoutSummary(history);

  progressTotal.textContent = String(summary.totalSessions);
  progressAverage.textContent = `${summary.averageLoad} kg`;
  progressFocus.textContent = summary.lastFocus === 'Ingen' ? 'Ingen' : summary.lastFocus;
  latestWorkout.textContent = latestSummary.date
    ? `${latestSummary.label} • ${latestSummary.focus} • ${latestSummary.load} kg`
    : latestSummary.label;
  progressTrend.textContent = summary.trendMessage;

  const weeklyStatus = getWeeklyGuidelineStatus(history, new Date(), currentUserAge);
  weeklyGuidelineBadge.textContent = weeklyStatus.isFullScore ? 'Godkjent uke' : 'Ikke godkjent uke';

  if (!summary.recentSessions.length) {
    progressList.innerHTML = '<li>Ingen treninger logget enda.</li>';
    return;
  }

  progressList.innerHTML = summary.recentSessions
    .map(
      (entry) =>
        `<li>${entry.date} • ${entry.focus} • ${entry.load} kg</li>`
    )
    .join('');
}

const weekdayLabels = {
  1: 'Mandag',
  2: 'Tirsdag',
  3: 'Onsdag',
  4: 'Torsdag',
  5: 'Fredag',
  6: 'Lørdag',
  7: 'Søndag'
};

const focusLabels = {
  styrke: 'Styrke',
  kondisjon: 'Kondisjon',
  generell: 'Generell helse'
};

function renderWeeklyPlan(plan) {
  if (!plan || !plan.days || !plan.days.length) {
    weeklyPlanList.innerHTML = '<li class="weekly-plan-empty">Ingen ukeplan generert enda. Velg antall treningsdager og trykk «Få ukeplan basert på dine mål for kommende uke».</li>';
    return;
  }

  const dayByWeekday = new Map(plan.days.map((day) => [day.isoWeekday, day]));

  weeklyPlanList.innerHTML = [1, 2, 3, 4, 5, 6, 7]
    .map((isoWeekday) => {
      const day = dayByWeekday.get(isoWeekday);
      const weekdayLabel = weekdayLabels[isoWeekday];

      if (!day) {
        return `
          <li class="weekly-plan-day weekly-plan-rest">
            <h3>${weekdayLabel}</h3>
            <p class="meta">Hviledag</p>
          </li>
        `;
      }

      const exerciseItems = renderExerciseListItems(getDisplayExerciseDetails(day.suggestion));

      return `
        <li class="weekly-plan-day">
          <h3>${weekdayLabel} &middot; ${focusLabels[day.focus] || day.focus}</h3>
          <ul class="exercise-list">${exerciseItems}</ul>
          <p class="meta">Varighet: ${day.suggestion.duration} min</p>
          <p class="meta">Intensitet: ${day.suggestion.intensity}</p>
          <p class="notes">${day.suggestion.reason || day.suggestion.notes || ''}</p>
        </li>
      `;
    })
    .join('');
}

async function updateView() {
  const formData = new FormData(form);
  const selectedTime = Number(formData.get('time'));
  const selectedFocus = formData.get('focus');
  const selectedEnergy = formData.get('energy');
  const selectedTrainingMode = formData.get('trainingMode');
  const selectedLevel = formData.get('level');
  const selectedEquipment = formData.getAll('profile-equipment');

  if (selectedTrainingMode === 'custom') {
    userProfile = writeUserProfile({ equipment: selectedEquipment });
    if (currentUser && hasRemoteProfile) {
      try {
        await saveProfileEquipment(supabase, currentUser.id, userProfile.equipment);
      } catch (error) {
        setAccountStatus(`Kunne ikke synkronisere utstyrslisten: ${accountErrorMessage(error)}`, true);
      }
    } else if (currentUser) {
      setAccountStatus('Lagre profilen din først for å synkronisere utstyrslisten til kontoen.');
    }
  }

  const suggestion = getWorkoutSuggestion({
    time: selectedTime,
    focus: selectedFocus,
    energy: selectedEnergy,
    history: workoutHistory,
    trainingMode: selectedTrainingMode,
    level: selectedLevel,
    availableEquipment: userProfile.equipment
  });

  const nextWeightSuggestion = suggestNextWeight(workoutHistory);

  if (!suggestionPage) {
    renderSuggestion(suggestion);
  }
  renderNextWeight(nextWeightSuggestion);
  renderProgress(workoutHistory);

  return suggestion;
}

function renderSuggestionEmptyState() {
  suggestionTitle.textContent = 'Ingen øktforslag generert enda.';
  suggestionExercises.innerHTML = '';
  suggestionDuration.textContent = '';
  suggestionIntensity.textContent = '';
  suggestionNotes.textContent = 'Bruk menyen eller chatten på forsiden for å få et øktforslag.';
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  void (async () => {
    const suggestion = await updateView();
    writeStoredSuggestion(suggestion);
    window.location.href = '?view=forslag';
  })();
});

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const parsedRequest = parseWorkoutRequest(chatText.value);
  const suggestion = getWorkoutSuggestion({
    time: parsedRequest.time,
    focus: parsedRequest.focus,
    energy: parsedRequest.energy,
    trainingMode: parsedRequest.trainingMode,
    level: parsedRequest.level,
    availableEquipment: parsedRequest.equipment,
    history: workoutHistory
  });

  writeStoredSuggestion(suggestion);
  window.location.href = '?view=forslag';
});

logForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(logForm);
  const selectedDate = formData.get('log-date') || todayLocalDateString();

  workoutHistory = logWorkout(workoutHistory, {
    date: selectedDate,
    focus: formData.get('log-focus') || 'styrke',
    duration: Number(formData.get('log-duration')) || 30,
    load: Number(formData.get('log-load')) || 0,
    performance: formData.get('log-performance') || 'good',
    intensity: formData.get('log-intensity') || 'medium'
  });

  writeStoredHistory(workoutHistory, historyStorageKey);
  void updateView();
  logForm.reset();
  document.getElementById('log-date').value = todayLocalDateString();
});

const DAY_OVERRIDE_FOCUS_OPTIONS = [
  { value: 'styrke', label: 'Styrke' },
  { value: 'kondisjon', label: 'Kondisjon' },
  { value: 'generell', label: 'Generell helse' }
];

const DAY_OVERRIDE_ENERGY_OPTIONS = [
  { value: 'low', label: 'Lav' },
  { value: 'medium', label: 'Middels' },
  { value: 'high', label: 'Høy' }
];

// 'custom' is deliberately excluded here too -- see the matching note in
// weeklyPlan.js's VALID_TRAINING_MODES.
const DAY_OVERRIDE_TRAINING_MODE_OPTIONS = [
  { value: 'home-bodyweight', label: 'Hjemme / kroppsvekt' },
  { value: 'home-dumbbell', label: 'Hjemme / manualer' },
  { value: 'home-kettlebell', label: 'Hjemme / kettlebell' },
  { value: 'gym', label: 'Senter / tyngre utstyr' }
];

const DAY_OVERRIDE_LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Nybegynner' },
  { value: 'intermediate', label: 'Middels erfaring' },
  { value: 'advanced', label: 'Erfaren' }
];

function buildDayOverrideOptions(options, selectedValue) {
  return options
    .map(({ value, label }) => `<option value="${value}" ${value === selectedValue ? 'selected' : ''}>${label}</option>`)
    .join('');
}

// Rebuilds the per-day override rows whenever the day-count dropdown changes.
// Each row covers focus, energy, trainingMode and level -- all four fields
// vary per day, not just energy -- pre-filled with what the automatic
// rotation and the main menu's current values would already produce, so
// submitting without touching any row still yields the same plan as before
// this feature existed.
function renderWeeklyPlanDayOverrides(dayCount) {
  const mainFormData = new FormData(form);
  const defaultEnergy = mainFormData.get('energy') || 'medium';
  const defaultTrainingMode = mainFormData.get('trainingMode') || 'home-dumbbell';
  const defaultLevel = mainFormData.get('level') || 'intermediate';

  const header = `
    <div class="weekly-plan-day-override weekly-plan-day-override-header">
      <span></span>
      <span>Fokus</span>
      <span>Energinivå</span>
      <span>Treningsoppsett</span>
      <span>Treningsnivå</span>
    </div>
  `;

  const rows = Array.from({ length: dayCount }, (_, i) => `
    <div class="weekly-plan-day-override">
      <label>Dag ${i + 1}</label>
      <select class="weekly-plan-day-focus" data-day-index="${i}">${buildDayOverrideOptions(DAY_OVERRIDE_FOCUS_OPTIONS, getFocusForDayIndex(i))}</select>
      <select class="weekly-plan-day-energy" data-day-index="${i}">${buildDayOverrideOptions(DAY_OVERRIDE_ENERGY_OPTIONS, defaultEnergy)}</select>
      <select class="weekly-plan-day-training-mode" data-day-index="${i}">${buildDayOverrideOptions(DAY_OVERRIDE_TRAINING_MODE_OPTIONS, defaultTrainingMode)}</select>
      <select class="weekly-plan-day-level" data-day-index="${i}">${buildDayOverrideOptions(DAY_OVERRIDE_LEVEL_OPTIONS, defaultLevel)}</select>
    </div>
  `).join('');

  weeklyPlanDayOverrides.innerHTML = header + rows;
}

weeklyPlanDaysSelect.addEventListener('change', () => {
  renderWeeklyPlanDayOverrides(Number(weeklyPlanDaysSelect.value));
});

renderWeeklyPlanDayOverrides(Number(weeklyPlanDaysSelect.value));

// Focus, energy, trainingMode and level are all set per day via the
// override rows (each pre-filled with a sensible default, so submitting
// without touching any row reproduces the automatic rotation/main-menu
// values). The week-wide `energy`/`trainingMode`/`level` params below are
// only a fallback for a row somehow missing from the DOM; `time` has no
// per-day equivalent and still comes from the main menu. Each row's
// trainingMode deliberately excludes "custom" -- see the matching note on
// weeklyPlan.js's VALID_TRAINING_MODES.
function generateWeeklyPlan() {
  const mainFormData = new FormData(form);
  const weeklyPlanFormData = new FormData(weeklyPlanForm);

  const dayOverrides = Array.from(
    weeklyPlanDayOverrides.querySelectorAll('.weekly-plan-day-override:not(.weekly-plan-day-override-header)')
  ).map((row) => ({
    focus: row.querySelector('.weekly-plan-day-focus').value,
    energy: row.querySelector('.weekly-plan-day-energy').value,
    trainingMode: row.querySelector('.weekly-plan-day-training-mode').value,
    level: row.querySelector('.weekly-plan-day-level').value
  }));

  weeklyPlan = getWeeklyPlan({
    trainingDays: weeklyPlanFormData.get('trainingDays'),
    time: Number(mainFormData.get('time')),
    energy: mainFormData.get('energy'),
    level: mainFormData.get('level'),
    trainingMode: mainFormData.get('trainingMode'),
    availableEquipment: userProfile.equipment,
    history: workoutHistory,
    dayOverrides
  });

  writeStoredWeeklyPlan(weeklyPlan, weeklyPlanStorageKey);
  window.location.href = '?view=ukeplan';
}

weeklyPlanForm.addEventListener('submit', (event) => {
  event.preventDefault();
  void generateWeeklyPlan();
});

weeklyPlanChatForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const parsedRequest = parseWeeklyPlanRequest(weeklyPlanChatText.value);

  weeklyPlan = getWeeklyPlan({
    trainingDays: parsedRequest.trainingDays,
    time: parsedRequest.time,
    energy: parsedRequest.energy,
    level: parsedRequest.level,
    trainingMode: parsedRequest.trainingMode,
    availableEquipment: parsedRequest.equipment,
    history: workoutHistory
  });

  writeStoredWeeklyPlan(weeklyPlan, weeklyPlanStorageKey);
  window.location.href = '?view=ukeplan';
});

document.getElementById('log-date').value = todayLocalDateString();
updateView();
renderWeeklyPlan(weeklyPlan);

// On the suggestion page (?view=forslag), replace whatever updateView() just
// rendered (the menu form's current/default selections) with the actually
// persisted suggestion -- or an empty/prompt state when nothing has been
// persisted yet (e.g. a bare/bookmarked visit).
if (suggestionPage) {
  const storedSuggestion = readStoredSuggestion();
  if (storedSuggestion) {
    renderSuggestion(storedSuggestion);
  } else {
    renderSuggestionEmptyState();
  }
}
