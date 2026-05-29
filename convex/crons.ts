import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Pull finished match scores into the `results` table. The action no-ops until
// FOOTBALL_API_URL is configured, so this is safe to run year-round; tighten
// the interval (or gate to the tournament window) once a provider is wired.
crons.interval("fetch match results", { minutes: 10 }, internal.results.fetchAndStore, {});

export default crons;
