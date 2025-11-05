import client from './client';
import { sanitizeEmail, sanitizePassword, sanitizeText } from '../utils/sanitize';

/**
 * Authentication API endpoints wrapper
 * All endpoints handle their own error responses
 */

// Types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
}

export interface CreateApiTokenRequest {
  name: string;
  expires_at?: string;
}

export interface AuthResponse {
  message: string;
  user?: any;
  access_token?: string;
  refresh_token?: string;
  token?: string;
  api_token?: any;
}

/**
 * POST /auth/register - Register new user
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await client.post<{ data?: AuthResponse; message?: string }>('/auth/register', {
    name: sanitizeText(data.name),
    email: sanitizeEmail(data.email),
    password: sanitizePassword(data.password),
  });
  // Backend may return data nested in { data: {...} } or directly
  return response.data.data || { ...response.data, message: response.data.message || 'Registration successful' };
}

/**
 * POST /auth/login - Login user
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await client.post<{ data: AuthResponse }>('/auth/login', {
    email: sanitizeEmail(data.email),
    password: sanitizePassword(data.password),
  });
  // Backend returns data nested in { data: { user, access_token, refresh_token } }
  return {
    ...response.data.data,
    message: response.data.data.message || 'Login successful',
  };
}

/**
 * POST /auth/refresh - Refresh access token
 */
export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  const response = await client.post<{ data?: AuthResponse }>('/auth/refresh', {
    refresh_token: refreshToken,
  });
  return response.data.data || { ...response.data as AuthResponse };
}

/**
 * POST /auth/logout - Logout user
 */
export async function logout(): Promise<AuthResponse> {
  const response = await client.post<{ data?: AuthResponse; message?: string }>('/auth/logout');
  return response.data.data || { message: response.data.message || 'Logged out successfully' } as AuthResponse;
}

/**
 * GET /auth/me - Get current user
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  const response = await client.get<{ success: boolean; data: any }>('/auth/me');
  // Backend returns {success: true, data: {id, email, name, ...}}
  // Transform to {user: {...}} format expected by AuthContext
  return {
    message: 'User retrieved successfully',
    user: response.data.data,
  };
}

/**
 * POST /auth/confirm-email - Verify email address with token
 */
export async function verifyEmail(token: string): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>('/auth/confirm-email', {
    token,
  });
  return response.data;
}

/**
 * POST /auth/forgot-password - Request password reset email
 */
export async function forgotPassword(email: string): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>('/auth/forgot-password', {
    email: sanitizeEmail(email),
  });
  return response.data;
}

/**
 * PUT /auth/reset-password - Reset password with token
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<AuthResponse> {
  const response = await client.put<AuthResponse>('/auth/reset-password', {
    token: data.token,
    password: sanitizePassword(data.password),
  });
  return response.data;
}

/**
 * PUT /auth/profile - Update user profile
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<AuthResponse> {
  const response = await client.put<AuthResponse>('/auth/profile', {
    name: data.name ? sanitizeText(data.name) : undefined,
  });
  return response.data;
}

/**
 * POST /auth/upload-avatar - Upload user avatar
 */
export async function uploadAvatar(file: File): Promise<AuthResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await client.post<AuthResponse>('/auth/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * PUT /auth/change-password - Change user password
 */
export async function changePassword(data: ChangePasswordRequest): Promise<AuthResponse> {
  const response = await client.put<AuthResponse>('/auth/change-password', {
    current_password: sanitizePassword(data.current_password),
    password: sanitizePassword(data.password),
  });
  return response.data;
}

/**
 * GET /auth/sessions - Get active sessions
 */
export async function getSessions(): Promise<{ sessions: any[] }> {
  const response = await client.get<{ sessions: any[] }>('/auth/sessions');
  return response.data;
}

/**
 * DELETE /auth/sessions/{id} - Delete specific session
 */
export async function deleteSession(sessionId: string): Promise<AuthResponse> {
  const response = await client.delete<AuthResponse>(`/auth/sessions/${sessionId}`);
  return response.data;
}

/**
 * GET /auth/api-tokens - Get API tokens
 */
export async function getApiTokens(): Promise<{ tokens: any[] }> {
  const response = await client.get<{ tokens: any[] }>('/auth/api-tokens');
  return response.data;
}

/**
 * POST /auth/api-tokens - Create API token
 */
export async function createApiToken(data: CreateApiTokenRequest): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>('/auth/api-tokens', {
    name: sanitizeText(data.name),
    expires_at: data.expires_at,
  });
  return response.data;
}

/**
 * DELETE /auth/api-tokens/{id} - Delete API token
 */
export async function deleteApiToken(tokenId: string): Promise<AuthResponse> {
  const response = await client.delete<AuthResponse>(`/auth/api-tokens/${tokenId}`);
  return response.data;
}

/**
 * DELETE /auth/account - Request account deletion
 */
export async function deleteAccount(): Promise<AuthResponse> {
  const response = await client.delete<AuthResponse>('/auth/account');
  return response.data;
}

/**
 * POST /auth/resend-verification-email - Resend verification email
 */
export async function resendVerificationEmail(email: string): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>('/auth/resend-verification-email', {
    email: sanitizeEmail(email),
  });
  return response.data;
}
