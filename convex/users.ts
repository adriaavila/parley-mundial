import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

const AVATARS = ["⚽", "🏆", "🔥", "⭐", "🇦🇷", "🇧🇷", "🇲🇽", "🇪🇸", "🇫🇷", "🇺🇾", "🇺🇸", "🇨🇴"];
const SESSION_DAYS = 60;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeHandle(handle: string) {
  const normalized = handle.trim().toLowerCase().replace(/^@/, "").replace(/[^a-z0-9_]/g, "").slice(0, 18);
  return normalized || "mundialero";
}

function makeHandle(name: string) {
  return normalizeHandle(name) || "mundialero";
}

function randomAvatar(name: string) {
  const trimmed = name.trim();
  if (trimmed.length > 0) return trimmed[0].toUpperCase();
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}

function randomSecret(bytes = 24) {
  const values = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
}

async function sha256(input: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}

async function passwordHash(password: string, salt: string) {
  return await sha256(`${salt}:${password}`);
}

async function createSession(ctx: MutationCtx, userId: Id<"users">) {
  const token = randomSecret(32);
  await ctx.db.insert("sessions", {
    userId,
    tokenHash: await sha256(token),
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  });
  return token;
}

async function userBySession(ctx: QueryCtx, sessionToken: string) {
  const tokenHash = await sha256(sessionToken);
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
    .unique();
  if (!session || session.expiresAt < Date.now()) return null;
  return await ctx.db.get(session.userId);
}

export const signup = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    handle: v.optional(v.string()),
    avatar: v.optional(v.string()),
    favoriteTeam: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const name = args.name.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Email inválido");
    if (args.password.length < 8) throw new Error("La clave debe tener mínimo 8 caracteres");
    if (name.length < 2) throw new Error("Elige tu nombre de guerra");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) throw new Error("Ese email ya tiene cuenta");

    const handle = normalizeHandle(args.handle ?? makeHandle(name));
    const salt = randomSecret(16);
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      email,
      passwordSalt: salt,
      passwordHash: await passwordHash(args.password, salt),
      name,
      handle,
      avatar: args.avatar?.trim() || randomAvatar(name),
      favoriteTeam: args.favoriteTeam,
      createdAt: now,
      updatedAt: now,
    });

    return {
      userId,
      sessionToken: await createSession(ctx, userId),
      name,
      handle,
      avatar: args.avatar?.trim() || randomAvatar(name),
      favoriteTeam: args.favoriteTeam,
    };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, password }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizeEmail(email)))
      .unique();
    if (!user?.passwordHash || !user.passwordSalt) throw new Error("Credenciales inválidas");
    const hash = await passwordHash(password, user.passwordSalt);
    if (hash !== user.passwordHash) throw new Error("Credenciales inválidas");

    return {
      userId: user._id,
      sessionToken: await createSession(ctx, user._id),
      name: user.name,
      handle: user.handle,
      avatar: user.avatar,
      favoriteTeam: user.favoriteTeam,
    };
  },
});

export const me = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const user = await userBySession(ctx, sessionToken);
    if (!user) return null;
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      handle: user.handle,
      avatar: user.avatar,
      favoriteTeam: user.favoriteTeam,
    };
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    handle: v.string(),
    avatar: v.string(),
    favoriteTeam: v.optional(v.string()),
  },
  handler: async (ctx, { userId, name, handle, avatar, favoriteTeam }) => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) throw new Error("El nombre es muy corto");
    await ctx.db.patch(userId, {
      name: trimmedName,
      handle: normalizeHandle(handle),
      avatar: avatar.trim() || randomAvatar(trimmedName),
      favoriteTeam,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(userId);
  },
});

export const logout = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const tokenHash = await sha256(sessionToken);
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
      .unique();
    if (session) await ctx.db.delete(session._id);
    return true;
  },
});

export const upsertByAnonId = mutation({
  args: {
    anonId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, { anonId, name }) => {
    const trimmed = name.trim() || "Mundialero";
    const existing = await ctx.db
      .query("users")
      .withIndex("by_anonId", (q) => q.eq("anonId", anonId))
      .unique();

    if (existing) {
      if (existing.name !== trimmed) {
        await ctx.db.patch(existing._id, {
          name: trimmed,
          handle: makeHandle(trimmed),
          avatar: randomAvatar(trimmed),
          updatedAt: Date.now(),
        });
      }
      return existing._id;
    }

    return await ctx.db.insert("users", {
      anonId,
      name: trimmed,
      handle: makeHandle(trimmed),
      avatar: randomAvatar(trimmed),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const get = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});
