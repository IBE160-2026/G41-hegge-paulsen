import { getWorkoutSuggestion } from '../features/recommendationEngine.js';
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

let workoutHistory = readStoredHistory();

if (!workoutHistory.length) {
  workoutHistory = [...userHistory];
  writeStoredHistory(workoutHistory);
}

function renderSuggestion(data) {
  suggestionTitle.textContent = data.title;

  const exerciseDetails = data.exerciseDetails && data.exerciseDetails.length
    ? data.exerciseDetails
    : data.exercises.map((exerciseName) => ({
        name: { no: exerciseName, en: exerciseName },
        instructions: { no: 'Se mer om øvelsen i treningskatalogen.', en: 'See more about the exercise in the training catalog.' },
        videoUrl: ''
      }));

  suggestionExercises.innerHTML = exerciseDetails
    .map((exercise) => {
      const label = exercise.name && exercise.name.no && exercise.name.en
        ? `${exercise.name.no} (${exercise.name.en})`
        : exercise;
      const instruction = exercise.instructions?.no || exercise.description?.no || '';
      const videoLink = exercise.videoUrl
        ? `<a href="${exercise.videoUrl}" target="_blank" rel="noreferrer">Se video</a>`
        : '';

      return `
        <li>
          <strong>${label}</strong>
          ${instruction ? `<div>${instruction}</div>` : ''}
          ${videoLink ? `<div class="exercise-link">${videoLink}</div>` : ''}
        </li>
      `;
    })
    .join('');

  suggestionDuration.textContent = `Varighet: ${data.duration} min`;
  suggestionIntensity.textContent = `Intensitet: ${data.intensity}`;
  suggestionNotes.textContent = data.notes;
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

  const suggestion = getWorkoutSuggestion({
    time: selectedTime,
    focus: selectedFocus,
    energy: selectedEnergy,
    history: workoutHistory
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
