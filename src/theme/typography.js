/**
 * Typography tokens — from the Stitch design system "Midnight Arcade Cyber-Ludo".
 *
 * Syne             display + headlines (architectural, avant-garde, tight tracking)
 * Plus Jakarta Sans body + labels      (optically balanced in low light)
 *
 * Case rule from the design system: `label-sm` and `label-md` always render
 * UPPERCASE with boosted letter spacing. The `uppercase` flag below encodes
 * that so callers cannot forget it.
 *
 * Numbers in stats, dice counters and timers use tabular figures to stop
 * horizontal jitter during live countdowns.
 */

/** PostScript names as registered by @expo-google-fonts. */
export const fontFamily = {
  syneSemiBold: 'Syne_600SemiBold',
  syneBold: 'Syne_700Bold',
  syneExtraBold: 'Syne_800ExtraBold',
  jakartaRegular: 'PlusJakartaSans_400Regular',
  jakartaMedium: 'PlusJakartaSans_500Medium',
  jakartaBold: 'PlusJakartaSans_700Bold',
  jakartaExtraBold: 'PlusJakartaSans_800ExtraBold',
  icons: 'MaterialSymbolsOutlined',
};

/**
 * React Native takes letterSpacing in px, not em. The design system specifies
 * em, so each style below carries the px equivalent at its own font size.
 */
const em = (value, fontSize) => value * fontSize;

export const textStyles = {
  'display-hero': {
    fontFamily: fontFamily.syneExtraBold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: em(-0.03, 40),
  },
  'headline-lg': {
    fontFamily: fontFamily.syneBold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: em(-0.02, 30),
  },
  'headline-md': {
    fontFamily: fontFamily.syneBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: em(-0.01, 22),
  },
  'headline-sm': {
    fontFamily: fontFamily.syneSemiBold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
  'body-lg': {
    fontFamily: fontFamily.jakartaMedium,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  'body-md': {
    fontFamily: fontFamily.jakartaRegular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  'body-sm': {
    fontFamily: fontFamily.jakartaRegular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  'label-lg': {
    fontFamily: fontFamily.jakartaBold,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: em(0.04, 14),
  },
  'label-md': {
    fontFamily: fontFamily.jakartaBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: em(0.08, 11),
    uppercase: true,
  },
  'label-sm': {
    fontFamily: fontFamily.jakartaExtraBold,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: em(0.1, 10),
    uppercase: true,
  },
};

/** Spread onto numeric Text to stop digits shifting width as they change. */
export const tabularNums = { fontVariant: ['tabular-nums'] };

export const typography = { fontFamily, textStyles, tabularNums };

export default typography;
