/**
 * InteractiveBoard — the Skia board plus a touch layer.
 *
 * Skia draws into a canvas, which has no per-shape hit testing, so taps are
 * handled by transparent Pressables positioned over each movable token. Only
 * movable tokens get one, so a tap can never select a piece that has no legal
 * move — the rule is enforced by what exists, not by a check in a handler.
 *
 * Token positions animate between progress values here rather than in the
 * engine: the engine reports where a token IS, and this decides how it gets
 * there.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

import { LudoBoard } from './LudoBoard';
import { BoardFallback } from './BoardFallback';
import { isSkiaReady } from './skiaAvailable';
import { GRID, HOME, IN_HOUSE, PLAYERS, TRACK, TRACK_LENGTH } from '../engine/board.js';
import { cellCenter, houseSlotCenter } from './geometry';
import { faction } from '../../theme/colors';
import { useSettingsStore } from '../../store/useSettingsStore';
import { MOVE_MS } from '../../features/gameplay/useMatchEngine';

/** Pixel centre for a token at a given progress. */
function centreFor(seat, progress, slot, size) {
  const player = PLAYERS[seat];

  if (progress <= IN_HOUSE) {
    const s = houseSlotCenter(player, slot, size);
    return { cx: s.cx, cy: s.cy };
  }
  if (progress >= HOME) {
    return cellCenter({ x: 7, y: 7 }, size);
  }
  if (progress < TRACK_LENGTH) {
    const index = (player.entryIndex + Math.round(progress)) % TRACK_LENGTH;
    return cellCenter(TRACK[index], size);
  }
  const cell = player.homeColumn[Math.min(4, Math.round(progress) - TRACK_LENGTH)];
  return cellCenter(cell, size);
}

/** A pulsing ring over a token the player may move. */
function MovableHalo({ x, y, size, color, enabled }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.9);

  useEffect(() => {
    if (!enabled) {
      cancelAnimation(scale);
      cancelAnimation(opacity);
      scale.value = 1;
      opacity.value = 0.9;
      return undefined;
    }
    scale.value = withRepeat(
      withSequence(
        withTiming(1.25, { duration: 620, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 0 })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 620, easing: Easing.out(Easing.quad) }),
        withTiming(0.9, { duration: 0 })
      ),
      -1,
      false
    );
    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
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
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: color,
        },
        style,
      ]}
    />
  );
}

/** Transparent tap target that follows its token as it slides. */
function TokenTouch({ token, size, movable, onPress }) {
  const animationsEnabled = useSettingsStore((s) => s.animationsEnabled);
  const unit = size / GRID;
  const target = centreFor(token.seat, token.progress, token.slot, size);

  const x = useSharedValue(target.cx);
  const y = useSharedValue(target.cy);
  const previous = useRef(token.progress);

  useEffect(() => {
    const next = centreFor(token.seat, token.progress, token.slot, size);
    const jumped = Math.abs(token.progress - previous.current) > 1;
    previous.current = token.progress;

    const duration = animationsEnabled ? MOVE_MS : 0;
    // A capture teleports the token home; sliding it across the board would
    // read as a legal move rather than a knockout.
    const ease = jumped ? Easing.out(Easing.cubic) : Easing.inOut(Easing.quad);

    x.value = withTiming(next.cx, { duration, easing: ease });
    y.value = withTiming(next.cy, { duration, easing: ease });
  }, [token.progress, token.seat, token.slot, size, animationsEnabled, x, y]);

  const style = useAnimatedStyle(() => ({
    left: x.value - unit * 0.5,
    top: y.value - unit * 0.5,
  }));

  if (!movable) return null;

  return (
    <>
      <MovableHalo
        x={target.cx}
        y={target.cy}
        size={unit * 1.1}
        color={faction[PLAYERS[token.seat].faction]}
        enabled={animationsEnabled}
      />
      <Animated.View style={[{ position: 'absolute', width: unit, height: unit }, style]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Move token ${token.slot + 1}`}
          onPress={() => onPress(token.id)}
          // Tokens are ~24pt on a 380pt board, well under the 48pt target.
          hitSlop={Math.max(0, (48 - unit) / 2)}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </>
  );
}

export function InteractiveBoard({ size, tokens, movableTokenIds = [], threatIndex, onSelectToken }) {
  const movable = useMemo(() => new Set(movableTokenIds), [movableTokenIds]);

  /**
   * Skia is absent in Expo Go and not yet live on web, and the board is the
   * core screen — it has to render in every target. Checked once per mount
   * rather than per render; the backend does not appear mid-session.
   */
  const skiaReady = useMemo(() => isSkiaReady(), []);
  const Board = skiaReady ? LudoBoard : BoardFallback;

  // Animate the drawn tokens by feeding the canvas interpolated progress.
  // Skia redraws on every prop change, so this stays a single draw call.
  const [drawn, setDrawn] = useState(tokens);
  const animationsEnabled = useSettingsStore((s) => s.animationsEnabled);

  useEffect(() => {
    if (!animationsEnabled) return undefined;

    const from = drawn;
    const start = Date.now();
    let frame;

    const step = () => {
      const t = Math.min(1, (Date.now() - start) / MOVE_MS);
      const eased = 1 - (1 - t) * (1 - t);

      setDrawn(
        tokens.map((token) => {
          const before = from.find((d) => d.id === token.id);
          if (!before || before.progress === token.progress) return token;
          // A knockout snaps rather than sliding backwards across the board.
          if (token.progress === IN_HOUSE) return t > 0.4 ? token : before;
          return {
            ...token,
            progress: before.progress + (token.progress - before.progress) * eased,
          };
        })
      );

      if (t < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // `drawn` is intentionally not a dependency: including it would restart
    // the animation on every frame it sets.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens, animationsEnabled]);

  return (
    <View style={{ width: size, height: size }}>
      <Board
        size={size}
        tokens={animationsEnabled ? drawn : tokens}
        highlighted={movableTokenIds}
        threatIndex={threatIndex}
      />

      <View style={{ position: 'absolute', inset: 0 }}>
        {tokens.map((token) => (
          <TokenTouch
            key={token.id}
            token={token}
            size={size}
            movable={movable.has(token.id)}
            onPress={onSelectToken}
          />
        ))}
      </View>
    </View>
  );
}

export default InteractiveBoard;
