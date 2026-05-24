// Shared scoring logic + match results. Used by per-league and global leaderboards.

export const FIXTURE_STARTS: string[] = [
  "2026-06-11T20:00:00Z", "2026-06-12T03:00:00Z", "2026-06-12T20:00:00Z", "2026-06-13T20:00:00Z",
  "2026-06-13T23:00:00Z", "2026-06-14T02:00:00Z", "2026-06-13T02:00:00Z", "2026-06-14T05:00:00Z",
  "2026-06-14T18:00:00Z", "2026-06-15T00:00:00Z", "2026-06-14T21:00:00Z", "2026-06-15T03:00:00Z",
  "2026-06-15T20:00:00Z", "2026-06-16T02:00:00Z", "2026-06-15T17:00:00Z", "2026-06-15T23:00:00Z",
  "2026-06-16T20:00:00Z", "2026-06-16T23:00:00Z", "2026-06-17T02:00:00Z", "2026-06-17T05:00:00Z",
  "2026-06-17T18:00:00Z", "2026-06-18T03:00:00Z", "2026-06-17T21:00:00Z", "2026-06-18T00:00:00Z",
  "2026-06-18T17:00:00Z", "2026-06-19T02:00:00Z", "2026-06-18T20:00:00Z", "2026-06-18T23:00:00Z",
  "2026-06-19T23:00:00Z", "2026-06-20T01:30:00Z", "2026-06-19T20:00:00Z", "2026-06-20T04:00:00Z",
  "2026-06-20T21:00:00Z", "2026-06-21T01:00:00Z", "2026-06-20T18:00:00Z", "2026-06-21T05:00:00Z",
  "2026-06-21T20:00:00Z", "2026-06-22T02:00:00Z", "2026-06-21T17:00:00Z", "2026-06-21T23:00:00Z",
  "2026-06-22T22:00:00Z", "2026-06-23T01:00:00Z", "2026-06-22T18:00:00Z", "2026-06-23T04:00:00Z",
  "2026-06-23T18:00:00Z", "2026-06-24T03:00:00Z", "2026-06-23T21:00:00Z", "2026-06-24T00:00:00Z",
  "2026-06-24T20:00:00Z", "2026-06-24T20:00:00Z", "2026-06-24T20:00:00Z", "2026-06-24T20:00:00Z",
  "2026-06-24T23:00:00Z", "2026-06-24T23:00:00Z", "2026-06-26T03:00:00Z", "2026-06-26T03:00:00Z",
  "2026-06-25T21:00:00Z", "2026-06-25T21:00:00Z", "2026-06-26T00:00:00Z", "2026-06-26T00:00:00Z",
  "2026-06-27T04:00:00Z", "2026-06-27T04:00:00Z", "2026-06-27T01:00:00Z", "2026-06-27T01:00:00Z",
  "2026-06-26T20:00:00Z", "2026-06-26T20:00:00Z", "2026-06-28T03:00:00Z", "2026-06-28T03:00:00Z",
  "2026-06-28T00:30:00Z", "2026-06-28T00:30:00Z", "2026-06-27T22:00:00Z", "2026-06-27T22:00:00Z",
];

// Filled in as results come in. Keep here so league + global leaderboards use the same source.
export const MATCH_RESULTS: Record<string, { home: number; away: number }> = {};

export const VALID_FIXTURE = /^m([1-9]|[1-6][0-9]|7[0-2])$/;

export function fixtureStart(fixtureId: string) {
  const matchNo = Number(fixtureId.slice(1));
  return Date.parse(FIXTURE_STARTS[matchNo - 1] ?? "");
}

function outcome(home: number, away: number) {
  if (home === away) return "draw";
  return home > away ? "home" : "away";
}

export function scorePick(
  pick: { home: number; away: number },
  result?: { home: number; away: number }
) {
  if (!result) return { points: 0, exact: false, correctResult: false };
  const exact = pick.home === result.home && pick.away === result.away;
  const correctResult = outcome(pick.home, pick.away) === outcome(result.home, result.away);
  let points = exact ? 5 : correctResult ? 3 : 0;
  if (pick.home - pick.away === result.home - result.away) points += 1;
  if (pick.home === result.home) points += 1;
  if (pick.away === result.away) points += 1;
  return { points, exact, correctResult };
}
