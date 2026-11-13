/**
 * Live Match — Stitch screen 7.
 *
 * Turn ring + countdown, match pot, the four-player voice strip, the board
 * arena, chat ribbon, taunt bar, and the 2X BET / ROLL DICE command deck.
 *
 * ── Scope, stated plainly ───────────────────────────────────────────────────
 * This is the Phase 2 SHELL. The dice animates and lands on a number, the
 * turn timer runs, taunts fire — but there is no game. Tokens do not move,
 * nothing is captured, nobody wins.
 *
 * That is deliberate. The rules live in @ludo/engine (ludo-server repo) and
 * arrive in Phase 4, with real multiplayer in Phase 5. Wiring a throwaway
 * local rule set here would be work thrown away and, worse, would make an
 * unbuilt feature look finished.
 *
 * The board itself is real geometry, not decoration — see
 * src/game/board/geometry.js and risk R1 in PROJECT_STATUS.
 */
import { useCallback, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

import { Screen } from '../../components/common/Screen';
import { AppHeader, HEADER_HEIGHT } from '../../components/common/AppHeader';
import { Text } from '../../components/common/Text';
import { GlassSurface } from '../../components/common/GlassSurface';
import { Avatar } from '../../components/common/Avatar';
import { Icon } from '../../components/icons/Icon';
import { WaveformBars } from '../../components/animations/WaveformBars';
import { useCountdown } from '../../components/common/CountdownTimer';
import { LoadingState, ErrorState } from '../../components/common/States';
import { LudoBoard } from '../../game/board/LudoBoard';

import { api, queryKeys } from '../../services/sampleData';
import { useUserStore } from '../../store/useUserStore';
import { useHaptics } from '../../hooks/useHaptics';
import { useResponsive } from '../../hooks/useResponsive';
import { thousands } from '../../utils/format';
import { faction, role, surface, withAlpha } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { glow } from '../../theme/effects';

/** Sample token layout, so the board shows a plausible mid-game state. */
const SAMPLE_TOKENS = [
  { seat: 0, slot: 0, progress: -1 },
  { seat: 0, slot: 1, progress: -1 },
  { seat: 0, slot: 2, progress: 12 },
  { seat: 0, slot: 3, progress: 31 },
  { seat: 1, slot: 0, progress: -1 },
  { seat: 1, slot: 1, progress: 7 },
  { seat: 1, slot: 2, progress: -1 },
  { seat: 1, slot: 3, progress: -1 },
  { seat: 2, slot: 0, progress: 19 },
  { seat: 2, slot: 1, progress: -1 },
  { seat: 2, slot: 2, progress: -1 },
  { seat: 2, slot: 3, progress: 44 },
  { seat: 3, slot: 0, progress: -1 },
  { seat: 3, slot: 1, progress: 3 },
  { seat: 3, slot: 2, progress: 27 },
  { seat: 3, slot: 3, progress: -1 },
];

const DICE_PIPS = {
  1: [[1, 1]],
  2: [
    [0, 0],
    [2, 2],
  ],
  3: [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  4: [
    [0, 0],
    [2, 0],
    [0, 2],
    [2, 2],
  ],
  5: [
    [0, 0],
    [2, 0],
    [1, 1],
    [0, 2],
    [2, 2],
  ],
  6: [
    [0, 0],
    [2, 0],
    [0, 1],
    [2, 1],
    [0, 2],
    [2, 2],
  ],
};

function DiceFace({ value, size = 44, color = faction.p1 }) {
  const pip = size * 0.14;
  const pad = size * 0.2;
  const gap = (size - pad * 2 - pip) / 2;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radii.xl,
        backgroundColor: surface.containerLowest,
      }}
    >
      {(DICE_PIPS[value] ?? DICE_PIPS[6]).map(([cx, cy], i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: pad + cx * gap,
            top: pad + cy * gap,
            width: pip,
            height: pip,
            borderRadius: pip / 2,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
}

function TurnRing({ secondsLeft, total, size = 28 }) {
  const r = (size - 3) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, secondsLeft / total));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg
        width={size}
        height={size}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={surface.containerHighest}
          strokeWidth={3}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={faction.p1}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={`${circumference * pct} ${circumference}`}
          fill="none"
        />
      </Svg>
      <Text variant="label-sm" color={faction.p1} numeric>
        {String(secondsLeft).padStart(2, '0')}
      </Text>
    </View>
  );
}

function VoiceStrip({ players }) {
  return (
    <GlassSurface over="void" style={{ padding: 6, flexDirection: 'row', gap: spacing.xs }}>
      {players.map((p) => (
        <View
          key={p.seat}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 6,
            paddingVertical: 4,
            borderRadius: radii.lg,
            backgroundColor: p.you ? surface.container : withAlpha(surface.containerHigh, 0.6),
          }}
        >
          <Avatar source={p.avatar} size={24} faction={p.faction} ringWidth={1.5} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="label-sm" color={faction[p.faction]} numberOfLines={1}>
              {p.name}
            </Text>
            <WaveformBars
              color={faction[p.faction]}
              bars={3}
              width={2}
              height={8}
              active={p.speaking}
            />
          </View>
        </View>
      ))}
    </GlassSurface>
  );
}

export function MatchScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const haptics = useHaptics();
  const user = useUserStore();
  const { width } = useResponsive();

  const [dice, setDice] = useState(6);
  const [rolling, setRolling] = useState(false);
  const [toast, setToast] = useState(null);

  const spin = useSharedValue(0);
  const scale = useSharedValue(1);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.match(id),
    queryFn: api.getMatch,
  });

  const secondsLeft = useCountdown(data?.turnSecondsLeft ?? 10, { running: !!data });

  const diceStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }, { scale: scale.value }],
  }));

  const roll = useCallback(() => {
    if (rolling) return;
    setRolling(true);
    haptics.heavy();

    spin.value = withTiming(spin.value + 540, { duration: 620, easing: Easing.out(Easing.cubic) });
    scale.value = withSequence(
      withTiming(1.18, { duration: 180 }),
      withSpring(1, { damping: 14, stiffness: 220 })
    );

    // The result is cosmetic in Phase 2. From Phase 5 the SERVER rolls and
    // sends the value — the client must never generate it for a real match.
    setTimeout(() => {
      setDice(1 + Math.floor(Math.random() * 6));
      setRolling(false);
    }, 620);
  }, [rolling, haptics, spin, scale]);

  const sendTaunt = (t) => {
    haptics.light();
    setToast(t.glyph ?? t.label);
    setTimeout(() => setToast(null), 1100);
  };

  const header = (
    <AppHeader
      title="Live Match"
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
          <LoadingState label="Entering arena" />
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
          <ErrorState message="Could not join the match." onRetry={refetch} />
        </Screen>
      </>
    );
  }

  const boardSize = Math.min(width - spacing.margin * 2, 380);

  return (
    <>
      {header}
      <Screen
        scroll
        edges={{ top: false, bottom: true }}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + spacing.sm,
          paddingBottom: spacing.lg,
          gap: spacing.sm,
        }}
        glows={[{ color: faction.p1, size: 300, top: 160, left: -70, opacity: 0.1 }]}
      >
        {/* Turn + pot */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.sm,
          }}
        >
          <GlassSurface
            over="void"
            radius={radii.full}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              paddingHorizontal: spacing.md,
              paddingVertical: 6,
            }}
          >
            <TurnRing secondsLeft={secondsLeft} total={data.turnTotalSeconds} />
            <View>
              <Text variant="label-sm" color={faction.p1}>
                YOUR TURN
              </Text>
              <Text variant="body-sm" color={role.onSurfaceVariant}>
                Select or Roll
              </Text>
            </View>
          </GlassSurface>

          <GlassSurface
            over="void"
            radius={radii.full}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: spacing.md,
              paddingVertical: 6,
            }}
          >
            <Icon name="monetization_on" size={16} color={faction.p2} />
            <View style={{ alignItems: 'flex-end' }}>
              <Text variant="label-sm" color={role.onSurfaceVariant}>
                MATCH POT
              </Text>
              <Text variant="label-lg" color={role.secondaryFixed} numeric>
                {thousands(data.pot)} COINS
              </Text>
            </View>
          </GlassSurface>
        </View>

        <VoiceStrip players={data.players} />

        {/* Board */}
        <View style={{ alignItems: 'center', paddingVertical: spacing.xs }}>
          <View
            style={[
              {
                borderRadius: radii.xxxl,
                overflow: 'hidden',
                backgroundColor: surface.containerLowest,
              },
              glow.primary,
            ]}
          >
            <LudoBoard
              size={boardSize}
              tokens={SAMPLE_TOKENS}
              highlighted={['0-2', '0-3']}
              threatIndex={19}
            />
          </View>
        </View>

        {/* Chat ribbon */}
        <GlassSurface
          radius={radii.full}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            paddingHorizontal: spacing.md,
            paddingVertical: 8,
          }}
        >
          <Icon name="chat_bubble" size={14} color={faction.p2} />
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}
          >
            <Text variant="label-sm" color={role.secondaryFixed}>
              {data.lastMessage.author}:
            </Text>
            <Text
              variant="body-sm"
              color={role.onSurface}
              numberOfLines={1}
              style={{ flexShrink: 1 }}
            >
              &ldquo;{data.lastMessage.text}&rdquo;
            </Text>
          </View>
          <Text variant="label-sm" color={role.onSurfaceVariant}>
            {data.lastMessage.time}
          </Text>
        </GlassSurface>

        {/* Taunts */}
        <GlassSurface
          over="void"
          radius={radii.xxl}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.sm,
            paddingVertical: 6,
          }}
        >
          <Text variant="label-sm" color={role.onSurfaceVariant}>
            TAUNTS
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {data.taunts.map((t) => (
              <Pressable
                key={t.id}
                accessibilityRole="button"
                accessibilityLabel={t.label ?? `Send ${t.id}`}
                onPress={() => sendTaunt(t)}
                style={({ pressed }) => ({
                  width: 36,
                  height: 36,
                  borderRadius: radii.xl,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: surface.container,
                  transform: [{ scale: pressed ? 0.78 : 1 }],
                })}
              >
                {t.glyph ? (
                  <Text variant="body-lg">{t.glyph}</Text>
                ) : (
                  <Text variant="label-sm" color={faction[t.accent]}>
                    {t.label}
                  </Text>
                )}
              </Pressable>
            ))}
          </View>
        </GlassSurface>

        {/* Command deck */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Double bet"
            onPress={() => haptics.medium()}
            style={({ pressed }) => ({
              width: 64,
              height: 64,
              borderRadius: radii.xxl,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: surface.container,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
          >
            <Icon name="casino" size={20} color={faction.p2} />
            <Text variant="label-sm" color={role.onSurfaceVariant}>
              2X BET
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Roll dice"
            accessibilityState={{ busy: rolling }}
            onPress={roll}
            style={({ pressed }) => [
              {
                flex: 1,
                height: 64,
                borderRadius: radii.xxl,
                backgroundColor: faction.p1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: spacing.lg,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
              glow.primaryStrong,
            ]}
          >
            <View>
              <Text variant="label-lg" color={role.onPrimary}>
                ROLL DICE
              </Text>
              <Text variant="label-sm" color={role.onPrimaryFixedVariant}>
                TAP TO ROLL
              </Text>
            </View>
            <Animated.View style={diceStyle}>
              <DiceFace value={dice} />
            </Animated.View>
          </Pressable>
        </View>

        {/* Scope notice — kept visible in dev so the shell is never mistaken
            for a working game. */}
        {__DEV__ ? (
          <View
            style={{
              flexDirection: 'row',
              gap: 6,
              padding: spacing.sm,
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: withAlpha(faction.p2, 0.35),
              backgroundColor: withAlpha(faction.p2, 0.08),
            }}
          >
            <Icon name="info" size={14} color={faction.p2} />
            <Text variant="body-sm" color={role.onSurfaceVariant} style={{ flex: 1 }}>
              Phase 2 shell. The board geometry is real, but there are no rules yet — tokens do not
              move. @ludo/engine lands in Phase 4, server-authoritative dice in Phase 5.
            </Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/match/${id}/results`)}
          style={{ alignItems: 'center', paddingVertical: spacing.sm }}
        >
          <Text variant="label-sm" color={role.outline}>
            PREVIEW MATCH RESULTS →
          </Text>
        </Pressable>
      </Screen>

      {/* Taunt toast */}
      {toast ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: 120,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}
        >
          <GlassSurface
            over="containerHigh"
            radius={radii.full}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
            }}
          >
            <Text variant="headline-sm">{toast}</Text>
            <Text variant="label-md" color={faction.p1}>
              SENT TO SQUAD
            </Text>
          </GlassSurface>
        </View>
      ) : null}
    </>
  );
}

export default MatchScreen;
