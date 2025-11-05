/**
 * Token utility functions for managing tokens in localStorage
 * Using localStorage instead of sessionStorage for persistent sessions across page refreshes
 */

const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const ACCESS_TOKEN_KEY = 'auth_access_token';

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!stored) return null;
    const { token, expiresAt } = JSON.parse(stored);
    if (expiresAt && new Date(expiresAt) < new Date()) {
      clearRefreshToken();
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

/**
 * Set refresh token in localStorage with expiration
 */
export function setRefreshToken(token: string, expiresAt: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, JSON.stringify({ token, expiresAt }));
  } catch (e) {
    console.error('[Auth] Failed to store refresh token:', e);
  }
}

/**
 * Clear refresh token from localStorage
 */
export function clearRefreshToken(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (e) {
    console.error('[Auth] Failed to clear refresh token:', e);
  }
}

/**
 * Get refresh token expiration date
 */
export function getRefreshTokenExpiration(): Date | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!stored) return null;
    const { expiresAt } = JSON.parse(stored);
    return expiresAt ? new Date(expiresAt) : null;
  } catch {
    return null;
  }
}

/**
 * Check if refresh token is expired
 */
export function isRefreshTokenExpired(): boolean {
  const expiration = getRefreshTokenExpiration();
  if (!expiration) return true;
  return new Date() > expiration;
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Set access token in localStorage
 */
export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch (e) {
    console.error('[Auth] Failed to store access token:', e);
  }
}

/**
 * Clear access token from localStorage
 */
export function clearAccessToken(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch (e) {
    console.error('[Auth] Failed to clear access token:', e);
  }
}
