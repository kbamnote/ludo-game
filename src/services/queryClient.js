/**
 * TanStack Query client.
 *
 * Wired now, before there is a server, so Phase 2's sample data flows through
 * the real data layer instead of being hardcoded into components. When
 * ludo-server arrives at Phase 3, screens do not change — only the fetchers do.
 *
 * Defaults are tuned for a mobile game on an unreliable connection: retry
 * network failures but never a 4xx, and treat data as fresh for long enough
 * that tab switching does not refetch everything.
 */

import { AppState, Platform } from 'react-native';
import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => {
        // A 4xx will not succeed on retry — only waste battery and time.
        const status = error?.status ?? error?.response?.status;
        if (status >= 400 && status < 500) return false;
        return failureCount < 3;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 15_000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * React Query's web focus detection does nothing in React Native, so wire it
 * to AppState. Call once from the root layout.
 */
export function wireAppStateFocus() {
  if (Platform.OS === 'web') return () => {};
  const sub = AppState.addEventListener('change', (status) => {
    focusManager.setFocused(status === 'active');
  });
  return () => sub.remove();
}

/**
 * Online detection. Phase 5 replaces this with a real NetInfo subscription once
 * reconnection handling matters; until then we assume online rather than
 * pretending to know.
 */
export function wireOnlineManager() {
  onlineManager.setOnline(true);
  return () => {};
}

export default queryClient;
