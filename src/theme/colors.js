/**
 * Colour tokens — ported verbatim from the Google Stitch design system
 * "Midnight Arcade Cyber-Ludo" (project 16378329217088749782).
 *
 * Do not invent colours. If a screen needs a shade that is not here, it is
 * either a mistake in the screen or a gap in the design system — raise it,
 * don't add a one-off hex.
 */

/**
 * The four player factions.
 *
 * Source note: the WRITTEN design system declares these as lime / cyan /
 * hot-pink / violet. The generated Stitch screens drifted and used the Material
 * `tertiary-fixed-dim` (#ffb1c3) and `error` (#ffb4ab) roles for players 3 and
 * 4, which reads as two near-identical pinks. We follow the written design
 * system — it is the stated brand intent and the four factions must be
 * instantly distinguishable on a small board.
 *
 * See PROJECT_STATUS.md §3.2.
 */
export const faction = {
  p1: '#00FF87', // Electric Lime   — active state, primary CTA, player 1
  p2: '#00F0FF', // Neon Cyan       — voice active, timer rings, player 2
  p3: '#FF007A', // Hot Pink        — capture/strike, danger, player 3
  p4: '#8B5CF6', // Electric Violet — XP multipliers, rewards, player 4
};

/** Ordered for indexing by seat: factionOrder[0] is player 1. */
export const factionOrder = [faction.p1, faction.p2, faction.p3, faction.p4];

/**
 * Surface tiers — deep optical voids beneath luminescent signals.
 * `void` is the true base; `surface` upward are progressively lifted planes.
 */
export const surface = {
  void: '#0A0B10',
  containerLowest: '#0d0e13',
  base: '#121318',
  containerLow: '#1a1b21',
  container: '#1e1f25',
  containerHigh: '#292a2f',
  containerHighest: '#34343a',
  bright: '#38393f',
  variant: '#34343a',
  dim: '#121318',
};

/** Material-role tokens, matching the Stitch Tailwind config 1:1. */
export const role = {
  background: '#121318',
  onBackground: '#e3e1e9',

  onSurface: '#e3e1e9',
  onSurfaceVariant: '#b9cbb9',
  inverseSurface: '#e3e1e9',
  inverseOnSurface: '#2f3036',

  outline: '#849585',
  outlineVariant: '#3b4b3d',
  surfaceTint: '#00e478',

  primary: '#f1ffef',
  onPrimary: '#003919',
  primaryContainer: '#00ff87',
  onPrimaryContainer: '#007138',
  inversePrimary: '#006d36',
  primaryFixed: '#60ff98',
  primaryFixedDim: '#00e478',
  onPrimaryFixed: '#00210c',
  onPrimaryFixedVariant: '#005227',

  secondary: '#d3fbff',
  onSecondary: '#00363a',
  secondaryContainer: '#00eefc',
  onSecondaryContainer: '#00686f',
  secondaryFixed: '#7df4ff',
  secondaryFixedDim: '#00dbe9',
  onSecondaryFixed: '#002022',
  onSecondaryFixedVariant: '#004f54',

  tertiary: '#fffafa',
  onTertiary: '#66002c',
  tertiaryContainer: '#ffd4dc',
  onTertiaryContainer: '#c2005b',
  tertiaryFixed: '#ffd9e0',
  tertiaryFixedDim: '#ffb1c3',
  onTertiaryFixed: '#3f0019',
  onTertiaryFixedVariant: '#8f0041',

  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
};

/**
 * Translucent fills.
 *
 * `glass` is the design system's literal spec. `glassOpaque` is the
 * perceptually-matched solid equivalent used where a real BlurView would be too
 * expensive — see effects.js and PROJECT_STATUS.md §7.1.
 */
export const alpha = {
  glass: 'rgba(26, 29, 46, 0.72)',
  glassLight: 'rgba(26, 29, 46, 0.65)',
  rim: 'rgba(255, 255, 255, 0.08)',
  rimHighlight: 'rgba(255, 255, 255, 0.15)',
  scrim: 'rgba(10, 11, 16, 0.80)',
  pressed: 'rgba(255, 255, 255, 0.06)',
};

/** Hex -> rgba() with the given alpha. Used for glows and tinted fills. */
export function withAlpha(hex, a) {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

export const colors = { faction, factionOrder, surface, role, alpha };

export default colors;
