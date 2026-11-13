/**
 * ProgressBar — track plus gradient fill with a neon edge glow.
 *
 * Appears as the splash connection bar, daily-bounty progress, battle-pass XP,
 * leaderboard promotion cutoff and the avatar-studio hue track.
 *
 * The fill animates on the UI thread via Reanimated, so progress keeps moving
 * smoothly even while the JS thread is busy (which, during a match, it is).
 */
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { faction, surface, withAlpha } from '../../theme/colors';
import { radii } from '../../theme/spacing';

export function ProgressBar({
  /** 0..1 */
  progress = 0,
  height = 8,
  trackColor = surface.containerLowest,
  /** Single colour, or an array for a gradient fill. */
  color = faction.p1,
  gradient,
  glow = true,
  animated = true,
  duration = 600,
  style,
}) {
  const clamped = Math.max(0, Math.min(1, progress));
  const value = useSharedValue(animated ? 0 : clamped);

  useEffect(() => {
    value.value = animated
      ? withTiming(clamped, { duration, easing: Easing.out(Easing.cubic) })
      : clamped;
  }, [clamped, animated, duration, value]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${value.value * 100}%`,
  }));

  const colors = gradient ?? [color, color];

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[
        {
          height,
          borderRadius: radii.full,
          backgroundColor: trackColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View style={[{ height: '100%', borderRadius: radii.full }, fillStyle]}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            { flex: 1, borderRadius: radii.full },
            glow
              ? {
                  shadowColor: colors[colors.length - 1],
                  shadowOpacity: 0.6,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 0 },
                }
              : null,
          ]}
        />
      </Animated.View>
    </View>
  );
}

/**
 * The splash screen's cyan -> lime -> bright-lime connection bar.
 */
export function NeonProgressBar(props) {
  return (
    <ProgressBar
      gradient={[faction.p2, faction.p1, '#60ff98']}
      trackColor={withAlpha(surface.containerHighest, 1)}
      {...props}
    />
  );
}

export default ProgressBar;
