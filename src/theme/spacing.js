/**
 * Spacing and radius tokens — from the Stitch design system.
 * Everything sits on a compact 4px / 8px base so the board gets maximum room.
 */

const REM = 16;
const rem = (n) => n * REM;

export const spacing = {
  xs: rem(0.25), //  4
  sm: rem(0.5), //  8
  md: rem(0.875), // 14
  lg: rem(1.25), // 20
  xl: rem(1.75), // 28
  gutter: rem(0.75), // 12  — gap between grid items
  margin: rem(1), // 16  — screen side gutter
};

/**
 * Radii.
 *
 * Source note: the design system's prose `rounded` scale and the Tailwind
 * config embedded in the generated screens DISAGREE (prose says DEFAULT =
 * 0.5rem; the screens say 0.25rem, with lg = 0.5 and xl = 0.75).
 *
 * We follow the SCREENS, because that config is what actually produced the
 * pixels we are matching. `xxl` and `xxxl` are Tailwind's untouched defaults,
 * which the screens also rely on (rounded-2xl, rounded-3xl).
 */
export const radii = {
  sm: rem(0.125), //  2
  base: rem(0.25), //  4  — Tailwind `rounded`
  lg: rem(0.5), //  8  — Tailwind `rounded-lg`
  xl: rem(0.75), // 12  — Tailwind `rounded-xl`   (cards, most surfaces)
  xxl: rem(1), // 16  — Tailwind `rounded-2xl`  (emote bar, houses)
  xxxl: rem(1.5), // 24  — Tailwind `rounded-3xl`  (board arena)
  full: 9999, //      pills: buttons, chips, nav
};

/** Minimum touch target. The Stitch nav uses 48pt; never go below it. */
export const hitSlop = { minTouchSize: 48 };

export default { spacing, radii, hitSlop };
