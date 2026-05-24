import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tournaments: defineTable({
    slug: v.string(),
    name: v.string(),
    startsAt: v.number(),
    endsAt: v.number(),
    active: v.boolean(),
  }).index("by_slug", ["slug"]),

  users: defineTable({
    anonId: v.optional(v.string()),
    email: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    passwordSalt: v.optional(v.string()),
    name: v.string(),
    handle: v.string(),
    avatar: v.string(),
    favoriteTeam: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_anonId", ["anonId"])
    .index("by_email", ["email"])
    .index("by_handle", ["handle"]),

  sessions: defineTable({
    userId: v.id("users"),
    tokenHash: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_tokenHash", ["tokenHash"])
    .index("by_user", ["userId"]),

  leagues: defineTable({
    name: v.string(),
    code: v.string(),
    ownerId: v.id("users"),
    createdAt: v.optional(v.number()),
  }).index("by_code", ["code"]),

  memberships: defineTable({
    leagueId: v.id("leagues"),
    userId: v.id("users"),
    role: v.optional(v.union(v.literal("owner"), v.literal("admin"), v.literal("member"))),
    joinedAt: v.number(),
  })
    .index("by_league", ["leagueId"])
    .index("by_user", ["userId"])
    .index("by_league_user", ["leagueId", "userId"]),

  picks: defineTable({
    leagueId: v.id("leagues"),
    userId: v.id("users"),
    fixtureId: v.string(),
    home: v.number(),
    away: v.number(),
    bonus: v.array(v.string()),
    updatedAt: v.number(),
  })
    .index("by_user_fixture", ["userId", "fixtureId"])
    .index("by_league_fixture", ["leagueId", "fixtureId"])
    .index("by_league_user", ["leagueId", "userId"]),
});
