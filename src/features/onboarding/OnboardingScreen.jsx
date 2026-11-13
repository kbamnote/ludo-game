/**
 * Onboarding — Stitch screen 2.
 *
 * The design's step indicator reads "PHASE 01 / 03" but only phase 1 was ever
 * generated. Steps 2 and 3 are composed here from the same token system and
 * layout, reusing existing artwork rather than inventing illustrations; both
 * are marked `awaitingDesign` in sampleData.js and show a small badge in dev so
 * the gap stays visible rather than quietly becoming "done".
 *
 * Layout per the design: progress segments, phase label, hero typography,
 * bento showcase with floating HUD pills + voice bubble + dice widget, feature
 * pills, social-proof ticker, CTA.
 */
import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Screen } from '../../components/common/Screen';
import { Text } from '../../components/common/Text';
import { StatPill } from '../../components/common/StatPill';
import { GlassSurface } from '../../components/common/GlassSurface';
import { NeonButton } from '../../components/buttons/NeonButton';
import { Icon } from '../../components/icons/Icon';
import { WaveformBars } from '../../components/animations/WaveformBars';
import { Avatar } from '../../components/common/Avatar';

import { onboardingSteps } from '../../services/sampleData';
import { useAuthStore } from '../../store/useAuthStore';
import { faction, role, surface, withAlpha } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { images } from '../../assets/images';

function StepProgress({ index, total }) {
  return (
    <View style={{ flexDirection: 'row', gap: spacing.xs }}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 6,
            borderRadius: radii.full,
            backgroundColor: i <= index ? faction.p1 : surface.containerHighest,
          }}
        />
      ))}
    </View>
  );
}

function HudPill({ icon, label, accent }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: radii.full,
        backgroundColor: withAlpha(surface.containerHigh, 0.92),
      }}
    >
      <Icon name={icon} size={12} color={faction[accent]} />
      <Text variant="label-sm" color={role.onSurface}>
        {label}
      </Text>
    </View>
  );
}

export function OnboardingScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const step = onboardingSteps[index];
  const isLast = index === onboardingSteps.length - 1;

  const finish = () => {
    completeOnboarding();
    router.replace('/(auth)/sign-in');
  };

  const next = () => (isLast ? finish() : setIndex((i) => i + 1));

  return (
    <Screen
      scroll
      glows={[
        { color: faction.p1, size: 224, top: -48, left: -64 },
        { color: faction.p2, size: 256, top: 260, right: -80 },
        { color: faction.p3, size: 192, top: 560, left: 32 },
      ]}
      contentContainerStyle={{ paddingBottom: spacing.xl, gap: spacing.md }}
    >
      {/* Top bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: spacing.md,
        }}
      >
        <StatPill label="AFTER DARK V2.4" dot color={faction.p1} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          onPress={finish}
          hitSlop={12}
          style={{
            paddingHorizontal: spacing.md,
            paddingVertical: 6,
            borderRadius: radii.full,
            backgroundColor: withAlpha(surface.container, 0.7),
          }}
        >
          <Text variant="label-md" color={role.onSurfaceVariant}>
            SKIP
          </Text>
        </Pressable>
      </View>

      {/* Phase indicator */}
      <View style={{ gap: spacing.xs }}>
        <StepProgress index={index} total={onboardingSteps.length} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="label-sm" color={faction.p1}>
            {step.phase}
          </Text>
          <Text variant="label-sm" color={role.onSurfaceVariant}>
            LUDO STREETWEAR CLUB
          </Text>
        </View>
      </View>

      <Animated.View
        key={step.key}
        entering={FadeIn.duration(260)}
        exiting={FadeOut.duration(120)}
        style={{ gap: spacing.md }}
      >
        {/* Hero typography */}
        <View style={{ gap: spacing.xs }}>
          <View style={{ flexDirection: 'row' }}>
            <StatPill label={step.chip} icon={step.chipIcon} color={faction.p1} size="sm" />
          </View>
          <View>
            <Text variant="headline-lg" color={role.primary}>
              {step.title}
            </Text>
            <Text variant="headline-lg" color={role.secondaryFixed}>
              {step.subtitle}
            </Text>
          </View>
          <Text variant="body-sm" color={role.onSurfaceVariant}>
            {step.body}
          </Text>
        </View>

        {/* Bento showcase */}
        <GlassSurface
          over="void"
          radius={radii.xxl}
          style={{ padding: spacing.md, gap: spacing.sm }}
        >
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View
                style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: faction.p2 }}
              />
              <Text variant="label-md" color={role.secondary}>
                {step.room}
              </Text>
            </View>
            <StatPill label={step.pot} icon="local_fire_department" color={faction.p1} size="sm" />
          </View>

          {/* Artwork + overlays */}
          <View
            style={{
              height: 256,
              borderRadius: radii.xl,
              overflow: 'hidden',
              backgroundColor: surface.containerLowest,
            }}
          >
            <Image
              source={step.image}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={220}
              accessibilityLabel={step.title}
            />

            <View style={{ position: 'absolute', top: spacing.sm, left: spacing.sm, gap: 6 }}>
              {step.hud.map((h) => (
                <HudPill key={h.label} {...h} />
              ))}
            </View>

            {/* Voice bubble */}
            <View
              style={{
                position: 'absolute',
                left: spacing.sm,
                right: spacing.sm,
                bottom: 56,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: spacing.sm,
                padding: spacing.sm,
                borderRadius: radii.xl,
                backgroundColor: withAlpha(surface.containerHigh, 0.92),
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Avatar size={32} fallback="K" faction="p1" ringWidth={2} status="online" />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text variant="label-md" color={role.onSurface} numberOfLines={1}>
                      KENJI_VOX
                    </Text>
                    <StatPill label="HOST" color={faction.p1} tinted size="sm" />
                  </View>
                  <Text variant="body-sm" color={role.primaryFixedDim} numberOfLines={1}>
                    &ldquo;Yo, roll a 6 or we&rsquo;re locked out!&rdquo;
                  </Text>
                </View>
              </View>
              <WaveformBars color={faction.p1} bars={4} height={18} />
            </View>

            {/* Dice launcher widget */}
            <View
              style={{
                position: 'absolute',
                right: spacing.sm,
                bottom: spacing.xs,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                paddingHorizontal: spacing.sm,
                paddingVertical: 6,
                borderRadius: radii.full,
                backgroundColor: withAlpha(surface.containerLowest, 0.92),
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: radii.lg,
                  backgroundColor: surface.containerHigh,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="casino" size={14} color={faction.p1} />
              </View>
              <View>
                <Text variant="label-sm" color={role.onSurfaceVariant}>
                  TACTICAL ROLL
                </Text>
                <Text variant="label-md" color={faction.p1}>
                  +6 CRITICAL
                </Text>
              </View>
            </View>
          </View>

          {/* Feature pills */}
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {step.features.map((f) => (
              <View
                key={f.label}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  gap: 2,
                  padding: spacing.sm,
                  borderRadius: radii.xl,
                  backgroundColor: withAlpha(surface.containerHighest, 0.6),
                }}
              >
                <Icon name={f.icon} size={18} color={faction[f.accent]} />
                <Text variant="label-sm" color={role.onSurface} align="center">
                  {f.label}
                </Text>
                <Text variant="body-sm" color={role.onSurfaceVariant} align="center">
                  {f.detail}
                </Text>
              </View>
            ))}
          </View>
        </GlassSurface>
      </Animated.View>

      {/* Social proof */}
      <GlassSurface
        style={{
          padding: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Avatar size={24} source={images.avatarTourney1} ringWidth={2} />
          <View>
            <Text variant="label-md" color={role.onSurface} numeric>
              2,418,920 MATCHES LIVE
            </Text>
            <Text variant="body-sm" color={role.onSurfaceVariant}>
              Global squads rolling right now
            </Text>
          </View>
        </View>
        <StatPill label="PEAK" dot color={faction.p1} size="sm" />
      </GlassSurface>

      {/* CTA */}
      <View style={{ gap: spacing.sm }}>
        <NeonButton
          label={step.cta}
          onPress={next}
          size="lg"
          fullWidth
          iconRight="arrow_forward"
          haptic="medium"
        />
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="verified_user" size={12} color={faction.p1} />
            <Text variant="label-sm" color={role.onSurfaceVariant}>
              PROVABLY FAIR DICE
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="headphones" size={12} color={faction.p2} />
            <Text variant="label-sm" color={role.onSurfaceVariant}>
              SPATIAL AUDIO 3D
            </Text>
          </View>
        </View>
      </View>

      {__DEV__ && step.awaitingDesign ? (
        <View
          style={{
            padding: spacing.sm,
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: withAlpha(faction.p3, 0.4),
            backgroundColor: withAlpha(faction.p3, 0.1),
          }}
        >
          <Text variant="label-sm" color={faction.p3}>
            NO STITCH DESIGN FOR THIS STEP
          </Text>
          <Text variant="body-sm" color={role.onSurfaceVariant}>
            Composed from the token system, reusing existing artwork. Dev-only notice.
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}

export default OnboardingScreen;
