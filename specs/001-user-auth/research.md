# Research Document: User Authentication System

**Feature**: 001-user-auth  
**Date**: 2025-11-04  
**Purpose**: Document design decisions, best practices, and technology selections

---

## JWT Token Implementation & Best Practices

**Decision**: Use Laravel Sanctum with custom RS256 JWT configuration

**Rationale**:
- Laravel Sanctum is simpler than Passport (no OAuth2 overhead for API-only backend)
- Supports both API tokens and SPA authentication patterns
- Built-in CSRF protection for web endpoints
- Lightweight, fewer dependencies, easier to maintain
- Can customize JWT signing to use RS256 (asymmetric)

**Alternatives Considered**:
- **Laravel Passport**: Full OAuth2 server, overkill for internal API auth, more complex
- **JWT.io libraries**: Less integrated with Laravel, more manual configuration
- **Session-based auth**: Not suitable for mobile clients, requires state on server

**Best Practices Implemented**:
- RS256 signing (asymmetric): public key distributed, private key secure on server
- Access token TTL: 15 minutes (short-lived, limits exposure)
- Refresh token TTL: 30 days (standard SaaS pattern)
- Refresh token rotation: new token issued on each refresh (revokes old token)
- Token storage: HTTP-only cookies (frontend) + Bearer headers (mobile)
- Token expiration: Checked on every request via middleware

**Resources Reviewed**:
- JWT.io best practices: https://tools.ietf.org/html/rfc8725
- OWASP JWT guide: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html

---

## Password Hashing: bcrypt vs Argon2

**Decision**: bcrypt with cost factor 12

**Rationale**:
- Constitution explicitly specifies bcrypt
- Cost factor 12 = 60-100ms hash time (acceptable security vs performance trade-off)
- bcrypt is GPU-resistant (designed to be slow)
- Widely supported across frameworks
- Lower false sense of security than Argon2 (proven battle-tested)

**Alternatives Considered**:
- **Argon2**: Memory-hard, faster than bcrypt, but more complex
- **PBKDF2**: Industry standard, but simpler (weaker) than bcrypt
- **Scrypt**: Good alternative, less widely supported

**Implementation Details**:
- Laravel's Hash::make() uses bcrypt by default
- Cost factor 12 in config/hashing.php
- Use Hash::check() for verification (never compare hashes directly)
- Hash generation: ~80ms on modern hardware, acceptable for login

---

## Session Management: Database vs Redis vs File-based

**Decision**: PostgreSQL for primary session storage + Redis for caching/rate limiting

**Rationale**:
- **PostgreSQL**: Durable, survives restarts, queryable for audit trails, transaction support
- **Redis**: Ultra-fast (<10ms), ideal for rate limiting atomic operations, cache layer
- **Hybrid approach**: Best of both worlds - durability + performance

**Alternatives Considered**:
- **Database only**: Slower (50-100ms per query), but fully durable
- **Redis only**: Fast, but loses data on restart (unacceptable for audit logs)
- **File-based**: Legacy approach, poor scalability, not suitable for distributed systems
- **Memcached**: Like Redis but no persistence options

**Implementation**:
- Laravel sessions driver: `database` for Users + Sessions table
- Redis used for: Cache store (5-minute TTL for user data), Rate limiting (counters), Queue system
- Session lifecycle: Write to DB immediately, cache invalidated on logout
- Cleanup: Scheduled job runs nightly to delete expired sessions (>30 days old)

---

## Email Delivery: Local Development vs Production

**Decision**: Mailhog (local) + SendGrid/SES (production)

**Rationale**:
- **Mailhog**: Free, local SMTP server, visible inbox, no external dependencies in dev
- **SendGrid**: Production-grade, reliable delivery, templates support, bounce handling
- **SES**: AWS-integrated alternative, slightly cheaper at scale

**Alternatives Considered**:
- **Real email in dev**: Pollutes real inboxes, requires test account maintenance
- **Fake/stubbed emails**: No visibility, hard to debug template issues
- **File-based mails**: Requires file system access, not portable

**Implementation**:
- docker-compose includes Mailhog service (port 1025 for SMTP, web UI on 8025)
- .env config: MAIL_DRIVER=log (local) vs MAIL_DRIVER=sendgrid (production)
- Laravel queued jobs: SendConfirmationEmailJob, SendPasswordResetEmailJob
- Queue worker processes jobs asynchronously (Redis backend)

**Email Templates**:
- Confirmation email: 1-hour activation link with timeout handling
- Password reset: 1-hour reset link, clear instructions
- Tier upgrade notification: When user upgrades plans
- Usage warning: At 80% and 100% of monthly limits

---

## Rate Limiting Strategy: HTTP vs Account-Level

**Decision**: Dual-layer approach
1. HTTP-level throttle (Laravel's rate limiter)
2. Account-level lockout (custom Redis counters)

**Rationale**:
- **HTTP throttle**: Prevents brute force per IP (60 req/min default)
- **Account lockout**: Prevents targeted attacks on single account (5 failures = 15 min lockout)
- Separate mechanisms address different threat vectors

**Alternatives Considered**:
- **HTTP throttle only**: Doesn't protect against distributed attacks targeting one account
- **Database counters**: Slower than Redis, not suitable for high-throughput rate limiting
- **Third-party service**: Added cost and complexity

**Implementation**:
- Laravel middleware: Throttle (sets HTTP headers, returns 429 if exceeded)
- Custom RateLimitService: Tracks login attempts per user_id in Redis
- Failed attempt counter: Incremented on wrong password, reset on successful login
- Lockout mechanism: Account locked after 5 failures, automatic unlock after 15 min

**Security Considerations**:
- Don't reveal if account exists (prevent user enumeration)
- Show same error message for wrong email/password
- Log all lockout events for audit trail
- Allow admin password reset to bypass lockout

---

## API Token Scopes: Granular vs Simple

**Decision**: Predefined simplified scopes (6-8 total)

**Rationale**:
- Full OAuth2 scopes too complex for current needs
- Simple scopes cover 90% of use cases
- Easier to audit and understand
- Future extensibility with custom scope support

**Predefined Scopes**:
- `read:profile` - Read user profile data
- `write:profile` - Update profile (name, photo)
- `write:password` - Change password
- `read:usage` - View usage and plan info
- `generate:images` - Create image generation requests
- `generate:videos` - Create video generation requests
- `read:results` - Access generation results
- `admin:*` - Enterprise admin operations (future)

**Alternatives Considered**:
- **Full granular scopes**: Each API action as separate scope → too many to manage
- **All-or-nothing tokens**: No permission isolation, security risk
- **Role-based tokens**: Duplicates user role system, unnecessary complexity

**Validation**:
- Token middleware validates scope before executing action
- Return 403 Forbidden if token lacks required scope
- Audit log includes scopes used in each request

---

## Database Design: Soft Deletes & Retention

**Decision**: Soft deletes for accounts + hard delete after 30-day grace period

**Rationale**:
- GDPR compliance: Users can request deletion but have recovery window
- Operational safety: Accidental deletes recoverable
- Audit trail: Historical data preserved for legal/compliance
- Support recovery: Can help users who delete by mistake

**Alternatives Considered**:
- **Hard delete immediately**: Compliant but no recovery, risky UX
- **No soft delete, hard delete after 1 year**: Users waiting too long for deletion
- **Archive to cold storage**: Complex, still need to implement something
- **Anonymization**: Still not true deletion, limited benefit

**Implementation**:
- Add `deleted_at` timestamp to users table (nullable)
- Scope queries to exclude soft-deleted users by default
- Scheduled job: Runs daily, permanently deletes accounts soft-deleted >30 days ago
- Audit log: Records deletion requests with timestamp for compliance

**Grace Period Mechanics**:
- Day 1: User requests deletion → deleted_at timestamp set, account appears deleted to user
- Days 1-30: User can restore account → soft_delete reversed, deleted_at cleared
- Day 31+: Scheduled job runs → HARD DELETE (permanent, unrecoverable)

---

## Audit Logging: Structure & Retention

**Decision**: Structured JSON logging with 90-day retention

**Rationale**:
- Compliance: Track all authentication actions
- Security: Detect and investigate suspicious activity
- Debugging: Understand failure modes
- Performance: Query audit logs independently

**Log Events Captured**:
- User registration (email, timestamp, IP)
- Email confirmation (success/failure)
- Login (success/failure, IP, user agent, lockout status)
- Token refresh (automatic, manual, failure reasons)
- Password reset request (email sent timestamp)
- Password reset completion (success/failure)
- Profile updates (what changed, by whom)
- Session termination (manual or auto-logout)
- API token creation (scopes, IP)
- API token use (resource accessed, success/failure)
- Account deletion (grace period start, restoration if applicable)

**Log Entry Structure**:
```json
{
  "timestamp": "2025-11-04T10:30:45Z",
  "user_id": 12345,
  "action": "login_success",
  "ip_address": "203.0.113.42",
  "user_agent": "Mozilla/5.0...",
  "metadata": {
    "tier": "pro",
    "device_memory": "90 days",
    "lockout_count": 0
  },
  "status": "success"
}
```

**Retention Policy**:
- 90 days: Active monitoring, compliance requirements
- >90 days: Archive to cold storage (S3 Glacier) for legal holds if needed
- Scheduled job: Purge logs older than 90 days

**Implementation**:
- Database table: `audit_logs` with indexed user_id and created_at
- Async logging: Events dispatched as queue jobs to avoid request blocking
- Query interface: Artisan command to search audit logs by user/date range
- Dashboard: Admin view showing recent auth activity per user

---

## Testing Strategy: Unit vs Integration vs E2E

**Decision**: Combination of unit tests (services), integration tests (features), and targeted E2E

**Rationale**:
- **Unit tests**: Fast, isolated, covers business logic in services
- **Integration tests**: Full HTTP stack, database, realistic scenarios
- **E2E tests**: Frontend → backend → database, critical user flows only

**Coverage Goals**:
- Services: 90%+ coverage (PasswordService, TokenService, RateLimitService)
- Controllers: 80%+ coverage (happy path + error cases)
- Overall: 80%+ minimum per constitution requirement

**Test Scenarios**:

**Unit Tests**:
- PasswordService: Hash generation, verification, weak password rejection
- TokenService: JWT generation, signature validation, expiration
- RateLimitService: Counters, lockout mechanics, reset logic
- PlanService: Tier enforcement, usage calculation, limit checks

**Integration Tests**:
- AuthFlowTest: Register → confirm email → login → refresh → logout cycle
- PasswordResetTest: Request reset → receive email → click link → reset → login with new password
- SessionManagementTest: Login on 2 devices → list sessions → terminate one → verify other still works
- RateLimitTest: 5 failed logins → lockout → wait 15 min → successful login
- PlanEnforcementTest: Free tier → reach limit → rejected request → upgrade → success
- ProfileUpdateTest: Change name → update photo → verify across sessions

**Load Tests**:
- 1000 concurrent logins
- Token validation at 100% throughput (no queuing)
- Rate limit accuracy under high load

---

## Security Considerations & Threat Model

**Identified Threats & Mitigations**:

1. **Brute Force Attacks**
   - Mitigation: Account lockout (5 attempts), IP rate limiting (60 req/min)
   - Audit: Log all failed attempts

2. **Token Theft**
   - Mitigation: Short TTL (15 min), refresh token rotation, HTTPS only
   - Recovery: Session termination revokes tokens immediately

3. **SQL Injection**
   - Mitigation: Parameterized queries via Eloquent ORM, Laravel Form Requests
   - Validation: All inputs validated against whitelist patterns

4. **CSRF Attacks**
   - Mitigation: CSRF tokens in cookies (Laravel default), SameSite policy
   - API: Bearer token auth (stateless, not vulnerable to CSRF)

5. **Email Enumeration**
   - Mitigation: Don't reveal if email exists, return same message for all password reset requests
   - Rate limit: 3 password reset requests per email per hour

6. **Account Takeover via Email**
   - Mitigation: Session termination on password reset, new device requires email confirmation
   - Notification: Email sent when new IP logs in (future feature)

7. **Privilege Escalation**
   - Mitigation: Tiers enforced at service layer, not just UI
   - Validation: Every action checks user tier before execution

**HTTPS & Transport Security**:
- HTTPS mandatory in production (enforced at load balancer)
- HTTP/2 for performance
- TLS 1.2+ only
- HSTS header: Preload list included
- Certificate pinning: Frontend implementation (future)

---

## Performance Optimization Strategy

**Target Metrics**:
- Login: <200ms p95
- Token refresh: <100ms p99
- Token validation: <10ms
- Concurrent users: 1000 without degradation

**Optimization Techniques**:

1. **Database Optimization**:
   - Indexes on email (unique), user_id, created_at, expires_at
   - Query optimization: Use select() to limit columns
   - Connection pooling: PgBouncer in production

2. **Caching Strategy**:
   - User data: 15-minute TTL in Redis (invalidated on profile change)
   - Plan info: 1-hour TTL (tier changes infrequent)
   - Rate limit counters: Ephemeral (expire naturally)
   - Session tokens: Not cached (DB queries fast)

3. **Async Operations**:
   - Email sending: Queued jobs (not blocking)
   - Audit logging: Async events
   - Cleanup jobs: Off-peak hours (3 AM)

4. **Code-Level**:
   - N+1 query prevention: Use Eloquent eager loading
   - Lazy collections for large datasets
   - Response compression: Gzip enabled
   - CDN: Static content (JS, CSS) served from CDN

5. **Infrastructure**:
   - Redis cluster for horizontal scaling
   - PostgreSQL read replicas for audit log queries
   - Load balancer with connection pooling
   - Application auto-scaling based on metrics

---

## Documentation & OpenAPI Specification

**OpenAPI 3.0 Coverage**:
- All 24 endpoints documented with request/response schemas
- Error responses: 400, 401, 403, 422, 429, 500 with descriptions
- Authentication: Bearer token scheme (JWT)
- Rate limiting: x-ratelimit-* headers documented

**Code Documentation**:
- PHPDoc on all public methods
- Example usage in controller method comments
- Inline comments for complex business logic
- README in /backend with setup instructions

**User Guides** (future):
- Integration guide for frontend developers
- API client library examples (cURL, JavaScript, Python)
- Common error handling patterns
- Webhook setup documentation

---

## Deployment & DevOps

**Docker Strategy**:
- Single-stage production Dockerfile (minimal, ~300MB)
- Multi-stage builder stage (build artifacts)
- Health check: GET /api/health returns 200 when ready
- Environment variables: All configs externalized
- No hardcoded secrets

**Database Migrations**:
- Version-controlled in git
- Rollback tested for each migration
- Zero-downtime deployments: New schema compatible with old code (blue-green)
- Backup before major migrations

**CI/CD Pipeline** (future):
- GitHub Actions: Runs tests on every push
- Lint: PHP CodeSniffer (PSR-12), Laravel Pint
- Tests: PHPUnit + Feature tests (must pass)
- Security: OWASP dependency check, secret scanning
- Build: Docker image tagged with commit hash
- Deploy: Kubernetes rollout to staging/production

---

## Monitoring & Observability

**Key Metrics**:
- Authentication latency (P50, P95, P99)
- Failed login attempts (rate, lockout events)
- Token refresh rate (healthy = ~1-2x per user session)
- API token usage (per token, per tier)
- Email delivery success rate

**Alerting** (future):
- High failed login rate (>100 per minute across all users)
- Token validation errors >1%
- Database query latency spike
- Redis memory usage >80%
- Email delivery failures >5%

**Structured Logging**:
- JSON format for parsing
- Centralized logging (ELK stack or CloudWatch)
- Searchable by user_id, action, timestamp
- Retention: 90 days hot, archival to cold storage

---

## Future Enhancements (Out of Scope v1)

- **OAuth2 Integration**: Google, GitHub login
- **Two-Factor Authentication (MFA)**: TOTP, SMS
- **Passwordless Auth**: Magic links, WebAuthn
- **Enterprise SSO**: SAML, OpenID Connect
- **Risk Assessment**: Geo-location, device fingerprinting
- **API Rate Limiting per Tier**: Different limits for Free/Pro/Enterprise
- **Advanced Audit**: Compliance dashboards, data retention policies
- **Webhook System**: Notify external systems of auth events
- **Custom Branding**: Email templates per tenant (future SaaS feature)

---

## Summary & Next Steps

**Decisions Documented**: ✅ 8 key decisions with alternatives considered
**Best Practices Identified**: ✅ JWT, password hashing, session mgmt, rate limiting
**Technology Stack Validated**: ✅ Laravel, PostgreSQL, Redis, Sanctum, bcrypt
**Security Review Complete**: ✅ Threat model addressed
**Performance Plan Ready**: ✅ Target metrics and optimization strategies

**Next Phase**: Generate data model diagrams and OpenAPI contract specifications.
