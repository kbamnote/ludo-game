/**
 * Settings — user preferences, persisted to AsyncStorage.
 *
 * `reducedMotion` and `animationsEnabled` exist from day one because the brief
 * calls for animation controls, and retrofitting a motion kill-switch across a
 * game full of Reanimated loops is far harder than threading it through now.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { prefsStorage } from '../services/storage';

export const useSettingsStore = create()(
  persist(
    (set) => ({
      soundEnabled: true,
      musicEnabled: true,
      hapticsEnabled: true,
      animationsEnabled: true,
      reducedMotion: false,
      /** Phase 6 — voice chat defaults. */
      voiceAutoJoin: false,
      pushEnabled: true,

      setSetting: (key, value) => set({ [key]: value }),
      toggle: (key) => set((state) => ({ [key]: !state[key] })),
      reset: () =>
        set({
          soundEnabled: true,
          musicEnabled: true,
          hapticsEnabled: true,
          animationsEnabled: true,
          reducedMotion: false,
          voiceAutoJoin: false,
          pushEnabled: true,
        }),
    }),
    {
      name: 'lad.settings',
      storage: createJSONStorage(() => prefsStorage),
      version: 1,
    }
  )
);

export default useSettingsStore;
