/**
 * theme.js — the single source of truth for design tokens.
 *
 * Every colour, size, radius, font and shadow in the app resolves through here
 * or through its Tailwind mirror in tailwind.config.js. Nothing is hardcoded in
 * a component.
 *
 * Ported from the Google Stitch design system "Midnight Arcade Cyber-Ludo"
 * (project 16378329217088749782). See docs/SCREEN_MAP.md for how the tokens map
 * onto each screen.
 */
import colorTokens, { faction, factionOrder, surface, role, alpha, withAlpha } from './colors';
import typographyTokens, { fontFamily, textStyles, tabularNums } from './typography';
import { spacing, radii, hitSlop } from './spacing';
import effects, { blur, glass, glassSolid, glow, factionGlow, elevation, ambient } from './effects';

export const theme = {
  colors: colorTokens,
  faction,
  factionOrder,
  surface,
  role,
  alpha,
  typography: typographyTokens,
  fontFamily,
  textStyles,
  tabularNums,
  spacing,
  radii,
  hitSlop,
  effects,
  blur,
  glass,
  glassSolid,
  glow,
  factionGlow,
  elevation,
  ambient,
  withAlpha,
};

/**
 * Navigation theme for Expo Router / React Navigation, so the native container
 * background matches the void canvas and there is no white flash on push.
 */
export const navigationTheme = {
  dark: true,
  colors: {
    primary: faction.p1,
    background: surface.void,
    card: surface.containerLowest,
    text: role.onSurface,
    border: role.outlineVariant,
    notification: faction.p3,
  },
  fonts: {
    regular: { fontFamily: fontFamily.jakartaRegular, fontWeight: '400' },
    medium: { fontFamily: fontFamily.jakartaMedium, fontWeight: '500' },
    bold: { fontFamily: fontFamily.jakartaBold, fontWeight: '700' },
    heavy: { fontFamily: fontFamily.jakartaExtraBold, fontWeight: '800' },
  },
};

export {
  colorTokens as colors,
  faction,
  factionOrder,
  surface,
  role,
  alpha,
  withAlpha,
  typographyTokens as typography,
  fontFamily,
  textStyles,
  tabularNums,
  spacing,
  radii,
  hitSlop,
  effects,
  blur,
  glass,
  glassSolid,
  glow,
  factionGlow,
  elevation,
  ambient,
};

export default theme;
