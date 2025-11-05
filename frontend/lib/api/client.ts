import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getRefreshToken, clearRefreshToken, getAccessToken } from '../utils/token';

// Create axios instance with baseURL from environment
const client: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Include cookies for CSRF protection
  withXSRFToken: true, // Automatically include CSRF token from cookie
});

/**
 * Initialize CSRF protection
 * Must be called before making any state-changing requests
 */
export async function initCsrfProtection(): Promise<void> {
  // Use the base URL without /api/v1 for the CSRF endpoint
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  const baseUrl = apiUrl.replace('/api/v1', '');
  
  try {
    await axios.get(`${baseUrl}/sanctum/csrf-cookie`, {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
      console.debug('[Auth] CSRF token initialized');
    }
  } catch (error) {
    console.error('[Auth] Failed to initialize CSRF token:', error);
    throw error;
  }
}

/**
 * Request interceptor: attach access token to all requests
 */
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get access token from localStorage (stored by AuthContext)
    const accessToken = getAccessToken();
    
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
  async (error: any) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 (Unauthorized) - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] 401 detected, clearing session');
      }

      // Clear tokens and emit event for AuthProvider to handle
      clearRefreshToken();
      const accessTokenKey = 'auth_access_token';
      if (typeof window !== 'undefined') {
        localStorage.removeItem(accessTokenKey);
      }
      
      // Emit event for AuthContext to handle
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:token-refresh-failed'));
      }
    }

    // For non-401 errors or already-retried requests, return as-is
    return Promise.reject(error);
  }
);

// Export for use in API modules
export default client;
