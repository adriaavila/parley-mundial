import { internalAction, internalMutation, query, type QueryCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { FIXTURE_STARTS, VALID_FIXTURE, type ResultMap } from "./scoring";

// Build fixtureId -> {home,away} from the results table. Every leaderboard /
// streak query calls this, so reading the table here is what makes those
// queries reactive: a cron upsert re-runs them and pushes new standings live.
export async function loadResultsMap(ctx: QueryCtx): Promise<ResultMap> {
  const rows = await ctx.db.query("results").collect();
  const map: ResultMap = {};
  for (const row of rows) map[row.fixtureId] = { home: row.home, away: row.away };
  return map;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("results").collect();
    return rows.map((row) => ({
      fixtureId: row.fixtureId,
      home: row.home,
      away: row.away,
      updatedAt: row.updatedAt,
    }));
  },
});

function validScore(home: number, away: number) {
  return (
    Number.isInteger(home) &&
    Number.isInteger(away) &&
    home >= 0 &&
    away >= 0 &&
    home <= 99 &&
    away <= 99
  );
}

export const upsert = internalMutation({
  args: { fixtureId: v.string(), home: v.number(), away: v.number() },
  handler: async (ctx, { fixtureId, home, away }) => {
    if (!VALID_FIXTURE.test(fixtureId) || !validScore(home, away)) return false;
    const existing = await ctx.db
      .query("results")
      .withIndex("by_fixture", (q) => q.eq("fixtureId", fixtureId))
      .unique();
    if (existing) {
      if (existing.home === home && existing.away === away) return false; // no change, skip write
      await ctx.db.patch(existing._id, { home, away, updatedAt: Date.now() });
      return true;
    }
    await ctx.db.insert("results", { fixtureId, home, away, updatedAt: Date.now() });
    return true;
  },
});

// Remove a result (e.g. one entered in error). Internal: corrections come from
// the cron/admin side, not from clients.
export const remove = internalMutation({
  args: { fixtureId: v.string() },
  handler: async (ctx, { fixtureId }) => {
    const existing = await ctx.db
      .query("results")
      .withIndex("by_fixture", (q) => q.eq("fixtureId", fixtureId))
      .unique();
    if (existing) await ctx.db.delete(existing._id);
    return existing !== null;
  },
});

type NormalizedResult = { fixtureId: string; home: number; away: number };
type ApiSportsResponseItem = {
  fixture?: {
    status?: { short?: unknown };
    date?: unknown;
  };
  goals?: {
    home?: unknown;
    away?: unknown;
  };
};

// Unique kickoff time -> fixtureId. Group-finale slots share a kickoff (4 at
// once), so those are ambiguous by time alone and can't be auto-mapped from a
// provider that only gives kickoff + teams we don't model server-side.
function fixtureIdForKickoff(utcDate: string): string | null {
  const ms = Date.parse(utcDate);
  if (!Number.isFinite(ms)) return null;
  let found: string | null = null;
  for (let i = 0; i < FIXTURE_STARTS.length; i += 1) {
    if (Date.parse(FIXTURE_STARTS[i]) === ms) {
      if (found) return null; // ambiguous: more than one fixture at this kickoff
      found = `m${i + 1}`;
    }
  }
  return found;
}

// Accepts either our normalized array or a football-data.org `{ matches: [] }`
// payload. Pointing FOOTBALL_API_URL at a provider that emits the normalized
// shape (e.g. a thin transform) is the robust path; the football-data branch
// is best-effort and skips fixtures it can't unambiguously map.
function extractResults(json: unknown): NormalizedResult[] {
  if (Array.isArray(json)) {
    const out: NormalizedResult[] = [];
    for (const item of json as Record<string, unknown>[]) {
      const fixtureId = item?.fixtureId;
      const home = item?.home;
      const away = item?.away;
      const finished = item?.finished ?? true;
      if (typeof fixtureId === "string" && typeof home === "number" && typeof away === "number" && finished) {
        out.push({ fixtureId, home, away });
      }
    }
    return out;
  }
  if (json && typeof json === "object" && Array.isArray((json as { response?: unknown }).response)) {
    const out: NormalizedResult[] = [];
    for (const item of (json as { response: ApiSportsResponseItem[] }).response) {
      const statusShort = item?.fixture?.status?.short;
      const finished = typeof statusShort === "string" && ["FT", "AET", "PEN"].includes(statusShort);
      if (!finished) continue;
      const home = item?.goals?.home;
      const away = item?.goals?.away;
      if (typeof home !== "number" || typeof away !== "number") continue;
      const date = item?.fixture?.date;
      if (typeof date !== "string") continue;
      const fixtureId = fixtureIdForKickoff(date);
      if (!fixtureId) continue;
      out.push({ fixtureId, home, away });
    }
    return out;
  }
  if (json && typeof json === "object" && Array.isArray((json as { matches?: unknown }).matches)) {
    const out: NormalizedResult[] = [];
    for (const match of (json as { matches: Record<string, unknown>[] }).matches) {
      if (match?.status !== "FINISHED") continue;
      const ft = (match?.score as { fullTime?: { home?: unknown; away?: unknown } } | undefined)?.fullTime;
      if (!ft || typeof ft.home !== "number" || typeof ft.away !== "number") continue;
      const fixtureId = fixtureIdForKickoff(String(match?.utcDate ?? ""));
      if (!fixtureId) continue;
      out.push({ fixtureId, home: ft.home, away: ft.away });
    }
    return out;
  }
  return [];
}

// Fetch results action. Orchestrates the rate-limited API calls and schedules
// subsequent checks dynamically based on game schedules and current outcomes.
export const fetchAndStore = internalAction({
  args: {},
  handler: async (ctx) => {
    const { shouldFetch, nextCheckTime } = await ctx.runMutation(
      internal.results.checkAndSchedule,
      { now: Date.now() }
    );

    if (!shouldFetch) {
      console.log(
        "Fetch skipped (rate limit or already fetched recently). Next check scheduled at:",
        nextCheckTime ? new Date(nextCheckTime).toISOString() : "none"
      );
      return { fetched: 0, updated: 0 };
    }

    const url = process.env.FOOTBALL_API_URL;
    if (!url) {
      console.warn("FOOTBALL_API_URL not set — results auto-fetch is a no-op.");
      return { fetched: 0, updated: 0 };
    }
    const apiKey = process.env.FOOTBALL_API_KEY;
    let json: unknown;
    try {
      const headers: Record<string, string> = {};
      if (apiKey) {
        if (url.includes("api-sports.io") || url.includes("api-football")) {
          headers["x-apisports-key"] = apiKey;
        } else {
          headers["X-Auth-Token"] = apiKey;
          headers["Authorization"] = `Bearer ${apiKey}`;
        }
      }
      const response = await fetch(url, { headers });
      if (!response.ok) {
        console.error(`Results fetch failed: ${response.status} ${await response.text()}`);
        return { fetched: 0, updated: 0 };
      }
      json = await response.json();
    } catch (error) {
      console.error("Results fetch error:", error);
      return { fetched: 0, updated: 0 };
    }

    const results = extractResults(json);
    let updated = 0;
    for (const result of results) {
      const changed = await ctx.runMutation(internal.results.upsert, result);
      if (changed) updated += 1;
    }
    return { fetched: results.length, updated };
  },
});

// Helper mutation to rate-limit fetches and schedule the next check time dynamically.
// This reduces the number of requests to API-Sports dramatically.
export const checkAndSchedule = internalMutation({
  args: { now: v.number() },
  handler: async (ctx, { now }) => {
    // 1. Get current active tournament to check/update lastFetchTime
    const tournament = await ctx.db
      .query("tournaments")
      .withIndex("by_slug", (q) => q.eq("slug", "mundial-2026"))
      .unique();

    const lastFetch = tournament?.lastFetchTime ?? 0;
    
    // Rate limit: Skip fetch if we fetched in the last 5 minutes (300,000 ms)
    const shouldFetch = now - lastFetch >= 5 * 60 * 1000;

    if (shouldFetch && tournament) {
      await ctx.db.patch(tournament._id, { lastFetchTime: now });
    }

    // 2. Compute the next check time
    const results = await ctx.db.query("results").collect();
    const finishedFixtureIds = new Set(results.map((r) => r.fixtureId));

    let inProgressOrRecentCount = 0;
    let nextKickoff: number | null = null;

    for (let i = 0; i < FIXTURE_STARTS.length; i++) {
      const fixtureId = `m${i + 1}`;
      if (finishedFixtureIds.has(fixtureId)) {
        continue;
      }
      const kickoff = Date.parse(FIXTURE_STARTS[i]);

      // Active / live match (started but less than 4 hours ago)
      if (now >= kickoff && now < kickoff + 4 * 60 * 60 * 1000) {
        inProgressOrRecentCount++;
      }

      // Next kickoff in the future
      if (kickoff > now) {
        if (nextKickoff === null || kickoff < nextKickoff) {
          nextKickoff = kickoff;
        }
      }
    }

    let nextCheckTime: number | null = null;
    if (inProgressOrRecentCount > 0) {
      // Check again in 15 minutes if there is an active match we don't have results for yet.
      // This handles extra time, penalties, or match delays.
      nextCheckTime = now + 15 * 60 * 1000;
    } else if (nextKickoff !== null) {
      // Schedule check for 1 hour and 50 minutes after the next kickoff
      nextCheckTime = nextKickoff + 110 * 60 * 1000;
    }

    // 3. Schedule the next check if one is determined
    if (nextCheckTime !== null) {
      await ctx.scheduler.runAt(nextCheckTime, internal.results.fetchAndStore, {});
    }

    return { shouldFetch, nextCheckTime };
  },
});
