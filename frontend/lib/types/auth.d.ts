/**
 * Authentication related TypeScript types
 */

export interface User {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  avatar_url: string | null;
  plan: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  accessToken: string | null;
  isTokenRefreshing: boolean;
  error: string | null;
  isAuthenticated: boolean;
  emailVerified: boolean;
}

export interface Session {
  id: string;
  device_type: string;
  user_agent: string;
  ip_address: string;
  last_activity_at: string;
  created_at: string;
  is_current?: boolean;
}

export interface ApiToken {
  id: string;
  name: string;
  last_four: string;
  expires_at: string | null;
  created_at: string;
  revoked_at: string | null;
}

export interface JwtToken {
  token: string;
  expiresAt: string;
}

export interface AuthContextType {
  // State
  state: AuthState;
  
  // Methods
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  getSessions: () => Promise<Session[]>;
  deleteSession: (sessionId: string) => Promise<void>;
  getApiTokens: () => Promise<ApiToken[]>;
  createApiToken: (name: string, expiresAt?: string) => Promise<string>; // Returns token
  deleteApiToken: (tokenId: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}
