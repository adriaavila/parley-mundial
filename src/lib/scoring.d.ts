export type PredictionScore = {
  points: number;
  exact: boolean;
  correctResult: boolean;
  goalDifference: boolean;
  homeGoals: boolean;
  awayGoals: boolean;
  parts: { label: string; points: number }[];
};

export function matchOutcome(home: number, away: number): "home" | "away" | "draw";
export function calculatePredictionScore(
  prediction: { home: number; away: number },
  result: { home: number; away: number } | null
): PredictionScore;
