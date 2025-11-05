'use client';

import React, { ReactNode, useState, useEffect, useCallback } from 'react';
import { AuthContext, defaultAuthState } from './AuthContext';
import { AuthContextType, AuthState, User } from '../types/auth';
import * as authApi from '../api/auth';
import { initCsrfProtection } from '../api/client';
import { getRefreshToken, setRefreshToken, clearRefreshToken, getAccessToken, setAccessToken, clearAccessToken } from '../utils/token';
import { incrementRateLimitAttempt, resetRateLimitAttempts, isRateLimited } from '../utils/rate-limit';
import { handleApiError } from '../api/error-handler';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that manages authentication state
 * Must wrap the entire application
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(defaultAuthState);

  /**
   * Restore session from refresh token on mount
   */
  const restoreSession = useCallback(async () => {
    try {
      const refreshToken = getRefreshToken();
      const accessToken = getAccessToken();

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] Restoring session...');
        console.debug('[Auth] Refresh token exists:', !!refreshToken);
        console.debug('[Auth] Access token exists:', !!accessToken);
      }

      if (!refreshToken) {
        if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
          console.debug('[Auth] No refresh token found, skipping session restoration');
        }
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      // If we have both tokens, fetch current user to verify session
      if (accessToken) {
        setAccessToken(accessToken);
        
        if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
          console.debug('[Auth] Calling /auth/me with stored access token');
        }
        
        try {
          const response = await authApi.getCurrentUser();
          
          if (response.user) {
            if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
              console.debug('[Auth] Session restored successfully with user:', response.user.email);
            }
            
            setState((prev) => ({
              ...prev,
              user: response.user,
              accessToken,
              isAuthenticated: true,
              emailVerified: !!response.user.email_verified_at,
              isLoading: false,
              error: null,
            }));

            return;
          } else {
            // No user in response, clear tokens
            if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
              console.debug('[Auth] No user in response, clearing tokens');
            }
            clearAccessToken();
            clearRefreshToken();
            setState((prev) => ({ ...prev, isLoading: false, isAuthenticated: false }));
            return;
          }
        } catch (error) {
          // If getCurrentUser fails, clear tokens
          if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
            console.debug('[Auth] getCurrentUser failed, clearing tokens:', error);
          }
          clearAccessToken();
          clearRefreshToken();
          setState((prev) => ({ ...prev, isLoading: false, isAuthenticated: false }));
          return;
        }
      }

      // If we only have refresh token (no access token), session restoration not possible
      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] Only refresh token found, cannot restore session (access token required)');
      }
      setState((prev) => ({ ...prev, isLoading: false, isAuthenticated: false }));
    } catch (error) {
      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] Session restoration failed:', error);
      }
      clearRefreshToken();
      clearAccessToken();
      setState((prev) => ({ 
        ...prev, 
        isLoading: false,
        isAuthenticated: false,
        user: null,
        accessToken: null,
      }));
    }
  }, []);

  /**
   * Handle token refresh failed event
   */
  const handleTokenRefreshFailed = useCallback(() => {
    if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
      console.debug('[Auth] Token refresh failed, clearing session');
    }
    clearRefreshToken();
    clearAccessToken();
    setState((prev) => ({
      ...prev,
      user: null,
      accessToken: null,
      isAuthenticated: false,
      error: 'Your session has expired. Please log in again.',
    }));
  }, []);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    restoreSession();

    // Listen for token refresh failed event
    window.addEventListener('auth:token-refresh-failed', handleTokenRefreshFailed);

    return () => {
      window.removeEventListener('auth:token-refresh-failed', handleTokenRefreshFailed);
    };
  }, [restoreSession, handleTokenRefreshFailed]);

  /**
   * Login function
   */
  const login = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, isAuthenticating: true, error: null }));

      try {
        // Check rate limiting
        if (isRateLimited()) {
          throw new Error('Too many login attempts. Please try again later.');
        }

        // Initialize CSRF protection before login
        await initCsrfProtection();

        const response = await authApi.login({ email, password });

        // Reset rate limit on success
        resetRateLimitAttempts();

        // Store tokens
        setAccessToken(response.access_token || '');
        setRefreshToken(response.refresh_token || '', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

        setState((prev) => ({
          ...prev,
          user: response.user,
          accessToken: response.access_token || null,
          isAuthenticated: true,
          emailVerified: !!response.user?.email_verified_at,
          isAuthenticating: false,
          error: null,
        }));

        if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
          console.debug('[Auth] Login successful');
        }
      } catch (error: any) {
        // Increment rate limit on failure
        incrementRateLimitAttempt();

        const apiError = handleApiError(error);
        setState((prev) => ({
          ...prev,
          isAuthenticating: false,
          error: apiError.message,
        }));

        if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
          console.debug('[Auth] Login failed:', apiError);
        }

        throw apiError;
      }
    },
    []
  );

  /**
   * Register function
   */
  const register = useCallback(async (name: string, email: string, password: string) => {
    setState((prev) => ({ ...prev, isAuthenticating: true, error: null }));

    try {
      // Initialize CSRF protection before registration
      await initCsrfProtection();
      
      const response = await authApi.register({ name, email, password });

      setState((prev) => ({
        ...prev,
        isAuthenticating: false,
        error: null,
      }));

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] Registration successful');
      }
    } catch (error: any) {
      const apiError = handleApiError(error);
      setState((prev) => ({
        ...prev,
        isAuthenticating: false,
        error: apiError.message,
      }));

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] Registration failed:', apiError);
      }

      throw apiError;
    }
  }, []);

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Continue logout even if API call fails
      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] Logout API call failed (continuing anyway):', error);
      }
    }

    // Clear tokens and state
    clearRefreshToken();
    clearAccessToken();
    setState((prev) => ({
      ...prev,
      user: null,
      accessToken: null,
      isAuthenticated: false,
      error: null,
    }));

    if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
      console.debug('[Auth] Logout complete');
    }
  }, []);

  /**
   * Verify email function
   */
  const verifyEmail = useCallback(async (token: string) => {
    try {
      const response = await authApi.verifyEmail(token);

      // Auto-login after verification
      setAccessToken(response.access_token || '');
      setRefreshToken(response.refresh_token || '', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

      setState((prev) => ({
        ...prev,
        user: response.user,
        accessToken: response.access_token || null,
        isAuthenticated: true,
        emailVerified: true,
        error: null,
      }));

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] Email verified');
      }
    } catch (error: any) {
      const apiError = handleApiError(error);
      setState((prev) => ({
        ...prev,
        error: apiError.message,
      }));
      throw apiError;
    }
  }, []);

  /**
   * Resend verification email function
   */
  const resendVerificationEmail = useCallback(async (email: string) => {
    try {
      await authApi.resendVerificationEmail(email);

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] Verification email resent');
      }
    } catch (error: any) {
      const apiError = handleApiError(error);
      setState((prev) => ({
        ...prev,
        error: apiError.message,
      }));
      throw apiError;
    }
  }, []);

  /**
   * Forgot password function
   */
  const forgotPassword = useCallback(async (email: string) => {
    try {
      await authApi.forgotPassword(email);

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] Password reset email sent');
      }
    } catch (error: any) {
      const apiError = handleApiError(error);
      setState((prev) => ({
        ...prev,
        error: apiError.message,
      }));
      throw apiError;
    }
  }, []);

  /**
   * Reset password function
   */
  const resetPassword = useCallback(async (token: string, password: string) => {
    try {
      const response = await authApi.resetPassword({ token, password });

      // Auto-login after password reset
      setAccessToken(response.access_token || '');
      setRefreshToken(response.refresh_token || '', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

      setState((prev) => ({
        ...prev,
        user: response.user,
        accessToken: response.access_token || null,
        isAuthenticated: true,
        emailVerified: !!response.user?.email_verified_at,
        error: null,
      }));

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] Password reset successful');
      }
    } catch (error: any) {
      const apiError = handleApiError(error);
      setState((prev) => ({
        ...prev,
        error: apiError.message,
      }));
      throw apiError;
    }
  }, []);

  /**
   * Update profile function
   */
  const updateProfile = useCallback(async (name: string) => {
    try {
      const response = await authApi.updateProfile({ name });

      setState((prev) => ({
        ...prev,
        user: response.user,
        error: null,
      }));

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] Profile updated');
      }
    } catch (error: any) {
      const apiError = handleApiError(error);
      setState((prev) => ({
        ...prev,
        error: apiError.message,
      }));
      throw apiError;
    }
  }, []);

  /**
   * Upload avatar function
   */
  const uploadAvatar = useCallback(async (file: File) => {
    try {
      const response = await authApi.uploadAvatar(file);

      setState((prev) => ({
        ...prev,
        user: response.user,
        error: null,
      }));

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] Avatar uploaded');
      }
    } catch (error: any) {
      const apiError = handleApiError(error);
      setState((prev) => ({
        ...prev,
        error: apiError.message,
      }));
      throw apiError;
    }
  }, []);

  /**
   * Change password function
   */
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      await authApi.changePassword({ current_password: currentPassword, password: newPassword });

      // On success, logout user (must re-login with new password per FR-017)
      await logout();

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] Password changed, logged out');
      }
    } catch (error: any) {
      const apiError = handleApiError(error);
      setState((prev) => ({
        ...prev,
        error: apiError.message,
      }));
      throw apiError;
    }
  }, [logout]);

  /**
   * Get sessions function
   */
  const getSessions = useCallback(async () => {
    try {
      const response = await authApi.getSessions();
      return response.sessions;
    } catch (error: any) {
      const apiError = handleApiError(error);
      setState((prev) => ({
        ...prev,
        error: apiError.message,
      }));
      throw apiError;
    }
  }, []);

  /**
   * Delete session function
   */
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await authApi.deleteSession(sessionId);

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] Session deleted');
      }
    } catch (error: any) {
      const apiError = handleApiError(error);
      setState((prev) => ({
        ...prev,
        error: apiError.message,
      }));
      throw apiError;
    }
  }, []);

  /**
   * Get API tokens function
   */
  const getApiTokens = useCallback(async () => {
    try {
      const response = await authApi.getApiTokens();
      return response.tokens;
    } catch (error: any) {
      const apiError = handleApiError(error);
      setState((prev) => ({
        ...prev,
        error: apiError.message,
      }));
      throw apiError;
    }
  }, []);

  /**
   * Create API token function
   */
  const createApiToken = useCallback(async (name: string, expiresAt?: string): Promise<string> => {
    try {
      const response = await authApi.createApiToken({ name, expires_at: expiresAt });
      return response.token || response.api_token || '';
    } catch (error: any) {
      const apiError = handleApiError(error);
      setState((prev) => ({
        ...prev,
        error: apiError.message,
      }));
      throw apiError;
    }
  }, []);

  /**
   * Delete API token function
   */
  const deleteApiToken = useCallback(async (tokenId: string) => {
    try {
      await authApi.deleteApiToken(tokenId);

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] API token deleted');
      }
    } catch (error: any) {
      const apiError = handleApiError(error);
      setState((prev) => ({
        ...prev,
        error: apiError.message,
      }));
      throw apiError;
    }
  }, []);

  /**
   * Delete account function
   */
  const deleteAccount = useCallback(async () => {
    try {
      await authApi.deleteAccount();

      // Logout after account deletion
      await logout();

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] Account deleted');
      }
    } catch (error: any) {
      const apiError = handleApiError(error);
      setState((prev) => ({
        ...prev,
        error: apiError.message,
      }));
      throw apiError;
    }
  }, [logout]);

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    updateProfile,
    uploadAvatar,
    changePassword,
    getSessions,
    deleteSession,
    getApiTokens,
    createApiToken,
    deleteApiToken,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
