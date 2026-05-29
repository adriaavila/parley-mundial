import test from "node:test";
import assert from "node:assert/strict";
import { calculatePredictionScore } from "../src/lib/scoring.js";

// Simulates a match weekend: several users with picks, results arriving in
// waves, and the league table recomputed each wave. Mirrors the server
// aggregation in convex/picks.ts (leagueLeaderboard) + convex/scoring.ts
// (scorePick / computeStreak) so a divergence here flags a divergence there.

// Six fixtures, kickoff order m1 < m2 < ... < m6 (start = match number).
const FIXTURE_START = (id) => Number(id.slice(1));

const RESULTS = {
  m1: { home: 2, away: 1 }, // home win
  m2: { home: 0, away: 0 }, // draw
  m3: { home: 1, away: 3 }, // away win
  m4: { home: 2, away: 2 }, // draw
  m5: { home: 3, away: 1 }, // home win
  m6: { home: 1, away: 0 }, // home win
};

const PICKS = {
  Ana: { m1: [2, 1], m2: [0, 0], m3: [1, 2], m4: [1, 1], m5: [2, 0], m6: [1, 0] },
  Beto: { m1: [1, 0], m2: [1, 1], m3: [0, 1], m4: [0, 0], m5: [2, 1], m6: [0, 1] },
  Caro: { m1: [2, 1], m2: [0, 0], m3: [2, 0], m4: [2, 2], m5: [3, 1], m6: [1, 0] },
  Diego: { m1: [1, 1], m2: [0, 0] }, // only two picks
};

function picksFor(name) {
  return Object.entries(PICKS[name]).map(([fixtureId, [home, away]]) => ({ fixtureId, home, away }));
}

// Mirror of convex/scoring.ts computeStreak: consecutive most-recent finished
// matches the user got right (result or exact), counting back from latest start.
function computeStreak(picks, results) {
  const finished = picks
    .filter((p) => results[p.fixtureId])
    .sort((a, b) => FIXTURE_START(b.fixtureId) - FIXTURE_START(a.fixtureId));
  let streak = 0;
  for (const p of finished) {
    const s = calculatePredictionScore(p, results[p.fixtureId]);
    if (s.correctResult || s.exact) streak += 1;
    else break;
  }
  return streak;
}

// Mirror of leagueLeaderboard row build + sort (no name tiebreak server-side).
function buildBoard(results) {
  const rows = Object.keys(PICKS).map((name) => {
    const picks = picksFor(name);
    const scored = picks.map((p) => calculatePredictionScore(p, results[p.fixtureId]));
    return {
      name,
      picks: picks.length,
      points: scored.reduce((sum, s) => sum + s.points, 0),
      exacts: scored.filter((s) => s.exact).length,
      correctResults: scored.filter((s) => s.correctResult).length,
      streak: computeStreak(picks, results),
    };
  });
  rows.sort(
    (a, b) =>
      b.points - a.points ||
      b.exacts - a.exacts ||
      b.correctResults - a.correctResults ||
      b.picks - a.picks ||
      a.name.localeCompare(b.name), // deterministic for the simulation
  );
  return rows;
}

const subset = (...ids) => Object.fromEntries(ids.map((id) => [id, RESULTS[id]]));
const row = (board, name) => board.find((r) => r.name === name);

test("no results yet → everyone at zero, board stable", () => {
  const board = buildBoard({});
  assert.deepEqual(board.map((r) => r.points), [0, 0, 0, 0]);
  assert.equal(board.every((r) => r.streak === 0), true);
});

test("wave 1 (m1,m2 in) → leaders emerge, unplayed picks score 0", () => {
  const board = buildBoard(subset("m1", "m2"));
  assert.equal(row(board, "Ana").points, 16); // 8 + 8
  assert.equal(row(board, "Caro").points, 16); // 8 + 8
  assert.equal(row(board, "Beto").points, 8); // 4 + 4
  assert.equal(row(board, "Diego").points, 9); // 1 (away goals) + 8
  // Ana & Caro tied on every server key → name breaks it deterministically.
  assert.deepEqual(board.slice(0, 2).map((r) => r.name), ["Ana", "Caro"]);
  // Diego (1 exact) edges Beto (0 exacts) on the exacts tiebreak at equal points.
  assert.deepEqual(board.slice(2).map((r) => r.name), ["Diego", "Beto"]);
});

test("wave 2 (m3,m4 in) → table reorders as more results land", () => {
  const board = buildBoard(subset("m1", "m2", "m3", "m4"));
  assert.equal(row(board, "Ana").points, 16 + 4 + 4); // 24
  assert.equal(row(board, "Caro").points, 16 + 0 + 8); // 24 (m3 wrong, m4 exact)
  assert.equal(row(board, "Beto").points, 8 + 3 + 4); // 15
  assert.equal(row(board, "Diego").points, 9); // no m3/m4 picks
  // Caro now has 3 exacts vs Ana's 2 → Caro takes the lead on tiebreak at equal points.
  assert.deepEqual(board.map((r) => r.name), ["Caro", "Ana", "Beto", "Diego"]);
});

test("full weekend → final standings, exacts, and streaks", () => {
  const board = buildBoard(RESULTS);
  assert.deepEqual(
    board.map((r) => [r.name, r.points]),
    [["Caro", 40], ["Ana", 36], ["Beto", 19], ["Diego", 9]],
  );
  assert.equal(row(board, "Caro").exacts, 5);
  assert.equal(row(board, "Ana").exacts, 3);
  assert.equal(row(board, "Beto").exacts, 0);
});

test("streak counts back from latest result and stops at first miss", () => {
  const results = RESULTS;
  assert.equal(computeStreak(picksFor("Ana"), results), 6); // all 6 correct/exact
  assert.equal(computeStreak(picksFor("Caro"), results), 3); // m6,m5,m4 exact; m3 wrong stops
  assert.equal(computeStreak(picksFor("Beto"), results), 0); // m6 wrong
  assert.equal(computeStreak(picksFor("Diego"), results), 1); // m2 exact; m1 wrong stops
});

test("a finished fixture with no pick never contributes points", () => {
  // Diego has no m3..m6 picks; adding those results must not change his total.
  assert.equal(row(buildBoard(subset("m1", "m2")), "Diego").points, 9);
  assert.equal(row(buildBoard(RESULTS), "Diego").points, 9);
});
