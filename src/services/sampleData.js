/**
 * Sample data for Phase 2.
 *
 * Values are taken from the Google Stitch screens themselves — the same gamer
 * tags, counts, prices and copy — so the implemented screens can be compared
 * against the designs directly.
 *
 * It is deliberately shaped like a server response and served through the
 * async functions below rather than imported into components, so Phase 3/5 can
 * swap these for real fetchers without touching a single screen.
 */
import { images } from '../assets/images';

/** Simulates network latency so loading states are actually exercised. */
const LATENCY_MS = 400;

function respond(data, ms = LATENCY_MS) {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

/* ── Player ───────────────────────────────────────────────────────────── */

export const currentPlayer = {
  id: 'me',
  handle: 'K4I',
  displayName: 'K41_STORM',
  tagline: 'Rolling high or knocking you back to spawn.',
  level: 24,
  coins: 48200,
  gems: 1250,
  rankPoints: 12480,
  globalRank: 14,
  elo: 2480,
  clan: 'CYBERFLOW',
  vipTier: 'VIP TIER III',
  faction: 'p1',
  avatar: images.avatarMeK4i,
  stats: {
    winRate: 0.684,
    totalMatches: 412,
    victories: 281,
    knockouts: 1842,
    knockoutsPerMatch: 4.4,
    flawless: 34,
    flawlessRank: 9,
    weekDelta: 0.042,
  },
};

/* ── Home ─────────────────────────────────────────────────────────────── */

export const tickerItems = [
  {
    id: 't1',
    player: 'K1LL_V3X',
    text: 'knocked out 4 pawns in',
    arena: 'Tokyo Drift 4P',
    reward: '+2.4k',
  },
  {
    id: 't2',
    player: 'CYBER_MOM',
    text: 'hit a streak on',
    arena: 'Squad Showdown',
    reward: '+12.5k',
  },
  {
    id: 't3',
    player: 'NEXA_99',
    text: 'swept the board in',
    arena: 'Midnight Rivalry',
    reward: '+8.1k',
  },
];

export const featuredEvent = {
  id: 'midnight-rivalry-s4',
  kicker: 'Limited time event',
  tag: 'Exclusive tournament',
  title: 'MIDNIGHT RIVALRY',
  season: 'S4',
  prizePool: 50000,
  endsInSeconds: 3 * 3600 + 41 * 60 + 58,
  background: images.homeHeroAlley,
  participants: [
    { key: 'p1', source: images.avatarTourney1 },
    { key: 'p2', source: images.avatarTourney2 },
    { key: 'p3', source: images.avatarTourney3 },
  ],
  extraParticipants: 418,
};

export const arenas = [
  {
    id: 'quick-1v1',
    title: 'Quick 1v1',
    subtitle: 'Fast blitz, 3 min timer',
    icon: 'flash_on',
    badge: '2.4k LIVE',
    entry: 500,
    accent: 'p1',
  },
  {
    id: 'classic-4p',
    title: 'Classic 4P',
    subtitle: 'Full board midnight rules',
    icon: 'groups',
    badge: 'POPULAR',
    entry: 1000,
    accent: 'p2',
  },
  {
    id: 'squad-knockout',
    title: 'Squad Knockout',
    subtitle: '2v2 team strike relay',
    icon: 'sports_martial_arts',
    badge: 'HIGH ROLLER',
    entry: 2500,
    accent: 'p3',
  },
  {
    id: 'custom-room',
    title: 'Custom Room',
    subtitle: 'Wager rules & voice lobby',
    icon: 'settings_input_composite',
    badge: 'PRIVATE',
    entry: 0,
    entryLabel: 'Free Host',
    entryIcon: 'key',
    accent: 'p4',
  },
];

export const onlineCrew = [
  {
    id: 'nox99',
    name: 'NOX_99',
    status: 'In Voice',
    state: 'inVoice',
    action: 'INVITE',
    avatar: images.avatarNox99,
    faction: 'p1',
  },
  {
    id: 'm1rak',
    name: 'M1RA_K',
    status: 'In Menu',
    state: 'online',
    action: 'PARTY +',
    avatar: images.avatarM1rak,
    faction: 'p2',
  },
  {
    id: 'ghostd',
    name: 'GHOST_D',
    status: 'Playing 1v1',
    state: 'playing',
    action: 'WATCH',
    avatar: images.avatarGhostd,
    faction: 'p3',
  },
];

export const dailyBounties = [
  {
    id: 'b1',
    title: 'Capture 3 enemy tokens',
    subtitle: 'Ranked or Custom matches',
    icon: 'crisis_alert',
    accent: 'p3',
    progress: 1,
    current: 3,
    target: 3,
    reward: { kind: 'coins', amount: 1200 },
    claimable: true,
  },
  {
    id: 'b2',
    title: 'Roll three 6s in a row',
    subtitle: 'Test your nocturnal luck',
    icon: 'casino',
    accent: 'p2',
    progress: 2 / 3,
    current: 2,
    target: 3,
    reward: { kind: 'gems', amount: 50 },
    claimable: false,
  },
];

/* ── Friends ──────────────────────────────────────────────────────────── */

export const voiceParty = {
  id: 'tokyo-midnight',
  name: 'Tokyo Midnight Squad',
  room: 'Neon Alley Room',
  capacity: 4,
  members: [
    { id: 'k41ro', name: 'K41RO', speaking: true, avatar: images.avatarK41ro, faction: 'p1' },
    { id: 'aoi99', name: 'Aoi_99', speaking: false, avatar: images.avatarAoi99, faction: 'p2' },
  ],
};

export const friends = [
  {
    id: 'v3xnight',
    name: 'V3X_NIGHT',
    badge: 'PRO',
    status: 'In Match (Classic 4P - Round 3)',
    state: 'online',
    avatar: images.avatarV3xnight,
    faction: 'p1',
    actions: ['spectate', 'invite'],
  },
  {
    id: 'cyberchloe',
    name: 'CYBER_CHLOE',
    badge: 'LVL 41',
    status: 'In Lobby - Looking for 1',
    state: 'playing',
    statusIcon: 'hourglass_top',
    avatar: images.avatarCyberchloe,
    faction: 'p2',
    actions: ['quickjoin'],
  },
  {
    id: 'sh4dow',
    name: 'SH4DOW_R0LL',
    status: 'Idle - 5m ago',
    state: 'idle',
    avatar: images.avatarSh4dowr0ll,
    faction: 'p4',
    actions: ['chat'],
  },
];

export const partyInvites = [
  { id: 'i1', from: 'CyberSamurai' },
  { id: 'i2', from: 'NeonRider' },
];

export const squadChat = [
  {
    id: 'm1',
    author: 'K41RO',
    time: '23:41',
    text: "Roll a 6 or we get wiped by Chloe's red pawn lmao",
    avatar: images.avatarChatIcon,
  },
];

export const quickEmotes = [
  { id: 'e1', glyph: '💀', label: 'NO MERCY' },
  { id: 'e2', glyph: '🎲', label: 'LUCKY ROLL' },
  { id: 'e3', glyph: '⚡', label: 'AFTER DARK' },
  { id: 'e4', glyph: '🤡', label: 'CHOKED' },
];

/* ── Leaderboard ──────────────────────────────────────────────────────── */

export const league = {
  name: 'NEON DIAMOND',
  tier: 'TIER I',
  endsInSeconds: 1 * 86400 + 14 * 3600,
  promotionText: 'TOP 5 MOVE TO MASTER',
  cutoff: 14200,
  safeBy: 1720,
  progress: 0.78,
  cutoffMarker: 0.6,
};

export const leaderboard = [
  {
    rank: 1,
    name: 'V01D_RUN',
    rp: 18450,
    avatar: images.lbRank1V01drun,
    faction: 'p1',
    streak: 9,
    winRate: 0.72,
  },
  {
    rank: 2,
    name: 'K4IRO',
    rp: 16820,
    avatar: images.lbRank2K4iro,
    faction: 'p2',
    streak: 6,
    winRate: 0.7,
  },
  {
    rank: 3,
    name: 'NEXA_99',
    rp: 15910,
    avatar: images.lbRank3Nexa99,
    faction: 'p3',
    streak: 5,
    winRate: 0.69,
  },
  {
    rank: 4,
    name: 'SHDW_L0RD',
    rp: 15240,
    avatar: images.lbRank4Shdwl0rd,
    faction: 'p4',
    streak: 7,
    winRate: 0.68,
    badge: 'PRO',
    verified: true,
  },
  {
    rank: 5,
    name: 'GLITCH_QUEEN',
    rp: 14890,
    avatar: images.lbRank5Glitchqueen,
    faction: 'p2',
    streak: 4,
    winRate: 0.61,
  },
  {
    rank: 6,
    name: 'TOKYO_DRIFT',
    rp: 14110,
    avatar: images.lbRank6Tokyodrift,
    faction: 'p1',
    streak: 2,
    winRate: 0.59,
  },
  {
    rank: 7,
    name: 'MIDNIGHT_FOX',
    rp: 13750,
    avatar: images.lbRank7Midnightfox,
    faction: 'p3',
    streak: 5,
    winRate: 0.57,
  },
  {
    rank: 8,
    name: 'ZERO_COOL',
    rp: 13420,
    avatar: images.lbRank8Zerocool,
    faction: 'p2',
    streak: 1,
    winRate: 0.55,
  },
  {
    rank: 9,
    name: 'RONIN_EX',
    rp: 13100,
    avatar: images.lbRank9Roninex,
    faction: 'p1',
    streak: 3,
    winRate: 0.54,
  },
  {
    rank: 10,
    name: 'HEX_BLASTER',
    rp: 12940,
    avatar: images.lbRank10Hexblaster,
    faction: 'p4',
    streak: 2,
    winRate: 0.52,
  },
];

/* ── Profile ──────────────────────────────────────────────────────────── */

export const badges = [
  {
    id: 'nocturnal-king',
    name: 'Nocturnal King',
    detail: 'Gold Dice',
    icon: 'casino',
    accent: 'p1',
    unlocked: true,
  },
  {
    id: 'bounty-hunter',
    name: 'Bounty Hunter',
    detail: '1,000+ Kills',
    icon: 'track_changes',
    accent: 'p3',
    unlocked: true,
  },
  {
    id: 'hex-roller',
    name: 'Hex Roller',
    detail: '3x Sixes x50',
    icon: 'magic_button',
    accent: 'p2',
    unlocked: true,
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    detail: '12 Win Run',
    icon: 'local_fire_department',
    accent: 'p4',
    unlocked: true,
  },
];

export const badgeProgress = { unlocked: 18, total: 24 };

export const loadout = [
  {
    id: 'hoodie',
    name: 'Cyberpunk Hoodie',
    rarity: 'Mythic • Neon Void',
    icon: 'apparel',
    accent: 'p2',
  },
  { id: 'visor', name: 'Holo Visor', rarity: 'Legendary', icon: 'visibility', accent: 'p2' },
  { id: 'dice', name: 'Acid Rain Dice', rarity: 'Glow VFX Skin', icon: 'casino', accent: 'p1' },
  { id: 'board', name: 'Matrix Board', rarity: 'Exclusive Cyber', icon: 'grid_view', accent: 'p1' },
];

/* ── Avatar studio ────────────────────────────────────────────────────── */

export const cosmeticCategories = [
  { key: 'outfits', label: 'Outfits', icon: 'checkroom' },
  { key: 'visors', label: 'Visors & Specs', icon: 'visibility' },
  { key: 'hair', label: 'Hair', icon: 'face' },
  { key: 'dice', label: 'Dice Skins', icon: 'casino' },
  { key: 'emotes', label: 'Emotes', icon: 'mood' },
];

export const cosmetics = [
  {
    id: 'cyber-hoodie',
    category: 'outfits',
    name: 'Legendary Cyber Hoodie',
    subtitle: 'Tokyo Streetwear',
    rarity: 'LEGENDARY',
    rarityAccent: 'p3',
    state: 'equipped',
    icon: 'dry_cleaning',
    accent: 'p1',
    code: 'GEN-3',
  },
  {
    id: 'neon-visor',
    category: 'visors',
    name: 'Neon Cyber Visor',
    subtitle: 'Augmented Glass',
    rarity: 'RARE',
    rarityAccent: 'p2',
    state: 'owned',
    icon: 'smart_toy',
    accent: 'p2',
    code: 'HUD-X',
  },
  {
    id: 'void-locs',
    category: 'hair',
    name: 'Void Black Locs',
    subtitle: 'Zero Fade',
    rarity: 'UNCOMMON',
    state: 'owned',
    icon: 'content_cut',
  },
  {
    id: 'glitch-dye',
    category: 'hair',
    name: 'Glitch Dye Spec',
    subtitle: 'Dynamic Shader',
    rarity: 'EXOTIC',
    rarityAccent: 'p4',
    state: 'locked',
    lockLabel: 'LVL 30 UNLOCK',
    icon: 'blur_on',
    accent: 'p4',
  },
];

/* ── Lobby ────────────────────────────────────────────────────────────── */

export const lobby = {
  roomCode: '7709',
  entryFee: 1000,
  winnerTakes: 3800,
  isPublic: true,
  tiers: [
    { key: 'casual', label: 'CASUAL', amount: 250 },
    { key: 'hot', label: 'HOT POT', amount: 1000 },
    { key: 'vip', label: 'VIP', amount: 5000 },
  ],
  seats: [
    {
      slot: 1,
      state: 'host',
      name: 'You (K4I)',
      meta: 'LVL 42 • VIP ELITE',
      factionLabel: 'LIME FACTION',
      faction: 'p1',
      avatar: images.avatarMeK4i,
      ready: true,
      mic: true,
    },
    {
      slot: 2,
      state: 'ready',
      name: 'Nova_Viper',
      meta: 'LVL 38 • PRO',
      factionLabel: 'CYAN FACTION',
      faction: 'p2',
      avatar: images.lobbyNovaViper,
      ready: true,
      speaking: true,
    },
    {
      slot: 3,
      state: 'invited',
      name: 'Ghost_Roller',
      meta: 'Waiting confirmation...',
      faction: 'p3',
      avatar: images.lobbyGhostRoller,
      ping: 32,
    },
    { slot: 4, state: 'empty' },
  ],
  soundboard: [
    { id: 's1', glyph: '💥', label: 'NO MERCY' },
    { id: 's2', glyph: '🎲', label: 'LUCKY ROLL' },
    { id: 's3', glyph: '🔥', label: 'ALL IN' },
    { id: 's4', glyph: '💀', label: 'GG' },
  ],
};

/* ── Store ────────────────────────────────────────────────────────────── */

export const battlePass = {
  name: 'CYBERPUNK PASS: VOL. 04',
  blurb: 'Unlock high-voltage sound packs, kinetic pawns & exclusive neon dice.',
  tier: 28,
  maxTier: 50,
  xp: 3450,
  xpTarget: 5000,
  endsInSeconds: 11 * 86400 + 4 * 3600,
  freeReward: { label: 'Free Track', detail: '500 Coins' },
  premiumReward: { label: 'Neon VIP', detail: 'Glitch Aura' },
};

export const storeCategories = [
  { key: 'all', label: 'Featured' },
  { key: 'outfits', label: 'Outfits' },
  { key: 'dice', label: 'Dice Skins' },
  { key: 'boards', label: 'Board Themes' },
  { key: 'emotes', label: 'Emotes & SFX' },
];

export const storeItems = [
  {
    id: 'phantom-wings',
    category: 'outfits',
    name: 'Neon Phantom Wings',
    blurb: 'Equippable pawn flight trail & strike shockwave',
    price: 850,
    image: images.storeNeonPhantomWings,
    rarity: 'Legendary',
    tagIcon: null,
    tag: 'Holographic Pass',
    footLeft: 'Reactive Kill VFX',
    footRight: 'Includes SFX',
    accent: 'p1',
    height: 192,
  },
  {
    id: 'liquid-dice',
    category: 'dice',
    name: 'Obsidian Liquid Dice',
    blurb: 'Melts into mercury on critical 6-rolls',
    price: 400,
    image: images.storeObsidianLiquidDice,
    tag: 'Kinetic Rig',
    tagIcon: 'casino',
    caption: 'Fluid Roll Animation',
    accent: 'p2',
    height: 176,
  },
  {
    id: 'shibuya-board',
    category: 'boards',
    name: 'Shibuya Underground',
    blurb: 'Full board skin with reactive ambient beats',
    price: 1200,
    image: images.storeShibuyaBoard,
    tag: 'Dynamic Weather',
    tagIcon: 'water_drop',
    rarity: 'Exclusive',
    footRight: 'Lo-Fi Rain Audio',
    accent: 'p1',
    height: 192,
  },
  {
    id: 'bass-emote',
    category: 'emotes',
    name: 'Drop The Bass Emote',
    blurb: 'Victory audio sting & table wobble effect',
    price: 250,
    image: images.storeBassEmote,
    caption: 'Bass Boost SFX',
    playable: true,
    accent: 'p2',
    height: 160,
  },
];

export const currencyPacks = [
  {
    id: 'gems',
    kind: 'gems',
    amount: '2,500 Gems',
    label: 'Nightlife Hoard',
    bonus: '+300 BONUS',
    price: '$19.99',
  },
  {
    id: 'coins',
    kind: 'coins',
    amount: '150,000 Coins',
    label: 'High Roller Stack',
    bonus: 'HOT PICK',
    price: '$9.99',
  },
];

/* ── Match ────────────────────────────────────────────────────────────── */

export const liveMatch = {
  id: '8409',
  pot: 4000,
  turnSecondsLeft: 8,
  turnTotalSeconds: 10,
  activeSeat: 0,
  players: [
    {
      seat: 0,
      name: 'K4I (YOU)',
      faction: 'p1',
      avatar: images.gameP1K4i,
      speaking: true,
      you: true,
    },
    { seat: 1, name: 'NOVA', faction: 'p2', avatar: images.gameP2Nova, speaking: false },
    { seat: 2, name: 'GHOST', faction: 'p3', avatar: images.gameP3Ghost, speaking: true },
    { seat: 3, name: 'AKIRA', faction: 'p4', avatar: images.gameP4Akira, speaking: false },
  ],
  lastMessage: { author: 'NOVA', text: 'Watch out for Purple at Zone 03 crossing!', time: 'NOW' },
  taunts: [
    { id: 'fire', glyph: '🔥' },
    { id: 'skull', glyph: '💀' },
    { id: 'gg', label: 'GG', accent: 'p1' },
    { id: 'cry', glyph: '😭' },
    { id: 'ez', label: 'EZ', accent: 'p2' },
  ],
};

export const matchResult = {
  matchId: '8409',
  mode: 'Ranked',
  outcome: 'victory',
  mvp: true,
  winner: {
    name: 'K4I',
    level: 48,
    clan: 'Tokyo Nightriders • Cyan House',
    avatar: images.avatarMeK4i,
    faction: 'p1',
  },
  multiplier: '2.5x',
  rewards: [
    { id: 'coins', icon: 'monetization_on', amount: '+3,800', label: 'Coins', accent: 'p2' },
    { id: 'rp', icon: 'military_tech', amount: '+150', label: 'Ranked RP', accent: 'p1' },
    { id: 'xp', icon: 'rocket_launch', amount: '+450', label: 'Pass XP', accent: 'p4' },
  ],
  standings: [
    {
      place: 1,
      name: 'You (K4I)',
      clan: 'High Roller Club',
      home: '4 / 4',
      kills: 6,
      you: true,
      mvp: true,
    },
    { place: 2, name: 'Nova_Viper', clan: 'Neon Syndicate', home: '3 / 4', kills: 2 },
    { place: 3, name: 'Akira_99', clan: 'Viper Squad', home: '2 / 4', kills: 1 },
    {
      place: 4,
      name: 'Ghost_Roller',
      clan: 'ELIMINATED • Lap 8',
      home: '0 / 4',
      kills: 0,
      eliminated: true,
    },
  ],
  reactions: [
    { id: 'gg', glyph: '🤝', label: 'GG WP!' },
    { id: 'mercy', glyph: '🔥', label: 'NO MERCY' },
    { id: 'lucky', glyph: '🎲', label: 'LUCKY ROLL' },
    { id: 'rematch', glyph: '⚔️', label: 'REMATCH ME' },
  ],
};

/* ── Onboarding ───────────────────────────────────────────────────────── */

export const onboardingSteps = [
  {
    key: 'identity',
    phase: 'PHASE 01 / 03',
    chip: 'STEP 1: YOUR DIGITAL IDENTITY',
    chipIcon: 'view_in_ar',
    title: 'CUSTOM 3D DRIP.',
    subtitle: 'HIGH-STAKES NOCTURNAL.',
    body: 'Step past dusty vintage tabletops. Mint your nocturnal pawn avatar, link open-mic squad voice, and gamble street clout under Tokyo neon lights.',
    image: images.onboardingHeroPawn,
    room: 'SHIBUYA UNDERGROUND #04',
    pot: '25K POT',
    hud: [
      { icon: 'check_circle', label: 'AURA: NEON LIME', accent: 'p1' },
      { icon: 'styler', label: "DRIP: 'CYBER-MECHA' HOOD", accent: 'p2' },
    ],
    features: [
      { icon: 'mic', label: 'SQUAD COMMS', detail: 'Zero latency', accent: 'p1' },
      { icon: 'checkroom', label: 'LIMITED DRIP', detail: 'Weekly drops', accent: 'p2' },
      { icon: 'toll', label: 'CLOUT BETS', detail: 'Winner sweeps', accent: 'p3' },
    ],
    cta: 'NEXT: CREATE SQUAD',
  },
  /**
   * Steps 2 and 3 have NO Stitch design — the carousel advertises "PHASE 01 / 03"
   * but only phase 1 was ever generated (see docs/ASSET_INVENTORY.md §6.1).
   * These two are composed from the existing token system and reuse step 1's
   * artwork rather than inventing new illustrations, and are flagged as such.
   */
  {
    key: 'squad',
    phase: 'PHASE 02 / 03',
    chip: 'STEP 2: BUILD YOUR SQUAD',
    chipIcon: 'groups',
    title: 'ROLL WITH YOUR CREW.',
    subtitle: 'OPEN MIC. ZERO LAG.',
    body: 'Pull your crew into a private room, drop into voice, and run the board together. Spectate a friend mid-match or steal their seat when they choke.',
    image: images.authBannerClub,
    room: 'NEON ALLEY ROOM',
    pot: '3 / 4 IN PARTY',
    awaitingDesign: true,
    hud: [
      { icon: 'headset_mic', label: 'VOICE: CONNECTED', accent: 'p1' },
      { icon: 'group_add', label: 'ROOM: PRIVATE', accent: 'p2' },
    ],
    features: [
      { icon: 'forum', label: 'SQUAD CHAT', detail: 'In-match', accent: 'p1' },
      { icon: 'visibility', label: 'SPECTATE', detail: 'Live games', accent: 'p2' },
      { icon: 'person_add', label: 'FIND CREW', detail: 'By gamer ID', accent: 'p3' },
    ],
    cta: 'NEXT: CLAIM YOUR RANK',
  },
  {
    key: 'rank',
    phase: 'PHASE 03 / 03',
    chip: 'STEP 3: CLIMB THE LADDER',
    chipIcon: 'military_tech',
    title: 'CLIMB THE NIGHT.',
    subtitle: 'PROVABLY FAIR DICE.',
    body: 'Every roll is server-side and verifiable. Bank ranked points, sweep the seasonal pass, and put your tag at the top of the global board.',
    image: images.homeHeroAlley,
    room: 'NEON DIAMOND • TIER I',
    pot: 'TOP 1%',
    awaitingDesign: true,
    hud: [
      { icon: 'verified_user', label: 'FAIR DICE: ON', accent: 'p1' },
      { icon: 'emoji_events', label: 'SEASON 4 LIVE', accent: 'p4' },
    ],
    features: [
      { icon: 'trending_up', label: 'RANKED RP', detail: 'Every match', accent: 'p1' },
      { icon: 'stars', label: 'BATTLE PASS', detail: '50 tiers', accent: 'p2' },
      { icon: 'workspace_premium', label: 'TROPHIES', detail: '24 to earn', accent: 'p4' },
    ],
    cta: 'ENTER THE SYNDICATE',
  },
];

/* ── Async accessors — the shape Phase 3/5 will replace ───────────────── */

export const api = {
  getHome: () =>
    respond({
      ticker: tickerItems,
      event: featuredEvent,
      arenas,
      crew: onlineCrew,
      bounties: dailyBounties,
    }),
  getFriends: () => respond({ party: voiceParty, friends, invites: partyInvites, chat: squadChat }),
  getLeaderboard: () => respond({ league, rows: leaderboard, me: currentPlayer }),
  getProfile: () => respond({ player: currentPlayer, badges, badgeProgress, loadout }),
  getAvatarStudio: () =>
    respond({ categories: cosmeticCategories, cosmetics, player: currentPlayer }),
  getLobby: () => respond(lobby),
  getStore: () =>
    respond({
      pass: battlePass,
      categories: storeCategories,
      items: storeItems,
      packs: currencyPacks,
    }),
  getMatch: () => respond(liveMatch, 200),
  getMatchResult: () => respond(matchResult, 200),
};

/** Query keys, kept in one place so invalidation is not guesswork later. */
export const queryKeys = {
  home: ['home'],
  friends: ['friends'],
  leaderboard: ['leaderboard'],
  profile: ['profile'],
  avatarStudio: ['avatar-studio'],
  lobby: ['lobby'],
  store: ['store'],
  match: (id) => ['match', id],
  matchResult: (id) => ['match', id, 'result'],
};

export default api;
