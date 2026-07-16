import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../api/auth.api';

const TOKEN_KEY = 'synq_access_token';

interface AuthState {
  user:            User | null;
  accessToken:     string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;

  setAuth:        (user: User, accessToken: string) => void;
  setUser:        (user: User) => void;
  setAccessToken: (token: string) => void;
  clearAuth:      () => void;
  setLoading:     (loading: boolean) => void;
}

const safeStorage = typeof window !== 'undefined' ? localStorage : {
  getItem:    () => null,
  setItem:    () => {},
  removeItem: () => {},
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:            null,
      accessToken:     null,
      isAuthenticated: false,
      isLoading:       true,

      setAuth: (user, accessToken) => {
        if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, accessToken);
        set({ user, accessToken, isAuthenticated: true, isLoading: false });
      },

      setUser: (user) => set({ user }),

      setAccessToken: (accessToken) => {
        if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, accessToken);
        set({ accessToken });
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name:    'synq-auth',
      storage: createJSONStorage(() => safeStorage),
      // Only persist user identity — token managed separately
      partialize: (state) => ({
        user:            state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
