'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

// Minimum time (ms) user must be away before we refresh on return
const MIN_AWAY_TIME_MS = 30 * 1000; // 30 seconds

// Periodic token refresh interval (to handle staying on page while token expires)
const TOKEN_REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Hook that handles automatic Privy token refresh:
 * - Refreshes token when user returns to tab after being away
 * - Periodically refreshes token to prevent expiration while on page
 * - Redirects to login if not authenticated or refresh fails
 * 
 * Returns { ready, authenticated } for conditional rendering
 */
export function useTokenRefresh() {
  const router = useRouter();
  const { ready, authenticated, getAccessToken, logout } = usePrivy();
  const lastVisibleTime = useRef<number>(Date.now());
  const isRefreshing = useRef<boolean>(false);
  const lastRefreshTime = useRef<number>(Date.now());

  // Refresh token helper - used by both visibility change and periodic refresh
  const refreshToken = useCallback(async (reason: string) => {
    if (isRefreshing.current) return false;
    isRefreshing.current = true;
    
    try {
      console.log(`[Auth] ${reason}, refreshing token...`);
      
      // getAccessToken() will refresh the token if it's expired
      // and update the privy-token cookie automatically
      const token = await getAccessToken();
      
      if (token) {
        lastRefreshTime.current = Date.now();
        // Re-run RSC with fresh token to get updated server data
        router.refresh();
        return true;
      }
      return false;
    } catch (error) {
      console.error('[Auth] Failed to refresh token:', error);
      // If refresh fails, the user's session is invalid - redirect to login
      await logout();
      router.push('/login');
      return false;
    } finally {
      isRefreshing.current = false;
    }
  }, [getAccessToken, logout, router]);

  // Track when user leaves the tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        lastVisibleTime.current = Date.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Proactively refresh token when page becomes visible (user returns from AFK)
  const refreshTokenOnVisibility = useCallback(async () => {
    if (document.visibilityState !== 'visible' || !authenticated) return;
    
    const awayTime = Date.now() - lastVisibleTime.current;
    if (awayTime < MIN_AWAY_TIME_MS) {
      // User wasn't away long enough, skip refresh
      return;
    }

    await refreshToken(`User returned after ${Math.round(awayTime / 1000)}s`);
  }, [authenticated, refreshToken]);

  // Refresh token when tab becomes visible again
  useEffect(() => {
    document.addEventListener('visibilitychange', refreshTokenOnVisibility);
    return () => {
      document.removeEventListener('visibilitychange', refreshTokenOnVisibility);
    };
  }, [refreshTokenOnVisibility]);

  // Periodic token refresh - handles case where user stays on page while token expires
  useEffect(() => {
    if (!authenticated) return;

    const interval = setInterval(async () => {
      const timeSinceLastRefresh = Date.now() - lastRefreshTime.current;
      if (timeSinceLastRefresh >= TOKEN_REFRESH_INTERVAL_MS) {
        await refreshToken('Periodic token refresh');
      }
    }, TOKEN_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [authenticated, refreshToken]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/login');
    }
  }, [ready, authenticated, router]);

  return { ready, authenticated };
}
