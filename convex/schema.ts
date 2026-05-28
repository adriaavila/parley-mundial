import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  tournaments: defineTable({
    slug: v.string(),
    name: v.string(),
    startsAt: v.number(),
    endsAt: v.number(),
    active: v.boolean(),
  }).index("by_slug", ["slug"]),

  // Extend the default users table with custom fields
  users: defineTable({
    name: v.string(), // Required
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    // Custom fields for ParlAI
    anonId: v.optional(v.string()),
    handle: v.string(), // Required
    avatar: v.string(), // Required
    favoriteTeam: v.optional(v.string()),
    passwordHash: v.optional(v.string()), // Retain for legacy migration
    passwordSalt: v.optional(v.string()), // Retain for legacy migration
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_anonId", ["anonId"])
    .index("by_email", ["email"])
    .index("by_handle", ["handle"]),

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

  chatMessages: defineTable({
    leagueId: v.id("leagues"),
    userId: v.id("users"),
    text: v.string(),
    createdAt: v.number(),
  })
    .index("by_league", ["leagueId"])
    .index("by_league_created", ["leagueId", "createdAt"]),
});
