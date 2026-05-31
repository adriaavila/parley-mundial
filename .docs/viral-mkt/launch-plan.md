# ParlAI Mundial — Launch & Viral Plan (T-12 → Cup)

**Today:** 2026-05-30 · **Cup kickoff (first match MEX–RSA, Estadio Azteca):** 2026-06-11
**Content hard-launch:** ~2026-06-01 (T-10) · **Week-1 checkpoint:** 2026-06-06

**Founder constraints:** solo, cold start (no audience), 3–4 h/day, ≤ $50 paid reserved for *later* amplification.
**North-star principle (founder's words):** *"producto bien sólido, cuidado, que la gente ame"* — polish and product-love come BEFORE spend or volume. Quality is the moat.

---

## 0. Reframe

Cold start + product-first + 12 days = **do NOT chase user numbers in week 1.** Chase:
1. A v1 people *love* and *show their friends* unprompted.
2. A measured viral loop (every new user invites ≥ 2).
3. A primed content engine (clips banked, posting daily).

Vanity reach is week-2+. Week 1 is product + loop + tracking.

---

## 1. App state (audit 2026-05-30)

| Area | Status |
|------|--------|
| Landing `/`, app `/play`, route split | ✅ done (PR #2) |
| Leagues, predictions, scoring, fixtures (real 2026 calendar) | ✅ |
| Leaderboard (liga + global) | ✅ |
| Human chat per league (rate-limited) | ✅ |
| Share story-cards (canvas 9:16) + WhatsApp/X share + join flow | ✅ (domain now `parlai.frontia.app`) |
| Google OAuth | ✅ backend wired (`loginOrSignupWithGoogle` + routes) — **needs env + UI button** |
| Vercel Analytics | ✅ installed |
| **AI Chat Referee / Recap / Hype** | ❌ no LLM anywhere |
| **Facebook auth** | ❌ |
| **EN / PT i18n** | ❌ all copy hardcoded ES |
| **PostHog event funnel** | ❌ |

---

## 2. Decisions (scoped for the runway)

| Ask | Decision | Why |
|-----|----------|-----|
| **Google auth** | ✅ SHIP for launch | Backend done — only needs `GOOGLE_CLIENT_ID` env + a button. Removes signup friction (cold traffic hates forms). |
| **Facebook auth** | ⏸️ DEFER past cup | FB OAuth app review can take days–weeks; high risk to block launch. Google + email covers ~all. Revisit if data shows FB-heavy audience. |
| **AI Chat Referee** | ✅ SHIP **templates-first** (no LLM) | raw-ideas itself says "templates antes que LLM". Deterministic, $0, instant, no abuse/cost risk. Triggers: on prediction, on result, on @mención. The *feel* of AI without the bill. LLM spice = post-cup. |
| **AI Recap (daily)** | ✅ SHIP **template** → shareable card | Reuses existing share-card canvas. Most viral surface in the doc. |
| **PT-BR i18n** | 🟡 FAST-FOLLOW (P1) | Brazil = largest Mundial audience in LATAM. Big upside. But only after ES is perfect. |
| **EN i18n** | ⏸️ DEFER | Not the cold-start market. Post-cup. |
| **PostHog** | ✅ SHIP day 1 | Can't improve a loop you can't see. Free tier covers it. |
| **Paid ads** | ⏸️ HOLD | Spend only after a clip proves organic traction. Protect the $50. |

---

## 3. App-readiness backlog (engineering)

### P0 — must ship before content hard-launch (by Jun 1)
1. **Onboarding < 60s.** Cold user → create or join league → first prediction, frictionless. Polish empty states ("Crea o únete a una liga…").
2. **Google sign-in button** in `AuthScreen` (backend ready) + set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in Vercel.
3. **Landing copy → quiniela framing** (raw-ideas exact tasks):
   - Headline: *"Arma tu quiniela del Mundial 2026 y demuestra quién sabe más de fútbol."*
   - Primary CTA: *"Crear liga gratis"* (currently "Empezar a predecir").
4. **Viral loop polish:** after league creation, auto-prompt WhatsApp invite + "copiar link"; tighten invite copy; "Crear liga" as the dominant CTA everywhere.
5. **PostHog + core events** (section 4).
6. **QA pass on mobile:** fixture locking at kickoff, scoring correctness, PWA install, share-sheet on iOS/Android, story-card render.
7. **Differentiate from `parlai.app`** (the WhatsApp language tutor) — lean hard on "Mundial / quiniela / fútbol" in title, OG, store-ish copy. Avoid "AI tutor" confusion.

### P1 — high impact if time (Jun 2–7)
8. **AI Chat Referee (templates).** Convex: on `picks` insert / `results` insert / `@relator` mention → post a templated "El Relator" message. Persona from raw-ideas §10. Rules: ≤ 50 words, no per-message spam.
9. **Daily AI Recap (template)** → auto-generate a shareable recap card (MVP / peor take / drama / ranking).
10. **PT-BR i18n** (`next-intl`, ES default + PT). Brazil reach.

### P2 — defer past cup
FB OAuth · EN i18n · LLM-powered referee (Gemini 2.5 Flash-Lite routing per raw-ideas §8) · monetization (premium leagues, bar/pro tier).

---

## 4. Tracking — PostHog events (ship day 1)

```txt
landing_view · cta_clicked · signup_started · signup_completed
league_created · league_joined · friend_invited · invite_link_copied
prediction_made · chat_message_sent · ai_reply_generated
leaderboard_viewed · share_card_generated · result_shared
return_day_1 · return_day_7
```

**Core funnel (watch daily):**
`landing_view → cta_clicked → signup_completed → league_created/joined → prediction_made → friend_invited → result_shared → return_day_1`

**Two numbers that decide everything:**
- **Activation** = % of signups that join/create a league AND make ≥ 1 prediction. Target ≥ 60%. (This is the "do they love it" signal.)
- **Viral coefficient** = invites accepted per new user. Target ≥ 2.

---

## 5. Campaign brief (organic-first)

### Objective
Product-validated soft launch: prove people love it and spread it, then scale reach during the cup.
- **Week-1 (Jun 6):** 50–100 real users from cold seeding, **activation ≥ 60%**, **invites/user ≥ 2**, 10 clips banked, daily posting live.
- **Cup-day (Jun 11):** loop + referee + recap proven; ready to pour content into the first-match traffic spike.

### Audience
LATAM football WhatsApp-group culture: **MX, CO, AR, and US-Latino**, plus **BR (PT)** as fast-follow.
> "Group-chat football fans who argue about who knows more, discover apps via WhatsApp/TikTok, and care about bragging rights with their friends."
Buying stage: unaware → curious. Emotion: competencia, amistad, humor, FOMO, identidad (raw-ideas §1).

### Core message
**"El Mundial no se mira solo. Se juega con tus amigos."**
Supporting: (1) *quiniela del grupo* con ranking y pique; (2) crea tu liga en 10 s, invita por WhatsApp; (3) el que habla mucho queda expuesto; (4) "El Relator" (IA) mete cizaña sana. Position as **prediction game / quiniela — NOT betting** (gambling framing kills reach + stores).

### Channels (organic, cold start)
| Channel | Role | Effort |
|---------|------|--------|
| TikTok / IG Reels / YT Shorts | Primary discovery — short vertical | High |
| X/Twitter | Founder build-in-public + clips | Low |
| WhatsApp personal + groups | **Direct seeding (your strongest cold lever)** | Medium |
| Facebook groups (Mundial/selección/Latino) | Community seeding, days 8–14 | Medium |
| (Paid) | HOLD until a clip proves itself | — |

### Content calendar (week-by-week)
| Window | Theme | Pieces | Channel |
|--------|-------|--------|---------|
| Jun 1–2 | Hook tests | 3 clips (vendehumo, ranking, founder POV) | TikTok/Reels/Shorts/X |
| Jun 3–4 | Share-card moment | clips showing story-card + join flow | all + WhatsApp |
| Jun 5–7 | Content launch ramp | 2–3 clips/day, double down on winning hook | all |
| Jun 8–11 | Community seeding | seed Spanish football groups + matchday hype | FB groups, WhatsApp, all |

### Content pieces (must-have)
The 5 scripted videos from raw-ideas §4 (vendehumo, ranking del grupo, IA cizaña, antes del partido, founder POV) + latino-rivalry + 4 meme text-cards. Each: **Hook → demo → giro → CTA** (raw-ideas §2), captions burned in, 9:16, ≤ 20s.

### Success metrics
Primary: **activation ≥ 60%**. Secondary: invites/user ≥ 2, signups, league_created/landing_view, result_shared/leaderboard_viewed, top hook by CTR. Cadence: PostHog dashboard daily; the raw-ideas §6 IA weekly review every Friday.

### Risks
- **Rough product kills word-of-mouth** → P0 polish before any push (founder's own priority).
- **Solo bandwidth** → batch-produce clips with HyperFrames + templates; reuse one screen-recording many ways.
- **Gambling misread** → always "quiniela/predicción", never "apuestas".
- **`parlai.app` confusion** → hammer "Mundial" everywhere.

---

## 6. Content production — HyperFrames + tool stack

**HyperFrames** (HTML video, deterministic render) for the repeatable, on-brand assets — batch many in the founder's 3–4 h:
- Animated **hook cards** (big text intros, the §3 hooks).
- **Ranking reveal** animations (tabla sliding in, podium).
- **Meme text-cards** (§7 — "Cuando dijiste que España ganaba fácil…").
- **Story/share-card** motion versions of the existing canvas cards.
- Captions / lower-thirds synced to a voiceover (TTS via HyperFrames media).

Composite with: Screen Studio/QuickTime (app demo recordings) → CapCut (assembly, subtitles) → Canva (thumbnails). Hook variations via Claude. This keeps daily output high without a video team.

---

## 7. Week-1 goal (set, grounded)

> **By Jun 6: ship a polished, tracked, share-tight v1; seed 50–100 real users from your network; hit activation ≥ 60% and invites/user ≥ 2; bank 10 clips and post daily.**

If activation < 60% → fix product before spending a peso. If ≥ 60% and invites ≥ 2 → the loop works; pour content in and consider the $50 boost on the best clip.

---

## 8. Day-by-day (May 30 → Jun 11)

| Date | T- | Product | Content/Growth |
|------|----|---------|----------------|
| May 30 (today) | T-12 | Merge PR #2; start P0 (onboarding, Google button, landing copy) | Write 10 hook scripts; set up TikTok/IG/YT/X accounts |
| May 31 | T-11 | Finish P0 viral-loop polish; install PostHog + events | Record app demo screen-grabs; build HyperFrames hook templates |
| **Jun 1** | **T-10** | QA pass mobile/PWA; deploy v1 | **Hard-launch: post clips 1–3 (vendehumo, ranking, founder)** |
| Jun 2 | T-9 | Start AI Referee (templates) | 2 clips; begin WhatsApp seeding (your groups) |
| Jun 3 | T-8 | Referee live; daily Recap card | clips showing share-card moment |
| Jun 4 | T-7 | Bugfix from real-user feedback | 2–3 clips; double down on best hook |
| Jun 5 | T-6 | PT-BR i18n (if on track) | clips; seed more groups |
| **Jun 6** | **T-5** | **Week-1 checkpoint: activation + invites review** | weekly IA review (§6); decide on $50 boost |
| Jun 7 | T-4 | Polish from data | ramp posting |
| Jun 8 | T-3 | Stability hardening | FB-group community seeding begins |
| Jun 9 | T-2 | Final QA, load sanity | matchday-hype clips queued |
| Jun 10 | T-1 | Freeze; monitoring ready | "último día antes del pitazo" FOMO push |
| **Jun 11** | **CUP** | Watch fixtures lock at kickoff; live | Matchday content; ride the traffic spike |

---

## 9. Immediate next steps (today)
1. Merge PR #2 (landing→`/`, app→`/play`, domain).
2. Landing copy → quiniela headline + "Crear liga gratis".
3. Add Google sign-in button + set OAuth env in Vercel.
4. Install PostHog + wire the §4 events.
5. Draft the 10 hook scripts and build the first HyperFrames hook template.
