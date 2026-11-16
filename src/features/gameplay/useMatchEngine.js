/**
 * Binds @ludo/engine to the match screen.
 *
 * The engine is pure and knows nothing about React, so this hook is the only
 * place that turns engine events into things a player can see and feel —
 * haptics, animation triggers, reaction toasts.
 *
 * ── Where authority lives ───────────────────────────────────────────────────
 * Phase 4 runs the engine locally so the game is playable offline and against
 * CPU. In Phase 5 the SERVER becomes the authority: `roll()` stops generating
 * a value here and instead applies the one the server sends. The seam is
 * deliberate — `applyRoll` already accepts a forced value, so the change is
 * swapping where that value comes from, not restructuring this hook.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Phase,
  createGame,
  roll as engineRoll,
  move as engineMove,
  restart as engineRestart,
  chooseCpuMove,
  summarise,
} from '../../game/engine/engine.js';
import { useHaptics } from '../../hooks/useHaptics';
import { useSettingsStore } from '../../store/useSettingsStore';

/** How long a token takes to slide, and how long the dice tumbles. */
export const MOVE_MS = 420;
export const ROLL_MS = 620;
/** Pause before a CPU acts, so a turn is readable rather than instant. */
const CPU_THINK_MS = 700;

/**
 * `enabled: false` keeps the hook mounted but stops it driving the game.
 *
 * The match screen must call this hook and the online one unconditionally —
 * hooks cannot be called conditionally — so the unused one has to sit still.
 * Without this, an online match would have CPU timers firing against a local
 * game nobody is looking at.
 */
export function useMatchEngine({
  seats = [0, 1, 2, 3],
  humanSeats = [0],
  seed = 'local',
  enabled = true,
} = {}) {
  const haptics = useHaptics();
  const animationsEnabled = useSettingsStore((s) => s.animationsEnabled);

  const [state, setState] = useState(() => createGame({ seats, seed }));
  const [busy, setBusy] = useState(false);
  const [lastEvents, setLastEvents] = useState([]);
  const [toast, setToast] = useState(null);

  const timers = useRef([]);

  /**
   * Mirrors state for the timer callbacks, which would otherwise close over a
   * stale value. Synced in an effect rather than during render: writing a ref
   * while rendering is unsafe under concurrent rendering, and the effect runs
   * before any timer can fire.
   */
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    },
    []
  );

  const isHumanTurn = humanSeats.includes(state.turn) && state.phase !== Phase.finished;

  /** Turns engine events into feedback. The engine stays unaware of any of it. */
  const react = useCallback(
    (events) => {
      setLastEvents(events);

      for (const e of events) {
        switch (e.type) {
          case 'rolled':
            haptics.medium();
            break;
          case 'captured':
            haptics.error();
            setToast({ glyph: '💀', label: 'KNOCKED OUT' });
            break;
          case 'home':
            haptics.success();
            setToast({ glyph: '🏁', label: 'TOKEN HOME' });
            break;
          case 'extraTurn':
            setToast({ glyph: '🔥', label: 'ROLL AGAIN' });
            break;
          case 'forfeit':
            haptics.warning();
            setToast({ glyph: '😭', label: 'THREE SIXES — TURN LOST' });
            break;
          case 'noMoves':
            setToast({ glyph: '⛔', label: 'NO LEGAL MOVE' });
            break;
          case 'won':
            haptics.success();
            break;
          default:
            break;
        }
      }

      if (events.some((e) => ['captured', 'home', 'extraTurn', 'forfeit', 'noMoves'].includes(e.type))) {
        schedule(() => setToast(null), 1400);
      }
    },
    [haptics, schedule]
  );

  const applyRoll = useCallback(
    (forcedValue) => {
      const current = stateRef.current;
      if (current.phase !== Phase.awaitingRoll || busy) return;

      setBusy(true);
      // Let the dice finish tumbling before the result lands, so the number
      // does not change under the animation.
      const delay = animationsEnabled ? ROLL_MS : 0;

      schedule(() => {
        const result = engineRoll(stateRef.current, { forcedValue });
        setState(result.state);
        react(result.events);
        setBusy(false);
      }, delay);
    },
    [busy, animationsEnabled, schedule, react]
  );

  const applyMove = useCallback(
    (tokenId) => {
      const current = stateRef.current;
      if (current.phase !== Phase.awaitingMove || busy) return;

      const legal = current.legalMoves.some((m) => m.tokenId === tokenId);
      if (!legal) {
        haptics.warning();
        return;
      }

      setBusy(true);
      haptics.light();

      const result = engineMove(current, tokenId);
      setState(result.state);
      react(result.events);

      // Hold `busy` for the slide so a double tap cannot queue two moves.
      schedule(() => setBusy(false), animationsEnabled ? MOVE_MS : 0);
    },
    [busy, haptics, animationsEnabled, schedule, react]
  );

  const restart = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setToast(null);
    setLastEvents([]);
    setBusy(false);
    setState((s) => engineRestart(s));
  }, []);

  /**
   * Drives CPU seats.
   *
   * Runs off state changes rather than a loop, so it cannot get ahead of the
   * animations or fire twice for one turn.
   */
  useEffect(() => {
    if (!enabled) return undefined;
    if (busy) return undefined;
    if (state.phase === Phase.finished) return undefined;
    if (humanSeats.includes(state.turn)) return undefined;

    const id = setTimeout(() => {
      const current = stateRef.current;
      if (current.phase === Phase.awaitingRoll) {
        applyRoll();
      } else if (current.phase === Phase.awaitingMove) {
        const tokenId = chooseCpuMove(current);
        if (tokenId) applyMove(tokenId);
      }
    }, CPU_THINK_MS);

    timers.current.push(id);
    return () => clearTimeout(id);
  }, [enabled, state, busy, humanSeats, applyRoll, applyMove]);

  /** Token ids the human may tap right now. */
  const movableTokenIds =
    isHumanTurn && state.phase === Phase.awaitingMove
      ? state.legalMoves.map((m) => m.tokenId)
      : [];

  return {
    state,
    busy,
    toast,
    lastEvents,
    isHumanTurn,
    movableTokenIds,
    canRoll: isHumanTurn && state.phase === Phase.awaitingRoll && !busy,
    isFinished: state.phase === Phase.finished,
    standings: summarise(state),
    roll: applyRoll,
    move: applyMove,
    restart,
  };
}

export default useMatchEngine;
