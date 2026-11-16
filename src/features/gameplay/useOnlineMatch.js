/**
 * Binds a Colyseus room to the match screen.
 *
 * ── Why this returns the same shape as useMatchEngine ───────────────────────
 * The board, the dice and the HUD already render an engine state. This hook
 * projects the server's view into that exact shape, so online play reuses the
 * renderer rather than forking it. Two board renderers that must agree about
 * geometry would drift, and the bug would look like "tokens are in the wrong
 * place online" long after the cause was forgotten.
 *
 * ── Where authority lives ───────────────────────────────────────────────────
 * Entirely on the server. `roll()` here sends the word "roll" and nothing else;
 * the value arrives in the next state patch. There is no local prediction of
 * the dice, because a predicted roll that the server contradicts is worse than
 * a 200ms wait: the player watches the number change under their thumb.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Phase, summarise } from '../../game/engine/engine.js';
import { useHaptics } from '../../hooks/useHaptics';
import {
  joinQuickMatch,
  createPrivateMatch,
  joinPrivateMatch,
  rememberSeat,
  forgetSeat,
} from '../../services/realtime';

export const ConnectionStatus = {
  connecting: 'connecting',
  lobby: 'lobby',
  playing: 'playing',
  finished: 'finished',
  error: 'error',
};

/**
 * How long a sent intention keeps the controls disabled.
 *
 * The server's reply clears `busy` normally; this only covers the case where no
 * reply arrives at all. Without it a dropped packet would leave the player
 * staring at a dead dice button for the rest of the match.
 */
const ACK_TIMEOUT_MS = 2500;

/**
 * The server's state, in the shape the board already knows how to draw.
 *
 * Exported because it is the single highest-risk function in online play and
 * pure enough to pin down: get a field wrong here and tokens render in the
 * wrong places, which looks like a board bug and is not one.
 */
export function project(view) {
  const players = Array.from(view.players?.values?.() ?? []);
  const ranking = Array.from(view.ranking ?? []);

  return {
    seats: players.map((p) => p.seat).sort((a, b) => a - b),
    tokens: Array.from(view.tokens ?? []).map((t) => ({
      id: t.id,
      seat: t.seat,
      slot: t.slot,
      progress: t.progress,
    })),
    turn: view.turn ?? 0,
    phase: view.turnPhase ?? Phase.awaitingRoll,
    roll: view.roll || null,
    legalMoves: Array.from(view.legalTokenIds ?? []).map((tokenId) => ({ tokenId })),
    ranking,
    // Server-owned and deliberately not mirrored: the client has no business
    // knowing the RNG state, and nothing it renders depends on these.
    consecutiveSixes: 0,
    rngState: 0,
    rollCount: 0,
    winner: view.phase === 'finished' ? (ranking[0] ?? null) : null,
  };
}

/** The lobby/scoreboard view of who is in the match. */
function readPlayers(view) {
  return Array.from(view.players?.values?.() ?? [])
    .map((p) => ({
      userId: p.userId,
      name: p.name,
      seat: p.seat,
      connected: p.connected,
      ready: p.ready,
      bot: p.bot,
      tokensHome: p.tokensHome,
      isHost: p.isHost,
    }))
    .sort((a, b) => a.seat - b.seat);
}

export function useOnlineMatch({ mode = 'quick', code, entryFee = 0, name, enabled = true } = {}) {
  const haptics = useHaptics();

  const [status, setStatus] = useState(ConnectionStatus.connecting);
  const [error, setError] = useState(null);
  const [state, setState] = useState(null);
  const [players, setPlayers] = useState([]);
  const [mySeat, setMySeat] = useState(null);
  const [roomCode, setRoomCode] = useState(code ?? null);
  const [turnDeadline, setTurnDeadline] = useState(0);
  const [pot, setPot] = useState(0);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [lastEvents, setLastEvents] = useState([]);
  const [notice, setNotice] = useState(null);

  const roomRef = useRef(null);
  const timers = useRef([]);

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

  /**
   * Turns server events into feedback.
   *
   * Identical vocabulary to the offline hook on purpose: the same roll feels
   * the same whether the dice was rolled here or on a server in another
   * country.
   */
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

      if (
        events.some((e) =>
          ['captured', 'home', 'extraTurn', 'forfeit', 'noMoves'].includes(e.type)
        )
      ) {
        schedule(() => setToast(null), 1400);
      }
    },
    [haptics, schedule]
  );

  /* ── Connect ───────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;
    const unsubscribes = [];

    async function connect() {
      try {
        let room;
        if (mode === 'create') {
          const created = await createPrivateMatch({ name, entryFee });
          room = created.room;
          if (!cancelled) setRoomCode(created.roomCode);
        } else if (mode === 'join') {
          room = await joinPrivateMatch({ name, code });
        } else {
          room = await joinQuickMatch({ name, entryFee });
        }

        // Nothing below must touch a room the screen has already left.
        if (cancelled) {
          room.leave(true);
          return;
        }

        roomRef.current = room;
        rememberSeat(room);

        /**
         * Registers a listener and returns a real unsubscribe.
         *
         * The SDK is not consistent here: `onMessage` hands back a function,
         * while `onStateChange` and `onLeave` hand back the emitter itself and
         * expect `remove(callback)`. Treating the emitter as a function would
         * leave every state listener attached for the life of the app, so each
         * abandoned match would keep calling setState on an unmounted screen.
         */
        const bind = (signal, callback) => {
          const handle = signal(callback);
          if (typeof handle === 'function') return handle;
          if (handle && typeof handle.remove === 'function') return () => handle.remove(callback);
          return () => {};
        };

        const track = (off) => {
          if (typeof off === 'function') unsubscribes.push(off);
        };

        track(
          bind(room.onStateChange, (view) => {
            setState(project(view));
            setPlayers(readPlayers(view));
            setTurnDeadline(view.turnDeadline ?? 0);
            setPot(view.pot ?? 0);
            setRoomCode((current) => view.roomCode || current);

            const me = view.players?.get?.(room.sessionId);
            if (me) setMySeat(me.seat);

            if (view.phase === 'finished') setStatus(ConnectionStatus.finished);
            else if (view.phase === 'playing') setStatus(ConnectionStatus.playing);
            else setStatus(ConnectionStatus.lobby);

            // The server has spoken, so whatever was sent has been resolved.
            setBusy(false);
          })
        );

        track(bind(room.onMessage.bind(room, 'event'), (event) => react([event])));

        track(
          bind(room.onMessage.bind(room, 'system'), (message) => {
            switch (message?.type) {
              case 'joined':
                setNotice(`${message.name} joined`);
                break;
              case 'dropped':
                setNotice(`${message.name} lost connection`);
                break;
              case 'rejoined':
                setNotice(`${message.name} is back`);
                break;
              case 'left':
                setNotice(`${message.name} left — a bot is playing their seat`);
                break;
              case 'turnTimeout':
                setNotice('Out of time');
                break;
              default:
                return;
            }
            schedule(() => setNotice(null), 2200);
          })
        );

        track(
          bind(room.onLeave, () => {
            forgetSeat();
            roomRef.current = null;
          })
        );

        track(
          bind(room.onError, (codeOrMessage, message) => {
            setError(message ?? 'The match ended unexpectedly.');
            setStatus(ConnectionStatus.error);
          })
        );
      } catch (err) {
        if (cancelled) return;
        setError(err?.message ?? 'Could not join a match.');
        setStatus(ConnectionStatus.error);
      }
    }

    connect();

    return () => {
      cancelled = true;
      unsubscribes.forEach((off) => {
        try {
          off();
        } catch {
          // An already-torn-down listener is not a problem worth reporting.
        }
      });
      // Consented leave: the player navigated away, so do not make three other
      // people wait out a 60-second reconnection window for them.
      roomRef.current?.leave(true);
      roomRef.current = null;
      forgetSeat();
    };
  }, [enabled, mode, code, entryFee, name, react, schedule]);

  /* ── Intentions ────────────────────────────────────────────────────────── */

  const isMyTurn = state != null && mySeat != null && state.turn === mySeat;

  const send = useCallback(
    (type, payload) => {
      const room = roomRef.current;
      if (!room) return;

      setBusy(true);
      room.send(type, payload);
      schedule(() => setBusy(false), ACK_TIMEOUT_MS);
    },
    [schedule]
  );

  const roll = useCallback(() => {
    if (!isMyTurn || busy || state?.phase !== Phase.awaitingRoll) return;
    haptics.light();
    send('roll');
  }, [isMyTurn, busy, state?.phase, haptics, send]);

  const move = useCallback(
    (tokenId) => {
      if (!isMyTurn || busy || state?.phase !== Phase.awaitingMove) return;

      // A tap the server would reject gets a buzz here instead of a round trip.
      if (!state.legalMoves.some((m) => m.tokenId === tokenId)) {
        haptics.warning();
        return;
      }

      haptics.light();
      send('move', { tokenId });
    },
    [isMyTurn, busy, state, haptics, send]
  );

  const ready = useCallback(() => {
    haptics.light();
    roomRef.current?.send('ready');
  }, [haptics]);

  /**
   * Host-only: start a private match without waiting for more players.
   * The server checks this too — this only decides whether to show the button.
   */
  const startNow = useCallback(() => {
    haptics.medium();
    roomRef.current?.send('start');
  }, [haptics]);

  const emote = useCallback((id) => {
    roomRef.current?.send('emote', { id });
  }, []);

  const leave = useCallback(() => {
    roomRef.current?.leave(true);
    roomRef.current = null;
    forgetSeat();
  }, []);

  const standings = useMemo(() => (state ? summarise(state) : []), [state]);

  const movableTokenIds =
    isMyTurn && !busy && state?.phase === Phase.awaitingMove
      ? state.legalMoves.map((m) => m.tokenId)
      : [];

  return {
    // Same contract as useMatchEngine, so the match screen can hold either.
    state,
    busy,
    toast,
    lastEvents,
    isHumanTurn: isMyTurn,
    movableTokenIds,
    canRoll: isMyTurn && !busy && state?.phase === Phase.awaitingRoll,
    isFinished: status === ConnectionStatus.finished,
    standings,
    roll,
    move,
    restart: null, // Nobody restarts a multiplayer match; they leave and queue again.

    // Online-only additions.
    online: true,
    status,
    error,
    notice,
    players,
    mySeat,
    roomCode,
    turnDeadline,
    pot,
    isHost: players.find((p) => p.seat === mySeat)?.isHost ?? false,
    startNow,
    ready,
    emote,
    leave,
  };
}

export default useOnlineMatch;
