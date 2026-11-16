/**
 * Session tests.
 *
 * Guest identity is the one piece of state whose loss is permanent: lose the
 * device id and the account, its avatars and its progression are orphaned with
 * no way back. These tests cover the three ways that happens.
 */
import * as SecureStore from 'expo-secure-store';

const DEVICE_KEY = 'lad.auth.device';
const TOKEN_KEY = 'lad.auth.access';

/** A stand-in keychain, so writes are actually readable back. */
function useFakeKeychain(initial = {}) {
  const store = { ...initial };
  SecureStore.getItemAsync.mockImplementation(async (key) => store[key] ?? null);
  SecureStore.setItemAsync.mockImplementation(async (key, value) => {
    store[key] = value;
  });
  SecureStore.deleteItemAsync.mockImplementation(async (key) => {
    delete store[key];
  });
  return store;
}

function loadSession() {
  let mod;
  jest.isolateModules(() => {
    // Fresh module each time: session.js caches the token in memory.
    mod = require('../src/services/session');
  });
  return mod;
}

describe('guest session', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('signs in without a device id on a first run', async () => {
    useFakeKeychain();
    let sent = null;
    global.fetch = jest.fn(async (_url, init) => {
      sent = JSON.parse(init.body);
      return {
        ok: true,
        status: 201,
        text: async () =>
          JSON.stringify({ accessToken: 'tok_1', deviceId: 'd_server_minted', user: {} }),
      };
    });

    const session = loadSession();
    await session.signIn({ name: 'Nova' });

    // No device id is the point: generating one here would need a native
    // crypto module, which is what broke the app in Expo Go.
    expect('deviceId' in sent).toBe(false);
    expect(sent.name).toBe('Nova');
  });

  it('stores the device id the server minted, before the token', async () => {
    useFakeKeychain();
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 201,
      text: async () =>
        JSON.stringify({ accessToken: 'tok_1', deviceId: 'd_server_minted', user: {} }),
    }));

    const session = loadSession();
    await session.signIn();

    const keysWritten = SecureStore.setItemAsync.mock.calls.map(([key]) => key);
    expect(keysWritten).toEqual([DEVICE_KEY, TOKEN_KEY]);

    // Killed between the two writes, the next run must still know who it is.
    // Token-first would mint a second account and orphan the first.
    expect(keysWritten.indexOf(DEVICE_KEY)).toBeLessThan(keysWritten.indexOf(TOKEN_KEY));
    await expect(session.getDeviceId()).resolves.toBe('d_server_minted');
  });

  it('sends the stored device id on later sign-ins', async () => {
    useFakeKeychain({ [DEVICE_KEY]: 'd_known' });
    let sent = null;
    global.fetch = jest.fn(async (_url, init) => {
      sent = JSON.parse(init.body);
      return {
        ok: true,
        status: 201,
        text: async () => JSON.stringify({ accessToken: 'tok_2', deviceId: 'd_known', user: {} }),
      };
    });

    const session = loadSession();
    await session.signIn();

    expect(sent.deviceId).toBe('d_known');
    // Already stored and unchanged, so it is not rewritten.
    expect(SecureStore.setItemAsync.mock.calls.map(([key]) => key)).toEqual([TOKEN_KEY]);
  });

  it('mints one account when several callers sign in at once', async () => {
    useFakeKeychain();
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 201,
      text: async () => JSON.stringify({ accessToken: 'tok_1', deviceId: 'd_one', user: {} }),
    }));

    const session = loadSession();
    // The lobby, the profile header and the avatar list all want a token on a
    // cold start. Three sign-ins would be three users for one device.
    await Promise.all([
      session.getAccessToken(),
      session.getAccessToken(),
      session.getAccessToken(),
    ]);

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('reuses a stored token without signing in again', async () => {
    useFakeKeychain({ [DEVICE_KEY]: 'd_known', [TOKEN_KEY]: 'tok_stored' });
    global.fetch = jest.fn();

    const session = loadSession();
    await expect(session.getAccessToken()).resolves.toBe('tok_stored');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('keeps the device id when the token is cleared, and forgets it on sign-out', async () => {
    const store = useFakeKeychain({ [DEVICE_KEY]: 'd_known', [TOKEN_KEY]: 'tok_stored' });
    const session = loadSession();

    // A 401 drops the token only: the account must survive, since the device
    // id is what re-identifies it.
    await session.clearToken();
    expect(store[TOKEN_KEY]).toBeUndefined();
    expect(store[DEVICE_KEY]).toBe('d_known');

    await session.forgetDevice();
    expect(store[DEVICE_KEY]).toBeUndefined();
  });

  it('reports an unreachable server in words a player can act on', async () => {
    useFakeKeychain();
    global.fetch = jest.fn(async () => {
      throw new TypeError('Network request failed');
    });

    const session = loadSession();
    await expect(session.signIn()).rejects.toThrow(/Could not reach the server/);
  });
});
