// "El Relator" — the AI referee. Template-driven (no LLM): deterministic,
// $0, instant, no abuse/cost risk. Event-triggered only (never per-message)
// per the cost rules in .docs/viral-mkt/raw-ideas.md §9. LLM spice is a
// post-tournament upgrade; these helpers are the cheap, viral core.
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { scorePick } from "./scoring";

export const RELATOR_NAME = "El Relator";
export const RELATOR_AVATAR = "🎙️";

function rotate<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function post(
  ctx: MutationCtx,
  leagueId: Id<"leagues">,
  relatorKind: string,
  text: string,
) {
  await ctx.db.insert("chatMessages", {
    leagueId,
    author: "relator" as const,
    relatorKind,
    text,
    createdAt: Date.now(),
  });
}

// Trigger 1 — fires when a member makes their FIRST pick for a fixture in a
// league (insert path only; edits don't re-trigger).
export async function relatorOnPick(
  ctx: MutationCtx,
  leagueId: Id<"leagues">,
  name: string,
  home: number,
  away: number,
) {
  await post(
    ctx,
    leagueId,
    "pick",
    rotate([
      `${name} predijo ${home}-${away}. Anotado. Si falla, el grupo no lo dejará olvidarlo.`,
      `Declaración peligrosa de ${name}: ${home}-${away}. Queda registrado para burlas futuras.`,
      `${name} ya tiró su ${home}-${away}. Valiente. O inocente. El fútbol decide.`,
    ]),
  );
}

// Trigger 3 — fires when someone mentions "relator" in chat.
export async function relatorOnMention(ctx: MutationCtx, leagueId: Id<"leagues">) {
  await post(
    ctx,
    leagueId,
    "mention",
    rotate([
      "¿Me llamaste? El Relator solo habla con datos. Tira tu pick y hablamos.",
      "Aquí estoy, repartiendo justicia futbolera. ¿Quién va último?",
      "El que pregunta por mí suele ir perdiendo. ¿Coincidencia?",
    ]),
  );
}

// Trigger 2 — fires when a final result lands. Fans out one announcement to
// every league that had picks for that fixture, calling out the best pick.
export async function relatorOnResult(
  ctx: MutationCtx,
  fixtureId: string,
  home: number,
  away: number,
) {
  const picks = await ctx.db
    .query("picks")
    .withIndex("by_fixture", (q) => q.eq("fixtureId", fixtureId))
    .collect();
  if (picks.length === 0) return;

  const byLeague = new Map<Id<"leagues">, typeof picks>();
  for (const p of picks) {
    const arr = byLeague.get(p.leagueId) ?? [];
    arr.push(p);
    byLeague.set(p.leagueId, arr);
  }

  for (const [leagueId, leaguePicks] of byLeague) {
    let best: { name: string; points: number; exact: boolean } | null = null;
    for (const p of leaguePicks) {
      const scored = scorePick(p, { home, away });
      if (scored.points <= 0) continue;
      if (!best || scored.points > best.points) {
        const u = await ctx.db.get(p.userId);
        best = { name: u?.name ?? "Alguien", points: scored.points, exact: scored.exact };
      }
    }

    let text: string;
    if (!best) {
      text = `📣 Final ${home}-${away}. Nadie le atinó en esta liga. Puro vendehumo 😏.`;
    } else if (best.exact) {
      text = `📣 Final ${home}-${away}. ${best.name} CLAVÓ el marcador (+${best.points}) 👑. El resto, a llorar.`;
    } else {
      text = `📣 Final ${home}-${away}. ${best.name} le atinó al resultado (+${best.points}). Bien jugado.`;
    }
    await post(ctx, leagueId, "result", text);
  }
}
