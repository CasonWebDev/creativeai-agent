/**
 * Rate limiting utilities for login attempts
 * Stores attempt count in localStorage to persist across page reloads
 */

const RATE_LIMIT_KEY = 'auth_attempt_tracker';
const MAX_ATTEMPTS = 3;
const WINDOW_MS = 60 * 1000; // 60 seconds

interface RateLimitData {
  count: number;
  resetTime: number; // timestamp when counter resets
}

/**
 * Get current rate limit data
 */
export function getRateLimitAttempts(): RateLimitData | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Increment rate limit counter
 */
export function incrementRateLimitAttempt(): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getRateLimitAttempts();
    const now = Date.now();

    if (!current || now > current.resetTime) {
      // New window
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: 1, resetTime: now + WINDOW_MS }));
    } else {
      // Increment existing counter
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: current.count + 1, resetTime: current.resetTime }));
    }
  } catch (e) {
    console.error('[Auth] Failed to increment rate limit:', e);
  }
}

/**
 * Reset rate limit counter (on successful login)
 */
export function resetRateLimitAttempts(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RATE_LIMIT_KEY);
  } catch (e) {
    console.error('[Auth] Failed to reset rate limit:', e);
  }
}

/**
 * Check if user is rate limited
 */
export function isRateLimited(): boolean {
  const data = getRateLimitAttempts();
  if (!data) return false;

  const now = Date.now();

  // Check if window has expired
  if (now > data.resetTime) {
    resetRateLimitAttempts();
    return false;
  }

  // Check if max attempts exceeded
  return data.count >= MAX_ATTEMPTS;
}

/**
 * Get remaining time in seconds until rate limit resets
 */
export function getRateLimitResetTime(): number {
  const data = getRateLimitAttempts();
  if (!data) return 0;

  const now = Date.now();
  const remaining = Math.ceil((data.resetTime - now) / 1000);
  return Math.max(0, remaining);
}

/**
 * Get number of attempts made
 */
export function getRateLimitAttemptCount(): number {
  const data = getRateLimitAttempts();
  if (!data) return 0;

  const now = Date.now();
  if (now > data.resetTime) {
    resetRateLimitAttempts();
    return 0;
  }

  return data.count;
}
