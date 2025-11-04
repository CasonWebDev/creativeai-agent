# Phase 0: Research & Technical Decisions

**Feature**: Frontend Next.js + Backend Laravel JWT Authentication Integration  
**Date**: 4 de novembro de 2025  
**Status**: Complete

---

## Research Tasks Completed

### 1. JWT Token Management Strategy for SPAs

**Task**: How to securely manage JWT tokens (access + refresh) in a Next.js SPA?

**Decision**: 
- **Access Token**: Store in memory (React state via Context API) - highest security
- **Refresh Token**: Store in sessionStorage (cleared on browser close) - balance of security and convenience
- **Rate Limiting State**: Store in localStorage (persists across reloads for security)

**Rationale**:
- Memory-only access token prevents XSS attacks via localStorage theft
- sessionStorage refresh token is cleared when browser closes, reducing exposure window
- localStorage for rate limiting is low-sensitivity data and needs to persist across reloads
- This prevents token bypass attacks while maintaining UX

**Alternatives Considered**:
- ❌ Both tokens in localStorage: Less secure, vulnerable to XSS attacks on access token
- ❌ Both tokens in memory: Access token lost on page reload, requires rehydration every time
- ❌ Tokens in secure HttpOnly cookies: Not applicable in Next.js frontend (only works with same-origin backend)

**Implementation**: See `lib/context/AuthContext.tsx` and `lib/utils/storage.ts`

---

### 2. Automatic Token Refresh Strategy

**Task**: How to implement transparent JWT token refresh without interrupting user experience?

**Decision**: 
- Use Axios response interceptor to detect 401 responses
- On 401: Check if refresh token exists and hasn't been used recently
- Call refresh endpoint (`POST /auth/refresh` with refresh token)
- If successful: Update access token in memory, retry original request
- If failed: Clear all tokens, redirect to login page
- Queue concurrent requests during refresh to prevent duplicate refresh calls

**Rationale**:
- Response interceptor allows transparent handling before user code executes
- Single refresh prevents race conditions when multiple requests fail simultaneously
- Request queuing ensures all requests use the new token
- Zero user-visible delay improves perceived performance

**Alternatives Considered**:
- ❌ Proactive refresh (refresh before expiration): Adds complexity, requires timer management
- ❌ Silent refresh on component mount: Only works if user is on a page, doesn't help if they have multiple tabs
- ❌ Manual logout on 401: Poor UX, frustrates users, doesn't align with modern SPA patterns

**Implementation**: See `lib/api/interceptors.ts`

---

### 3. Session Persistence Across Browser Reloads

**Task**: How to restore user session after browser refresh without forcing re-authentication?

**Decision**:
- On app initialization (in root `layout.tsx`): Call `GET /auth/me` endpoint
- Use refresh token from sessionStorage to authenticate the request
- If successful: Load user data, set access token in state, user remains logged in
- If failed (refresh token expired/invalid): Clear tokens, redirect to login
- Implement loading state during initialization to prevent flash of login page

**Rationale**:
- Refresh token survives page reload (in sessionStorage)
- Backend validates refresh token and returns user data + new access token
- User doesn't see interruption or forced re-login
- Follows industry standard for SPA authentication patterns

**Alternatives Considered**:
- ❌ Store access token in localStorage: Security risk, XSS vulnerability
- ❌ Don't restore session: Poor UX, forces re-login on every page reload
- ❌ Use browser cache for tokens: Unreliable, can be cleared by user or browser

**Implementation**: See `lib/hooks/useAuth.ts` and `app/layout.tsx`

---

### 4. Email Verification Flow

**Task**: How to handle email verification for new registrations?

**Decision**:
- After registration: Redirect user to `/verify-email` page (show email address)
- User clicks link in email with unique token: `https://app.com/verify-email?token=xyz`
- Frontend calls `GET /auth/verify-email/{token}` endpoint
- If successful: Auto-login user (get tokens from response), redirect to dashboard
- If failed: Show error, allow resend of verification email
- Unverified users cannot log in (backend returns error, frontend redirects to verify page)

**Rationale**:
- Email verification is essential for data quality and security
- Unique tokens prevent brute-force token guessing
- Frontend handles token from URL to improve UX
- Auto-login after verification removes friction (user shouldn't need to log in twice)

**Alternatives Considered**:
- ❌ Require manual login after verification: Extra step, poor UX
- ❌ Send verification code instead of link: Less user-friendly, requires copy/paste
- ❌ Auto-verify without email: Defeats purpose, allows spam registrations

**Implementation**: See `components/auth/email-verification.tsx` and verify endpoint integration

---

### 5. Password Reset Flow

**Task**: How to implement secure password reset?

**Decision**:
- User enters email on `/forgot-password` page
- Backend sends reset link with unique token valid for 1 hour
- User clicks link: `https://app.com/reset-password?token=xyz`
- User enters new password (validated with Zod schema)
- Frontend calls `PUT /auth/reset-password` with token + new password
- If successful: Backend logs user in automatically, returns tokens
- Frontend stores tokens and redirects to dashboard

**Rationale**:
- Unique token with expiration prevents unauthorized password resets
- 1-hour validity balances security and UX (enough time to receive email, not too long)
- Auto-login after reset removes need for extra login step
- Zod validation ensures password meets requirements before sending

**Alternatives Considered**:
- ❌ Manual re-login after password reset: Extra step, poor UX
- ❌ Token valid forever: Security risk
- ❌ No token validation: Anyone could reset anyone's password

**Implementation**: See `components/auth/password-reset-form.tsx` and reset endpoint integration

---

### 6. Rate Limiting Implementation

**Task**: How to implement client-side rate limiting for login attempts?

**Decision**:
- Track login attempts in localStorage under key `auth_attempt_tracker`
- Store: `{ count: number, resetTime: timestamp }`
- On login button click: Check if count >= 3 within last 60 seconds
- If limit exceeded: Disable button, show error "Too many attempts. Try again in X seconds"
- After 60 seconds: Reset counter automatically
- Backup: Backend also implements rate limiting for security

**Rationale**:
- localStorage persistence prevents bypass via page reload or new tab
- Client-side limit improves UX (immediate feedback)
- Backend rate limiting provides security against direct API attacks
- Counter resets automatically after 60 seconds (no permanent blocks)

**Alternatives Considered**:
- ❌ Memory-only tracking: User can bypass by refreshing page
- ❌ No client-side limit: Poor UX, relies entirely on backend (slower feedback)
- ❌ Permanent IP-based blocks: Can't implement on frontend, user frustration risk

**Implementation**: See `lib/hooks/useRateLimit.ts` and `lib/utils/rate-limit.ts`

---

### 7. Form Validation Strategy

**Task**: How to validate forms with real-time feedback?

**Decision**:
- Use Zod schemas for all authentication forms (login, register, password reset, profile)
- Define schema once in `lib/validators/auth.schemas.ts`
- Use `react-hook-form` library with Zod integration (if available) or custom validation
- Show inline error messages as user types (debounced to avoid excessive updates)
- Validate on blur and on change (blur for initial feedback, change for continuous feedback)
- Display field-level errors under each input

**Rationale**:
- Zod provides type-safe validation with excellent error messages
- Real-time feedback helps users fix errors immediately
- Consistent validation logic across all forms
- Reusable schemas reduce duplication

**Alternatives Considered**:
- ❌ No client-side validation: Poor UX, wastes backend resources
- ❌ Validation only on submit: Users need to wait for server response to see errors
- ❌ Manual validation: Error-prone, hard to maintain

**Implementation**: See `lib/validators/auth.schemas.ts` and form components

---

### 8. Protected Routes Implementation

**Task**: How to prevent unauthorized access to protected routes?

**Decision**:
- Use Next.js route groups: `(dashboard)` for protected routes, `(auth)` for public auth routes
- Create middleware or layout check that verifies user is authenticated
- If not authenticated: Redirect to login page
- If authenticating (checking session): Show loading state (skeleton/spinner)
- Protected layout wraps all dashboard routes: `app/(dashboard)/layout.tsx`

**Rationale**:
- Route groups organize code clearly
- Layout-level protection prevents any route from being accessed
- Loading state during session restoration prevents flash of login page
- Redirect happens before page renders (no flicker)

**Alternatives Considered**:
- ❌ Protect each route individually: Repetitive, error-prone
- ❌ Use getServerSideProps on every page: Unnecessary for client-side auth, prevents static generation
- ❌ No protection on frontend: Relies entirely on backend (shows login page briefly)

**Implementation**: See `app/(dashboard)/layout.tsx` and `lib/hooks/useProtectedRoute.ts`

---

### 9. API Error Handling

**Task**: How to handle API errors consistently?

**Decision**:
- Create `lib/api/error-handler.ts` with centralized error handling
- HTTP 401: Token expired/invalid → trigger refresh or logout
- HTTP 403: Unauthorized access → show error toast, redirect to dashboard
- HTTP 422: Validation errors → display field-specific errors on form
- HTTP 5xx: Server errors → show generic error toast, log to console
- HTTP network errors: Show "Network error" toast, allow retry
- All errors show user-friendly messages (never expose technical details)

**Rationale**:
- Centralized handling prevents duplicated error logic
- User-friendly messages improve UX
- Proper categorization of errors allows appropriate recovery
- Logging aids debugging

**Alternatives Considered**:
- ❌ No error handling: Breaks user experience, confuses users
- ❌ Show raw API errors: Exposes technical details, unprofessional
- ❌ Throw errors and handle per-component: Duplicated logic, inconsistent

**Implementation**: See `lib/api/error-handler.ts` and integrated into `lib/api/interceptors.ts`

---

### 10. Responsive Design & Mobile Optimization

**Task**: How to ensure responsive auth UI across devices?

**Decision**:
- Use Tailwind CSS with mobile-first approach (design for mobile first, enhance for larger screens)
- Use Shadcn/ui components (already responsive out of the box)
- Minimum touch target size: 44x44px (Shadcn buttons meet this)
- Test on: iPhone 12+ (375px), iPad (768px), Desktop (1920px)
- Use Tailwind breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Forms stack vertically on mobile, horizontal layout on desktop
- No horizontal scroll on mobile

**Rationale**:
- Mobile-first approach ensures good mobile experience first
- Tailwind provides responsive utilities out of the box
- Shadcn/ui components are battle-tested for accessibility
- Touch-friendly buttons prevent misclicks
- Testing on standard breakpoints catches most responsive issues

**Alternatives Considered**:
- ❌ Desktop-first approach: Requires workarounds for mobile
- ❌ Custom CSS: More work, higher maintenance burden
- ❌ No responsive testing: Broken experience on mobile

**Implementation**: See components in `components/auth/` and `components/profile/` (follow Shadcn patterns)

---

### 11. Component Architecture & Reusability

**Task**: How to structure components for maximum reusability and maintainability?

**Decision**:
- Separate concerns: Auth forms, profile forms, lists, dialogs into individual components
- Use composition: Build larger components from smaller reusable ones
- Custom hooks for logic: `useAuth`, `useUser`, `useRateLimit` - separate UI from logic
- Props drilling minimized via Context API for auth state
- Use compound component pattern for complex interactions (e.g., form with multiple fields)

**Rationale**:
- Separation makes components testable in isolation
- Reusable components reduce duplication
- Custom hooks decouple logic from presentation
- Easier to maintain and extend

**Alternatives Considered**:
- ❌ Monolithic components: Hard to test, hard to reuse, hard to maintain
- ❌ Excessive prop drilling: Components become interdependent
- ❌ Global state for everything: Overcomplicates Context API usage

**Implementation**: See `components/auth/`, `components/profile/`, and `lib/hooks/`

---

### 12. Testing Strategy

**Task**: What testing approach ensures 80%+ code coverage?

**Decision**:
- **Unit Tests** (50% of effort):
  - Test hooks: `useAuth`, `useUser`, `useRateLimit` with mock API responses
  - Test validators: Zod schemas with valid/invalid inputs
  - Test utils: Token management, storage operations, rate limiting logic
  - Use Jest + Mock Service Worker (MSW) for API mocking

- **Integration Tests** (30% of effort):
  - Test auth flows end-to-end: Registration → verification → login → dashboard access
  - Test token refresh: Expired token triggers refresh, request retried
  - Test protected routes: Unauthenticated access redirects to login
  - Use React Testing Library for component + hook interactions

- **E2E Tests** (20% of effort):
  - Real browser automation: Cypress or Playwright
  - Full user journeys: Registration, login, password reset, profile editing
  - Cross-browser testing: Chrome, Firefox, Safari
  - Run on CI/CD on every push

**Rationale**:
- Unit tests catch logic errors early
- Integration tests verify components work together
- E2E tests simulate real user behavior
- 80% coverage is achievable with this mix

**Alternatives Considered**:
- ❌ Only E2E tests: Slow feedback loop, expensive to run
- ❌ Only unit tests: Misses integration issues
- ❌ No testing: Regression risk, manual testing overhead

**Implementation**: See `tests/` directory structure in plan.md

---

## Dependencies & Best Practices Selected

### HTTP Client
- **Selected**: Axios (not Fetch API)
- **Rationale**: Better interceptor support, automatic JSON serialization, simpler error handling
- **Configuration**: `lib/api/client.ts` with request/response interceptors

### State Management
- **Selected**: React Context API (not Redux)
- **Rationale**: Sufficient for auth state, simpler than Redux, built into React
- **Configuration**: `lib/context/AuthContext.tsx` with custom hook `useAuth.ts`

### Form Validation
- **Selected**: Zod (not Yup or Joi)
- **Rationale**: TypeScript-first, excellent error messages, composable schemas
- **Configuration**: `lib/validators/auth.schemas.ts` with Zod schemas

### Styling
- **Selected**: Tailwind CSS + Shadcn/ui (not styled-components)
- **Rationale**: Utility-first approach, pre-built components, consistent design
- **Configuration**: Tailwind config in `tailwind.config.js` (existing)

### Routing
- **Selected**: Next.js App Router with route groups (not Pages Router)
- **Rationale**: Modern Next.js pattern, better code organization via route groups
- **Configuration**: `app/(auth)` and `app/(dashboard)` route groups

---

## Security Considerations

### Token Security
- ✅ Access token in memory only (prevents XSS via localStorage)
- ✅ Refresh token in sessionStorage (cleared on browser close)
- ✅ No sensitive data in JWT (backend handles JWT claims)
- ✅ Token expiration enforced (15min access, 7d refresh)

### Input Security
- ✅ Zod validation on all forms (client-side)
- ✅ Backend validation on all endpoints (server-side)
- ✅ Input sanitization before displaying (prevent XSS)
- ✅ No eval() or dangerouslySetInnerHTML usage

### API Security
- ✅ HTTPS required (backend enforces)
- ✅ CORS configured (backend allows frontend origin)
- ✅ No sensitive headers in localStorage
- ✅ Rate limiting on login (localStorage + backend)

### Password Security
- ✅ Minimum 8 characters with complexity rules (Zod validation)
- ✅ Never send/store plain passwords (backend hashes)
- ✅ Password reset tokens expire (1 hour)
- ✅ Verify current password before change (backend check)

---

## Performance Optimizations

### Initial Load
- ✅ Code splitting: Auth pages separate from dashboard
- ✅ Lazy loading: Components loaded on demand
- ✅ Image optimization: Avatar thumbnails, lazy-loaded

### Token Refresh
- ✅ Transparent refresh: No user-visible delay
- ✅ Request queuing: Prevents duplicate refresh calls
- ✅ Single retry: Max 1 retry per request (fail fast)

### Form Validation
- ✅ Debounced validation: <100ms feedback on change
- ✅ Client-side validation: Immediate feedback before API call
- ✅ Async validation: Check email uniqueness only on blur

### API Calls
- ✅ Rate limiting: Prevents brute-force attacks
- ✅ Caching: Session cache to prevent repeated `GET /auth/me` calls
- ✅ Minimal payload: Only necessary data in responses

---

## Compliance & Standards

- ✅ **GDPR**: Soft delete with 30-day grace period, data export capability planned
- ✅ **Accessibility (WCAG 2.1 AA)**: Shadcn/ui components are accessible, skip link implemented
- ✅ **TypeScript**: Strict mode for type safety
- ✅ **OpenAPI 3.0**: Backend API documented (Feature 001 requirement)
- ✅ **REST API**: Follows RESTful conventions

---

## Summary

All research tasks completed. Key decisions:
1. ✅ Memory-only access tokens for security
2. ✅ Automatic transparent token refresh
3. ✅ Session restoration via refresh token
4. ✅ Email verification with unique tokens
5. ✅ Secure password reset flow
6. ✅ localStorage-based rate limiting
7. ✅ Zod validation with real-time feedback
8. ✅ Protected routes via Next.js route groups
9. ✅ Centralized error handling
10. ✅ Mobile-first responsive design
11. ✅ Component composition architecture
12. ✅ Comprehensive testing strategy (80%+ coverage)

**Ready for Phase 1: Design & Contracts** ✅
