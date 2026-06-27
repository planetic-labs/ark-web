import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { apiRequest } from '@/services/api/client';
import { User } from '@/types/shared';

export function useSession() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const refreshAttemptedRef = useRef(false);

  useEffect(() => {
    async function initSession() {
      const state = useAuthStore.getState();

      // 1. If we already have an accessToken and user, we are good
      if (accessToken && user) {
        setIsLoading(false);
        return;
      }

      // 2. If we have an accessToken but no user, fetch user profile
      if (accessToken && !user) {
        try {
          const profile = await apiRequest<User>('/users/me', {}, accessToken);
          state.setUser(profile);
          setIsLoading(false);
          return;
        } catch {
          // Token might be invalid/expired, proceed to refresh
        }
      }

      // Avoid multiple simultaneous refresh requests
      if (refreshAttemptedRef.current) {
        setIsLoading(false);
        return;
      }
      refreshAttemptedRef.current = true;

      // 3. Try to refresh the token using Route Handler
      try {
        const refreshResponse = await fetch('/api/auth/refresh', { method: 'POST' });
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          if (data.access_token) {
            state.setAccessToken(data.access_token);
            const profile = await apiRequest<User>('/users/me', {}, data.access_token);
            state.setUser(profile);
          } else {
            state.logout();
          }
        } else {
          state.logout();
        }
      } catch {
        state.logout();
      } finally {
        setIsLoading(false);
      }
    }

    initSession();
  }, [accessToken, user]);

  return {
    isAuthenticated: !!accessToken && !!user,
    user,
    isLoading,
  };
}
