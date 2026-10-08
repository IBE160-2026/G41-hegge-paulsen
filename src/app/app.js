import { getWorkoutSuggestion } from '../features/workoutRecommendation.js';
import { suggestNextWeight } from '../features/nextWeightSuggestion.js';
import { userHistory } from '../data/userHistory.js';

const app = {
  state: {
    time: 30,
    focus: 'styrke',
    energy: 'medium',
    history: userHistory
  }
};

export function renderWorkoutApp() {
  const suggestion = getWorkoutSuggestion({
    time: app.state.time,
    focus: app.state.focus,
    energy: app.state.energy,
    history: app.state.history
  });

  const nextWeight = suggestNextWeight(app.state.history);

  return {
    suggestion,
    nextWeight,
    history: app.state.history
  };
}

export function updateWorkoutState(nextState) {
  app.state = {
    ...app.state,
    ...nextState
  };

  return renderWorkoutApp();
}
