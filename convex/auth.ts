import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import { Email } from "@convex-dev/auth/providers/Email";
import { Scrypt } from "lucia";

declare const process: { env: Record<string, string | undefined> };

const resetPasswordProvider = {
  ...Email({
    sendVerificationRequest: async ({ identifier, token }) => {
      console.log(`\n==================================================`);
      console.log(`CÓDIGO DE RECUPERACIÓN DE CONTRASEÑA`);
      console.log(`Para: ${identifier}`);
      console.log(`Código: ${token}`);
      console.log(`==================================================\n`);
    }
  }),
  id: "reset-password",
  generateVerificationToken: async () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },
};

async function sha256(input: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}

async function verifyOldPassword(password: string, hashJson: string): Promise<boolean> {
  try {
    const { passwordHash, passwordSalt } = JSON.parse(hashJson);
    if (!passwordHash || !passwordSalt) return false;
    const computedHash = await sha256(`${passwordSalt}:${password}`);
    return computedHash === passwordHash;
  } catch {
    return false;
  }
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      reset: resetPasswordProvider,
      crypto: {
        hashSecret: async (password: string) => {
          return await new Scrypt().hash(password);
        },
        verifySecret: async (password: string, hash: string) => {
          if (hash.startsWith("{")) {
            return await verifyOldPassword(password, hash);
          }
          return await new Scrypt().verify(hash, password);
        },
      },
      profile(params) {
        const email = (params.email as string).trim().toLowerCase();
        const name = (params.name as string || "").trim();
        const handle = (params.handle as string || "").trim().toLowerCase().replace(/^@/, "").replace(/[^a-z0-9_]/g, "").slice(0, 18) || "mundialero";

        // Custom registration validation
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Email inválido");
        if (params.flow === "signUp") {
          if (name.length < 2) throw new Error("Elige tu nombre de guerra");
        }

        const profileData: Record<string, any> = {
          email,
          name: name || "Mundialero",
          handle: handle || "mundialero",
          avatar: (params.avatar as string || "⚽").trim(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        if (params.favoriteTeam) {
          profileData.favoriteTeam = (params.favoriteTeam as string).trim();
        }

        return profileData as any;
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        const name = profile.name || profile.given_name || "Mundialero";
        const baseHandle = name.trim().toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 18) || "mundialero";
        return {
          email: profile.email,
          name: name,
          avatar: "⚽",
          handle: baseHandle,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      }
    }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId }) {
      if (existingUserId) return; // User was updated, not created
      
      const user = await ctx.db.get(userId);
      if (!user) return;

      // Ensure user has a unique handle
      const baseHandle = user.handle || user.name.trim().toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 18) || "mundialero";
      let handle = baseHandle;
      let counter = 1;
      while (true) {
        const dup = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("handle"), handle))
          .first();
        if (!dup || dup._id === userId) break;
        handle = `${baseHandle}${counter}`;
        counter++;
      }

      const avatar = user.avatar || "⚽";

      await ctx.db.patch(userId, {
        handle,
        avatar,
        createdAt: user.createdAt || Date.now(),
        updatedAt: Date.now(),
      });
    }
  }
});
