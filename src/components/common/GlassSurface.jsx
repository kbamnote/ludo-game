/**
 * GlassSurface — the design system's smoked-glass plane.
 *
 * Implements the two-tier ruling from PROJECT_STATUS.md §7.1:
 *
 *   <GlassSurface>                 simulated (default) — opaque perceptual
 *                                  match + rim + top highlight. Free.
 *   <GlassSurface blurred>         real BlurView. Budgeted: at most 2 per
 *                                  screen, for chrome that overlaps scrolling
 *                                  content (header, tab bar).
 *
 * In development, exceeding the blur budget logs a warning naming the offender,
 * because the cost of 20 BlurViews on a mid-range Android device does not show
 * up until you are profiling on real hardware — by which point it is expensive
 * to unpick.
 */
import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { alpha } from '../../theme/colors';
import { radii } from '../../theme/spacing';
import {
  blur as blurTokens,
  glassSolid,
  elevation as elevationTokens,
  BLUR_BUDGET_PER_SCREEN,
} from '../../theme/effects';

/** Module-level counter, reset by Screen on mount. */
let activeBlurCount = 0;
export function resetBlurBudget() {
  activeBlurCount = 0;
}

export function GlassSurface({
  children,
  blurred = false,
  /** Which backdrop this sits on — picks the matching perceptual solid. */
  over = 'surface',
  radius = radii.xl,
  elevation = 'md',
  /** Top inset highlight — the design system's "razor light catch". */
  highlight = true,
  style,
  debugLabel,
  ...rest
}) {
  const countedRef = useRef(false);

  useEffect(() => {
    if (!__DEV__ || !blurred) return undefined;
    activeBlurCount += 1;
    countedRef.current = true;
    if (activeBlurCount > BLUR_BUDGET_PER_SCREEN) {
      console.warn(
        `[GlassSurface] ${activeBlurCount} real BlurViews mounted (budget ${BLUR_BUDGET_PER_SCREEN}).` +
          `${debugLabel ? ` Latest: "${debugLabel}".` : ''}\n` +
          `Real blur is for chrome that overlaps scrolling content only. ` +
          `Use the default simulated surface instead — see theme/effects.js.`
      );
    }
    return () => {
      if (countedRef.current) {
        activeBlurCount -= 1;
        countedRef.current = false;
      }
    };
  }, [blurred, debugLabel]);

  const shell = [
    { borderRadius: radius, borderWidth: 1, borderColor: alpha.rim, overflow: 'hidden' },
    elevationTokens[elevation],
    style,
  ];

  const topHighlight = highlight ? (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { borderTopWidth: 1, borderTopColor: alpha.rimHighlight, borderRadius: radius },
      ]}
    />
  ) : null;

  if (blurred) {
    return (
      <View style={shell} {...rest}>
        <BlurView
          intensity={blurTokens.intensity}
          tint={blurTokens.tint}
          style={StyleSheet.absoluteFill}
        />
        {topHighlight}
        {children}
      </View>
    );
  }

  const solid =
    {
      void: glassSolid.overVoid,
      surface: glassSolid.overSurface,
      container: glassSolid.overContainer,
      containerHigh: glassSolid.overContainerHigh,
    }[over] ?? glassSolid.overSurface;

  return (
    <View style={[shell, { backgroundColor: solid }]} {...rest}>
      {topHighlight}
      {children}
    </View>
  );
}

export default GlassSurface;
