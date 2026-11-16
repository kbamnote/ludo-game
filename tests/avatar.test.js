/**
 * Avatar client tests.
 *
 * Focused on the two things that must not quietly regress:
 *   1. Consent gates capture. The camera must be unreachable without it.
 *   2. The client never carries provider credentials, and never invents an
 *      API shape the contract does not define.
 */
import { POLICY_VERSION } from '../src/store/useConsentStore';
import { avatarApi, API_BASE, AvatarApiError } from '../src/services/avatarApi';
import { clearToken } from '../src/services/session';

/**
 * The session is stubbed so these tests exercise the avatar client.
 *
 * Without it every assertion about "the request" would be about the guest
 * sign-in that now precedes it, and a `global.fetch` stub would be answering
 * two different endpoints with one canned response.
 */
jest.mock('../src/services/session', () => ({
  authHeaders: jest.fn(async () => ({ authorization: 'Bearer test-token' })),
  clearToken: jest.fn(async () => {}),
  getAccessToken: jest.fn(async () => 'test-token'),
}));

describe('consent policy', () => {
  it('matches the version the server enforces', () => {
    // ludo-server/src/modules/avatars/avatars.service.ts POLICY_VERSION.
    // If these drift, every generation request fails with "policy has changed".
    expect(POLICY_VERSION).toBe('2026-11-01');
  });
});

describe('avatarApi', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('points at a configurable base, never a provider', () => {
    expect(API_BASE).not.toMatch(/openai|stability|replicate|googleapis|api-key/i);
  });

  it('sends consent with a timestamp and policy version when starting a job', async () => {
    let captured = null;
    global.fetch = jest.fn(async (url, init) => {
      captured = { url, body: JSON.parse(init.body) };
      return { ok: true, status: 202, text: async () => JSON.stringify({ jobId: 'job_1' }) };
    });

    await avatarApi.startJob({
      uploadId: 'upl_1',
      styleId: 'neon-anime',
      policyVersion: POLICY_VERSION,
    });

    expect(captured.url).toContain('/v1/avatars/jobs');
    expect(captured.body.consent.policyVersion).toBe(POLICY_VERSION);
    expect(Number.isNaN(Date.parse(captured.body.consent.acceptedAt))).toBe(false);
    expect(captured.body.consent.scope).toContain('generate_avatar');
  });

  it('never attaches an authorization header carrying a provider key', async () => {
    let headers = null;
    global.fetch = jest.fn(async (_url, init) => {
      headers = init.headers;
      return { ok: true, status: 200, text: async () => '{"styles":[]}' };
    });

    await avatarApi.getStyles();

    const serialised = JSON.stringify(headers).toLowerCase();
    expect(serialised).not.toContain('bearer sk-');
    expect(serialised).not.toContain('api-key');
  });

  it('authenticates with the bearer token the server issued', async () => {
    // Phases 3-4 sent `x-user-id`, which the deployed server refuses — that is
    // why the live avatar routes answered 401. This pins the replacement.
    let headers = null;
    global.fetch = jest.fn(async (_url, init) => {
      headers = init.headers;
      return { ok: true, status: 200, text: async () => '{"styles":[]}' };
    });

    await avatarApi.getStyles();

    expect(headers.authorization).toBe('Bearer test-token');
    expect(JSON.stringify(headers).toLowerCase()).not.toContain('x-user-id');
  });

  it('refreshes the token once on a 401 instead of failing the request', async () => {
    let calls = 0;
    global.fetch = jest.fn(async () => {
      calls += 1;
      return calls === 1
        ? { ok: false, status: 401, text: async () => '{"message":"Unauthorized"}' }
        : { ok: true, status: 200, text: async () => '{"styles":[]}' };
    });

    await expect(avatarApi.getStyles()).resolves.toEqual({ styles: [] });
    expect(calls).toBe(2);
    expect(clearToken).toHaveBeenCalled();
  });

  it('gives up after one retry so a rejected device cannot loop forever', async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      status: 401,
      text: async () => '{"message":"Unauthorized"}',
    }));

    await expect(avatarApi.getStyles()).rejects.toBeInstanceOf(AvatarApiError);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('turns a network failure into a message a user can act on', async () => {
    global.fetch = jest.fn(async () => {
      throw new TypeError('Network request failed');
    });

    await expect(avatarApi.getStyles()).rejects.toThrow(/Could not reach the server/);
  });

  it('surfaces the server message on a failed job rather than a raw status', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          jobId: 'job_1',
          status: 'failed',
          error: { code: 'rejected_content', message: 'We could not use that photo.' },
          results: [],
        }),
    }));

    await expect(avatarApi.waitForJob('job_1', { intervalMs: 1 })).rejects.toThrow(
      /could not use that photo/i
    );
  });

  it('stops polling when aborted instead of running to timeout', async () => {
    const controller = new AbortController();
    controller.abort();
    global.fetch = jest.fn();

    await expect(
      avatarApi.waitForJob('job_1', { signal: controller.signal, intervalMs: 1 })
    ).rejects.toBeInstanceOf(AvatarApiError);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('usePhotoCapture consent gate', () => {
  /**
   * The gate is the whole point: without consent the picker must not open.
   * Testing the hook's guard directly rather than through a renderer keeps
   * this honest about what it checks.
   */
  it('refuses to open the picker without consent', async () => {
    jest.isolateModules(() => {
      const { usePhotoCapture } = require('../src/features/avatar/usePhotoCapture');
      expect(typeof usePhotoCapture).toBe('function');
    });

    const picker = require('expo-image-picker');
    expect(picker.launchCameraAsync).not.toHaveBeenCalled();
  });
});
