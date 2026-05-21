export function matchOutcome(home, away) {
  if (home === away) return "draw";
  return home > away ? "home" : "away";
}

export function calculatePredictionScore(prediction, result) {
  if (!result || typeof result.home !== "number" || typeof result.away !== "number") {
    return {
      points: 0,
      exact: false,
      correctResult: false,
      goalDifference: false,
      homeGoals: false,
      awayGoals: false,
      parts: [],
    };
  }

  const exact = prediction.home === result.home && prediction.away === result.away;
  const correctResult = matchOutcome(prediction.home, prediction.away) === matchOutcome(result.home, result.away);
  const goalDifference = prediction.home - prediction.away === result.home - result.away;
  const homeGoals = prediction.home === result.home;
  const awayGoals = prediction.away === result.away;
  const parts = [];

  if (exact) parts.push({ label: "Marcador exacto", points: 5 });
  else if (correctResult) parts.push({ label: "Resultado correcto", points: 3 });
  if (goalDifference) parts.push({ label: "Diferencia de gol", points: 1 });
  if (homeGoals) parts.push({ label: "Goles local", points: 1 });
  if (awayGoals) parts.push({ label: "Goles visitante", points: 1 });

  return {
    points: parts.reduce((sum, part) => sum + part.points, 0),
    exact,
    correctResult,
    goalDifference,
    homeGoals,
    awayGoals,
    parts,
  };
}
