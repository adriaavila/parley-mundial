import { mutation, query, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { scorePick } from "./scoring";
import { loadResultsMap } from "./results";
import { requireUser } from "./users";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode() {
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

async function requireLeagueMember(ctx: QueryCtx, sessionToken: string, leagueId: Id<"leagues">) {
  const user = await requireUser(ctx, sessionToken);
  const membership = await ctx.db
    .query("memberships")
    .withIndex("by_league_user", (q) => q.eq("leagueId", leagueId).eq("userId", user._id))
    .unique();
  if (!membership) throw new Error("No perteneces a esta liga");
  return { user, membership };
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

export const create = mutation({
  args: {
    sessionToken: v.string(),
    name: v.string(),
  },
  handler: async (ctx, { sessionToken, name }) => {
    const user = await requireUser(ctx, sessionToken);
    const userId = user._id;
    const trimmed = name.trim();
    if (trimmed.length < 2) throw new Error("Nombre de liga muy corto");
    if (trimmed.length > 40) throw new Error("Nombre de liga muy largo");

    let code = generateCode();
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const existing = await ctx.db
        .query("leagues")
        .withIndex("by_code", (q) => q.eq("code", code))
        .unique();
      if (!existing) break;
      code = generateCode();
    }

    const leagueId = await ctx.db.insert("leagues", {
      name: trimmed,
      code,
      ownerId: userId,
      createdAt: Date.now(),
    });

    await ctx.db.insert("memberships", {
      leagueId,
      userId,
      role: "owner",
      joinedAt: Date.now(),
    });

    return { leagueId, code };
  },
});

export const joinByCode = mutation({
  args: {
    sessionToken: v.string(),
    code: v.string(),
  },
  handler: async (ctx, { sessionToken, code }) => {
    const user = await requireUser(ctx, sessionToken);
    const userId = user._id;
    const normalized = code.trim().toUpperCase();
    const league = await ctx.db
      .query("leagues")
      .withIndex("by_code", (q) => q.eq("code", normalized))
      .unique();
    if (!league) throw new Error("Código inválido");

    const existing = await ctx.db
      .query("memberships")
      .withIndex("by_league_user", (q) => q.eq("leagueId", league._id).eq("userId", userId))
      .unique();
    if (!existing) {
      await ctx.db.insert("memberships", {
        leagueId: league._id,
        userId,
        role: "member",
        joinedAt: Date.now(),
      });
      const userMemberships = await ctx.db
        .query("memberships")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      const sourceMembership = userMemberships.find((membership) => membership.leagueId !== league._id);
      if (sourceMembership) {
        const sourcePicks = await ctx.db
          .query("picks")
          .withIndex("by_league_user", (q) => q.eq("leagueId", sourceMembership.leagueId).eq("userId", userId))
          .collect();
        for (const pick of sourcePicks) {
          await ctx.db.insert("picks", {
            leagueId: league._id,
            userId,
            fixtureId: pick.fixtureId,
            home: pick.home,
            away: pick.away,
            bonus: pick.bonus,
            updatedAt: pick.updatedAt,
          });
        }
      }
    }

    return { leagueId: league._id, code: league.code };
  },
});

export const listForUser = query({
  args: { sessionToken: v.optional(v.string()), userId: v.optional(v.string()) },
  handler: async (ctx, { sessionToken, userId: legacyUserId }) => {
    // Temporary deploy bridge: old production bundles still call with userId.
    const userId = sessionToken
      ? (await requireUser(ctx, sessionToken))._id
      : await userIdFromLegacyClient(ctx, legacyUserId);
    if (!userId) return [];
    const results = await loadResultsMap(ctx);
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const leagues: (Doc<"leagues"> & {
      memberCount: number;
      myRole: "owner" | "admin" | "member";
      currentLeader: string | null;
      myRank: number | null;
    })[] = [];
    for (const m of memberships) {
      const league = await ctx.db.get(m.leagueId);
      if (!league) continue;

      const leagueMembers = await ctx.db
        .query("memberships")
        .withIndex("by_league", (q) => q.eq("leagueId", league._id))
        .collect();

      const rows: { userId: Id<"users">; name: string; points: number; picks: number }[] = [];
      for (const member of leagueMembers) {
        const user = await ctx.db.get(member.userId);
        if (!user) continue;
        const picks = await ctx.db
          .query("picks")
          .withIndex("by_league_user", (q) => q.eq("leagueId", league._id).eq("userId", member.userId))
          .collect();
        const points = picks.reduce(
          (sum, pick) => sum + scorePick(pick, results[pick.fixtureId]).points,
          0,
        );
        rows.push({ userId: member.userId, name: user.name, points, picks: picks.length });
      }
      rows.sort((a, b) => b.points - a.points || b.picks - a.picks || a.name.localeCompare(b.name));
      leagues.push({
        ...league,
        memberCount: leagueMembers.length,
        myRole: (m.role ?? (league.ownerId === userId ? "owner" : "member")) as "owner" | "admin" | "member",
        currentLeader: rows[0]?.name ?? null,
        myRank: rows.findIndex((row) => row.userId === userId) + 1 || null,
      });
    }
    return leagues;
  },
});

export const leave = mutation({
  args: {
    sessionToken: v.string(),
    leagueId: v.id("leagues"),
  },
  handler: async (ctx, { sessionToken, leagueId }) => {
    const user = await requireUser(ctx, sessionToken);
    const userId = user._id;
    const league = await ctx.db.get(leagueId);
    if (!league) throw new Error("Liga no encontrada");
    if (league.ownerId === userId) throw new Error("El dueño no puede abandonar su liga");

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_league_user", (q) => q.eq("leagueId", leagueId).eq("userId", userId))
      .unique();
    if (!membership) throw new Error("No perteneces a esta liga");

    await ctx.db.delete(membership._id);
    return true;
  },
});

export const get = query({
  args: { sessionToken: v.optional(v.string()), leagueId: v.id("leagues") },
  handler: async (ctx, { sessionToken, leagueId }) => {
    if (sessionToken) await requireLeagueMember(ctx, sessionToken, leagueId);
    return await ctx.db.get(leagueId);
  },
});

export const members = query({
  args: { sessionToken: v.optional(v.string()), leagueId: v.id("leagues") },
  handler: async (ctx, { sessionToken, leagueId }) => {
    if (sessionToken) await requireLeagueMember(ctx, sessionToken, leagueId);
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_league", (q) => q.eq("leagueId", leagueId))
      .collect();

    const result: { userId: Id<"users">; name: string; handle: string; avatar: string; joinedAt: number }[] = [];
    for (const m of memberships) {
      const user = await ctx.db.get(m.userId);
      if (user) {
        result.push({
          userId: user._id,
          name: user.name,
          handle: user.handle,
          avatar: user.avatar,
          joinedAt: m.joinedAt,
        });
      }
    }
    return result;
  },
});

export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const normalized = code.trim().toUpperCase();
    const league = await ctx.db
      .query("leagues")
      .withIndex("by_code", (q) => q.eq("code", normalized))
      .unique();
    if (!league) return null;

    const owner = await ctx.db.get(league.ownerId);
    const leagueMembers = await ctx.db
      .query("memberships")
      .withIndex("by_league", (q) => q.eq("leagueId", league._id))
      .collect();

    return {
      _id: league._id,
      name: league.name,
      code: league.code,
      ownerName: owner?.name ?? "Invitado",
      memberCount: leagueMembers.length,
    };
  },
});
