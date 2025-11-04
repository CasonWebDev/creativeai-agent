# Feature Specification: Frontend Next.js + Backend Laravel JWT Authentication Integration

**Feature Branch**: `002-frontend-auth-integration`  
**Created**: 4 de novembro de 2025  
**Status**: Draft  
**Input**: Integração Frontend Next.js + Backend Laravel - Autenticação com JWT, renovação automática, verificação email, reset senha, perfil, sessões e API tokens

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Registration with Email Verification (Priority: P1)

A new user creates an account with email and password, receives a verification email, and gains access to the dashboard after confirming their email address.

**Why this priority**: User registration is the entry point to the system; without it, no other features are accessible. This is the foundation of the user base.

**Independent Test**: Can be fully tested by submitting a registration form with valid data and verifying email confirmation workflow delivers a functioning authenticated user account.

**Acceptance Scenarios**:

1. **Given** user is on the registration page, **When** they fill out the form with name, email, and password (8+ chars with uppercase, lowercase, number), **Then** the form validates in real-time and displays validation errors inline.
2. **Given** valid registration data is submitted, **When** the form is submitted, **Then** the user receives a success message and is redirected to the email verification page with the email address displayed.
3. **Given** user has registered successfully, **When** they click the verification link from their email, **Then** their account is marked as verified and they are logged in automatically, redirected to the dashboard.
4. **Given** user has not received a verification email, **When** they request resend from the verification page, **Then** a new verification email is sent and they see a success toast notification.
5. **Given** user provides mismatched passwords or invalid email during registration, **When** they attempt submission, **Then** the form displays specific validation error messages and does not submit.

---

### User Story 2 - User Login with JWT Token Management (Priority: P1)

An existing user logs in with email and password, receives JWT tokens, and can maintain their authenticated session across browser refreshes.

**Why this priority**: Login is critical for core functionality; every authenticated feature depends on this. Token management directly enables other features like profile access and data synchronization.

**Independent Test**: Can be fully tested by logging in with valid credentials, verifying tokens are stored, and confirming persistence across page reloads.

**Acceptance Scenarios**:

1. **Given** user is on the login page, **When** they enter valid email and password and submit, **Then** they receive a success message and are redirected to the dashboard.
2. **Given** valid login credentials are submitted, **When** the response is received, **Then** the access token is stored in memory (state) and refresh token is stored in secure storage (localStorage/sessionStorage).
3. **Given** user has logged in successfully, **When** they refresh the browser, **Then** the user session is maintained and they remain on the dashboard without re-authenticating.
4. **Given** user has an active session and the access token expires, **When** they make an API request, **Then** the refresh token is used to automatically obtain a new access token and the request is retried transparently.
5. **Given** user enters invalid credentials, **When** they submit the login form, **Then** they see a clear error message (e.g., "Invalid email or password") and remain on the login page.
6. **Given** user's email is unverified, **When** they log in, **Then** they are redirected to the email verification page instead of the dashboard.

*Note: "Remember Me" functionality is deferred to future releases (see Out of Scope).*

---

### User Story 3 - Automatic Token Refresh (Priority: P1)

When a user's access token expires, the system automatically uses the refresh token to obtain a new access token without requiring manual re-authentication.

**Why this priority**: This feature ensures seamless user experience; without automatic refresh, users would be logged out frequently, creating friction and poor UX.

**Independent Test**: Can be fully tested by making API requests after token expiration and verifying they succeed transparently.

**Acceptance Scenarios**:

1. **Given** user has a valid access token that is about to expire, **When** they make an API request, **Then** the system detects the 401 response and automatically calls the refresh endpoint with the refresh token.
2. **Given** the refresh endpoint returns a new access token successfully, **When** the original request is retried, **Then** it succeeds with the new token and the user sees no interruption.
3. **Given** the refresh token is also expired or invalid, **When** the refresh attempt fails, **Then** the user is logged out automatically, tokens are cleared, and they are redirected to the login page with a session expired message.
4. **Given** multiple requests arrive simultaneously while a token refresh is in progress, **When** the refresh completes, **Then** all queued requests are retried with the new token (no duplicate refresh calls).
5. **Given** a refresh attempt fails, **When** another API request is made, **Then** the system does not retry the refresh again (max 1 retry per request).

---

### User Story 4 - Password Reset via Email (Priority: P2)

A user who forgot their password can request a password reset link via email, set a new password, and log in with the new credentials.

**Why this priority**: Essential for account recovery and security, but only needed when users forget credentials (less frequent than P1 flows). Supports the registration/login user journey by enabling account access recovery.

**Independent Test**: Can be fully tested by requesting password reset, clicking the email link, setting new password, and logging in with new credentials.

**Acceptance Scenarios**:

1. **Given** user is on the forgot password page, **When** they enter their email and submit, **Then** they see a success message confirming an email was sent, regardless of whether the email exists in the system (for security).
2. **Given** user receives the password reset email, **When** they click the reset link, **Then** they are directed to the reset password page with the token pre-populated and can set a new password.
3. **Given** user is on the reset password page, **When** they enter matching passwords that meet requirements (8+ chars, uppercase, lowercase, number), **Then** they can submit the form successfully.
4. **Given** valid new password is submitted with a valid token, **When** the form is submitted, **Then** the password is updated, user is logged in automatically with the new credentials, and redirected to the dashboard.
5. **Given** user enters mismatched passwords or invalid password format, **When** they attempt submission, **Then** specific validation errors are displayed and the form does not submit.
6. **Given** user attempts to use an expired or invalid reset token, **When** they try to reset, **Then** an error message indicates the link is invalid and they are redirected to the forgot password page.

---

### User Story 5 - Logout and Session Termination (Priority: P1)

A user can log out from the dashboard, which clears their session and tokens, and redirects them to the login page.

**Why this priority**: Critical for security and user control. Essential in multi-user or shared device scenarios. Must work reliably.

**Independent Test**: Can be fully tested by clicking logout, verifying tokens are cleared, and confirming redirect to login page.

**Acceptance Scenarios**:

1. **Given** user is logged in and on the dashboard, **When** they click the logout button, **Then** the system calls the logout endpoint on the backend.
2. **Given** the logout request completes (success or fail), **When** the logout process finishes, **Then** all tokens are cleared from memory and storage, user data is reset, and user is redirected to the login page.
3. **Given** user has logged out, **When** they attempt to access a protected route directly via URL, **Then** they are redirected to the login page.
4. **Given** user is logged out and navigates to a protected route, **When** they see the redirect, **Then** a message indicates their session has ended (optional toast notification).

---

### User Story 6 - View and Edit User Profile (Priority: P2)

A logged-in user can view their profile information, edit their name, upload an avatar, and see all changes reflected in the UI.

**Why this priority**: Provides personalization and user control over their account. Important for user experience but secondary to core authentication flows.

**Independent Test**: Can be fully tested by loading profile page, editing name, uploading avatar, and verifying changes persist and display correctly.

**Acceptance Scenarios**:

1. **Given** user is logged in and navigates to the profile page, **When** the page loads, **Then** their current profile information (name, email, avatar) is displayed from the API.
2. **Given** user is on the profile page, **When** they edit their name and click save, **Then** the name is updated in the backend and reflected in the UI immediately.
3. **Given** user wants to upload an avatar, **When** they select an image file (JPG, PNG, WebP, max 2MB), **Then** the file is validated on the client and uploaded via multipart form data.
4. **Given** an avatar is successfully uploaded, **When** the upload completes, **Then** the avatar is displayed in the profile and header/navigation bar across the app.
5. **Given** user uploads an invalid file (wrong format, too large, corrupted), **When** the validation fails, **Then** a clear error message explains the issue and no upload is attempted.
6. **Given** user is editing profile information, **When** an API error occurs, **Then** an error toast is displayed and the form retains the attempted values for retry.

---

### User Story 7 - Change Password with Current Password Verification (Priority: P2)

A logged-in user can change their password by verifying their current password and entering a new password.

**Why this priority**: Important security feature allowing users to update credentials, but less frequent than login/registration. Supports account security and recovery workflows.

**Independent Test**: Can be fully tested by navigating to change password form, entering current and new passwords, and verifying successful change by logging out and logging back in with new password.

**Acceptance Scenarios**:

1. **Given** user is on the change password page, **When** they enter their current password, new password, and confirmation, **Then** the form validates that all fields are filled and new passwords match.
2. **Given** user enters an incorrect current password, **When** they submit the form, **Then** an error message indicates the current password is incorrect and the form is not submitted.
3. **Given** valid current password and matching new passwords are entered (meeting complexity requirements), **When** they submit, **Then** the password is updated and a success message is displayed.
4. **Given** password has been successfully changed, **When** user logs out and attempts to log in with old password, **Then** login fails and new password is required.
5. **Given** user enters new passwords that don't meet requirements or don't match, **When** they submit, **Then** specific validation errors are displayed inline.

---

### User Story 8 - Manage Active Sessions (Priority: P3)

A logged-in user can view all their active sessions across devices and log out from specific sessions remotely.

**Why this priority**: Enhances security and multi-device awareness. Important for security-conscious users but not critical for MVP. Can be implemented after core auth is stable.

**Independent Test**: Can be fully tested by logging in from multiple devices/browsers, viewing session list, and terminating individual sessions remotely.

**Acceptance Scenarios**:

1. **Given** user is logged in on multiple devices, **When** they navigate to the sessions page, **Then** they see a list of all active sessions with device type, location, IP address, and last activity timestamp.
2. **Given** user is viewing their active sessions, **When** they click logout on a specific session, **Then** that session is terminated remotely and no longer appears in the list.
3. **Given** user has terminated a remote session, **When** they use that device/session to make an API request, **Then** the request fails with 401 and they are logged out.
4. **Given** user is on the sessions page, **When** the page loads, **Then** the current session is clearly marked as "Current Session" or similar indicator.

---

### User Story 9 - API Token Management for Pro/Enterprise Plans (Priority: P3)

A Pro or Enterprise user can create, view, and revoke API tokens for programmatic access to their account.

**Why this priority**: Enables advanced use cases (integrations, automation) but only relevant for paid plans. Lower priority than core authentication but important for monetization and power users.

**Independent Test**: Can be fully tested by creating an API token, using it to authenticate an API request, and revoking it to verify access is denied.

**Acceptance Scenarios**:

1. **Given** user is on a Pro or Enterprise plan and navigates to API tokens page, **When** they click "Create Token", **Then** a form appears to set token name and expiration.
2. **Given** user fills in token details and submits, **When** the token is created, **Then** they see the full token value once (with copy button) and a warning that it won't be shown again.
3. **Given** token has been created, **When** user uses it in an Authorization header to make an API request, **Then** the request is authenticated and succeeds.
4. **Given** user is viewing their tokens, **When** they click revoke on a token, **Then** that token is immediately invalidated and future requests with it fail with 401.
5. **Given** token is about to expire, **When** user attempts an API request with it, **Then** the request fails with 401 and an expiration message is provided.
6. **Given** user is on Free plan, **When** they attempt to access the API tokens page, **Then** they see an upgrade prompt explaining this feature requires Pro or Enterprise.

---

### User Story 10 - Account Deletion with Confirmation (Priority: P3)

A logged-in user can request to delete their account, which schedules soft deletion after a 30-day grace period during which they can cancel.

**Why this priority**: Important for data privacy and GDPR compliance, but less frequently used. Lower priority than other features but necessary for full feature completeness.

**Independent Test**: Can be fully tested by initiating account deletion, confirming the action, and verifying the account is inaccessible after grace period or immediately if confirmed.

**Acceptance Scenarios**:

1. **Given** user navigates to account deletion section, **When** they click "Delete Account", **Then** a modal appears explaining the 30-day grace period and requesting confirmation.
2. **Given** the deletion confirmation modal is displayed, **When** they must type "DELETE" to enable the confirm button, **Then** they cannot proceed without explicit confirmation.
3. **Given** user types "DELETE" and confirms, **When** they submit, **Then** their account is marked for deletion (soft delete), they are logged out, and redirected to a confirmation page.
4. **Given** account is scheduled for deletion, **When** user logs in with their credentials within 30 days, **Then** they see a message that their account is scheduled for deletion and an option to cancel.
5. **Given** user clicks "Cancel Deletion" before 30 days expire, **When** they confirm, **Then** the deletion is cancelled and their account is restored to normal status.
6. **Given** 30-day grace period has elapsed, **When** the scheduled task runs, **Then** the account and all associated data are permanently deleted.

**Note on Grace Period**: During the 30-day grace period, the user's account and sessions remain fully functional. They can log in, use all features normally, and access their data. Only after the 30-day period expires is the account permanently deleted.

---

### Edge Cases

- **Token refresh fails multiple times**: User is logged out and must re-authenticate
- **Simultaneous token expiration on multiple API calls**: System queues requests and refreshes token once, then retries all requests
- **User attempts to access protected route while token is refreshing**: Request waits for refresh completion, then proceeds
- **User deletes cookies/localStorage manually**: Next API request fails with 401, user is redirected to login
- **Verify email token expires**: User can request a new verification email
- **Password reset token expires**: User must request a new reset email
- **Avatar upload starts but browser closes**: Upload state is not persisted (user must retry)
- **Network error during login**: Form remains populated, user can retry
- **User logs in but email verification required**: Redirect to verification page, not dashboard
- **Access token in memory is lost on page reload**: Refresh token used to restore session via GET /auth/me on mount
- **Concurrent login attempts**: Second login request overwrites first; only latest tokens are stored
- **API returns different user ID in /auth/me than stored**: Data mismatch error, recommend logout and login

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Token Management**

- **FR-001**: System MUST support user registration with email, password, and name fields
- **FR-002**: System MUST validate registration input with email format check and password complexity requirements (minimum 8 characters with uppercase, lowercase, and numeric characters)
- **FR-003**: System MUST send a verification email with a unique token link upon successful registration
- **FR-004**: System MUST mark user account as verified when the verification token link is clicked and is valid
- **FR-005**: System MUST support account login with email and password, returning JWT access and refresh tokens
- **FR-006**: System MUST store access token exclusively in application state (memory) and refresh token in secure storage (localStorage or sessionStorage). Access token must never be persisted to prevent XSS exposure.
- **FR-007**: System MUST automatically refresh expired access tokens using the refresh token without user interaction
- **FR-008**: System MUST implement request/response interceptors to attach access token to all API requests and handle 401 responses
- **FR-009**: System MUST retry failed requests exactly once after successful token refresh (max 1 retry)
- **FR-010**: System MUST clear all tokens and redirect to login page if token refresh fails or refresh token is invalid
- **FR-011**: System MUST support user logout, which clears all tokens and terminates the session on both client and server
- **FR-012**: System MUST persist user session across browser refresh by loading current user from GET /auth/me on app initialization

**Password Management**

- **FR-013**: System MUST support password reset flow: email request → reset link via email → new password submission
- **FR-014**: System MUST validate password reset tokens for expiration and validity before allowing password change
- **FR-015**: System MUST automatically log in user after successful password reset (return new tokens)
- **FR-016**: System MUST require verification of current password before allowing password change in the profile
- **FR-017**: System MUST invalidate all existing tokens after successful password change (force re-authentication for all sessions)

**Email Verification**

- **FR-018**: System MUST support resending verification emails to users with unverified accounts
- **FR-019**: System MUST prevent login access for users with unverified emails (redirect to verification page)
- **FR-020**: System MUST validate verification tokens for expiration before marking account as verified

**Profile Management**

- **FR-021**: System MUST retrieve and display current user profile information (name, email, avatar) via GET /auth/me
- **FR-022**: System MUST allow authenticated users to update their profile name via PUT /auth/profile
- **FR-023**: System MUST support avatar upload (JPG, PNG, WebP formats) with maximum file size validation (2MB)
- **FR-024**: System MUST handle multipart/form-data for avatar upload and persist the image
- **FR-025**: System MUST display updated avatar across all UI sections (header, profile page, etc.) after successful upload

**Session Management**

- **FR-026**: System MUST retrieve list of all active sessions for the current user via GET /auth/sessions (includes device type, IP, last activity)
- **FR-027**: System MUST allow users to terminate specific sessions remotely via DELETE /auth/sessions/{id}
- **FR-028**: System MUST invalidate terminated sessions immediately (subsequent requests fail with 401)
- **FR-029**: System MUST mark the current session clearly when displaying session list

**API Token Management (Pro/Enterprise)**

- **FR-030**: System MUST allow Pro/Enterprise users to create API tokens via POST /api/v1/auth/api-tokens
- **FR-031**: System MUST display full API token value only once at creation (no retrieval of full token after)
- **FR-032**: System MUST allow users to set API token expiration during creation
- **FR-033**: System MUST allow users to view list of created API tokens (without full token value, only masked) via GET /api/v1/auth/api-tokens
- **FR-034**: System MUST allow users to revoke API tokens via DELETE /api/v1/auth/api-tokens/{id}
- **FR-035**: System MUST prevent non-Pro/Enterprise users from accessing API token management

**Account Deletion**

- **FR-036**: System MUST support soft account deletion scheduled for 30 days in future via DELETE /api/v1/auth/account
- **FR-037**: System MUST require explicit confirmation (typing "DELETE") before account deletion proceeds
- **FR-038**: System MUST allow users to cancel scheduled account deletion within grace period
- **FR-039**: System MUST log out user immediately after account deletion is initiated
- **FR-040**: System MUST prevent deleted accounts from logging in (display appropriate message)

**UI/UX & Validation**

- **FR-041**: System MUST display real-time validation errors for form inputs (email format, password requirements)
- **FR-042**: System MUST show loading spinners and disable buttons during API requests
- **FR-043**: System MUST display success/error toast notifications for all authentication actions
- **FR-044**: System MUST sanitize user input before sending to API
- **FR-045**: System MUST be fully responsive and mobile-first (minimum touch targets 44x44px)
- **FR-046**: System MUST implement client-side rate limiting on login attempts using localStorage to track attempts (e.g., max 3 login attempts per minute globally per browser). Rate limit counter persists across page reloads to prevent bypass.

**Responsive Layout & Architecture**

- **FR-047**: System MUST organize frontend routes with `(auth)` and `(dashboard)` groups using Next.js layout system
- **FR-048**: System MUST use Context API for centralized authentication state management
- **FR-049**: System MUST provide reusable `useAuth` hook for accessing authentication state and methods
- **FR-050**: System MUST use Zod for schema validation on all forms (registration, login, profile, password reset)
- **FR-051**: System MUST implement Axios client with request/response interceptors for API communication
- **FR-052**: System MUST organize code with dedicated directories: auth components, auth hooks, API client, validators, utilities

---

### Key Entities *(include if feature involves data)*

- **User**: Represents a registered user account with attributes: id, name, email, email_verified_at, avatar_url, password_hash, created_at, updated_at. Relationships: has many sessions, has many API tokens
- **Session**: Represents an active user session with attributes: id, user_id, device_type, ip_address, user_agent, last_activity_at, created_at. Used to track and manage multiple concurrent sessions
- **API Token**: Represents an API credential for Pro/Enterprise users with attributes: id, user_id, name, token_hash, expires_at, created_at, revoked_at. Allows programmatic access without exposing user password
- **JWT Token**: Represents authentication tokens (access and refresh) with attributes: token_string, user_id, type (access/refresh), expires_at, issued_at. Not persisted in DB; generated/validated server-side
- **Email Verification Token**: Represents temporary verification credentials with attributes: token_string, user_id, expires_at, created_at. Used for email confirmation and password reset flows

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete registration and email verification in under 2 minutes total
- **SC-002**: Users can log in and reach the dashboard in under 30 seconds
- **SC-003**: Token refresh occurs transparently with zero interruption to user experience (user sees no errors or re-authentication prompts during automatic refresh)
- **SC-004**: 95% of API requests succeed on first attempt after token refresh (zero or minimal retry failures)
- **SC-005**: All form validations display inline error messages in real-time with zero latency perception (under 100ms)
- **SC-006**: Avatar upload completes for files under 2MB in under 5 seconds with visual progress indicator
- **SC-007**: Session list loads and displays within 2 seconds
- **SC-008**: 100% of protected routes redirect to login for unauthenticated users (no unauthorized access)
- **SC-009**: 100% of authentication actions (login, logout, token refresh, profile update) work correctly across all modern browsers (Chrome, Firefox, Safari, Edge)
- **SC-010**: Application maintains session persistence across browser refresh (no re-authentication required)
- **SC-011**: All form inputs properly sanitized; zero successful XSS or injection attempts
- **SC-012**: UI is fully responsive on mobile (iPhone 12+), tablet (iPad), and desktop (1920x1080 minimum)
- **SC-013**: 90% of users successfully complete registration and login on first attempt (measured via analytics/testing)
- **SC-014**: Password reset emails are delivered within 2 minutes and tokens are valid for 1 hour
- **SC-015**: Account deletion confirmation requires explicit "DELETE" text entry (zero accidental deletions)
- **SC-016**: All unit tests achieve 80%+ code coverage for auth-related code (components, hooks, utilities)
- **SC-017**: API token management UI only visible to Pro/Enterprise users (zero unauthorized token creation)
- **SC-018**: Automated token refresh prevents 95%+ of 401 errors from affecting user experience (transparent refresh, not visible to user)

---

## Assumptions

1. **Backend API is stable**: All endpoints specified in feature description (POST /auth/register, POST /auth/login, etc.) are implemented and working correctly in the Laravel backend
2. **Email delivery works**: Verification and password reset emails are reliably delivered via the backend mail system
3. **CORS configured**: Backend allows requests from the frontend origin (configured in Laravel)
4. **JWT secret is secure**: Backend JWT tokens are signed with a strong, secret key that doesn't change during development
5. **Token expiration times**: Access token expires in 15 minutes, refresh token in 7 days (industry standard; not specified in requirements)
6. **Storage availability**: Browser localStorage/sessionStorage is available and working (not disabled by user or browser policy)
7. **Session rehydration**: GET /auth/me is called automatically on app mount to restore user session
8. **Password hashing**: Backend securely hashes passwords using bcrypt or similar; frontend never receives plain passwords
9. **Rate limiting**: Backend implements rate limiting on auth endpoints; frontend implements client-side throttling for UX
10. **Error handling**: Backend returns consistent error response format (e.g., `{ message: string, errors?: object }`)
11. **Avatar storage**: Backend handles avatar storage and returns accessible URLs
12. **Multi-device sessions**: Backend tracks separate sessions per device/browser; sessions are independent
13. **Soft delete**: Account deletion is soft delete (data retained for 30 days, then permanently deleted by scheduled task)
14. **No SSO/OAuth initially**: MVP uses email/password authentication only; OAuth (Google, GitHub, etc.) is out of scope

---

## Assumptions (Architecture & Technology)

15. **Next.js app router**: Frontend uses Next.js with App Router (not Pages Router)
16. **TypeScript strict mode**: All code is TypeScript with strict type checking enabled
17. **Axios as HTTP client**: Axios is configured as the HTTP client with interceptors for token management
18. **Context API for state**: Authentication state is managed via React Context API (not Redux or other state management)
19. **Zod for validation**: Client-side form validation uses Zod schemas
20. **Shadcn/ui components**: UI components come from shadcn/ui library (already available in project)
21. **Tailwind CSS**: Styling uses Tailwind CSS (available in project)
22. **Token storage strategy**: Access token is stored exclusively in memory (application state); refresh token is stored in localStorage/sessionStorage. This prevents XSS attacks on access token and requires session rehydration on page reload via GET /auth/me endpoint.
23. **Environment variables**: API URL configured via NEXT_PUBLIC_API_URL environment variable

---

## Dependencies & Integration Points

**Depends on**:
- Feature 001: User Authentication Backend (Laravel API, all auth endpoints working)
- External: Email service (configured in Laravel for sending verification/reset emails)

**Enables**:
- Future dashboard features requiring authenticated user context
- Future integration features requiring API tokens
- Multi-device session management for security-conscious users

---

## Out of Scope

- OAuth/SSO integration (Google, GitHub, social login)
- Two-factor authentication (2FA/MFA)
- Biometric authentication
- Single Sign-On (SSO) across multiple applications
- SMS-based authentication
- "Remember Me" / "Stay logged in" feature (deferred to future release)
- Email templates customization (backend responsibility)
- Custom password complexity rules (backend determines rules)
- Advanced analytics/audit logging (covered separately if needed)

---

## Clarifications

### Session 2025-11-04

- Q1: Should access token be always stored in memory only, or can it be persisted in localStorage? → A: Access token MUST be stored in memory only (more secure, prevents XSS exposure via localStorage). Refresh token persisted in secure storage. Session rehydrated on page reload via GET /auth/me.
- Q2: Can user still make API requests during 30-day account deletion grace period? → A: Yes, sessions remain fully valid during grace period. User can log in and use account normally; cancelling deletion restores everything. Provides better UX and data recovery opportunity.
- Q3: Should "Remember Me" feature be implemented in MVP? → B: Defer to future. Remove from MVP scope to simplify initial implementation. Sessions use sessionStorage only (user logged out when browser closes). Can be added later as optional enhancement.
- Q4: How should client-side rate limiting be implemented? → B: localStorage-based rate limiting (global per browser, persists across page reloads). Prevents users from bypassing limits by refreshing or opening new tabs. Complements backend rate limiting.

---

## Notes

- This specification is technology-agnostic in requirements but references Next.js, React, TypeScript, Zod, and Axios as specified in the user input
- All user scenarios are independently testable and valuable; they can be implemented in priority order
- Edge cases are identified to ensure robust error handling and recovery
- Success criteria are measurable and user-focused (not implementation-focused)
- The specification assumes the Laravel backend (Feature 001) is complete and functioning correctly
