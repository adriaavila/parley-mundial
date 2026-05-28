import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

const AVATARS = ["⚽", "🏆", "🔥", "⭐", "🇦🇷", "🇧🇷", "🇲🇽", "🇪🇸", "🇫🇷", "🇺🇾", "🇺🇸", "🇨🇴"];

function normalizeHandle(handle: string) {
  const normalized = handle.trim().toLowerCase().replace(/^@/, "").replace(/[^a-z0-9_]/g, "").slice(0, 18);
  return normalized || "mundialero";
}

function randomAvatar(name: string) {
  const trimmed = name.trim();
  if (trimmed.length > 0) return trimmed[0].toUpperCase();
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Sesión inválida");
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("Usuario no encontrado");
  return user;
}

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      handle: user.handle || "mundialero",
      avatar: user.avatar || "⚽",
      favoriteTeam: user.favoriteTeam,
    };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.string(),
    handle: v.string(),
    avatar: v.string(),
    favoriteTeam: v.optional(v.string()),
  },
  handler: async (ctx, { name, handle, avatar, favoriteTeam }) => {
    const user = await requireUser(ctx);
    const trimmedName = name.trim();
    if (trimmedName.length < 2) throw new Error("El nombre es muy corto");
    await ctx.db.patch(user._id, {
      name: trimmedName,
      handle: normalizeHandle(handle),
      avatar: avatar.trim() || randomAvatar(trimmedName),
      favoriteTeam,
      updatedAt: Date.now(),
    });
    const updated = await ctx.db.get(user._id);
    if (!updated) return null;
    return {
      _id: updated._id,
      email: updated.email,
      name: updated.name,
      handle: updated.handle,
      avatar: updated.avatar,
      favoriteTeam: updated.favoriteTeam,
    };
  },
});

export const get = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return {
      _id: user._id,
      name: user.name,
      handle: user.handle,
      avatar: user.avatar,
      favoriteTeam: user.favoriteTeam,
    };
  },
});

export const migrateOldAccounts = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let migratedCount = 0;

    for (const user of users) {
      if (user.passwordHash && user.passwordSalt) {
        const existingAccount = await ctx.db
          .query("authAccounts")
          .withIndex("userIdAndProvider", (q) =>
            q.eq("userId", user._id).eq("provider", "password")
          )
          .unique();

        if (!existingAccount && user.email) {
          const secretJson = JSON.stringify({
            passwordHash: user.passwordHash,
            passwordSalt: user.passwordSalt,
          });

          await ctx.db.insert("authAccounts", {
            userId: user._id,
            provider: "password",
            providerAccountId: user.email,
            secret: secretJson,
          });
          migratedCount++;
        }
      }
    }
    return { migratedCount, totalUsers: users.length };
  },
});
