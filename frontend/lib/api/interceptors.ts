import { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import client from './client';
import { getRefreshToken, setRefreshToken, clearRefreshToken, getRefreshTokenExpiration } from '../utils/token';

// Types for token refresh queue
interface QueuedRequest {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
  config: InternalAxiosRequestConfig;
}

// Global state for token refresh
let isTokenRefreshing = false;
let refreshSubscribers: QueuedRequest[] = [];

/**
 * Queue a request while token is being refreshed
 */
function subscribeTokenRefresh(config: InternalAxiosRequestConfig) {
  return new Promise<InternalAxiosRequestConfig>((resolve, reject) => {
    refreshSubscribers.push({ resolve, reject, config });
  });
}

/**
 * Notify all queued requests when token refresh completes
 */
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(({ resolve, config }) => {
    config.headers.Authorization = `Bearer ${token}`;
    resolve(config);
  });
  refreshSubscribers = [];
}

/**
 * Notify all queued requests if token refresh fails
 */
function onTokenRefreshFailed(error: AxiosError) {
  refreshSubscribers.forEach(({ reject }) => {
    reject(error);
  });
  refreshSubscribers = [];
}

/**
 * Request interceptor: attach access token to all requests
 */
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get access token from localStorage (stored by AuthContext)
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('auth_access_token') : null;
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
      console.debug('[Auth] Request:', config.method?.toUpperCase(), config.url, 'Has token:', !!accessToken);
    }

    return config;
  },
  (error) => {
    console.error('[Auth] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: handle 401 errors with token refresh
 */
client.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 (Unauthorized) - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] 401 detected, attempting token refresh');
      }

      // If already refreshing, queue this request
      if (isTokenRefreshing) {
        try {
          const config = await subscribeTokenRefresh(originalRequest);
          return client(config);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      // Start token refresh
      isTokenRefreshing = true;

      try {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          // No refresh token available - user must re-login
          if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
            console.debug('[Auth] No refresh token found, clearing session');
          }
          clearRefreshToken();
          // Emit event for AuthContext to handle
          window.dispatchEvent(new CustomEvent('auth:token-refresh-failed'));
          return Promise.reject(error);
        }

        // Call refresh endpoint
        const response = await client.post('/auth/refresh', { refresh_token: refreshToken });
        const newAccessToken = response.data.access_token;

        if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
          console.debug('[Auth] Token refreshed successfully');
        }

        // Store new access token
        localStorage.setItem('auth_access_token', newAccessToken);

        // Update original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Notify all queued requests
        onTokenRefreshed(newAccessToken);

        // Retry original request
        return client(originalRequest);
      } catch (refreshError) {
        if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
          console.debug('[Auth] Token refresh failed:', refreshError);
        }

        // Refresh failed - clear tokens and redirect to login
        clearRefreshToken();
        localStorage.removeItem('auth_access_token');
        
        // Notify all queued requests of failure
        onTokenRefreshFailed(refreshError as AxiosError);

        // Emit event for AuthContext to handle
        window.dispatchEvent(new CustomEvent('auth:token-refresh-failed'));

        return Promise.reject(refreshError);
      } finally {
        isTokenRefreshing = false;
      }
    }

    // For non-401 errors or already-retried requests, return as-is
    return Promise.reject(error);
  }
);

export default client;
