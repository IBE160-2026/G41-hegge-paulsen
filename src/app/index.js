import { renderWorkoutApp, updateWorkoutState } from './app.js';

const appState = renderWorkoutApp();
console.log('Workout suggestion:', appState.suggestion);
console.log('Next weight:', appState.nextWeight);

const updated = updateWorkoutState({
  time: 20,
  energy: 'low',
  focus: 'styrke'
});

console.log('Updated workout suggestion:', updated.suggestion);
console.log('Updated next weight:', updated.nextWeight);
