/**
 * Avatar API client.
 *
 * Implements ludo-server/docs/API_CONTRACT.md. That document is the authority
 * — this file consumes it and never invents a shape of its own (risk R12).
 *
 * ── What this file deliberately does NOT do ─────────────────────────────────
 * It never talks to an AI provider. It has no provider URL, no key, no model
 * name, and no knowledge that a provider exists. The server owns all of that,
 * because anything in this bundle is extractable from a shipped APK.
 */
import { API_BASE } from './apiBase';
import { authHeaders, clearToken } from './session';

export { API_BASE };

export class AvatarApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.name = 'AvatarApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * One authenticated request.
 *
 * A 401 is retried exactly once after dropping the token. The token is a
 * 30-day JWT, so the realistic cause is an expiry or a server-side rotation
 * rather than a wrong password — and since the device id is what actually
 * authenticates, the retry recovers silently. Retrying more than once would
 * turn a genuinely rejected device into an infinite loop.
 */
async function request(path, options = {}) {
  const response = await send(path, options);

  if (response.status === 401 && !options.retried) {
    await clearToken();
    return request(path, { ...options, retried: true });
  }

  return finish(response);
}

async function send(path, { method = 'GET', body, headers = {}, raw, signal } = {}) {
  try {
    return await fetch(`${API_BASE}${path}`, {
      method,
      signal,
      headers: {
        ...(await authHeaders()),
        ...(raw ? {} : body ? { 'content-type': 'application/json' } : {}),
        ...headers,
      },
      body: raw ?? (body ? JSON.stringify(body) : undefined),
    });
  } catch {
    // A network failure is the common case on mobile and deserves a message
    // a user can act on, not "TypeError: Network request failed".
    throw new AvatarApiError('Could not reach the server. Check your connection and try again.', {
      code: 'network',
    });
  }
}

async function finish(response) {
  if (response.status === 204) return null;

  const text = await response.text();
  const payload = text ? safeJson(text) : null;

  if (!response.ok) {
    throw new AvatarApiError(payload?.message ?? 'Something went wrong. Please try again.', {
      status: response.status,
      code: payload?.error,
    });
  }

  return payload;
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const avatarApi = {
  /** Styles come from the server so they can change without an app release. */
  getStyles: () => request('/v1/avatars/styles'),

  listAvatars: () => request('/v1/avatars'),

  equip: (avatarId) => request(`/v1/avatars/${avatarId}/equip`, { method: 'POST' }),

  remove: (avatarId) => request(`/v1/avatars/${avatarId}`, { method: 'DELETE' }),

  /** Deletes every avatar AND any pending source photo for this user. */
  removeAll: () => request('/v1/avatars', { method: 'DELETE' }),

  /**
   * Deletes the account itself, and everything attached to it.
   *
   * Lives in this client because it shares the authenticated request pipeline,
   * including the 401 retry. Google Play requires an in-app route to this for
   * any app that creates accounts.
   */
  deleteAccount: () => request('/v1/auth/me', { method: 'DELETE' }),

  /**
   * Uploads a photo and returns its uploadId.
   *
   * Two steps by design: the server decides where bytes go, so the local
   * adapter can later become an S3/R2 presigned URL without this code
   * changing.
   */
  async uploadPhoto({ uri, contentType, byteSize, signal }) {
    const slot = await request('/v1/avatars/uploads', {
      method: 'POST',
      body: { contentType, byteSize },
      signal,
    });

    const file = await fetch(uri);
    const blob = await file.blob();

    const put = await fetch(slot.uploadUrl, {
      method: 'PUT',
      signal,
      headers: { 'content-type': contentType, ...(await authHeaders()) },
      body: blob,
    }).catch(() => null);

    if (!put || !put.ok) {
      throw new AvatarApiError('Could not upload that photo. Please try again.', {
        code: 'upload_failed',
      });
    }

    return slot.uploadId;
  },

  /**
   * Starts generation. Consent is passed explicitly — the server rejects a
   * job without it, and that is the point: consent must be recorded, never
   * inferred from the fact that a photo was uploaded.
   */
  startJob: ({ uploadId, styleId, policyVersion, signal }) =>
    request('/v1/avatars/jobs', {
      method: 'POST',
      signal,
      body: {
        uploadId,
        styleId,
        consent: {
          acceptedAt: new Date().toISOString(),
          policyVersion,
          scope: ['generate_avatar', 'store_avatar'],
        },
      },
    }),

  getJob: (jobId, { signal } = {}) => request(`/v1/avatars/jobs/${jobId}`, { signal }),

  /**
   * Polls a job to a terminal state.
   *
   * Generation takes seconds to tens of seconds, so this is async on the
   * server and polled here. `onProgress` drives the UI; `signal` lets the user
   * back out without leaving a request hanging.
   */
  async waitForJob(jobId, { onProgress, signal, intervalMs = 1500, timeoutMs = 90_000 } = {}) {
    const deadline = Date.now() + timeoutMs;

    for (;;) {
      if (signal?.aborted) throw new AvatarApiError('Cancelled.', { code: 'cancelled' });

      const job = await this.getJob(jobId, { signal });
      onProgress?.(job);

      if (job.status === 'succeeded') return job;
      if (job.status === 'failed') {
        throw new AvatarApiError(
          job.error?.message ?? 'Avatar generation failed. Please try again.',
          { code: job.error?.code }
        );
      }
      if (Date.now() > deadline) {
        throw new AvatarApiError('This is taking longer than expected. Please try again.', {
          code: 'timeout',
        });
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  },
};

export default avatarApi;
