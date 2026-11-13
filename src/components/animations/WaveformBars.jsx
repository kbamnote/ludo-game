/**
 * WaveformBars — the animated audio-level bars beside every voice indicator.
 *
 * Appears ~12 times: splash BPM meter, onboarding voice bubble, lobby slots,
 * the in-match 4-player voice strip, and the friends voice party.
 *
 * Each bar runs its own looped timing on the UI thread with a staggered delay.
 * This is deliberately NOT driven by real audio levels yet — Phase 6 wires
 * LiveKit and can feed real amplitude in through `level`.
 */
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { faction } from '../../theme/colors';

function Bar({ color, width, minHeight, maxHeight, delay, duration, active }) {
  const h = useSharedValue(minHeight);

  useEffect(() => {
    if (!active) {
      cancelAnimation(h);
      h.value = withTiming(minHeight, { duration: 160 });
      return undefined;
    }
    h.value = withDelay(
      delay,
      withRepeat(withTiming(maxHeight, { duration, easing: Easing.inOut(Easing.quad) }), -1, true)
    );
    return () => cancelAnimation(h);
  }, [active, delay, duration, maxHeight, minHeight, h]);

  const style = useAnimatedStyle(() => ({ height: h.value }));

  return (
    <Animated.View style={[{ width, borderRadius: width / 2, backgroundColor: color }, style]} />
  );
}

export function WaveformBars({
  color = faction.p1,
  bars = 3,
  width = 2,
  height = 16,
  gap = 2,
  /** false renders the bars at rest — the muted / idle state. */
  active = true,
  style,
}) {
  const minHeight = Math.max(2, height * 0.25);

  return (
    <View
      accessible={false}
      style={[{ flexDirection: 'row', alignItems: 'flex-end', gap, height }, style]}
    >
      {Array.from({ length: bars }, (_, i) => (
        <Bar
          key={i}
          color={color}
          width={width}
          minHeight={minHeight}
          // Vary the peak per bar so it reads as a waveform, not a metronome.
          maxHeight={height * (0.55 + ((i * 37) % 45) / 100)}
          delay={i * 110}
          duration={420 + ((i * 53) % 220)}
          active={active}
        />
      ))}
    </View>
  );
}

export default WaveformBars;
