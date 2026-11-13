# Asset Inventory — Ludo After Dark

Audit date: 2026-11-13 · Source: Google Stitch project `16378329217088749782`

All assets are stored locally and are no longer dependent on Google's CDN:

- `design-reference/assets/<name>.webp` — 1024 px WebP, app-ready
- `design-reference/assets/raw/<name>.png` — 1024 px PNG, archival master
- `design-reference/assets/manifest.tsv` — name → category → screens → source id
- `design-reference/assets/fetch-assets.sh` — idempotent re-fetch

**Totals:** 37 unique graphics · 37 WebP + 37 PNG · ~41 MB on disk.

---

## 1. Verified technical characteristics

These were measured, not assumed.

| Property | Finding |
|---|---|
| Max native resolution | **1024 px** on the long edge. `=s2048` silently returns 1024. |
| Default format | JPEG |
| Format variants | `=w1024-rp` → PNG · `=w1024-rw` → WebP · `=w1024` → JPEG |
| **Alpha channel** | **None.** PNGs are `8-bit/color RGB`, not RGBA. Every asset is opaque. |
| Aspect ratios | Square 1024×1024 (logo, avatars, store items) or 1024×559 ≈ 16:9 (scene art) |
| WebP saving | ~85–90 % smaller than PNG (e.g. 1 442 KB → 140 KB) |

**Implication:** WebP is the correct shipping format. PNG is kept only as the master for any future
background-removal or re-processing pass.

---

## 2. Brand

| Name | Size | Used on | Notes |
|---|---|---|---|
| `brand-logo` | 1024² | All 10 chrome-bearing screens | Isometric neon dice + "LUDO AFTER DARK" wordmark. **Opaque near-black plate**, not transparent. Wordmark uses yellow-green + purple, which drifts from the token palette's `#00FF87` lime. |

---

## 3. Scene / environment art (3)

| Name | Size | Screen | Subject |
|---|---|---|---|
| `onboarding-hero-pawn` | 1024² | Onboarding | Cyber-streetwear avatar in a neon arcade |
| `auth-banner-club` | 1024×559 | Login & Signup | Tokyo nocturnal club, holographic dice |
| `home-hero-alley` | 1024×559 | Home | Cyberpunk alleyway, floating dice (used at `opacity-40` + `mix-blend-screen`) |

> `home-hero-alley` is composited with `mix-blend-screen` in the design. React Native 0.76+ supports
> `experimental_mixBlendMode`, and Skia supports blend modes natively — this is the same technique
> that solves the opaque-background problem for neon-on-black art generally.

---

## 4. Character avatars (29)

All 1024², all opaque, all 3D/illustrated character busts.

**Player identity**

| Name | Role |
|---|---|
| `avatar-me-k4i` | The signed-in user. Appears on 8 screens — header, avatar studio hero, lobby host slot, victory podium, leaderboard "YOU" bar. The single most-reused asset. |

**Gameplay — the four factions**

| Name | Faction | Screen |
|---|---|---|
| `game-p1-k4i` | Lime | Gameplay |
| `game-p2-nova` | Cyan | Gameplay |
| `game-p3-ghost` | Pink/violet | Gameplay |
| `game-p4-akira` | Salmon/magenta | Gameplay |

**Lobby** — `lobby-nova-viper`, `lobby-ghost-roller`

**Home** — `avatar-tourney-1`, `avatar-tourney-2`, `avatar-tourney-3` (tournament pips);
`avatar-nox99`, `avatar-m1rak`, `avatar-ghostd` (online-crew rail)

**Friends** — `avatar-k41ro`, `avatar-aoi99`, `avatar-v3xnight`, `avatar-cyberchloe`,
`avatar-sh4dowr0ll`, `avatar-chat-icon`

**Leaderboard** — `lb-rank1-v01drun` … `lb-rank10-hexblaster` (10 assets, ranks 1–10)

---

## 5. Store product art (4)

| Name | Item | Price in design | Aspect |
|---|---|---|---|
| `store-neon-phantom-wings` | Neon Phantom Wings (Legendary outfit) | 850 gems | 1024² |
| `store-obsidian-liquid-dice` | Obsidian Liquid Dice (dice skin) | 400 gems | 1024² |
| `store-shibuya-board` | Shibuya Underground (board theme) | 1 200 gems | 1024×559 |
| `store-bass-emote` | Drop The Bass (victory emote) | 250 gems | 1024² |

> These are **marketing images only**. None of them is a usable in-game asset — there is no dice
> sprite, no board tileset, and no emote animation behind any of them.

---

## 6. Missing assets

### 6.1 Art that must exist before Phase 2 ships

| Asset | Count | Stitch placeholder in use |
|---|---|---|
| Transparent character cutouts | 29 | — (all art opaque) |
| App icon + adaptive icon + splash | 3 | — |
| Avatar-studio cosmetic thumbnails | 4+ | `dry_cleaning`, `smart_toy`, `content_cut`, `blur_on` |
| Achievement / badge art | 24 implied | `casino`, `track_changes`, `magic_button`, `local_fire_department` |
| Emote / sticker set | ~10 | Literal emoji: 🔥 💀 😭 🤝 ⚔️ 🎲 💥 ⚡ 🤡 |
| Onboarding phase 2 + 3 art | 2 | Only phase 1 designed |
| Settings screen | 1 | Screen not designed at all |

### 6.2 Art that must exist before Phase 4 ships

| Asset | Notes |
|---|---|
| Ludo board artwork / tileset | No board asset exists; no board *layout* exists either |
| Dice faces 1–6 + skins | Drawn as CSS dots in the design |
| Token / pawn chassis | Drawn as the `person_pin_circle` glyph |
| Board theme variants | Only the Shibuya marketing image exists |
| Victory / defeat animation | No Lottie, Rive, or sprite sheets |

### 6.3 Non-art

| Asset | Status |
|---|---|
| **Audio** | Zero files. Design references dice SFX, bass stings, lo-fi rain ambience, a 4-button soundboard, and voice chat. |
| **Fonts** | Syne + Plus Jakarta Sans — free under OFL on Google Fonts. Bundle via `expo-font`. **Not a real gap.** |
| **Icon font** | Material Symbols Outlined, ~70 glyphs. Free under Apache 2.0. See PROJECT_STATUS §7.2. |

---

## 7. Material Symbols glyphs used

Collected from all 12 screens. Needed for whichever icon strategy is chosen.

`add` · `add_circle` · `apparel` · `account_balance_wallet` · `arrow_back_ios_new` ·
`arrow_forward` · `arrow_forward_ios` · `arrow_downward` · `arrow_upward` · `blur_on` · `bolt` ·
`casino` · `chat_bubble` · `check` · `check_circle` · `checkroom` · `close` · `content_copy` ·
`content_cut` · `crisis_alert` · `crown` · `diamond` · `done_all` · `dry_cleaning` · `edit` ·
`emoji_events` · `expand_more` · `face` · `flash_on` · `forum` · `graphic_eq` · `grid_view` ·
`groups` · `group_add` · `headphones` · `headset_mic` · `home` · `hotel_class` · `hourglass_top` ·
`key` · `local_fire_department` · `lock` · `lock_open` · `magic_button` · `mail` · `mic` ·
`mic_off` · `military_tech` · `monetization_on` · `mood` · `palette` · `person` · `person_add` ·
`person_pin_circle` · `photo_camera` · `play_arrow` · `progress_activity` · `query_stats` ·
`radio_button_unchecked` · `replay` · `restart_alt` · `rocket_launch` · `schedule` · `search` ·
`send` · `sensors` · `settings` · `settings_input_composite` · `shield` · `shopping_cart_checkout` ·
`skull` · `smart_display` · `smart_toy` · `sports_martial_arts` · `stadia_controller` · `star` ·
`stars` · `style` · `styler` · `swords` · `sync` · `terminal` · `theater_comedy` · `timer` ·
`toll` · `token` · `track_changes` · `trending_up` · `tune` · `verified` · `verified_user` ·
`view_in_ar` · `visibility` · `volume_up` · `water_drop` · `workspace_premium`

**94 distinct glyphs.** Several (`skull`, `crown`, `swords`, `apparel`, `magic_button`,
`stadia_controller`, `hotel_class`) exist in Material **Symbols** but not in the older Material
**Icons** set shipped with `@expo/vector-icons` — which is why bundling the Symbols font directly is
the recommended route.
