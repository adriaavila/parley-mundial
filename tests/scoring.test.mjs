import test from "node:test";
import assert from "node:assert/strict";
import { calculatePredictionScore } from "../src/lib/scoring.js";

test("awards max points for exact scores", () => {
  const score = calculatePredictionScore({ home: 2, away: 1 }, { home: 2, away: 1 });
  assert.equal(score.points, 8);
  assert.equal(score.exact, true);
});

test("awards result plus goal difference when winner and margin are right", () => {
  const score = calculatePredictionScore({ home: 1, away: 0 }, { home: 2, away: 1 });
  assert.equal(score.points, 4);
  assert.deepEqual(score.parts.map((part) => part.label), ["Resultado correcto", "Diferencia de gol"]);
});

test("awards goal bonuses independently without the result", () => {
  const score = calculatePredictionScore({ home: 2, away: 2 }, { home: 2, away: 1 });
  assert.equal(score.points, 1);
  assert.deepEqual(score.parts.map((part) => part.label), ["Goles local"]);
});

test("unplayed matches score zero", () => {
  const score = calculatePredictionScore({ home: 2, away: 1 }, null);
  assert.equal(score.points, 0);
});
