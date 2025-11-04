# Developer Quickstart Guide

**Feature**: Frontend Next.js + Backend Laravel JWT Authentication Integration  
**Date**: 4 de novembro de 2025

---

## Quick Overview

This guide helps developers get started implementing the authentication system quickly.

**5-Minute Summary**:
1. Clone the repo, install dependencies
2. Set up environment variables
3. Create API client with Axios interceptors
4. Implement Auth Context with useAuth hook
5. Wrap app with AuthProvider, protect routes

---

## Prerequisites

- Node.js 18+ installed
- npm or pnpm
- Running Laravel backend with Feature 001 auth endpoints
- Frontend project structure (Next.js 16+ with App Router)

---

## Step 1: Environment Setup

Create `.env.local` in the `frontend/` directory:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Optional: Enable debug logging
NEXT_PUBLIC_AUTH_DEBUG=false
```

**Note**: Frontend runs on `http://localhost:3000`, backend on `http://localhost:8000`

---

## Step 2: Install Dependencies

```bash
cd frontend

# Install required packages
npm install axios zod react-hook-form

# Optional: For testing
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

**Dependencies Summary**:
- **axios**: HTTP client with interceptor support
- **zod**: Runtime type validation
- **react-hook-form**: Form state management (optional but recommended)
- **shadcn/ui**: Pre-built UI components (already in project)

---

## Step 3: Create Directory Structure

```bash
# Create required directories (if not exists)
mkdir -p lib/{api,context,hooks,validators,utils,types}
mkdir -p components/{auth,profile}
mkdir -p app/{auth,dashboard}
mkdir -p tests/{unit,integration}
```

---

## Step 4: Implement Core Files (In Order)

### 4.1 API Client (`lib/api/client.ts`)

```typescript
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

export default apiClient
```

### 4.2 Token Utilities (`lib/utils/token.ts`)

```typescript
export const tokenUtils = {
  getRefreshToken: () => {
    if (typeof window === 'undefined') return null
    const stored = sessionStorage.getItem('auth_refresh_token')
    return stored ? JSON.parse(stored).token : null
  },
  
  setRefreshToken: (token: string, expiresAt: number) => {
    sessionStorage.setItem('auth_refresh_token', JSON.stringify({
      token,
      expiresAt,
    }))
  },
  
  clearRefreshToken: () => {
    sessionStorage.removeItem('auth_refresh_token')
  },
  
  isTokenExpired: (expiresAt: number) => {
    return Date.now() >= expiresAt
  },
}
```

### 4.3 Request Interceptor (`lib/api/interceptors.ts`)

```typescript
import apiClient from './client'
import { tokenUtils } from '../utils/token'

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.request.use((config) => {
  // Access token will be added by context (injected into window)
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          error.config.headers.Authorization = `Bearer ${token}`
          return apiClient(error.config)
        })
      }

      isRefreshing = true
      error.config._retry = true

      try {
        const refreshToken = tokenUtils.getRefreshToken()
        const { data } = await apiClient.post('/auth/refresh', {
          refresh_token: refreshToken,
        })
        
        // Update access token in context (via event)
        window.dispatchEvent(new CustomEvent('auth-token-refresh', {
          detail: { accessToken: data.access_token }
        }))
        
        processQueue(null, data.access_token)
        error.config.headers.Authorization = `Bearer ${data.access_token}`
        return apiClient(error.config)
      } catch (err) {
        processQueue(err, null)
        tokenUtils.clearRefreshToken()
        window.location.href = '/login'
        throw err
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)
```

### 4.4 API Endpoints (`lib/api/auth.ts`)

```typescript
import apiClient from './client'
import type { User } from '@/lib/types/auth'

export const authApi = {
  register: (name: string, email: string, password: string) =>
    apiClient.post('/auth/register', { name, email, password }),
  
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  
  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refresh_token: refreshToken }),
  
  logout: () =>
    apiClient.post('/auth/logout'),
  
  me: () =>
    apiClient.get<{ user: User; access_token: string }>('/auth/me'),
  
  verifyEmail: (token: string) =>
    apiClient.get(`/verify-email/${token}`),
  
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    apiClient.put('/auth/reset-password', { token, password }),
  
  updateProfile: (name: string) =>
    apiClient.put('/auth/profile', { name }),
  
  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post('/auth/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.put('/auth/change-password', {
      current_password: currentPassword,
      password: newPassword,
    }),
  
  getSessions: () =>
    apiClient.get('/auth/sessions'),
  
  deleteSession: (sessionId: string) =>
    apiClient.delete(`/auth/sessions/${sessionId}`),
  
  getApiTokens: () =>
    apiClient.get('/auth/api-tokens'),
  
  createApiToken: (name: string, expiresAt?: string) =>
    apiClient.post('/auth/api-tokens', { name, expires_at: expiresAt }),
  
  deleteApiToken: (tokenId: string) =>
    apiClient.delete(`/auth/api-tokens/${tokenId}`),
  
  deleteAccount: () =>
    apiClient.delete('/auth/account'),
}
```

### 4.5 Zod Validation Schemas (`lib/validators/auth.schemas.ts`)

```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

export const registerSchema = z.object({
  name: z.string().min(1, 'Name required').max(255),
  email: z.string().email('Invalid email'),
  password: z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number'),
  passwordConfirm: z.string(),
}).refine(d => d.password === d.passwordConfirm, {
  message: 'Passwords do not match',
  path: ['passwordConfirm'],
})

export const resetPasswordSchema = registerSchema.pick({
  password: true,
  passwordConfirm: true,
}).extend({
  token: z.string().min(1, 'Invalid token'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number'),
  newPasswordConfirm: z.string(),
}).refine(d => d.newPassword === d.newPasswordConfirm, {
  message: 'Passwords do not match',
  path: ['newPasswordConfirm'],
})
```

### 4.6 Types (`lib/types/auth.d.ts`)

```typescript
export interface User {
  id: string
  name: string
  email: string
  email_verified_at: string | null
  avatar_url: string | null
  plan: 'free' | 'pro' | 'enterprise'
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticating: boolean
  accessToken: string | null
  error: string | null
}
```

### 4.7 Auth Context (`lib/context/AuthContext.tsx`)

```typescript
'use client'

import React, { createContext, useCallback, useEffect, useState } from 'react'
import { authApi } from '@/lib/api/auth'
import { tokenUtils } from '@/lib/utils/token'
import type { User, AuthState } from '@/lib/types/auth'

export const AuthContext = createContext<{
  state: AuthState
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
} | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticating: false,
    accessToken: null,
    error: null,
  })

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await authApi.me()
        setState(prev => ({
          ...prev,
          user: data.user,
          accessToken: data.access_token,
          isLoading: false,
        }))
      } catch {
        tokenUtils.clearRefreshToken()
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }

    restoreSession()
  }, [])

  // Listen for token refresh events
  useEffect(() => {
    const handleTokenRefresh = (e: any) => {
      setState(prev => ({ ...prev, accessToken: e.detail.accessToken }))
    }

    window.addEventListener('auth-token-refresh', handleTokenRefresh)
    return () => window.removeEventListener('auth-token-refresh', handleTokenRefresh)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isAuthenticating: true, error: null }))
    try {
      const { data } = await authApi.login(email, password)
      tokenUtils.setRefreshToken(data.refresh_token, Date.now() + 7 * 24 * 60 * 60 * 1000)
      setState(prev => ({
        ...prev,
        user: data.user,
        accessToken: data.access_token,
        isAuthenticating: false,
      }))
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed'
      setState(prev => ({ ...prev, error: message, isAuthenticating: false }))
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      tokenUtils.clearRefreshToken()
      setState({
        user: null,
        isLoading: false,
        isAuthenticating: false,
        accessToken: null,
        error: null,
      })
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    setState(prev => ({ ...prev, isAuthenticating: true, error: null }))
    try {
      await authApi.register(name, email, password)
      setState(prev => ({ ...prev, isAuthenticating: false }))
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed'
      setState(prev => ({ ...prev, error: message, isAuthenticating: false }))
      throw err
    }
  }, [])

  return (
    <AuthContext.Provider value={{ state, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### 4.8 useAuth Hook (`lib/hooks/useAuth.ts`)

```typescript
'use client'

import { useContext } from 'react'
import { AuthContext } from '@/lib/context/AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

---

## Step 5: Protect Routes

### 5.1 Root Layout (`app/layout.tsx`)

```typescript
import { AuthProvider } from '@/lib/context/AuthContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### 5.2 Protected Layout (`app/(dashboard)/layout.tsx`)

```typescript
'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { state } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!state.isLoading && !state.user) {
      router.push('/login')
    }
  }, [state.isLoading, state.user, router])

  if (state.isLoading) {
    return <div>Loading...</div> // Show skeleton
  }

  if (!state.user) {
    return null
  }

  return <>{children}</>
}
```

---

## Step 6: Create Login Form Component

### `components/auth/login-form.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { loginSchema } from '@/lib/validators/auth.schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, state } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      loginSchema.parse({ email, password })
      await login(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600">{error}</div>}
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" disabled={state.isAuthenticating}>
        {state.isAuthenticating ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  )
}
```

---

## Testing Your Implementation

### Manual Testing Checklist

- [ ] Register new user → receive verification email
- [ ] Click verification link → auto-login, redirect to dashboard
- [ ] Login with email/password → access dashboard
- [ ] Refresh page → session restored (not logged out)
- [ ] Logout → redirected to login
- [ ] Login attempts: 3 attempts in 60s → blocked
- [ ] Open another browser tab → both tabs show logged in
- [ ] Edit profile → changes reflected immediately
- [ ] Upload avatar → image appears in header
- [ ] Change password → can login with new password
- [ ] View sessions → multiple devices shown
- [ ] Delete session → current session deleted, logged out

### Unit Testing Example

```typescript
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '@/lib/hooks/useAuth'
import { AuthProvider } from '@/lib/context/AuthContext'

describe('useAuth', () => {
  it('should login user', async () => {
    const wrapper = ({ children }: any) => (
      <AuthProvider>{children}</AuthProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login('test@example.com', 'password123')
    })

    expect(result.current.state.user).toBeDefined()
  })
})
```

---

## Common Issues & Solutions

### Issue: "Access token is lost on page reload"
**Solution**: Ensure `GET /auth/me` is called on app mount, and refresh token is in sessionStorage.

### Issue: "401 errors not triggering refresh"
**Solution**: Ensure interceptor is set up in `lib/api/interceptors.ts` and is imported in `lib/api/client.ts`.

### Issue: "Rate limiting not working"
**Solution**: Verify localStorage is enabled and check `lib/utils/rate-limit.ts` implementation.

### Issue: "CORS errors from backend"
**Solution**: Ensure backend has CORS configured to allow your frontend origin.

---

## Debugging Tips

Enable debug mode:
```bash
NEXT_PUBLIC_AUTH_DEBUG=true
```

Then check console logs:
```typescript
if (process.env.NEXT_PUBLIC_AUTH_DEBUG) {
  console.log('Auth state:', state)
  console.log('Access token:', state.accessToken)
}
```

---

## Next Steps

After implementing the basics:
1. Add unit tests for hooks and validators
2. Create integration tests for auth flows
3. Set up E2E tests with Cypress/Playwright
4. Add more profile management pages (sessions, API tokens, account deletion)
5. Implement monitoring and error tracking

---

## Files Created Checklist

- [ ] `lib/api/client.ts` - Axios instance
- [ ] `lib/api/auth.ts` - API endpoints
- [ ] `lib/api/interceptors.ts` - Request/response interceptors
- [ ] `lib/context/AuthContext.tsx` - Auth context provider
- [ ] `lib/hooks/useAuth.ts` - Main auth hook
- [ ] `lib/validators/auth.schemas.ts` - Zod schemas
- [ ] `lib/types/auth.d.ts` - TypeScript types
- [ ] `lib/utils/token.ts` - Token utilities
- [ ] `app/(auth)/login/page.tsx` - Login page
- [ ] `components/auth/login-form.tsx` - Login form
- [ ] `app/(dashboard)/layout.tsx` - Protected layout
- [ ] `.env.local` - Environment configuration

---

**Ready to start coding!** 🚀
