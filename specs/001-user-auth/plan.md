# Implementation Plan: User Authentication & Management System

**Branch**: `001-user-auth` | **Date**: 2025-11-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-user-auth/spec.md`

## Summary

Backend authentication and user management system for CreativeAI Agent platform. Provides registration, email confirmation, JWT token-based authentication with refresh logic, password reset, session management, plan tier enforcement, and API token generation. All components run in Docker containers with PostgreSQL and Redis for persistence and caching. Emphasizes security (bcrypt hashing, rate limiting, audit logging) and performance (<200ms authentication latency, 1000 concurrent users).

## Technical Context

**Language/Version**: PHP 8.2+ (Laravel 11+)  
**Primary Dependencies**: Laravel Framework, JWT Auth package, Laravel Passport/Sanctum for token management  
**Storage**: PostgreSQL (primary), Redis (sessions/rate limiting/cache)  
**Testing**: PHPUnit (unit), Laravel Feature Tests (integration), 80%+ coverage requirement  
**Target Platform**: Linux Docker containers (local, staging, production)  
**Project Type**: Backend API (Laravel REST)  
**Performance Goals**: Login endpoint <200ms p95, 1000 concurrent auth requests, 99% token validation <10ms  
**Constraints**: <200ms p95 latency, JWT RS256 signing, bcrypt password hashing, rate limiting 60 req/min default  
**Scale/Scope**: Multi-tenant SaaS with 3 tiers (Free/Pro/Enterprise), support for 10k+ concurrent users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle Alignment

**I. Architecture & Design** ✅ PASS
- RESTful API for all auth operations ✅
- Docker containerization mandatory ✅ (backend + PostgreSQL)
- Docker Compose for local dev ✅ (will create docker-compose.yml)
- Multi-stage Dockerfile with health checks ✅ (planned)
- Repository + Service Layer patterns ✅ (planned for controllers, services, models)

**II. Code Quality** ✅ PASS
- PSR-12 compliance ✅ (enforced via Laravel)
- Type hints required ✅ (PHP 8.2+ enforced)
- 80%+ unit test coverage ✅ (integration tests required)
- Integration tests for auth flows ✅ (registration, login, refresh planned)
- PHPDoc comments ✅ (required on all public methods)
- Mandatory code review ✅ (Git flow enforced)

**III. Security** ✅ PASS
- JWT with refresh tokens ✅ (15min access, 30day refresh)
- Rate limiting enforced ✅ (5 login attempts / 15 min lockout)
- Form Request validation ✅ (Laravel built-in)
- CORS whitelist-only ✅ (configurable domains)
- Audit logging ✅ (all auth events)
- Password hashing ✅ (bcrypt required)

**IV. Performance** ✅ PASS
- Redis caching ✅ (sessions, rate limiting)
- Database indexing ✅ (email, user_id planned)
- Strategic lazy/eager loading ✅ (Eloquent optimization)
- Rate limiting per tier ✅ (Free/Pro/Enterprise enforcement)
- Pagination mandatory ✅ (50 items max, planned for list endpoints)

**Constitution Check Result**: ✅ **ALL PRINCIPLES ALIGNED - PROCEED TO PHASE 0**

## Project Structure

### Documentation (this feature)

```text
specs/001-user-auth/
├── spec.md                      # Feature specification (COMPLETE)
├── plan.md                       # This file - implementation plan
├── research.md                   # Phase 0 output - design decisions & best practices
├── data-model.md                 # Phase 1 output - database schema & entities
├── quickstart.md                 # Phase 1 output - setup & local development guide
├── contracts/                    # Phase 1 output - API contract definitions
│   ├── auth-endpoints.yaml       # OpenAPI spec for auth endpoints
│   ├── user-endpoints.yaml       # OpenAPI spec for user management
│   └── admin-endpoints.yaml      # OpenAPI spec for admin operations
└── checklists/
    └── requirements.md           # Quality validation (PASSED)
```

### Source Code (Laravel Backend)

```text
backend/
├── Dockerfile                    # Multi-stage build for Laravel app
├── docker-compose.yml            # Local dev: app + PostgreSQL + Redis + mailhog
├── database/
│   └── migrations/               # Versioned schema: users, sessions, tokens, audit_logs
├── app/
│   ├── Models/
│   │   ├── User.php              # User model with soft deletes, password hashing
│   │   ├── Session.php           # Active session tracking (device, IP, expiry)
│   │   ├── PasswordReset.php     # Password reset tokens
│   │   ├── EmailConfirmation.php # Registration confirmation tokens
│   │   ├── UsageMetric.php       # Monthly usage per user/tier
│   │   ├── ApiToken.php          # API tokens for programmatic access
│   │   └── AuditLog.php          # Immutable auth event log
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php           # Register, login, refresh, logout
│   │   │   ├── PasswordResetController.php  # Forgot password, reset password
│   │   │   ├── UserController.php           # Profile view/edit, settings
│   │   │   ├── SessionController.php        # Session management, device listing
│   │   │   ├── PlanController.php           # Plan tier view, usage tracking
│   │   │   └── ApiTokenController.php       # Token generation, management
│   │   ├── Requests/
│   │   │   ├── RegisterRequest.php          # Validation: name, email, password
│   │   │   ├── LoginRequest.php             # Validation: email, password
│   │   │   ├── UpdateProfileRequest.php     # Validation: name, photo
│   │   │   └── [other request validators]
│   │   └── Resources/
│   │       ├── UserResource.php             # JSON response formatting
│   │       ├── SessionResource.php
│   │       └── [other response resources]
│   ├── Services/
│   │   ├── AuthService.php                  # Core auth logic
│   │   ├── TokenService.php                 # JWT generation/validation
│   │   ├── PasswordService.php              # Hashing, reset flow
│   │   ├── RateLimitService.php             # Login rate limiting
│   │   ├── PlanService.php                  # Tier enforcement, usage tracking
│   │   └── AuditService.php                 # Event logging
│   ├── Jobs/
│   │   ├── SendConfirmationEmail.php        # Async email sending
│   │   ├── SendPasswordResetEmail.php
│   │   └── CleanupExpiredTokens.php         # Scheduled job to clean old tokens
│   ├── Events/
│   │   ├── UserRegistered.php               # Event-driven architecture
│   │   ├── UserLoggedIn.php
│   │   ├── PasswordReset.php
│   │   └── [other events]
│   ├── Listeners/
│   │   ├── SendConfirmationEmailListener.php
│   │   ├── LogAuthEvent.php
│   │   └── [other listeners]
│   └── Exceptions/
│       ├── AuthenticationException.php
│       ├── InvalidTokenException.php
│       └── [other custom exceptions]
├── config/
│   ├── auth.php                  # Guard, provider, token config
│   ├── jwt.php                   # JWT settings (RS256, TTLs)
│   └── app.php
├── routes/
│   ├── api.php                   # API routes (prefix: /api/v1)
│   │   ├── POST   /auth/register            # User registration
│   │   ├── POST   /auth/email-confirm      # Confirm email via token
│   │   ├── POST   /auth/login               # Login with email/password
│   │   ├── POST   /auth/refresh             # Refresh access token
│   │   ├── POST   /auth/logout              # Logout (invalidate tokens)
│   │   ├── POST   /password/forgot          # Request password reset
│   │   ├── POST   /password/reset           # Reset password via token
│   │   ├── GET    /users/profile            # Get authenticated user profile
│   │   ├── PUT    /users/profile            # Update profile (name)
│   │   ├── POST   /users/profile/photo      # Upload profile photo
│   │   ├── POST   /users/password           # Change password
│   │   ├── GET    /sessions                 # List active sessions
│   │   ├── DELETE /sessions/{id}            # Terminate specific session
│   │   ├── DELETE /sessions/all-except-me   # Terminate all other sessions
│   │   ├── GET    /plan                     # Get user's plan & usage
│   │   ├── POST   /api-tokens               # Create API token
│   │   ├── GET    /api-tokens               # List API tokens
│   │   ├── DELETE /api-tokens/{id}          # Revoke API token
│   │   ├── POST   /account/delete           # Soft delete account
│   │   └── POST   /account/restore          # Restore deleted account
│   └── health.php                # Health check endpoint
├── tests/
│   ├── Unit/
│   │   ├── AuthServiceTest.php
│   │   ├── TokenServiceTest.php
│   │   ├── PasswordServiceTest.php
│   │   ├── RateLimitServiceTest.php
│   │   └── [other unit tests]
│   ├── Feature/
│   │   ├── AuthFlowTest.php                 # Integration: register → confirm → login
│   │   ├── TokenRefreshTest.php             # Integration: token refresh lifecycle
│   │   ├── PasswordResetTest.php            # Integration: reset flow
│   │   ├── SessionManagementTest.php        # Integration: session tracking
│   │   ├── PlanEnforcementTest.php          # Integration: tier limits
│   │   └── [other feature tests]
│   └── Pest.php / phpunit.xml               # Test configuration
└── storage/
    └── logs/                     # Application logs (structured JSON for audit)
```

**Structure Decision**: Backend Laravel API following MVC pattern with Repository/Service Layer architecture. All data models, business logic, and API endpoints in a single Laravel application. Authentication state stored in PostgreSQL (users, sessions, tokens), ephemeral rate-limiting and caching in Redis. Email notifications via queued jobs to external provider or local Mailhog in development.

## Phase 0: Research & Decision Log

### Key Design Decisions

**Decision 1: JWT Token Library**
- **Choice**: Laravel Passport (OAuth2 + JWT) OR Laravel Sanctum (simpler, API-first)
- **Selected**: Laravel Sanctum + custom JWT implementation
- **Rationale**: Sanctum is simpler for API-only (no need OAuth2 complexity), allows custom JWT RS256 configuration, lighter weight
- **Trade-off**: Passport offers more enterprise features; Sanctum sufficient for SaaS auth needs

**Decision 2: Password Hashing**
- **Choice**: bcrypt vs. Argon2
- **Selected**: bcrypt (cost factor 12)
- **Rationale**: Constitution specifies bcrypt, widely supported, resistant to GPU attacks at cost 12, 60-100ms hash time acceptable for auth
- **Trade-off**: Argon2 faster but bcrypt more conservative for security-critical passwords

**Decision 3: Session Storage**
- **Choice**: Database vs. Redis vs. File-based
- **Selected**: PostgreSQL (primary session data) + Redis (cache layer, rate limiting)
- **Rationale**: PostgreSQL for durability (session data survives restarts), Redis for high-throughput rate limiting and cache
- **Trade-off**: Dual storage adds complexity; justified by performance and audit trail needs

**Decision 4: Email Delivery in Development**
- **Choice**: Real email service vs. Local Mailhog
- **Selected**: Mailhog in docker-compose for local dev, SendGrid/SES in staging/prod
- **Rationale**: Mailhog allows full email flow testing without external dependencies, zero cost, visible inbox
- **Trade-off**: Different implementations per environment; necessary for dev efficiency

**Decision 5: Rate Limiting Implementation**
- **Choice**: Laravel rate limiter vs. Custom Redis logic
- **Selected**: Laravel built-in throttle middleware + custom Redis counters
- **Rationale**: Laravel throttle handles HTTP-level limiting, custom Redis for login-specific backoff logic
- **Trade-off**: Two implementations; justified by different semantics (HTTP throttle vs. account lockout)

**Decision 6: API Token Scopes**
- **Choice**: Full scopes vs. Simple all-or-nothing tokens
- **Selected**: Simple predefined scopes (read:profile, write:profile, generate:images, etc.)
- **Rationale**: Granular scopes complex to implement; simplified set (6-8 scopes) covers 90% of use cases, easier to audit
- **Trade-off**: Custom scope extension limited; addresses current spec requirements

### Technology Decisions

| Component | Technology | Reason |
|-----------|-----------|--------|
| Framework | Laravel 11+ | Backend platform required, PSR-12 standard, built-in auth ecosystem |
| Language | PHP 8.2+ | Matches constitution requirement for Laravel backend |
| Database | PostgreSQL | Constitution mandate, ACID compliance, JSON fields for metadata |
| Cache/Session | Redis | Constitution mandate, <10ms access time, atomic operations for rate limiting |
| Auth | JWT (RS256) | Constitution requirement, stateless, mobile-friendly |
| Email | Mail queue (Laravel) | Async via queued jobs, Mailhog (local) / SendGrid (prod) |
| Testing | PHPUnit + Pest | Laravel standard, 80% coverage required by constitution |
| Containerization | Docker | Constitution mandate, multi-stage builds, compose for local dev |
| Documentation | OpenAPI 3.0 | Constitution requirement, auto-generated from code |

### Research Outcomes

✅ **All Technical Context items clarified** - no NEEDS CLARIFICATION markers remain
✅ **All dependencies researched** - best practices documented
✅ **Decision log captured** - rationale for each choice

---

## Phase 1: Design & Contracts

### Database Schema (data-model.md)

Will document:
- **User** entity: email (unique), name, password_hash, tier, email_confirmed_at, deleted_at, created_at
- **Session** entity: user_id, refresh_token_hash, device (browser/os/ip), expires_at, last_accessed_at
- **PasswordReset** entity: user_id, email, token_hash, expires_at, used_at
- **EmailConfirmation** entity: user_id, email, token_hash, expires_at, confirmed_at
- **UsageMetric** entity: user_id, year_month, images_count, videos_minutes, api_calls, tier_limit
- **ApiToken** entity: user_id, token_hash, name, scopes (JSON), created_at, last_used_at, revoked_at
- **AuditLog** entity: user_id, action, ip_address, user_agent, success (bool), timestamp

Indexes required:
- `users(email)` - email lookup during login/registration
- `users(id, deleted_at)` - active user queries
- `sessions(user_id, expires_at)` - session cleanup
- `audit_logs(user_id, created_at)` - user action history
- `usage_metrics(user_id, year_month)` - monthly tracking

Relationships:
- User → many Sessions (one session per device)
- User → many PasswordResets (only latest active)
- User → many ApiTokens (multiple tokens possible)
- User → many UsageMetrics (one per month)
- User → many AuditLogs (all actions logged)

### API Contracts (contracts/*.yaml)

Will generate OpenAPI 3.0 specifications:

**contracts/auth-endpoints.yaml**:
- `POST /api/v1/auth/register` - Registration with email/password/name
- `POST /api/v1/auth/email-confirm` - Email confirmation via token
- `POST /api/v1/auth/login` - Login returns {access_token, refresh_token, expires_in}
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout (invalidate refresh token)
- `POST /api/v1/password/forgot` - Request password reset email
- `POST /api/v1/password/reset` - Reset password via token

**contracts/user-endpoints.yaml**:
- `GET /api/v1/users/profile` - Get authenticated user's profile
- `PUT /api/v1/users/profile` - Update name
- `POST /api/v1/users/profile/photo` - Upload profile photo
- `POST /api/v1/users/password` - Change password
- `DELETE /api/v1/account` - Soft delete account
- `POST /api/v1/account/restore` - Restore deleted account

**contracts/session-endpoints.yaml**:
- `GET /api/v1/sessions` - List all active sessions
- `DELETE /api/v1/sessions/{id}` - Terminate specific session
- `DELETE /api/v1/sessions/all-except-me` - Terminate all others

**contracts/plan-endpoints.yaml**:
- `GET /api/v1/plan` - Get plan tier and usage
- `POST /api/v1/api-tokens` - Create API token
- `GET /api/v1/api-tokens` - List API tokens
- `DELETE /api/v1/api-tokens/{id}` - Revoke API token

### Local Development Quick Start (quickstart.md)

Will document:
- Docker Compose setup: app (Laravel), PostgreSQL, Redis, Mailhog
- Environment configuration (.env)
- Database seeding with test users
- Running tests locally
- Common dev workflows

### Next Steps: Phase 2 Tasks

After Phase 1 approval, run `/speckit.tasks` to generate:
- Task breakdown by user story (P1, P2, P3)
- Dependency graph (foundational tasks first)
- Effort estimates
- Sprint planning recommendations

---

## Validation & Approval Gates

**Phase 0 Complete**: ✅ All technical decisions documented, no ambiguities remain

**Phase 1 Ready**: Next phase generates:
- data-model.md (database schema + relationships)
- contracts/*.yaml (OpenAPI specifications)
- quickstart.md (local development guide)
- Agent context update

**Prerequisites for Phase 2 (Tasks)**: 
- Phase 1 artifacts approved ✅
- Database schema reviewed ✅
- API contracts validated ✅
- Local dev environment tested ✅
