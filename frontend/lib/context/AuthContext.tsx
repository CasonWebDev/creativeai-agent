import React, { createContext, useContext } from 'react';
import { AuthContextType, AuthState } from '../types/auth';

// Create context with default undefined
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default auth state
export const defaultAuthState: AuthState = {
  user: null,
  isLoading: true, // Loading on mount to restore session
  isAuthenticating: false,
  accessToken: null,
  isTokenRefreshing: false,
  error: null,
  isAuthenticated: false,
  emailVerified: false,
};

/**
 * Hook to use AuthContext
 * Must be called from within AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { state } = useAuth();
  return state.isAuthenticated;
}

/**
 * Hook to check if email is verified
 */
export function useIsEmailVerified(): boolean {
  const { state } = useAuth();
  return state.emailVerified;
}

/**
 * Hook to get current user
 */
export function useUser() {
  const { state } = useAuth();
  return state.user;
}

/**
 * Hook to get auth state loading
 */
export function useAuthLoading(): boolean {
  const { state } = useAuth();
  return state.isLoading;
}

/**
 * Hook to check if currently authenticating (during login/register)
 */
export function useIsAuthenticating(): boolean {
  const { state } = useAuth();
  return state.isAuthenticating;
}

/**
 * Hook to get current error
 */
export function useAuthError(): string | null {
  const { state } = useAuth();
  return state.error;
}
