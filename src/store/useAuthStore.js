/**
 * Auth state.
 *
 * Tokens live in expo-secure-store and are NEVER persisted into this store's
 * AsyncStorage snapshot — only the non-sensitive session shape is. The token
 * itself is read on demand via `loadSession`.
 *
 * Real sign-in arrives in Phase 3 with the server. Until then `signInAsGuest`
 * lets Phase 2 exercise the routing and gated screens honestly rather than
 * faking an `isAuthenticated` flag in a component.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { prefsStorage, secureStorage, SECURE_KEYS } from '../services/storage';

export const AuthStatus = {
  unknown: 'unknown',
  signedOut: 'signedOut',
  guest: 'guest',
  signedIn: 'signedIn',
};

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      status: AuthStatus.unknown,
      userId: null,
      /** Set once onboarding has been completed, so it is not shown again. */
      hasOnboarded: false,

      /** Reads tokens from secure storage and resolves the session. */
      loadSession: async () => {
        const token = await secureStorage.get(SECURE_KEYS.accessToken);
        if (token) {
          set({ status: AuthStatus.signedIn });
        } else if (get().status === AuthStatus.unknown) {
          set({ status: AuthStatus.signedOut });
        }
        return get().status;
      },

      signInAsGuest: () => set({ status: AuthStatus.guest, userId: 'guest' }),

      completeOnboarding: () => set({ hasOnboarded: true }),

      signOut: async () => {
        await Promise.all([
          secureStorage.remove(SECURE_KEYS.accessToken),
          secureStorage.remove(SECURE_KEYS.refreshToken),
        ]);
        set({ status: AuthStatus.signedOut, userId: null });
      },
    }),
    {
      name: 'lad.auth',
      storage: createJSONStorage(() => prefsStorage),
      version: 1,
      // Deliberately narrow: never let a token reach AsyncStorage.
      partialize: (state) => ({ hasOnboarded: state.hasOnboarded, userId: state.userId }),
    }
  )
);

export default useAuthStore;
