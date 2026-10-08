import { getWorkoutSuggestion } from '../features/workoutRecommendation.js';
import { suggestNextWeight } from '../features/nextWeightSuggestion.js';
import { userHistory } from '../data/userHistory.js';

const form = document.getElementById('workout-form');
const suggestionTitle = document.getElementById('suggestion-title');
const suggestionExercises = document.getElementById('suggestion-exercises');
const suggestionDuration = document.getElementById('suggestion-duration');
const suggestionIntensity = document.getElementById('suggestion-intensity');
const suggestionNotes = document.getElementById('suggestion-notes');
const nextWeight = document.getElementById('next-weight');
const nextWeightMessage = document.getElementById('next-weight-message');

function renderSuggestion(data) {
  suggestionTitle.textContent = data.title;
  suggestionExercises.innerHTML = data.exercises
    .map((exercise) => `<li>${exercise}</li>`)
    .join('');
  suggestionDuration.textContent = `Varighet: ${data.duration} min`;
  suggestionIntensity.textContent = `Intensitet: ${data.intensity}`;
  suggestionNotes.textContent = data.notes;
}

function renderNextWeight(data) {
  nextWeight.textContent = `${data.suggestedWeight} kg`;
  nextWeightMessage.textContent = data.message;
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
    history: userHistory
  });

  const nextWeightSuggestion = suggestNextWeight(userHistory);

  renderSuggestion(suggestion);
  renderNextWeight(nextWeightSuggestion);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  updateView();
});

updateView();
