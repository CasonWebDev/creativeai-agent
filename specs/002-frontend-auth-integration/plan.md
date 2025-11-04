# Implementation Plan: Frontend Next.js + Backend Laravel JWT Authentication Integration

**Branch**: `002-frontend-auth-integration` | **Date**: 4 de novembro de 2025 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-frontend-auth-integration/spec.md`

## Summary

Implement a complete JWT-based authentication system for the Next.js frontend integrating with the Laravel backend (Feature 001). Covers user registration, email verification, login with automatic token refresh, profile management, multi-device sessions, and advanced features for Pro/Enterprise users. 

**Primary Requirements**:
- P1 (MVP): Registration, login, automatic token refresh, logout, email verification
- P2 (Important): Password reset, profile editing, password change
- P3 (Advanced): Multi-device sessions, API tokens, account deletion

**Technical Approach**: Context API for state management, Axios with interceptors for API communication, Zod for validation, memory-only access tokens, localStorage for refresh tokens and rate limiting, Next.js App Router with route groups.

## Technical Context

**Language/Version**: TypeScript + Next.js 16 + React 19  
**Primary Dependencies**: Axios (HTTP), Zod (validation), Shadcn/ui (components), Context API (state), Tailwind CSS (styling)  
**Storage**: Browser storage (sessionStorage for refresh token, localStorage for rate limiting state)  
**Testing**: Jest + React Testing Library (unit/component), Cypress or Playwright (E2E)  
**Target Platform**: Web (browser) - desktop and mobile responsive  
**Project Type**: Web frontend + backend integration  
**Performance Goals**: 
  - Login/dashboard reach: < 30 seconds
  - Token refresh: transparent (zero user-visible delay)
  - Form validation: < 100ms inline feedback
  - Session list load: < 2 seconds
  - Avatar upload: < 5 seconds for files < 2MB

**Constraints**: 
  - Access token MUST be memory-only (security requirement)
  - Rate limiting: max 3 login attempts per minute (localStorage-based)
  - Session persistence across page reload required
  - 100% protected routes must enforce authentication
  - Zero successful XSS attacks (strict input sanitization)

**Scale/Scope**: 
  - 10 user stories (P1: 4, P2: 3, P3: 3)
  - 52 functional requirements
  - 9 major feature areas (auth, tokens, password, profile, sessions, API tokens, deletion, UX, architecture)
  - MVP focuses on P1 + P2 flows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Architecture & Design
- ✅ **REST API adherence**: Backend (Feature 001) follows RESTful principles; frontend integrates via REST endpoints
- ✅ **Separation of concerns**: Frontend (Next.js) and backend (Laravel) clearly separated; API communication via OpenAPI endpoints
- ✅ **Design patterns**: Implementing Repository pattern for API client, Service Layer for auth logic, Factory for token management
- ✅ **Docker requirements**: Backend already containerized (per Feature 001); frontend is web app (no container required for frontend in development)
- ⚠️ **Note**: Docker Compose requirement applies to backend setup, not this frontend implementation

### Principle II: Code Quality
- ✅ **TypeScript strict mode**: Required for all frontend code
- ✅ **Testing**: 80%+ code coverage for auth-related code (requirement SC-016)
- ✅ **Linting & formatting**: Must follow project ESLint/Prettier standards
- ✅ **Documentation**: Inline comments for complex token refresh logic, interceptor setup

### Principle III: Deployment & Operations
- ✅ **Environment configuration**: Via .env.local and NEXT_PUBLIC_API_URL
- ✅ **Error handling**: Consistent error response handling, user-friendly messages
- ✅ **Security**: XSS sanitization, token security (memory-only access tokens), rate limiting

**Status**: ✅ **PASS** - All principles satisfied. Frontend is web-based SPA, not backend service, so Docker containerization doesn't apply.

## Project Structure

### Documentation (this feature)

```text
specs/002-frontend-auth-integration/
├── spec.md              # Feature specification (complete)
├── plan.md              # This implementation plan
├── research.md          # Phase 0: Research findings (to be created)
├── data-model.md        # Phase 1: Data model and entity design (to be created)
├── quickstart.md        # Phase 1: Developer quickstart guide (to be created)
├── contracts/           # Phase 1: API contracts (to be created)
│   ├── auth-api.yaml    # OpenAPI spec for auth endpoints
│   └── contracts.md     # Contract documentation
├── checklists/
│   └── requirements.md  # Quality validation checklist
└── README.md            # Feature summary
```

### Source Code (frontend)

```text
frontend/
├── app/
│   ├── (auth)/                      # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   └── verify-email/
│   │       └── page.tsx
│   ├── (dashboard)/                 # Protected route group
│   │   ├── layout.tsx               # Protected layout with auth check
│   │   ├── page.tsx                 # Dashboard home
│   │   ├── profile/
│   │   │   ├── page.tsx
│   │   │   └── edit/
│   │   ├── settings/
│   │   │   ├── page.tsx
│   │   │   ├── password/
│   │   │   ├── sessions/
│   │   │   ├── api-tokens/
│   │   │   └── account/
│   │   └── pricing/
│   ├── globals.css
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Landing page
├── components/
│   ├── auth/                        # Auth-specific components
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   ├── password-reset-form.tsx
│   │   ├── email-verification.tsx
│   │   └── logout-button.tsx
│   ├── profile/                     # Profile management components
│   │   ├── profile-view.tsx
│   │   ├── profile-edit-form.tsx
│   │   ├── avatar-upload.tsx
│   │   ├── password-change-form.tsx
│   │   ├── sessions-list.tsx
│   │   ├── api-tokens-list.tsx
│   │   └── account-deletion.tsx
│   ├── app-header.tsx               # Header with user menu
│   ├── app-sidebar.tsx              # Sidebar navigation
│   ├── skip-link.tsx                # Accessibility
│   ├── theme-provider.tsx           # Theme context
│   └── ui/                          # Shadcn/ui components
├── lib/
│   ├── api/
│   │   ├── client.ts                # Axios instance with interceptors
│   │   ├── auth.ts                  # Auth API endpoints
│   │   ├── profile.ts               # Profile API endpoints
│   │   ├── interceptors.ts          # Request/response interceptors
│   │   └── error-handler.ts         # Centralized error handling
│   ├── hooks/
│   │   ├── useAuth.ts               # Main auth hook
│   │   ├── useUser.ts               # User data hook
│   │   ├── useProtectedRoute.ts     # Route protection hook
│   │   ├── useRateLimit.ts          # Rate limiting hook
│   │   └── use-toast.ts             # Toast notifications (existing)
│   ├── context/
│   │   ├── AuthContext.tsx          # Auth state context
│   │   └── AuthProvider.tsx         # Context provider
│   ├── validators/
│   │   └── auth.schemas.ts          # Zod validation schemas
│   ├── utils/
│   │   ├── token.ts                 # Token utility functions
│   │   ├── storage.ts               # Storage utility functions
│   │   ├── rate-limit.ts            # Rate limiting utilities
│   │   └── sanitize.ts              # Input sanitization
│   ├── types/
│   │   ├── auth.d.ts                # Auth types
│   │   ├── user.d.ts                # User types
│   │   └── api.d.ts                 # API types
│   └── utils.ts                     # Existing utilities (existing)
├── styles/                          # Existing style files (existing)
├── public/                          # Static assets (existing)
├── tests/
│   ├── unit/
│   │   ├── hooks/
│   │   │   ├── useAuth.test.ts
│   │   │   └── useUser.test.ts
│   │   ├── utils/
│   │   │   ├── token.test.ts
│   │   │   └── rate-limit.test.ts
│   │   └── validators/
│   │       └── auth.schemas.test.ts
│   ├── integration/
│   │   ├── auth-flow.test.ts
│   │   ├── token-refresh.test.ts
│   │   └── profile.test.ts
│   └── e2e/
│       ├── auth.spec.ts
│       ├── protected-routes.spec.ts
│       └── profile.spec.ts
├── .env.local                       # Environment variables (local dev)
├── next.config.mjs                  # Next.js config (existing)
├── tsconfig.json                    # TypeScript config (existing)
├── package.json                     # Dependencies (existing)
└── README.md                        # Frontend setup (existing)
```

**Structure Decision**: Web frontend using Next.js App Router with route groups for auth (`(auth)`) and protected routes (`(dashboard)`). Follows separation of concerns with dedicated directories for API client, hooks, validators, utilities, and types. All auth logic centralized in Context API + hooks for reusability.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
