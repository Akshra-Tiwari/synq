'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../lib/store/auth.store';
import { getMe, refreshToken } from '../lib/api/auth.api';

const TOKEN_KEY = 'synq_access_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        // Try cookie-based refresh (user closed tab with valid refresh cookie)
        try {
          const res = await refreshToken();
          const newToken = res.data.accessToken;
          localStorage.setItem(TOKEN_KEY, newToken);
          const me = await getMe();
          setAuth(me.data.user, newToken);
        } catch {
          clearAuth();
        }
        return;
      }

      try {
        const me = await getMe();
        setAuth(me.data.user, token);
      } catch {
        // Token expired — try silent refresh
        try {
          const res = await refreshToken();
          const newToken = res.data.accessToken;
          localStorage.setItem(TOKEN_KEY, newToken);
          const me = await getMe();
          setAuth(me.data.user, newToken);
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          clearAuth();
        }
      }
    };

    bootstrap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
