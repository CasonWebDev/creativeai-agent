# Tasks: User Authentication & Management System

**Input**: Design documents from `/specs/001-user-auth/`  
**Branch**: `001-user-auth`  
**Status**: Phase 2 Planning Complete - Ready for Implementation  
**Total Tasks**: 211  
**MVP Scope**: Phases 1-5 (Register → Login → Refresh) = 55 tasks

---

## Format Reference

- **[ID]**: Task sequence number (T001, T002, etc.)
- **[P]**: Parallelizable (can run simultaneously with other [P] tasks in same group)
- **[US#]**: User Story number (US1, US2, etc.) - appears only in story implementation phases
- **File paths**: Always absolute or relative to `backend/` directory

---

## Executive Summary

### Implementation Roadmap

| Phase | User Stories | Count | Priority | Duration (est.) |
|-------|--------------|-------|----------|-----------------|
| 1 | Setup & Infrastructure | 9 | CRITICAL | 1-2 days |
| 2 | Foundational Components | 16 | BLOCKING | 2-3 days |
| 3 | Registration (US1) | 15 | P1 | 1-2 days |
| 4 | Secure Login (US2) | 15 | P1 | 1-2 days |
| 5 | Token Refresh (US3) | 15 | P1 | 1 day |
| 6 | Password Reset (US4) | 20 | P1 | 2 days |
| 7 | Profile Management (US5) | 25 | P2 | 2-3 days |
| 8 | Session Management (US6) | 25 | P2 | 2-3 days |
| 9 | Plan Tier Management (US7) | 25 | P2 | 2-3 days |
| 10 | API Tokens (US8) | 30 | P3 | 3 days |
| 11 | Polish & Cross-Cutting | 16 | P4 | 2 days |

**Total Estimate**: 4-5 weeks for full feature (registration → API tokens)  
**MVP Scope**: 1-2 weeks (Phases 1-5)

### Key Metrics

- **Total Tasks**: 211
- **Parallelizable Tasks**: 87 ([P] marked)
- **User Story Phases**: 8 (one per user story, P1-P3)
- **Test-Driven Tasks**: 24 (contract + integration tests per story)
- **Dependencies**: 14 critical (blocking prerequisites)

### Parallel Execution Example

**Scenario: Implement all P1 stories simultaneously after Phase 2**

```
Day 1-2:   Phase 1 (Setup) + Phase 2 (Foundational) [Sequential, blocking]
Day 3-4:   Phase 3 (Registration) + Phase 4 (Login) + Phase 5 (Refresh) [Parallel]
           - Registration team: T026-T040 (models, controller, jobs)
           - Login team: T041-T055 (rate limiting, JWT, controller)
           - Refresh team: T056-T070 (token service, rotation logic)
           All can work independently; merge when Phase 2 complete
Day 5-6:   Phase 6 (Password Reset) [Sequential or parallel if resources allow]
           Can proceed after Phase 2 only
Result:    Complete MVP in 1-2 weeks with 3-person team
```

### MVP Scope (Recommended First Release)

**Recommended**: Deliver Phases 1-5 as MVP (registration → refresh → logout)

✅ **MVP Includes**:
- User registration with email confirmation
- Secure login with JWT tokens
- Automatic token refresh
- Rate limiting on login attempts
- Session tracking (device/IP)
- Token validation on all protected endpoints

❌ **MVP Excludes** (Phase 2+ features):
- Password reset (Phase 6)
- Profile management (Phase 7)
- Session management (Phase 8)
- Plan tier enforcement (Phase 9)
- API tokens (Phase 10)

**MVP Enables**: All frontend features can proceed (registration, login flows working)  
**MVP Blocks**: Features requiring password reset, profile updates, plan limits

---

## Phase 1: Setup & Infrastructure

**Purpose**: Project initialization and basic structure  
**Duration**: 1-2 days  
**Blocking**: YES - all subsequent work depends on this phase

### Environment & Docker Setup

- [x] T001 Create `.env.example` with required vars: DB_HOST, DB_USER, REDIS_HOST, JWT_SECRET, MAIL_DRIVER
- [x] T002 Create Dockerfile with multi-stage build: base PHP 8.2, composer dependencies, production-optimized
- [x] T003 [P] Create `docker-compose.yml` with 4 services: Laravel app, PostgreSQL 15, Redis 7, Mailhog
- [x] T004 [P] Create `.dockerignore` excluding vendor, node_modules, .git, storage/logs
- [ ] T005 Configure GitHub Actions workflow for CI/CD: tests, linting, Docker build (`.github/workflows/ci.yml`)

### Laravel Project Initialization

- [x] T006 Initialize Laravel 11 project with `composer create-project laravel/laravel:^11`
- [x] T007 [P] Install required packages: `laravel/sanctum`, `firebase/php-jwt`, `predis/predis`
- [x] T008 [P] Generate application key with `php artisan key:generate`
- [x] T009 Configure `.env`: Database, Redis, Mail (Mailhog), JWT settings from `.env.example`

**Checkpoint**: ✅ Docker environment ready, Laravel project initialized, dependencies installed. Proceed to Phase 2.

---

## Phase 2: Foundational Components

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented  
**Duration**: 2-3 days  
**Blocking**: YES - ALL user story work pauses until complete

### Database Foundation & Migrations

- [ ] T010 Create database migration: `create_users_table` with fields (id, email, name, password, tier, email_confirmed_at, last_login_at, profile_photo_url, deleted_at, created_at, updated_at)
- [ ] T011 [P] Create database migration: `create_sessions_table` with fields (id, user_id, refresh_token, device_type, browser_name, os_name, ip_address, user_agent, device_remember, last_accessed_at, expires_at, created_at)
- [ ] T012 [P] Create database migration: `create_password_resets_table` with fields (id, user_id, email, token, expires_at, used_at, created_at)
- [ ] T013 [P] Create database migration: `create_email_confirmations_table` with fields (id, user_id, email, token, expires_at, confirmed_at, created_at)
- [ ] T014 [P] Create database migration: `create_usage_metrics_table` with fields (id, user_id, year_month, images_count, videos_minutes, api_calls, tier_limit, created_at, updated_at)
- [ ] T015 [P] Create database migration: `create_api_tokens_table` with fields (id, user_id, token, name, scopes, created_at, last_used_at, revoked_at)
- [ ] T016 [P] Create database migration: `create_audit_logs_table` with fields (id, user_id, action, ip_address, user_agent, success, metadata, created_at)
- [ ] T017 Run all migrations with `php artisan migrate` and verify in PostgreSQL
- [ ] T018 Create database indexes per data-model.md: email (unique), user_id, expires_at, token, created_at DESC (via migration)

### Base Models & Relationships

- [ ] T019 Create `User` model in `app/Models/User.php` with SoftDeletes trait, fillable fields, relationships to Sessions/PasswordResets/etc.
- [ ] T020 [P] Create `Session` model in `app/Models/Session.php` with belongsTo(User) relationship
- [ ] T021 [P] Create `PasswordReset` model in `app/Models/PasswordReset.php` with belongsTo(User) relationship
- [ ] T022 [P] Create `EmailConfirmation` model in `app/Models/EmailConfirmation.php` with belongsTo(User) relationship
- [ ] T023 [P] Create `UsageMetric` model in `app/Models/UsageMetric.php` with belongsTo(User) relationship
- [ ] T024 [P] Create `ApiToken` model in `app/Models/ApiToken.php` with belongsTo(User) relationship
- [ ] T025 [P] Create `AuditLog` model in `app/Models/AuditLog.php` as immutable audit trail

### Service Layer Infrastructure

- [ ] T026 Create base `AuthService` class in `app/Services/AuthService.php` with abstract methods: register, login, refresh, logout
- [ ] T027 [P] Create `TokenService` class in `app/Services/TokenService.php` with JWT generation, validation, refresh logic templates
- [ ] T028 [P] Create `PasswordService` class in `app/Services/PasswordService.php` with bcrypt hashing, verification methods
- [ ] T029 [P] Create `RateLimitService` class in `app/Services/RateLimitService.php` with Redis-backed rate limiting logic (5 failures / 15 min)
- [ ] T030 [P] Create `AuditService` class in `app/Services/AuditService.php` for logging authentication events
- [ ] T031 [P] Create `PlanService` class in `app/Services/PlanService.php` for tier enforcement, usage tracking

### Middleware & Authentication

- [ ] T032 Create `AuthMiddleware` in `app/Http/Middleware/AuthMiddleware.php` to validate JWT tokens on protected routes
- [ ] T033 [P] Create `RateLimitMiddleware` in `app/Http/Middleware/RateLimitMiddleware.php` for throttling (60 req/min default, 5 failures/15min for login)
- [ ] T034 [P] Create JWT configuration file `config/jwt.php` with RS256 settings, TTLs (access: 15min, refresh: 30day), key paths

### Exception & Response Handling

- [ ] T035 Create `AuthenticationException` in `app/Exceptions/AuthenticationException.php` with 401 status
- [ ] T036 [P] Create `InvalidTokenException` in `app/Exceptions/InvalidTokenException.php` with 401 status
- [ ] T037 [P] Create `RateLimitExceededException` in `app/Exceptions/RateLimitExceededException.php` with 429 status
- [ ] T038 [P] Create custom exception handler in `app/Exceptions/Handler.php` to format JSON responses
- [ ] T039 Create response formatting trait `app/Traits/ApiResponse.php` with success/error/paginated response methods

### Validation & Resources

- [ ] T040 Create base `UserResource` in `app/Http/Resources/UserResource.php` for consistent user JSON formatting
- [ ] T041 [P] Create `SessionResource` in `app/Http/Resources/SessionResource.php` for session data formatting
- [ ] T042 [P] Create `ApiTokenResource` in `app/Http/Resources/ApiTokenResource.php` for token listing (hides token value)
- [ ] T043 [P] Create base `FormRequest` validator in `app/Http/Requests/FormRequest.php` with common validation rules (email, password strength, etc.)

### Configuration & Providers

- [ ] T044 Configure `config/database.php` with PostgreSQL connection and Redis
- [ ] T045 [P] Configure `config/mail.php` for Mailhog (local) and SendGrid (production)
- [ ] T046 [P] Create service provider `app/Providers/AuthServiceProvider.php` to register service classes in container
- [ ] T047 Run `php artisan config:cache` to validate all configurations

**Checkpoint**: All foundational infrastructure complete. Database tables exist with indexes. All models, services, middleware, and configurations in place. User story implementation can now begin independently in parallel.

---

## Phase 3: User Story 1 - Self-Service Registration (Priority: P1) 🎯

**Goal**: Enable new users to create accounts with email confirmation, forming the entry point to the platform

**Independent Test**: User submits registration form → receives confirmation email → clicks link → account is active → can log in

**Prerequisites**: Phase 1 + Phase 2 complete (all foundational services and models ready)

### Implementation for User Story 1

- [ ] T048 [P] [US1] Create `RegisterRequest` in `app/Http/Requests/RegisterRequest.php` with validation rules: email (unique, valid format), name (min 2, max 255), password (min 8, uppercase, lowercase, number)
- [ ] T049 [P] [US1] Create `ConfirmEmailRequest` in `app/Http/Requests/ConfirmEmailRequest.php` with token validation
- [ ] T050 [US1] Create `AuthController` in `app/Http/Controllers/AuthController.php` with register() method implementing: validate input, hash password with bcrypt, create inactive User, generate email confirmation token, dispatch SendConfirmationEmail job
- [ ] T051 [US1] Implement confirmEmail() endpoint in `AuthController` to: validate token (1-hour TTL), mark email_confirmed_at, activate account, return success message
- [ ] T052 [US1] Create `SendConfirmationEmail` job in `app/Jobs/SendConfirmationEmail.php` to send HTML email with confirmation link
- [ ] T053 [P] [US1] Create `UserRegistered` event in `app/Events/UserRegistered.php` to be dispatched after user creation
- [ ] T054 [P] [US1] Create `SendConfirmationEmailListener` in `app/Listeners/SendConfirmationEmailListener.php` listening to UserRegistered event
- [ ] T055 [US1] Create email template in `resources/views/emails/confirm-email.blade.php` with confirmation link, user name, 1-hour expiration notice
- [ ] T056 [US1] Add route `POST /api/v1/auth/register` → `AuthController@register` in `routes/api.php`
- [ ] T057 [US1] Add route `POST /api/v1/auth/email-confirm` → `AuthController@confirmEmail` in `routes/api.php`
- [ ] T058 [US1] Create `AuthServiceTest` unit test in `tests/Unit/Services/AuthServiceTest.php` with test cases: valid registration, duplicate email rejection, weak password rejection, email confirmation, expired token rejection
- [ ] T059 [US1] Create feature test `RegistrationFlowTest` in `tests/Feature/Auth/RegistrationFlowTest.php` with full flow: register → check database → simulate email click → verify account active
- [ ] T060 [US1] Add error handling: duplicate email returns 409, weak password returns 422 with specific constraints, expired token returns 400
- [ ] T061 [US1] Add audit logging via `AuditService::log()` for registration attempts (success and failures)
- [ ] T062 [US1] Verify email confirmation token expires after 1 hour (check token's expires_at in database)

**Checkpoint**: User registration flow complete. Users can register, receive confirmation emails, and activate accounts. Story 1 fully tested and independent.

---

## Phase 4: User Story 2 - Secure User Login (Priority: P1) 🎯

**Goal**: Enable registered users to authenticate and receive JWT tokens for subsequent API access

**Independent Test**: User logs in with valid credentials → receives access + refresh tokens with correct TTLs → can access protected resource → wrong password rejected → account locked after 5 failures

**Prerequisites**: Phase 1 + Phase 2 + Phase 3 complete (User registration working first)

### Implementation for User Story 2

- [ ] T063 [P] [US2] Create `LoginRequest` in `app/Http/Requests/LoginRequest.php` with validation: email (required, valid format), password (required, min 8)
- [ ] T064 [US2] Create `AuthService::login()` method implementing: validate credentials (email + password check), check for account lockout (rate limiting), generate JWT tokens (access 15min + refresh 30day), create Session record with device info, update last_login_at, return tokens
- [ ] T065 [US2] Create `TokenService::generateTokens()` method to create JWT (RS256 signed) with user ID, issued_at, expires_at claims
- [ ] T066 [P] [US2] Implement rate limiting in `RateLimitService`: track failed login attempts per email/IP, lock after 5 failures, 15-minute lockout duration
- [ ] T067 [P] [US2] Create `DeviceDetector` helper in `app/Helpers/DeviceDetector.php` to parse user_agent and extract: browser name (Chrome/Safari/Firefox), OS name (macOS/iOS/Windows), device_type (browser/mobile/desktop)
- [ ] T068 [US2] Create login endpoint `AuthController::login()` in `app/Http/Controllers/AuthController.php`: validate LoginRequest, call AuthService::login(), return access_token, refresh_token, expires_in
- [ ] T069 [US2] Add route `POST /api/v1/auth/login` → `AuthController@login` in `routes/api.php` (NOT protected by auth middleware)
- [ ] T070 [US2] Create unit test `LoginServiceTest` in `tests/Unit/Services/LoginServiceTest.php`: valid credentials, wrong password, nonexistent user, account lockout, token generation
- [ ] T071 [US2] Create feature test `LoginFlowTest` in `tests/Feature/Auth/LoginFlowTest.php`: end-to-end login → session created → device tracked → rate limiting → lockout
- [ ] T072 [US2] Implement error responses: invalid credentials → 401, account locked → 429 with retry-after header, invalid email format → 422
- [ ] T073 [US2] Add audit logging for all login attempts (success and failure) with IP address, user agent, lockout events
- [ ] T074 [P] [US2] Create `UserLoggedIn` event and listener for side effects (e.g., update last_login_at timezone)
- [ ] T075 [US2] Test rate limiting: verify 5 failed attempts trigger lockout, 6th attempt returns 429, unlock after 15 minutes, IP-based tracking

**Checkpoint**: User login complete with JWT tokens and rate limiting. Session tracking working. Story 2 fully tested and independent.

---

## Phase 5: User Story 3 - Automatic Session Refresh (Priority: P1) 🎯

**Goal**: Enable seamless session continuation without user interruption when access tokens expire

**Independent Test**: Token near expiration → call refresh endpoint → receive new access + refresh tokens → old tokens invalid → subsequent request succeeds

**Prerequisites**: Phase 1 + Phase 2 + Phase 4 complete (Login working)

### Implementation for User Story 3

- [ ] T076 [P] [US3] Create `RefreshTokenRequest` in `app/Http/Requests/RefreshTokenRequest.php` validating refresh token presence
- [ ] T077 [US3] Create `TokenService::refresh()` method implementing: validate refresh token (not expired, signature valid), check if <7 days remaining → reset to 30 days, generate new access token (15min), generate new refresh token (30 or 90 day based on remember flag), invalidate old refresh token
- [ ] T078 [US3] Create refresh endpoint `AuthController::refresh()` in `app/Http/Controllers/AuthController.php`: validate RefreshTokenRequest, call TokenService::refresh(), return new tokens with expiration
- [ ] T079 [US3] Add route `POST /api/v1/auth/refresh` → `AuthController@refresh` in `routes/api.php` (NOT protected by auth middleware, but requires valid refresh token header)
- [ ] T080 [US3] Implement token rotation: new refresh token issued on each refresh, old token immediately revoked (update Session.refresh_token), old token cannot be reused
- [ ] T081 [US3] Implement refresh token extension: if <7 days remaining, new refresh token gets full 30-day TTL (auto-reset logic)
- [ ] T082 [US3] Implement "remember device" flag: if user selected remember → refresh token TTL becomes 90 days instead of 30
- [ ] T083 [P] [US3] Create unit test `TokenRefreshTest` in `tests/Unit/Services/TokenRefreshTest.php`: token refresh, token rotation, TTL extension (<7 days), remember flag persistence
- [ ] T084 [P] [US3] Create feature test `TokenRefreshFlowTest` in `tests/Feature/Auth/TokenRefreshFlowTest.php`: request refresh endpoint → new tokens returned → old tokens rejected → verify expiration times
- [ ] T085 [US3] Implement error handling: expired refresh token → 401, invalid token format → 401, token from different user → 403
- [ ] T086 [US3] Add audit logging for token refresh events (success and failures)
- [ ] T087 [US3] Implement logout endpoint `AuthController::logout()`: invalidate current refresh token by updating Session.expires_at = now(), subsequent requests with that token fail
- [ ] T088 [US3] Add route `POST /api/v1/auth/logout` → `AuthController@logout` in `routes/api.php` (protected route)
- [ ] T089 [US3] Test token validation middleware: valid token → request proceeds, expired token → 401, missing token → 401, invalid signature → 401
- [ ] T090 [US3] Measure token refresh latency: target <10ms for validation + <100ms for generation (using Redis caching)

**Checkpoint**: Token refresh complete with rotation and TTL extension. Logout working. Story 3 fully tested and independent.

---

## Phase 6: User Story 4 - Password Reset Flow (Priority: P1)

**Goal**: Enable users to recover account access by setting a new password via secure email link

**Independent Test**: User requests reset → receives email → clicks link within 1 hour → sets new password → can log in with new password → old password rejected

**Prerequisites**: Phase 1 + Phase 2 + Phase 3 (Registration) complete

### Implementation for User Story 4

- [ ] T091 [P] [US4] Create `ForgotPasswordRequest` in `app/Http/Requests/ForgotPasswordRequest.php` validating email only (required, valid format)
- [ ] T092 [P] [US4] Create `ResetPasswordRequest` in `app/Http/Requests/ResetPasswordRequest.php` validating: token, password (min 8, uppercase, lowercase, number), password confirmation
- [ ] T093 [US4] Create `PasswordService::requestReset()` method: find user by email (don't expose email exists), generate secure token, save to PasswordReset table with 1-hour expiration, dispatch SendPasswordResetEmail job
- [ ] T094 [US4] Create `PasswordService::verifyResetToken()` method: validate token exists, not expired, not already used
- [ ] T095 [US4] Create `PasswordService::completeReset()` method: verify token, hash new password with bcrypt cost 12, update User.password, mark PasswordReset.used_at, invalidate all other reset tokens for user, invalidate all sessions (force re-login)
- [ ] T096 [US4] Create forgot-password endpoint `PasswordResetController::requestReset()` in `app/Http/Controllers/PasswordResetController.php`: validate ForgotPasswordRequest, call PasswordService::requestReset(), return 200 with generic message (don't confirm email existence)
- [ ] T097 [US4] Create reset-password endpoint `PasswordResetController::reset()` in `app/Http/Controllers/PasswordResetController.php`: validate ResetPasswordRequest, call PasswordService::completeReset(), return success message and access tokens for auto-login
- [ ] T098 [US4] Add routes in `routes/api.php`: `POST /api/v1/password/forgot` and `POST /api/v1/password/reset` (both NOT protected)
- [ ] T099 [US4] Create `SendPasswordResetEmail` job in `app/Jobs/SendPasswordResetEmail.php` to send HTML email with reset link
- [ ] T100 [US4] Create email template `resources/views/emails/password-reset.blade.php` with reset link, user name, 1-hour expiration warning
- [ ] T101 [P] [US4] Create `PasswordReset` event and listener for audit logging
- [ ] T102 [P] [US4] Create unit test `PasswordResetServiceTest` in `tests/Unit/Services/PasswordResetServiceTest.php`: request reset, verify token, complete reset, invalid token, expired token, reuse prevention
- [ ] T103 [P] [US4] Create feature test `PasswordResetFlowTest` in `tests/Feature/Auth/PasswordResetFlowTest.php`: full flow request → email → click link → new password → login with new password
- [ ] T104 [US4] Implement error handling: nonexistent email returns generic 200 (security), expired token returns 400, already-used token returns 400, weak password returns 422
- [ ] T105 [US4] Verify token 1-hour TTL: create token, wait 1:01, attempt reset → 400 error
- [ ] T106 [US4] Test session invalidation: reset password → all existing sessions become invalid → user must log in again with new password
- [ ] T107 [US4] Add audit logging: password reset requests, completions, failures with email (anonymized)
- [ ] T108 [US4] Implement rate limiting on forgot password: max 3 requests per email per hour (prevent spam)
- [ ] T109 [US4] Test password change requirement validation: password must differ from previous (prevent password=password resets)
- [ ] T110 [US4] Measure password reset flow latency: email delivery + click + page load + password set (target <5 seconds total)

**Checkpoint**: Password reset complete with email flow and session invalidation. Story 4 fully tested and independent. All P1 user stories now complete.

---

## Phase 7: User Story 5 - User Profile Management (Priority: P2)

**Goal**: Enable users to view, edit their profile information, and manage security settings

**Independent Test**: Authenticated user views profile → updates name → uploads photo → changes password → changes persist across sessions

**Prerequisites**: Phase 1 + Phase 2 + Phase 4 (Login working)

### Implementation for User Story 5

- [ ] T111 [P] [US5] Create `UpdateProfileRequest` in `app/Http/Requests/UpdateProfileRequest.php` validating: name (non-empty, max 255, optional)
- [ ] T112 [P] [US5] Create `ChangePasswordRequest` in `app/Http/Requests/ChangePasswordRequest.php` validating: current_password (required), new_password (min 8, uppercase, lowercase, number, differs from current), password_confirmation
- [ ] T113 [US5] Create profile endpoint `UserController::profile()` (GET) in `app/Http/Controllers/UserController.php`: return authenticated user profile (name, email, tier, profile_photo_url, created_at, last_login_at) using UserResource
- [ ] T114 [US5] Create update profile endpoint `UserController::updateProfile()` (PUT) in `app/Http/Controllers/UserController.php`: validate UpdateProfileRequest, update User.name, return updated profile
- [ ] T115 [US5] Add routes: `GET /api/v1/users/profile` and `PUT /api/v1/users/profile` (both protected by auth middleware)
- [ ] T116 [P] [US5] Create photo upload endpoint `UserController::uploadPhoto()` (POST) in `UserController.php`: validate file (JPG/PNG/WebP, max 2MB), upload to S3 bucket, save URL to User.profile_photo_url, return updated profile
- [ ] T117 [P] [US5] Create S3 file storage service `app/Services/FileStorageService.php` with upload() method using AWS S3 SDK or Laravel Storage facade
- [ ] T118 [P] [US5] Add route `POST /api/v1/users/profile/photo` in `routes/api.php` (protected)
- [ ] T119 [US5] Create password change endpoint `UserController::changePassword()` (POST) in `UserController.php`: validate ChangePasswordRequest, verify current password correct, update password with bcrypt, invalidate all sessions except current, return success message
- [ ] T120 [US5] Add route `POST /api/v1/users/password` in `routes/api.php` (protected)
- [ ] T121 [US5] Implement validation: profile name max 255 chars, photo <2MB, no null bytes in inputs
- [ ] T122 [P] [US5] Create unit test `UserProfileServiceTest` in `tests/Unit/Services/UserProfileServiceTest.php`: update name, upload photo, change password, current password verification
- [ ] T123 [P] [US5] Create feature test `ProfileManagementFlowTest` in `tests/Feature/Profile/ProfileManagementFlowTest.php`: view profile → update name → upload photo → change password
- [ ] T124 [US5] Implement error handling: file too large → 413, invalid file format → 422, wrong current password → 401, new password weak → 422
- [ ] T125 [US5] Add audit logging: profile updates, photo uploads, password changes with timestamp and user agent
- [ ] T126 [P] [US5] Create ProfileUpdated event and listener
- [ ] T127 [US5] Test photo upload: verify file stored in S3, URL returned, file accessible via HTTP, old photo cleaned up
- [ ] T128 [US5] Implement CORS for S3 photo URLs (if S3 bucket is separate domain)
- [ ] T129 [US5] Add rate limiting on password changes: max 3 changes per day per user
- [ ] T130 [US5] Verify password change invalidates all other sessions: user logs in elsewhere → loses access

**Checkpoint**: Profile management complete with photo upload and password changes. Story 5 fully tested and independent.

---

## Phase 8: User Story 6 - Session & Device Management (Priority: P2)

**Goal**: Enable users to view all active sessions and terminate any session remotely for security

**Independent Test**: Login from 2+ devices → view all sessions with device info → terminate one session → verify device can no longer authenticate → other sessions remain active

**Prerequisites**: Phase 1 + Phase 2 + Phase 4 (Login working, Session tracking in place)

### Implementation for User Story 6

- [ ] T131 [P] [US6] Create `SessionResource` in `app/Http/Resources/SessionResource.php` formatting: device_type, browser_name, os_name, ip_address, last_accessed_at, created_at, is_current (boolean), id
- [ ] T132 [US6] Create list sessions endpoint `SessionController::index()` (GET) in `app/Http/Controllers/SessionController.php`: return all active sessions for authenticated user (expires_at > now) sorted by last_accessed_at DESC, using SessionResource
- [ ] T133 [US6] Add route `GET /api/v1/sessions` in `routes/api.php` (protected)
- [ ] T134 [P] [US6] Create terminate single session endpoint `SessionController::destroy()` (DELETE) in `SessionController.php`: validate session belongs to user, set Session.expires_at = now(), return 204 No Content
- [ ] T135 [P] [US6] Create terminate all other sessions endpoint `SessionController::destroyOthers()` (DELETE) in `SessionController.php` with route `DELETE /api/v1/sessions/all-except-me`: update all user sessions except current (identified by refresh token from request), set expires_at = now(), return 204
- [ ] T136 [US6] Add routes: `DELETE /api/v1/sessions/{id}` and `DELETE /api/v1/sessions/all-except-me` (both protected)
- [ ] T137 [US6] Implement device detection: extract browser, OS from user_agent using `DeviceDetector` helper (created in Phase 4)
- [ ] T138 [US6] Test session listing: create 3 sessions from different IPs/browsers, list endpoint returns all 3 with correct device info
- [ ] T139 [P] [US6] Create unit test `SessionManagementTest` in `tests/Unit/Services/SessionManagementTest.php`: list sessions, terminate single, terminate others, current session identification
- [ ] T140 [P] [US6] Create feature test `SessionTerminationFlowTest` in `tests/Feature/Session/SessionTerminationFlowTest.php`: multi-device login → view sessions → terminate → verify access denied
- [ ] T141 [US6] Implement error handling: invalid session ID → 404, session belongs to different user → 403, terminating all sessions → 400 with message "cannot terminate all sessions including current"
- [ ] T142 [US6] Add audit logging: session list views, terminations with device info, IP address
- [ ] T143 [US6] Create SessionTerminated event and listener for notifications (future feature: notify user on other devices)
- [ ] T144 [US6] Test authorization: user A cannot view/terminate sessions of user B (403)
- [ ] T145 [US6] Implement session expiration cleanup: scheduled job runs daily, deletes sessions with expires_at < 7 days ago
- [ ] T146 [US6] Measure session list latency: <100ms for 10 active sessions (with database indexing)

**Checkpoint**: Session management complete with multi-device support. Story 6 fully tested and independent.

---

## Phase 9: User Story 7 - Plan Tier Management (Priority: P2)

**Goal**: Enable users to see their plan tier, usage metrics, and enforce plan-based limits on features

**Independent Test**: User views dashboard → sees current plan (Free/Pro/Enterprise) and usage → approaching 80% limit → notification sent → reaching 100% → action blocked → Enterprise user has unlimited

**Prerequisites**: Phase 1 + Phase 2 + Phase 4 (Login working, User model with tier field)

### Implementation for User Story 7

- [ ] T147 [P] [US7] Create `PlanService::getUserPlan()` method returning: current_tier (Free/Pro/Enterprise), usage metrics (images_count, videos_minutes, api_calls), monthly_limit values per tier, days_until_reset
- [ ] T148 [P] [US7] Create `PlanService::trackUsage()` method: increment UsageMetric for user/month/metric_type (images, videos, api_calls)
- [ ] T149 [P] [US7] Create `PlanService::checkLimit()` method: given metric_type + user, return if limit exceeded, usage percentage, tier_limit value
- [ ] T150 [P] [US7] Create plan constants in `config/plans.php`: Free (10 images, 5 videos, 50 api_calls), Pro (200 images, 100 videos, 10000 api_calls), Enterprise (unlimited all)
- [ ] T151 [US7] Create plan endpoint `PlanController::show()` (GET) in `app/Http/Controllers/PlanController.php`: return current plan, usage, limits, days_until_reset using custom PlanResource
- [ ] T152 [US7] Add route `GET /api/v1/plan` in `routes/api.php` (protected)
- [ ] T153 [P] [US7] Create resource `app/Http/Resources/PlanResource.php` formatting: tier, usage (images_used, images_limit, videos_used, videos_limit, api_calls_used, api_calls_limit), days_until_reset, upgrade_url
- [ ] T154 [P] [US7] Create middleware `EnforcePlanLimitMiddleware` in `app/Http/Middleware/EnforcePlanLimitMiddleware.php` that checks plan limits before allowing requests to limited endpoints
- [ ] T155 [US7] Implement image generation endpoint (stub for testing plan limits) `GenerationController::image()`: call PlanService::checkLimit('images'), if exceeded return 402 Payment Required, else track usage and proceed
- [ ] T156 [US7] Implement usage tracking: on each limited action (image generate, video transcode, api call), call PlanService::trackUsage(user_id, metric_type)
- [ ] T157 [US7] Implement warning notifications: when usage reaches 80% of limit, queue notification job (email + in-app message)
- [ ] T158 [US7] Implement blocking notifications: when usage reaches 100% of limit, queue critical notification + block further action with 402 Payment Required response
- [ ] T159 [P] [US7] Create unit test `PlanEnforcementTest` in `tests/Unit/Services/PlanEnforcementTest.php`: checkLimit (under, at, over limits), tier limits validation, usage tracking
- [ ] T160 [P] [US7] Create feature test `PlanLimitEnforcementFlowTest` in `tests/Feature/Plan/PlanLimitEnforcementFlowTest.php`: Free tier max 10 images → 11th request rejected, Pro tier allows 200 → Enterprise unlimited
- [ ] T161 [US7] Test monthly reset: usage_metrics reset on day 1 of each month (via scheduled job or query logic)
- [ ] T162 [US7] Implement error handling: plan lookup failure → 500, invalid metric type → 400, user has no tier → return default Free
- [ ] T163 [US7] Add audit logging: plan views, usage tracking, limit enforcement, blocking events
- [ ] T164 [P] [US7] Create notification service for 80% and 100% alerts (integrate with notification system)
- [ ] T165 [US7] Test Enterprise tier: no limits enforced regardless of usage
- [ ] T166 [US7] Verify 402 Payment Required response format: includes upgrade_url and plan_upgrade_prompt message
- [ ] T167 [US7] Implement usage reporting: daily report of usage by metric type per user

**Checkpoint**: Plan tier management complete with limit enforcement. Story 7 fully tested and independent.

---

## Phase 10: User Story 8 - API Token Management (Priority: P3)

**Goal**: Enable Pro/Enterprise users to generate and manage API tokens for programmatic access

**Independent Test**: Pro user generates API token → saves token → uses in API request with Bearer auth → token works → user revokes → subsequent requests fail → Free tier user cannot generate

**Prerequisites**: Phase 1 + Phase 2 + Phase 4 (Login working) + Phase 9 (Plan tier checking)

### Implementation for User Story 8

- [ ] T168 [P] [US8] Create `GenerateApiTokenRequest` in `app/Http/Requests/GenerateApiTokenRequest.php` validating: name (required, max 255), scopes (required, array of valid scope names)
- [ ] T169 [P] [US8] Create `RevokeApiTokenRequest` in `app/Http/Requests/RevokeApiTokenRequest.php` (simple, just token ID validation)
- [ ] T170 [P] [US8] Create `ApiTokenService` in `app/Services/ApiTokenService.php` with methods: generateToken(user, name, scopes), validateToken(token), trackUsage(token_id), revokeToken(token_id)
- [ ] T171 [US8] Create create API token endpoint `ApiTokenController::store()` (POST) in `app/Http/Controllers/ApiTokenController.php`: validate user tier (Pro/Enterprise only), validate GenerateApiTokenRequest, generate secure token (32+ chars), hash token with SHA256, save ApiToken with scopes, return unhashed token (only once) wrapped in note "Save this token securely"
- [ ] T172 [US8] Create list API tokens endpoint `ApiTokenController::index()` (GET) in `app/Http/Controllers/ApiTokenController.php`: return all tokens for user (name, created_at, last_used_at, scopes, token_id) - exclude actual token value
- [ ] T173 [US8] Create revoke API token endpoint `ApiTokenController::destroy()` (DELETE) in `app/Http/Controllers/ApiTokenController.php`: validate token belongs to user, set revoked_at = now(), return 204
- [ ] T174 [US8] Add routes in `routes/api.php`: `POST /api/v1/api-tokens`, `GET /api/v1/api-tokens`, `DELETE /api/v1/api-tokens/{id}` (all protected)
- [ ] T175 [P] [US8] Define scopes in `config/api-scopes.php`: read:profile, write:profile, generate:images, generate:videos, manage:projects, manage:api-tokens
- [ ] T176 [P] [US8] Create API token authentication middleware `ApiTokenMiddleware` in `app/Http/Middleware/ApiTokenMiddleware.php`: extract Bearer token from header, validate token (hash match), check not revoked, verify scopes, attach token and user to request
- [ ] T177 [US8] Implement API token rate limiting: 60 requests/minute per token (tracked in Redis by token_id)
- [ ] T178 [US8] Create token validation unit test `ApiTokenValidationTest` in `tests/Unit/Services/ApiTokenValidationTest.php`: generate token, validate token, revoke prevents validation, scope checking, rate limiting
- [ ] T179 [P] [US8] Create feature test `ApiTokenFlowTest` in `tests/Feature/ApiToken/ApiTokenFlowTest.php`: Pro user generates → uses in API call → success, revokes → call fails, Free user attempts generate → 403 Forbidden, scope validation
- [ ] T180 [US8] Implement error handling: Free tier user attempts token generation → 403 Forbidden, revoked token → 401, invalid token format → 401, malformed Bearer header → 401
- [ ] T181 [P] [US8] Implement token usage tracking: on each API token request, update ApiToken.last_used_at timestamp
- [ ] T182 [P] [US8] Add audit logging: token generation, revocation, usage attempts (success and failures)
- [ ] T183 [US8] Create TokenGenerated event and listener for notifications
- [ ] T184 [US8] Test scope enforcement: token with read:profile can call GET profile but cannot POST profile updates (403)
- [ ] T185 [US8] Implement token expiration (optional): tokens never auto-expire unless revoked (or add 1-year expiration per business requirement)
- [ ] T186 [US8] Verify token hashing: saved token is hashed SHA256, raw token never stored in database
- [ ] T187 [US8] Test rate limiting on API token: 60 requests/min allowed, 61st request returns 429 with retry-after header
- [ ] T188 [US8] Implement token pagination in list endpoint: max 50 tokens per page, ordered by created_at DESC
- [ ] T189 [US8] Create API endpoint documentation in `resources/docs/api-tokens.md` with examples: generate, list, revoke, usage
- [ ] T190 [US8] Measure API token validation latency: target <5ms including Redis hash lookup

**Checkpoint**: API token management complete with scope-based access control. Story 8 fully tested and independent. All user stories now complete.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, documentation, and deployment preparation

**Duration**: 2 days

### Final Integration & Testing

- [ ] T191 Create integration test suite `tests/Integration/FullAuthFlowTest.php` covering complete user journey: register → confirm email → login → get tokens → use access token → refresh token → view sessions → change password → logout
- [ ] T192 Create performance test in `tests/Performance/AuthPerformanceTest.php` measuring: login latency <200ms p95, token validation <10ms, session query <20ms, usage check <15ms
- [ ] T193 [P] Create stress test: 1000 concurrent login attempts, verify no data corruption, rate limiting effective
- [ ] T194 [P] Run full test suite with coverage report: `php artisan test --coverage`, verify 80%+ coverage on all auth services
- [ ] T195 Generate code coverage HTML report: `./vendor/bin/phpunit --coverage-html coverage/`

### Documentation & OpenAPI Specs

- [ ] T196 Generate OpenAPI 3.0 spec `docs/openapi/auth-endpoints.yaml` for all auth routes: register, login, refresh, logout, email-confirm with examples
- [ ] T197 [P] Generate OpenAPI spec `docs/openapi/user-endpoints.yaml` for profile, password, sessions endpoints with request/response examples
- [ ] T198 [P] Generate OpenAPI spec `docs/openapi/plan-endpoints.yaml` for plan view, usage tracking, API token management endpoints
- [ ] T199 Create quickstart guide `docs/quickstart.md`: local setup with Docker Compose, environment variables, running tests, testing endpoints with Postman/curl
- [ ] T200 [P] Create API documentation `docs/API.md`: authentication flow (JWT), error codes, rate limiting, usage tracking, examples
- [ ] T201 [P] Create deployment guide `docs/DEPLOYMENT.md`: Docker build, environment variables for production, database migrations, health checks

### Docker & Infrastructure

- [ ] T202 Create production Dockerfile `backend/Dockerfile` with: multi-stage (builder → runtime), PHP 8.2, composer install, optimize autoload, health check
- [ ] T203 [P] Create `docker-compose.yml` for local development with: app (Laravel), db (PostgreSQL), redis, mailhog, volumes for code/storage
- [ ] T204 [P] Create `.env.production` template with production settings: DB_CONNECTION=pgsql, REDIS_HOST, JWT_SECRET, MAIL_DRIVER=sendgrid
- [ ] T205 Create startup script `docker-entrypoint.sh`: run migrations, cache config, start app
- [ ] T206 [P] Setup GitHub Actions workflow `.github/workflows/deploy.yml`: build Docker image, push to registry, deploy to staging/production
- [ ] T207 [P] Create health check endpoint `GET /api/health` returning: {status: ok, timestamp, version, database: ok, redis: ok}

### Final Quality Assurance

- [ ] T208 Security review: check for SQL injection, XSS, CSRF, hardcoded secrets, weak crypto
- [ ] T209 [P] Code review: PSR-12 compliance, type hints, documentation, exception handling
- [ ] T210 [P] Manual testing: register new user → full flow → multiple devices → plan limits → API tokens (smoke test all features)
- [ ] T211 Performance validation: verify latency targets met (login <200ms, token validation <10ms, usage check <15ms)

**Checkpoint**: All 8 user stories complete and integrated. Full test coverage 80%+. Documentation complete. Ready for staging deployment.

---

## Dependency Graph & Parallel Execution

### Critical Path (Sequential)

```
T001-T009 (Setup: 1-2 days)
    ↓
T010-T047 (Foundational: 2-3 days) [BLOCKING - must complete before ANY user story]
    ↓
T048-T062 (US1 Registration: 1-2 days) [P1 MVP]
    ├→ T063-T075 (US2 Login: 1-2 days) [Parallel with T091-T110]
    └→ T091-T110 (US4 Password Reset: 2 days) [Parallel with US2]
    ↓
T076-T090 (US3 Token Refresh: 1 day) [Requires US2 login working]
    ↓
T111-T130 (US5 Profile: 2-3 days) [Can start after Foundation]
T131-T146 (US6 Sessions: 2 days) [Can start after Foundation]
T147-T167 (US7 Plan Limits: 2-3 days) [Can start after Foundation]
    [All above (US5, US6, US7) can run in parallel]
    ↓
T168-T190 (US8 API Tokens: 3 days) [Can start after Foundation + US7 for tier checking]
    ↓
T191-T211 (Polish & Cross-cutting: 2 days) [Requires all stories complete]
```

### Parallel Execution Example (3-person team)

```
PHASE 1 (Days 1-2): All 3 developers work on Setup + Foundational
  - Dev 1: T001-T009 (Docker/Laravel), then help with Phase 2
  - Dev 2: T010-T020 (Migrations + Models)
  - Dev 3: T021-T047 (Services, Middleware, Config)

PHASE 2 (Days 3-4): Parallel user story implementation
  - Dev 1: T048-T062 (Registration - US1) [P1]
  - Dev 2: T063-T075 (Login - US2) [P1]
  - Dev 3: T091-T110 (Password Reset - US4) [P1]
  
  RESULT: After 4 days, all core P1 auth working independently

PHASE 3 (Day 5): Dependency resolved
  - All 3 devs: T076-T090 (Token Refresh - US3 requires login)

PHASE 4 (Days 6-8): Parallel secondary stories
  - Dev 1: T111-T130 (Profile - US5) [P2]
  - Dev 2: T131-T146 (Sessions - US6) [P2]
  - Dev 3: T147-T167 (Plan Limits - US7) [P2]

PHASE 5 (Days 9-11): API Tokens
  - All 3 devs: T168-T190 (API Tokens - US8) [P3, depends on Plan limits]

PHASE 6 (Days 12-13): Final integration
  - All 3 devs: T191-T211 (Polish & Cross-cutting)

Total: 2 weeks for complete implementation with 3 developers
MVP (US1-US3): 5 days with 3 developers
```

### Parallelizable Groups

**Can run simultaneously:**
- T001-T009 (Setup) - all [P]
- T010-T025 (Foundational migrations + models) - most [P] except ordering dependencies
- T026-T062 (US1) parallel with T063-T075 (US2) parallel with T091-T110 (US4)
- T111-T130 (US5) parallel with T131-T146 (US6) parallel with T147-T167 (US7)
- T191-T195 (Final tests) - can run as Phase 11 starts

**Must wait for:**
- Foundation (T010-T047) blocks all user stories
- Login (US2, T063-T075) blocks Token Refresh (US3, T076-T090)
- Plan Limits (US7, T147-T167) blocks API Tokens (US8, T168-T190)

---

## Success Metrics & Acceptance Criteria

### Phase Completion Checklist

**Phase 1 Complete When:**
- [ ] Docker compose starts successfully with no errors
- [ ] Laravel app boots and connects to PostgreSQL + Redis
- [ ] Health check endpoint (`GET /api/health`) returns 200 ok

**Phase 2 Complete When:**
- [ ] All 7 database tables created with correct schema
- [ ] All models instantiate without errors
- [ ] All service classes inject and execute methods
- [ ] Authentication middleware validates tokens correctly
- [ ] 80%+ unit test coverage on services

**Phase 3 (US1) Complete When:**
- [ ] Registration endpoint accepts valid input, creates User in database
- [ ] Email confirmation token sent to user email (visible in Mailhog)
- [ ] Email confirmation endpoint validates token, activates account
- [ ] Duplicate email rejected with 409 Conflict
- [ ] Integration test: register → confirm → login succeeds
- [ ] Audit log captures all registration events

**Phase 4 (US2) Complete When:**
- [ ] Login endpoint accepts email + password, returns JWT tokens
- [ ] Tokens have correct TTLs (access 15min, refresh 30day)
- [ ] 5 failed login attempts trigger 15-minute lockout
- [ ] Session created with device tracking (browser/OS/IP)
- [ ] Integration test: login → make authenticated request → succeeds
- [ ] Wrong password returns 401 Unauthorized

**Phase 5 (US3) Complete When:**
- [ ] Refresh endpoint accepts refresh token, returns new access + refresh tokens
- [ ] Old refresh token revoked after refresh (token rotation)
- [ ] <7 day remaining → 30-day reset
- [ ] Remember device flag → 90-day TTL
- [ ] Logout invalidates refresh token
- [ ] Integration test: token refresh → new tokens work → old token rejected

**Phase 6 (US4) Complete When:**
- [ ] Forgot password endpoint sends reset email
- [ ] Email contains link with valid token (1-hour TTL)
- [ ] Reset endpoint accepts token + new password, updates database
- [ ] Old password no longer works for login
- [ ] All active sessions invalidated after reset
- [ ] Expired token returns 400 error
- [ ] Integration test: request reset → click link → set password → login with new

**Phase 7 (US5) Complete When:**
- [ ] Profile endpoint returns user data (name, email, tier, photo URL)
- [ ] Update profile endpoint changes name (persists)
- [ ] Photo upload accepts JPG/PNG/WebP, stores in S3, returns URL
- [ ] Password change requires current password, validates new password strength
- [ ] Old password no longer works after change
- [ ] Photo upload rejects >2MB files with 413 error
- [ ] Integration test: update name → upload photo → change password → verify all changes

**Phase 8 (US6) Complete When:**
- [ ] Sessions endpoint lists all active sessions with device info
- [ ] Terminate session endpoint invalidates specific session
- [ ] Terminate all others invalidates all except current
- [ ] Terminated session returns 401 on next request
- [ ] Sessions tracked with IP, browser, OS, last access time
- [ ] Device detection works across major browsers (Chrome, Safari, Firefox)
- [ ] Integration test: login from 2 devices → terminate one → verify other still works

**Phase 9 (US7) Complete When:**
- [ ] Plan endpoint returns current tier, usage, limits, days until reset
- [ ] Free tier: 10 images/month limit enforced
- [ ] Pro tier: 200 images/month limit enforced
- [ ] Enterprise tier: unlimited (no enforcement)
- [ ] 80% usage triggers notification
- [ ] 100% usage blocks action with 402 Payment Required
- [ ] Usage resets on day 1 of each month
- [ ] Integration test: reach limit → next action blocked → verify 402 response

**Phase 10 (US8) Complete When:**
- [ ] Pro/Enterprise users can generate API tokens
- [ ] Token returned once, hidden in list view
- [ ] API request with token in Bearer header accepted
- [ ] Token usage tracked (last_used_at updated)
- [ ] Free tier cannot generate tokens (403 Forbidden)
- [ ] Revoked token returns 401 on next request
- [ ] Scope enforcement works (read token cannot write)
- [ ] Rate limiting: 60 requests/min per token
- [ ] Integration test: generate → use in API call → success, revoke → failure

**Phase 11 Complete When:**
- [ ] Full integration test: register → login → use profile → manage sessions → check usage → generate API token → use token
- [ ] 80%+ code coverage achieved
- [ ] All endpoints documented in OpenAPI 3.0
- [ ] Latency targets met: login <200ms, token validation <10ms, usage check <15ms
- [ ] 1000 concurrent login requests succeed with rate limiting working
- [ ] Dockerfile builds and runs locally
- [ ] GitHub Actions CI/CD passes all tests
- [ ] Ready for staging deployment

---

## Task Statistics

| Metric | Value |
|--------|-------|
| Total Tasks | 211 |
| Setup Tasks | 9 |
| Foundational Tasks | 39 |
| User Story 1 (US1) | 15 |
| User Story 2 (US2) | 15 |
| User Story 3 (US3) | 15 |
| User Story 4 (US4) | 20 |
| User Story 5 (US5) | 25 |
| User Story 6 (US6) | 25 |
| User Story 7 (US7) | 25 |
| User Story 8 (US8) | 30 |
| Polish & Cross-Cutting | 21 |
| Parallelizable Tasks | 87 (41%) |
| Critical Path Tasks | 56 (27%) |
| Test Tasks | 24 (11%) |

---

## MVP Recommendation

**Deliver in Sprint 1 (1-2 weeks)**: Phases 1-5

- ✅ User registration with email confirmation
- ✅ Secure login with JWT tokens + rate limiting
- ✅ Automatic token refresh with rotation
- ✅ Session tracking (device, IP, browser)
- ✅ Login rate limiting (5 failures / 15 min lockout)
- ✅ Full test coverage (80%+)

**Outcome**: Frontend team can integrate registration + login flows. API fully functional for authentication.

**Defer to Sprint 2**: Phases 6-8 (Password reset, profile management, session management)

**Defer to Sprint 3**: Phases 9-10 (Plan limits, API tokens)

---

## Notes for Implementation

1. **TDD Approach**: Write tests FIRST (T048, T063, etc.), then implement. Tests fail initially, implementation makes them pass.

2. **Environment Variables**: Use `.env.example` for template. Each phase may add new vars (JWT_SECRET, S3_BUCKET, SENDGRID_API_KEY, etc.).

3. **Database Migrations**: Commit migrations to git, run `php artisan migrate` before each feature development.

4. **API Versioning**: All routes use `/api/v1/` prefix to allow future versioning.

5. **Error Responses**: Consistent JSON format: `{"error": "message", "code": "error_code", "status": 400}`

6. **Logging**: All auth events logged to `storage/logs/laravel.log` and `audit_logs` table.

7. **Rate Limiting**: Use Redis for distributed rate limiting (works across multiple app instances).

8. **Testing**: Run tests frequently: `php artisan test` or `./vendor/bin/phpunit`. Coverage report: `php artisan test --coverage`

9. **Code Review**: Before merging each phase, run: linting (`composer lint`), tests (`php artisan test`), coverage check (80%+).

10. **Git Workflow**: 
    - Working branch: `001-user-auth` (already created)
    - Commit after each phase completion
    - PR before merge to `main`

---

**End of Task Breakdown**  
**Status**: ✅ Ready for implementation  
**Total Effort**: 4-5 weeks (all stories) | 1-2 weeks (MVP)  
**Next Step**: Begin Phase 1 (Setup) tasks
