/**
 * Splash — the app's entry route.
 *
 * Phase 1 builds the real brand lockup, glow rings and connection bar, because
 * this screen is the single best smoke test that the foundation works: it
 * exercises fonts, the asset registry, Reanimated, the progress bar, the glow
 * tokens and the button all at once. If this renders correctly, the foundation
 * is sound.
 *
 * Stitch 1 — Splash Screen. The particle field and live vault counter land in
 * Phase 2 with the rest of the screen content.
 */
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { Screen } from '../../components/common/Screen';
import { Text } from '../../components/common/Text';
import { StatPill } from '../../components/common/StatPill';
import { NeonProgressBar } from '../../components/common/ProgressBar';
import { NeonButton } from '../../components/buttons/NeonButton';
import { WaveformBars } from '../../components/animations/WaveformBars';
import { images } from '../../assets/images';
import { faction, role } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore, AuthStatus } from '../../store/useAuthStore';

function PulseRing({ size = 256, color, enabled }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.25);

  useEffect(() => {
    if (!enabled) return;
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1800, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 0 })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1800, easing: Easing.out(Easing.quad) }),
        withTiming(0.25, { duration: 0 })
      ),
      -1,
      false
    );
  }, [enabled, scale, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1,
          borderColor: color,
        },
        style,
      ]}
    />
  );
}

export function SplashScreen() {
  const router = useRouter();
  const animations = useSettingsStore((s) => s.animationsEnabled);
  const hasOnboarded = useAuthStore((s) => s.hasOnboarded);
  const status = useAuthStore((s) => s.status);
  const [progress, setProgress] = useState(0.78);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Stands in for real asset preloading, which arrives in Phase 2.
    const id = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(1, p + 0.04);
        if (next >= 1) {
          clearInterval(id);
          setReady(true);
        }
        return next;
      });
    }, 220);
    return () => clearInterval(id);
  }, []);

  return (
    <Screen
      glows={[
        { color: faction.p1, size: 320, top: 80, left: 20, opacity: 0.15 },
        { color: faction.p2, size: 288, top: 380, left: -80, opacity: 0.1 },
        { color: faction.p3, size: 256, top: 520, right: -80, opacity: 0.15 },
      ]}
      contentContainerStyle={{ justifyContent: 'space-between', paddingBottom: spacing.xl }}
    >
      {/* Top status beacons */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: spacing.md,
        }}
      >
        <StatPill label="Tokyo S-04 • Live Lounge" dot color={faction.p1} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <WaveformBars color={faction.p2} bars={3} height={14} active={animations} />
          <Text variant="label-sm" color={role.onSurfaceVariant}>
            128 BPM
          </Text>
        </View>
      </View>

      {/* Brand lockup */}
      <View style={{ alignItems: 'center', gap: spacing.lg }}>
        <View style={{ width: 256, height: 256, alignItems: 'center', justifyContent: 'center' }}>
          <PulseRing size={256} color={faction.p1} enabled={animations} />
          <PulseRing size={224} color={faction.p2} enabled={animations} />
          <Image
            source={images.brandLogo}
            style={{ width: 224, height: 224, borderRadius: radii.xxxl }}
            contentFit="contain"
            accessibilityLabel="Ludo After Dark"
          />
        </View>

        <View style={{ alignItems: 'center', gap: spacing.xs, maxWidth: 320 }}>
          <StatPill label="High Stakes • Zero Mercy" color={role.secondaryFixed} />
          <Text variant="headline-lg" color={role.onSurface} align="center" uppercase>
            Ludo After Dark
          </Text>
          <Text variant="body-md" color={role.onSurfaceVariant} align="center">
            Reinventing Ludo for the Cyber Era
          </Text>
        </View>
      </View>

      {/* Connection + CTA */}
      <View style={{ gap: spacing.md }}>
        <View style={{ gap: spacing.xs }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="label-md" color={role.onSurfaceVariant}>
              {ready ? 'Systems synchronized' : 'Connecting to servers…'}
            </Text>
            <Text variant="label-md" color={faction.p1} numeric>
              {ready ? 'READY' : `${Math.round(progress * 100)}%`}
            </Text>
          </View>
          <NeonProgressBar progress={progress} height={8} />
        </View>

        <NeonButton
          label="Enter the night"
          size="lg"
          fullWidth
          iconRight="arrow_forward"
          haptic="medium"
          disabled={!ready}
          onPress={() => {
            // First run goes through onboarding; afterwards straight to auth.
            // Once there is a real session (Phase 3) this also skips auth.
            if (!hasOnboarded) router.replace('/(onboarding)');
            else if (status === AuthStatus.signedOut || status === AuthStatus.unknown)
              router.replace('/(auth)/sign-in');
            else router.replace('/(tabs)');
          }}
        />

        <View style={{ alignItems: 'center' }}>
          <Text variant="label-sm" color={role.outline}>
            Patch v0.1.0 • Phase 1 foundation
          </Text>
        </View>
      </View>
    </Screen>
  );
}

export default SplashScreen;
