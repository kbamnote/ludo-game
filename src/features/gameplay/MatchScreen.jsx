/**
 * Live Match — Stitch screen 7, now playable.
 *
 * Phase 4 replaces the Phase 2 shell with the real game: @ludo/engine drives
 * turns, legal moves, captures, home entry and the win, with Skia rendering
 * and Reanimated movement.
 *
 * ── Separation held ─────────────────────────────────────────────────────────
 * This file contains NO rules. It never decides whether a move is legal, who
 * plays next, or what a 6 means — it renders engine state and forwards taps.
 * `useMatchEngine` is the only bridge, and the engine itself is shared with
 * the server (ludo-server/packages/engine).
 *
 * ── Dice authority ──────────────────────────────────────────────────────────
 * The roll is generated locally because Phase 4 is an offline game. From
 * Phase 5 the server generates it and `roll()` applies the value it is given.
 * The seam already exists; only the source of the number changes.
 */
import { useCallback, useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  Easing,
  FadeIn,
} from 'react-native-reanimated';

import { Screen } from '../../components/common/Screen';
import { AppHeader, HEADER_HEIGHT } from '../../components/common/AppHeader';
import { Text } from '../../components/common/Text';
import { StatPill } from '../../components/common/StatPill';
import { GlassSurface } from '../../components/common/GlassSurface';
import { Avatar } from '../../components/common/Avatar';
import { NeonButton } from '../../components/buttons/NeonButton';
import { Icon } from '../../components/icons/Icon';
import { WaveformBars } from '../../components/animations/WaveformBars';
import { InteractiveBoard } from '../../game/board/InteractiveBoard';

import { useMatchEngine, ROLL_MS } from './useMatchEngine';
import { Phase } from '../../game/engine/engine.js';
import { PLAYERS } from '../../game/engine/board.js';
import { liveMatch } from '../../services/sampleData';
import { useUserStore } from '../../store/useUserStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useResponsive } from '../../hooks/useResponsive';
import { thousands } from '../../utils/format';
import { faction, role, surface, withAlpha } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { glow } from '../../theme/effects';

const DICE_PIPS = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
};

function DiceFace({ value, size = 44, color = faction.p1 }) {
  const pip = size * 0.14;
  const pad = size * 0.2;
  const gap = (size - pad * 2 - pip) / 2;

  return (
    <View style={{ width: size, height: size, borderRadius: radii.xl, backgroundColor: surface.containerLowest }}>
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

function TurnRing({ seat, active, size = 28 }) {
  const r = (size - 3) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    if (active) {
      progress.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) });
    }
  }, [active, seat, progress]);

  const color = faction[PLAYERS[seat].faction];

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={surface.containerHighest} strokeWidth={3} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          fill="none"
        />
      </Svg>
      <Icon name="casino" size={14} color={color} />
    </View>
  );
}

function VoiceStrip({ players, turn, standings }) {
  return (
    <GlassSurface over="void" style={{ padding: 6, flexDirection: 'row', gap: spacing.xs }}>
      {players.map((p) => {
        const active = p.seat === turn;
        const row = standings.find((s) => s.seat === p.seat);
        return (
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
              backgroundColor: active
                ? withAlpha(faction[p.faction], 0.18)
                : withAlpha(surface.containerHigh, 0.5),
              borderWidth: 1,
              borderColor: active ? faction[p.faction] : 'transparent',
            }}
          >
            <Avatar source={p.avatar} size={24} faction={p.faction} ringWidth={1.5} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="label-sm" color={faction[p.faction]} numberOfLines={1}>
                {p.name}
              </Text>
              {active ? (
                <WaveformBars color={faction[p.faction]} bars={3} width={2} height={8} />
              ) : (
                <Text variant="label-sm" color={role.onSurfaceVariant} numeric>
                  {row?.home ?? 0}/4 home
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </GlassSurface>
  );
}

export function MatchScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const user = useUserStore();
  const { width } = useResponsive();
  const animationsEnabled = useSettingsStore((s) => s.animationsEnabled);

  const game = useMatchEngine({ seats: [0, 1, 2, 3], humanSeats: [0], seed: String(id ?? 'local') });
  const [reaction, setReaction] = useState(null);

  const spin = useSharedValue(0);
  const scale = useSharedValue(1);

  const diceStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }, { scale: scale.value }],
  }));

  const handleRoll = useCallback(() => {
    if (!game.canRoll) return;
    if (animationsEnabled) {
      spin.value = withTiming(spin.value + 540, { duration: ROLL_MS, easing: Easing.out(Easing.cubic) });
      scale.value = withSequence(
        withTiming(1.18, { duration: 180 }),
        withSpring(1, { damping: 14, stiffness: 220 })
      );
    }
    game.roll();
  }, [game, animationsEnabled, spin, scale]);

  // Hand off to the results screen once the game is over.
  useEffect(() => {
    if (!game.isFinished) return undefined;
    const t = setTimeout(() => router.push(`/match/${id}/results`), 1600);
    return () => clearTimeout(t);
  }, [game.isFinished, id, router]);

  const boardSize = Math.min(width - spacing.margin * 2, 380);
  const activePlayer = liveMatch.players.find((p) => p.seat === game.state.turn);

  const statusLabel = game.isFinished
    ? 'MATCH OVER'
    : game.isHumanTurn
      ? game.state.phase === Phase.awaitingRoll
        ? 'YOUR TURN'
        : 'PICK A TOKEN'
      : `${activePlayer?.name ?? 'OPPONENT'}…`;

  return (
    <>
      <AppHeader
        title="Live Match"
        gems={thousands(user.gems)}
        avatarSource={user.avatar}
        avatarFaction={user.faction}
        onBack={() => router.back()}
        showLogo={false}
      />

      <Screen
        scroll
        edges={{ top: false, bottom: true }}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + spacing.sm, paddingBottom: spacing.lg, gap: spacing.sm }}
        glows={[{ color: faction[PLAYERS[game.state.turn].faction], size: 300, top: 160, left: -70, opacity: 0.1 }]}
      >
        {/* Turn + pot */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
          <GlassSurface
            over="void"
            radius={radii.full}
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: 6 }}
          >
            <TurnRing seat={game.state.turn} active={!game.isFinished} />
            <View>
              <Text variant="label-sm" color={faction[PLAYERS[game.state.turn].faction]}>
                {statusLabel}
              </Text>
              <Text variant="body-sm" color={role.onSurfaceVariant}>
                {game.state.roll ? `Rolled ${game.state.roll}` : 'Tap to roll'}
              </Text>
            </View>
          </GlassSurface>

          <GlassSurface
            over="void"
            radius={radii.full}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: 6 }}
          >
            <Icon name="monetization_on" size={16} color={faction.p2} />
            <View style={{ alignItems: 'flex-end' }}>
              <Text variant="label-sm" color={role.onSurfaceVariant}>
                MATCH POT
              </Text>
              <Text variant="label-lg" color={role.secondaryFixed} numeric>
                {thousands(liveMatch.pot)}
              </Text>
            </View>
          </GlassSurface>
        </View>

        <VoiceStrip players={liveMatch.players} turn={game.state.turn} standings={game.standings} />

        {/* Board */}
        <View style={{ alignItems: 'center', paddingVertical: spacing.xs }}>
          <View style={[{ borderRadius: radii.xxxl, overflow: 'hidden', backgroundColor: surface.containerLowest }, glow.primary]}>
            <InteractiveBoard
              size={boardSize}
              tokens={game.state.tokens}
              movableTokenIds={game.movableTokenIds}
              onSelectToken={game.move}
            />
          </View>
        </View>

        {/* Hint */}
        {game.movableTokenIds.length > 0 ? (
          <Animated.View entering={FadeIn.duration(200)}>
            <GlassSurface
              radius={radii.full}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: 8 }}
            >
              <Icon name="touch_app" size={14} color={faction.p1} />
              <Text variant="body-sm" color={role.onSurface} style={{ flex: 1 }}>
                {game.movableTokenIds.length === 1
                  ? 'Tap your glowing token to move it.'
                  : `${game.movableTokenIds.length} tokens can move — tap one.`}
              </Text>
            </GlassSurface>
          </Animated.View>
        ) : null}

        {/* Taunts */}
        <GlassSurface
          over="void"
          radius={radii.xxl}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.sm, paddingVertical: 6 }}
        >
          <Text variant="label-sm" color={role.onSurfaceVariant}>
            TAUNTS
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {liveMatch.taunts.map((t) => (
              <Pressable
                key={t.id}
                accessibilityRole="button"
                accessibilityLabel={t.label ?? `Send ${t.id}`}
                onPress={() => {
                  setReaction(t.glyph ?? t.label);
                  setTimeout(() => setReaction(null), 1100);
                }}
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
            accessibilityLabel="Restart match"
            onPress={game.restart}
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
            <Icon name="replay" size={20} color={faction.p2} />
            <Text variant="label-sm" color={role.onSurfaceVariant}>
              RESTART
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Roll dice"
            accessibilityState={{ disabled: !game.canRoll }}
            disabled={!game.canRoll}
            onPress={handleRoll}
            style={({ pressed }) => [
              {
                flex: 1,
                height: 64,
                borderRadius: radii.xxl,
                backgroundColor: game.canRoll ? faction.p1 : surface.containerHigh,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: spacing.lg,
                opacity: game.canRoll ? 1 : 0.6,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
              game.canRoll ? glow.primaryStrong : null,
            ]}
          >
            <View>
              <Text variant="label-lg" color={game.canRoll ? role.onPrimary : role.onSurfaceVariant}>
                {game.isFinished ? 'MATCH OVER' : game.canRoll ? 'ROLL DICE' : 'WAIT…'}
              </Text>
              <Text variant="label-sm" color={game.canRoll ? role.onPrimaryFixedVariant : role.outline}>
                {game.state.phase === Phase.awaitingMove ? 'PICK A TOKEN' : 'TAP TO ROLL'}
              </Text>
            </View>
            <Animated.View style={diceStyle}>
              <DiceFace
                value={game.state.roll ?? 6}
                color={game.canRoll ? faction.p1 : role.onSurfaceVariant}
              />
            </Animated.View>
          </Pressable>
        </View>
      </Screen>

      {/* Event toast — captures, extra turns, forfeits */}
      {game.toast || reaction ? (
        <View pointerEvents="none" style={{ position: 'absolute', bottom: 130, left: 0, right: 0, alignItems: 'center' }}>
          <Animated.View entering={FadeIn.duration(140)}>
            <GlassSurface
              over="containerHigh"
              radius={radii.full}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
            >
              <Text variant="headline-sm">{game.toast?.glyph ?? reaction}</Text>
              {game.toast ? (
                <Text variant="label-md" color={faction.p1}>
                  {game.toast.label}
                </Text>
              ) : null}
            </GlassSurface>
          </Animated.View>
        </View>
      ) : null}

      {/* Victory overlay */}
      {game.isFinished ? (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={{
            position: 'absolute',
            inset: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: withAlpha(surface.void, 0.88),
          }}
        >
          <GlassSurface over="containerHigh" style={{ padding: spacing.lg, alignItems: 'center', gap: spacing.sm, width: 280 }}>
            <Icon
              name={game.state.winner === 0 ? 'workspace_premium' : 'skull'}
              size={40}
              color={game.state.winner === 0 ? faction.p1 : faction.p3}
            />
            <Text variant="display-hero" color={role.tertiary} uppercase>
              {game.state.winner === 0 ? 'Victory' : 'Defeat'}
            </Text>
            <StatPill
              label={`${PLAYERS[game.state.winner].name} wins`}
              color={faction[PLAYERS[game.state.winner].faction]}
              tinted
            />
            <NeonButton label="See results" fullWidth onPress={() => router.push(`/match/${id}/results`)} />
            <NeonButton label="Play again" variant="glass" fullWidth onPress={game.restart} />
          </GlassSurface>
        </Animated.View>
      ) : null}
    </>
  );
}

export default MatchScreen;
