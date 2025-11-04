# Phase 1: Data Model & Entity Design

**Feature**: Frontend Next.js + Backend Laravel JWT Authentication Integration  
**Date**: 4 de novembro de 2025  
**Status**: Complete

---

## Data Model Overview

This section documents the frontend data model that mirrors the backend entities from Feature 001, plus client-side state management.

---

## Entity Definitions

### 1. User (Frontend Representation)

**Purpose**: Represents the authenticated user. Loaded from `GET /auth/me` endpoint.

**Fields**:
```typescript
interface User {
  id: string                    // UUID from backend
  name: string                  // User's display name
  email: string                 // User's email (verified)
  email_verified_at: string | null  // ISO timestamp or null if unverified
  avatar_url: string | null     // URL to user's avatar image
  plan: 'free' | 'pro' | 'enterprise'  // User's subscription plan
  created_at: string            // ISO timestamp
  updated_at: string            // ISO timestamp
}
```

**Validation Rules** (from spec):
- `name`: 1-255 characters, non-empty
- `email`: Valid email format, unique per system
- `avatar_url`: Valid URL or null
- `plan`: One of: 'free', 'pro', 'enterprise' (from backend)

**State Transitions**:
- New user: `email_verified_at` is null
- After email verification: `email_verified_at` is set to current timestamp
- After avatar upload: `avatar_url` updated
- After profile edit: `name` and/or `avatar_url` updated

**Relationships**:
- Multiple sessions per user (one per device/browser)
- Multiple API tokens per user (Pro/Enterprise only)

---

### 2. Session (Frontend Representation)

**Purpose**: Represents an active user session. Loaded from `GET /auth/sessions` endpoint.

**Fields**:
```typescript
interface Session {
  id: string                    // Session UUID
  device_type: string           // e.g., "desktop", "mobile", "tablet"
  user_agent: string            // Browser/OS info
  ip_address: string            // IP address
  last_activity_at: string      // ISO timestamp of last API call
  created_at: string            // ISO timestamp when session started
  is_current: boolean           // Frontend-only: true if this is current session
}
```

**Validation Rules** (from spec):
- `device_type`: One of known types (backend determines)
- `ip_address`: Valid IPv4/IPv6 address
- `last_activity_at`: ISO timestamp, recent (not older than 30 days)

**Lifecycle**:
- Created: When user logs in
- Active: As long as refresh token is valid and session not revoked
- Terminated: When user logs out, deletes session, or 7-day refresh token expires
- Visible: Only in `GET /auth/sessions` response

**Relationships**:
- One to one with a User
- Multiple per user (one per browser/device)

---

### 3. API Token (Frontend Representation)

**Purpose**: Represents an API credential for Pro/Enterprise users. Loaded from `GET /auth/api-tokens` endpoint.

**Fields**:
```typescript
interface ApiToken {
  id: string                    // Token UUID
  name: string                  // User-defined name (e.g., "Mobile App", "CI/CD Bot")
  last_four: string             // Last 4 characters of token (for identification)
  expires_at: string | null     // ISO timestamp or null if no expiration
  created_at: string            // ISO timestamp
  revoked_at: string | null     // ISO timestamp if revoked, null if active
}
```

**Note**: Full token value is only shown at creation time (once), then never again.

**Validation Rules** (from spec):
- `name`: 1-255 characters, non-empty
- `last_four`: Exactly 4 alphanumeric characters
- `expires_at`: ISO timestamp (future date) or null
- Only visible to Pro/Enterprise users

**Lifecycle**:
- Created: User clicks "Create Token"
- Active: Until expiration or revocation
- Revoked: When user clicks "Revoke"
- Visible: Only in API tokens page (Pro/Enterprise only)

**Relationships**:
- Many per user (Pro/Enterprise only)
- No relationship to sessions (different authentication method)

---

### 4. JWT Token (Client-Side Management)

**Purpose**: Access and refresh tokens for API authentication. Not persisted to server after initial response.

**Fields**:
```typescript
interface AccessToken {
  token: string                 // JWT payload
  expiresAt: number             // Unix timestamp (milliseconds)
  type: 'bearer'                // Token type
}

interface RefreshToken {
  token: string                 // JWT payload
  expiresAt: number             // Unix timestamp (milliseconds)
  type: 'bearer'                // Token type
}
```

**Storage**:
- **Access Token**: Memory only (React state in Context API) - ✅ CLARIFIED
- **Refresh Token**: sessionStorage under key `auth_refresh_token` - ✅ CLARIFIED
- Both tokens must have `expiresAt` for expiration checking

**Lifecycle**:
- Created: After successful login or token refresh
- Active: Until expiration or logout
- Expired: When `expiresAt` < current time
- Cleared: On logout or failed refresh

**Validation Rules** (from spec):
- Access token: Expires in 15 minutes (FR-007, Assumption 5)
- Refresh token: Expires in 7 days (FR-007, Assumption 5)
- Both must be valid JWT format
- Refresh token used only in `POST /auth/refresh` endpoint

---

### 5. Verification Token (Backend-Only)

**Purpose**: Temporary token for email verification and password reset. Managed entirely by backend.

**Note**: Frontend does not store or manipulate verification tokens. Backend validates and returns user + tokens on success.

**Lifecycle**:
- Email verification: `GET /verify-email/{token}` endpoint
- Password reset: `PUT /auth/reset-password` with token + new password
- Both have 1-hour expiration

---

## Authentication State (Frontend)

**Purpose**: Central auth state managed in React Context API.

**Fields**:
```typescript
interface AuthState {
  // User data
  user: User | null             // Current user (null if not logged in)
  
  // Loading states
  isLoading: boolean            // true during initial session restoration
  isAuthenticating: boolean     // true during login/register/refresh
  
  // Session management
  accessToken: string | null    // JWT token in memory (never expose to console/DOM)
  isTokenRefreshing: boolean    // true during automatic token refresh
  
  // Error state
  error: string | null          // Last error message (cleared after display)
  
  // Utility flags
  isAuthenticated: boolean      // true if user is logged in
  emailVerified: boolean        // true if user's email is verified
}
```

**Transitions**:
```
Initial State: { user: null, isLoading: true, accessToken: null }
                    ↓
After restoration (success): { user: {...}, isLoading: false, accessToken: "..." }
After restoration (fail): { user: null, isLoading: false, accessToken: null }
                    ↓
After login: { user: {...}, accessToken: "...", isAuthenticated: true }
                    ↓
Token refresh: isTokenRefreshing: true → then update accessToken
                    ↓
Logout: { user: null, accessToken: null, isAuthenticated: false }
```

---

## Form Data Models

These are transient models used during form submission (not persisted to server).

### Registration Form

```typescript
interface RegisterFormData {
  name: string                  // 1-255 chars
  email: string                 // Valid email format
  password: string              // 8+ chars, uppercase, lowercase, number
  passwordConfirm: string       // Must match password
}

interface RegisterFormErrors {
  name?: string
  email?: string
  password?: string
  passwordConfirm?: string
  submit?: string              // Server-side error
}
```

**Validation** (Zod schema in `lib/validators/auth.schemas.ts`):
- `name`: Non-empty, max 255 chars
- `email`: Valid email format, async check for uniqueness (on blur)
- `password`: 8+ chars, at least one uppercase, lowercase, and digit
- `passwordConfirm`: Exact match with password

---

### Login Form

```typescript
interface LoginFormData {
  email: string                 // Valid email format
  password: string              // Password to verify
}

interface LoginFormErrors {
  email?: string
  password?: string
  submit?: string              // Server-side error (e.g., "Invalid credentials")
}
```

**Validation** (Zod schema):
- `email`: Valid email format, non-empty
- `password`: Non-empty, min 1 char (backend validates)

**Rate Limiting** (localStorage in `lib/utils/rate-limit.ts`):
- Track: `{ count: number, resetTime: timestamp }`
- Limit: 3 attempts per 60 seconds
- Stored under: `auth_attempt_tracker`

---

### Password Reset Form

```typescript
interface ResetPasswordFormData {
  password: string              // 8+ chars, uppercase, lowercase, number
  passwordConfirm: string       // Must match password
  token: string                 // From URL query param
}

interface ResetPasswordFormErrors {
  password?: string
  passwordConfirm?: string
  token?: string
  submit?: string              // Server-side error (e.g., "Token expired")
}
```

**Validation** (Zod schema):
- `password`: Same as registration (8+ chars, complexity)
- `passwordConfirm`: Exact match with password
- `token`: Non-empty, extracted from URL

---

### Profile Edit Form

```typescript
interface EditProfileFormData {
  name: string                  // 1-255 chars
  avatar?: File                 // Optional file upload
}

interface EditProfileFormErrors {
  name?: string
  avatar?: string
  submit?: string
}
```

**Validation** (Zod schema + file validation):
- `name`: Non-empty, max 255 chars
- `avatar`: Optional, file size < 2MB, format in [jpg, png, webp]

---

### Change Password Form

```typescript
interface ChangePasswordFormData {
  currentPassword: string       // Current password verification
  newPassword: string           // 8+ chars, uppercase, lowercase, number
  newPasswordConfirm: string    // Must match newPassword
}

interface ChangePasswordFormErrors {
  currentPassword?: string
  newPassword?: string
  newPasswordConfirm?: string
  submit?: string
}
```

**Validation** (Zod schema):
- `currentPassword`: Non-empty (backend verifies)
- `newPassword`: 8+ chars, complexity rules
- `newPasswordConfirm`: Exact match with newPassword

---

## API Request/Response Contracts

### Authentication Endpoints

#### POST /auth/register

**Request**:
```typescript
{
  name: string          // 1-255 chars
  email: string         // Valid email
  password: string      // 8+ chars with complexity
}
```

**Response** (201 Created):
```typescript
{
  message: string
  user: User           // user without tokens (email_verified_at: null)
}
```

**Response** (422 Unprocessable Entity):
```typescript
{
  message: string
  errors: {
    email?: string[]   // e.g., ["Email already in use"]
    password?: string[]
  }
}
```

---

#### POST /auth/login

**Request**:
```typescript
{
  email: string
  password: string
}
```

**Response** (200 OK):
```typescript
{
  message: string
  user: User
  access_token: string  // JWT, expires in 15 min
  refresh_token: string // JWT, expires in 7 days
}
```

**Response** (422 Unprocessable Entity):
```typescript
{
  message: string  // e.g., "Invalid credentials" or "Email not verified"
}
```

---

#### POST /auth/refresh

**Request**:
```typescript
{
  refresh_token: string
}
```

**Response** (200 OK):
```typescript
{
  message: string
  access_token: string
}
```

**Response** (401 Unauthorized):
```typescript
{
  message: string  // e.g., "Refresh token expired"
}
```

---

#### POST /auth/logout

**Request**: Headers only (Authorization: Bearer {access_token})

**Response** (200 OK):
```typescript
{
  message: string
}
```

---

#### GET /auth/me

**Request**: Headers only (Authorization: Bearer {access_token})

**Response** (200 OK):
```typescript
{
  user: User
  access_token: string  // New token for this session
}
```

**Response** (401 Unauthorized):
```typescript
{
  message: string
}
```

---

#### GET /verify-email/{token}

**Request**: No body, token in URL

**Response** (200 OK):
```typescript
{
  message: string
  user: User
  access_token: string
  refresh_token: string
}
```

**Response** (400 Bad Request):
```typescript
{
  message: string  // e.g., "Token expired" or "Invalid token"
}
```

---

#### POST /auth/forgot-password

**Request**:
```typescript
{
  email: string
}
```

**Response** (200 OK):
```typescript
{
  message: string  // "Email sent" (always, for security)
}
```

---

#### PUT /auth/reset-password

**Request**:
```typescript
{
  token: string
  password: string
}
```

**Response** (200 OK):
```typescript
{
  message: string
  user: User
  access_token: string
  refresh_token: string
}
```

**Response** (422 Unprocessable Entity):
```typescript
{
  message: string
  errors: {
    token?: string[]
    password?: string[]
  }
}
```

---

#### PUT /auth/profile

**Request**:
```typescript
{
  name: string
}
```

**Response** (200 OK):
```typescript
{
  user: User
}
```

---

#### POST /auth/upload-avatar

**Request**: multipart/form-data
```
file: File             // jpg, png, or webp, < 2MB
```

**Response** (200 OK):
```typescript
{
  user: User           // Updated with new avatar_url
}
```

**Response** (422 Unprocessable Entity):
```typescript
{
  message: string
  errors: {
    file?: string[]    // e.g., ["File too large", "Invalid format"]
  }
}
```

---

#### PUT /auth/change-password

**Request**:
```typescript
{
  current_password: string
  password: string
}
```

**Response** (200 OK):
```typescript
{
  message: string
}
```

**Response** (422 Unprocessable Entity):
```typescript
{
  message: string
  errors: {
    current_password?: string[]  // e.g., ["Current password incorrect"]
    password?: string[]
  }
}
```

---

#### GET /auth/sessions

**Request**: Headers only (Authorization: Bearer {access_token})

**Response** (200 OK):
```typescript
{
  sessions: Session[]
}
```

---

#### DELETE /auth/sessions/{id}

**Request**: Headers only (Authorization: Bearer {access_token})

**Response** (200 OK):
```typescript
{
  message: string
}
```

---

#### GET /auth/api-tokens

**Request**: Headers only (Authorization: Bearer {access_token})

**Response** (200 OK):
```typescript
{
  tokens: ApiToken[]   // Without full token value
}
```

**Response** (403 Forbidden):
```typescript
{
  message: string  // "Requires Pro or Enterprise plan"
}
```

---

#### POST /auth/api-tokens

**Request**:
```typescript
{
  name: string
  expires_at?: string  // ISO timestamp (optional)
}
```

**Response** (201 Created):
```typescript
{
  message: string
  token: string         // Full token (shown once!)
  api_token: ApiToken   // With last_four field
}
```

**Response** (403 Forbidden):
```typescript
{
  message: string  // "Requires Pro or Enterprise plan"
}
```

---

#### DELETE /auth/api-tokens/{id}

**Request**: Headers only (Authorization: Bearer {access_token})

**Response** (200 OK):
```typescript
{
  message: string
}
```

**Response** (403 Forbidden):
```typescript
{
  message: string  // "Requires Pro or Enterprise plan"
}
```

---

#### DELETE /auth/account

**Request**: Headers only (Authorization: Bearer {access_token})

**Response** (200 OK):
```typescript
{
  message: string  // "Account scheduled for deletion"
}
```

---

## Storage Schema

### sessionStorage

**Key**: `auth_refresh_token`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": 1704067200000
}
```

---

### localStorage

**Key**: `auth_attempt_tracker`
```json
{
  "count": 2,
  "resetTime": 1699016400000
}
```

---

## State Normalization

To prevent data inconsistency, maintain single source of truth:

1. **User Data**: From Context API (updated on `GET /auth/me` or form submission)
2. **Sessions**: Loaded on-demand from `GET /auth/sessions` (not cached long-term)
3. **API Tokens**: Loaded on-demand from `GET /auth/api-tokens` (not cached long-term)
4. **Tokens**: Access token in memory (Context), Refresh token in sessionStorage

No local caching of session or API token lists - always fetch from server to ensure consistency.

---

## Type Safety

All entities defined in `lib/types/`:

```typescript
// lib/types/auth.d.ts
export interface User { ... }
export interface Session { ... }
export interface ApiToken { ... }

// lib/types/api.d.ts
export interface LoginRequest { ... }
export interface LoginResponse { ... }
// ... all API types

// lib/types/forms.d.ts
export interface LoginFormData { ... }
export interface RegisterFormData { ... }
// ... all form types
```

---

## Validation Rules (Zod Schemas)

All schemas in `lib/validators/auth.schemas.ts`:

```typescript
import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string()
    .min(8, "Minimum 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain number"),
  passwordConfirm: z.string(),
}).refine(data => data.password === data.passwordConfirm, {
  message: "Passwords don't match",
  path: ["passwordConfirm"],
})

// ... other schemas follow similar pattern
```

---

## Backward Compatibility

- All entities include `created_at` and `updated_at` timestamps
- No required fields will be added to User/Session/ApiToken in future
- New optional fields will be handled gracefully (default to null/undefined)
- API versioning: `/api/v1/` endpoint prefix allows future `/api/v2/` without breaking changes

---

## Summary

**Data model is clean, well-defined, and fully typed.**
- ✅ All entities mapped to backend (Feature 001)
- ✅ Client-side state properly structured
- ✅ API contracts defined for all endpoints
- ✅ Form data models with validation
- ✅ Storage schema explicit
- ✅ Type safety via TypeScript + Zod

**Ready for Phase 1 completion: API contracts generation** ✅
