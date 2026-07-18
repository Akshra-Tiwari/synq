'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '../lib/store/auth.store';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../lib/api/auth.api';

const TOKEN_KEY = 'synq_access_token';

export function useAuth() {
  const router = useRouter();
  const { setAuth, clearAuth } = useAuthStore();

  const login = async (credentials: { email: string; password: string }) => {
    const res = await apiLogin(credentials);
    const { accessToken, user } = res.data;
    localStorage.setItem(TOKEN_KEY, accessToken);
    setAuth(user, accessToken);
    // Use replace + refresh to force navigation
    router.replace('/feed');
    router.refresh();
  };

  const register = async (payload: {
    name: string; username: string; email: string; password: string;
  }) => {
    const res = await apiRegister(payload);
    const { accessToken, user } = res.data;
    localStorage.setItem(TOKEN_KEY, accessToken);
    setAuth(user, accessToken);
    router.replace('/onboarding');
    router.refresh();
  };

  const logout = async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    localStorage.removeItem(TOKEN_KEY);
    clearAuth();
    router.replace('/login');
    router.refresh();
  };

  return { login, register, logout };
}
