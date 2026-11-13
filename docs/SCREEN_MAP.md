# Screen Map — Stitch → React Native

Maps each Google Stitch screen to its Expo Router route, the components it needs, and the assets it
consumes. This is the Phase 2 work breakdown.

Stitch HTML is re-pulled per screen at implementation time (one `download_file` call against the
screen's file id) rather than cached here, so the reference is always current.

---

## Shared chrome

Three shell types appear in the Stitch output, and they map cleanly onto Expo Router layouts.

| Stitch `shell-type` | Screens | Route group |
|---|---|---|
| `mobile_blank` | Splash, Onboarding, Login & Signup | `app/(auth)/_layout.jsx` — no chrome |
| `mobile_tab` | Home, Avatar, Lobby, Store, Friends, Leaderboard, Profile | `app/(tabs)/_layout.jsx` — header + bottom nav |
| `mobile_stack` | Gameplay, Match Results | `app/match/_layout.jsx` — back header, no bottom nav |

### `AppHeader` (fixed, 64 pt, on every `mobile_tab` screen)

`brand-logo` (32 pt) · screen title (Syne, `headline-sm`) · `LVL 24` sublabel ·
coin chip (`monetization_on` + `48.2K`) · gem chip (`diamond` + `1,250`) ·
user avatar 32 pt with online dot.
Surface: `surface-container-lowest/80` + blur + `0 1px 8px rgba(0,0,0,.4)`.

### `AppTabBar` (fixed, floating pill, 64 pt)

Five items, `max-w-md`, centred, `surface-container-lowest/85` + blur, fully rounded,
`0 8px 32px rgba(0,0,0,.6)`:

| Slot | Icon | Label | Route |
|---|---|---|---|
| 1 | `home` | Home | `(tabs)/index` |
| 2 | `forum` + badge `3` | Friends | `(tabs)/friends` |
| 3 | `casino` — **raised FAB**, lime fill, `-mt-5`, 52 pt | — | `(tabs)/play` |
| 4 | `emoji_events` | Rank | `(tabs)/leaderboard` |
| 5 | `person` | Profile | `(tabs)/profile` |

Active state: `text-primary-container` + `drop-shadow(0 0 12px rgba(0,255,135,.7))`.

---

## 1. Splash — `app/index.jsx`

Pulsing concentric rings · `brand-logo` with lime drop-shadow · 18 animated particles ·
corner reticles (◤01 ◥02 ◣03 ◢04) · "Tokyo S-04 • Live Lounge" pill · 128 BPM waveform ·
Current Vault counter (240,000 LAD) · gradient progress bar (cyan→lime) with a "CONNECTING TO
SERVERS… 78 %" ticker → "SYSTEMS SYNCHRONIZED" · "ENTER THE NIGHT" CTA.

**Components:** `ParticleField`, `PulseRings`, `NeonProgressBar`, `NeonButton`, `WaveformBars`
**Assets:** `brand-logo`
**Notes:** particles and progress use Reanimated, not `setInterval`. Real work here is font +
asset preloading behind `expo-splash-screen`.

## 2. Onboarding — `app/(onboarding)/[step].jsx`

3-segment progress · "PHASE 01 / 03" · hero bento with `onboarding-hero-pawn` · floating HUD
pills (AURA, DRIP) · Discord-style voice bubble ("KENJI_VOX — HOST") · dice launcher widget ·
3 feature pills · live ticker (2,418,920 matches).

**Components:** `StepProgress`, `BentoCard`, `VoiceBubble`, `FeaturePill`, `LiveTicker`
**Assets:** `onboarding-hero-pawn`
**⚠ Gap:** only step 1 of 3 designed.

## 3. Login & Signup — `app/(auth)/sign-in.jsx`

`auth-banner-club` banner with scrim + faction badges · segmented tabs ENTER SYNDICATE / NEW
RUNNER · Apple / Google / Discord buttons (inline brand SVGs, already in the HTML) · country
code + phone input · OTP drawer (6 boxes, resend timer) · guest mode card · legal footer.

**Components:** `SegmentedTabs`, `SocialAuthButton`, `PhoneInput`, `OtpInput`, `GuestCard`
**Assets:** `auth-banner-club`
**Notes:** React Hook Form. Brand SVGs port directly via `react-native-svg`.

## 4. Avatar Customization Studio — `app/(tabs)/profile/avatar.jsx`

"CYBER ATELIER · SLOT 01/04" pill · **AI Face Scan** button · hologram pedestal stage with
`avatar-me-k4i`, drag-to-rotate 360° · MYTHIC BUILD rarity pill · hue slider + 5 swatches ·
category pills (Outfits / Visors / Hair / Dice Skins / Emotes) · 2-col cosmetics grid with
rarity badges and a LVL 30 lock · sticky "MINT AVATAR" ribbon.

**Components:** `AvatarStage`, `HueSlider`, `CategoryPills`, `CosmeticCard`, `StickyActionBar`
**Assets:** `avatar-me-k4i`
**⚠ Gap:** cosmetic thumbnails are Material Symbols placeholders.
**Note:** the "AI Face Scan" button is the *only* trace of the photo-upload flow. Consent, camera,
crop, generating, and preview screens do not exist and are designed in Phase 3.

## 5. Home Dashboard — `app/(tabs)/index.jsx`

Live winner marquee · hero tournament card (`home-hero-alley` at `opacity-40` +
`mix-blend-screen`, live countdown, 3 participant pips + "+418", PLAY NOW) · 2×2 arena grid
(Quick 1v1 / Classic 4P / Squad Knockout / Custom Room) · online-crew horizontal rail ·
daily bounties with progress + CLAIM.

**Components:** `Marquee`, `HeroEventCard`, `CountdownTimer`, `ArenaCard`, `FriendRailCard`,
`BountyCard`, `ProgressBar`, `AvatarStack`
**Assets:** `home-hero-alley`, `avatar-tourney-1/2/3`, `avatar-nox99`, `avatar-m1rak`,
`avatar-ghostd`, `avatar-me-k4i`, `brand-logo`

## 6. Multiplayer Match Lobby — `app/(tabs)/play/lobby.jsx`

Room code `#7709` + COPY · stakes box with CASUAL / HOT POT / VIP tiers · 2×2 player slots
(host-ready, voice-active with waveform, invited-waiting with ping, empty with +BOT/SHARE) ·
voice dock (mute / deafen / emote) · soundboard row · "START MATCH (3/4)".

**Components:** `RoomCodeBar`, `StakesSelector`, `PlayerSlotCard`, `VoiceDock`, `SoundboardRow`
**Assets:** `avatar-me-k4i`, `lobby-nova-viper`, `lobby-ghost-roller`

## 7. 3D Gameplay Board — `app/match/[id].jsx`

Turn ring + 8 s countdown · MATCH POT pill · 4-player voice strip with live waveforms ·
**board arena (1:1)** · chat ribbon · taunt bar (🔥 💀 GG 😭 EZ) · 2X BET + ROLL DICE deck with
a 6-pip cube.

**Components:** `TurnTimerRing`, `PotPill`, `VoiceStrip`, **`LudoBoard` (Skia)**, `ChatRibbon`,
`EmoteBar`, `DiceLauncher`
**Assets:** `game-p1-k4i`, `game-p2-nova`, `game-p3-ghost`, `game-p4-akira`, `brand-logo`

> **⚠ This is the critical screen.** What Stitch produced is a *mood board*: four corner houses, a
> central "NEXUS" hub, and ~12 loose path tiles placed for looks. There is **no 15×15 grid, no
> 52-cell track, no home columns, no safe-cell positions**. A real board must be derived
> mathematically in `src/game/board/` and rendered with Skia, using this screen only for the glow
> language, house treatment, HUD, and control layout. See PROJECT_STATUS §7.3.

## 8. Profile & Achievements — `app/(tabs)/profile/index.jsx`

Identity card (avatar, clan `[CYBERFLOW]`, VIP TIER III, tagline) · rank / ELO / crew ribbon ·
4 segment tabs · 2×2 analytics bento (win-rate SVG radial 68.4 %, 412 matches, 1,842 knockouts,
34 flawless) · badges rail · equipped loadout grid · challenge CTA.

**Components:** `IdentityCard`, `RadialStat`, `StatCard`, `BadgeChip`, `LoadoutItem`
**Assets:** `avatar-me-k4i`, `brand-logo`
**⚠ Gap:** badge art is Material Symbols placeholders.

## 9. Global Leaderboard — `app/(tabs)/leaderboard.jsx`

GLOBAL / FRIENDS / WEEKLY CUP tabs · NEON DIAMOND league banner with promotion-cutoff bar ·
**3-tier podium** (rank 1 raised, crown, gradient rings) · ranks 4–10 list with a promotion-cutoff
divider · sticky "YOU #14" bar.

**Components:** `SegmentedTabs`, `LeagueBanner`, `Podium`, `RankRow`, `StickyUserRank`
**Assets:** `lb-rank1-v01drun` … `lb-rank10-hexblaster`, `avatar-me-k4i`, `brand-logo`
**Note:** uses the `crown` glyph, which is Material Symbols-only.

## 10. Store & Battle Pass — `app/(tabs)/play/store.jsx`

Season banner (CYBERPUNK PASS VOL.04, tier 28/50, 3450/5000 XP, free + VIP claim tracks) ·
flash-deal countdown · category pills · 4 product cards · currency vault (2,500 gems $19.99 /
150,000 coins $9.99) · purchase-confirmation modal.

**Components:** `BattlePassBanner`, `TierTrack`, `FilterPills`, `ProductCard`, `CurrencyPackCard`,
`ConfirmModal`
**Assets:** all 4 `store-*`, `avatar-me-k4i`, `brand-logo`
**⚠ Tallest screen (4086 px).** Needs a virtualised list.

## 11. Friends & Social Hub — `app/(tabs)/friends.jsx`

Search + ADD · party-invite alert ("2 Pending") · active voice party card with per-member
waveforms · Online / All / Requests / Clan tabs · friend cards with contextual actions
(Spectate / Invite / Quick Join / Chat) · `#squad-radio` DM drawer with emote row and composer.

**Components:** `SearchBar`, `InviteAlert`, `VoicePartyCard`, `SegmentedTabs`, `FriendCard`,
`ChatDrawer`, `EmoteRow`, `MessageComposer`
**Assets:** `avatar-k41ro`, `avatar-aoi99`, `avatar-v3xnight`, `avatar-cyberchloe`,
`avatar-sh4dowr0ll`, `avatar-chat-icon`, `avatar-me-k4i`, `brand-logo`

## 12. Match Results & Victory — `app/match/[id]/results.jsx`

Inline SVG confetti · "VICTORY" in `display-hero` · winner podium with gradient ring, CHAMPION
crown, MATCH MVP tag · rewards grid (+3,800 coins / +150 RP / +450 pass XP) · final standings ×4 ·
post-game reaction chips · PLAY AGAIN / SHARE CLIP / RETURN.

**Components:** `ConfettiBurst`, `VictoryTitle`, `WinnerPodium`, `RewardTile`, `StandingRow`,
`ReactionChip`
**Assets:** `avatar-me-k4i`, `brand-logo`
**Note:** the confetti is inline SVG in the design — reimplement with Skia or Reanimated.

---

## 13. Screens with no Stitch design

| Screen | Plan |
|---|---|
| **Settings** | Required by the brief. Design in-code from the token system, or generate a matching Stitch screen first. Needs: account, avatar privacy + deletion (Phase 3 requirement), audio, haptics, animation toggle, notifications, blocked players, legal, sign out. |
| **Onboarding 2 & 3** | Carousel advertises 3 phases; 1 exists. |
| **Avatar capture flow** | Consent → camera/library → crop → generating → style picker → preview. Phase 3. |

---

## 14. Reusable primitive inventory

Extracted by frequency across all 12 screens — this is the Phase 1 component library.

| Primitive | Occurrences | Description |
|---|---|---|
| `GlassSurface` | ~60 | Translucent card/pill + rim border + inset highlight |
| `StatPill` | ~45 | Rounded label chip, often with icon + uppercase micro-label |
| `NeonButton` | ~25 | Lime fill, black text, pill, directional glow; cyan + ghost variants |
| `Avatar` | ~40 | Circular image, optional status dot, optional glow ring |
| `SectionHeader` | ~15 | Syne title + right-hand action link |
| `ProgressBar` | ~10 | Track + gradient fill + glow |
| `SegmentedTabs` | 5 | Pill container with sliding active state |
| `CurrencyChip` | ~10 | Coin / gem counter |
| `WaveformBars` | ~12 | Animated audio bars |
| `CountdownTimer` | 4 | Tabular-figure countdown |
| `AmbientGlow` | ~30 | Blurred coloured radial blob |
| `IconGlyph` | ~250 | Material Symbols wrapper |

Twelve primitives cover the overwhelming majority of every screen. Building them properly in
Phase 1 is what makes Phase 2 fast and visually consistent.
