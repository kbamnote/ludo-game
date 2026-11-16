/**
 * Realtime client — the only place the app talks to Colyseus.
 *
 * ── What this file refuses to do ────────────────────────────────────────────
 * It never sends a dice value. The server rolls; the client asks. Every message
 * here is an intention ("roll", "move this token"), and the server is free to
 * ignore any of them. A client that could name its own roll is a client that
 * can cheat, so the capability does not exist on this side of the wire.
 *
 * It also holds no rules. The engine in src/game/engine predicts what the UI
 * should show, but the server's state always wins — if the two disagree, the
 * server is right and the prediction is discarded.
 *
 * ── Why the token is set before every join ──────────────────────────────────
 * `session.js` can mint a new token at any time (expiry, a 401 retry). Reading
 * it once at module load would pin the first token forever and every later join
 * would fail with AUTH_FAILED long after the app had a valid one.
 */
import { Client, ErrorCode } from '@colyseus/sdk';
import { API_BASE, REALTIME_URL } from './apiBase';
import { authHeaders, getAccessToken, clearToken } from './session';
import { secureStorage } from './storage';

export const ROOM_LUDO = 'ludo';
export const ROOM_LUDO_PRIVATE = 'ludo_private';

/** A seat credential, so it belongs with the auth material, not in AsyncStorage. */
const RECONNECT_KEY = 'lad.match.reconnect';

let client = null;

function getClient() {
  if (!client) client = new Client(REALTIME_URL);
  return client;
}

export class RealtimeError extends Error {
  constructor(message, { code } = {}) {
    super(message);
    this.name = 'RealtimeError';
    this.code = code;
  }
}

/**
 * Turns a Colyseus failure into something worth showing a player.
 *
 * The SDK's own messages are accurate and unusable ("seat reservation
 * expired"). Each of these maps to an action the player can actually take.
 */
function describe(error) {
  const code = error?.code;

  switch (code) {
    case ErrorCode.MATCHMAKE_INVALID_CRITERIA:
    case ErrorCode.MATCHMAKE_INVALID_ROOM_ID:
      return 'That room code is not valid any more.';
    case ErrorCode.MATCHMAKE_NO_HANDLER:
      return 'This version of the app cannot join that match. Try updating.';
    case ErrorCode.MATCHMAKE_EXPIRED:
      return 'That match filled up. Finding you another.';
    case ErrorCode.AUTH_FAILED:
      return 'Your session expired. Signing you back in.';
    default:
      // A room that throws (full, already started) surfaces its own message,
      // and LudoRoom writes those for players to read.
      if (typeof error?.message === 'string' && error.message && !/^\d+$/.test(error.message)) {
        return error.message;
      }
      return 'Could not join a match. Check your connection and try again.';
  }
}

/**
 * Runs a join, refreshing the token once if the server rejected it.
 *
 * Retried exactly once: the device id is what really authenticates, so a
 * rejected token is recoverable, but a device the server keeps refusing would
 * otherwise retry forever.
 */
async function withAuth(join, { name, retried = false } = {}) {
  const colyseus = getClient();
  colyseus.auth.token = await getAccessToken({ name });

  try {
    return await join(colyseus);
  } catch (error) {
    if (!retried && error?.code === ErrorCode.AUTH_FAILED) {
      await clearToken();
      return withAuth(join, { name, retried: true });
    }
    throw new RealtimeError(describe(error), { code: error?.code });
  }
}

/** Quick match. Colyseus fills an open room before creating one. */
export function joinQuickMatch({ name, entryFee = 0 } = {}) {
  return withAuth((colyseus) => colyseus.joinOrCreate(ROOM_LUDO, { entryFee }), { name });
}

/**
 * Creates a private match and returns `{ room, roomCode }`.
 *
 * The code comes from the server rather than being generated here, so two
 * players on two devices cannot mint the same code, and the server already
 * knows which codes are live.
 */
export async function createPrivateMatch({ name, entryFee = 0, maxPlayers = 4 } = {}) {
  const response = await fetch(`${API_BASE}/v1/matches/private`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(await authHeaders({ name })) },
    body: JSON.stringify({ entryFee, maxPlayers }),
  }).catch(() => null);

  if (!response?.ok) {
    throw new RealtimeError('Could not create a private match. Please try again.');
  }

  const match = await response.json();
  const room = await withAuth(
    (colyseus) =>
      colyseus.joinOrCreate(ROOM_LUDO_PRIVATE, {
        roomCode: match.roomCode,
        entryFee: match.entryFee,
        maxPlayers: match.maxPlayers,
        // No fifteen-second auto-start here. The whole point of a code is the
        // friend who is still finding their phone; starting without them would
        // make every invite pointless. The host starts it when ready.
        autoStart: false,
      }),
    { name }
  );

  return { room, roomCode: match.roomCode };
}

/**
 * Joins an existing private match by code.
 *
 * `join`, never `joinOrCreate`: a typo in a code must fail, not silently open a
 * brand new empty room that the player then sits alone in wondering where
 * their friends are.
 */
export async function joinPrivateMatch({ name, code } = {}) {
  // `async` so a bad code REJECTS rather than throwing synchronously. A
  // function that does both forces every caller to write try/catch and
  // .catch(), and whichever one they forget is the one that crashes.
  const roomCode = String(code ?? '').trim().toUpperCase();
  if (roomCode.length !== 4) {
    throw new RealtimeError('A room code is four characters.');
  }

  return withAuth((colyseus) => colyseus.join(ROOM_LUDO_PRIVATE, { roomCode }), { name });
}

/* ── Reconnection ─────────────────────────────────────────────────────────── */

/**
 * Remembers the seat so a cold start can resume it.
 *
 * The SDK reconnects a live socket by itself; this covers the case it cannot —
 * the app process being killed and relaunched inside the server's reconnection
 * window, which on mobile is an ordinary thing to happen mid-match.
 */
export async function rememberSeat(room) {
  if (!room?.reconnectionToken) return;
  await secureStorage.set(
    RECONNECT_KEY,
    JSON.stringify({ token: room.reconnectionToken, at: Date.now() })
  );
}

export async function forgetSeat() {
  await secureStorage.remove(RECONNECT_KEY);
}

/**
 * Resumes a remembered seat, or resolves null when there is nothing to resume.
 *
 * `maxAgeMs` is shorter than the server's own 60s window so the app does not
 * present a reservation the server has already given to a bot.
 */
export async function resumeSeat({ maxAgeMs = 55_000 } = {}) {
  const raw = await secureStorage.get(RECONNECT_KEY);
  if (!raw) return null;

  let saved = null;
  try {
    saved = JSON.parse(raw);
  } catch {
    saved = null;
  }

  if (!saved?.token || Date.now() - (saved.at ?? 0) > maxAgeMs) {
    await forgetSeat();
    return null;
  }

  try {
    return await getClient().reconnect(saved.token);
  } catch {
    // The seat is gone — a bot has it, or the match ended. Not an error worth
    // showing: the player simply lands back in the lobby.
    await forgetSeat();
    return null;
  }
}

export default {
  joinQuickMatch,
  createPrivateMatch,
  joinPrivateMatch,
  rememberSeat,
  resumeSeat,
  forgetSeat,
};
