/**
 * useHaptics — haptics that respect the user's setting and never throw.
 *
 * Components should call this rather than expo-haptics directly, so the
 * Settings toggle actually works everywhere and a device without a motor
 * (or an emulator) cannot break an interaction.
 */
import { useCallback, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../store/useSettingsStore';

export function useHaptics() {
  const enabled = useSettingsStore((s) => s.hapticsEnabled);

  const run = useCallback(
    (fn) => {
      if (!enabled) return;
      // Haptics are best-effort: a missing buzz must never surface as an error.
      Promise.resolve(fn()).catch(() => {});
    },
    [enabled]
  );

  return useMemo(
    () => ({
      enabled,
      light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
      medium: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
      heavy: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
      select: () => run(() => Haptics.selectionAsync()),
      success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
      warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
      error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
    }),
    [enabled, run]
  );
}

export default useHaptics;
