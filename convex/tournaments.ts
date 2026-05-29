import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { fixtureStart, scorePick, type ResultMap } from "./scoring";
import { loadResultsMap } from "./results";

function computeStreak(picks: { fixtureId: string; home: number; away: number }[], results: ResultMap) {
  const finished = picks
    .filter((pick) => results[pick.fixtureId])
    .sort((a, b) => fixtureStart(b.fixtureId) - fixtureStart(a.fixtureId));
  let streak = 0;
  for (const pick of finished) {
    const scored = scorePick(pick, results[pick.fixtureId]);
    if (scored.correctResult || scored.exact) streak += 1;
    else break;
  }
  return streak;
}

const ACTIVE_SLUG = "mundial-2026";
const ACTIVE_NAME = "Mundial 2026";
// Kickoff Estadio Azteca + tentative final date.
const ACTIVE_STARTS_AT = Date.parse("2026-06-11T18:00:00-06:00");
const ACTIVE_ENDS_AT = Date.parse("2026-07-19T18:00:00-06:00");

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tournaments").collect();
  },
});

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("tournaments")
      .withIndex("by_slug", (q) => q.eq("slug", ACTIVE_SLUG))
      .unique();
  },
});

/**
 * Idempotently ensures the active tournament row exists. Safe to call from the
 * client on first mount. Returns the tournament row.
 */
export const ensureActive = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("tournaments")
      .withIndex("by_slug", (q) => q.eq("slug", ACTIVE_SLUG))
      .unique();
    if (existing) return existing;
    const id = await ctx.db.insert("tournaments", {
      slug: ACTIVE_SLUG,
      name: ACTIVE_NAME,
      startsAt: ACTIVE_STARTS_AT,
      endsAt: ACTIVE_ENDS_AT,
      active: true,
    });
    return await ctx.db.get(id);
  },
});

/**
 * Global leaderboard across all leagues. Picks are duplicated per league when a
 * user saves (see `picks.save`), so we de-duplicate by `(userId, fixtureId)`
 * keeping the most recent `updatedAt`. Each user appears once with aggregated
 * points across the whole tournament.
 */
export const globalLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const max = Math.min(Math.max(limit ?? 100, 1), 500);
    const results = await loadResultsMap(ctx);
    const picks = await ctx.db.query("picks").collect();

    const dedup = new Map<string, (typeof picks)[number]>();
    for (const pick of picks) {
      const key = `${pick.userId}|${pick.fixtureId}`;
      const prev = dedup.get(key);
      if (!prev || prev.updatedAt < pick.updatedAt) dedup.set(key, pick);
    }

    const byUser = new Map<
      string,
      {
        points: number;
        picks: number;
        exacts: number;
        correctResults: number;
        userPicks: { fixtureId: string; home: number; away: number }[];
      }
    >();
    for (const pick of dedup.values()) {
      const scored = scorePick(pick, results[pick.fixtureId]);
      const key = String(pick.userId);
      const entry =
        byUser.get(key) ?? { points: 0, picks: 0, exacts: 0, correctResults: 0, userPicks: [] };
      entry.points += scored.points;
      entry.picks += 1;
      if (scored.exact) entry.exacts += 1;
      if (scored.correctResult) entry.correctResults += 1;
      entry.userPicks.push({ fixtureId: pick.fixtureId, home: pick.home, away: pick.away });
      byUser.set(key, entry);
    }

    const rows: {
      userId: Id<"users">;
      name: string;
      handle: string;
      avatar: string;
      favoriteTeam?: string;
      picks: number;
      exacts: number;
      correctResults: number;
      streak: number;
      points: number;
    }[] = [];

    for (const [userIdStr, agg] of byUser) {
      const userId = userIdStr as Id<"users">;
      const user = await ctx.db.get(userId);
      if (!user) continue;
      const { userPicks, ...rest } = agg;
      rows.push({
        userId,
        name: user.name,
        handle: user.handle,
        avatar: user.avatar,
        favoriteTeam: user.favoriteTeam,
        streak: computeStreak(userPicks, results),
        ...rest,
      });
    }

    rows.sort(
      (a, b) =>
        b.points - a.points ||
        b.exacts - a.exacts ||
        b.correctResults - a.correctResults ||
        b.picks - a.picks ||
        a.name.localeCompare(b.name)
    );

    return rows.slice(0, max);
  },
});
