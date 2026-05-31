import { mutation, query, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { requireUser } from "./users";
import { RELATOR_AVATAR, RELATOR_NAME, relatorOnMention } from "./relator";

const MAX_LEN = 500;
const RATE_WINDOW_MS = 10_000;
const RATE_MAX = 5;

async function assertMember(ctx: QueryCtx, leagueId: Id<"leagues">, userId: Id<"users">) {
  const membership = await ctx.db
    .query("memberships")
    .withIndex("by_league_user", (q) => q.eq("leagueId", leagueId).eq("userId", userId))
    .unique();
  if (!membership) throw new Error("No perteneces a esta liga");
}

export const send = mutation({
  args: {
    sessionToken: v.string(),
    leagueId: v.id("leagues"),
    text: v.string(),
  },
  handler: async (ctx, { sessionToken, leagueId, text }) => {
    const user = await requireUser(ctx, sessionToken);
    const trimmed = text.trim();
    if (trimmed.length === 0) throw new Error("Mensaje vacío");
    if (trimmed.length > MAX_LEN) throw new Error("Mensaje muy largo");
    await assertMember(ctx, leagueId, user._id);

    // Rate limit: at most RATE_MAX messages in last RATE_WINDOW_MS.
    const since = Date.now() - RATE_WINDOW_MS;
    const recent = await ctx.db
      .query("chatMessages")
      .withIndex("by_league_created", (q) => q.eq("leagueId", leagueId).gte("createdAt", since))
      .collect();
    const mine = recent.filter((m) => m.userId === user._id).length;
    if (mine >= RATE_MAX) throw new Error("Vas muy rápido, espera unos segundos");

    const messageId = await ctx.db.insert("chatMessages", {
      leagueId,
      userId: user._id,
      author: "user" as const,
      text: trimmed,
      createdAt: Date.now(),
    });

    // El Relator answers when summoned by name.
    if (/relator/i.test(trimmed)) {
      await relatorOnMention(ctx, leagueId);
    }

    return messageId;
  },
});

export const list = query({
  args: {
    sessionToken: v.optional(v.string()),
    leagueId: v.id("leagues"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { sessionToken, leagueId, limit }) => {
    if (sessionToken) {
      const user = await requireUser(ctx, sessionToken);
      await assertMember(ctx, leagueId, user._id);
    }
    const max = Math.min(Math.max(limit ?? 50, 1), 200);
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_league_created", (q) => q.eq("leagueId", leagueId))
      .order("desc")
      .take(max);

    const out: {
      _id: Id<"chatMessages">;
      userId?: Id<"users">;
      author: "user" | "relator";
      name: string;
      avatar: string;
      text: string;
      createdAt: number;
    }[] = [];
    for (const message of messages) {
      if (message.author === "relator") {
        out.push({
          _id: message._id,
          author: "relator",
          name: RELATOR_NAME,
          avatar: RELATOR_AVATAR,
          text: message.text,
          createdAt: message.createdAt,
        });
        continue;
      }
      if (!message.userId) continue;
      const user = await ctx.db.get(message.userId);
      if (!user) continue;
      out.push({
        _id: message._id,
        userId: message.userId,
        author: "user",
        name: user.name,
        avatar: user.avatar,
        text: message.text,
        createdAt: message.createdAt,
      });
    }
    // Return oldest-first for UI append.
    return out.reverse();
  },
});
