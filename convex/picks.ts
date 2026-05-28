import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { MATCH_RESULTS, VALID_FIXTURE, fixtureStart, scorePick } from "./scoring";

// Streak = consecutive most-recent finished matches where the user got the
// result right (or better). Counts back from the latest finished pick.
function computeStreak(picks: { fixtureId: string; home: number; away: number }[]) {
  const finished = picks
    .filter((pick) => MATCH_RESULTS[pick.fixtureId])
    .sort((a, b) => fixtureStart(b.fixtureId) - fixtureStart(a.fixtureId));
  let streak = 0;
  for (const pick of finished) {
    const scored = scorePick(pick, MATCH_RESULTS[pick.fixtureId]);
    if (scored.correctResult || scored.exact) streak += 1;
    else break;
  }
  return streak;
}
import { requireUser } from "./users";

export const save = mutation({
  args: {
    sessionToken: v.string(),
    leagueId: v.id("leagues"),
    fixtureId: v.string(),
    home: v.number(),
    away: v.number(),
    bonus: v.array(v.string()),
  },
  handler: async (ctx, { sessionToken, leagueId, fixtureId, home, away, bonus }) => {
    const user = await requireUser(ctx, sessionToken);
    const userId = user._id;
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
      streak: number;
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
        streak: computeStreak(picks),
        points,
      });
    }

    return rows.sort((a, b) => b.points - a.points || b.exacts - a.exacts || b.correctResults - a.correctResults || b.picks - a.picks);
  },
});
