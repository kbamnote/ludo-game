/**
 * Photo-upload consent.
 *
 * Persisted so a user who has already agreed is not asked on every visit, and
 * keyed by POLICY VERSION so that changing the policy re-asks rather than
 * silently relying on an agreement to different terms.
 *
 * This mirrors what the server records (API_CONTRACT §2). The server is the
 * authority — it rejects a job whose consent is missing or stale — and this
 * store exists only so the UI knows whether to show the gate.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { prefsStorage } from '../services/storage';

/** Must match the server's POLICY_VERSION. */
export const POLICY_VERSION = '2026-11-01';

export const useConsentStore = create()(
  persist(
    (set, get) => ({
      /** The policy version the user accepted, or null. */
      acceptedVersion: null,
      acceptedAt: null,

      hasConsent: () => get().acceptedVersion === POLICY_VERSION,

      accept: () => set({ acceptedVersion: POLICY_VERSION, acceptedAt: new Date().toISOString() }),

      /** Used when the user deletes their data — consent should not outlive it. */
      withdraw: () => set({ acceptedVersion: null, acceptedAt: null }),
    }),
    {
      name: 'lad.consent',
      storage: createJSONStorage(() => prefsStorage),
      version: 1,
    }
  )
);

export default useConsentStore;
