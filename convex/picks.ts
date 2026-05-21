import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

const VALID_FIXTURE = /^m([1-9]|[1-6][0-9]|7[0-2])$/;
const FIXTURE_STARTS = [
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
const MATCH_RESULTS: Record<string, { home: number; away: number }> = {};

function fixtureStart(fixtureId: string) {
  const matchNo = Number(fixtureId.slice(1));
  return Date.parse(FIXTURE_STARTS[matchNo - 1] ?? "");
}

function outcome(home: number, away: number) {
  if (home === away) return "draw";
  return home > away ? "home" : "away";
}

function scorePick(pick: { home: number; away: number }, result?: { home: number; away: number }) {
  if (!result) return { points: 0, exact: false, correctResult: false };
  const exact = pick.home === result.home && pick.away === result.away;
  const correctResult = outcome(pick.home, pick.away) === outcome(result.home, result.away);
  let points = exact ? 5 : correctResult ? 3 : 0;
  if (pick.home - pick.away === result.home - result.away) points += 1;
  if (pick.home === result.home) points += 1;
  if (pick.away === result.away) points += 1;
  return { points, exact, correctResult };
}

export const save = mutation({
  args: {
    leagueId: v.id("leagues"),
    userId: v.id("users"),
    fixtureId: v.string(),
    home: v.number(),
    away: v.number(),
    bonus: v.array(v.string()),
  },
  handler: async (ctx, { leagueId, userId, fixtureId, home, away, bonus }) => {
    if (!VALID_FIXTURE.test(fixtureId)) throw new Error("Partido inválido");
    if (home < 0 || home > 20 || away < 0 || away > 20) throw new Error("Marcador inválido");
    if (bonus.length > 5) throw new Error("Demasiados bonus");
    const startsAt = fixtureStart(fixtureId);
    if (!Number.isFinite(startsAt) || Date.now() >= startsAt) throw new Error("Ya cerró este partido");

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_league_user", (q) => q.eq("leagueId", leagueId).eq("userId", userId))
      .unique();
    if (!membership) throw new Error("No perteneces a la liga");

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    let savedId: Id<"picks"> | null = null;
    for (const member of memberships) {
      const existing = await ctx.db
        .query("picks")
        .withIndex("by_league_user", (q) => q.eq("leagueId", member.leagueId).eq("userId", userId))
        .filter((q) => q.eq(q.field("fixtureId"), fixtureId))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, { home, away, bonus, updatedAt: Date.now() });
        savedId = existing._id;
      } else {
        savedId = await ctx.db.insert("picks", {
          leagueId: member.leagueId,
          userId,
          fixtureId,
          home,
          away,
          bonus,
          updatedAt: Date.now(),
        });
      }
    }

    return savedId;
  },
});

export const listForUserInLeague = query({
  args: {
    leagueId: v.id("leagues"),
    userId: v.id("users"),
  },
  handler: async (ctx, { leagueId, userId }) => {
    return await ctx.db
      .query("picks")
      .withIndex("by_league_user", (q) => q.eq("leagueId", leagueId).eq("userId", userId))
      .collect();
  },
});

export const recentInLeague = query({
  args: { leagueId: v.id("leagues") },
  handler: async (ctx, { leagueId }) => {
    const picks = await ctx.db
      .query("picks")
      .withIndex("by_league_fixture", (q) => q.eq("leagueId", leagueId))
      .order("desc")
      .take(12);

    const enriched: { userId: Id<"users">; userName: string; fixtureId: string; home: number; away: number; updatedAt: number }[] = [];
    for (const pick of picks) {
      const user = await ctx.db.get(pick.userId);
      if (!user) continue;
      enriched.push({
        userId: pick.userId,
        userName: user.name,
        fixtureId: pick.fixtureId,
        home: pick.home,
        away: pick.away,
        updatedAt: pick.updatedAt,
      });
    }
    return enriched.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const leagueLeaderboard = query({
  args: { leagueId: v.id("leagues") },
  handler: async (ctx, { leagueId }) => {
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_league", (q) => q.eq("leagueId", leagueId))
      .collect();

    const rows: {
      userId: Id<"users">;
      name: string;
      handle: string;
      avatar: string;
      picks: number;
      exacts: number;
      correctResults: number;
      points: number;
    }[] = [];
    for (const m of memberships) {
      const user = await ctx.db.get(m.userId);
      if (!user) continue;

      const picks = await ctx.db
        .query("picks")
        .withIndex("by_league_user", (q) => q.eq("leagueId", leagueId).eq("userId", m.userId))
        .collect();

      const scored = picks.map((pick) => scorePick(pick, MATCH_RESULTS[pick.fixtureId]));
      const points = scored.reduce((sum, item) => sum + item.points, 0);

      rows.push({
        userId: user._id,
        name: user.name,
        handle: user.handle,
        avatar: user.avatar,
        picks: picks.length,
        exacts: scored.filter((item) => item.exact).length,
        correctResults: scored.filter((item) => item.correctResult).length,
        points,
      });
    }

    return rows.sort((a, b) => b.points - a.points || b.exacts - a.exacts || b.correctResults - a.correctResults || b.picks - a.picks);
  },
});
