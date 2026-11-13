/**
 * Elevation, glass and neon glow — the design system's visual signature.
 *
 * ── The glassmorphism ruling (PROJECT_STATUS.md §7.1) ────────────────────────
 * The design system specifies `backdrop-filter: blur(20px) saturate(180%)` on
 * nearly every floating surface. React Native has no equivalent; `expo-blur`'s
 * BlurView is the closest and each instance costs a real-time GPU readback.
 * Twenty of them on a scrolling screen will not hold 60 FPS on mid-range
 * Android.
 *
 * So surfaces come in two tiers:
 *
 *   TIER 1 — `blurred`    Real BlurView. At most TWO per screen, reserved for
 *                         chrome that genuinely overlaps scrolling content:
 *                         the fixed header and the floating tab bar.
 *
 *   TIER 2 — `simulated`  An opaque fill at the blurred colour's perceptual
 *                         equivalent, plus the same 1px rim and inset top
 *                         highlight. Over a near-black background at these
 *                         opacities this is visually near-identical and
 *                         essentially free.
 *
 * Use `GlassSurface` rather than reaching for these directly; it enforces the
 * tiering and warns in development if a screen exceeds its blur budget.
 */
import { Platform } from 'react-native';
import { alpha, faction, surface, withAlpha } from './colors';

/** Real-blur budget per screen. GlassSurface warns past this in __DEV__. */
export const BLUR_BUDGET_PER_SCREEN = 2;

export const blur = {
  intensity: 20,
  saturate: 1.8,
  tint: 'dark',
};

/**
 * Perceptual solids for rgba(26,29,46,0.72) composited over each surface tier.
 * These were derived by compositing the glass fill over the backdrop rather
 * than eyeballed, so the simulated tier matches the blurred tier closely.
 */
export const glassSolid = {
  overVoid: '#15171f',
  overSurface: '#191b24',
  overContainer: '#1f2129',
  overContainerHigh: '#262832',
};

export const glass = {
  /** Tier 2 — the default. */
  simulated: (fill = glassSolid.overSurface) => ({
    backgroundColor: fill,
    borderWidth: 1,
    borderColor: alpha.rim,
  }),
  /** Tier 1 — pass to BlurView; it supplies the backdrop itself. */
  blurred: {
    backgroundColor: alpha.glass,
    borderWidth: 1,
    borderColor: alpha.rim,
  },
};

/**
 * Neon halos.
 *
 * Android only renders a single-layer shadow and ignores shadowOffset on
 * elevation, so multi-layer web shadows are collapsed to their dominant glow.
 * Values below are the design system's, adapted per platform rather than
 * copied blindly.
 */
function halo(color, opacity, radius) {
  return Platform.select({
    ios: {
      shadowColor: color,
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: 0 },
    },
    android: {
      // Android shadows are elevation-driven and cannot be coloured below
      // API 28. Components that need a true coloured halo on Android draw it
      // with a Skia blur or a layered translucent ring instead.
      elevation: Math.round(radius / 2),
      shadowColor: color,
    },
    default: {
      shadowColor: color,
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: 0 },
    },
  });
}

export const glow = {
  /** Active turn, dice ready, primary CTA. */
  primary: halo(faction.p1, 0.35, 24),
  primaryStrong: halo(faction.p1, 0.5, 30),
  /** Voice active, timer rings, secondary CTA. */
  secondary: halo(faction.p2, 0.35, 20),
  /** Capture / strike / critical hazard. */
  danger: halo(faction.p3, 0.4, 20),
  /** XP multipliers, rare rewards. */
  tertiary: halo(faction.p4, 0.35, 20),
  none: {},
};

/** Per-faction halo, for player-coloured chrome. */
export const factionGlow = {
  p1: glow.primary,
  p2: glow.secondary,
  p3: glow.danger,
  p4: glow.tertiary,
};

/** Neutral drop shadows for depth without colour. */
export const elevation = {
  none: {},
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.4,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
    },
    android: { elevation: 2 },
    default: {},
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.5,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 6 },
    default: {},
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.6,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 12 },
    default: {},
  }),
  xl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.8,
      shadowRadius: 40,
      shadowOffset: { width: 0, height: 16 },
    },
    android: { elevation: 20 },
    default: {},
  }),
};

/**
 * Ambient background blobs — the blurred coloured radials behind most screens.
 * Rendered as a soft translucent circle rather than a real blur: at this scale
 * and opacity the difference is imperceptible and the cost is zero.
 */
export const ambient = {
  lime: withAlpha(faction.p1, 0.15),
  cyan: withAlpha(faction.p2, 0.15),
  pink: withAlpha(faction.p3, 0.15),
  violet: withAlpha(faction.p4, 0.15),
};

export const surfaceFor = {
  void: surface.void,
  base: surface.base,
  container: surface.container,
  containerHigh: surface.containerHigh,
};

export default {
  blur,
  glass,
  glassSolid,
  glow,
  factionGlow,
  elevation,
  ambient,
  BLUR_BUDGET_PER_SCREEN,
};
