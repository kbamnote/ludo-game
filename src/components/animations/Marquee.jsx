/**
 * Marquee — the Home screen's scrolling "LIVE ARENA" winner ticker.
 *
 * Runs a continuous translateX on the UI thread via Reanimated. The content is
 * rendered twice back to back and the loop resets at exactly one copy's width,
 * which is what makes the wrap invisible.
 *
 * Honours the reduced-motion setting: when animations are off the ticker holds
 * still rather than crawling, since an endlessly moving strip is exactly the
 * kind of thing that setting exists for.
 */
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useSettingsStore } from '../../store/useSettingsStore';

export function Marquee({ children, speed = 40, style }) {
  const [width, setWidth] = useState(0);
  const offset = useSharedValue(0);
  const animationsEnabled = useSettingsStore((s) => s.animationsEnabled);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const shouldAnimate = animationsEnabled && !reducedMotion;

  useEffect(() => {
    if (!width || !shouldAnimate) {
      cancelAnimation(offset);
      offset.value = 0;
      return undefined;
    }
    offset.value = 0;
    offset.value = withRepeat(
      withTiming(-width, { duration: (width / speed) * 1000, easing: Easing.linear }),
      -1,
      false
    );
    return () => cancelAnimation(offset);
  }, [width, speed, shouldAnimate, offset]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <View style={[{ overflow: 'hidden' }, style]}>
      <Animated.View style={[{ flexDirection: 'row' }, animatedStyle]}>
        <View
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
          style={{ flexDirection: 'row' }}
        >
          {children}
        </View>
        {/* Second copy makes the wrap seamless. Hidden from screen readers so
            the content is not announced twice. */}
        {width > 0 && shouldAnimate ? (
          <View
            style={{ flexDirection: 'row' }}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {children}
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
}

export default Marquee;
