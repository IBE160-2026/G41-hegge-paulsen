import { getWorkoutSuggestion } from '../features/recommendationEngine.js';
import { exerciseSources } from '../data/exerciseCatalog.js';
import { profileEquipmentOptions, readUserProfile, writeUserProfile } from '../features/userProfile.js';
import { suggestNextWeight } from '../features/weightProgression.js';
import {
  getLatestWorkoutSummary,
  getProgressSummary,
  logWorkout,
  readStoredHistory,
  writeStoredHistory
} from '../features/trainingLog.js';
import { userHistory } from '../data/sampleHistory.js';

const form = document.getElementById('workout-form');
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
const logForm = document.getElementById('workout-log-form');
const trainingModeSelect = document.getElementById('training-mode');
const customEquipmentPanel = document.getElementById('custom-equipment-panel');
const profileEquipmentOptionsContainer = document.getElementById('profile-equipment-options');

let workoutHistory = readStoredHistory();
let userProfile = readUserProfile();

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

renderEquipmentOptions(profileEquipmentOptionsContainer, 'profile-equipment', userProfile.equipment);

function updateCustomEquipmentVisibility() {
  customEquipmentPanel.hidden = trainingModeSelect.value !== 'custom';
}

trainingModeSelect.addEventListener('change', updateCustomEquipmentVisibility);
updateCustomEquipmentVisibility();

if (!workoutHistory.length) {
  workoutHistory = [...userHistory];
  writeStoredHistory(workoutHistory);
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

function renderSuggestion(data) {
  suggestionTitle.textContent = data.title;

  const exerciseDetails = data.exerciseDetails && data.exerciseDetails.length
    ? data.exerciseDetails
    : data.exercises.map((exerciseName) => ({
        name: { no: exerciseName, en: exerciseName },
        instructions: { no: 'Se mer om øvelsen i treningskatalogen.', en: 'See more about the exercise in the training catalog.' },
        videoUrl: '',
        animation: 'generic',
        muscles: ['Generell styrke']
      }));

  suggestionExercises.innerHTML = exerciseDetails
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

function updateView() {
  const formData = new FormData(form);
  const selectedTime = Number(formData.get('time'));
  const selectedFocus = formData.get('focus');
  const selectedEnergy = formData.get('energy');
  const selectedTrainingMode = formData.get('trainingMode');
  const selectedLevel = formData.get('level');
  const selectedEquipment = formData.getAll('profile-equipment');

  if (selectedTrainingMode === 'custom') {
    userProfile = writeUserProfile({ equipment: selectedEquipment });
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

  renderSuggestion(suggestion);
  renderNextWeight(nextWeightSuggestion);
  renderProgress(workoutHistory);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  updateView();
});

logForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(logForm);
  const selectedDate = formData.get('log-date') || new Date().toISOString().slice(0, 10);

  workoutHistory = logWorkout(workoutHistory, {
    date: selectedDate,
    focus: formData.get('log-focus') || 'styrke',
    duration: Number(formData.get('log-duration')) || 30,
    load: Number(formData.get('log-load')) || 0,
    performance: formData.get('log-performance') || 'good'
  });

  writeStoredHistory(workoutHistory);
  updateView();
  logForm.reset();
  document.getElementById('log-date').value = new Date().toISOString().slice(0, 10);
});

const today = new Date().toISOString().slice(0, 10);
document.getElementById('log-date').value = today;
updateView();
