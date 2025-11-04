# API Documentation - Swagger/OpenAPI Setup

## Overview

This document provides comprehensive guidance on setting up and using the Swagger/OpenAPI documentation for the CreativeAI Agent API.

## Quick Start

### Installation

1. **Install Swagger PHP (via Composer)**

```bash
cd backend
composer require zircote/swagger-php
```

2. **Generate Swagger Documentation**

```bash
# Generate OpenAPI spec file
php vendor/bin/openapi swagger.php -o public/swagger/openapi.json
```

3. **Access Swagger UI**

Visit: `http://localhost:8000/swagger/ui` (after configuring web server)

## API Authentication

### JWT Bearer Token

All protected endpoints require a JWT Bearer token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Details:**
- Algorithm: RS256 (RSA)
- Expires: 15 minutes (900 seconds)
- Refresh: Use refresh token endpoint
- Claims: user_id, session_id, iat, exp

## Complete Endpoint Reference

### Authentication Endpoints

#### 1. Register User
- **Method**: POST
- **Path**: `/api/v1/auth/register`
- **Security**: None (Public)
- **Description**: Create a new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "tier": "free"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to confirm your account.",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "tier": "free",
      "email_confirmed_at": null,
      "last_login_at": null,
      "created_at": "2025-11-04T15:51:59Z",
      "updated_at": "2025-11-04T15:51:59Z"
    },
    "confirmation_token": "a1b2c3d4e5f6..."
  }
}
```

**Error Responses:**
- `422 Unprocessable Entity`: Validation errors
  ```json
  {
    "success": false,
    "message": "Validation error occurred.",
    "errors": {
      "email": ["Email is required."],
      "password": ["Password must be at least 8 characters."]
    }
  }
  ```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

#### 2. Confirm Email
- **Method**: POST
- **Path**: `/api/v1/auth/confirm-email`
- **Security**: None (Public)
- **Description**: Verify user email with confirmation token

**Request Body:**
```json
{
  "token": "a1b2c3d4e5f6..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email confirmed successfully. You can now login.",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "tier": "free",
      "email_confirmed_at": "2025-11-04T15:52:00Z",
      "last_login_at": null,
      "created_at": "2025-11-04T15:51:59Z",
      "updated_at": "2025-11-04T15:52:00Z"
    }
  }
}
```

**Error Responses:**
- `422 Unprocessable Entity`: Invalid or expired token

---

#### 3. Login User
- **Method**: POST
- **Path**: `/api/v1/auth/login`
- **Security**: None (Public)
- **Description**: Authenticate user and receive JWT tokens

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "device_remember": false,
  "browser_name": "Chrome",
  "os_name": "macOS"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "tier": "free",
      "email_confirmed_at": "2025-11-04T15:52:00Z",
      "last_login_at": "2025-11-04T15:53:00Z",
      "created_at": "2025-11-04T15:51:59Z",
      "updated_at": "2025-11-04T15:53:00Z"
    },
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "b2c3d4e5f6g7...",
    "token_type": "Bearer",
    "expires_in": 900,
    "session": {
      "id": 1,
      "device_type": "desktop",
      "browser_name": "Chrome",
      "os_name": "macOS",
      "ip_address": "192.168.1.1",
      "last_accessed_at": "2025-11-04T15:53:00Z"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
- `422 Unprocessable Entity`: Email not confirmed

---

#### 4. Refresh Access Token
- **Method**: POST
- **Path**: `/api/v1/auth/refresh`
- **Security**: None (Public)
- **Description**: Get new access token using refresh token

**Request Body:**
```json
{
  "refresh_token": "b2c3d4e5f6g7..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 900
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired refresh token

---

#### 5. Logout User
- **Method**: POST
- **Path**: `/api/v1/auth/logout`
- **Security**: Bearer Token (Required)
- **Description**: Revoke current session

**Headers:**
```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful."
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token

---

#### 6. Get Current User
- **Method**: GET
- **Path**: `/api/v1/auth/me`
- **Security**: Bearer Token (Required)
- **Description**: Retrieve authenticated user's profile

**Headers:**
```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User retrieved successfully.",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "tier": "free",
      "email_confirmed_at": "2025-11-04T15:52:00Z",
      "last_login_at": "2025-11-04T15:53:00Z",
      "created_at": "2025-11-04T15:51:59Z",
      "updated_at": "2025-11-04T15:53:00Z"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token

---

### Password Reset Endpoints

#### 7. Request Password Reset
- **Method**: POST
- **Path**: `/api/v1/auth/forgot-password`
- **Security**: None (Public)
- **Rate Limit**: 3 requests per hour per email
- **Description**: Send password reset link to email

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset link has been sent to your email.",
  "data": {
    "reset_token": "c3d4e5f6g7h8..."
  }
}
```

**Error Responses:**
- `422 Unprocessable Entity`: User not found, or rate limit exceeded
- `429 Too Many Requests`: Rate limit exceeded (3 per hour)

**Rate Limiting:**
- 3 requests per hour per email address
- Rate limit enforced by IP address and email combination

---

#### 8. Verify Reset Token
- **Method**: POST
- **Path**: `/api/v1/auth/verify-reset-token`
- **Security**: None (Public)
- **Description**: Validate password reset token before allowing reset

**Request Body:**
```json
{
  "token": "c3d4e5f6g7h8..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Reset token is valid.",
  "data": {
    "valid": true,
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `422 Unprocessable Entity`: Invalid, expired, or used token
  - Token expires after 1 hour
  - Token becomes invalid after successful reset

---

#### 9. Complete Password Reset
- **Method**: POST
- **Path**: `/api/v1/auth/reset-password`
- **Security**: None (Public)
- **Description**: Change password using reset token

**Request Body:**
```json
{
  "token": "c3d4e5f6g7h8...",
  "password": "NewSecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now login with your new password.",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "tier": "free",
      "email_confirmed_at": "2025-11-04T15:52:00Z",
      "last_login_at": "2025-11-04T15:53:00Z",
      "created_at": "2025-11-04T15:51:59Z",
      "updated_at": "2025-11-04T15:54:00Z"
    }
  }
}
```

**Error Responses:**
- `422 Unprocessable Entity`: Invalid token or password validation failed
  - Invalid or expired token
  - Password doesn't meet requirements
  - Token already used

---

## Data Models

### User Object
```json
{
  "id": 1,
  "name": "string",
  "email": "string (email format)",
  "tier": "string (free|pro|enterprise)",
  "email_confirmed_at": "string (datetime) or null",
  "last_login_at": "string (datetime) or null",
  "created_at": "string (datetime)",
  "updated_at": "string (datetime)"
}
```

**Tier Values:**
- `free`: Free tier with basic features
- `pro`: Professional tier with enhanced features
- `enterprise`: Enterprise tier with all features

---

### Session Object
```json
{
  "id": 1,
  "user_id": 1,
  "device_type": "string (desktop|mobile|tablet)",
  "browser_name": "string",
  "os_name": "string",
  "ip_address": "string",
  "last_accessed_at": "string (datetime)",
  "revoked_at": "string (datetime) or null"
}
```

---

### Token Details

**Access Token (JWT):**
- Format: JWS with RS256 signature
- Expires: 15 minutes (900 seconds)
- Claims:
  - `sub`: User ID
  - `session_id`: Session ID
  - `iat`: Issued at time
  - `exp`: Expiration time

**Refresh Token:**
- Format: Random hex string (64 characters)
- Expires: 30 days
- Stored in database, tied to specific session
- Single-use (after refresh, new tokens issued)

---

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Error message 1", "Error message 2"]
  }
}
```

### HTTP Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful request |
| 201 | Created | Resource successfully created |
| 400 | Bad Request | Invalid request format |
| 401 | Unauthorized | Missing or invalid authentication |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## Authentication Flow Diagram

### Registration & Email Confirmation
```
1. POST /register (name, email, password)
   ↓
2. User created with email_confirmed_at = null
3. Confirmation email sent with token
   ↓
4. User clicks link or POST /confirm-email {token}
   ↓
5. User email confirmed (email_confirmed_at set)
   ↓
6. Ready to login
```

### Login Flow
```
1. POST /login (email, password, device info)
   ↓
2. Credentials validated, email must be confirmed
   ↓
3. Session created with device/browser info
   ↓
4. JWT tokens generated (access + refresh)
   ↓
5. Return: User data + access_token + refresh_token
```

### Token Refresh
```
1. POST /refresh {refresh_token}
   ↓
2. Refresh token validated (not expired, not revoked)
   ↓
3. New access token generated for same session
   ↓
4. Return: New access_token + expires_in
```

### Password Reset
```
1. POST /forgot-password {email}
   ↓
2. Rate limit check (3 per hour per email)
   ↓
3. Reset token generated, expires in 1 hour
   ↓
4. Reset email sent with token
   ↓
5. User receives email and clicks link
   ↓
6. POST /verify-reset-token {token} (optional validation)
   ↓
7. POST /reset-password {token, new_password}
   ↓
8. Password updated, old reset token invalidated
   ↓
9. User can login with new password
```

---

## Usage Examples

### cURL Examples

#### Register User
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "tier": "free"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

#### Get Current User
```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Logout
```bash
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Forgot Password
```bash
curl -X POST http://localhost:8000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

#### Reset Password
```bash
curl -X POST http://localhost:8000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_RESET_TOKEN",
    "password": "NewSecurePass123!"
  }'
```

---

### JavaScript/Fetch Examples

#### Register
```javascript
fetch('http://localhost:8000/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123!',
    tier: 'free'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

#### Login and Store Token
```javascript
fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'SecurePass123!'
  })
})
.then(res => res.json())
.then(data => {
  localStorage.setItem('access_token', data.data.access_token);
  localStorage.setItem('refresh_token', data.data.refresh_token);
  console.log('Login successful');
});
```

#### Get User with Token
```javascript
const token = localStorage.getItem('access_token');
fetch('http://localhost:8000/api/v1/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log(data.data.user));
```

---

## Testing the API

### Prerequisites
- Running backend server (`./docker.sh up`)
- Postman or similar API client
- Access to logs via `./docker.sh logs app`

### Test Sequence

1. **Register** → Receive confirmation_token
2. **Confirm Email** → Use confirmation_token
3. **Login** → Get access_token and refresh_token
4. **Get Me** → Verify authentication works
5. **Refresh Token** → Get new access_token
6. **Forgot Password** → Receive reset_token
7. **Verify Reset Token** → Validate token
8. **Reset Password** → Update password
9. **Login Again** → Verify new password works
10. **Logout** → Revoke session

---

## Security Considerations

### HTTPS in Production
- All endpoints must be served over HTTPS
- Refresh tokens must only be sent over secure connections

### Token Storage
- Access tokens should be stored in memory (not localStorage for SPAs)
- Refresh tokens should be stored in secure httpOnly cookies

### Rate Limiting
- Forgot password: 3 requests per hour per email
- Consider implementing general rate limiting

### CORS Configuration
- Configure CORS headers appropriately
- Only allow trusted origins

### Token Expiration
- Access tokens expire in 15 minutes
- Refresh tokens expire in 30 days
- Implement automatic token refresh in client

---

## Troubleshooting

### 401 Unauthorized
- Token may be expired → Use refresh token
- Token may be revoked → Login again
- Token format incorrect → Should be "Bearer TOKEN"

### 422 Validation Error
- Check error messages in response
- Ensure all required fields are present
- Verify field formats match schema

### 429 Too Many Requests
- Rate limit exceeded
- Wait before retrying
- Check rate limit headers in response

### 500 Internal Server Error
- Check application logs: `./docker.sh logs app`
- Ensure database is running: `./docker.sh ps`
- Verify configuration files are correct

---

## Documentation Generation

### Generate Updated OpenAPI Spec
```bash
cd backend
php vendor/bin/openapi swagger.php -o public/swagger/openapi.json
```

### Using Swagger UI
The generated JSON file can be used with:
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [ReDoc](https://redoc.ly/)
- VS Code extensions

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-04 | Initial release with 9 authentication endpoints |

---

## Support

For API issues or questions:
- Check logs: `./docker.sh logs app`
- Review test cases in `tests/Feature/Api/V1/`
- Contact support: support@creativeai.com

