import { create } from 'zustand';
import type { User } from '../api/auth.api';

interface ProfileState {
  // Cache of visited profiles keyed by username
  profileCache: Record<string, User>;
  // Loading states per username
  loadingMap: Record<string, boolean>;

  setProfile: (username: string, user: User) => void;
  getProfile: (username: string) => User | undefined;
  setLoading: (username: string, loading: boolean) => void;
  isLoading: (username: string) => boolean;
  invalidate: (username: string) => void;
  clearCache: () => void;
}

export const useProfileStore = create<ProfileState>()((set, get) => ({
  profileCache: {},
  loadingMap: {},

  setProfile: (username, user) =>
    set((s) => ({
      profileCache: { ...s.profileCache, [username]: user },
      loadingMap:   { ...s.loadingMap,   [username]: false },
    })),

  getProfile: (username) => get().profileCache[username],

  setLoading: (username, loading) =>
    set((s) => ({ loadingMap: { ...s.loadingMap, [username]: loading } })),

  isLoading: (username) => !!get().loadingMap[username],

  invalidate: (username) =>
    set((s) => {
      const next = { ...s.profileCache };
      delete next[username];
      return { profileCache: next };
    }),

  clearCache: () => set({ profileCache: {}, loadingMap: {} }),
}));
