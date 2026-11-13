/**
 * useResponsive — scaling against the design's 390pt base canvas.
 *
 * The Stitch screens were authored at 780px @2x = 390pt. Android devices we
 * target range from ~360pt (budget) to ~430pt (large). Rather than scale
 * everything linearly — which makes text comically large on big phones — only
 * layout dimensions scale, and they are clamped.
 *
 * Font sizes deliberately do NOT scale: the type ramp is a design decision and
 * should look the same everywhere.
 */
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export const BASE_WIDTH = 390;

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const rawScale = width / BASE_WIDTH;
    // Clamp so a 360pt budget phone does not get cramped and a tablet-width
    // window does not get a comically stretched layout.
    const scale = Math.min(1.15, Math.max(0.9, rawScale));

    return {
      width,
      height,
      scale,
      /** Scale a layout dimension. Not for font sizes. */
      s: (n) => Math.round(n * scale),
      isSmall: width < 375,
      isLarge: width >= 414,
      /** The board is a 1:1 square inset by the screen gutter. */
      boardSize: Math.min(width - 32, 380),
    };
  }, [width, height]);
}

export default useResponsive;
