/**
 * Match Results & Victory — Stitch screen 12.
 *
 * Confetti burst, VICTORY in display-hero, the winner podium with crown and
 * MVP tag, the rewards grid, final standings, post-game reactions and the
 * rematch / share / return actions.
 *
 * The design renders confetti as inline SVG; here it is Reanimated so the
 * pieces actually fall, which is the point of a victory screen. It respects
 * the reduced-motion setting — a burst of moving shapes is exactly what that
 * setting is for.
 */
import { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  Easing,
  FadeInDown,
  ZoomIn,
} from 'react-native-reanimated';

import { Screen } from '../../components/common/Screen';
import { AppHeader, HEADER_HEIGHT } from '../../components/common/AppHeader';
import { Text } from '../../components/common/Text';
import { StatPill } from '../../components/common/StatPill';
import { GlassSurface } from '../../components/common/GlassSurface';
import { Avatar } from '../../components/common/Avatar';
import { NeonButton } from '../../components/buttons/NeonButton';
import { Icon } from '../../components/icons/Icon';
import { LoadingState, ErrorState } from '../../components/common/States';

import { api, queryKeys } from '../../services/sampleData';
import { useUserStore } from '../../store/useUserStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useHaptics } from '../../hooks/useHaptics';
import { useResponsive } from '../../hooks/useResponsive';
import { thousands } from '../../utils/format';
import { faction, role, surface } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { glow } from '../../theme/effects';

const CONFETTI_COLORS = [faction.p1, faction.p2, faction.p3, faction.p4, role.tertiaryFixed];

function ConfettiPiece({ x, delay, duration, color, size, drift }) {
  const y = useSharedValue(-40);
  const rotate = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(withTiming(360, { duration, easing: Easing.linear }), -1, false)
    );
    rotate.value = withDelay(
      delay,
      withRepeat(withTiming(360, { duration: duration * 0.7, easing: Easing.linear }), -1, false)
    );
  }, [delay, duration, y, rotate]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: y.value },
      { translateX: Math.sin(y.value / 40) * drift },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: y.value > 300 ? 0 : 1,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          width: size,
          height: size * 0.4,
          borderRadius: 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

function ConfettiBurst({ width, count = 18 }) {
  const animationsEnabled = useSettingsStore((s) => s.animationsEnabled);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);

  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        key: i,
        x: (i / count) * width + ((i * 37) % 23),
        delay: (i % 6) * 260,
        duration: 2600 + ((i * 53) % 1400),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 5 + ((i * 7) % 5),
        drift: 12 + ((i * 11) % 18),
      })),
    [count, width]
  );

  if (!animationsEnabled || reducedMotion) return null;

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 320, overflow: 'hidden' }}
    >
      {pieces.map(({ key, ...p }) => (
        <ConfettiPiece key={key} {...p} />
      ))}
    </View>
  );
}

function StandingRow({ row }) {
  const accent = row.eliminated ? role.error : row.you ? faction.p1 : role.onSurface;

  return (
    <GlassSurface
      over={row.you ? 'containerHigh' : 'void'}
      style={{
        padding: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        opacity: row.eliminated ? 0.8 : 1,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: row.place === 1 ? faction.p1 : surface.variant,
        }}
      >
        <Text
          variant="label-lg"
          color={row.place === 1 ? role.onPrimaryContainer : role.onSurfaceVariant}
          numeric
        >
          {row.place}
        </Text>
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text
            variant="label-lg"
            color={row.you ? role.tertiary : role.onSurface}
            numberOfLines={1}
          >
            {row.name}
          </Text>
          {row.mvp ? (
            <StatPill
              label="MVP"
              color={role.tertiary}
              background={role.onTertiaryContainer}
              size="sm"
            />
          ) : null}
        </View>
        <Text
          variant="body-sm"
          color={row.eliminated ? role.error : role.outline}
          numberOfLines={1}
        >
          {row.clan}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text variant="label-lg" color={row.eliminated ? role.error : accent} numeric>
          {row.home} Home
        </Text>
        <Text variant="label-sm" color={role.onSurfaceVariant} numeric>
          {row.kills} Kills
        </Text>
      </View>

      {row.place === 1 ? <Icon name="verified" size={18} color={faction.p1} /> : null}
    </GlassSurface>
  );
}

export function MatchResultsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const haptics = useHaptics();
  const user = useUserStore();
  const { width } = useResponsive();
  const [sent, setSent] = useState(null);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.matchResult(id),
    queryFn: api.getMatchResult,
  });

  useEffect(() => {
    if (data) haptics.success();
  }, [data, haptics]);

  const header = (
    <AppHeader
      title="Match Summary"
      gems={thousands(user.gems)}
      avatarSource={user.avatar}
      avatarFaction={user.faction}
      onBack={() => router.back()}
      showLogo={false}
    />
  );

  if (isPending) {
    return (
      <>
        {header}
        <Screen
          edges={{ top: false, bottom: false }}
          contentContainerStyle={{ paddingTop: HEADER_HEIGHT }}
        >
          <LoadingState label="Tallying results" />
        </Screen>
      </>
    );
  }

  if (isError) {
    return (
      <>
        {header}
        <Screen
          edges={{ top: false, bottom: false }}
          contentContainerStyle={{ paddingTop: HEADER_HEIGHT }}
        >
          <ErrorState message="Could not load the summary." onRetry={refetch} />
        </Screen>
      </>
    );
  }

  const { winner } = data;

  return (
    <>
      {header}
      <Screen
        scroll
        edges={{ top: false, bottom: true }}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + spacing.sm,
          paddingBottom: spacing.xl,
          gap: spacing.lg,
        }}
        glows={[
          { color: faction.p1, size: 320, top: -48, left: width / 2 - 160, opacity: 0.2 },
          { color: faction.p2, size: 224, top: 176, left: -64 },
          { color: faction.p3, size: 224, top: 256, right: -64, opacity: 0.2 },
        ]}
      >
        <ConfettiBurst width={width} />

        {/* Title */}
        <Animated.View
          entering={FadeInDown.duration(380)}
          style={{ alignItems: 'center', gap: spacing.xs }}
        >
          <StatPill
            label={`Match #${data.matchId} • ${data.mode}`}
            icon="military_tech"
            color={role.primaryFixed}
          />
          <Text variant="display-hero" color={role.tertiary} uppercase>
            Victory
          </Text>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: -6 }}
          >
            <View style={{ width: 32, height: 2, borderRadius: 1, backgroundColor: faction.p2 }} />
            <Text variant="headline-sm" color={faction.p2} uppercase>
              1st Place Royale
            </Text>
            <View style={{ width: 32, height: 2, borderRadius: 1, backgroundColor: faction.p2 }} />
          </View>
        </Animated.View>

        {/* Podium */}
        <Animated.View entering={ZoomIn.delay(160).duration(420)} style={{ alignItems: 'center' }}>
          <View style={{ alignItems: 'center' }}>
            <View style={glow.primaryStrong}>
              <Avatar source={winner.avatar} size={144} faction={winner.faction} ringWidth={4} />
            </View>

            <View
              style={{
                position: 'absolute',
                top: -8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingHorizontal: 10,
                paddingVertical: 2,
                borderRadius: radii.full,
                backgroundColor: surface.containerHigh,
              }}
            >
              <Icon name="workspace_premium" size={14} color={role.primaryFixed} />
              <Text variant="label-sm" color={role.primaryFixed}>
                CHAMPION
              </Text>
            </View>

            {data.mvp ? (
              <View
                style={{
                  position: 'absolute',
                  bottom: -10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: radii.full,
                  backgroundColor: role.onTertiaryContainer,
                }}
              >
                <Icon name="local_fire_department" size={12} color={role.tertiary} />
                <Text variant="label-md" color={role.tertiary}>
                  MATCH MVP
                </Text>
              </View>
            ) : null}
          </View>

          <GlassSurface
            over="containerHigh"
            style={{
              width: 224,
              marginTop: spacing.md,
              paddingVertical: spacing.sm,
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text variant="headline-sm" color={role.tertiary}>
                {winner.name}
              </Text>
              <StatPill label={`LVL ${winner.level}`} color={role.onSurfaceVariant} size="sm" />
            </View>
            <Text variant="body-sm" color={role.outline}>
              {winner.clan}
            </Text>
          </GlassSurface>
        </Animated.View>

        {/* Rewards */}
        <GlassSurface over="void" style={{ padding: spacing.md, gap: spacing.sm }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text variant="label-sm" color={role.outline}>
              Earned Rewards
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="bolt" size={11} color={role.primaryFixed} />
              <Text variant="label-sm" color={role.primaryFixed}>
                {data.multiplier} Multiplier
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {data.rewards.map((r) => (
              <View
                key={r.id}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  gap: 2,
                  padding: spacing.sm,
                  borderRadius: radii.lg,
                  backgroundColor: surface.containerHigh,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: surface.variant,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name={r.icon} size={16} color={faction[r.accent]} />
                </View>
                <Text variant="headline-sm" color={faction[r.accent]} numeric>
                  {r.amount}
                </Text>
                <Text variant="label-sm" color={role.onSurfaceVariant}>
                  {r.label}
                </Text>
              </View>
            ))}
          </View>
        </GlassSurface>

        {/* Standings */}
        <View style={{ gap: spacing.xs }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: spacing.xs,
            }}
          >
            <Text variant="label-sm" color={role.outline}>
              Final Standings
            </Text>
            <Text variant="label-sm" color={role.onSurfaceVariant}>
              Tokens Home / Kills
            </Text>
          </View>
          {data.standings.map((row) => (
            <StandingRow key={row.place} row={row} />
          ))}
        </View>

        {/* Reactions */}
        <View style={{ gap: spacing.xs }}>
          <Text variant="label-sm" color={role.outline} style={{ paddingHorizontal: spacing.xs }}>
            Post-Game Reactions
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.xs, paddingRight: spacing.margin }}
            style={{ marginHorizontal: -spacing.margin, paddingHorizontal: spacing.margin }}
          >
            {data.reactions.map((r) => {
              const isSent = sent === r.id;
              return (
                <Pressable
                  key={r.id}
                  accessibilityRole="button"
                  accessibilityLabel={r.label}
                  onPress={() => {
                    haptics.light();
                    setSent(r.id);
                    setTimeout(() => setSent(null), 1400);
                  }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: radii.full,
                    backgroundColor: isSent ? faction.p1 : surface.containerHigh,
                    transform: [{ scale: pressed ? 0.94 : 1 }],
                  })}
                >
                  {isSent ? (
                    <Icon name="check" size={14} color={role.onPrimaryContainer} />
                  ) : (
                    <Text variant="body-sm">{r.glyph}</Text>
                  )}
                  <Text variant="label-md" color={isSent ? role.onPrimaryContainer : role.tertiary}>
                    {isSent ? 'SENT!' : r.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Actions */}
        <View style={{ gap: spacing.sm }}>
          <NeonButton
            label="Play again / rematch"
            icon="replay"
            size="lg"
            fullWidth
            haptic="heavy"
            onPress={() => router.replace(`/match/${id}`)}
          />
          <NeonButton
            label="Share highlight reel"
            icon="smart_display"
            variant="glass"
            fullWidth
            onPress={() => haptics.light()}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.navigate('/(tabs)')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingVertical: spacing.sm,
            }}
          >
            <Icon name="home" size={16} color={role.onSurfaceVariant} />
            <Text variant="label-md" color={role.onSurfaceVariant}>
              Return to Lobby
            </Text>
          </Pressable>
        </View>
      </Screen>
    </>
  );
}

export default MatchResultsScreen;
