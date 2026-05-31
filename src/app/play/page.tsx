"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { calculatePredictionScore } from "@/lib/scoring.js";

// Canonical site URL — share links always point to the production domain,
// even when shared from a preview deploy or *.vercel.app host.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://parlai.frontia.app";
const DOMAIN_LABEL = "parlai.frontia.app";
const joinLink = (code: string, src?: string) =>
  `${SITE_URL}/join/${code}${src ? `?src=${src}` : ""}`;

type Screen = "inicio" | "partidos" | "tabla" | "liga" | "perfil";

type Team = {
  id: string;
  name: string;
  code: string;
  flag: string;
  colors: [string, string];
  accent: string;
  confed: string;
};

type Fixture = {
  id: string;
  matchNo: number;
  group: string;
  date: string;
  time: string;
  utc: string;
  home: string;
  away: string;
  venue: string;
  city: string;
};

type LocalPick = {
  home: number;
  away: number;
  bonus: string[];
};

type AuthUser = {
  _id: Id<"users">;
  email?: string;
  name: string;
  handle: string;
  avatar: string;
  favoriteTeam?: string;
};

type LeagueSummary = {
  _id: Id<"leagues">;
  name: string;
  code: string;
  ownerId: Id<"users">;
  memberCount?: number;
  currentLeader?: string | null;
  myRank?: number | null;
  myRole?: "owner" | "admin" | "member";
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const teams: Team[] = [
  { id: "mex", name: "México", code: "MEX", flag: "🇲🇽", colors: ["#006847", "#ce1126"], accent: "#c6ff3d", confed: "CONCACAF" },
  { id: "rsa", name: "Sudáfrica", code: "RSA", flag: "🇿🇦", colors: ["#007749", "#ffb612"], accent: "#ffcc33", confed: "CAF" },
  { id: "kor", name: "Corea del Sur", code: "KOR", flag: "🇰🇷", colors: ["#0047a0", "#cd2e3a"], accent: "#3b82ff", confed: "AFC" },
  { id: "cze", name: "Chequia", code: "CZE", flag: "🇨🇿", colors: ["#11457e", "#d7141a"], accent: "#3b82ff", confed: "UEFA" },
  { id: "can", name: "Canada", code: "CAN", flag: "🇨🇦", colors: ["#e31b23", "#ffffff"], accent: "#ff4d5e", confed: "CONCACAF" },
  { id: "qat", name: "Qatar", code: "QAT", flag: "🇶🇦", colors: ["#8a1538", "#ffffff"], accent: "#ff3dc6", confed: "AFC" },
  { id: "sui", name: "Suiza", code: "SUI", flag: "🇨🇭", colors: ["#d52b1e", "#ffffff"], accent: "#ff4d5e", confed: "UEFA" },
  { id: "bih", name: "Bosnia y Herzegovina", code: "BIH", flag: "🇧🇦", colors: ["#002f6c", "#feca00"], accent: "#ffcc33", confed: "UEFA" },
  { id: "bra", name: "Brasil", code: "BRA", flag: "🇧🇷", colors: ["#009b3a", "#ffdf00"], accent: "#ffcc33", confed: "CONMEBOL" },
  { id: "mar", name: "Marruecos", code: "MAR", flag: "🇲🇦", colors: ["#c1272d", "#006233"], accent: "#ff4d5e", confed: "CAF" },
  { id: "sco", name: "Escocia", code: "SCO", flag: "🏴", colors: ["#005eb8", "#ffffff"], accent: "#3b82ff", confed: "UEFA" },
  { id: "hai", name: "Haití", code: "HAI", flag: "🇭🇹", colors: ["#00209f", "#d21034"], accent: "#3b82ff", confed: "CONCACAF" },
  { id: "usa", name: "Estados Unidos", code: "USA", flag: "🇺🇸", colors: ["#3c3b6e", "#b22234"], accent: "#3b82ff", confed: "CONCACAF" },
  { id: "par", name: "Paraguay", code: "PAR", flag: "🇵🇾", colors: ["#d52b1e", "#0038a8"], accent: "#ff4d5e", confed: "CONMEBOL" },
  { id: "aus", name: "Australia", code: "AUS", flag: "🇦🇺", colors: ["#012169", "#ffcd00"], accent: "#ffcc33", confed: "AFC" },
  { id: "tur", name: "Turquía", code: "TUR", flag: "🇹🇷", colors: ["#e30a17", "#ffffff"], accent: "#ff4d5e", confed: "UEFA" },
  { id: "esp", name: "España", code: "ESP", flag: "🇪🇸", colors: ["#aa151b", "#f1bf00"], accent: "#ffcc33", confed: "UEFA" },
  { id: "cpv", name: "Cabo Verde", code: "CPV", flag: "🇨🇻", colors: ["#003893", "#cf2027"], accent: "#3b82ff", confed: "CAF" },
  { id: "ksa", name: "Arabia Saudita", code: "KSA", flag: "🇸🇦", colors: ["#006c35", "#ffffff"], accent: "#c6ff3d", confed: "AFC" },
  { id: "uru", name: "Uruguay", code: "URU", flag: "🇺🇾", colors: ["#0038a8", "#ffffff"], accent: "#3b82ff", confed: "CONMEBOL" },
  { id: "bel", name: "Bélgica", code: "BEL", flag: "🇧🇪", colors: ["#000000", "#fae042"], accent: "#ffcc33", confed: "UEFA" },
  { id: "egy", name: "Egipto", code: "EGY", flag: "🇪🇬", colors: ["#ce1126", "#000000"], accent: "#ff4d5e", confed: "CAF" },
  { id: "irn", name: "Irán", code: "IRN", flag: "🇮🇷", colors: ["#239f40", "#da0000"], accent: "#c6ff3d", confed: "AFC" },
  { id: "nzl", name: "Nueva Zelanda", code: "NZL", flag: "🇳🇿", colors: ["#00247d", "#cc142b"], accent: "#3b82ff", confed: "OFC" },
  { id: "fra", name: "Francia", code: "FRA", flag: "🇫🇷", colors: ["#0055a4", "#ef4135"], accent: "#3b82ff", confed: "UEFA" },
  { id: "sen", name: "Senegal", code: "SEN", flag: "🇸🇳", colors: ["#00853f", "#fdef42"], accent: "#c6ff3d", confed: "CAF" },
  { id: "nor", name: "Noruega", code: "NOR", flag: "🇳🇴", colors: ["#ba0c2f", "#00205b"], accent: "#3b82ff", confed: "UEFA" },
  { id: "irq", name: "Irak", code: "IRQ", flag: "🇮🇶", colors: ["#ce1126", "#007a3d"], accent: "#ff4d5e", confed: "AFC" },
  { id: "arg", name: "Argentina", code: "ARG", flag: "🇦🇷", colors: ["#74acdf", "#ffffff"], accent: "#7df9ff", confed: "CONMEBOL" },
  { id: "alg", name: "Argelia", code: "ALG", flag: "🇩🇿", colors: ["#006233", "#ffffff"], accent: "#c6ff3d", confed: "CAF" },
  { id: "aut", name: "Austria", code: "AUT", flag: "🇦🇹", colors: ["#ed2939", "#ffffff"], accent: "#ff4d5e", confed: "UEFA" },
  { id: "jor", name: "Jordania", code: "JOR", flag: "🇯🇴", colors: ["#007a3d", "#ce1126"], accent: "#ff4d5e", confed: "AFC" },
  { id: "eng", name: "Inglaterra", code: "ENG", flag: "🏴", colors: ["#ffffff", "#cf142b"], accent: "#ff4d5e", confed: "UEFA" },
  { id: "cro", name: "Croacia", code: "CRO", flag: "🇭🇷", colors: ["#ff0000", "#171796"], accent: "#ff4d5e", confed: "UEFA" },
  { id: "gha", name: "Ghana", code: "GHA", flag: "🇬🇭", colors: ["#fcd116", "#006b3f"], accent: "#ffcc33", confed: "CAF" },
  { id: "pan", name: "Panamá", code: "PAN", flag: "🇵🇦", colors: ["#005293", "#d21034"], accent: "#ff4d5e", confed: "CONCACAF" },
  { id: "ned", name: "Países Bajos", code: "NED", flag: "🇳🇱", colors: ["#ae1c28", "#21468b"], accent: "#ff6633", confed: "UEFA" },
  { id: "jpn", name: "Japón", code: "JPN", flag: "🇯🇵", colors: ["#bc002d", "#ffffff"], accent: "#ff4d5e", confed: "AFC" },
  { id: "tun", name: "Túnez", code: "TUN", flag: "🇹🇳", colors: ["#e70013", "#ffffff"], accent: "#ff4d5e", confed: "CAF" },
  { id: "swe", name: "Suecia", code: "SWE", flag: "🇸🇪", colors: ["#006aa7", "#fecc00"], accent: "#ffcc33", confed: "UEFA" },
  { id: "ger", name: "Alemania", code: "GER", flag: "🇩🇪", colors: ["#000000", "#dd0000"], accent: "#ffcc33", confed: "UEFA" },
  { id: "ecu", name: "Ecuador", code: "ECU", flag: "🇪🇨", colors: ["#ffdd00", "#034ea2"], accent: "#ffcc33", confed: "CONMEBOL" },
  { id: "civ", name: "Costa de Marfil", code: "CIV", flag: "🇨🇮", colors: ["#f77f00", "#009e60"], accent: "#ff6633", confed: "CAF" },
  { id: "cuw", name: "Curaçao", code: "CUW", flag: "🇨🇼", colors: ["#002b7f", "#f9e814"], accent: "#3b82ff", confed: "CONCACAF" },
  { id: "por", name: "Portugal", code: "POR", flag: "🇵🇹", colors: ["#006600", "#ff0000"], accent: "#c6ff3d", confed: "UEFA" },
  { id: "uzb", name: "Uzbekistán", code: "UZB", flag: "🇺🇿", colors: ["#0099b5", "#1eb53a"], accent: "#7df9ff", confed: "AFC" },
  { id: "col", name: "Colombia", code: "COL", flag: "🇨🇴", colors: ["#fcd116", "#003893"], accent: "#ffcc33", confed: "CONMEBOL" },
  { id: "cod", name: "Congo RD", code: "COD", flag: "🇨🇩", colors: ["#007fff", "#f7d618"], accent: "#3b82ff", confed: "CAF" },
];

const tid = (code: string) => code.toLowerCase();

const fixtures: Fixture[] = (
  [
    ["A", "2026-06-11", "20:00", "MEX", "RSA", "Estadio Azteca", "Ciudad de México"],
    ["A", "2026-06-12", "03:00", "KOR", "CZE", "Estadio Akron", "Guadalajara"],
    ["B", "2026-06-12", "20:00", "CAN", "BIH", "BMO Field", "Toronto"],
    ["B", "2026-06-13", "20:00", "QAT", "SUI", "Levi's Stadium", "Santa Clara"],
    ["C", "2026-06-13", "23:00", "BRA", "MAR", "MetLife Stadium", "Nueva York/Nueva Jersey"],
    ["C", "2026-06-14", "02:00", "HAI", "SCO", "Gillette Stadium", "Boston"],
    ["D", "2026-06-13", "02:00", "USA", "PAR", "SoFi Stadium", "Los Angeles"],
    ["D", "2026-06-14", "05:00", "AUS", "TUR", "BC Place", "Vancouver"],
    ["E", "2026-06-14", "18:00", "GER", "CUW", "NRG Stadium", "Houston"],
    ["E", "2026-06-15", "00:00", "CIV", "ECU", "Lincoln Financial Field", "Philadelphia"],
    ["F", "2026-06-14", "21:00", "NED", "JPN", "AT&T Stadium", "Dallas"],
    ["F", "2026-06-15", "03:00", "SWE", "TUN", "Estadio BBVA", "Monterrey"],
    ["G", "2026-06-15", "20:00", "BEL", "EGY", "Lumen Field", "Seattle"],
    ["G", "2026-06-16", "02:00", "IRN", "NZL", "SoFi Stadium", "Los Angeles"],
    ["H", "2026-06-15", "17:00", "ESP", "CPV", "Mercedes-Benz Stadium", "Atlanta"],
    ["H", "2026-06-15", "23:00", "KSA", "URU", "Hard Rock Stadium", "Miami"],
    ["I", "2026-06-16", "20:00", "FRA", "SEN", "MetLife Stadium", "Nueva York/Nueva Jersey"],
    ["I", "2026-06-16", "23:00", "IRQ", "NOR", "Gillette Stadium", "Boston"],
    ["J", "2026-06-17", "02:00", "ARG", "ALG", "Arrowhead Stadium", "Kansas City"],
    ["J", "2026-06-17", "05:00", "AUT", "JOR", "Levi's Stadium", "Santa Clara"],
    ["K", "2026-06-17", "18:00", "POR", "COD", "NRG Stadium", "Houston"],
    ["K", "2026-06-18", "03:00", "UZB", "COL", "Estadio Azteca", "Ciudad de México"],
    ["L", "2026-06-17", "21:00", "ENG", "CRO", "AT&T Stadium", "Dallas"],
    ["L", "2026-06-18", "00:00", "GHA", "PAN", "BMO Field", "Toronto"],
    ["A", "2026-06-18", "17:00", "CZE", "RSA", "Mercedes-Benz Stadium", "Atlanta"],
    ["A", "2026-06-19", "02:00", "MEX", "KOR", "Estadio Akron", "Guadalajara"],
    ["B", "2026-06-18", "20:00", "SUI", "BIH", "SoFi Stadium", "Los Angeles"],
    ["B", "2026-06-18", "23:00", "CAN", "QAT", "BC Place", "Vancouver"],
    ["C", "2026-06-19", "23:00", "SCO", "MAR", "Gillette Stadium", "Boston"],
    ["C", "2026-06-20", "01:30", "BRA", "HAI", "Lincoln Financial Field", "Philadelphia"],
    ["D", "2026-06-19", "20:00", "USA", "AUS", "Lumen Field", "Seattle"],
    ["D", "2026-06-20", "04:00", "TUR", "PAR", "Levi's Stadium", "Santa Clara"],
    ["E", "2026-06-20", "21:00", "GER", "CIV", "BMO Field", "Toronto"],
    ["E", "2026-06-21", "01:00", "ECU", "CUW", "Arrowhead Stadium", "Kansas City"],
    ["F", "2026-06-20", "18:00", "NED", "SWE", "NRG Stadium", "Houston"],
    ["F", "2026-06-21", "05:00", "TUN", "JPN", "Estadio BBVA", "Monterrey"],
    ["G", "2026-06-21", "20:00", "BEL", "IRN", "SoFi Stadium", "Los Angeles"],
    ["G", "2026-06-22", "02:00", "NZL", "EGY", "BC Place", "Vancouver"],
    ["H", "2026-06-21", "17:00", "ESP", "KSA", "Mercedes-Benz Stadium", "Atlanta"],
    ["H", "2026-06-21", "23:00", "URU", "CPV", "Hard Rock Stadium", "Miami"],
    ["I", "2026-06-22", "22:00", "FRA", "IRQ", "Lincoln Financial Field", "Philadelphia"],
    ["I", "2026-06-23", "01:00", "NOR", "SEN", "MetLife Stadium", "Nueva York/Nueva Jersey"],
    ["J", "2026-06-22", "18:00", "ARG", "AUT", "AT&T Stadium", "Dallas"],
    ["J", "2026-06-23", "04:00", "JOR", "ALG", "Levi's Stadium", "Santa Clara"],
    ["K", "2026-06-23", "18:00", "POR", "UZB", "NRG Stadium", "Houston"],
    ["K", "2026-06-24", "03:00", "COL", "COD", "Estadio Akron", "Guadalajara"],
    ["L", "2026-06-23", "21:00", "ENG", "GHA", "Gillette Stadium", "Boston"],
    ["L", "2026-06-24", "00:00", "PAN", "CRO", "BMO Field", "Toronto"],
    ["A", "2026-06-24", "20:00", "CZE", "MEX", "NRG Stadium", "Houston"],
    ["A", "2026-06-24", "20:00", "RSA", "KOR", "Lincoln Financial Field", "Philadelphia"],
    ["B", "2026-06-24", "20:00", "SUI", "CAN", "BC Place", "Vancouver"],
    ["B", "2026-06-24", "20:00", "BIH", "QAT", "Lumen Field", "Seattle"],
    ["C", "2026-06-24", "23:00", "SCO", "BRA", "Hard Rock Stadium", "Miami"],
    ["C", "2026-06-24", "23:00", "MAR", "HAI", "Mercedes-Benz Stadium", "Atlanta"],
    ["D", "2026-06-26", "03:00", "PAR", "AUS", "Levi's Stadium", "Santa Clara"],
    ["D", "2026-06-26", "03:00", "TUR", "USA", "SoFi Stadium", "Los Angeles"],
    ["E", "2026-06-25", "21:00", "ECU", "GER", "MetLife Stadium", "Nueva York/Nueva Jersey"],
    ["E", "2026-06-25", "21:00", "CUW", "CIV", "Lincoln Financial Field", "Philadelphia"],
    ["F", "2026-06-26", "00:00", "TUN", "NED", "Arrowhead Stadium", "Kansas City"],
    ["F", "2026-06-26", "00:00", "JPN", "SWE", "AT&T Stadium", "Dallas"],
    ["G", "2026-06-27", "04:00", "NZL", "BEL", "BC Place", "Vancouver"],
    ["G", "2026-06-27", "04:00", "EGY", "IRN", "Lumen Field", "Seattle"],
    ["H", "2026-06-27", "01:00", "URU", "ESP", "Estadio Akron", "Guadalajara"],
    ["H", "2026-06-27", "01:00", "CPV", "KSA", "NRG Stadium", "Houston"],
    ["I", "2026-06-26", "20:00", "NOR", "FRA", "Gillette Stadium", "Boston"],
    ["I", "2026-06-26", "20:00", "SEN", "IRQ", "BMO Field", "Toronto"],
    ["J", "2026-06-28", "03:00", "JOR", "ARG", "AT&T Stadium", "Dallas"],
    ["J", "2026-06-28", "03:00", "ALG", "AUT", "Arrowhead Stadium", "Kansas City"],
    ["K", "2026-06-28", "00:30", "COL", "POR", "Hard Rock Stadium", "Miami"],
    ["K", "2026-06-28", "00:30", "COD", "UZB", "Mercedes-Benz Stadium", "Atlanta"],
    ["L", "2026-06-27", "22:00", "PAN", "ENG", "MetLife Stadium", "Nueva York/Nueva Jersey"],
    ["L", "2026-06-27", "22:00", "CRO", "GHA", "Lincoln Financial Field", "Philadelphia"],
  ] as const
).map(([group, date, time, home, away, venue, city], index) => ({
  id: `m${index + 1}`,
  matchNo: index + 1,
  group,
  date,
  time,
  utc: `${date}T${time}:00Z`,
  home: tid(home),
  away: tid(away),
  venue,
  city,
}));

const getTeam = (id: string) => teams.find((team) => team.id === id) ?? teams[0];
const groups = ["Todos", ...Array.from(new Set(fixtures.map((fixture) => fixture.group)))];

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("es", { weekday: "short", day: "numeric", month: "short" }).format(new Date(`${date}T12:00:00`));
}

function fixtureStartsAt(fixture: Fixture) {
  return new Date(fixture.utc).getTime();
}

function isFixtureLocked(fixture: Fixture) {
  return Date.now() >= fixtureStartsAt(fixture);
}

function fixtureStatus(fixture: Fixture) {
  if (Date.now() >= fixtureStartsAt(fixture) + 2 * 60 * 60 * 1000) return "finished";
  if (isFixtureLocked(fixture)) return "live";
  return "scheduled";
}

function nextOpenFixture(picks: Record<string, LocalPick>) {
  return fixtures.find((fixture) => !isFixtureLocked(fixture) && !picks[fixture.id]) ?? fixtures.find((fixture) => !isFixtureLocked(fixture)) ?? fixtures[0];
}

function useCountdown(target: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const total = Math.max(0, Math.floor((new Date(target).getTime() - now) / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
  };
}

function cleanAuthError(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;
  const match = err.message.match(/Uncaught Error:\s*(.*?)(?:\s+at\s|\n|$)/);
  const msg = (match?.[1] ?? err.message).trim();
  if (!msg || /\[(CONVEX|Request ID)/i.test(msg) || /Server Error/i.test(msg)) {
    return fallback;
  }
  return msg;
}

let tickCtx: AudioContext | null = null;
function playTick() {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    tickCtx ??= new Ctx();
    if (tickCtx.state === "suspended") void tickCtx.resume();
    const now = tickCtx.currentTime;
    const osc = tickCtx.createOscillator();
    const gain = tickCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.05);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    osc.connect(gain).connect(tickCtx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  } catch {
    // audio is a non-critical enhancement
  }
}

function useAuth() {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const signupMutation = useMutation(api.users.signup);
  const loginMutation = useMutation(api.users.login);
  const logoutMutation = useMutation(api.users.logout);
  const sendResetCodeAction = useAction(api.users.sendResetCode);
  const resetPasswordWithCodeMutation = useMutation(api.users.resetPasswordWithCode);
  const profile = useQuery(api.users.me, sessionToken ? { sessionToken } : "skip") as AuthUser | null | undefined;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const join = urlParams.get("join");
      if (token) {
        window.localStorage.setItem("parleyia:session", token);
        const cleanUrl = join ? `/play?join=${join}` : "/play";
        window.history.replaceState({}, document.title, cleanUrl);
        setSessionToken(token);
      } else {
        setSessionToken(window.localStorage.getItem("parleyia:session"));
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const persist = useCallback((token: string) => {
    window.localStorage.setItem("parleyia:session", token);
    setSessionToken(token);
  }, []);

  const signup = useCallback(
    async (args: { email: string; password: string; name: string; handle: string; avatar: string; favoriteTeam?: string }) => {
      const result = await signupMutation(args);
      persist(result.sessionToken);
      window.localStorage.removeItem("parleyia:onboarded");
      return result;
    },
    [persist, signupMutation]
  );

  const login = useCallback(
    async (args: { email: string; password: string }) => {
      const result = await loginMutation(args);
      persist(result.sessionToken);
      return result;
    },
    [loginMutation, persist]
  );

  const logout = useCallback(async () => {
    const token = sessionToken;
    window.localStorage.removeItem("parleyia:session");
    window.localStorage.removeItem("parleyia:activeLeague");
    setSessionToken(null);
    if (token) await logoutMutation({ sessionToken: token }).catch(() => undefined);
  }, [logoutMutation, sessionToken]);

  const sendResetCode = useCallback(
    async (args: { email: string }) => {
      await sendResetCodeAction(args);
    },
    [sendResetCodeAction]
  );

  const resetPasswordWithCode = useCallback(
    async (args: { email: string; code: string; newPassword: string }) => {
      await resetPasswordWithCodeMutation(args);
    },
    [resetPasswordWithCodeMutation]
  );

  return {
    sessionToken,
    user: profile ?? null,
    loading: Boolean(sessionToken && profile === undefined),
    signup,
    login,
    logout,
    sendResetCode,
    resetPasswordWithCode,
  };
}

function useActiveLeague(leagues: { _id: Id<"leagues"> }[] | undefined) {
  const [activeLeagueId, setActiveLeagueId] = useState<Id<"leagues"> | null>(null);

  useEffect(() => {
    if (!leagues || leagues.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveLeagueId(null);
      return;
    }
    const stored = window.localStorage.getItem("parleyia:activeLeague") as Id<"leagues"> | null;
    const match = stored && leagues.find((l) => l._id === stored);
    const next = match ? stored : leagues[0]._id;
    setActiveLeagueId(next);
    if (next) window.localStorage.setItem("parleyia:activeLeague", next);
  }, [leagues]);

  const setActive = useCallback((id: Id<"leagues">) => {
    window.localStorage.setItem("parleyia:activeLeague", id);
    setActiveLeagueId(id);
  }, []);

  return { activeLeagueId, setActive };
}

function TeamBadge({ id, size = 42 }: { id: string; size?: number }) {
  const team = getTeam(id);
  return (
    <span
      className="team-badge"
      style={{ "--c1": team.colors[0], "--c2": team.colors[1], "--s": `${size}px` } as React.CSSProperties}
      title={team.name}
    >
      <span className="team-badge-flag">{team.flag}</span>
    </span>
  );
}

function NavIcon({ id }: { id: Screen }) {
  const p = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (id === "inicio") return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
  if (id === "partidos") return <svg {...p}><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24"/></svg>;
  if (id === "tabla") return <svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
  if (id === "liga") return <svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
  return <svg {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

function Nav({ screen, setScreen }: { screen: Screen; setScreen: (screen: Screen) => void }) {
  const items: { id: Screen; label: string }[] = [
    { id: "inicio", label: "Inicio" },
    { id: "partidos", label: "Partidos" },
    { id: "tabla", label: "Tabla" },
    { id: "liga", label: "Liga" },
    { id: "perfil", label: "Perfil" },
  ];

  return (
    <nav className="app-nav">
      <div className="brand">
        <strong>ParlAI</strong>
        <span>Mundial 2026</span>
      </div>
      {items.map((item) => (
        <button className={screen === item.id ? "active" : ""} onClick={() => setScreen(item.id)} key={item.id}>
          <span className="nav-icon"><NavIcon id={item.id} /></span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function TopBar({
  leagueName,
  leagueCode,
  onInvite,
  onOnboarding,
}: {
  leagueName: string;
  leagueCode: string | null;
  onInvite: () => void;
  onOnboarding: () => void;
}) {
  return (
    <header className="topbar">
      <div>
        <span>LIGA ACTIVA</span>
        <strong>{leagueName}</strong>
      </div>
      <div className="top-actions">
        <button onClick={onOnboarding}>¿Cómo jugar?</button>
        <button onClick={onInvite} disabled={!leagueCode}>
          {leagueCode ? `Invitar · ${leagueCode}` : "Invitar"}
        </button>
      </div>
    </header>
  );
}

function HomeScreen({
  picks,
  openPick,
  savePickFor,
  go,
  pendingCount,
  leagues,
}: {
  picks: Record<string, LocalPick>;
  openPick: (fixture: Fixture) => void;
  savePickFor: (fixture: Fixture, pick: LocalPick) => Promise<void>;
  go: (screen: Screen) => void;
  pendingCount: number;
  leagues: LeagueSummary[];
}) {
  const next = nextOpenFixture(picks);
  const countdown = useCountdown(next.utc);
  const bestRank = leagues.map((league) => league.myRank).filter((rank): rank is number => Boolean(rank)).sort((a, b) => a - b)[0];
  const upcoming = fixtures.filter((fixture) => !isFixtureLocked(fixture)).slice(0, 6);

  return (
    <div className="screen-grid">
      <section className="hero-panel glass-strong">
        <div className="hero-copy">
          <span>Cuenta regresiva mundialera</span>
          <h1>{picks[next.id] ? "La tabla ya está caliente." : "Falta tu jugada antes del pitazo."}</h1>
          <p>{picks[next.id] ? "Revisa tus ligas, presume tu ranking y no dejes vivo el próximo partido." : "Tu siguiente partido sin predicción está listo. Cierra al pitazo y cuenta para todas tus ligas."}</p>
          <div className="countdown">
            <b>{countdown.days}<small>días</small></b>
            <b>{countdown.hours}<small>horas</small></b>
            <b>{countdown.minutes}<small>min</small></b>
          </div>
        </div>
        <FeatureMatch fixture={next} pick={picks[next.id]} onPick={() => openPick(next)} />
      </section>

      <section className="metric-row">
        <Metric value={leagues.length} label="ligas activas" tone="lime" />
        <Metric value={bestRank ?? 0} label={bestRank ? "mejor posición" : "sin ranking todavía"} tone="blue" />
        <Metric value={pendingCount} label="jugadas pendientes" tone="yellow" />
      </section>

      <section className="quick-actions">
        <button className="glass" onClick={() => go("partidos")}>Predecir pendientes</button>
        <button className="glass" onClick={() => go("liga")}>Invitar panas</button>
        <button className="glass" onClick={() => go("perfil")}>Compartir story</button>
      </section>

      <section className="content-card glass">
        <SectionTitle kicker="Próximos" title="Predice rápido" action="Ver calendario" onAction={() => go("partidos")} />
        <p className="section-hint">Toca el ganador o ajusta el marcador. Se guarda solo.</p>
        <div className="match-list">
          {upcoming.map((fixture) => (
            <InlinePickRow fixture={fixture} pick={picks[fixture.id]} savePickFor={savePickFor} key={fixture.id} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ value, label, tone }: { value: number; label: string; tone: string }) {
  return (
    <div className={`metric metric-${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function FeatureMatch({ fixture, pick, onPick }: { fixture: Fixture; pick?: LocalPick; onPick: () => void }) {
  const home = getTeam(fixture.home);
  const away = getTeam(fixture.away);
  const locked = isFixtureLocked(fixture);

  return (
    <article className="feature-match">
      <div className="fixture-meta">
        <span>Partido {fixture.matchNo} · Grupo {fixture.group}</span>
        <strong>{dateLabel(fixture.date)} · {fixture.time}</strong>
      </div>
      <div className="feature-teams">
        <TeamBlock team={home} />
        <b>VS</b>
        <TeamBlock team={away} align="right" />
      </div>
      <p>{fixture.venue} · {fixture.city}</p>
      <button onClick={onPick} disabled={locked}>{locked ? "Ya cerró este partido" : pick ? `Editar jugada ${pick.home}-${pick.away}` : "Hacer mi jugada"}</button>
    </article>
  );
}

function TeamBlock({ team, align }: { team: Team; align?: "right" }) {
  return (
    <div className={align === "right" ? "team-block right" : "team-block"}>
      <TeamBadge id={team.id} size={58} />
      <strong>{team.name}</strong>
      <span>{team.code}</span>
    </div>
  );
}

function SectionTitle({ kicker, title, action, onAction }: { kicker: string; title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="section-title">
      <div>
        <span>{kicker}</span>
        <h2>{title}</h2>
      </div>
      {action ? <button onClick={onAction}>{action} →</button> : null}
    </div>
  );
}

function MatchesScreen({
  picks,
  savePickFor,
  openPick,
}: {
  picks: Record<string, LocalPick>;
  savePickFor: (fixture: Fixture, pick: LocalPick) => Promise<void>;
  openPick: (fixture: Fixture) => void;
}) {
  const [group, setGroup] = useState("Todos");
  const [query, setQuery] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);

  const filtered = fixtures.filter((fixture) => {
    const home = getTeam(fixture.home);
    const away = getTeam(fixture.away);
    const text = `${home.name} ${away.name} ${fixture.city} ${fixture.venue}`.toLowerCase();
    return (group === "Todos" || fixture.group === group) && text.includes(query.toLowerCase()) && (!onlyOpen || (!picks[fixture.id] && !isFixtureLocked(fixture)));
  });

  const openCount = fixtures.filter((fixture) => !isFixtureLocked(fixture) && !picks[fixture.id]).length;

  return (
    <div className="screen-stack">
      <div className="screen-heading">
        <span>Fixture real</span>
        <h1>Predice varios partidos a la vez</h1>
        <p>Toca el ganador o ajusta el marcador con ± y se guarda solo. Te quedan {openCount} jugadas pendientes.</p>
      </div>

      <div className="filters glass">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar selección, sede o ciudad" />
        <button className={onlyOpen ? "active" : ""} onClick={() => setOnlyOpen((value) => !value)}>Sin jugada</button>
      </div>

      <div className="group-tabs no-scrollbar">
        {groups.map((item) => (
          <button className={group === item ? "active" : ""} onClick={() => setGroup(item)} key={item}>{item}</button>
        ))}
      </div>

      <div className="match-list">
        {filtered.map((fixture) => (
          <InlinePickRow
            fixture={fixture}
            pick={picks[fixture.id]}
            savePickFor={savePickFor}
            onExpand={() => openPick(fixture)}
            key={fixture.id}
          />
        ))}
      </div>
    </div>
  );
}

type SaveState = "idle" | "saving" | "saved" | "error";

function InlinePickRow({
  fixture,
  pick,
  savePickFor,
  onExpand,
}: {
  fixture: Fixture;
  pick?: LocalPick;
  savePickFor: (fixture: Fixture, pick: LocalPick) => Promise<void>;
  onExpand?: () => void;
}) {
  const home = getTeam(fixture.home);
  const away = getTeam(fixture.away);
  const locked = isFixtureLocked(fixture);
  const status = fixtureStatus(fixture);

  const allResults = useQuery(api.results.list) as { fixtureId: string; home: number; away: number }[] | undefined;
  const result = allResults?.find((row) => row.fixtureId === fixture.id);
  const myScore = result && pick ? calculatePredictionScore({ home: pick.home, away: pick.away }, result) : null;

  const [draft, setDraft] = useState<{ home: number; away: number } | null>(
    pick ? { home: pick.home, away: pick.away } : null
  );
  const [state, setState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastSavedKey, setLastSavedKey] = useState<string | null>(
    pick ? `${pick.home}-${pick.away}` : null
  );
  const pendingRef = useRef<{ home: number; away: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!pick) return;
    const key = `${pick.home}-${pick.away}`;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLastSavedKey((prev) => {
      if (prev === key) return prev;
      // Server pushed a newer value — sync local draft.
      setDraft({ home: pick.home, away: pick.away });
      return key;
    });
  }, [pick]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  const flush = useCallback(async () => {
    const next = pendingRef.current;
    if (!next) return;
    pendingRef.current = null;
    setState("saving");
    setErrorMsg(null);
    try {
      await savePickFor(fixture, { home: next.home, away: next.away, bonus: pick?.bonus ?? [] });
      setLastSavedKey(`${next.home}-${next.away}`);
      setState("saved");
      playTick();
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setState("idle"), 1400);
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Error");
    }
  }, [fixture, pick, savePickFor]);

  const queue = useCallback(
    (homeScore: number, awayScore: number) => {
      if (locked) return;
      setDraft({ home: homeScore, away: awayScore });
      pendingRef.current = { home: homeScore, away: awayScore };
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, 550);
    },
    [flush, locked]
  );

  const dirty = draft !== null && lastSavedKey !== `${draft.home}-${draft.away}`;

  const quickPick = (h: number, a: number) => queue(h, a);
  const bump = (side: "home" | "away", delta: number) => {
    const base = pendingRef.current ?? draft ?? { home: 1, away: 1 };
    const homeVal = side === "home" ? Math.max(0, Math.min(9, base.home + delta)) : base.home;
    const awayVal = side === "away" ? Math.max(0, Math.min(9, base.away + delta)) : base.away;
    queue(homeVal, awayVal);
  };

  const winnerActive = (kind: "home" | "draw" | "away") => {
    if (!draft) return false;
    if (kind === "home") return draft.home > draft.away;
    if (kind === "away") return draft.away > draft.home;
    return draft.home === draft.away;
  };

  const statusBadge =
    state === "saving"
      ? "Guardando…"
      : state === "saved"
        ? "Guardada"
        : state === "error"
          ? errorMsg ?? "Error"
          : !draft
            ? "Sin jugada"
            : dirty
              ? "Sin guardar"
              : "Guardada";

  return (
    <article className={`pick-row glass ${locked ? "locked" : ""} pick-state-${state} ${dirty ? "dirty" : ""}`}>
      <header className="pick-row-head">
        <div className="pick-row-meta">
          <strong>{dateLabel(fixture.date)} · {fixture.time}</strong>
          <span>Grupo {fixture.group} · Partido {fixture.matchNo} · {status === "scheduled" ? "Abierto" : status === "live" ? "Cerrado" : "Finalizado"}</span>
        </div>
        <span className={`pick-status pick-status-${state} ${dirty && state === "idle" ? "pick-status-dirty" : ""} ${!draft ? "pick-status-empty" : ""}`}>{locked ? "Cerrado" : statusBadge}</span>
      </header>

      {result ? (
        <div className="pick-result">
          <span className="pick-result-final">Final {result.home}–{result.away}</span>
          {myScore ? (
            <span className={`pick-result-points ${myScore.points > 0 ? "hit" : "miss"}`}>
              {myScore.points > 0 ? `+${myScore.points} pts` : "0 pts"}
              {myScore.exact ? " · exacto" : myScore.correctResult ? " · resultado" : ""}
            </span>
          ) : (
            <span className="pick-result-points">Sin jugada</span>
          )}
        </div>
      ) : null}

      <div className="pick-row-body">
        <button
          type="button"
          className={`pick-side ${winnerActive("home") ? "active" : ""}`}
          onClick={() => bump("home", 1)}
          disabled={locked}
          aria-label={`Sumar gol a ${home.name}`}
        >
          <TeamBadge id={home.id} size={44} />
          <strong>{home.name}</strong>
          <span>{home.code}</span>
        </button>

        <div className="pick-score">
          <div className="pick-score-cell">
            <button type="button" onClick={() => bump("home", -1)} disabled={locked} aria-label="Menos local">−</button>
            <b style={{ color: home.accent }}>{draft ? draft.home : "·"}</b>
            <button type="button" onClick={() => bump("home", 1)} disabled={locked} aria-label="Más local">+</button>
          </div>
          <em>vs</em>
          <div className="pick-score-cell">
            <button type="button" onClick={() => bump("away", -1)} disabled={locked} aria-label="Menos visitante">−</button>
            <b style={{ color: away.accent }}>{draft ? draft.away : "·"}</b>
            <button type="button" onClick={() => bump("away", 1)} disabled={locked} aria-label="Más visitante">+</button>
          </div>
        </div>

        <button
          type="button"
          className={`pick-side right ${winnerActive("away") ? "active" : ""}`}
          onClick={() => bump("away", 1)}
          disabled={locked}
          aria-label={`Sumar gol a ${away.name}`}
        >
          <TeamBadge id={away.id} size={44} />
          <strong>{away.name}</strong>
          <span>{away.code}</span>
        </button>
      </div>

      <footer className="pick-row-foot">
        <div className="pick-quick">
          <button type="button" className={winnerActive("home") ? "active" : ""} onClick={() => quickPick(1, 0)} disabled={locked}>Gana {home.code} 1-0</button>
          <button type="button" className={winnerActive("draw") ? "active" : ""} onClick={() => quickPick(1, 1)} disabled={locked}>Empate 1-1</button>
          <button type="button" className={winnerActive("away") ? "active" : ""} onClick={() => quickPick(0, 1)} disabled={locked}>Gana {away.code} 0-1</button>
        </div>
        {onExpand ? (
          <button type="button" className="pick-detail" onClick={onExpand} disabled={locked}>
            {fixture.venue}, {fixture.city} →
          </button>
        ) : (
          <span className="pick-venue">{fixture.venue} · {fixture.city}</span>
        )}
      </footer>
    </article>
  );
}

type LeaderboardRow = {
  userId: Id<"users">;
  name: string;
  handle: string;
  avatar: string;
  picks: number;
  exacts: number;
  correctResults: number;
  streak: number;
  points: number;
};

type BoardTab = "general" | "semana" | "exactos";
type BoardScope = "liga" | "global";
type GlobalRow = LeaderboardRow & { favoriteTeam?: string };

function LeaderboardScreen({
  leagueId,
  currentUserId,
  sessionToken,
  onShowOnboarding,
}: {
  leagueId: Id<"leagues"> | null;
  currentUserId: Id<"users"> | null;
  sessionToken: string | null;
  onShowOnboarding: () => void;
}) {
  const [scope, setScope] = useState<BoardScope>("liga");
  const [tab, setTab] = useState<BoardTab>("general");

  const leagueRows = useQuery(
    api.picks.leagueLeaderboard,
    leagueId && sessionToken && scope === "liga" ? { leagueId, sessionToken } : "skip",
  );
  const globalRows = useQuery(api.tournaments.globalLeaderboard, scope === "global" ? { limit: 100 } : "skip") as
    | GlobalRow[]
    | undefined;
  const tournament = useQuery(api.tournaments.getActive, scope === "global" ? {} : "skip");
  const ensureActive = useMutation(api.tournaments.ensureActive);

  useEffect(() => {
    if (scope === "global" && tournament === null) {
      ensureActive({}).catch(() => undefined);
    }
  }, [scope, tournament, ensureActive]);

  const rows = scope === "liga" ? leagueRows : globalRows;

  const rankedRows = useMemo(() => {
    const source = ([...(rows ?? [])] as LeaderboardRow[]);
    if (tab === "exactos") {
      return source.sort((a, b) => b.exacts - a.exacts || b.points - a.points || b.picks - a.picks);
    }
    if (tab === "semana") {
      return source.sort((a, b) => b.picks - a.picks || b.correctResults - a.correctResults || b.points - a.points);
    }
    return source.sort((a, b) => b.points - a.points || b.exacts - a.exacts || b.correctResults - a.correctResults || b.picks - a.picks);
  }, [rows, tab]);

  const myIndex = rankedRows.findIndex((row) => row.userId === currentUserId);
  const leader = rankedRows[0];
  const meRanked = myIndex >= 0 ? rankedRows[myIndex] : undefined;
  const podium = [rankedRows[1], rankedRows[0], rankedRows[2]];
  const deltaToLeader = leader && meRanked ? Math.max(0, leader.points - meRanked.points) : 0;
  const totalPicks = rankedRows.reduce((sum, row) => sum + row.picks, 0);

  const meta = scope === "liga"
    ? `actualizado hace 2min · ${rankedRows.length || 0} miembros`
    : `${tournament?.name ?? "Mundial 2026"} · ${rankedRows.length} ${rankedRows.length === 1 ? "jugador" : "jugadores"} · ${totalPicks} jugadas`;

  const emptyMessage = scope === "liga"
    ? (!leagueId ? "Crea o únete a una liga para ver la tabla." : "Aún no hay jugadas registradas.")
    : "Aún no hay jugadas registradas. Sé el primero.";

  const loading = scope === "liga" ? leagueRows === undefined && !!leagueId : globalRows === undefined;
  const showEmpty = scope === "liga" ? !leagueId || (rows && rows.length === 0) : rows && rows.length === 0;

  return (
    <div className="leaderboard-phone">
      <div className="board-scope" role="tablist" aria-label="Alcance del ranking">
        {([
          { id: "liga" as const, label: "Mi liga" },
          { id: "global" as const, label: "Global" },
        ]).map((item) => (
          <button
            type="button"
            role="tab"
            aria-selected={scope === item.id}
            className={scope === item.id ? "active" : ""}
            onClick={() => setScope(item.id)}
            key={item.id}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="board-meta">{meta}</div>
      <div className="board-tabs" role="tablist" aria-label="Tabla de posiciones">
        {(["general", "semana", "exactos"] as const).map((item) => (
          <button type="button" role="tab" aria-selected={tab === item} className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>
            {item}
          </button>
        ))}
      </div>
      {loading ? (
        <EmptyState message="Cargando tabla…" />
      ) : showEmpty ? (
        <EmptyState
          message={emptyMessage}
          actionLabel={!leagueId ? "Crea o únete a una liga" : undefined}
          onAction={!leagueId ? onShowOnboarding : undefined}
        />
      ) : (
        <>
          <section className="podium" aria-label="Podio">
            {podium.map((row, slot) =>
              row ? <PodiumPerson row={row} rank={slot === 0 ? 2 : slot === 1 ? 1 : 3} isMe={row.userId === currentUserId} key={row.userId} /> : <div key={slot} />
            )}
          </section>

          <section className="leader-list" aria-label="Ranking">
            {rankedRows.map((row, index) => (
              <LeaderboardCard row={row} rank={index + 1} isMe={row.userId === currentUserId} isLeader={index === 0} key={row.userId} />
            ))}
          </section>

          {meRanked ? (
            <div className="rank-callout">
              <strong>#{myIndex + 1}</strong>
              <span className="mini-avatar">{meRanked.avatar}</span>
              <p>
                <b>vos · {meRanked.points} pts</b>
                <small>
                  {meRanked.exacts} exactos · {meRanked.correctResults} resultados
                  {meRanked.streak > 0 ? ` · racha ${meRanked.streak}` : ""}
                </small>
              </p>
              <em>
                {deltaToLeader > 0
                  ? `a ${deltaToLeader}pts del 🏆${scope === "global" ? " global" : ""}`
                  : `líder${scope === "global" ? " global" : " del 🏆"}`}
              </em>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function PodiumPerson({ row, rank, isMe }: { row: LeaderboardRow; rank: 1 | 2 | 3; isMe: boolean }) {
  return (
    <article className={`podium-person podium-${rank}`}>
      <span className="medal">{rank === 1 ? "🏆" : rank === 2 ? "🥈" : "🥉"}</span>
      <span className="podium-avatar">{row.avatar}</span>
      <strong>{isMe ? "Tú" : row.name}</strong>
      <b>{row.points}</b>
      <em>{rank}</em>
    </article>
  );
}

function LeaderboardCard({
  row,
  rank,
  isMe,
  isLeader,
}: {
  row: LeaderboardRow;
  rank: number;
  isMe: boolean;
  isLeader: boolean;
}) {
  return (
    <article className={`leader-card ${isMe ? "me" : ""}`}>
      <b>{rank}</b>
      <span className="leader-avatar">{row.avatar}</span>
      <span className="leader-copy">
        <strong>{isMe ? "Tú" : row.name} {isMe ? <em>vos</em> : null}</strong>
        <small>
          {row.exacts} exactos · {row.correctResults} resultados · {row.picks} jugadas
          {row.streak > 0 ? <> · <mark>racha {row.streak}</mark></> : null}
        </small>
        {isLeader ? <i>🔥</i> : null}
      </span>
      <strong className="leader-points">{row.points}<small>PTS</small></strong>
    </article>
  );
}

function EmptyState({
  message,
  glyph = "⚽",
  actionLabel,
  onAction,
}: {
  message: string;
  glyph?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="empty-state">
      <span className="glyph" aria-hidden>{glyph}</span>
      <p>{message}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          className="save-pick"
          onClick={onAction}
          style={{ width: "auto", padding: "12px 24px", marginTop: "10px" }}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

const AVATAR_EMOJIS = [
  "⚽","🏆","🥇","🔥","⚡","🎯","💥","👑","🦁","🐯","🐺","🦊","🐉","🦅","🐂","🦈",
  "🚀","🌟","💎","🎲","🎮","🎧","🥶","😎","🤘","🫡","🧉","🍻","🌮","🥁","🪩","🛡️",
] as const;

function generateMemorablePassword() {
  const prefixes = ["copa", "mundial", "futbol", "golazo", "pasion", "furia", "albiceleste", "seleccion", "tiro", "arco", "arbitro", "gambeta", "tablon", "campeon"];
  const adjectives = ["seguro", "rapido", "fuerte", "activo", "crack", "astro", "libre", "limpio", "super", "lider", "diez", "nueve"];
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${randomPrefix}-${randomAdj}-${randomNum}`;
}

function AuthScreen({
  onSignup,
  onLogin,
  onReset,
  onVerifyReset,
  busy,
  error,
}: {
  onSignup: (args: { email: string; password: string; name: string; handle: string; avatar: string; favoriteTeam?: string }) => void;
  onLogin: (args: { email: string; password: string }) => void;
  onReset: (args: { email: string }) => Promise<void>;
  onVerifyReset: (args: { email: string; code: string; newPassword: string }) => Promise<void>;
  busy: boolean;
  error: string | null;
}) {
  const [mode, setMode] = useState<"signup" | "login" | "forgot" | "reset-code">("signup");
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("⚽");
  const [favoriteTeam, setFavoriteTeam] = useState("arg");
  const [showPassword, setShowPassword] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  // Easy Sign Up / Custom Password States
  const [passwordMode, setPasswordMode] = useState<"easy" | "custom">("easy");
  const [easyPassword, setEasyPassword] = useState(() => generateMemorablePassword());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("join");
    if (code) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInviteCode(code.toUpperCase());
    }
  }, []);

  const league = useQuery(api.leagues.getByCode, { code: inviteCode });

  // Password strength estimation helper
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "Vacía", color: "#666" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    let label = "Débil";
    let color = "#ef4444";
    if (score === 2 || score === 3) {
      label = "Media";
      color = "#f59e0b";
    } else if (score === 4) {
      label = "Fuerte";
      color = "var(--lime)";
    }
    return { score, label, color };
  };

  const strength = getPasswordStrength(password);

  return (
    <main className="auth-shell">
      <section className="auth-card glass-strong">
        <div className="auth-copy">
          <span>ParlAI Mundial 2026</span>
          <h1>Bienvenido a la jugada mundialera.</h1>
          <p>Arma tu perfil antes del pitazo, crea una liga y empieza a pelear la tabla del Mundial.</p>
          <p style={{ marginTop: 14 }}>
            <a href="/" style={{ color: "var(--lime)", fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none" }}>
              ¿Primera vez? Conoce cómo funciona →
            </a>
          </p>
        </div>
        <form
          className="auth-form"
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const formEmail = String(data.get("email") ?? email);
            if (mode === "forgot") {
              try {
                await onReset({ email: formEmail });
                setMode("reset-code");
              } catch {
                // error handled inside onReset
              }
              return;
            }
            if (mode === "reset-code") {
              const codeVal = String(data.get("code") || "");
              const formPassword = String(data.get("password") ?? password);
              try {
                await onVerifyReset({ email: formEmail, code: codeVal, newPassword: formPassword });
                setMode("login");
              } catch {
                // error handled inside onVerifyReset
              }
              return;
            }
            const formPassword = mode === "signup" && passwordMode === "easy" ? easyPassword : String(data.get("password") ?? password);
            if (mode === "signup") {
              onSignup({
                email: formEmail,
                password: formPassword,
                name: String(data.get("name") ?? name),
                handle: String(data.get("handle") ?? handle),
                avatar: String(data.get("avatar") ?? avatar),
                favoriteTeam: String(data.get("favoriteTeam") ?? favoriteTeam) || undefined,
              });
            } else onLogin({ email: formEmail, password: formPassword });
          }}
        >
          {league && (
            <div className="glass" style={{
              padding: "16px",
              borderRadius: "16px",
              border: "1px solid rgba(198, 255, 61, 0.4)",
              background: "rgba(198, 255, 61, 0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              marginBottom: "4px"
            }}>
              <span style={{ fontSize: "11px", color: "var(--lime)", letterSpacing: "0.1em" }}>⚡ INVITACIÓN ACTIVA</span>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "#fff" }}>{league.name}</div>
              <div style={{ fontSize: "13px", color: "var(--ink-2)" }}>
                Creada por <strong style={{ color: "var(--ink-1)" }}>{league.ownerName}</strong> · {league.memberCount} {league.memberCount === 1 ? "participante" : "participantes"}
              </div>
              <div style={{
                marginTop: "4px",
                fontSize: "11px",
                fontFamily: "var(--mono)",
                color: "var(--lime)"
              }}>
                Código pre-cargado: <strong style={{ letterSpacing: "1px" }}>{league.code}</strong>
              </div>
            </div>
          )}
          {(mode === "signup" || mode === "login") && (
            <div className="segmented">
              <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Crear cuenta</button>
              <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Entrar</button>
            </div>
          )}
          {mode === "signup" ? (
            <>
              <label><span>Nombre de guerra</span><input name="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Leo del grupo" required minLength={2} /></label>
              <label><span>Handle</span><input name="handle" value={handle} onChange={(event) => setHandle(event.target.value)} placeholder="leomundial" required /></label>
              <label>
                <span>Avatar</span>
                <input type="hidden" name="avatar" value={avatar} />
                <div className="avatar-picker" role="radiogroup" aria-label="Elige tu avatar">
                  {AVATAR_EMOJIS.map((emoji) => (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={avatar === emoji}
                      className={`avatar-option ${avatar === emoji ? "active" : ""}`}
                      onClick={() => setAvatar(emoji)}
                      key={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </label>
              <label>
                <span>Favorita</span>
                <select name="favoriteTeam" value={favoriteTeam} onChange={(event) => setFavoriteTeam(event.target.value)}>
                  {teams.slice(0, 48).map((team) => <option value={team.id} key={team.id}>{team.flag} {team.name}</option>)}
                </select>
              </label>
            </>
          ) : null}
          <label><span>Email</span><input name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@email.com" required /></label>
          
          {mode !== "forgot" && (
            <label style={{ position: "relative" }}>
              {mode === "signup" ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ margin: 0 }}>Clave</span>
                  <div className="password-mode-selector" style={{ display: "flex", gap: "4px" }}>
                    <button
                      type="button"
                      onClick={() => setPasswordMode("easy")}
                      className={passwordMode === "easy" ? "active" : ""}
                      style={{
                        background: passwordMode === "easy" ? "var(--lime)" : "rgba(255,255,255,0.03)",
                        color: passwordMode === "easy" ? "#070808" : "var(--ink-2)",
                        border: "1px solid var(--line)",
                        borderRadius: "6px",
                        padding: "2px 8px",
                        fontSize: "10px",
                        fontFamily: "var(--mono)",
                        cursor: "pointer",
                        fontWeight: "bold",
                        transition: "all 0.2s"
                      }}
                    >
                      Fácil ⚡
                    </button>
                    <button
                      type="button"
                      onClick={() => setPasswordMode("custom")}
                      className={passwordMode === "custom" ? "active" : ""}
                      style={{
                        background: passwordMode === "custom" ? "var(--lime)" : "rgba(255,255,255,0.03)",
                        color: passwordMode === "custom" ? "#070808" : "var(--ink-2)",
                        border: "1px solid var(--line)",
                        borderRadius: "6px",
                        padding: "2px 8px",
                        fontSize: "10px",
                        fontFamily: "var(--mono)",
                        cursor: "pointer",
                        fontWeight: "bold",
                        transition: "all 0.2s"
                      }}
                    >
                      Manual 🔐
                    </button>
                  </div>
                </div>
              ) : (
                <span>Clave nueva</span>
              )}

              {mode === "signup" && passwordMode === "easy" ? (
                <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      type="text"
                      value={easyPassword}
                      readOnly
                      style={{
                        width: "100%",
                        paddingRight: "70px",
                        fontFamily: "var(--mono)",
                        color: "var(--lime)",
                        background: "rgba(198, 255, 61, 0.03)",
                        borderColor: "rgba(198, 255, 61, 0.25)"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(easyPassword);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      style={{
                        position: "absolute",
                        right: "12px",
                        background: "none",
                        border: "none",
                        color: copied ? "var(--lime)" : "var(--ink-2)",
                        fontFamily: "var(--mono)",
                        fontSize: "11px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        padding: "4px 8px"
                      }}
                    >
                      {copied ? "COPIADA" : "COPIAR"}
                    </button>
                  </div>
                  <span style={{ display: "block", fontSize: "10px", color: "var(--ink-2)", textTransform: "none", fontFamily: "var(--sans)", marginTop: "2px" }}>
                    🔒 Clave segura auto-generada. Cópiala para otros dispositivos.{" "}
                    <button
                      type="button"
                      onClick={() => setEasyPassword(generateMemorablePassword())}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--lime)",
                        textDecoration: "underline",
                        cursor: "pointer",
                        padding: 0,
                        font: "inherit",
                        fontSize: "10px"
                      }}
                    >
                      Generar otra
                    </button>
                  </span>
                </div>
              ) : (
                <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      minLength={8}
                      required
                      style={{ width: "100%", paddingRight: "70px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        background: "none",
                        border: "none",
                        color: "var(--lime)",
                        fontFamily: "var(--mono)",
                        fontSize: "11px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        padding: "4px 8px"
                      }}
                    >
                      {showPassword ? "OCULTAR" : "VER"}
                    </button>
                  </div>
                  {mode === "signup" && (
                    <div className="strength-container" style={{ marginTop: "6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", marginBottom: "4px" }}>
                        <span style={{ color: "var(--ink-2)" }}>Seguridad:</span>
                        <span style={{ color: strength.color, fontWeight: "bold" }}>{strength.label}</span>
                      </div>
                      <div style={{ height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden", marginBottom: "6px" }}>
                        <div style={{ height: "100%", width: `${(strength.score / 4) * 100}%`, background: strength.color, transition: "width 0.3s ease" }} />
                      </div>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", fontSize: "9px" }}>
                        <li style={{ display: "flex", alignItems: "center", gap: "4px", color: password.length >= 8 ? "var(--lime)" : "var(--ink-2)" }}>
                          <span>{password.length >= 8 ? "✓" : "○"}</span> 8+ caracteres
                        </li>
                        <li style={{ display: "flex", alignItems: "center", gap: "4px", color: (/[a-z]/.test(password) && /[A-Z]/.test(password)) ? "var(--lime)" : "var(--ink-2)" }}>
                          <span>{(/[a-z]/.test(password) && /[A-Z]/.test(password)) ? "✓" : "○"}</span> Mayús y minús
                        </li>
                        <li style={{ display: "flex", alignItems: "center", gap: "4px", color: /\d/.test(password) ? "var(--lime)" : "var(--ink-2)" }}>
                          <span>{/\d/.test(password) ? "✓" : "○"}</span> Números
                        </li>
                        <li style={{ display: "flex", alignItems: "center", gap: "4px", color: /[^A-Za-z0-9]/.test(password) ? "var(--lime)" : "var(--ink-2)" }}>
                          <span>{/[^A-Za-z0-9]/.test(password) ? "✓" : "○"}</span> Símbolos
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </label>
          )}

          {mode === "login" && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-6px", marginBottom: "8px" }}>
              <button
                type="button"
                onClick={() => setMode("forgot")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--lime)",
                  fontFamily: "var(--mono)",
                  fontSize: "10px",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline"
                }}
              >
                ¿OLVIDASTE TU CONTRASEÑA?
              </button>
            </div>
          )}

          {mode === "reset-code" && (
            <label>
              <span>Código de 6 dígitos</span>
              <input
                name="code"
                type="text"
                placeholder="123456"
                required
                maxLength={6}
                style={{ fontFamily: "var(--mono)", letterSpacing: "2px", textAlign: "center" }}
              />
            </label>
          )}
          
          {error ? <p className="form-error">{error}</p> : null}
          <button className="save-pick" type="submit" disabled={busy}>
            {busy
              ? "Calentando..."
              : mode === "signup"
                ? "Tu Mundial empieza aquí"
                : mode === "login"
                  ? "Volver a mi liga"
                  : mode === "forgot"
                    ? "Enviar código"
                    : "Restablecer contraseña"}
          </button>

          {(mode === "signup" || mode === "login") && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "6px 0 2px" }}>
                <span style={{ flex: 1, height: "1px", background: "var(--line)" }} />
                <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--ink-2)", letterSpacing: "0.12em" }}>O</span>
                <span style={{ flex: 1, height: "1px", background: "var(--line)" }} />
              </div>
              <a
                href={`/api/auth/google${inviteCode ? `?join=${encodeURIComponent(inviteCode)}` : ""}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "13px",
                  borderRadius: "12px",
                  background: "#ffffff",
                  color: "#1f1f1f",
                  fontWeight: "bold",
                  fontSize: "15px",
                  textDecoration: "none",
                  border: "1px solid var(--line)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                  <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.32A9 9 0 0 0 9 18z" />
                  <path fill="#FBBC05" d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.96H.96a9 9 0 0 0 0 8.08l3.02-2.32z" />
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.42 0 9 0A9 9 0 0 0 .96 4.96l3.02 2.32C4.68 5.16 6.66 3.58 9 3.58z" />
                </svg>
                Continuar con Google
              </a>
            </>
          )}

          {mode === "forgot" && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
              <button
                type="button"
                onClick={() => setMode("login")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--lime)",
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline"
                }}
              >
                VOLVER AL INICIO DE SESIÓN
              </button>
            </div>
          )}

          {mode === "reset-code" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center", marginTop: "12px" }}>
              <button
                type="button"
                onClick={() => setMode("forgot")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--lime)",
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline"
                }}
              >
                PEDIR OTRO CÓDIGO
              </button>
              <button
                type="button"
                onClick={() => setMode("login")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--ink-2)",
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline"
                }}
              >
                CANCELAR Y VOLVER
              </button>
            </div>
          )}


        </form>
      </section>
    </main>
  );
}

type ActivityItem = {
  userId: Id<"users">;
  userName: string;
  fixtureId: string;
  home: number;
  away: number;
  updatedAt: number;
};

function LeagueScreen({
  leagueId,
  leagues,
  setActive,
  onLeave,
  onInvite,
  currentUser,
  sessionToken,
  onShowOnboarding,
}: {
  leagueId: Id<"leagues"> | null;
  leagues: LeagueSummary[];
  setActive: (id: Id<"leagues">) => void;
  onLeave: (id: Id<"leagues">) => void;
  onInvite: () => void;
  currentUser: AuthUser;
  sessionToken: string;
  onShowOnboarding: () => void;
}) {
  const members = useQuery(api.leagues.members, leagueId ? { leagueId, sessionToken } : "skip");
  const recent = useQuery(api.picks.recentInLeague, leagueId ? { leagueId, sessionToken } : "skip");
  const activeLeagueName = leagues.find((league) => league._id === leagueId)?.name ?? "Liga";

  return (
    <div className="league-social screen-stack">
      <div className="screen-heading">
        <span>Social</span>
        <h1>La previa de la liga</h1>
        <p>Miembros activos, chat y picks recientes con datos reales de tu liga.</p>
      </div>
      {!leagueId ? (
        <EmptyState
          message="Aún no estás en una liga."
          actionLabel="Crea o únete a una liga"
          onAction={onShowOnboarding}
        />
      ) : (
        <>
          <section className="content-card glass league-strip">
            <SectionTitle kicker="Mis ligas" title="Cambia de cancha" />
            <div className="league-grid">
              {leagues.map((league) => (
                <article className={`league-card glass ${league._id === leagueId ? "active" : ""}`} key={league._id}>
                  <span>{league.myRole === "owner" ? "Dueño" : "Miembro"} · {league.memberCount ?? 1} jugadores</span>
                  <strong>{league.name}</strong>
                  <p>{league.currentLeader ? `Líder: ${league.currentLeader}` : "Sin pelea todavía"} · {league.myRank ? `Vas #${league.myRank}` : "Aún sin ranking"}</p>
                  <div>
                    <button onClick={() => setActive(league._id)}>Abrir</button>
                    <button onClick={onInvite}>Invitar</button>
                    {league.myRole !== "owner" ? <button onClick={() => onLeave(league._id)}>Salir</button> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <LeagueChat
            leagueId={leagueId}
            leagueName={activeLeagueName}
            currentUser={currentUser}
            memberCount={members?.length ?? 0}
            sessionToken={sessionToken}
          />

          <div className="league-side-panels">
            <section className="content-card glass">
              <SectionTitle kicker="Miembros" title={`${members?.length ?? 0} jugadores`} />
              <div className="member-rail">
                {(members ?? []).map((member) => (
                  <article className="member-pill" key={member.userId}>
                    <span>{member.avatar}</span>
                    <strong>{member.name}</strong>
                  </article>
                ))}
              </div>
            </section>

            <section className="content-card glass">
              <SectionTitle kicker="Actividad" title="Últimas jugadas" />
              <div className="activity-grid">
                {(recent ?? []).slice(0, 4).map((item: ActivityItem) => {
                  const fixture = fixtures.find((f) => f.id === item.fixtureId);
                  if (!fixture) return null;
                  const h = getTeam(fixture.home);
                  const a = getTeam(fixture.away);
                  return (
                    <article className="activity-card glass" key={`${item.userId}-${item.fixtureId}-${item.updatedAt}`}>
                      <strong>{item.userName}</strong>
                      <p>{h.name} {item.home}-{item.away} {a.name}</p>
                      <span>Grupo {fixture.group} · Partido {fixture.matchNo}</span>
                    </article>
                  );
                })}
                {recent && recent.length === 0 ? <EmptyState message="Sin actividad todavía." /> : null}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function LeagueChat({
  leagueId,
  leagueName,
  currentUser,
  memberCount,
  sessionToken,
}: {
  leagueId: Id<"leagues">;
  leagueName: string;
  currentUser: AuthUser;
  memberCount: number;
  sessionToken: string;
}) {
  const messages = useQuery(api.chat.list, { leagueId, sessionToken, limit: 100 }) as
    | {
        _id: Id<"chatMessages">;
        userId?: Id<"users">;
        author: "user" | "relator";
        name: string;
        avatar: string;
        text: string;
        createdAt: number;
      }[]
    | undefined;
  const sendMutation = useMutation(api.chat.send);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const feedRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const insertEmoji = (emoji: string) => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? draft.length;
    const end = input?.selectionEnd ?? draft.length;
    const next = (draft.slice(0, start) + emoji + draft.slice(end)).slice(0, 500);
    setDraft(next);
    setEmojiOpen(false);
    requestAnimationFrame(() => {
      if (!input) return;
      input.focus();
      const caret = Math.min(start + emoji.length, next.length);
      input.setSelectionRange(caret, caret);
    });
  };

  useEffect(() => {
    if (!feedRef.current) return;
    feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [messages?.length]);

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    try {
      await sendMutation({ sessionToken, leagueId, text });
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts: number) =>
    new Intl.DateTimeFormat("es", { hour: "2-digit", minute: "2-digit" }).format(new Date(ts));

  return (
    <section className="chat-screen">
      <header className="chat-header">
        <div>
          <strong>{leagueName}</strong>
          <span>{memberCount} miembros · chat de liga</span>
        </div>
        <button type="button">•••</button>
      </header>
      <div className="chat-feed" ref={feedRef}>
        {messages === undefined ? (
          <div className="chat-empty">Cargando chat…</div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">Sin mensajes todavía. Rompe el hielo.</div>
        ) : (
          messages.map((message) => {
            const isRelator = message.author === "relator";
            const mine = !isRelator && message.userId === currentUser._id;
            return (
              <article className={`chat-message ${mine ? "mine" : ""} ${isRelator ? "relator" : ""}`} key={message._id}>
                {!mine ? <span className="chat-avatar">{message.avatar}</span> : null}
                <div className="chat-stack">
                  {!mine ? (
                    <div className="chat-name">
                      <strong>{message.name}</strong>
                      <span>·</span>
                      <time>{formatTime(message.createdAt)}</time>
                    </div>
                  ) : null}
                  <div className="chat-bubble">{message.text}</div>
                </div>
              </article>
            );
          })
        )}
      </div>
      {error ? <p className="form-error" style={{ padding: "0 12px" }}>{error}</p> : null}
      {emojiOpen ? (
        <div className="chat-emoji-panel" role="menu">
          {["⚽", "🔥", "😂", "😮", "😢", "👏", "🎉", "💪", "🥅", "🟨", "🟥", "🏆"].map((emoji) => (
            <button
              type="button"
              key={emoji}
              aria-label={`Insertar ${emoji}`}
              onClick={() => insertEmoji(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : null}
      <form
        className="chat-composer"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <button
          type="button"
          aria-label="Emojis"
          aria-expanded={emojiOpen}
          className={emojiOpen ? "active" : ""}
          onClick={() => setEmojiOpen((open) => !open)}
        >
          ＋
        </button>
        <input
          ref={inputRef}
          value={draft}
          maxLength={500}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Tira tu comentario..."
          disabled={sending}
        />
        <button type="submit" aria-label="Enviar" disabled={sending || !draft.trim()}>➤</button>
      </form>
    </section>
  );
}

type ShareKind = "invite" | "rank" | "top" | "perfect" | "rivalry" | "clavada";
type ShareCardRow = {
  rank: string;
  name: string;
  points: string;
  avatar?: string;
  highlight?: boolean;
};
type ShareCardPayload = {
  kind: ShareKind;
  title: string;
  subtitle: string;
  detail: string;
  badge: string;
  accent: string;
  code?: string;
  stat?: { value: string; label: string; detail?: string };
  rows?: ShareCardRow[];
  shareText: string;
  shareUrl: string;
};
type SharePreview = {
  kind: ShareKind;
  url: string;
  file: File;
  title: string;
  shareText: string;
  shareUrl: string;
};

function drawShareCard(payload: ShareCardPayload) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const accent = payload.accent;
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
  gradient.addColorStop(0, "#07130d");
  gradient.addColorStop(0.46, "#10151c");
  gradient.addColorStop(1, "#090a0d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1920);

  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  for (let x = -900; x < 1180; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 70);
    ctx.lineTo(x + 920, 1850);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.translate(740, 126);
  ctx.rotate(-0.16);
  ctx.fillStyle = accent;
  roundRect(ctx, 0, 0, 420, 88, 24);
  ctx.fill();
  ctx.fillStyle = "#08090b";
  ctx.font = "900 32px Space Grotesk, Inter, system-ui, sans-serif";
  ctx.fillText("STORY 9:16", 34, 55);
  ctx.restore();

  ctx.fillStyle = "rgba(8, 9, 11, 0.74)";
  ctx.strokeStyle = "rgba(255,255,255,.14)";
  ctx.lineWidth = 2;
  roundRect(ctx, 66, 90, 948, 1740, 44);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,.05)";
  roundRect(ctx, 96, 118, 888, 1684, 34);
  ctx.fill();

  ctx.fillStyle = accent;
  roundRect(ctx, 116, 142, 74, 74, 22);
  ctx.fill();
  ctx.fillStyle = "#08090b";
  ctx.font = "900 42px Space Grotesk, Inter, system-ui, sans-serif";
  ctx.fillText("P", 139, 193);

  ctx.fillStyle = "#f7f8f4";
  ctx.font = "900 36px Space Grotesk, Inter, system-ui, sans-serif";
  ctx.fillText("PARLAI MUNDIAL", 212, 174);
  ctx.fillStyle = "rgba(247,248,244,.56)";
  ctx.font = "700 22px JetBrains Mono, ui-monospace, monospace";
  ctx.fillText("MUNDIAL 2026", 214, 207);

  ctx.fillStyle = "rgba(255,255,255,.11)";
  roundRect(ctx, 116, 262, 310, 54, 27);
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.font = "900 22px JetBrains Mono, ui-monospace, monospace";
  ctx.fillText(payload.badge.toUpperCase(), 142, 297);

  ctx.fillStyle = "#f7f8f4";
  ctx.font = "950 104px Space Grotesk, Inter, system-ui, sans-serif";
  const titleY = wrapText(ctx, payload.title, 116, 438, 844, 108, 4);

  ctx.fillStyle = "#ffcc33";
  ctx.font = "900 44px Space Grotesk, Inter, system-ui, sans-serif";
  const subtitleY = wrapText(ctx, payload.subtitle, 116, Math.max(titleY + 28, 782), 818, 54, 2);

  ctx.fillStyle = "rgba(247,248,244,.72)";
  ctx.font = "600 35px Inter, system-ui, sans-serif";
  const detailY = wrapText(ctx, payload.detail, 116, subtitleY + 38, 806, 48, 3);

  if (payload.stat) {
    const y = Math.max(detailY + 48, 1020);
    ctx.fillStyle = "rgba(255,255,255,.10)";
    ctx.strokeStyle = "rgba(255,255,255,.16)";
    ctx.lineWidth = 2;
    roundRect(ctx, 116, y, 848, 250, 34);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.font = "950 138px Space Grotesk, Inter, system-ui, sans-serif";
    ctx.fillText(payload.stat.value, 154, y + 150);
    ctx.fillStyle = "#f7f8f4";
    ctx.font = "900 38px Space Grotesk, Inter, system-ui, sans-serif";
    wrapText(ctx, payload.stat.label, 470, y + 104, 440, 46, 2);
    if (payload.stat.detail) {
      ctx.fillStyle = "rgba(247,248,244,.54)";
      ctx.font = "700 24px JetBrains Mono, ui-monospace, monospace";
      wrapText(ctx, payload.stat.detail, 470, y + 196, 430, 34, 2);
    }
  }

  if (payload.rows?.length) {
    drawShareRows(ctx, payload.rows, 116, Math.max(detailY + 44, 1030), 848, accent);
  }

  if (payload.code) {
    const y = payload.rows?.length || payload.stat ? 1388 : Math.max(detailY + 80, 1130);
    ctx.fillStyle = "#f7f8f4";
    ctx.font = "900 30px JetBrains Mono, ui-monospace, monospace";
    ctx.fillText("CODIGO DE LIGA", 116, y);
    ctx.fillStyle = accent;
    ctx.strokeStyle = "rgba(198,255,61,.28)";
    ctx.lineWidth = 3;
    roundRect(ctx, 116, y + 34, 848, 184, 34);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#08090b";
    ctx.font = "950 94px JetBrains Mono, ui-monospace, monospace";
    const code = payload.code.toUpperCase();
    const codeWidth = ctx.measureText(code).width;
    ctx.fillText(code, 116 + (848 - codeWidth) / 2, y + 150);
  }

  ctx.fillStyle = "rgba(247,248,244,.12)";
  roundRect(ctx, 116, 1644, 848, 4, 2);
  ctx.fill();

  ctx.fillStyle = "#f7f8f4";
  ctx.font = "900 34px Space Grotesk, Inter, system-ui, sans-serif";
  ctx.fillText("La jugada mundialera", 116, 1708);

  // Destination domain as an accent pill — viewers who screenshot the story
  // still know where to go, even without a clickable link.
  ctx.font = "900 30px JetBrains Mono, ui-monospace, monospace";
  const domainText = DOMAIN_LABEL.toUpperCase();
  const domainWidth = ctx.measureText(domainText).width;
  const domainX = 964 - domainWidth;
  ctx.fillStyle = accent;
  roundRect(ctx, domainX - 24, 1678, domainWidth + 48, 48, 24);
  ctx.fill();
  ctx.fillStyle = "#08090b";
  ctx.fillText(domainText, domainX, 1711);

  ctx.fillStyle = "rgba(247,248,244,.54)";
  ctx.font = "700 24px JetBrains Mono, ui-monospace, monospace";
  wrapText(ctx, "Crea tu liga, tira tus marcadores y presume la tabla.", 116, 1750, 782, 34, 2);
  return canvas;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function ellipsizeText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  let clipped = text;
  while (clipped.length > 1 && ctx.measureText(`${clipped}...`).width > maxWidth) {
    clipped = clipped.slice(0, -1).trimEnd();
  }
  return `${clipped}...`;
}

function textLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (words.length && lines.length === maxLines) {
    const consumed = lines.join(" ").split(/\s+/).length;
    if (consumed < words.length) lines[maxLines - 1] = ellipsizeText(ctx, lines[maxLines - 1], maxWidth);
  }
  return lines;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3,
) {
  const lines = textLines(ctx, text, maxWidth, maxLines);
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
}

function drawShareRows(
  ctx: CanvasRenderingContext2D,
  rows: ShareCardRow[],
  x: number,
  y: number,
  width: number,
  accent: string,
) {
  rows.slice(0, 5).forEach((row, index) => {
    const rowY = y + index * 104;
    ctx.fillStyle = row.highlight ? "rgba(198,255,61,.16)" : "rgba(255,255,255,.08)";
    ctx.strokeStyle = row.highlight ? "rgba(198,255,61,.36)" : "rgba(255,255,255,.12)";
    ctx.lineWidth = 2;
    roundRect(ctx, x, rowY, width, 84, 26);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = row.highlight ? accent : "rgba(247,248,244,.72)";
    ctx.font = "900 30px JetBrains Mono, ui-monospace, monospace";
    ctx.fillText(row.rank, x + 28, rowY + 53);

    ctx.fillStyle = "rgba(255,255,255,.12)";
    ctx.beginPath();
    ctx.arc(x + 142, rowY + 42, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f7f8f4";
    ctx.font = "800 28px Inter, system-ui, sans-serif";
    ctx.fillText(row.avatar ?? row.name.slice(0, 1).toUpperCase(), x + 128, rowY + 52);

    ctx.fillStyle = "#f7f8f4";
    ctx.font = "850 31px Space Grotesk, Inter, system-ui, sans-serif";
    const displayName = ellipsizeText(ctx, row.name, 420).replace("...", "");
    ctx.fillText(displayName, x + 190, rowY + 52);

    ctx.fillStyle = row.highlight ? accent : "#ffcc33";
    ctx.font = "900 30px JetBrains Mono, ui-monospace, monospace";
    const pointsWidth = ctx.measureText(row.points).width;
    ctx.fillText(row.points, x + width - pointsWidth - 28, rowY + 52);
  });
}

function canvasToFile(canvas: HTMLCanvasElement, fileName: string) {
  return new Promise<File | null>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob ? new File([blob], fileName, { type: "image/png" }) : null);
    }, "image/png");
  });
}

function downloadShareFile(url: string, fileName: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function ProfileShareSection({
  league,
  currentUserId,
  sessionToken,
  toast,
  onShowOnboarding,
}: {
  league: LeagueSummary | null;
  currentUserId: Id<"users"> | null;
  sessionToken: string | null;
  toast: (message: string) => void;
  onShowOnboarding: () => void;
}) {
  const rows = useQuery(api.picks.leagueLeaderboard, league && sessionToken ? { leagueId: league._id, sessionToken } : "skip");
  const myIndex = rows?.findIndex((row: LeaderboardRow) => row.userId === currentUserId) ?? -1;
  const myRow = myIndex >= 0 ? (rows?.[myIndex] as LeaderboardRow) : null;
  const topRows = useMemo(
    () =>
      (rows ?? []).slice(0, 5).map((row: LeaderboardRow, index: number) => ({
        rank: `#${index + 1}`,
        name: row.userId === currentUserId ? "Vos" : row.name,
        points: `${row.points} pts`,
        avatar: row.avatar,
        highlight: row.userId === currentUserId,
      })),
    [currentUserId, rows],
  );

  const myPicks = useQuery(
    api.picks.listForUserInLeague,
    league && currentUserId && sessionToken ? { leagueId: league._id, sessionToken } : "skip",
  ) as { fixtureId: string; home: number; away: number }[] | undefined;
  const allResults = useQuery(api.results.list) as { fixtureId: string; home: number; away: number }[] | undefined;
  const bestHit = useMemo(() => {
    if (!myPicks || !allResults) return null;
    const byFixture = new Map(allResults.map((row) => [row.fixtureId, row]));
    let best: { fixtureId: string; result: { home: number; away: number }; points: number; exact: boolean } | null = null;
    for (const pick of myPicks) {
      const result = byFixture.get(pick.fixtureId);
      if (!result) continue;
      const scored = calculatePredictionScore({ home: pick.home, away: pick.away }, result);
      if (scored.points <= 0) continue;
      if (!best || scored.points > best.points) {
        best = { fixtureId: pick.fixtureId, result, points: scored.points, exact: scored.exact };
      }
    }
    return best;
  }, [myPicks, allResults]);

  const [preview, setPreview] = useState<SharePreview | null>(null);
  const [preparing, setPreparing] = useState<ShareKind | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  const closePreview = () => {
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  };

  const sharePayload = (kind: ShareKind): ShareCardPayload | null => {
    if (!league) return null;
    const shareUrl = joinLink(league.code, `story-${kind}`);
    const common = {
      accent: "#c6ff3d",
      shareUrl,
      shareText: `Únete a mi liga "${league.name}" en ParlAI Mundial: ${shareUrl}`,
    };
    const fx = bestHit ? fixtures.find((fixture) => fixture.id === bestHit.fixtureId) : null;
    const matchup = bestHit
      ? fx
        ? `${getTeam(fx.home).code} ${bestHit.result.home}-${bestHit.result.away} ${getTeam(fx.away).code}`
        : `${bestHit.result.home}-${bestHit.result.away}`
      : "";

    return {
      invite: {
        ...common,
        kind: "invite" as const,
        badge: "invitacion",
        title: "Únete a mi liga.",
        subtitle: league.name,
        detail: "Código listo para pegar en tu story. Sin liga no hay pelea.",
        code: league.code,
      },
      rank: {
        ...common,
        kind: "rank" as const,
        badge: "ranking",
        title: myRow ? `Voy #${myIndex + 1} en mi liga mundialera.` : "La tabla no miente.",
        subtitle: league.name,
        detail: myRow
          ? `${myRow.points} puntos · ${myRow.exacts} exactos · ${myRow.correctResults} resultados`
          : "Haz tus jugadas y pelea el liderato.",
        stat: myRow
          ? {
              value: `#${myIndex + 1}`,
              label: "posición actual",
              detail: `${myRow.picks} jugadas · racha ${myRow.streak}`,
            }
          : { value: "--", label: "sin ranking todavía", detail: "primer partido, primera oportunidad" },
      },
      top: {
        ...common,
        kind: "top" as const,
        badge: "top 5",
        title: "Top 5 mundialero",
        subtitle: league.name,
        detail: "La foto de la tabla para prender el grupo.",
        rows: topRows.length
          ? topRows
          : [{ rank: "#1", name: "La previa", points: "0 pts", avatar: "P", highlight: true }],
      },
      perfect: {
        ...common,
        kind: "perfect" as const,
        badge: "exacto",
        title: "Clavé el marcador.",
        subtitle: matchup || "8 puntos al bolsillo",
        detail: `Marcador exacto en ${league.name}. Eso también se presume.`,
        stat: { value: "8", label: "puntos de una", detail: "exacto + diferencia + goles" },
      },
      rivalry: {
        ...common,
        kind: "rivalry" as const,
        badge: "rivalidad",
        accent: "#ffcc33",
        title: "Te falta fútbol para alcanzarme.",
        subtitle: myRow ? `Voy #${myIndex + 1} en ${league.name}` : league.name,
        detail: "Entra, predice y ven a discutir la tabla.",
        code: league.code,
      },
      clavada: {
        ...common,
        kind: "clavada" as const,
        badge: "clavada",
        accent: "#3b82ff",
        title: bestHit?.exact ? "Clavé el marcador." : "Le atiné al resultado.",
        subtitle: matchup || league.name,
        detail: bestHit
          ? `${bestHit.points} ${bestHit.points === 1 ? "punto" : "puntos"} en ${league.name}.`
          : "Cuando le atines a un marcador, presúmelo aquí.",
        stat: bestHit
          ? { value: `+${bestHit.points}`, label: bestHit.exact ? "marcador exacto" : "resultado correcto", detail: matchup }
          : undefined,
      },
    }[kind];
  };

  const prepareShare = async (kind: ShareKind) => {
    const payload = sharePayload(kind);
    if (!payload) return;
    setPreparing(kind);
    try {
      const canvas = drawShareCard(payload);
      if (!canvas) return;
      const file = await canvasToFile(canvas, `parlai-${kind}-${league?.code ?? "story"}.png`);
      if (!file) return;
      const url = URL.createObjectURL(file);
      setPreview((current) => {
        if (current) URL.revokeObjectURL(current.url);
        return {
          kind,
          url,
          file,
          title: payload.title,
          shareText: payload.shareText,
          shareUrl: payload.shareUrl,
        };
      });
    } finally {
      setPreparing(null);
    }
  };

  const sharePrepared = async () => {
    if (!preview) return;
    try {
      if (navigator.share && navigator.canShare?.({ files: [preview.file] })) {
        await navigator.share({
          files: [preview.file],
          title: "ParlAI Mundial 2026",
          text: preview.shareText,
        });
        toast("Story abierta en compartir");
        return;
      }
      downloadShareFile(preview.url, preview.file.name);
      if (navigator.share) {
        await navigator.share({
          title: "ParlAI Mundial 2026",
          text: preview.shareText,
          url: preview.shareUrl,
        }).catch(() => undefined);
      }
      toast("PNG descargada para story");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      downloadShareFile(preview.url, preview.file.name);
      toast("PNG descargada para story");
    }
  };

  const copyShareLink = async () => {
    if (!preview) return;
    try {
      await navigator.clipboard.writeText(preview.shareUrl);
      toast("Link copiado");
    } catch {
      toast(preview.shareUrl);
    }
  };

  const downloadPrepared = () => {
    if (!preview) return;
    downloadShareFile(preview.url, preview.file.name);
    toast("PNG descargada");
  };

  return (
    <>
      <div className="screen-heading">
        <span>Instagram stories</span>
        <h2>Comparte la pelea.</h2>
        <p>Cards 9:16 listas para ranking, invitación, top 5, predicción perfecta y rivalidad.</p>
      </div>
      {!league ? (
        <EmptyState
          message="Crea o únete a una liga para compartir."
          actionLabel="Crea o únete a una liga"
          onAction={onShowOnboarding}
        />
      ) : (
        <div className="share-grid">
          <button className="share-tile glass" disabled={!!preparing} onClick={() => prepareShare("invite")}><strong>{preparing === "invite" ? "Armando..." : "Invitación"}</strong><span>Únete a mi liga · {league.code}</span></button>
          <button className="share-tile glass" disabled={!!preparing} onClick={() => prepareShare("rank")}><strong>{preparing === "rank" ? "Armando..." : "Mi ranking"}</strong><span>{myRow ? `Vas #${myIndex + 1}` : "Aún sin ranking"}</span></button>
          <button className="share-tile glass" disabled={!!preparing} onClick={() => prepareShare("top")}><strong>{preparing === "top" ? "Armando..." : "Top 5"}</strong><span>La tabla no miente</span></button>
          {bestHit?.exact ? (
            <button className="share-tile glass" disabled={!!preparing} onClick={() => prepareShare("perfect")}><strong>{preparing === "perfect" ? "Armando..." : "Perfecta"}</strong><span>Marcador exacto</span></button>
          ) : null}
          {bestHit ? (
            <button className="share-tile glass" disabled={!!preparing} onClick={() => prepareShare("clavada")}><strong>{preparing === "clavada" ? "Armando..." : "Clavada"}</strong><span>{bestHit.exact ? "Marcador exacto" : `+${bestHit.points} pts`}</span></button>
          ) : null}
          <button className="share-tile glass" disabled={!!preparing} onClick={() => prepareShare("rivalry")}><strong>{preparing === "rivalry" ? "Armando..." : "Rivalidad"}</strong><span>Te falta fútbol</span></button>
        </div>
      )}
      {preview ? createPortal(
        <div className="share-preview-backdrop" role="dialog" aria-modal="true" aria-label="Vista previa de story">
          <div className="share-preview glass-strong">
            <button className="share-preview-close" type="button" aria-label="Cerrar vista previa" onClick={closePreview}>×</button>
            {/* eslint-disable-next-line @next/next/no-img-element -- Blob previews are generated client-side and cannot be optimized by next/image. */}
            <img src={preview.url} alt={`Story ${preview.title}`} />
            <div className="share-preview-actions">
              <button type="button" onClick={sharePrepared}>Compartir story</button>
              <button type="button" onClick={downloadPrepared}>Descargar</button>
              <button type="button" onClick={copyShareLink}>Copiar link</button>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}

function ProfileScreen(props: {
  picks: Record<string, LocalPick>;
  leagueName: string;
  league: LeagueSummary | null;
  currentUserId: Id<"users"> | null;
  sessionToken: string | null;
  toast: (message: string) => void;
  onShowOnboarding: () => void;
  onUpdate: (profile: { name: string; handle: string; avatar: string; favoriteTeam?: string }) => void;
  onLogout: () => void;
  user: AuthUser;
}) {
  return <ProfileScreenInner key={props.user._id} {...props} />;
}

function ProfileScreenInner({
  picks,
  leagueName,
  league,
  currentUserId,
  sessionToken,
  toast,
  onShowOnboarding,
  onUpdate,
  onLogout,
  user,
}: {
  picks: Record<string, LocalPick>;
  leagueName: string;
  league: LeagueSummary | null;
  currentUserId: Id<"users"> | null;
  sessionToken: string | null;
  toast: (message: string) => void;
  onShowOnboarding: () => void;
  onUpdate: (profile: { name: string; handle: string; avatar: string; favoriteTeam?: string }) => void;
  onLogout: () => void;
  user: AuthUser;
}) {
  const [name, setName] = useState(user.name);
  const [handle, setHandle] = useState(user.handle);
  const initialAvatar = (AVATAR_EMOJIS as readonly string[]).includes(user.avatar) ? user.avatar : AVATAR_EMOJIS[0];
  const [avatar, setAvatar] = useState<string>(initialAvatar);
  const [favoriteTeam, setFavoriteTeam] = useState(user.favoriteTeam ?? "");

  void picks;
  void leagueName;

  return (
    <div className="screen-stack">
      <div className="profile-header glass-strong">
        <div className="profile-avatar">{avatar}</div>
        <div>
          <span>@{handle}</span>
          <h1>Tu perfil mundialero</h1>
          <p>Arma tu perfil antes del pitazo. Tu Mundial empieza aquí.</p>
        </div>
      </div>

      <form
        className="filters profile-form glass"
        onSubmit={(event) => {
          event.preventDefault();
          onUpdate({ name, handle, avatar, favoriteTeam: favoriteTeam || undefined });
        }}
      >
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Tu nombre" maxLength={40} />
        <input value={handle} onChange={(event) => setHandle(event.target.value)} placeholder="handle" maxLength={18} />
        <div className="avatar-picker" role="radiogroup" aria-label="Elige tu avatar">
          {AVATAR_EMOJIS.map((emoji) => (
            <button
              type="button"
              role="radio"
              aria-checked={avatar === emoji}
              className={`avatar-option ${avatar === emoji ? "active" : ""}`}
              onClick={() => setAvatar(emoji)}
              key={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
        <select value={favoriteTeam} onChange={(event) => setFavoriteTeam(event.target.value)}>
          <option value="">Sin favorita</option>
          {teams.map((team) => <option value={team.id} key={team.id}>{team.flag} {team.name}</option>)}
        </select>
        <button type="submit">Guardar</button>
      </form>

      <ProfileShareSection
        league={league}
        currentUserId={currentUserId}
        sessionToken={sessionToken}
        toast={toast}
        onShowOnboarding={onShowOnboarding}
      />

      <div className="settings-grid">
        <button className="glass" onClick={onShowOnboarding}>Ver onboarding otra vez</button>
        <button className="glass" onClick={onLogout}>Cerrar sesión</button>
      </div>
    </div>
  );
}

function PickModal({
  fixture,
  initial,
  close,
  save,
  saving,
}: {
  fixture: Fixture;
  initial?: LocalPick;
  close: () => void;
  save: (pick: LocalPick) => void;
  saving: boolean;
}) {
  const [home, setHome] = useState(initial?.home ?? 1);
  const [away, setAway] = useState(initial?.away ?? 0);
  const h = getTeam(fixture.home);
  const a = getTeam(fixture.away);
  const locked = isFixtureLocked(fixture);
  const maxPoints = calculatePredictionScore({ home, away }, { home, away }).points;

  return (
    <div className="modal-backdrop" onClick={close}>
      <section className="pick-modal glass-strong" onClick={(event) => event.stopPropagation()}>
        <button className="close" onClick={close} aria-label="Cerrar">×</button>
        <span>Grupo {fixture.group} · {dateLabel(fixture.date)} · {fixture.time}</span>
        <h2>Tu jugada</h2>
        <div className="pick-teams">
          <ScoreStepper team={h} value={home} setValue={setHome} />
          <b>–</b>
          <ScoreStepper team={a} value={away} setValue={setAway} />
        </div>
        <div className="score-rules glass">
          <span>Exacto {maxPoints} · Resultado 3 · Diferencia +1 · Goles +1/+1</span>
          <strong>{locked ? "Ya cerró este partido." : `Te la juegas con ${h.name} ${home}-${away} ${a.name}`}</strong>
        </div>
        <button className="save-pick" onClick={() => save({ home, away, bonus: [] })} disabled={saving || locked}>
          {locked ? "Ya cerró este partido" : saving ? "Guardando…" : `Predicción guardada · ${home}-${away}`}
        </button>
      </section>
    </div>
  );
}

function ScoreStepper({ team, value, setValue }: { team: Team; value: number; setValue: (value: number) => void }) {
  return (
    <div className="score-stepper">
      <TeamBadge id={team.id} size={62} />
      <strong>{team.name}</strong>
      <div>
        <button onClick={() => setValue(Math.max(0, value - 1))} aria-label="Menos">−</button>
        <b style={{ color: team.accent }}>{value}</b>
        <button onClick={() => setValue(Math.min(9, value + 1))} aria-label="Más">+</button>
      </div>
    </div>
  );
}

function Onboarding({
  close,
  onCreate,
  onJoin,
  busy,
  error,
}: {
  close: () => void;
  onCreate: (name: string) => void;
  onJoin: (code: string) => void;
  busy: boolean;
  error: string | null;
}) {
  const [mode, setMode] = useState<"intro" | "create" | "join">("intro");
  const [name, setName] = useState("Los Cuates FC");
  const [code, setCode] = useState("");

  return (
    <div className="onboarding">
      <section className="onboarding-card glass-strong">
        <button className="close" onClick={close} aria-label="Cerrar">×</button>
        <span>Bienvenido a ParlAI Mundial</span>
        <h1>Predice el Mundial con tu liga, sin hojas raras ni chats perdidos.</h1>

        {mode === "intro" ? (
          <>
            <div className="onboarding-steps">
              <article><b>1</b><strong>Crea o únete a una liga</strong><p>Comparte un código y todos compiten en la misma tabla.</p></article>
              <article><b>2</b><strong>Carga tus jugadas</strong><p>Marcador exacto antes de cada partido real. Cierra al pitazo.</p></article>
              <article><b>3</b><strong>Sigue la tabla</strong><p>Exacto, resultado correcto, diferencia y goles clavados.</p></article>
            </div>
            <div className="onboarding-actions">
              <button onClick={() => setMode("create")}>Crear mi liga</button>
              <button onClick={() => setMode("join")}>Unirme con código</button>
              <button onClick={close}>Explorar calendario</button>
            </div>
          </>
        ) : mode === "create" ? (
          <form
            className="onboarding-form"
            onSubmit={(event) => {
              event.preventDefault();
              onCreate(name);
            }}
          >
            <label>
              <span>Nombre de tu liga</span>
              <input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} required minLength={2} />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            <div className="onboarding-actions">
              <button type="submit" disabled={busy}>{busy ? "Creando…" : "Crear liga"}</button>
              <button type="button" onClick={() => setMode("intro")}>Volver</button>
            </div>
          </form>
        ) : (
          <form
            className="onboarding-form"
            onSubmit={(event) => {
              event.preventDefault();
              onJoin(code.toUpperCase());
            }}
          >
            <label>
              <span>Código de invitación</span>
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                maxLength={6}
                minLength={6}
                pattern="[A-Z0-9]{6}"
                placeholder="ABC123"
                required
              />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            <div className="onboarding-actions">
              <button type="submit" disabled={busy}>{busy ? "Buscando…" : "Unirme"}</button>
              <button type="button" onClick={() => setMode("intro")}>Volver</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function Toast({ message, actionLabel, onAction }: { message: string | null; actionLabel?: string; onAction?: () => void }) {
  if (!message) return null;
  return (
    <div className="toast">
      <span>{message}</span>
      {actionLabel && onAction ? <button type="button" onClick={onAction}>{actionLabel}</button> : null}
    </div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("inicio");
  const [selected, setSelected] = useState<Fixture | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installHint, setInstallHint] = useState(false);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [onboardingBusy, setOnboardingBusy] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [savingPick, setSavingPick] = useState(false);

  const { sessionToken, user, loading: authLoading, signup, login, logout, sendResetCode, resetPasswordWithCode } = useAuth();
  const userId = user?._id ?? null;
  const myLeagues = useQuery(api.leagues.listForUser, sessionToken ? { sessionToken } : "skip") as LeagueSummary[] | undefined;
  const { activeLeagueId, setActive } = useActiveLeague(myLeagues);
  const activeLeague = useQuery(
    api.leagues.get,
    activeLeagueId && sessionToken ? { leagueId: activeLeagueId, sessionToken } : "skip"
  ) as LeagueSummary | null | undefined;

  const picksList = useQuery(
    api.picks.listForUserInLeague,
    activeLeagueId && sessionToken ? { leagueId: activeLeagueId, sessionToken } : "skip"
  );

  const createLeague = useMutation(api.leagues.create);
  const joinLeague = useMutation(api.leagues.joinByCode);
  const leaveLeague = useMutation(api.leagues.leave);
  const savePickMutation = useMutation(api.picks.save);
  const updateProfile = useMutation(api.users.updateProfile);

  useEffect(() => {
    if (!userId) return;
    const seen = window.localStorage.getItem("parleyia:onboarded");
    if (!seen && myLeagues && myLeagues.length === 0) {
      const code = new URLSearchParams(window.location.search).get("join");
      if (!code) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowOnboarding(true);
      } else {
        window.localStorage.setItem("parleyia:onboarded", "yes");
      }
    }
  }, [userId, myLeagues]);

  useEffect(() => {
    if (!userId || !sessionToken) return;
    const code = new URLSearchParams(window.location.search).get("join");
    if (!code) return;
    const key = `parleyia:joined:${code.toUpperCase()}`;
    if (window.localStorage.getItem(key)) return;
    window.localStorage.setItem(key, "yes");
    joinLeague({ sessionToken, code })
      .then((result) => {
        setActive(result.leagueId);
        setToast("Te uniste desde el link");
        setScreen("liga");
      })
      .catch((err) => setToast(err instanceof Error ? err.message : "Link inválido"));
  }, [joinLeague, sessionToken, setActive, userId]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) return;
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setToast("Instala ParlAI como app");
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    const fallback = window.setTimeout(() => {
      setInstallHint(true);
      setToast("Instala ParlAI en tu pantalla de inicio");
    }, 1400);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.clearTimeout(fallback);
    };
  }, []);

  const picks = useMemo<Record<string, LocalPick>>(() => {
    if (!picksList) return {};
    const result: Record<string, LocalPick> = {};
    for (const p of picksList) {
      result[p.fixtureId] = { home: p.home, away: p.away, bonus: p.bonus };
    }
    return result;
  }, [picksList]);

  const pendingCount = useMemo(
    () => fixtures.filter((fixture) => !isFixtureLocked(fixture) && !picks[fixture.id]).length,
    [picks]
  );

  const savePickFor = useCallback(
    async (fixture: Fixture, pick: LocalPick) => {
      if (!sessionToken || !activeLeagueId) {
        if (!activeLeagueId) {
          setToast("Crea o únete a una liga primero");
          setShowOnboarding(true);
        }
        throw new Error("Sin liga activa");
      }
      await savePickMutation({
        sessionToken,
        leagueId: activeLeagueId,
        fixtureId: fixture.id,
        home: pick.home,
        away: pick.away,
        bonus: pick.bonus,
      });
    },
    [activeLeagueId, savePickMutation, sessionToken]
  );

  const savePickFromModal = async (pick: LocalPick) => {
    if (!selected) return;
    setSavingPick(true);
    try {
      await savePickFor(selected, pick);
      playTick();
      setToast("Jugada guardada");
      setSelected(null);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Error guardando");
    } finally {
      setSavingPick(false);
    }
  };

  const closeOnboarding = () => {
    window.localStorage.setItem("parleyia:onboarded", "yes");
    setShowOnboarding(false);
    setOnboardingError(null);
  };

  const handleCreate = async (name: string) => {
    if (!sessionToken) return;
    setOnboardingError(null);
    setOnboardingBusy(true);
    try {
      const result = await createLeague({ sessionToken, name });
      setActive(result.leagueId);
      setToast(`Liga creada · código ${result.code}`);
      closeOnboarding();
      setScreen("liga");
    } catch (err) {
      setOnboardingError(err instanceof Error ? err.message : "Error creando liga");
    } finally {
      setOnboardingBusy(false);
    }
  };

  const handleJoin = async (code: string) => {
    if (!sessionToken) return;
    setOnboardingError(null);
    setOnboardingBusy(true);
    try {
      const result = await joinLeague({ sessionToken, code });
      setActive(result.leagueId);
      setToast(`Te uniste a la liga`);
      closeOnboarding();
      setScreen("liga");
    } catch (err) {
      setOnboardingError(err instanceof Error ? err.message : "Código inválido");
    } finally {
      setOnboardingBusy(false);
    }
  };

  const handleInvite = async () => {
    if (!activeLeague) return;
    const link = joinLink(activeLeague.code, "invite");
    const text = `🏆 Te reto a unirte a mi liga "${activeLeague.name}" en ParlAI Mundial. ¿Sabes más de fútbol que yo? Compite conmigo aquí:`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Liga ${activeLeague.name} · ParlAI Mundial`,
          text: text,
          url: link,
        });
        return;
      } catch {
        // Fallback if share sheet is closed or fails
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${link}`);
      setToast(`Mensaje copiado · ${activeLeague.code}`);
    } catch {
      setToast(`Código: ${activeLeague.code}`);
    }
  };


  const handleUpdateProfile = async (profile: { name: string; handle: string; avatar: string; favoriteTeam?: string }) => {
    if (!sessionToken) return;
    await updateProfile({ sessionToken, ...profile });
    setToast("Perfil actualizado");
  };

  const handleLeave = async (leagueId: Id<"leagues">) => {
    if (!sessionToken) return;
    try {
      await leaveLeague({ sessionToken, leagueId });
      setToast("Saliste de la liga");
    } catch (err) {
      setToast(err instanceof Error ? err.message : "No se pudo salir");
    }
  };

  const openPick = (fixture: Fixture) => {
    if (isFixtureLocked(fixture)) {
      setToast("Ya cerró este partido");
      return;
    }
    if (!activeLeagueId) {
      setToast("Crea o únete a una liga primero");
      setShowOnboarding(true);
      return;
    }
    setSelected(fixture);
  };

  const handleInstallApp = async () => {
    if (!installPrompt) {
      setToast("Usa compartir → Agregar a inicio");
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    setInstallHint(false);
    setToast(choice.outcome === "accepted" ? "ParlAI instalada" : "Instalación cancelada");
  };

  const leagueName = activeLeague?.name ?? "Sin liga activa";
  const leagueCode = activeLeague?.code ?? null;
  const leagues = myLeagues ?? [];
  const showInstallAction = Boolean((installPrompt || installHint) && toast?.startsWith("Instala"));

  const handleSignup = async (args: { email: string; password: string; name: string; handle: string; avatar: string; favoriteTeam?: string }) => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signup(args);
      const code = new URLSearchParams(window.location.search).get("join");
      if (!code) {
        setShowOnboarding(true);
      } else {
        window.localStorage.setItem("parleyia:onboarded", "yes");
      }
    } catch (err) {
      setAuthError(cleanAuthError(err, "No se pudo crear la cuenta"));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogin = async (args: { email: string; password: string }) => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await login(args);
    } catch (err) {
      setAuthError(cleanAuthError(err, "No se pudo entrar"));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleReset = async (args: { email: string }) => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await sendResetCode(args);
      setToast("Código enviado. Revisa tu correo.");
    } catch (err) {
      setAuthError(cleanAuthError(err, "Error al enviar código"));
      throw err;
    } finally {
      setAuthBusy(false);
    }
  };

  const handleVerifyReset = async (args: { email: string; code: string; newPassword: string }) => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await resetPasswordWithCode(args);
      setToast("Contraseña restablecida correctamente");
    } catch (err) {
      setAuthError(cleanAuthError(err, "Error al restablecer contraseña"));
      throw err;
    } finally {
      setAuthBusy(false);
    }
  };

  if (authLoading) {
    return <main className="auth-shell"><EmptyState message="Cargando tu Mundial…" /></main>;
  }

  if (!user) {
    return (
      <AuthScreen
        onSignup={handleSignup}
        onLogin={handleLogin}
        onReset={handleReset}
        onVerifyReset={handleVerifyReset}
        busy={authBusy}
        error={authError}
      />
    );
  }

  return (
    <main className={`real-app ${screen === "tabla" ? "focus-screen" : ""}`}>
      <Nav screen={screen} setScreen={setScreen} />
      <section className="app-main">
        <div className="topbar-wrap">
          <TopBar
            leagueName={leagueName}
            leagueCode={leagueCode}
            onInvite={handleInvite}
            onOnboarding={() => setShowOnboarding(true)}
          />
        </div>
        {screen === "inicio" && (
          <HomeScreen
            picks={picks}
            openPick={openPick}
            savePickFor={savePickFor}
            go={setScreen}
            pendingCount={pendingCount}
            leagues={leagues}
          />
        )}
        {screen === "partidos" && (
          <MatchesScreen picks={picks} savePickFor={savePickFor} openPick={openPick} />
        )}
        {screen === "tabla" && <LeaderboardScreen leagueId={activeLeagueId} currentUserId={userId} sessionToken={sessionToken} onShowOnboarding={() => setShowOnboarding(true)} />}
        {screen === "liga" && sessionToken && (
          <LeagueScreen
            leagueId={activeLeagueId}
            leagues={leagues}
            setActive={setActive}
            onLeave={handleLeave}
            onInvite={handleInvite}
            currentUser={user}
            sessionToken={sessionToken}
            onShowOnboarding={() => setShowOnboarding(true)}
          />
        )}
        {screen === "perfil" && (
          <ProfileScreen
            picks={picks}
            leagueName={leagueName}
            league={activeLeague ?? null}
            currentUserId={userId}
            sessionToken={sessionToken}
            toast={setToast}
            onShowOnboarding={() => setShowOnboarding(true)}
            onUpdate={handleUpdateProfile}
            onLogout={logout}
            user={user}
          />
        )}
      </section>
      {selected && (
        <PickModal
          fixture={selected}
          initial={picks[selected.id]}
          close={() => setSelected(null)}
          save={savePickFromModal}
          saving={savingPick}
        />
      )}
      {showOnboarding && (
        <Onboarding
          close={closeOnboarding}
          onCreate={handleCreate}
          onJoin={handleJoin}
          busy={onboardingBusy}
          error={onboardingError}
        />
      )}
      <Toast
        message={toast}
        actionLabel={showInstallAction ? "Instalar" : undefined}
        onAction={showInstallAction ? handleInstallApp : undefined}
      />
    </main>
  );
}
