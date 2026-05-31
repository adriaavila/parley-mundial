import { mutation, query, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { VALID_FIXTURE, fixtureStart, scorePick, type ResultMap } from "./scoring";
import { loadResultsMap } from "./results";
import { requireUser } from "./users";
import { relatorOnPick } from "./relator";

// Streak = consecutive most-recent finished matches where the user got the
// result right (or better). Counts back from the latest finished pick.
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

async function requireLeagueMember(ctx: QueryCtx, sessionToken: string, leagueId: Id<"leagues">) {
  const user = await requireUser(ctx, sessionToken);
  const membership = await ctx.db
    .query("memberships")
    .withIndex("by_league_user", (q) => q.eq("leagueId", leagueId).eq("userId", user._id))
    .unique();
  if (!membership) throw new Error("No perteneces a la liga");
  return user;
}

async function userIdFromLegacyClient(ctx: QueryCtx, id?: string): Promise<Id<"users"> | null> {
  if (!id) return null;

  const userId = ctx.db.normalizeId("users", id);
  if (userId) return userId;

  const sessionId = ctx.db.normalizeId("sessions", id);
  if (!sessionId) return null;

  const session = await ctx.db.get(sessionId);
  if (!session || session.expiresAt < Date.now()) return null;
  return session.userId;
}

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
        // El Relator taunts a first-time pick (insert only — edits stay quiet).
        await relatorOnPick(ctx, member.leagueId, user.name, home, away);
      }
    }

    return savedId;
  },
});

export const listForUserInLeague = query({
  args: {
    sessionToken: v.optional(v.string()),
    leagueId: v.id("leagues"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { sessionToken, leagueId, userId: legacyUserId }) => {
    // Temporary deploy bridge: old production bundles still call with userId.
    const userId = sessionToken
      ? (await requireLeagueMember(ctx, sessionToken, leagueId))._id
      : await userIdFromLegacyClient(ctx, legacyUserId);
    if (!userId) return [];
    return await ctx.db
      .query("picks")
      .withIndex("by_league_user", (q) => q.eq("leagueId", leagueId).eq("userId", userId))
      .collect();
  },
});

export const recentInLeague = query({
  args: { sessionToken: v.optional(v.string()), leagueId: v.id("leagues") },
  handler: async (ctx, { sessionToken, leagueId }) => {
    if (sessionToken) await requireLeagueMember(ctx, sessionToken, leagueId);
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
  args: { sessionToken: v.optional(v.string()), leagueId: v.id("leagues") },
  handler: async (ctx, { sessionToken, leagueId }) => {
    if (sessionToken) await requireLeagueMember(ctx, sessionToken, leagueId);
    const results = await loadResultsMap(ctx);
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

      const scored = picks.map((pick) => scorePick(pick, results[pick.fixtureId]));
      const points = scored.reduce((sum, item) => sum + item.points, 0);

      rows.push({
        userId: user._id,
        name: user.name,
        handle: user.handle,
        avatar: user.avatar,
        picks: picks.length,
        exacts: scored.filter((item) => item.exact).length,
        correctResults: scored.filter((item) => item.correctResult).length,
        streak: computeStreak(picks, results),
        points,
      });
    }

    return rows.sort((a, b) => b.points - a.points || b.exacts - a.exacts || b.correctResults - a.correctResults || b.picks - a.picks);
  },
});
