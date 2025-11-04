# Tasks: Frontend Next.js + Backend Laravel JWT Authentication Integration

**Feature**: `002-frontend-auth-integration`  
**Input**: Design documents from `/specs/002-frontend-auth-integration/` (spec.md, plan.md, research.md, data-model.md, contracts/, quickstart.md)  
**Prerequisites**: 
- ✅ plan.md (implementation plan with tech stack and project structure)
- ✅ spec.md (10 user stories with P1/P2/P3 priorities)
- ✅ research.md (12 research decisions with implementation rationale)
- ✅ data-model.md (5 entities, 16 API endpoints, Zod schemas)
- ✅ contracts/ (OpenAPI 3.0 spec and contract documentation)
- ✅ quickstart.md (production-ready code examples for 8 core files)

**Tests**: NOT requested in spec - test tasks are OPTIONAL and placed in Polish phase

**Organization**: Tasks grouped by user story priority (P1 → P2 → P3) to enable independent implementation and testing

## Format Reference

```
- [ ] [TaskID] [P?] [Story?] Description with file path
```

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US1, US2, US3, etc.) - REQUIRED for story phases only
- **File paths**: Exact locations for implementation

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Project structure and environment configuration

- [ ] T001 Create project structure per implementation plan in `frontend/`
- [ ] T002 [P] Verify Next.js 16, React 19, TypeScript installed via `package.json`
- [ ] T003 [P] Verify Axios, Zod, Shadcn/ui, Tailwind CSS in dependencies via `package.json`
- [ ] T004 Create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1` for development
- [ ] T005 Create `.env.example` documenting required environment variables

**Checkpoint**: Project initialized, dependencies available, environment configured

---

## Phase 2: Foundational (Blocking Prerequisites - MUST COMPLETE BEFORE USER STORIES)

**Purpose**: Core authentication infrastructure required by ALL user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is 100% complete

### API Client & Interceptors

- [ ] T006 Create Axios client instance in `frontend/lib/api/client.ts` with baseURL from `NEXT_PUBLIC_API_URL`
- [ ] T007 [P] Create request interceptor in `frontend/lib/api/interceptors.ts` to attach Authorization header with access token
- [ ] T008 [P] Create response interceptor in `frontend/lib/api/interceptors.ts` to detect 401 responses and trigger token refresh
- [ ] T009 Implement token refresh logic with request queuing in `frontend/lib/api/interceptors.ts` (queue concurrent requests, refresh once, retry all with new token)
- [ ] T010 Create centralized error handler in `frontend/lib/api/error-handler.ts` for consistent error formatting and user messages

### Authentication API Endpoints

- [ ] T011 Create auth API wrapper in `frontend/lib/api/auth.ts` with 14 endpoint functions:
  - POST `/auth/register` → `register()`
  - POST `/auth/login` → `login()`
  - POST `/auth/refresh` → `refreshToken()`
  - POST `/auth/logout` → `logout()`
  - GET `/auth/me` → `getCurrentUser()`
  - GET `/verify-email/{token}` → `verifyEmail()`
  - POST `/auth/forgot-password` → `forgotPassword()`
  - PUT `/auth/reset-password` → `resetPassword()`
  - PUT `/auth/profile` → `updateProfile()`
  - POST `/auth/upload-avatar` → `uploadAvatar()` (multipart)
  - PUT `/auth/change-password` → `changePassword()`
  - GET `/auth/sessions` → `getSessions()`
  - DELETE `/auth/sessions/{id}` → `deleteSession()`
  - GET `/auth/api-tokens` → `getApiTokens()`
  - POST `/auth/api-tokens` → `createApiToken()`
  - DELETE `/auth/api-tokens/{id}` → `deleteApiToken()`
  - DELETE `/auth/account` → `deleteAccount()`

### Context API & State Management

- [ ] T012 [P] Create auth types in `frontend/lib/types/auth.d.ts` with:
  - `User` (id, name, email, email_verified_at, avatar_url, plan, created_at, updated_at)
  - `AuthState` (user, isLoading, isAuthenticating, accessToken, isTokenRefreshing, error, isAuthenticated, emailVerified)
  - `ApiToken`, `Session` types for profile features

- [ ] T013 Create AuthContext in `frontend/lib/context/AuthContext.tsx` with:
  - State: user, accessToken, isLoading, isAuthenticating, isTokenRefreshing, error
  - Functions: login(), register(), logout(), refreshToken(), setUser()
  - useAuth hook for consuming context

- [ ] T014 Create AuthProvider component in `frontend/lib/context/AuthProvider.tsx` that:
  - Wraps application
  - Restores session from refresh token on mount via GET `/auth/me`
  - Listens for token refresh events from interceptor
  - Updates access token when refresh succeeds
  - Clears tokens and redirects to login if refresh fails

### Token & Utility Management

- [ ] T015 [P] Create token utilities in `frontend/lib/utils/token.ts`:
  - `getRefreshToken()` - read from sessionStorage
  - `setRefreshToken(token, expiresAt)` - write to sessionStorage
  - `clearRefreshToken()` - remove from sessionStorage
  - `getRefreshTokenExpiration()` - check if expired
  - `isRefreshTokenExpired()` - boolean check

- [ ] T016 [P] Create rate limiting utilities in `frontend/lib/utils/rate-limit.ts`:
  - `getRateLimitAttempts()` - read from localStorage `auth_attempt_tracker`
  - `incrementRateLimitAttempt()` - increment counter
  - `resetRateLimitAttempts()` - clear counter
  - `isRateLimited()` - check if > 3 attempts in 60 seconds
  - Implement 60-second reset window with timestamp

- [ ] T017 [P] Create input sanitization utilities in `frontend/lib/utils/sanitize.ts`:
  - `sanitizeEmail()` - trim, lowercase
  - `sanitizeText()` - remove HTML, trim whitespace
  - Apply to all user inputs before API submission

### Validation Schemas

- [ ] T018 Create Zod validation schemas in `frontend/lib/validators/auth.schemas.ts`:
  - `registerSchema` - name (min 1, max 255), email, password (min 8, uppercase + lowercase + number)
  - `loginSchema` - email, password
  - `resetPasswordSchema` - password (min 8, uppercase + lowercase + number), confirmation
  - `changePasswordSchema` - currentPassword, password, confirmation
  - Export all schemas for form validation

### Protected Routes Infrastructure

- [ ] T019 Create route protection layout in `frontend/app/(dashboard)/layout.tsx` that:
  - Checks `user` in AuthContext
  - Redirects to `/auth/login` if not authenticated
  - Shows loading state while restoring session
  - Wraps `children` with header/sidebar

- [ ] T020 Verify root layout wraps app with `AuthProvider` in `frontend/app/layout.tsx` and applies theme provider

**Checkpoint**: ✅ Foundation ready - token management, API client, interceptors, context, route protection all complete. User story implementation can now proceed in parallel.

---

## Phase 3: User Story 1 - User Registration with Email Verification (Priority: P1) 🎯 MVP

**Goal**: New users can create accounts with email verification before gaining access to dashboard

**Independent Test**: Register with valid data → receive verification email → click link → auto-login to dashboard with verified account

### Components for User Story 1

- [ ] T021 [P] [US1] Create register form component in `frontend/components/auth/register-form.tsx`:
  - Fields: name, email, password, confirm password
  - Zod schema validation with real-time error display
  - Password strength indicator (8+ chars, uppercase, lowercase, number)
  - Submit button disabled during submission
  - Show loading spinner on submit
  - Success: display message "Check your email to verify"

- [ ] T022 [P] [US1] Create email verification component in `frontend/components/auth/email-verification.tsx`:
  - Display: email address, resend button, go-back link
  - Resend verification email button calls API
  - Show success toast "Verification email sent"
  - Show loading state during resend

### Pages for User Story 1

- [ ] T023 [US1] Create registration page in `frontend/app/(auth)/register/page.tsx`:
  - Route: `/auth/register` (public, no auth required)
  - Use `<RegisterForm />` component
  - Include link to login page "Already have account? Sign in"
  - Include link to forgot password page

- [ ] T024 [US1] Create email verification page in `frontend/app/(auth)/verify-email/page.tsx`:
  - Route: `/auth/verify-email` (public, no auth required)
  - Extract token from query parameter or localStorage (from redirect after register)
  - Auto-call `GET /verify-email/{token}` on mount
  - If successful: auto-login + redirect to dashboard
  - If failed: show error message + link to resend or register again
  - Use `<EmailVerification />` component for resend functionality

### Integration for User Story 1

- [ ] T025 [US1] Implement registration flow in `AuthContext`:
  - Add `register(email, password, name)` function
  - Call `POST /auth/register` via auth API
  - On success: redirect to `/auth/verify-email?email={email}`
  - On error: display validation errors (email exists, weak password, etc.)

- [ ] T026 [US1] Implement email verification in `AuthContext`:
  - Add `verifyEmail(token)` function
  - Call `GET /verify-email/{token}` via auth API
  - On success: set user + access token, redirect to `/dashboard`
  - On error: show error message with retry option

- [ ] T027 [US1] Add resend verification email to `AuthContext`:
  - Add `resendVerificationEmail(email)` function
  - Call POST to resend endpoint (if available, else use registration endpoint flow)
  - Show success toast

**Checkpoint**: ✅ User Story 1 complete and independently testable. New users can register, receive verification email, and access dashboard after verification.

---

## Phase 4: User Story 2 - User Login with JWT Token Management (Priority: P1) 🎯 MVP

**Goal**: Existing users can login and maintain session across page reloads via JWT tokens

**Independent Test**: Login with credentials → tokens stored → refresh page → still logged in → access dashboard

### Components for User Story 2

- [ ] T028 [P] [US2] Create login form component in `frontend/components/auth/login-form.tsx`:
  - Fields: email, password
  - Zod schema validation with real-time error display
  - Rate limiting check: if rate limited, disable form + show retry timer
  - Submit button disabled during submission + loading spinner
  - On success: show "Logged in" toast, redirect to dashboard
  - On error: display error message "Invalid email or password"
  - Check if email unverified: redirect to `/auth/verify-email?email={email}` instead

### Pages for User Story 2

- [ ] T029 [US2] Create login page in `frontend/app/(auth)/login/page.tsx`:
  - Route: `/auth/login` (public, no auth required)
  - Use `<LoginForm />` component
  - Include link to register page "Don't have account? Sign up"
  - Include link to forgot password page "Forgot password?"

### Integration for User Story 2

- [ ] T030 [US2] Implement login flow in `AuthContext`:
  - Add `login(email, password)` function
  - Call rate limiting check first via `useRateLimit` hook
  - Call `POST /auth/login` via auth API
  - On success:
    - Store refresh token in sessionStorage via `setRefreshToken()`
    - Store access token in Context state
    - Increment rate limit counter + reset on new success
    - Set user data in state
    - Redirect to `/dashboard`
  - On error:
    - Increment rate limit counter
    - Display error message

- [ ] T031 [US2] Implement session restoration in `AuthProvider` on mount:
  - On component mount, check if refresh token exists in sessionStorage
  - If exists: call `GET /auth/me` with refresh token (via Authorization header)
  - If successful: restore user + access token, update Context state
  - If failed (401): clear tokens, user remains on login page
  - Show loading state while restoring to prevent layout shift

- [ ] T032 [US2] Create `useRateLimit` hook in `frontend/lib/hooks/useRateLimit.ts`:
  - Check localStorage counter for login attempts in last 60 seconds
  - Return: `{ isRateLimited, attempts, remainingTime }`
  - Increment counter on failed attempts
  - Clear counter on successful login
  - Include 60-second reset window logic

**Checkpoint**: ✅ User Story 2 complete and independently testable. Users can login, tokens are stored, session persists across refresh.

---

## Phase 5: User Story 3 - Automatic Token Refresh (Priority: P1) 🎯 MVP

**Goal**: When access token expires, system automatically refreshes without user interaction

**Independent Test**: Make API request after token expires → request succeeds transparently → verify new token used on next request

### Implementation for User Story 3

- [ ] T033 [US3] Enhance response interceptor in `frontend/lib/api/interceptors.ts` to implement token refresh with retry:
  - On 401 response: Check if already refreshing (prevent duplicate refresh calls)
  - If not refreshing: Call `POST /auth/refresh` with refresh token
  - If refreshing: Queue the original request + wait for refresh to complete
  - On refresh success:
    - Update access token in memory (Context state)
    - Retry all queued requests with new token
    - Emit token-refreshed event for AuthProvider to listen
  - On refresh failure (401 from refresh endpoint):
    - Clear all tokens
    - Emit auth-failed event
    - Redirect to login in AuthProvider listener

- [ ] T034 [US3] Add request queuing logic in `frontend/lib/api/interceptors.ts`:
  - Maintain request queue array during token refresh
  - Store pending requests with their resolve/reject callbacks
  - When refresh completes: retry all queued requests
  - When refresh fails: reject all queued requests
  - Clear queue after processing

- [ ] T035 [US3] Add token refresh event system:
  - Emit `token-refreshed` event when access token is updated
  - AuthProvider listens for this event to update context
  - Prevents multiple state updates from interceptor + context

**Checkpoint**: ✅ User Story 3 complete and independently testable. Token refresh happens transparently, long-lived API calls work correctly.

---

## Phase 6: User Story 5 - Logout and Session Termination (Priority: P1) 🎯 MVP

**Goal**: Users can logout, clearing session and redirecting to login

**Independent Test**: Logout → tokens cleared → access protected route → redirected to login

### Components for User Story 5

- [ ] T036 [P] [US5] Create logout button component in `frontend/components/auth/logout-button.tsx`:
  - Button with logout icon/text
  - Show loading state during logout API call
  - On success: show "Logged out" toast
  - On error: show error toast, log to monitoring

### Integration for User Story 5

- [ ] T037 [US5] Implement logout function in `AuthContext`:
  - Add `logout()` function
  - Call `POST /auth/logout` via auth API (best effort, may fail if already logged out)
  - Clear access token from Context state
  - Clear refresh token from sessionStorage via `clearRefreshToken()`
  - Clear rate limit counter
  - Redirect to `/auth/login`
  - Show "Session ended" message

- [ ] T038 [US5] Add logout button to app header in `frontend/components/app-header.tsx`:
  - Display user name in header (from Context)
  - Dropdown menu with "Logout" option
  - Use `<LogoutButton />` component
  - Also show in mobile navigation

- [ ] T039 [US5] Verify route protection prevents access to dashboard after logout:
  - Test that accessing `/dashboard/*` redirects to login after logout
  - Verify `/auth/*` routes are accessible after logout

**Checkpoint**: ✅ User Story 5 complete and independently testable. Logout works, route protection enforced, tokens cleared.

---

## Phase 7: User Story 4 - Password Reset via Email (Priority: P2)

**Goal**: Users who forgot password can request reset link and set new password

**Independent Test**: Forgot password → click email link → set new password → login with new password

### Components for User Story 4

- [ ] T040 [P] [US4] Create forgot-password form component in `frontend/components/auth/forgot-password-form.tsx`:
  - Field: email
  - Zod validation
  - Submit button + loading state
  - On success: show message "Check your email for reset link"

- [ ] T041 [P] [US4] Create reset-password form component in `frontend/components/auth/reset-password-form.tsx`:
  - Fields: password, confirm password
  - Zod schema validation with real-time error display
  - Password strength indicator
  - Submit button + loading state
  - On success: auto-login + redirect to dashboard with "Password reset" toast

### Pages for User Story 4

- [ ] T042 [US4] Create forgot-password page in `frontend/app/(auth)/forgot-password/page.tsx`:
  - Route: `/auth/forgot-password` (public)
  - Use `<ForgotPasswordForm />` component
  - Include link to login + register

- [ ] T043 [US4] Create reset-password page in `frontend/app/(auth)/reset-password/page.tsx`:
  - Route: `/auth/reset-password?token={token}` (public)
  - Extract token from query parameter
  - Use `<ResetPasswordForm />` component
  - Pre-populate token hidden field
  - Validate token on mount (if time expired, show error + link to forgot password)

### Integration for User Story 4

- [ ] T044 [US4] Implement password reset in `AuthContext`:
  - Add `forgotPassword(email)` function - call `POST /auth/forgot-password`
  - On success: show success message (no indication of email validity for security)
  - Add `resetPassword(token, password)` function - call `PUT /auth/reset-password`
  - On success: auto-login user + redirect to dashboard
  - On error: display error message "Link expired, request new reset email"

- [ ] T045 [US4] Add forgot-password link to login page in `frontend/app/(auth)/login/page.tsx`:
  - Include text "Forgot your password?" linking to `/auth/forgot-password`

**Checkpoint**: ✅ User Story 4 complete and independently testable. Password reset flow works end-to-end.

---

## Phase 8: User Story 6 - View and Edit User Profile (Priority: P2)

**Goal**: Users can view profile, edit name, and upload avatar

**Independent Test**: Login → navigate to profile → edit name → upload avatar → verify changes persist and display

### Components for User Story 6

- [ ] T046 [P] [US6] Create profile-view component in `frontend/components/profile/profile-view.tsx`:
  - Display: name, email, plan badge, avatar, member since date
  - Avatar image from `avatar_url`
  - Show edit button linking to edit page

- [ ] T047 [P] [US6] Create profile-edit-form component in `frontend/components/profile/profile-edit-form.tsx`:
  - Field: name (max 255 chars)
  - Zod validation
  - Save button + loading state
  - Show success toast on save
  - Show error message on failure

- [ ] T048 [P] [US6] Create avatar-upload component in `frontend/components/profile/avatar-upload.tsx`:
  - File input (accept jpg, png, webp)
  - Image preview before upload
  - File size validation: max 2MB
  - Upload button + loading state during upload
  - Progress bar showing upload status
  - On success: update avatar in display + header
  - Show error toast on validation failure
  - Support drag-and-drop

### Pages for User Story 6

- [ ] T049 [US6] Create profile view page in `frontend/app/(dashboard)/profile/page.tsx`:
  - Route: `/dashboard/profile` (protected)
  - Use `<ProfileView />` component
  - Include edit link

- [ ] T050 [US6] Create profile edit page in `frontend/app/(dashboard)/profile/edit/page.tsx`:
  - Route: `/dashboard/profile/edit` (protected)
  - Use `<ProfileEditForm />` + `<AvatarUpload />` components
  - Include back link to profile view

### Integration for User Story 6

- [ ] T051 [US6] Implement profile management in `AuthContext`:
  - Add `updateProfile(name)` function - call `PUT /auth/profile`
  - On success: update user data in Context + show toast
  - Add `uploadAvatar(file)` function - call `POST /auth/upload-avatar` with multipart
  - On success: update user.avatar_url in Context
  - Create `useProfile` hook to access user profile data

- [ ] T052 [US6] Update app header to display avatar:
  - Show user avatar in header (from Context)
  - Link to profile page
  - Fallback to initials if no avatar

- [ ] T053 [US6] Add profile page link to dashboard in `frontend/app/(dashboard)/layout.tsx`:
  - Include in navigation menu/sidebar

**Checkpoint**: ✅ User Story 6 complete and independently testable. Users can view and edit profile with avatar upload.

---

## Phase 9: User Story 7 - Change Password with Current Password Verification (Priority: P2)

**Goal**: Users can change password by verifying current password first

**Independent Test**: Change password → logout → login with new password → succeeds

### Components for User Story 7

- [ ] T054 [P] [US7] Create change-password-form component in `frontend/components/profile/password-change-form.tsx`:
  - Fields: currentPassword, newPassword, confirmPassword
  - Zod schema validation with real-time errors
  - Password strength indicator for new password
  - Confirm/cancel buttons
  - Submit button + loading state
  - On success: show success toast "Password changed"
  - On error: show error message "Current password incorrect" or validation error

### Pages for User Story 7

- [ ] T055 [US7] Create change-password page in `frontend/app/(dashboard)/settings/password/page.tsx`:
  - Route: `/dashboard/settings/password` (protected)
  - Use `<ChangePasswordForm />` component
  - Warning: "Changing password will log you out from all devices"
  - Back link to settings

### Integration for User Story 7

- [ ] T056 [US7] Implement password change in `AuthContext`:
  - Add `changePassword(currentPassword, newPassword)` function
  - Call `PUT /auth/change-password` via auth API
  - On success:
    - Show success toast
    - Clear tokens (per FR-017: invalidate all sessions)
    - Redirect to login with message "Password changed, please login again"
  - On error: display error (e.g., "Current password incorrect")

- [ ] T057 [US7] Add settings navigation in `frontend/app/(dashboard)/settings/layout.tsx`:
  - Create settings layout with sidebar/nav
  - Include links to: password, sessions, api-tokens, account deletion

**Checkpoint**: ✅ User Story 7 complete and independently testable. Password change works with session invalidation.

---

## Phase 10: User Story 8 - Manage Active Sessions (Priority: P3)

**Goal**: Users can view active sessions across devices and logout remote sessions

**Independent Test**: Login from multiple devices → view session list → delete session from one device → verify logout from that device

### Components for User Story 8

- [ ] T058 [P] [US8] Create sessions-list component in `frontend/components/profile/sessions-list.tsx`:
  - Display table/list of sessions:
    - Device type (Web, Mobile, etc.)
    - Browser/user agent
    - IP address
    - Last activity
    - Current session indicator
  - Delete button per session (disabled for current session)
  - Logout confirmation dialog
  - Show loading state during delete

- [ ] T059 [P] [US8] Create session-delete-modal component in `frontend/components/profile/session-delete-modal.tsx`:
  - Confirmation dialog: "Logout from this device?"
  - Cancel/Confirm buttons
  - Loading state during deletion

### Pages for User Story 8

- [ ] T060 [US8] Create sessions management page in `frontend/app/(dashboard)/settings/sessions/page.tsx`:
  - Route: `/dashboard/settings/sessions` (protected)
  - Use `<SessionsList />` component
  - Load sessions on mount via `GET /auth/sessions`
  - Include "Logout all other sessions" option (optional feature)

### Integration for User Story 8

- [ ] T061 [US8] Implement session management in `AuthContext`:
  - Add `getSessions()` function - call `GET /auth/sessions`
  - Return array of sessions with current session marked
  - Add `deleteSession(sessionId)` function - call `DELETE /auth/sessions/{id}`
  - On success: remove from list + show toast
  - Create `useSessions` hook to access sessions data

- [ ] T062 [US8] Add sessions page link to settings navigation in `frontend/app/(dashboard)/settings/layout.tsx`:
  - Include "Active Sessions" link

**Checkpoint**: ✅ User Story 8 complete and independently testable. Multi-device session management works.

---

## Phase 11: User Story 9 - API Token Management for Pro/Enterprise Plans (Priority: P3)

**Goal**: Pro/Enterprise users can create, view, and revoke API tokens for programmatic access

**Independent Test**: Create API token → use in API request → revoke → verify request fails

### Components for User Story 9

- [ ] T063 [P] [US9] Create api-tokens-list component in `frontend/components/profile/api-tokens-list.tsx`:
  - Display table/list of API tokens:
    - Token name
    - Last 4 characters
    - Expiration date or "Never expires"
    - Created date
    - Revoke button per token
  - "Create Token" button
  - Empty state: "No API tokens created"
  - Show loading state during revoke

- [ ] T064 [P] [US9] Create create-api-token-modal component in `frontend/components/profile/create-api-token-modal.tsx`:
  - Form fields: name, expiration (optional)
  - Zod validation
  - Create button + loading state
  - After success: show token in modal with:
    - Full token value (copy-to-clipboard button)
    - Warning: "This token is shown only once. Save it now."
    - Close button

- [ ] T065 [P] [US9] Create token-display-modal component in `frontend/components/profile/token-display-modal.tsx`:
  - Display full token with copy button
  - Show warning about not displaying again
  - Dismiss/Close button

### Pages for User Story 9

- [ ] T066 [US9] Create API tokens page in `frontend/app/(dashboard)/settings/api-tokens/page.tsx`:
  - Route: `/dashboard/settings/api-tokens` (protected, Pro/Enterprise only)
  - Show upgrade prompt if user on Free plan
  - Use `<ApiTokensList />` component
  - "Create Token" button opens modal
  - Load tokens on mount via `GET /auth/api-tokens`

### Integration for User Story 9

- [ ] T067 [US9] Implement API token management in `AuthContext`:
  - Add `getApiTokens()` function - call `GET /auth/api-tokens`
  - Handle 403 error (Free plan) - return error message
  - Add `createApiToken(name, expiresAt)` function - call `POST /auth/api-tokens`
  - On success: return full token + masked token object
  - Add `deleteApiToken(tokenId)` function - call `DELETE /auth/api-tokens/{id}`
  - On success: remove from list
  - Create `useApiTokens` hook

- [ ] T068 [US9] Add plan check before showing API tokens:
  - Check `user.plan` in Context
  - If "free": show upgrade prompt
  - If "pro" or "enterprise": show token management UI

- [ ] T069 [US9] Add API tokens page link to settings in `frontend/app/(dashboard)/settings/layout.tsx`:
  - Include "API Tokens" link (only visible to Pro/Enterprise users)

**Checkpoint**: ✅ User Story 9 complete and independently testable. API token management works for paid plans only.

---

## Phase 12: User Story 10 - Account Deletion with Confirmation (Priority: P3)

**Goal**: Users can request account deletion with 30-day grace period and cancellation option

**Independent Test**: Delete account → confirm → verify logged out → re-login shows deletion message → cancel → account restored

### Components for User Story 10

- [ ] T070 [P] [US10] Create account-deletion-modal component in `frontend/components/profile/account-deletion-modal.tsx`:
  - Warning: "Account will be permanently deleted in 30 days. You can cancel anytime during this period."
  - "Type 'DELETE' to confirm" input field
  - Confirm button (disabled until "DELETE" typed)
  - Cancel button
  - Loading state during deletion

- [ ] T071 [P] [US10] Create deletion-cancelled-modal component in `frontend/components/profile/deletion-cancelled-modal.tsx`:
  - Message: "Account deletion cancelled. Your account is active."
  - Dismiss button

### Pages for User Story 10

- [ ] T072 [US10] Create account deletion page in `frontend/app/(dashboard)/settings/account/page.tsx`:
  - Route: `/dashboard/settings/account` (protected)
  - Display: Account info, deletion status if pending
  - "Delete Account" button opens confirmation modal
  - If deletion pending: show:
    - Days remaining until permanent deletion
    - "Cancel Deletion" button

### Integration for User Story 10

- [ ] T073 [US10] Implement account deletion in `AuthContext`:
  - Add `deleteAccount()` function - call `DELETE /auth/account`
  - On success:
    - Clear tokens
    - Show "Account scheduled for deletion in 30 days" message
    - Redirect to login
  - Add `cancelDeletion()` function - call to cancel endpoint (if available)
  - On success: redirect to dashboard

- [ ] T074 [US10] Handle deleted account login scenario:
  - After login, if response indicates account is deleted:
    - Show message "Your account is scheduled for deletion. Click to cancel."
    - Provide link to cancel deletion page
    - Or: just show deleted message + auto-logout

- [ ] T075 [US10] Add account deletion page link to settings in `frontend/app/(dashboard)/settings/layout.tsx`:
  - Include "Delete Account" link at bottom (danger zone)

**Checkpoint**: ✅ User Story 10 complete and independently testable. Account deletion with grace period works.

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Testing, optimization, accessibility, and documentation

### Unit & Integration Tests (OPTIONAL - NOT requested in spec)

- [ ] T076 [P] Write unit tests for utility functions in `frontend/tests/unit/utils/`:
  - `token.test.ts` - token get/set/clear/expiration
  - `rate-limit.test.ts` - rate limiting logic
  - `sanitize.test.ts` - input sanitization

- [ ] T077 [P] Write unit tests for hooks in `frontend/tests/unit/hooks/`:
  - `useAuth.test.ts` - context consumption, state updates
  - `useRateLimit.test.ts` - rate limit hook logic

- [ ] T078 [P] Write validation tests in `frontend/tests/unit/validators/`:
  - `auth.schemas.test.ts` - all Zod schemas

- [ ] T079 Write integration tests for auth flows in `frontend/tests/integration/`:
  - `registration-flow.test.ts` - full registration + verification
  - `login-flow.test.ts` - login + session persistence
  - `token-refresh.test.ts` - auto-refresh on 401
  - `logout-flow.test.ts` - logout + token cleanup

### End-to-End Tests (OPTIONAL)

- [ ] T080 Write E2E tests using Cypress/Playwright in `frontend/tests/e2e/`:
  - `auth.spec.ts` - register, verify email, login flows
  - `protected-routes.spec.ts` - route protection enforcement
  - `profile.spec.ts` - profile edit, avatar upload
  - `sessions.spec.ts` - session management
  - `api-tokens.spec.ts` - token management

### Documentation & Cleanup

- [ ] T081 [P] Update `frontend/README.md` with:
  - Setup instructions (npm install, env config, run dev)
  - Authentication flow overview
  - Token management details
  - Rate limiting behavior

- [ ] T082 [P] Add JSDoc comments to all exported functions in:
  - `frontend/lib/api/` - all endpoint functions
  - `frontend/lib/hooks/` - all custom hooks
  - `frontend/lib/context/` - Context + Provider

- [ ] T083 [P] Create `frontend/docs/AUTH_FLOW.md` with:
  - Sequence diagrams for: registration, login, token refresh, logout
  - Architecture overview
  - Storage strategy explained
  - Rate limiting behavior

- [ ] T084 Create `frontend/docs/DEBUGGING.md` with:
  - Common issues and solutions
  - Network debugging tips
  - Token debugging in DevTools
  - localStorage/sessionStorage inspection

### Accessibility & Performance

- [ ] T085 [P] Accessibility review:
  - All form inputs have associated labels
  - Error messages associated with fields via aria-describedby
  - Keyboard navigation works on all forms
  - Focus management on modals/dialogs
  - Color contrast meets WCAG AA
  - Run axe accessibility audit

- [ ] T086 [P] Performance optimization:
  - Code-split auth components (lazy load)
  - Memoize context consumers to prevent re-renders
  - Debounce form validation
  - Lazy load profile/settings pages
  - Monitor bundle size (should not increase > 50KB)

- [ ] T087 Run manual security review:
  - Verify XSS sanitization works
  - Test rate limiting bypass attempts
  - Verify tokens not accessible in DevTools (memory-only access token)
  - Test refresh token rotation
  - Verify logout clears all data

### Validation & Quality Assurance

- [ ] T088 Verify all tasks completed:
  - Run `npm run lint` - no errors or warnings
  - Run `npm run type-check` - TypeScript strict mode passes
  - Run `npm test` - all tests pass (if tests written)
  - Run `npm run build` - build succeeds

- [ ] T089 Verify feature completeness against spec.md:
  - All 10 user stories implemented (check acceptance scenarios)
  - All 52 functional requirements satisfied
  - All 18 success criteria met
  - All edge cases handled

- [ ] T090 Run through quickstart.md validation:
  - Verify all 8 core files implemented correctly
  - Verify code examples compile
  - Verify manual test scenarios pass
  - Verify debugging tips work

**Final Checkpoint**: ✅ Feature 002 complete. All 10 user stories implemented, tested, documented, and ready for deployment.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS all user stories
    ↓
    ├→ Phase 3 (US1 - P1 Registration)
    ├→ Phase 4 (US2 - P1 Login)  
    ├→ Phase 5 (US3 - P1 Token Refresh) ← depends on US2
    ├→ Phase 6 (US5 - P1 Logout) ← depends on US2
    ├→ Phase 7 (US4 - P2 Password Reset)
    ├→ Phase 8 (US6 - P2 Profile) ← depends on US2
    ├→ Phase 9 (US7 - P2 Password Change) ← depends on US2
    ├→ Phase 10 (US8 - P3 Sessions) ← depends on US2
    ├→ Phase 11 (US9 - P3 API Tokens) ← depends on US2
    └→ Phase 12 (US10 - P3 Account Deletion) ← depends on US2
    ↓
Phase 13 (Polish)
```

### User Story Dependencies

```
After Foundational Complete:

US1 (Registration)          = Independent
US2 (Login)                 = Independent
US3 (Token Refresh)         → Depends on US2 (needs access token from login)
US4 (Password Reset)        = Independent (no auth required)
US5 (Logout)                → Depends on US2 (need to be logged in to logout)
US6 (Profile)               → Depends on US2 (protected dashboard)
US7 (Password Change)       → Depends on US2 (protected dashboard)
US8 (Sessions)              → Depends on US2 (protected dashboard)
US9 (API Tokens)            → Depends on US2 (protected dashboard)
US10 (Account Deletion)     → Depends on US2 (protected dashboard)

Parallel Opportunities (after Foundational):
- US1 + US2 can start simultaneously (registration, login both independent)
- US3 can start after US2 (login provides tokens)
- US4 can start anytime (independent password reset)
- US5, US6, US7, US8, US9, US10 can all start after US2 (all need auth)
```

### Parallel Example: Optimized 3-Developer Team

```
Developer A:                Developer B:                Developer C:
┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│ Phase 1: Setup     │    │ (waiting)          │    │ (waiting)          │
│ Phase 2: Found'n   │    │ (waiting)          │    │ (waiting)          │
│ (lead coordinate)  │    │                    │    │                    │
└────────────────────┘    └────────────────────┘    └────────────────────┘
         ↓                         ↓                         ↓
┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│ US1: Registration  │    │ US2: Login         │    │ US4: Pwd Reset     │
│ (3 tasks, 1 hr)    │    │ (3 tasks, 1 hr)    │    │ (3 tasks, 1 hr)    │
└────────────────────┘    └────────────────────┘    └────────────────────┘
         ↓                         ↓                         ↓
┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│ US3: Token Refresh │    │ US5: Logout        │    │ US6: Profile       │
│ (3 tasks, 1 hr)    │    │ (3 tasks, 30 min)  │    │ (3 tasks, 1 hr)    │
└────────────────────┘    └────────────────────┘    └────────────────────┘
         ↓                         ↓                         ↓
┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│ US8: Sessions      │    │ US7: Pwd Change    │    │ US9: API Tokens    │
│ (3 tasks, 1 hr)    │    │ (3 tasks, 1 hr)    │    │ (3 tasks, 1 hr)    │
└────────────────────┘    └────────────────────┘    └────────────────────┘
         ↓                         ↓                         ↓
       Merge                     Merge                     Merge
         ↓
┌────────────────────────────────────────────────────────────┐
│ Phase 13: Polish & Cross-cutting (all developers)         │
│ - Tests, docs, accessibility, performance                 │
│ - Final validation against spec.md                        │
└────────────────────────────────────────────────────────────┘
```

---

## Implementation Strategy

### MVP First (Phase 1 Only - All P1 Stories)

**Scope**: Minimum viable authentication (core flow)

1. ✅ Complete Phase 1: Setup (15 min)
2. ✅ Complete Phase 2: Foundational (3 hrs) ← CRITICAL
3. ✅ Complete Phase 3: US1 Registration (1 hr)
4. ✅ Complete Phase 4: US2 Login (1 hr)
5. ✅ Complete Phase 5: US3 Token Refresh (1 hr)
6. ✅ Complete Phase 6: US5 Logout (30 min)
   
**STOP & VALIDATE**: 
- User can register + verify email
- User can login and maintain session
- User can logout
- Tokens refresh automatically
- **Total time**: ~6.5 hours

**Deploy MVP**: Basic authentication complete. Users can register, login, use app, and logout.

---

### Incremental Delivery

**Phase 1**: Setup + Foundational + All P1 Stories (6.5 hrs) → Deploy MVP  
**Phase 2**: Add P2 Stories (4 hrs total) → Deploy  
**Phase 3**: Add P3 Stories (3 hrs total) → Deploy  
**Phase 4**: Polish & Testing (2 hrs) → Deploy  

**Total time**: ~15.5 hours (developer work)

---

## Summary

**Total Tasks**: 90 implementation tasks (organized by phase)

**Task Distribution**:
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 15 tasks ← BLOCKING phase
- Phase 3 (US1 - Registration): 7 tasks
- Phase 4 (US2 - Login): 3 tasks
- Phase 5 (US3 - Token Refresh): 3 tasks
- Phase 6 (US5 - Logout): 3 tasks
- Phase 7 (US4 - Password Reset): 5 tasks
- Phase 8 (US6 - Profile): 8 tasks
- Phase 9 (US7 - Password Change): 4 tasks
- Phase 10 (US8 - Sessions): 4 tasks
- Phase 11 (US9 - API Tokens): 7 tasks
- Phase 12 (US10 - Account Deletion): 4 tasks
- Phase 13 (Polish): 15 tasks (optional tests + docs)

**Parallel Opportunities**:
- Phase 1: 2 parallelizable tasks
- Phase 2: 10 parallelizable tasks
- Phase 3-12: Multiple parallelizable components per story
- Entire user story layers can run in parallel after Foundational

**MVP Scope**: Phases 1-2 + Phase 3 + Phase 4 + Phase 5 + Phase 6 = **37 tasks** for complete authentication (all P1 stories)

**Format Validation**: ✅ All tasks follow the checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

---

## Notes

- All tasks mapped to files from `plan.md` project structure
- Each task is independently executable with clear file paths
- Story phases are independently testable (can stop at any checkpoint)
- Parallel tasks marked with `[P]` (different files, no cross-dependencies)
- Testing is OPTIONAL (not explicitly requested in spec)
- Rate limiting uses localStorage counter with 60-second reset window
- Token refresh queues concurrent requests to prevent duplicate refresh calls
- All P1 stories (MVP) can be completed in parallel with proper team coordination
- Feature is ready for Phase 2: Implementation once tasks are approved
