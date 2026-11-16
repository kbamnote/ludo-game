# LUDO AFTER DARK (Mobile) — Project Status

**Phase:** 3 — Personal AI Avatar System (complete, awaiting approval for Phase 4)
**Audit date:** 2026-11-13 · **Revised:** 2026-11-13 for the two-repository split
**Phase 1 completed:** 2026-11-13
**Repository:** `ludo-mobile` — `D:\Print World\ludo-game\ludo-mobile`
**Sibling repository:** `ludo-server` — see `../ludo-server/PROJECT_STATUS.md`
**Design source of truth:** Google Stitch project `16378329217088749782` — *Ludo After Dark Mobile*

> This document covers the **mobile client only**. Backend findings live in the `ludo-server` repo.
> Workspace-level orientation is in `../README.md`.

---

## 1. Executive summary

The project directory was **completely empty**. There is no existing code, no `package.json`, no Expo
app, no backend, and no git repository. This is a pure greenfield build — nothing can be broken and
nothing needs preserving.

Per your instruction, the work is split into **two independent git repositories** —
`ludo-mobile` and `ludo-server` — under a non-versioned workspace folder. Both are initialised on
`main`. That split introduces one genuinely new architectural problem, **R11: the Ludo rules engine
must exist identically on both sides** of a server-authoritative game. It is solved in §7.4, not
deferred.

The Google Stitch design, by contrast, is **substantial and high quality**: 12 fully designed mobile
screens, a complete design-token system ("Midnight Arcade Cyber-Ludo"), and 37 bespoke generated
graphics. All 37 graphics are downloadable and have been pulled into `design-reference/assets/`.

Three findings materially affect planning and need a decision before Phase 1:

| # | Finding | Impact |
|---|---|---|
| **R1** | The "3D Gameplay Board" screen is **decorative, not a real Ludo board** — no 15×15 grid, no 52-cell track, no home columns. | The board must be engineered from first principles. Stitch gives us *style*, not *layout*, for the single most important screen. |
| **R2** | The design system mandates **heavy glassmorphism** (`backdrop-filter: blur(20px)` on nearly every surface), which the brief separately asks us to avoid, and which is expensive on mid-range Android. | Needs an explicit visual-fidelity vs. performance ruling. See §7.1. |
| **R3** | Stitch uses **Material Symbols Outlined** (~70 glyphs) throughout; the brief specifies **Lucide React Native**. They are not visually interchangeable. | Needs an icon ruling. See §7.2. |

Nothing is blocked. Recommendations are given for all three; Phase 1 can start as soon as they are
confirmed.

---

## 2. What already exists

### 2.1 In the project directory

**Nothing.** `D:\Print World\ludo-game` contained zero files and zero subdirectories (including
hidden ones) at the time of audit.

Phase 0 has since created, and only created, non-code scaffolding:

```
D:\Print World\ludo-game\          workspace folder — deliberately NOT a git repo
├─ README.md                       program overview, points at both repos
├─ ludo-mobile/                    ← git repo #1 (this one)
│  ├─ .gitignore
│  ├─ PROJECT_STATUS.md            this file
│  ├─ README.md
│  ├─ docs/                        ASSET_INVENTORY · SCREEN_MAP · PHASE_1_PLAN
│  ├─ design-reference/
│  │  ├─ assets/                   37 WebP (committed) + manifest.tsv + fetch-assets.sh
│  │  ├─ assets/raw/               37 PNG masters (gitignored — 38 MB, re-fetchable)
│  │  ├─ screens/                  empty — Stitch HTML re-pulled per screen in Phase 2
│  │  └─ design-system/            empty — populated in Phase 1
│  ├─ src/                         empty feature-based skeleton (see §8)
│  └─ tests/                       empty
└─ ludo-server/                    ← git repo #2 (see its own PROJECT_STATUS.md)
```

No source code, no dependencies, and no configuration have been written. No existing work was
overwritten, because there was none.

### 2.2 Backend

None. No server, no database, no Colyseus room code, no schema. The `ludo-server` repo exists as a
directory skeleton and documentation only; see `../ludo-server/PROJECT_STATUS.md`.

### 2.3 Git

Both `ludo-mobile` and `ludo-server` are now initialised as **separate repositories on `main`**,
each with its own `.gitignore`.

The parent folder `D:\Print World\ludo-game` is intentionally **not** a repository — nesting repos
inside a repo produces confusing submodule behaviour. It is a plain workspace folder holding a
`README.md` that orients a newcomer towards the two real repos.

Neither repo has a remote yet. Both need one creating before any cross-repo CI can run.

---

## 3. Available Google Stitch designs

All 12 screens are `DESIGN` type, `MOBILE`, authored at 780 px wide (≈390 pt @2x).

| # | Stitch screen | Shell | Height | Maps to route |
|---|---|---|---|---|
| 1 | Splash Screen | `mobile_blank` | 1768 | `app/index.jsx` |
| 2 | Onboarding Experience | `mobile_blank` | 1768 | `app/(onboarding)/[step].jsx` |
| 3 | Login & Signup | `mobile_blank` | 1768 | `app/(auth)/sign-in.jsx` |
| 4 | Avatar Customization Studio | `mobile_tab` | 2728 | `app/(tabs)/profile/avatar.jsx` |
| 5 | Home Dashboard | `mobile_tab` | 2736 | `app/(tabs)/index.jsx` |
| 6 | Multiplayer Match Lobby | `mobile_tab` | 1912 | `app/(tabs)/play/lobby.jsx` |
| 7 | 3D Gameplay Board | `mobile_stack` | 1768 | `app/match/[id].jsx` |
| 8 | Profile & Achievements | `mobile_tab` | 2356 | `app/(tabs)/profile/index.jsx` |
| 9 | Global Leaderboard | `mobile_tab` | 2728 | `app/(tabs)/leaderboard.jsx` |
| 10 | Streetwear Store & Battle Pass | `mobile_tab` | 4086 | `app/(tabs)/play/store.jsx` |
| 11 | Friends & Social Hub | `mobile_tab` | 1904 | `app/(tabs)/friends.jsx` |
| 12 | Match Results & Victory | `mobile_stack` | 2256 | `app/match/[id]/results.jsx` |

Full per-screen component breakdowns are in [docs/SCREEN_MAP.md](docs/SCREEN_MAP.md).

### 3.1 Required screens with no Stitch design

The brief lists 14 screens. Two have no design:

| Brief screen | Status |
|---|---|
| **Settings** | **No Stitch screen exists.** The splash and lobby both link to a settings surface, but it was never designed. |
| **Signup** (separate) | Partially covered — Stitch screen 3 is a *tabbed* Login/Signup ("ENTER SYNDICATE" / "NEW RUNNER") sharing one phone-OTP form. A dedicated signup screen does not exist, and arguably is not needed. |

Additionally, the onboarding screen's own step indicator reads **"PHASE 01 / 03"** — but only
phase 1 was designed. **Onboarding steps 2 and 3 are missing.**

### 3.2 Design system

One design system is attached: **"Midnight Arcade Cyber-Ludo"**, complete and machine-readable.

**Core tokens** (these port 1:1 into `src/theme/theme.js`):

- Surfaces: `#0A0B10` void → `#0d0e13` → `#121318` → `#1a1b21` → `#1e1f25` → `#292a2f` → `#34343a`
- Four faction accents: Lime `#00FF87`, Cyan `#00F0FF`, Hot Pink `#FF007A`, Violet `#8B5CF6`
- Type: **Syne** (600/700/800) for display + headlines, **Plus Jakarta Sans** (400/500/700/800) for body + labels
- Radii: 0.25 / 0.5 / 0.75 / 1 / 1.5 rem + pill
- Spacing: 4 px base — `space-xs` 0.25rem … `space-xl` 1.75rem, `gutter` 0.75rem, `margin` 1rem

**Inconsistency to resolve:** the written design system declares the four factions as
Lime / Cyan / **Hot Pink `#FF007A`** / **Violet `#8B5CF6`**, but the gameplay and lobby screens as
actually generated use Lime / Cyan / **pale pink `#ffb1c3`** / **salmon `#ffb4ab`** (the Material
`tertiary-fixed-dim` and `error` roles). The vivid brand palette is the better choice and is what
the brief asks for — **recommend following the written design system, not the generated screens**,
for faction colours.

---

## 4. Available graphics

**37 unique images**, all generated 3D/illustrated artwork, all successfully downloaded.

| Category | Count | Notes |
|---|---|---|
| Brand logo | 1 | Isometric neon dice + "LUDO AFTER DARK" lockup |
| Environment / scene art | 3 | Onboarding arcade, auth club banner, home alleyway |
| Character avatars | 29 | Player portraits used across home, lobby, gameplay, friends, leaderboard, profile |
| Store product art | 4 | Phantom wings, liquid dice, Shibuya board skin, bass emote |

**Technical characteristics (verified, not assumed):**

- Native resolution caps at **1024 × 1024**. Requesting `=s2048` still returns 1024.
- Served as JPEG by default; `=w1024-rp` gives PNG and `=w1024-rw` gives WebP (~35 % smaller).
- **The PNGs are 8-bit RGB with no alpha channel.** Every asset — logo and characters included — is
  an opaque square with the background baked in.
- The baked background is near-black but **not** the app's `#0A0B10`/`#121318`, so naively dropping
  the logo onto a screen leaves a visible square plate.

Stored at `design-reference/assets/<name>.webp` (app-ready) and
`design-reference/assets/raw/<name>.png` (archival master), with
`design-reference/assets/manifest.tsv` mapping every file to its screen usage and source URL.
`fetch-assets.sh` re-fetches idempotently.

Full table in [docs/ASSET_INVENTORY.md](docs/ASSET_INVENTORY.md).

---

## 5. Missing graphics and assets

Reported rather than silently substituted, per the brief.

### 5.1 Blocking for Phase 2 (UI)

| Missing | Where it bites | Current Stitch placeholder |
|---|---|---|
| **Transparent character cutouts** | Characters must sit on the board, in glowing rings, and over scene art. Opaque squares cannot. | n/a — all art is opaque |
| **App icon / adaptive icon / splash image** | Required by `app.json` for any Android build. | Logo exists but opaque, square, no maskable safe-area variant |
| **Avatar-studio cosmetic thumbnails** (4+) | Cosmetics grid on screen 4 | Material Symbols glyphs: `dry_cleaning`, `smart_toy`, `content_cut`, `blur_on` |
| **Achievement / badge art** (24 implied, "18/24 unlocked") | Profile badges rail | Material Symbols: `casino`, `track_changes`, `magic_button`, `local_fire_department` |
| **Emote / sticker art** | Taunt bar, soundboard, post-game reactions, chat | Literal emoji: 🔥 💀 😭 🤝 ⚔️ 🎲 💥 ⚡ 🤡 |
| **Onboarding phases 2 & 3** | Carousel advertises 3 steps | Only step 1 designed |
| **Settings screen design** | Brief requires it | Not designed |

> On the emoji: the brief says never to substitute emoji for illustrations. Here the *Stitch design
> itself* specifies emoji. These are placeholders for a sticker set that does not exist. Flagging
> rather than shipping emoji or inventing art.

### 5.2 Blocking for Phase 4 (game engine)

| Missing | Notes |
|---|---|
| **Ludo board artwork** | No board asset and no board layout in any design. See R1. |
| **Dice face art / dice skins** | Dice are drawn with CSS dots. The store sells "Obsidian Liquid Dice" with a *marketing* image, but no in-game dice sprite. |
| **Token / pawn art** | Rendered as the `person_pin_circle` glyph. The core product promise — *your face is the token* — has no token frame or chassis art. |
| **Board theme variants** | Store sells "Shibuya Underground" board skin; only the marketing image exists. |
| **Victory / defeat animations** | No Lottie, Rive, or sprite sheets. |

### 5.3 Non-art assets

| Missing | Recommendation |
|---|---|
| **Audio** — zero files. Design references dice SFX, "Bass Boost SFX", "Lo-Fi Rain Audio", a soundboard, voice chat. | Source or commission in Phase 4. Not blocking Phases 1–3. |
| **Fonts** — Syne, Plus Jakarta Sans not bundled. | Both are free (OFL) on Google Fonts. Bundle via `expo-font` in Phase 1. **Not a real gap.** |
| **Icon font** — Material Symbols Outlined, ~70 glyphs. | See R3 / §7.2. |

---

## 6. Environment and toolchain

| Component | Found | Verdict |
|---|---|---|
| Node.js | **v26.13.0** | ⚠️ Too new — see R4 below |
| npm | 11.20.0 | OK |
| git | 2.56.1.windows.1 | OK (repo not initialised) |
| eas-cli | 27.7.2 (global) | ✅ Useful — enables cloud Android builds |
| **JDK / `java`** | **not installed** | ❌ Blocks local Android builds |
| **Android SDK / `adb`** | **not installed**, `ANDROID_HOME` unset | ❌ Blocks local emulator + device installs |
| Disk (D:) | 661 GB free | OK |
| Platform | Windows 10 Home, PowerShell + Git Bash | OK |

**There is no existing Expo setup to validate** — the question of whether it is "valid" does not
arise. It will be created in Phase 1.

**R4 — Node 26 is ahead of Expo's supported range.** Current Expo SDKs target Node 20/22 LTS.
Node 26 is untested and routinely breaks Metro and `expo-doctor`. **Strong recommendation: install
Node 22 LTS via `nvm-windows` and pin it with an `.nvmrc`.** I would not start Phase 1 on Node 26.

**Android build path.** Two options, not mutually exclusive:

- **(A) Local** — install JDK 17 + Android Studio (SDK, platform-tools, an emulator image). ~8 GB,
  one-time. Gives fast iteration, on-device profiling, and is **required** for the Phase 8
  performance work, which cannot be done honestly without real devices.
- **(B) Cloud** — `eas-cli` is already installed; `eas build -p android` produces APKs with no local
  Android SDK. Day-to-day development runs through **Expo Go** or a dev client on a physical phone
  over Wi-Fi.

**Recommendation: start with (B)** so Phase 1 is not gated on an 8 GB install, and add (A) before
Phase 4, when Skia board rendering and frame timing start to matter.

---

## 7. Decisions needed before Phase 1

### 7.1 R2 — Glassmorphism

The design system is explicit: every floating surface is `rgba(26,29,46,0.72)` with
`backdrop-filter: blur(20px) saturate(180%)` and a 1 px rim highlight. The header, bottom nav, every
pill, and most cards use it. The brief separately says "avoid unnecessary glassmorphism."

In React Native, `backdrop-filter` has no direct equivalent. `expo-blur`'s `BlurView` is the closest,
and on mid-range Android each instance costs a real-time GPU readback. Twenty of them on a scrolling
screen will not hold 60 FPS.

**Recommendation — tiered:**
- **Real `BlurView`:** at most 2 per screen, on genuinely overlapping chrome only (fixed header, bottom tab bar).
- **Simulated:** everything else gets an opaque surface token at the blurred colour's perceptual equivalent, plus the 1 px `rgba(255,255,255,0.08)` rim and inset top highlight. At these opacities this is visually near-identical over a dark background and essentially free.

This preserves the design's personality while honouring both the perf target and the brief. Needs
your sign-off since it is a deliberate, if small, departure from Stitch.

### 7.2 R3 — Icons

Stitch uses ~70 **Material Symbols Outlined** glyphs. Many have no Lucide equivalent
(`person_pin_circle`, `military_tech`, `workspace_premium`, `stadia_controller`, `dry_cleaning`,
`magic_button`, `hotel_class`, `graphic_eq`). `@expo/vector-icons`' bundled `MaterialIcons` is the
*older* icon set and is also missing several (`skull`, `crown`, `swords`, `apparel`).

**Recommendation:** bundle the **Material Symbols Outlined** variable font locally and expose it
through a single `<Icon name="casino" />` component built with `createIconSet` and the official
codepoint map. This reproduces the design exactly, is one font file, and keeps icon usage centralised.
Keep `lucide-react-native` installed for anything Material Symbols lacks.

This is a documented deviation from the brief's "Lucide React Native" line, made to satisfy the
higher-priority rule that Stitch is the source of truth. Say the word if you would rather map
everything to Lucide and accept the visual drift.

### 7.3 R1 — The board

The gameplay screen shows four corner houses, a central "NEXUS" hub, and about a dozen loose path
tiles arranged for looks. A real Ludo board needs a 15×15 grid, a 52-cell shared track, four 5-cell
home columns, 8 safe cells, and 16 token positions. **None of that geometry exists in the design.**

**Recommendation:** treat screen 7 as a *style guide* (HUD layout, voice strip, dice launcher, emote
bar, house treatment, glow language) and derive the board geometry mathematically in
`src/game/board/`, rendered with Skia. The look is preserved; the layout is engineered. This is
already how the brief wants rules and rendering separated, so it costs nothing architecturally — but
it means the board is **built, not traced**, and I want that understood up front rather than
discovered in Phase 4.

### 7.4 R11 — Where the game engine lives (new, caused by the repo split)

This is the one real cost of separating the repos, and it needs settling now rather than in Phase 5.

The brief requires the **server to be authoritative** for dice and token movement, and to validate
every move server-side. But the mobile client also needs the same rules in order to highlight legal
moves, animate optimistically, and run practice games against CPU. So the identical Ludo rule set
must execute in both repos.

If the two copies ever drift, the client proposes moves the server rejects — the worst category of
multiplayer bug, and one that only shows up under real play.

**Options considered**

| | Approach | Verdict |
|---|---|---|
| A | Engine as a package **inside `ludo-server`**, published as `@ludo/engine`, consumed by mobile | ✅ **Recommended** |
| B | A third repo, `ludo-engine` | Clean, but you asked for two repos |
| C | Git submodule shared by both | No registry needed, but submodules are persistent friction |
| D | Copy the code into both + contract tests | Rejected — drift is a matter of when, not if |

**Recommendation (A).** The scaffold already reflects it: `ludo-server/packages/engine/`. The server
owns the canonical rules, which is the correct ownership for a server-authoritative game, and it
keeps the repo count at exactly two.

- Written in **plain JavaScript (ESM) with JSDoc types** — so the JSX mobile app imports it natively
  with no build step, and a TypeScript backend can still type-check it via `allowJs` + `checkJs`.
- Zero dependencies. No React Native imports, no Node built-ins. Runs identically in Hermes and Node.
- Published to a private registry as `@ludo/engine`, pinned by exact version in both repos.
- During development, mobile consumes it via `file:../ludo-server/packages/engine` or `npm link`,
  so iteration stays instant; the registry only matters for CI and release.
- `src/game/` in this repo therefore holds **rendering, animation and input only** — never rules.

**R12, a corollary:** the HTTP and WebSocket contract is now also cross-repo. The server repo owns
`docs/API_CONTRACT.md` plus a generated OpenAPI spec and the Colyseus schema; this repo consumes
them. Mobile must never hand-roll a type that the server already defines.

---

## 8. Recommended project structure

### 8.1 Workspace

```
D:\Print World\ludo-game\          workspace folder — NOT a git repo
├─ README.md
├─ ludo-mobile/                    git repo #1 — Expo app
└─ ludo-server/                    git repo #2 — Node + Colyseus + @ludo/engine
```

### 8.2 `ludo-mobile` (this repo)

Matches the brief, with additions marked ➕ and the engine removed per §7.4.

```
ludo-mobile/
├─ app/                          ➕ Expo Router root (routes only — thin re-exports)
├─ src/
│  ├─ components/
│  │  ├─ common/  buttons/  cards/  animations/
│  │  └─ icons/                  ➕ Material Symbols wrapper
│  ├─ features/
│  │  ├─ onboarding/  authentication/  home/  avatar/  gameplay/
│  │  ├─ multiplayer/  friends/  leaderboard/  profile/  store/
│  │  └─ settings/               ➕ (brief requires the screen)
│  ├─ game/                      ⚠ PRESENTATION ONLY — rules live in @ludo/engine
│  │  ├─ board/                  Skia rendering of the geometry the engine exposes
│  │  ├─ dice/                   dice visuals + roll animation
│  │  ├─ tokens/                 token sprites, movement tweens
│  │  └─ animations/             capture, victory, turn transitions
│  ├─ services/                  api · auth · avatar-provider · colyseus · storage
│  ├─ store/                     Zustand slices
│  ├─ hooks/  theme/  utils/
│  └─ assets/  images/  fonts/  audio/
├─ tests/                        components/  integration/
├─ design-reference/             screens/  assets/  design-system/
├─ docs/
├─ app.json  babel.config.js  tailwind.config.js  metro.config.js
├─ .gitignore  PROJECT_STATUS.md  README.md
```

**Change from the original plan:** `src/game/engine/` and `src/game/rules/` are **gone**. Rules now
come from `@ludo/engine`. This strengthens rather than weakens the brief's "keep game logic
independent of UI" rule — the logic is now in a different repository and physically cannot import a
component.

**Note on `app/`:** Expo Router requires its route directory at the project root by default. Using
`src/app` needs `"main": "expo-router/entry"` plus a Metro alias. Recommend root-level `app/`
holding only thin route files that re-export screens from `src/features/*`, keeping the feature
architecture intact.

### 8.3 `ludo-server`

Summarised here; the authoritative version is `../ludo-server/PROJECT_STATUS.md`.

```
ludo-server/
├─ src/
│  ├─ modules/        auth users avatars friends matches leaderboard store progression moderation
│  ├─ realtime/       rooms/ schema/ matchmaking/        ← Colyseus
│  ├─ services/       storage/ avatar-provider/
│  ├─ common/         guards/ filters/ pipes/
│  ├─ config/  database/  utils/
├─ packages/
│  └─ engine/         ← @ludo/engine — the shared, authoritative Ludo rules
├─ test/  docs/
```

---

## 9. Recommended dependencies

Pinned exactly at Phase 1 against the chosen Expo SDK; versions below are deliberately omitted
because the SDK dictates them.

**Core:** `expo`, `expo-router`, `react`, `react-native`, `react-native-screens`,
`react-native-safe-area-context`

**Styling:** `nativewind`, `tailwindcss`, `react-native-reanimated`, `react-native-gesture-handler`

**Rendering:** `@shopify/react-native-skia`, `expo-linear-gradient`, `expo-blur`, `expo-image`
(➕ — needed for disk caching and `contentFit`; plain `<Image>` is not adequate here)

**State / data:** `zustand`, `@tanstack/react-query`, `react-hook-form`,
`@react-native-async-storage/async-storage`, `expo-secure-store` (➕ — tokens must not go in AsyncStorage)

**Device:** `expo-font`, `expo-splash-screen`, `expo-haptics`, `expo-image-picker`,
`expo-image-manipulator` (➕ — crop), `expo-av`, `expo-status-bar`

**Icons:** `@expo/vector-icons`, `lucide-react-native`, `react-native-svg`

**Game rules:** `@ludo/engine` — from the `ludo-server` repo (§7.4). Added at Phase 4, consumed via
`file:../ludo-server/packages/engine` during development and by exact version in CI.

**Multiplayer (Phase 5):** `colyseus.js`

**Dev:** `jest`, `jest-expo`, `@testing-library/react-native`, `eslint`, `eslint-config-expo`,
`prettier`

Server dependencies are no longer listed here — they belong to the `ludo-server` repo and are
documented in `../ludo-server/PROJECT_STATUS.md`.

---

## 10. Development roadmap

| Phase | Scope | Gate |
|---|---|---|
| Phase | Repo(s) | Scope | Gate |
|---|---|---|---|
| **0** | both | Audit, asset inventory, structure, roadmap, repo split | ◀ **you are here** — awaiting approval |
| **1** | mobile | Expo + Router + NativeWind + theme.js + primitives + nav shell | App launches on Android, tab nav works, tokens applied |
| **2** | mobile | All 12 Stitch screens + Settings; sample data, loading/empty states | Visual match reviewed screen by screen |
| **3** | **both** | Avatar system — client capture/crop/preview; **server** does provider calls, storage, deletion | End-to-end against a stub provider; no keys in the app |
| **4** | **both** | `@ludo/engine` in server repo + Skia board, Reanimated tokens/dice, haptics in mobile | Engine unit tests green; full local 4-player game playable |
| **5** | **both** | Colyseus rooms, auth, matchmaking, server-authoritative dice/moves, reconnect | 4 real clients; disconnect/reconnect verified |
| **6** | **both** | Friends, parties, reactions, chat + moderation, LiveKit voice, spectate, report/block | Safety controls demonstrable |
| **7** | **both** | XP, levels, challenges, achievements, leaderboards, coins, cosmetics, battle pass | No pay-to-win; purchase validation server-side |
| **8** | **both** | Device profiling, optimisation, crash reporting, analytics, release build | Measured FPS/memory on low/mid/high Android — no unverified claims |

**Impact of the split on sequencing.** Phases 0–2 are mobile-only and unaffected. From Phase 3 on,
every phase touches both repos, so each needs a coordinated pair of commits and a documented
contract change. Phase 4 now *starts* in `ludo-server` (build and test `@ludo/engine` headlessly,
where it is fastest to iterate) and only then moves to mobile for rendering.

Phases 3 and 4 remain independent of each other and could run in parallel.

---

## 11. Risk register

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | Gameplay board is decorative; real geometry must be engineered | **High** | Derive board maths in `src/game/board/`; Stitch screen 7 as style reference only |
| R2 | Pervasive glassmorphism vs. 60 FPS on mid-range Android | **High** | Tiered approach (§7.1) — real blur ≤2/screen, simulated elsewhere |
| R3 | Material Symbols vs. the brief's Lucide | Medium | Bundle Material Symbols font + `<Icon>` wrapper; Lucide as fallback |
| R4 | ~~Node 26 unsupported by Expo tooling~~ — **withdrawn, this was wrong** | — | Expo SDK 58 declares `node: "^22.13.0 \|\| ^24.3.0 \|\| ^26.0.0 \|\| >=27.0.0"` and Metro `>= 26.0.0`. Node 26 is explicitly supported, and the whole Phase 1 build runs on it. No version manager needed. |
| R15 | ~~Jest cannot run: `VCRUNTIME140_1.dll` missing~~ — **RESOLVED** | — | MS Visual C++ 2015-2022 Redistributable x64 installed (v14.52.37029.0). Jest runs; 25/25 tests pass. Diagnosis in §14. |
| R5 | No JDK / Android SDK — cannot build or profile locally | Medium | EAS Build + Expo Go now; install Android Studio before Phase 4 |
| R6 | All character art is opaque with no alpha; tokens need cutouts | **High** | Decide: commission alpha art, run background removal, or render tokens as Skia rings masking a circular crop (cheapest, looks intentional) |
| R7 | Avatar AI provider unchosen; cost + latency + content-safety unknown | Medium | Phase 3 builds a provider-agnostic interface; all keys server-side only |
| R8 | Stitch URLs are CDN-hosted and may expire | Low | **Already mitigated** — all 37 assets pulled locally with a re-runnable fetch script |
| R9 | Design mixes real-money framing ("entry fee", "winner takes", "$19.99") with "wager tier strictly simulated" | Medium | Needs a product/legal ruling before Phase 7. Real-money wagering changes store-listing and jurisdiction requirements substantially. |
| R10 | Voice chat (LiveKit) needs a dev client, not Expo Go | Low | Expected; plan a dev-client build at Phase 6 |
| R11 | **Two repos → the Ludo rules must exist identically on client and server; drift causes rejected-move desyncs** | **High** | Single `@ludo/engine` package owned by the server repo, consumed by mobile (§7.4). Never reimplement rules in this repo. |
| R12 | API + Colyseus schema contract now spans repos and can drift | Medium | Server repo owns `docs/API_CONTRACT.md` + generated OpenAPI + Colyseus schema; mobile consumes, never redefines |
| R13 | Two repos must be versioned and released in step from Phase 3 onward | Medium | Paired commits referencing each other's SHA; pin `@ludo/engine` by exact version; add a cross-repo contract test in CI |
| R14 | No git remotes configured on either repo | Low | Create both remotes before Phase 1 ends so work is backed up and reviewable |

---

## 12. Phase 1 plan

See [docs/PHASE_1_PLAN.md](docs/PHASE_1_PLAN.md) for the full file-by-file breakdown.

Summary: initialise git and the Expo app on Node 22, wire Expo Router with the `(tabs)` shell the
Stitch screens imply (Home · Friends · Play FAB · Rank · Profile), port the Stitch design tokens
verbatim into `src/theme/theme.js` and `tailwind.config.js`, bundle Syne + Plus Jakarta Sans and the
icon font, build the ~12 primitives every screen reuses (NeonButton, GlassSurface, StatPill,
CurrencyChip, SectionHeader, Avatar, ScreenHeader, TabBar, Loading, Empty, ErrorBoundary,
ProgressBar), stand up Zustand + TanStack Query providers, and confirm the app boots on Android.

No screen content is built in Phase 1 — that is Phase 2.

---

## 14. Phase 1 result

**Status: complete**, on Expo SDK 58 / React Native 0.88.1 / React 19.3.0.

### Verified

| Check | Result |
|---|---|
| `npx expo-doctor` | ✅ **20/20 checks pass** |
| `npx eslint .` | ✅ **0 errors, 0 warnings** |
| `npx expo export --platform android` | ✅ **1,849 modules → 4.0 MB Hermes bundle**, all 37 graphics + fonts included |
| `npx jest` | ✅ **25/25 tests pass**, 2 suites (tokens + component smoke) |
| Launch on a physical Android device | ⚠️ **not verified** — no device or emulator available here |

One exit criterion I set in the Phase 1 plan is therefore **not** met, and I am not going
to claim otherwise: nothing has run on real hardware. The bundle compiling proves every
import resolves and every file parses, and the tests prove the primitives mount and behave;
neither proves the UI *looks* right.

### R15 — Jest was blocked by a missing Windows DLL (resolved)

`VCRUNTIME140_1.dll` was absent from `Windows\System32`. The chain:

1. `jest-resolve` 30.x resolves modules through `unrs-resolver`, a native Rust addon.
2. Its Windows binary (`@unrs/resolver-binding-win32-x64-msvc`) is installed and intact,
   but needs `VCRUNTIME140_1.dll` from the MS Visual C++ 2015-2022 Redistributable.
3. The DLL is missing, so `require()` of the `.node` binary throws
   *"The specified module could not be found"*.
4. `unrs-resolver` then reports *"Cannot find native binding"*.
5. `jest-resolve.findNodeModule()` returns `null` for **every** path — including Jest's own
   `jest-circus` runner — so Jest aborts during config validation.

Ruled out by testing, not assumption: reproduces with **zero config** on a trivial test, under
**both Node 26 and Node 22**, and **inside and outside** a path containing a space.
`fs.statSync()` confirms the files Jest reports as "not found" exist.

**Fixed by:**

```bash
winget install --id Microsoft.VCRedist.2015+.x64
```

Installed v14.52.37029.0. `findNodeModule()` now returns real paths, and Jest runs.
`jest.config.js` needed no change for this.

### Two further issues the first real test run exposed

Both were latent — they could only surface once Jest could actually execute.

1. **Reanimated 4 needs a Jest resolver, not a mock.** Importing anything from
   `react-native-reanimated` threw *"Cannot read properties of undefined (reading
   `loadUnpackersWithCode`)"*, because `react-native-worklets` has no JS counterpart under
   Node. Reanimated ships `react-native-reanimated/jest/resolver` to redirect those
   internals to their web builds — but jest-expo already sets its own resolver and Jest
   accepts only one. Both are middleware-shaped, so `tests/resolver.js` chains them.

2. **RNTL 14 made `render()` async.** It returns a Promise now, for React 19 concurrent
   rendering. A forgotten `await` surfaces as *"getByRole is not a function"*, which is
   thoroughly misleading. Every `render()` in the suite is awaited, and the file says why.

### One real bug the tests caught

`ProgressBar` set `accessibilityRole="progressbar"` but not `accessible`. Without both,
the element is not exposed as a single unit, so **TalkBack skips it entirely** — every
progress bar in the app would have been invisible to screen readers. Fixed.

That is the harness paying for itself on its first run.

### Built

- **Tokens** — `src/theme/` (colors, typography, spacing, effects) + a 1:1 `tailwind.config.js`
  mirror, so Stitch class names carry straight over into Phase 2
- **Icons** — Material Symbols subset to the 98 glyphs the design uses: **10.5 MB → 220 KB**
  (97.9% smaller), with a build that fails loudly on an unknown glyph name
- **Fonts** — Syne + Plus Jakarta Sans via `@expo-google-fonts`, held behind the splash gate
- **Primitives** — Text, GlassSurface, AmbientGlow, NeonButton, IconButton, StatPill,
  CurrencyChip, Avatar, AvatarStack, SectionHeader, ProgressBar, SegmentedTabs, WaveformBars,
  CountdownTimer, Screen, Loading/Empty/Error/Skeleton, ErrorBoundary, AppHeader, AppTabBar
- **Navigation** — Expo Router with the five-tab shell and raised Play FAB
- **State** — Zustand (auth/user/settings) + TanStack Query, tokens in `expo-secure-store`
- **Assets** — all 37 graphics registered and bundling
- **Dev gallery** at `/_dev` — every primitive on one screen

### Decisions taken, as approved

- **Glassmorphism** — tiered. Real `BlurView` only on the header and tab bar; everything else
  uses perceptually-matched opaque surfaces. `GlassSurface` warns in dev past 2 real blurs.
- **Icons** — bundled Material Symbols over Lucide, since Stitch is the source of truth.
- **Engine** — no rules in this repo. `src/game/engine/` and `src/game/rules/` were deleted;
  `src/game/` is presentation only.

### Known issues carried into Phase 2

| Issue | Note |
|---|---|
| Not run on a device | Needs a phone, emulator, or an EAS dev-client build. **The only unmet Phase 1 exit criterion.** |
| Launcher icons are placeholders | The opaque 1024px logo stands in; a maskable/transparent set is still outstanding (R6) |
| `react-hooks/immutability` disabled | False positive on every Reanimated `sharedValue.value =` write; justified in `eslint.config.js` |
| `import/namespace` off for `app/_layout.jsx` | `expo-splash-screen` re-exports extensionlessly; only a bundler resolves it |
| `D:\jest-control` left behind | A throwaway diagnostic folder I could not delete (removal of top-level dirs is blocked). Safe to delete. |

---

## 15. Phase 2 result

**Status: complete.** All 12 Stitch screens plus Settings are implemented, on real
navigation, with data flowing through TanStack Query.

### Verified

| Check | Result |
|---|---|
| `npx expo-doctor` | ✅ **20/20 pass** |
| `npx eslint .` | ✅ **0 errors, 0 warnings** |
| `npx jest` | ✅ **53/53 pass**, 4 suites |
| `npx expo export --platform android` | ✅ **2,258 modules → 5.0 MB** |
| Launch on a physical Android device | ⚠️ **still not verified** |

### Screens

| Stitch | Route | Notes |
|---|---|---|
| 1 Splash | `app/index` | Built in Phase 1; now routes via onboarding → auth → tabs |
| 2 Onboarding | `(onboarding)/index` | 3-step carousel; **steps 2–3 have no Stitch design** (§5.1) |
| 3 Login & Signup | `(auth)/sign-in` | Tabbed modes, Apple/Google/Discord marks as real SVG, phone + OTP, guest entry |
| 4 Avatar Studio | `(tabs)/profile/avatar` | Drag-to-rotate stage, hue presets, category filter, equip |
| 5 Home | `(tabs)/index` | Marquee ticker, hero countdown, arena grid, crew rail, bounties |
| 6 Lobby | `(tabs)/play/index` | Room code + clipboard copy, stakes tiers, all 4 seat states, voice dock |
| 7 Gameplay | `match/[id]` | Turn ring, voice strip, **real Skia board**, taunts, dice |
| 8 Profile | `(tabs)/profile/index` | Identity card, SVG radial win-rate, analytics bento, badges, loadout |
| 9 Leaderboard | `(tabs)/leaderboard` | 2-1-3 podium, cutoff divider, sticky YOU bar |
| 10 Store | `(tabs)/play/store` | Battle pass, filters, product cards, vault, confirm modal |
| 11 Friends | `(tabs)/friends` | Search, invites, voice party, filter tabs, chat drawer |
| 12 Match Results | `match/[id]/results` | Animated confetti, podium, rewards, standings, reactions |
| — Settings | `(tabs)/profile/settings` | **No Stitch design** — composed from existing tokens (§5.1) |

### R1 addressed — the board is engineered, not traced

The Stitch gameplay screen has no usable board. `src/game/board/geometry.js` derives
the real thing: a 15×15 grid, a 52-cell ring, four 5-cell home columns, 8 safe cells and
four 6×6 houses. `LudoBoard.jsx` renders it with Skia in the Stitch visual language.

**This is geometry, not rules.** No move legality, no capture, no turn order — those stay
in `@ludo/engine` (ludo-server) and arrive in Phase 4. The gameplay screen is a shell: the
dice animates and lands on a number, but tokens do not move and nobody wins. A dev-only
banner says so on the screen itself so it is never mistaken for a working game.

`tests/game/geometry.test.js` (21 assertions) found two real bugs on first run:

1. **`homeEntryIndex` was off by one on all four players** — tokens would have turned into
   their home column a square early, every game.
2. The ring has four non-orthogonal steps. Investigation showed these are **correct** —
   at each the in-between cell belongs to the central goal block, exactly as a physical
   board behaves. The test now pins those four turns so they cannot be "fixed" into a bug.

### The icon guard earned its place

`tests/icons.test.js` walks the source for every icon name and fails if one is not in the
bundled subset. It caught `auto_awesome` and `description` — both would have thrown at
runtime, since `<Icon>` refuses to render an unknown glyph. The subset is now 117 glyphs,
265 KB (down from 10.5 MB).

### Scope held back deliberately

Phase 2 is UI. These are visible and responsive but intentionally not wired, because
faking them would make unbuilt features look finished:

- **Avatar AI Face Scan** — capture, consent, crop and generation are Phase 3
- **Token movement** — rules are Phase 4
- **Dice authority** — the client rolls for show; the **server** must roll from Phase 5
- **Voice** — LiveKit is Phase 6
- **Purchases** — no currency is spent; receipts are validated server-side in Phase 7

---

## 16. Phase 3 result — the avatar system

**Status: complete** across both repos. This is the product's core promise, so the
flow is real end to end: consent → capture → crop → upload → generate → preview →
equip, with working deletion.

### Verified

| Check | Result |
|---|---|
| `npx jest` (mobile) | ✅ **61/61**, 5 suites |
| `npx jest` (server) | ✅ **23/23** |
| `npx eslint .` | ✅ **0 errors, 0 warnings** |
| `npx expo-doctor` | ✅ **20/20** |
| `npx expo export --platform android` | ✅ **2,272 modules → 5.07 MB** |
| Live end-to-end against the server | ✅ upload → job → avatar → source photo deleted |

### Consent is a gate, not a checkbox

`usePhotoCapture` refuses to open the camera or library without consent — it is a
thrown error, not a disabled button, so there is no path to the picker that skips
the explanation. The consent step states plainly that the photo is **deleted after
generation**, and that is a real server-side guarantee
(`AvatarsService.runJob`), not reassuring copy.

Consent is keyed by **policy version** in both repos. Changing the policy re-asks
rather than silently relying on agreement to different terms, and the server
rejects a job carrying a stale version.

### No provider credentials in the app

The client has no provider URL, key or model name, and does not know a provider
exists. It uploads a photo to our server and polls a job. A test asserts the base
URL is not a provider and that no `Bearer sk-` style header is ever attached —
because anything in a shipped bundle is extractable.

### On-device work before anything leaves the phone

Photos are cropped square, downscaled to 1024px and re-encoded at quality 0.85
before upload, and **EXIF is stripped** (`exif: false`) — phone photos carry GPS
coordinates, and there is no reason for those to reach a server.

### Two real bugs found while checking it on screen

1. **Blank app on launch.** `RootLayout` returned `null` until fonts resolved, and
   handled `fontError` but not a *hang*. A font that neither resolves nor rejects
   left a permanent black screen with no way out. Now falls through to the system
   font after 5s with a warning. This would have hit Android too.
2. **Ambient glows rendered as hard-edged discs.** `AmbientGlow` was a flat `View`
   with a border radius — a solid circle is not a blur, however low its opacity.
   Replaced with an SVG radial gradient (real falloff, one cheap draw, no blur
   pass). A follow-up lint error also caught a module-level counter being mutated
   during render; replaced with `useId`.

### Deferred, and why

- **Hairstyle / clothing / accessories as separate editors** — the Studio grid
  handles equip, but per-category editing is only worth building once real
  cosmetic artwork exists. None does (§5.1).
- **Character animations** — needs the token art that is still outstanding (R6).
- **Multiple results per generation** — the contract returns an array and the UI
  reads `results[0]`; widening to a chooser is small once a real provider returns
  variants.

---

## 13. Outstanding questions for you

**Gate Phase 1 (I need these to start):**

1. **Glassmorphism** — approve the tiered approach in §7.1?
2. **Icons** — bundle Material Symbols (design-accurate), or force Lucide (brief-accurate)?
3. **Node** — may I install Node 22 LTS via nvm-windows, or is Node 26 fixed on this machine?
4. **Engine home** (§7.4) — approve `@ludo/engine` living in the `ludo-server` repo, or would you
   rather have a third `ludo-engine` repo?

**Can be answered as we reach them:**

5. **Android** — EAS-only for now, or install JDK 17 + Android Studio up front?
6. **Backend language** — the brief says prefer JSX over TypeScript, but that was stated under
   *Mobile*. NestJS is TypeScript-first and server-authoritative validation benefits from types.
   Recommend **TS for `ludo-server`, JSX for `ludo-mobile`, and plain JS + JSDoc for the shared
   engine** so both can consume it. Confirm?
7. **Git remotes** — where should the two repos be hosted, and under what names?
8. **Missing art** (§5) — commission, AI-generate, or build Phase 2 with explicit visible
   placeholders that are tracked and swapped later?
9. **Transparent cutouts** (R6) — which route for player tokens?
10. **Wagering** (R9) — is in-game currency purely virtual, or is real money in scope?
11. **Settings + onboarding 2–3** — generate matching Stitch screens for the gaps, or design them
    in-code against the existing token system?

---

## Phase 5 — online play (mobile side)

### What landed

| Piece | File |
|---|---|
| Session / guest auth | `src/services/session.js` |
| Shared server origin | `src/services/apiBase.js` (`API_BASE`, `REALTIME_URL`) |
| Colyseus client | `src/services/realtime.js` |
| Online match hook | `src/features/gameplay/useOnlineMatch.js` |
| Online mode in the match screen | `src/features/gameplay/MatchScreen.jsx` |
| Lobby start button → live quick match | `src/features/multiplayer/LobbyScreen.jsx` |

`/match/<id>` with no params is still the offline CPU game. `?mode=quick`,
`?mode=create` or `?mode=join&code=ABCD` plays online.

### Decisions

- **`useOnlineMatch` returns the same shape as `useMatchEngine`.** The server's
  view is projected into the engine's state shape, so the Skia board, the dice
  and the HUD render online play unchanged. Two renderers that had to agree
  about board geometry would drift, and the bug would look like a board bug.
  `project()` is exported and tested for exactly this reason.
- **No dice prediction.** `roll()` sends the word "roll"; the value arrives in
  the next patch. A predicted roll the server contradicts means the number
  changes under the player's thumb.
- **Auth replaced the `x-user-id` header.** That header is refused in
  production, which is why the deployed avatar routes answered 401. The avatar
  client now sends a bearer token and retries once on a 401.
- **The device id is treated as a secret.** Guest sign-in is "whoever presents
  this id is this account", so it is generated with `expo-crypto` and kept in
  secure storage. A `Math.random()` id would be guessable, and guessing it
  would be account takeover.

### Known gaps

- **The Stitch lobby screen still shows sample seats.** Its Start button opens
  a live match, and the real waiting room (room code, who is in, ready) is an
  overlay on the match screen. Binding the lobby itself to live room state
  needs the Colyseus room to be shared between the two screens — a room
  context — and is not done.
- **The lobby's Start button is now the only match entry point, and it goes
  online.** Offline vs CPU is still reachable at `/match/<id>` but has no UI
  entry. Adding one means a control the Stitch design does not have.
- **Opponent avatar art is missing (R6).** Online opponents fall back to
  initials rather than borrowing a sample player's face.
- **Nothing has run on a physical device.** Verified against the compiled
  server from Node; the Expo client has not been exercised on hardware.

### Metro cannot bundle `ws` — shimmed, not polyfilled

`@colyseus/sdk`'s transport opens with a static `import NodeWebSocket from 'ws'`
and then picks `globalThis.WebSocket || NodeWebSocket`. React Native always has
a global WebSocket, so the `ws` branch is dead code — but the import is static,
so Metro still resolves it, and `ws` requires Node's `stream`, `zlib`, `net`,
`tls` and `crypto`. The Android bundle failed outright with
"attempted to import the Node standard library module".

`metro.config.js` aliases `ws` to `src/shims/ws.js`, which re-exports the
platform's own WebSocket. Polyfilling the five Node modules instead would ship
a stream implementation and zlib into the bundle to satisfy a branch that never
runs.

Two things to know if this ever resurfaces:

- The transport branches on `typeof document !== "undefined"`. React Native has
  no `document`, so it takes the Node branch and calls
  `new WebSocket(url, { headers, protocols })`. React Native's constructor
  coerces a non-array `protocols` to `null` and ignores it, so this is harmless
  — and the socket needs no headers, because the seat reservation travels in
  the URL and `onAuth` already ran during HTTP matchmaking.
- Verified by `npx expo export --platform android`, which is the only thing
  that proves it: lint and Jest both resolve `ws` to the real Node package and
  pass either way.

### `expo-crypto` removed — the server mints the device id

Phase 5's first cut generated the guest device id with `Crypto.randomUUID()`
from `expo-crypto`. That is a native module, so it threw
`Cannot find native module 'ExpoCrypto'` in Expo Go and in any dev client built
before it was added — and because `session.js` is imported by `avatarApi.js`,
the throw took down every screen that touches either: the avatar screens, the
settings screen and the match screen all logged "missing the required default
export", which was the crash, not a routing fault.

`POST /v1/auth/guest` now mints the id server-side with `node:crypto` and
returns it; this app stores it and sends it back thereafter. Better on both
counts: an id generated on the server cannot be weaker than the client's
randomness (the previous server comment correctly noted a client-supplied id is
not a secret), and the app needs no native module for it.

Every native module the app now uses predates Phase 5, so an existing dev
client runs it without a rebuild. The only Phase 5 dependency is
`@colyseus/sdk`, which is pure JavaScript once `ws` is shimmed.

`tests/session.test.js` pins the parts whose failure is permanent: a first run
sends no device id, the returned id is written to the keychain **before** the
token (token-first would, if the app were killed between the two writes, mint a
second account and orphan the first with its avatars), concurrent callers share
one sign-in, and a 401 clears the token while keeping the id.

### Invite UI

| Where | What |
|---|---|
| `src/features/multiplayer/JoinMatchScreen.jsx` | New. Four-box code entry over one hidden input — four separate inputs would mean managing focus between them and would break paste. Accepts only the server's code alphabet, so a typo is caught before a round trip. |
| `app/(tabs)/play/join.jsx` | Route for it, inside the existing play stack. |
| Lobby "Invite" button | Replaces "Copy", which copied the sample-data code displayed above it — a code matching no real room, so anyone sent it could never join. Now opens a real private room. |
| Lobby "Join with code" | Added. Without a way to type a code, a private room is unreachable. |
| Waiting room | Shows the live code with Copy and Share (OS share sheet via React Native's own `Share`, so no new native module), plus "Start with CPUs" for the host. |

Validation is deliberately only the *shape* of the code. Whether the room still
exists is the server's answer, surfaced by the match screen's error state — two
places deciding what a valid code is would eventually disagree.

The lobby's seat cards and the code shown on its card are still sample data;
only the buttons are live. Binding that screen to a real room still needs the
Colyseus room shared between the lobby and the match screen.

### Play Store prerequisites (app side)

| Added / fixed | Detail |
|---|---|
| `eas.json` | Did not exist, so no `.aab` could be built. Three profiles; `EXPO_PUBLIC_API_URL` is set **per profile** because it is inlined at build time — a build cannot be repointed afterwards. |
| Submit track | `alpha`, which is Play's **closed** testing track. Internal testing does not count toward the 12-testers-for-14-days requirement a new personal developer account must satisfy, so submitting to `internal` would run a test that starts no clock. `releaseStatus: "draft"` so an upload never reaches testers as a side effect of a build. |
| Privacy policy link | Was `https://example.com/privacy` — a placeholder that would have failed review on its own. Now `${API_BASE}/privacy`, derived so it cannot point at a stale host. |
| Delete account | New row in Settings → Account. Calls `DELETE /v1/auth/me`, withdraws consent, then `forgetDevice()` — keeping the device id would hand the player a brand-new empty account on the next launch without explaining why. Local state is cleared only after the server confirms. |
| Adaptive icon | Was a byte-for-byte copy of the square icon. See below. |

### The adaptive icon was the square icon

Android masks an adaptive foreground to a circle or squircle and guarantees
only the centre 66dp of 108dp. The old foreground was `icon.png` verbatim, so
the "LUDO AFTER DARK" wordmark across its bottom third was **cut off entirely**
and the dice was clipped at the edges.

`scripts/make-adaptive-icon.mjs` (`npm run icon:adaptive`) now crops to the
dice alone and centres it at 440x417 — a 606px diagonal inside the 626px safe
circle — on a canvas filled with #191c21, the artwork's own background sampled
from the source corners. `app.json` now declares that same colour; it said
#0A0B10, which did not match, so any crop edge would have shown as a square.

The crop bounds are measured, not eyeballed: scanning for non-background pixels
puts the dice at (280,206)-(743,645), and row extents show the wordmark
starting at y=650 where the row jumps to x=846.

`sharp` is a devDependency for this. It is not imported by any app code and
never reaches the bundle.

The square `icon.png` is untouched — it is not masked, so the wordmark is fine
there.

### First EAS build failed: Gradle daemon killed during R8

```
> Task :app:minifyReleaseWithR8
The message received from the daemon indicates that the daemon has disappeared.
Gradle build daemon disappeared unexpectedly (it may have been killed or may have crashed)
```

No exception and no stack trace — the daemon log ends on ordinary Kotlin
deprecation warnings. A JVM that dies mid-task leaving no error did not throw;
it was killed, and on a build worker that means the OOM killer.

The peak is visible in the task order: `minifyReleaseWithR8` was running while
CMake built native libraries for **four** ABIs (arm64-v8a, armeabi-v7a, x86,
x86_64) across worklets, screens and Skia. R8 is the most memory-hungry task in
an Android release build, and it was competing with four parallel native
compiles.

Two changes in `eas.json`, on both `preview` and `production`:

- **`resourceClass: "large"`** — more memory for the worker. Note this consumes
  build credits faster.
- **`-PreactNativeArchitectures=arm64-v8a,armeabi-v7a`** — halves the native
  build. `-P` is used rather than an `ORG_GRADLE_PROJECT_` environment variable
  because command-line project properties have unambiguous precedence over
  `gradle.properties`, which is where the RN template sets all four.

Dropping x86/x86_64 costs nothing for a phone test: those ABIs serve emulators
and some x86 Chromebooks. Add them back before a production launch if
Chromebook reach matters.

**R8 was deliberately left on.** Disabling it would remove the proximate cause
and make the build faster, but the closed-test build would then be the only one
not minified — and a crash caused by a missing ProGuard rule would first appear
in production, found by real users instead of testers.

The `gradleCommand` task must match the profile's `buildType`:
`:app:assembleRelease` for `apk`, `:app:bundleRelease` for `app-bundle`.
Mismatch them and the build produces the wrong artifact, or nothing.

If it dies at R8 again, the next lever is `expo-build-properties` with
`android.enableProguardInReleaseBuilds: false` — accepting the trade-off above.
