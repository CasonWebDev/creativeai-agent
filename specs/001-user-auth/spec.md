# Feature Specification: User Authentication & Management System

**Feature Branch**: `001-user-auth`  
**Created**: 2025-11-04  
**Status**: Draft  
**Input**: User description: "Sistema de Autenticação e Gestão de Usuários - Complete authentication, authorization, and user management system for CreativeAI Agent backend"

## User Scenarios & Testing

### User Story 1 - Self-Service Registration (Priority: P1)

A new user wants to create an account to start using the CreativeAI Agent platform. They should be able to provide their email, name, and password, receive a confirmation email, and activate their account independently without admin intervention.

**Why this priority**: Registration is the entry point to the platform. Without this, users cannot access any features. This is the foundation of all other functionality.

**Independent Test**: Can be fully tested by attempting registration with valid credentials, receiving confirmation email, clicking activation link, and verifying account is active for login.

**Acceptance Scenarios**:

1. **Given** no account exists, **When** user submits valid registration form (name, email, password), **Then** confirmation email is sent and account is created in inactive state
2. **Given** confirmation email received, **When** user clicks activation link, **Then** account is activated and user can log in
3. **Given** user attempts registration with duplicate email, **When** form is submitted, **Then** user receives clear error message without exposing security details
4. **Given** user attempts registration with weak password, **When** form is submitted, **Then** system rejects with specific requirements (min 8 chars, uppercase, lowercase, numbers)
5. **Given** activation link expires (>1 hour old), **When** user clicks link, **Then** user sees message to request new confirmation email

---

### User Story 2 - Secure User Login (Priority: P1)

A registered user wants to log in with their email and password to access the platform. They should receive secure tokens that allow them to make authenticated requests and remain logged in across sessions.

**Why this priority**: Login is critical for user access. Without authentication, no protected features are accessible. This directly impacts user experience and platform security.

**Independent Test**: Can be fully tested by logging in with valid credentials, verifying JWT tokens are returned with correct expiration times, using token to access protected resource, and verifying expired token is rejected.

**Acceptance Scenarios**:

1. **Given** valid user account, **When** user logs in with correct email and password, **Then** system returns access token (15 min TTL) and refresh token (30 day TTL)
2. **Given** valid user account, **When** user logs in with incorrect password 5 times, **Then** account is locked for 15 minutes
3. **Given** account locked after failed attempts, **When** user tries to login before lockout expires, **Then** system shows remaining lockout time
4. **Given** valid user login, **When** user selects "remember this device" option, **Then** refresh token TTL extends to 90 days
5. **Given** user logged in, **When** user makes request with valid access token, **Then** request is accepted
6. **Given** user logged in, **When** access token expires, **Then** user receives 401 Unauthorized response

---

### User Story 3 - Automatic Session Refresh (Priority: P1)

A logged-in user should not be interrupted while using the application. If their access token is about to expire, the system should automatically refresh it using their refresh token, keeping them logged in seamlessly.

**Why this priority**: Automatic refresh improves user experience by eliminating unexpected logouts during active sessions. This is essential for productivity with long-running tasks.

**Independent Test**: Can be fully tested by simulating token near expiration, making request with nearly-expired token, verifying system issues new token automatically, and subsequent request succeeds.

**Acceptance Scenarios**:

1. **Given** user has valid refresh token with >7 days remaining, **When** refresh is triggered before token expires, **Then** new access token (15 min) and refresh token (30 day) are issued
2. **Given** refresh token has <7 days remaining, **When** automatic refresh occurs, **Then** refresh token is reset to full 30-day TTL
3. **Given** refresh token is expired, **When** user attempts to refresh, **Then** system returns 401 Unauthorized and user must log in again
4. **Given** user logs in with 90-day refresh token (remembered device), **When** refresh occurs, **Then** new refresh token maintains 90-day TTL (does not revert to 30 days)

---

### User Story 4 - Password Reset Flow (Priority: P1)

A user who forgot their password should be able to request a password reset via email. They receive a secure link, set a new password, and regain access to their account without needing admin assistance.

**Why this priority**: Users frequently forget passwords. Without self-service reset, users are locked out and support burden increases significantly.

**Independent Test**: Can be fully tested by requesting password reset, receiving email with valid link, setting new password via link, and verifying login works with new password.

**Acceptance Scenarios**:

1. **Given** registered user, **When** user requests password reset for their email, **Then** reset email is sent and confirmation message shows (without confirming email exists)
2. **Given** reset email received, **When** user clicks reset link within 1 hour, **Then** user is shown form to set new password
3. **Given** reset link received, **When** user clicks link after 1 hour, **Then** link is expired and user sees error message
4. **Given** valid reset link, **When** user sets new password (meets requirements), **Then** password is updated and user can log in immediately
5. **Given** password reset completed, **When** old password is used for login, **Then** login fails

---

### User Story 5 - User Profile Management (Priority: P2)

A logged-in user wants to view and edit their profile information, upload a profile picture, and manage security settings like changing their password. They should see their current account status and usage tier.

**Why this priority**: Profile management is essential for user autonomy but is secondary to core authentication. Users need this before they engage deeply with the platform.

**Independent Test**: Can be fully tested by viewing profile, editing name, uploading photo, changing password, and verifying changes persist across sessions.

**Acceptance Scenarios**:

1. **Given** authenticated user, **When** user accesses their profile, **Then** they see name, email, creation date, plan tier, and monthly usage stats
2. **Given** user in profile, **When** user updates their full name, **Then** change is saved and reflected immediately
3. **Given** user in profile, **When** user uploads profile photo (JPG/PNG/WebP, <2MB), **Then** photo is stored and displayed
4. **Given** user uploads invalid file (>2MB or unsupported format), **When** upload is attempted, **Then** user sees clear error message
5. **Given** authenticated user, **When** user changes password (providing current password), **Then** new password is set and they remain logged in
6. **Given** user changes password, **When** they try to login with old password, **Then** login fails

---

### User Story 6 - Session & Device Management (Priority: P2)

A security-conscious user wants to see all their active sessions and devices. They should be able to terminate any session remotely and ensure no unauthorized access to their account from unknown devices.

**Why this priority**: Session management is important for security but less critical than initial authentication. Power users and security-aware users strongly demand this.

**Independent Test**: Can be fully tested by logging in from multiple browsers, viewing all active sessions with device info, terminating specific sessions, and verifying access from terminated session fails.

**Acceptance Scenarios**:

1. **Given** authenticated user, **When** user views active sessions, **Then** they see list of all sessions with: device type, IP address, last access time, current device marked
2. **Given** multiple active sessions, **When** user terminates one specific session, **Then** that session's token is invalidated immediately
3. **Given** multiple active sessions, **When** user selects "terminate all other sessions", **Then** all sessions except current are invalidated
4. **Given** terminated session, **When** user tries to make request with terminated session token, **Then** request is rejected with 401

---

### User Story 7 - Plan Tier Management (Priority: P2)

A user wants to understand their current plan (Free, Pro, Enterprise), see their monthly usage against plan limits, and be aware of upgrade options. The system should enforce usage limits and notify users approaching limits.

**Why this priority**: Plan management is essential for monetization and resource fairness, but implementation can happen after core auth is working. Supports business model viability.

**Independent Test**: Can be fully tested by viewing current plan, checking usage dashboard, performing actions near limit (image generations), and verifying system prevents exceeding limit.

**Acceptance Scenarios**:

1. **Given** authenticated user, **When** user views their dashboard, **Then** current plan tier is displayed with monthly usage (e.g., "5/200 images generated")
2. **Given** user on Free tier, **When** they reach monthly limit (10 image generations), **Then** next generation request is rejected with message about upgrading
3. **Given** user on Pro tier, **When** they reach 80% of monthly limit, **Then** system sends warning notification
4. **Given** user on Pro tier, **When** they reach 100% of monthly limit, **Then** next action is blocked and critical alert is shown
5. **Given** user on Enterprise tier, **When** they attempt any generation, **Then** request succeeds (no monthly limit applies)

---

### User Story 8 - API Token Management (Priority: P3)

A Pro or Enterprise user wants to generate API tokens to access the platform programmatically. They should be able to create multiple tokens with scoped permissions, view when tokens were last used, and revoke tokens when they're compromised or no longer needed.

**Why this priority**: API tokens enable integration scenarios and advanced use cases, but are not required for core platform functionality. P3 allows focus on user-facing features first.

**Independent Test**: Can be fully tested by generating API token, using token in API calls, viewing token usage, and revoking token to verify subsequent calls fail.

**Acceptance Scenarios**:

1. **Given** authenticated Pro/Enterprise user, **When** user generates new API token with name and scopes, **Then** token is created and shown once (user must copy immediately)
2. **Given** user with existing API token, **When** user makes API request with valid token, **Then** request is accepted and last-used timestamp is updated
3. **Given** user with API token, **When** user views tokens list, **Then** they see: token name, creation date, last used date, current scopes
4. **Given** user with API token, **When** user revokes token, **Then** token is deleted and subsequent API requests with that token fail with 401
5. **Given** Free tier user, **When** they attempt to generate API token, **Then** system shows message that this requires Pro or Enterprise plan

---

### Edge Cases

- What happens when user's email is changed but old email is used for login? → System rejects login, user must use new email
- What happens if user requests password reset multiple times in short period? → Each reset request is valid, old links are invalidated when new reset is issued
- What happens if user's refresh token expires while they're actively using the app? → Access token remains valid; refresh only occurs when access token needs renewal
- What happens if user deletes account and immediately tries to log in? → Login fails; account is in soft-delete state for 30 days before permanent deletion
- What happens if rate limiting blocks a user (5 failed logins)? → User sees friendly message with countdown timer; legitimate user can request support if account compromised
- What happens if user logs in from two different devices simultaneously? → Both sessions are valid; user can manage both independently
- What happens if refresh token is compromised? → Attacker can only obtain new access tokens (short-lived); user should revoke from device management

## Requirements

### Functional Requirements

**Authentication & Tokens**:
- **FR-001**: System MUST validate email format and uniqueness before registration completion
- **FR-002**: System MUST send email confirmation link (valid for 1 hour) during registration; account remains inactive until confirmed
- **FR-003**: System MUST generate JWT access tokens (RS256 signed) with 15-minute expiration for authenticated users
- **FR-004**: System MUST generate refresh tokens with 30-day expiration; extend to 90 days when "remember device" is selected
- **FR-005**: System MUST implement login rate limiting: 5 failed attempts trigger 15-minute account lockout
- **FR-006**: System MUST log all authentication attempts (success/failure) with timestamp, IP address, and user agent
- **FR-007**: System MUST automatically refresh access token when refresh token is valid and <7 days old at next refresh
- **FR-008**: System MUST allow password reset via email with token valid for 1 hour; reset invalidates all active sessions

**User Profiles**:
- **FR-009**: System MUST allow authenticated users to view their profile (name, email, created date, tier, usage)
- **FR-010**: System MUST allow users to update their full name; change must be validated (non-empty, <255 chars)
- **FR-011**: System MUST allow users to upload profile photo (JPG/PNG/WebP only, max 2MB); store in S3-compatible storage
- **FR-012**: System MUST allow users to change password requiring current password verification and new password strength validation

**Sessions & Security**:
- **FR-013**: System MUST track active sessions per user with: device/browser type, IP address, user agent, creation time, last access time
- **FR-014**: System MUST allow users to view all active sessions and terminate any session remotely
- **FR-015**: System MUST allow users to terminate all sessions except current in one action
- **FR-016**: System MUST invalidate refresh token when session is terminated, causing 401 on next API request

**Plan & Usage Tracking**:
- **FR-017**: System MUST track monthly usage (reset on day 1 of each month) per user: image generations, video minutes, API calls
- **FR-018**: System MUST enforce plan limits: Free (10 images/month, 5 projects), Pro (200 images/month, unlimited projects), Enterprise (unlimited)
- **FR-019**: System MUST prevent actions exceeding plan limits; return 402 Payment Required with message about upgrading
- **FR-020**: System MUST send notifications when user reaches 80% and 100% of monthly quota
- **FR-021**: System MUST display plan tier, usage, and next reset date on user dashboard

**API Tokens** (Pro/Enterprise only):
- **FR-022**: System MUST allow Pro/Enterprise users to generate API tokens with name, scopes, and creation timestamp
- **FR-023**: System MUST return API token only once at creation; user must copy and save immediately
- **FR-024**: System MUST allow users to list all API tokens with: name, creation date, last used date, scopes
- **FR-025**: System MUST allow users to revoke API tokens; revoked tokens are deleted and cannot be used
- **FR-026**: System MUST enforce rate limiting on API token usage: 60 requests/minute per token
- **FR-027**: System MUST reject Free tier users attempting to generate API tokens

**Account Closure**:
- **FR-028**: System MUST support account deletion via "soft delete" - account marked for deletion for 30 days
- **FR-029**: System MUST allow users to restore deleted account within 30-day grace period
- **FR-030**: System MUST permanently delete account after 30 days if not restored

### Key Entities

- **User**: Represents a platform user with email, name, password hash, tier (Free/Pro/Enterprise), registration date, last login date, deleted status
- **Session**: Represents an active login session with user_id, refresh_token, device info (browser type, OS, IP), creation time, last access time, expires_at
- **PasswordReset**: Represents password reset request with user_id, token hash, email, created_at, expires_at, used_at
- **EmailConfirmation**: Represents registration confirmation with user_id, token hash, email, created_at, expires_at, confirmed_at
- **UsageMetric**: Tracks monthly usage per user with user_id, month, metric_type (images/videos/api_calls), count, tier_limit
- **ApiToken**: Represents API token for programmatic access with user_id, token_hash, name, scopes, created_at, last_used_at, revoked_at
- **AuditLog**: Immutable record of authentication events with user_id, action, IP, user_agent, success, timestamp

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can complete registration to first login (email confirmation included) in under 3 minutes
- **SC-002**: Authentication endpoint responds to login requests in <200ms p95 latency
- **SC-003**: System processes 1000 concurrent login requests without degradation
- **SC-004**: 95% of password reset emails arrive within 2 minutes of request
- **SC-005**: Access token refresh occurs without user interruption (transparent to user)
- **SC-006**: Rate limiting correctly blocks >5 failed login attempts and releases block after 15 minutes
- **SC-007**: 99% of JWT token validations complete in <10ms (including Redis cache lookup)
- **SC-008**: Usage tracking is accurate within 99% margin (counts match action logs)
- **SC-009**: All authentication endpoints have OpenAPI documentation with examples
- **SC-010**: Unit test coverage for authentication logic is ≥80%
- **SC-011**: Integration tests cover all user flows: registration, login, refresh, password reset, profile update, session management
- **SC-012**: Zero plaintext passwords stored; all passwords verified with bcrypt
- **SC-013**: 100% of authentication events are logged in audit trail

### Assumptions

- Email delivery is reliable (96%+ success rate) for confirmation and reset emails; email provider handles retries
- PostgreSQL is available and configured with appropriate indexes for user lookups
- Redis is available for session/token caching and rate limiting
- S3-compatible storage is configured for profile photos and assets
- JWT signing keys (public/private keypair) are securely managed in environment variables
- HTTPS is enforced in production; development uses HTTP for local Docker containers
- Frontend handles token refresh logic transparently to user (calls refresh endpoint before token expiration)
- Users have modern browsers supporting standard cookie and header handling
- Initial integration is email/password only; OAuth2 (Google) is documented for future implementation

### Out of Scope (Future Features)

- OAuth2/Google integration (documented for future sprint)
- Two-factor authentication (MFA) - documented for security roadmap
- Social login options (GitHub, Discord)
- SAML/enterprise SSO
- Biometric authentication
- Passwordless authentication (magic links)
- API rate limiting per tier (separate feature)
