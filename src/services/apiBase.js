/**
 * Where the server is.
 *
 * Its own module because both the REST client and the realtime client need it,
 * and `session.js` sits between them — importing it from `avatarApi.js` would
 * make that a cycle.
 */
import { Platform } from 'react-native';

/**
 * Dev default points at the host machine. 10.0.2.2 is the Android emulator's
 * alias for the host; a physical device needs the LAN IP, which is why this is
 * configurable rather than hardcoded.
 *
 * Set EXPO_PUBLIC_API_URL to the deployed server to run against it, e.g.
 * https://<project>.up.railway.app
 */
const DEFAULT_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_BASE;

/**
 * The Colyseus endpoint, derived from API_BASE rather than configured
 * separately.
 *
 * The server attaches Colyseus to the same HTTP server as the REST API, so the
 * two always share an origin. Deriving the URL here means a deploy cannot end
 * up with the API pointing at production and the socket at localhost — and
 * `https` must become `wss`, or the socket is blocked as mixed content and
 * fails with no useful error.
 */
export const REALTIME_URL = API_BASE.replace(/^http/, 'ws');

export default { API_BASE, REALTIME_URL };
