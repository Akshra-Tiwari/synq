import { create } from 'zustand';
import type { ConnectionStatus } from '../api/connections.api';

interface StatusEntry {
  status:       ConnectionStatus;
  connectionId: string | null;
  isSender?:    boolean;
}

interface ConnectionsState {
  // Per-userId status cache
  statusCache:    Record<string, StatusEntry>;
  pendingCount:   number;   // incoming pending requests badge

  setStatus:      (userId: string, entry: StatusEntry) => void;
  getStatus:      (userId: string) => StatusEntry | undefined;
  setPendingCount:(n: number) => void;
  invalidate:     (userId: string) => void;
}

export const useConnectionsStore = create<ConnectionsState>()((set, get) => ({
  statusCache:  {},
  pendingCount: 0,

  setStatus: (userId, entry) =>
    set((s) => ({ statusCache: { ...s.statusCache, [userId]: entry } })),

  getStatus: (userId) => get().statusCache[userId],

  setPendingCount: (pendingCount) => set({ pendingCount }),

  invalidate: (userId) =>
    set((s) => {
      const next = { ...s.statusCache };
      delete next[userId];
      return { statusCache: next };
    }),
}));
