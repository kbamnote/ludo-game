# LUDO AFTER DARK — Mobile

> **YOUR FACE. YOUR AVATAR. YOUR SQUAD.**
> Ludo hits different when *you* are the token.

The **React Native / Expo client** for a premium Gen-Z social multiplayer Ludo game. Players turn
their own photos into personalised 3D cartoon characters, and those characters become their
playable tokens.

**Audience:** 16–28 · **Aesthetic:** Tokyo cyber-streetwear, midnight neon
**Status:** Phase 0 complete (project audit) — not yet implemented

> **This is one of two repositories.** The backend lives separately in
> [`ludo-server`](../ludo-server) — Node, Colyseus, PostgreSQL, and the shared `@ludo/engine`
> rules package. See [`../README.md`](../README.md) for how they fit together.

---

## Current state

This repository currently contains **documentation and design reference only**. No application code
has been written yet. See [PROJECT_STATUS.md](PROJECT_STATUS.md) for the full audit.

```
ludo-mobile/
├─ PROJECT_STATUS.md          ← audit, risks, roadmap, open questions
├─ docs/
│  ├─ ASSET_INVENTORY.md      what art exists, what is missing
│  ├─ SCREEN_MAP.md           Stitch screen → route → components → assets
│  └─ PHASE_1_PLAN.md         the next phase, file by file
├─ design-reference/
│  ├─ assets/                 37 graphics (WebP, committed) + manifest + fetch script
│  │  └─ raw/                 PNG masters (gitignored — re-fetchable)
│  ├─ screens/                (Stitch HTML, pulled per screen in Phase 2)
│  └─ design-system/          (token export, Phase 1)
├─ src/                       empty feature-based skeleton
└─ tests/                     empty
```

### Where the game rules live

**Not here.** The Ludo rule set is a single shared package, `@ludo/engine`, owned by the
`ludo-server` repo at `../ludo-server/packages/engine`. The server is authoritative for dice and
token movement, so the rules belong on its side; this repo consumes the same package for legal-move
highlighting, optimistic animation and CPU practice games.

`src/game/` in this repo holds **rendering, animation and input only** — never rules. See
PROJECT_STATUS §7.4.

---

## Design source of truth

Google Stitch project `16378329217088749782` — *Ludo After Dark Mobile*
Design system: **Midnight Arcade Cyber-Ludo**

| Token | Value |
|---|---|
| Void canvas | `#0A0B10` |
| Player 1 — Lime | `#00FF87` |
| Player 2 — Cyan | `#00F0FF` |
| Player 3 — Hot Pink | `#FF007A` |
| Player 4 — Violet | `#8B5CF6` |
| Display / headline | **Syne** 600 / 700 / 800 |
| Body / label | **Plus Jakarta Sans** 400 / 500 / 700 / 800 |

12 screens are designed. **Settings** and **onboarding steps 2–3** are not.

---

## Intended stack

**Mobile** — React Native · Expo · JSX · Expo Router · NativeWind · React Native Skia ·
Reanimated · Gesture Handler · Zustand · TanStack Query · React Hook Form · Expo Haptics /
Image Picker / AV

**Game engine** — `@ludo/engine`, from the sibling repo. Deterministic, pure JS (ESM + JSDoc), zero
React Native and zero Node imports, unit-tested in isolation. Rules, state, rendering, animation and
input are kept strictly separate — now across a repository boundary, which enforces it absolutely.

**Backend** — see [`../ludo-server`](../ludo-server). Node.js · NestJS · Colyseus · WebSockets ·
PostgreSQL · Redis · JWT · cloud object storage. **The server is authoritative** for dice and token
movement; client results are never trusted.

---

## Build phases

| Phase | Repo | Scope | State |
|---|---|---|---|
| 0 | both | Project audit | ✅ Complete |
| 1 | mobile | Application foundation | ⏳ Awaiting approval |
| 2 | mobile | Complete UI implementation | — |
| 3 | both | Personal AI avatar system | — |
| 4 | both | Complete Ludo game engine | — |
| 5 | both | Real-time multiplayer | — |
| 6 | both | Social gaming | — |
| 7 | both | Progression and monetisation | — |
| 8 | both | Performance and production release | — |

Each phase ends with tests, lint, a status update, and an explicit approval gate. From Phase 3
onward, every phase lands as a coordinated pair of commits across the two repos.

---

## Working with design assets

All 37 Stitch graphics are stored locally and no longer depend on Google's CDN. To re-fetch:

```bash
bash design-reference/assets/fetch-assets.sh
```

The script is idempotent — it skips anything already downloaded.
`design-reference/assets/manifest.tsv` maps every file to the screens that use it.

---

## Product principles

- Visually stunning, extremely smooth, social, easy to understand
- Competitive but **fair** — no pay-to-win, no sold gameplay advantage
- Optimised for mid-range Android; target a stable 60 FPS, **verified by profiling on real
  devices**, never claimed without measurement
- Photo uploads are private by default, consented explicitly, and deletable by the user
- No production secrets in the mobile app, ever
