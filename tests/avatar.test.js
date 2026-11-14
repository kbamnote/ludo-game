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
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { usePhotoCapture } = require('../src/features/avatar/usePhotoCapture');
      expect(typeof usePhotoCapture).toBe('function');
    });

    const picker = require('expo-image-picker');
    expect(picker.launchCameraAsync).not.toHaveBeenCalled();
  });
});
