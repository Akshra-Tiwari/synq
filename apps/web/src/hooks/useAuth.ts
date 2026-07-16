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
    localStorage.setItem(TOKEN_KEY, res.data.accessToken);
    setAuth(res.data.user, res.data.accessToken);
    router.push('/feed');
  };

  const register = async (payload: { name: string; username: string; email: string; password: string }) => {
    const res = await apiRegister(payload);
    localStorage.setItem(TOKEN_KEY, res.data.accessToken);
    setAuth(res.data.user, res.data.accessToken);
    router.push('/onboarding');
  };

  const logout = async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    localStorage.removeItem(TOKEN_KEY);
    clearAuth();
    router.push('/login');
  };

  return { login, register, logout };
}
