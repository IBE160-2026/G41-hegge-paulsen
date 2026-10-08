export function suggestNextWeight(history = []) {
  if (!history.length) {
    return {
      suggestedWeight: 0,
      message: 'For lite data til å gi et pålitelig forslag.'
    };
  }

  const recentAverage = history.reduce((sum, entry) => sum + (entry.load || 0), 0) / history.length;
  const lastEntry = history[history.length - 1];

  const suggestedWeight = Math.max(0, Math.round(recentAverage * 1.05));

  if (lastEntry && lastEntry.performance === 'fair') {
    return {
      suggestedWeight: Math.max(0, suggestedWeight - 5),
      message: 'Sist økt var litt krevende. Vi anbefaler en liten nedjustering.'
    };
  }

  return {
    suggestedWeight,
    message: 'Basert på historikken er dette et konservativt neste-trinn.'
  };
}
