# Phase 1 Plan — Application Foundation

**Repo:** `ludo-mobile` only. `ludo-server` is untouched until Phase 3.
**Status:** not started — awaiting approval of Phase 0.
**Goal:** a correctly architected Expo app that boots on Android, with the Stitch design system
ported verbatim and every reusable primitive built. **No screen content** — that is Phase 2.

> **No game rules in this phase, and none in this repo ever.** Rules come from `@ludo/engine` in the
> sibling repo from Phase 4 onward (PROJECT_STATUS §7.4). Phase 1 builds no `src/game/` code at all.

**Exit criteria**

1. App launches on a physical Android device via Expo Go / dev client.
2. Tab navigation works across all five tabs; auth and match stacks route correctly.
3. Syne + Plus Jakarta Sans render at all required weights.
4. Every design token from "Midnight Arcade Cyber-Ludo" is reachable from `theme.js` *and* as a
   Tailwind class.
5. All 12 primitives render in a dev-only gallery route.
6. `npx expo-doctor` is clean; ESLint passes; the Jest harness runs.

---

## Prerequisites (before any code)

| # | Task | Why | State |
|---|---|---|---|
| P1 | Install **Node 22 LTS** via nvm-windows; add `.nvmrc` | Node 26 is outside Expo's supported range (risk R4) | ⏳ needs your OK |
| P2 | `git init`, `.gitignore`, first commit | Everything after this must be reviewable | ✅ **done in Phase 0** |
| P3 | Confirm the §7.1 / §7.2 decisions (glass, icons) | They change `theme.js` and the icon component | ⏳ needs your answer |
| P4 | Create the git remote for this repo and push `main` | Work is currently local-only (risk R14) | ⏳ needs a host + name |
| P5 | Confirm the §7.4 engine decision | Determines whether a third repo is created | ⏳ needs your answer |

---

## Step 1 — Scaffold

```
npx create-expo-app@latest . --template blank
```

Then add, at versions the SDK pins:

- Router: `expo-router`, `react-native-screens`, `react-native-safe-area-context`
- Styling: `nativewind`, `tailwindcss`, `react-native-reanimated`, `react-native-gesture-handler`
- Render: `@shopify/react-native-skia`, `expo-linear-gradient`, `expo-blur`, `expo-image`
- State: `zustand`, `@tanstack/react-query`, `react-hook-form`
- Storage: `@react-native-async-storage/async-storage`, `expo-secure-store`
- Device: `expo-font`, `expo-splash-screen`, `expo-haptics`, `expo-status-bar`
- Icons: `@expo/vector-icons`, `lucide-react-native`, `react-native-svg`
- Dev: `jest`, `jest-expo`, `@testing-library/react-native`, `eslint`, `eslint-config-expo`, `prettier`

**Files:** `package.json`, `app.json`, `babel.config.js`, `metro.config.js`, `tailwind.config.js`,
`global.css`, `.gitignore`, `.nvmrc`, `.eslintrc.js`, `.prettierrc`, `jest.config.js`

> `app.json` needs `userInterfaceStyle: "dark"`, `backgroundColor: "#0A0B10"`, portrait lock,
> `newArchEnabled: true`, and an `android.package`.

---

## Step 2 — Design tokens

### `src/theme/theme.js`
Single source of truth, ported from the Stitch design system:

- `colors.surface` — 7 tiers, `#0A0B10` void → `#34343a`
- `colors.faction` — `p1 #00FF87` lime, `p2 #00F0FF` cyan, `p3 #FF007A` pink, `p4 #8B5CF6` violet
  *(the written design system, not the generated screens — see PROJECT_STATUS §3.2)*
- `colors.semantic` — primary/secondary/tertiary/error + their `on-` and `-container` roles
- `typography` — 10 named styles (`display-hero`, `headline-lg/md/sm`, `body-lg/md/sm`, `label-lg/md/sm`)
- `spacing` — `xs .25` `sm .5` `md .875` `lg 1.25` `xl 1.75` rem, `gutter .75`, `margin 1`
- `radii` — `sm .25` `DEFAULT .5` `md .75` `lg 1` `xl 1.5` rem, `full`
- `glow` — named shadow presets per faction (`0 0 24px rgba(0,255,135,.35)` etc.)
- `surfaces` — glass recipes, **including the opaque equivalents** from the §7.1 tiered decision

### `src/theme/tokens.css` + `tailwind.config.js`
Mirror the Stitch Tailwind config exactly so class names from the Stitch HTML carry straight over —
`bg-surface-container-high`, `text-primary-container`, `font-label-sm`, `px-margin`, `gap-space-xs`.
This makes Phase 2 largely a transliteration rather than a reinterpretation.

### `src/theme/fonts.js`
Bundle Syne 600/700/800 and Plus Jakarta Sans 400/500/700/800 as static TTFs under
`src/assets/fonts/`. Load with `expo-font`, held behind `expo-splash-screen`. Enable
`fontVariant: ['tabular-nums']` on numeric styles — the design system calls for it on dice counters
and timers.

---

## Step 3 — Navigation

```
app/
  _layout.jsx              root: providers, fonts, splash gate, dark theme
  index.jsx                splash → redirect
  (onboarding)/_layout.jsx
  (auth)/_layout.jsx       sign-in
  (tabs)/_layout.jsx       custom AppTabBar + AppHeader
    index.jsx              Home
    friends.jsx
    play/_layout.jsx       lobby, store
    leaderboard.jsx
    profile/_layout.jsx    index, avatar, settings
  match/_layout.jsx        [id], [id]/results
  +not-found.jsx
```

The five tabs and the raised centre FAB come directly from the `mobile_tab` shell in the Stitch
output. `AppHeader` and `AppTabBar` are custom, not the stock Expo Router tab bar.

---

## Step 4 — Primitives

In `src/components/`, each with a dev-gallery entry:

| Component | Path |
|---|---|
| `GlassSurface` | `common/GlassSurface.jsx` |
| `AmbientGlow` | `common/AmbientGlow.jsx` |
| `NeonButton` | `buttons/NeonButton.jsx` |
| `IconButton` | `buttons/IconButton.jsx` |
| `Icon` | `icons/Icon.jsx` |
| `StatPill` / `CurrencyChip` | `common/` |
| `Avatar` | `common/Avatar.jsx` |
| `SectionHeader` | `common/SectionHeader.jsx` |
| `ProgressBar` | `common/ProgressBar.jsx` |
| `SegmentedTabs` | `common/SegmentedTabs.jsx` |
| `WaveformBars` | `animations/WaveformBars.jsx` |
| `CountdownTimer` | `common/CountdownTimer.jsx` |
| `Screen` / `LoadingState` / `EmptyState` / `ErrorBoundary` | `common/` |

`Avatar` carries the **R6 workaround**: because no source art has an alpha channel, it renders a
circular Skia mask with a faction-coloured neon ring. Over the dark surfaces this reads as a
deliberate design element rather than a crop, and it is what lets opaque busts work as tokens.

---

## Step 5 — State and data

```
src/store/        useAuthStore · useUserStore · useSettingsStore · useUIStore
src/services/     queryClient · api (fetch wrapper) · storage (SecureStore wrapper)
src/hooks/        useTheme · useResponsive · useHaptics · useAppState
```

Zustand slices use `persist` over AsyncStorage for preferences only. **Auth tokens go in
`expo-secure-store`, never AsyncStorage** — a Phase 8 requirement that is far cheaper to get right
now than to retrofit.

TanStack Query provider is wired with sensible retry/stale defaults even though there is no server
until Phase 5, so Phase 2's sample data can flow through the real data layer rather than being
hardcoded into components.

---

## Step 6 — Assets and utilities

- Copy the 37 WebP files from `design-reference/assets/` into `src/assets/images/`
- `src/assets/images/index.js` — a typed registry so no screen ever holds a raw `require()`
- Generate app icon, adaptive icon, and splash from `brand-logo` **(flagged: needs a transparent/maskable source — see R6)**
- `src/utils/` — `responsive.js` (390 pt base scale), `format.js` (compact numbers: `48.2K`), `cn.js`

---

## Step 7 — Verify

1. `npx expo-doctor`
2. `npx eslint .`
3. `npx jest` — harness only; real tests arrive in Phase 4
4. Launch on a physical Android device; walk every tab
5. Check the primitive gallery at 360 / 390 / 430 pt widths
6. Update `PROJECT_STATUS.md` and `README.md`; list files created

---

## Explicitly out of scope for Phase 1

Screen content · game engine · board rendering · avatar/AI · backend · multiplayer · audio · store
logic · real data. Phase 1 ends with an app that boots, navigates, and looks right — and nothing
more.
