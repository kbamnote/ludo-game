/**
 * Session — the app's single source of auth material.
 *
 * ── What replaced what ──────────────────────────────────────────────────────
 * Phases 3–4 identified the user with an `x-user-id` header, which the server
 * deliberately refuses when NODE_ENV=production. That is why the deployed
 * avatar routes answered 401. Identity now comes from a token the server
 * minted and can verify, and this module is the only place that holds one.
 *
 * ── Why the device id comes from the server ─────────────────────────────────
 * Guest sign-in is "whoever presents this device id is this account", which
 * makes the id equivalent to a password. It therefore has to be unguessable,
 * and generating cryptographic randomness on React Native means a native
 * module (`expo-crypto`) — which fails outright in Expo Go and in any dev
 * client built before that module was added, taking every screen that imports
 * this file down with it.
 *
 * So the server mints it: `POST /v1/auth/guest` with no `deviceId` returns
 * one, generated with `node:crypto`. This app's job is to keep it, in
 * hardware-backed secure storage and never in AsyncStorage, and send it back
 * on every later sign-in.
 *
 * ── Why sign-in is de-duplicated ────────────────────────────────────────────
 * On a cold start the lobby, the profile header and the avatar list all want a
 * token at once. Three parallel sign-ins would mint three users for one
 * device, so concurrent callers share one in-flight promise.
 */
import { secureStorage, SECURE_KEYS } from './storage';
import { API_BASE } from './apiBase';

const DEVICE_KEY = 'lad.auth.device';

/** In-memory cache so the common path does not hit the keychain every request. */
let cachedToken = null;
/** Shared by concurrent callers; see the note above. */
let signInPromise = null;

export class SessionError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.name = 'SessionError';
    this.status = status;
    this.code = code;
  }
}

/**
 * The stable, secret id for this install, or null before the first sign-in.
 *
 * Null is the normal first-run state, not an error: sign-in with no id asks
 * the server for one. Losing it means losing the guest account, which is
 * exactly why guests are offered an upgrade to a real account later.
 */
export async function getDeviceId() {
  return secureStorage.get(DEVICE_KEY);
}

/**
 * Exchanges the device id for a bearer token.
 *
 * `name` is the display name other players see. It is sent on sign-in rather
 * than derived server-side so the name in a match matches the one in the
 * profile the player actually set.
 */
async function requestToken(name) {
  const deviceId = await getDeviceId();

  let response;
  try {
    response = await fetch(`${API_BASE}/v1/auth/guest`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      // No deviceId on a first run; the server mints one and returns it.
      body: JSON.stringify(deviceId ? { deviceId, name } : { name }),
    });
  } catch {
    throw new SessionError('Could not reach the server. Check your connection and try again.', {
      code: 'network',
    });
  }

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.accessToken) {
    throw new SessionError(payload?.message ?? 'Could not sign in. Please try again.', {
      status: response.status,
      code: payload?.error,
    });
  }

  /*
   * Store the device id BEFORE the token.
   *
   * If the write order were reversed and the app were killed in between, the
   * next run would have a token but no device id — and the sign-in after that
   * would mint a second account, silently orphaning the first along with its
   * avatars. The id is the thing that must survive.
   */
  if (payload.deviceId && payload.deviceId !== deviceId) {
    await secureStorage.set(DEVICE_KEY, payload.deviceId);
  }

  await secureStorage.set(SECURE_KEYS.accessToken, payload.accessToken);
  cachedToken = payload.accessToken;
  return payload;
}

/**
 * Signs in, reusing an in-flight request rather than starting a second one.
 * Returns `{ accessToken, user }`.
 */
export function signIn({ name = 'Player' } = {}) {
  if (!signInPromise) {
    signInPromise = requestToken(name).finally(() => {
      signInPromise = null;
    });
  }
  return signInPromise;
}

/**
 * The current bearer token, signing in if there is not one yet.
 *
 * Every authenticated call goes through here, so a player never sees a
 * "signed out" state they did not ask for.
 */
export async function getAccessToken({ name = 'Player' } = {}) {
  if (cachedToken) return cachedToken;

  const stored = await secureStorage.get(SECURE_KEYS.accessToken);
  if (stored) {
    cachedToken = stored;
    return stored;
  }

  const { accessToken } = await signIn({ name });
  return accessToken;
}

/** Authorization header for an authenticated request. */
export async function authHeaders(options) {
  return { authorization: `Bearer ${await getAccessToken(options)}` };
}

/**
 * Drops the token after the server has rejected it.
 *
 * Called on a 401 so the next request signs in again with the same device id,
 * which recovers silently from an expired or server-rotated token instead of
 * showing the player an error they cannot act on.
 */
export async function clearToken() {
  cachedToken = null;
  await secureStorage.remove(SECURE_KEYS.accessToken);
}

/** Full sign-out: forgets the account, not just the token. */
export async function forgetDevice() {
  await clearToken();
  await secureStorage.remove(DEVICE_KEY);
}

export default { getDeviceId, signIn, getAccessToken, authHeaders, clearToken, forgetDevice };
