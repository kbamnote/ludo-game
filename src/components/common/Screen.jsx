/**
 * Screen — the root container every route renders inside.
 *
 * Handles the void background, safe-area insets, the ambient glow layer that
 * sits behind most Stitch screens, and resets the per-screen real-blur budget
 * so GlassSurface can warn accurately.
 *
 *   <Screen scroll glows={[{ color: faction.p1, top: -40, left: -60 }]}>
 */
import { useEffect } from 'react';
import { View, ScrollView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AmbientGlow } from './AmbientGlow';
import { resetBlurBudget } from './GlassSurface';
import { surface } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

/** Bottom tab bar height + its margin, so content is never hidden behind it. */
export const TAB_BAR_CLEARANCE = 64 + 16 + 8;

export function Screen({
  children,
  /** Wraps content in a ScrollView. */
  scroll = false,
  /** Ambient blobs: [{ color, size?, opacity?, top?, left?, right?, bottom? }] */
  glows = [],
  /** Apply the standard 16pt side gutter. */
  padded = true,
  /** Leave room for the floating tab bar. */
  tabBarClearance = false,
  edges = { top: true, bottom: false },
  background = surface.void,
  contentContainerStyle,
  style,
  ...rest
}) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    resetBlurBudget();
  }, []);

  const padding = {
    paddingTop: edges.top ? insets.top : 0,
    paddingBottom: (edges.bottom ? insets.bottom : 0) + (tabBarClearance ? TAB_BAR_CLEARANCE : 0),
    paddingHorizontal: padded ? spacing.margin : 0,
  };

  const body = scroll ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[padding, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      {...rest}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, padding, contentContainerStyle]} {...rest}>
      {children}
    </View>
  );

  return (
    <View style={[{ flex: 1, backgroundColor: background }, style]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {glows.length > 0 ? (
        <View pointerEvents="none" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {glows.map((g, i) => (
            <AmbientGlow key={i} {...g} />
          ))}
        </View>
      ) : null}
      {body}
    </View>
  );
}

export default Screen;
