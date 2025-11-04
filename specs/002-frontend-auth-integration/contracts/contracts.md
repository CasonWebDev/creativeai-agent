# API Contracts Documentation

## Overview

This directory contains the OpenAPI 3.0 specifications for the CreativeAI Authentication API. These contracts define the contract between the Next.js frontend and Laravel backend for all authentication-related operations.

**Base URL**: 
- Development: `http://localhost:8000/api/v1`
- Production: `https://api.creativeai.dev/api/v1`

**Authentication**: JWT Bearer token in Authorization header
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### Register
- **Endpoint**: `POST /auth/register`
- **Authentication**: None
- **Request**: `name`, `email`, `password`
- **Response**: User object + auto-login credentials (access_token, refresh_token)
- **Status Codes**: 
  - `201`: Registration successful
  - `422`: Validation error (duplicate email, invalid password, etc.)
- **Triggers**: Email verification flow (frontend redirects to `/verify-email` page)

### Login
- **Endpoint**: `POST /auth/login`
- **Authentication**: None
- **Request**: `email`, `password`
- **Response**: User object + tokens (access_token, refresh_token)
- **Status Codes**:
  - `200`: Login successful
  - `422`: Invalid credentials
- **Rate Limiting**: 3 attempts per minute (frontend enforces via localStorage counter)

### Refresh Access Token
- **Endpoint**: `POST /auth/refresh`
- **Authentication**: None (uses refresh_token in body)
- **Request**: `refresh_token` (from sessionStorage)
- **Response**: New `access_token` (15 min expiration)
- **Status Codes**:
  - `200`: Token refreshed
  - `401`: Refresh token expired or invalid (user must re-login)
- **Automatic Handling**: Response interceptor detects 401 and automatically calls this endpoint

### Logout
- **Endpoint**: `POST /auth/logout`
- **Authentication**: Required (Bearer token)
- **Request**: Empty body
- **Response**: Success message
- **Status Codes**:
  - `200`: Logged out successfully
  - `401`: Unauthorized
- **Action**: Invalidates refresh token on backend; frontend clears access_token (memory) and refresh_token (sessionStorage)

### Get Current User
- **Endpoint**: `GET /auth/me`
- **Authentication**: Required (Bearer token)
- **Request**: Empty
- **Response**: Current user object + new access_token
- **Status Codes**:
  - `200`: User data retrieved
  - `401`: Unauthorized
- **Use Case**: App initialization (restore session from refresh_token in sessionStorage)
- **Frontend Behavior**: Called on mount in `AuthContext`, restores user state if successful

---

## Email Verification Endpoints

### Verify Email
- **Endpoint**: `GET /verify-email/{token}`
- **Authentication**: None
- **Request**: Token in URL path (from email link)
- **Response**: Login response (auto-login) with access_token and refresh_token
- **Status Codes**:
  - `200`: Email verified, logged in
  - `400`: Invalid or expired token (1-hour expiration)
- **Frontend Behavior**: Extract token from email link, redirect to `/auth/verify-email?token=...`, call endpoint, auto-login if successful

---

## Password Reset Endpoints

### Forgot Password
- **Endpoint**: `POST /auth/forgot-password`
- **Authentication**: None
- **Request**: `email`
- **Response**: Success message (always succeeds, for security)
- **Status Codes**: `200`: Email sent (or would be sent for unknown emails, for security)
- **Frontend Behavior**: After success, display message "Check your email for reset link"

### Reset Password
- **Endpoint**: `PUT /auth/reset-password`
- **Authentication**: None
- **Request**: `token` (from email link), `password` (new password, min 8 chars)
- **Response**: Login response (auto-login) with tokens
- **Status Codes**:
  - `200`: Password reset and logged in
  - `422`: Validation error or expired token (1-hour expiration)
- **Frontend Behavior**: Extract token from email link, display form for new password, call endpoint, auto-login if successful

---

## Profile Management Endpoints

### Update Profile
- **Endpoint**: `PUT /auth/profile`
- **Authentication**: Required
- **Request**: `name` (optional)
- **Response**: Updated user object
- **Status Codes**:
  - `200`: Profile updated
  - `401`: Unauthorized
  - `422`: Validation error

### Upload Avatar
- **Endpoint**: `POST /auth/upload-avatar`
- **Authentication**: Required
- **Request**: Multipart form data with `file` (jpg, png, webp, max 2MB)
- **Response**: Updated user object with `avatar_url`
- **Status Codes**:
  - `200`: Avatar uploaded
  - `401`: Unauthorized
  - `422`: Invalid file format or size

### Change Password
- **Endpoint**: `PUT /auth/change-password`
- **Authentication**: Required
- **Request**: `current_password`, `password` (new, min 8 chars)
- **Response**: Success message
- **Status Codes**:
  - `200`: Password changed
  - `401`: Unauthorized
  - `422`: Validation error (incorrect current password, weak password, etc.)
- **Frontend Behavior**: Display two-field form (current + new password), validate with Zod, show error if current password incorrect

---

## Session Management Endpoints

### List Sessions
- **Endpoint**: `GET /auth/sessions`
- **Authentication**: Required
- **Request**: Empty
- **Response**: Array of session objects
- **Status Codes**:
  - `200`: Sessions retrieved
  - `401`: Unauthorized
- **Session Fields**: `id`, `device_type`, `user_agent`, `ip_address`, `last_activity_at`, `created_at`
- **Frontend Behavior**: Display list of active sessions, mark current session, allow deletion of others

### Delete Session
- **Endpoint**: `DELETE /auth/sessions/{id}`
- **Authentication**: Required
- **Request**: Session ID in path
- **Response**: Success message
- **Status Codes**:
  - `200`: Session deleted (user logged out from that device)
  - `401`: Unauthorized
- **Frontend Behavior**: Allow users to remotely logout other sessions; prevent deletion of current session

---

## API Token Management Endpoints

### List API Tokens
- **Endpoint**: `GET /auth/api-tokens`
- **Authentication**: Required
- **Plan Requirement**: Pro or Enterprise
- **Request**: Empty
- **Response**: Array of API token objects (masked)
- **Status Codes**:
  - `200`: Tokens retrieved
  - `401`: Unauthorized
  - `403`: Free plan (upgrade required)

### Create API Token
- **Endpoint**: `POST /auth/api-tokens`
- **Authentication**: Required
- **Plan Requirement**: Pro or Enterprise
- **Request**: `name` (string), `expires_at` (optional, ISO date-time)
- **Response**: Full token string (shown once) + masked token object
- **Status Codes**:
  - `201`: Token created
  - `401`: Unauthorized
  - `403`: Free plan (upgrade required)
- **Frontend Behavior**: Display token creation form, show token string in modal (copy-to-clipboard), store securely in backend, don't show again
- **UX Warning**: "Make sure to save this token. You won't be able to see it again!"

### Revoke API Token
- **Endpoint**: `DELETE /auth/api-tokens/{id}`
- **Authentication**: Required
- **Plan Requirement**: Pro or Enterprise
- **Request**: Token ID in path
- **Response**: Success message
- **Status Codes**:
  - `200`: Token revoked
  - `401`: Unauthorized
  - `403`: Free plan (upgrade required)
- **Frontend Behavior**: Confirm deletion, remove from list on success

---

## Account Management Endpoints

### Request Account Deletion
- **Endpoint**: `DELETE /auth/account`
- **Authentication**: Required
- **Request**: Empty body
- **Response**: Success message with grace period (30 days)
- **Status Codes**:
  - `200`: Account scheduled for deletion
  - `401`: Unauthorized
- **Frontend Behavior**: Display confirmation dialog with 30-day grace period notice, confirm password before deletion
- **Backend Behavior**: Mark account as deleted, keep data for 30 days, allow reactivation, then purge after 30 days (GDPR compliance)

---

## HTTP Status Codes Reference

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Proceed with response data |
| 201 | Created | Proceed with response data |
| 400 | Bad Request | Display error message to user |
| 401 | Unauthorized | Clear tokens, redirect to login |
| 403 | Forbidden | Show plan upgrade message (e.g., API tokens) |
| 422 | Validation Error | Show field-level errors from `errors` object |
| 500 | Server Error | Show generic error, log to monitoring |

---

## Error Response Format

All error responses follow this format:

```json
{
  "message": "Error description",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

**Example 422 Response**:
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["Email already exists"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

---

## Token Management

### Access Token
- **Type**: JWT (HS256)
- **Expiration**: 15 minutes
- **Storage**: Memory (React state) - NOT persisted
- **Loss**: Lost on page reload; requires refresh_token to restore
- **Header**: `Authorization: Bearer {access_token}`

### Refresh Token
- **Type**: JWT (HS256)
- **Expiration**: 7 days
- **Storage**: sessionStorage (secure, cleared on browser close)
- **Loss**: Lost on browser close; requires re-login
- **Endpoint**: `POST /auth/refresh` (called when access_token expires)

### Token Refresh Flow
1. Frontend attempts API call with access_token
2. Backend returns `401` if access_token expired
3. Response interceptor detects 401
4. Interceptor queues concurrent requests
5. Interceptor calls `POST /auth/refresh` with refresh_token from sessionStorage
6. Backend validates refresh_token, returns new access_token
7. Interceptor updates access_token in memory
8. Interceptor retries original request with new token
9. If refresh fails (401), user redirected to login

---

## Rate Limiting

### Login Rate Limiting
- **Limit**: 3 attempts per 60 seconds
- **Storage**: localStorage counter (persists across page reloads)
- **Frontend Implementation**: Check counter before submitting login form
- **Behavior**: 
  - 1st-3rd attempts: Allow
  - After 3rd attempt: Show "Too many attempts. Try again in X seconds"
  - Counter resets after 60 seconds
- **Backend**: Also enforces rate limiting (defense in depth)

---

## Full OpenAPI Specification

For the complete, machine-readable OpenAPI 3.0 specification, see:
- **File**: `auth-api.yaml`
- **Usage**: Import into Postman, Swagger UI, or other tools for interactive documentation
- **Validation**: Valid OpenAPI 3.0.3 specification

---

## Integration Examples

### JavaScript/TypeScript (Axios)
```typescript
// Login
const response = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});
const { access_token, refresh_token, user } = response.data;

// Refresh token
const response = await api.post('/auth/refresh', {
  refresh_token: sessionStorage.getItem('auth_refresh_token')
});
const { access_token } = response.data;

// Protected request (auto-refresh on 401)
const response = await api.get('/auth/me');
```

### cURL Examples
```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get current user
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer {access_token}"

# Refresh token
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"{refresh_token}"}'
```

---

## Support & Documentation

For more details, see:
- `data-model.md` - Entity definitions and API contracts
- `quickstart.md` - Step-by-step implementation guide
- `research.md` - Technical decisions and rationale
