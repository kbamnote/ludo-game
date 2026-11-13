/**
 * Current-player profile shown in the app header and across the tabs.
 *
 * Seeded with the Stitch design's own sample values so Phase 2 screens render
 * with realistic data from the start. From Phase 3 this is hydrated from the
 * server via TanStack Query and this store holds only the local mirror.
 */
import { create } from 'zustand';
import { images } from '../assets/images';

export const useUserStore = create((set) => ({
  displayName: 'K41_STORM',
  handle: 'K4I',
  level: 24,
  coins: 48200,
  gems: 1250,
  rankPoints: 12480,
  globalRank: 14,
  faction: 'p1',
  avatar: images.avatarMeK4i,
  clan: 'CYBERFLOW',
  unreadFriendRequests: 3,

  setProfile: (partial) => set(partial),
  addCoins: (n) => set((s) => ({ coins: s.coins + n })),
  addGems: (n) => set((s) => ({ gems: s.gems + n })),
}));

export default useUserStore;
