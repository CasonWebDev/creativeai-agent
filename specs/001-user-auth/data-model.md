# Data Model & Database Schema

**Feature**: 001-user-auth  
**Date**: 2025-11-04  
**Purpose**: Define database entities, relationships, and validation rules

---

## Entity Relationship Diagram

```
User (1) ──┬─→ (many) Session
           ├─→ (many) PasswordReset
           ├─→ (many) EmailConfirmation
           ├─→ (many) UsageMetric
           ├─→ (many) ApiToken
           └─→ (many) AuditLog
```

---

## Entities & Fields

### 1. User

**Table**: `users`

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| id | BIGINT | PK, Auto-increment | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL, indexed | Login email, must be unique |
| name | VARCHAR(255) | NOT NULL | User's full name |
| password | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| tier | ENUM('free','pro','enterprise') | DEFAULT 'free' | Plan tier for rate limiting |
| email_confirmed_at | TIMESTAMP | nullable | NULL until email confirmed |
| last_login_at | TIMESTAMP | nullable | Track login activity |
| profile_photo_url | VARCHAR(500) | nullable | S3 URL to profile photo |
| deleted_at | TIMESTAMP | nullable, indexed | Soft delete timestamp |
| created_at | TIMESTAMP | NOT NULL, indexed | Account creation date |
| updated_at | TIMESTAMP | NOT NULL | Last profile update |

**Indexes**:
- `UNIQUE(email)` - Email lookup during login/registration
- `(id, deleted_at)` - Active user queries
- `(created_at DESC)` - User listing by creation date

**Validation Rules**:
- email: Valid email format, unique, max 255 chars
- name: Non-empty, max 255 chars
- password: Min 8 chars, must contain uppercase, lowercase, number
- tier: One of {free, pro, enterprise}

**State Transitions**:
- New account: email_confirmed_at = NULL, last_login_at = NULL
- After email confirmed: email_confirmed_at = now()
- After login: last_login_at = now()
- After soft delete: deleted_at = now(), queries exclude user
- After 30-day grace period: HARD DELETE (permanent)

**Relationships**:
- Many-to-One: Plan/Tier (reference lookup only)
- One-to-Many: Sessions, PasswordResets, EmailConfirmations, UsageMetrics, ApiTokens, AuditLogs

---

### 2. Session

**Table**: `sessions`

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| id | BIGINT | PK, Auto-increment | Unique session identifier |
| user_id | BIGINT | FK(users), NOT NULL, indexed | Session owner |
| refresh_token | VARCHAR(500) | NOT NULL | JWT refresh token (hash stored) |
| device_type | VARCHAR(50) | NOT NULL | 'browser', 'mobile', 'desktop' |
| browser_name | VARCHAR(100) | nullable | e.g., 'Chrome', 'Safari' |
| os_name | VARCHAR(100) | nullable | e.g., 'macOS', 'iOS', 'Windows' |
| ip_address | VARCHAR(45) | NOT NULL, indexed | IPv4 or IPv6 address |
| user_agent | TEXT | NOT NULL | Full user agent string |
| device_remember | BOOLEAN | DEFAULT false | 90-day refresh if true |
| last_accessed_at | TIMESTAMP | NOT NULL, indexed | Last request timestamp |
| expires_at | TIMESTAMP | NOT NULL, indexed | Token expiration (30/90 days) |
| created_at | TIMESTAMP | NOT NULL | Session creation |

**Indexes**:
- `(user_id, expires_at DESC)` - Active sessions per user
- `(user_id, created_at DESC)` - User's session history
- `(ip_address, created_at)` - Sessions from IP (abuse detection)

**Validation Rules**:
- user_id: Foreign key to existing user, not null
- device_type: One of {browser, mobile, desktop}
- ip_address: Valid IPv4 or IPv6 format
- expires_at: > now() for active sessions

**State Transitions**:
- Created: After successful login, expires_at = now() + 30/90 days
- Active: last_accessed_at updated on each API request
- Terminated: Soft delete (set expires_at = now()) when user logs out or terminates session
- Expired: Cleanup job deletes records with expires_at < now() - 7 days

**Relationships**:
- Many-to-One: User (FK)
- One-to-Many: AuditLog (via user_id)

---

### 3. PasswordReset

**Table**: `password_resets`

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| id | BIGINT | PK, Auto-increment | Unique reset identifier |
| user_id | BIGINT | FK(users), indexed | User requesting reset |
| email | VARCHAR(255) | NOT NULL | Email used in request |
| token_hash | VARCHAR(255) | NOT NULL, indexed | Secure token hash (not plaintext) |
| expires_at | TIMESTAMP | NOT NULL, indexed | 1 hour from request |
| used_at | TIMESTAMP | nullable | NULL until reset completed |
| used_ip_address | VARCHAR(45) | nullable | IP where reset was completed |
| created_at | TIMESTAMP | NOT NULL | Request timestamp |

**Indexes**:
- `(user_id, created_at DESC)` - User's reset history
- `(token_hash)` - Lookup by token
- `(expires_at)` - Cleanup expired requests

**Validation Rules**:
- user_id: Valid user or accept email (supports user enumeration prevention)
- token_hash: 64-char SHA256 hex string
- expires_at: now() + 1 hour
- used_at: Can only be set once

**State Transitions**:
- Created: New reset request, used_at = NULL
- Completed: User clicks link, submits new password, used_at = now()
- Expired: Cleanup job deletes records with expires_at < now() and used_at IS NULL
- Invalidated: Any new reset request for same user invalidates previous (new token generated)

**Relationships**:
- Many-to-One: User (FK)

---

### 4. EmailConfirmation

**Table**: `email_confirmations`

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| id | BIGINT | PK, Auto-increment | Unique confirmation identifier |
| user_id | BIGINT | FK(users), indexed | User registering |
| email | VARCHAR(255) | NOT NULL | Email being confirmed |
| token_hash | VARCHAR(255) | NOT NULL, indexed | Secure token hash |
| expires_at | TIMESTAMP | NOT NULL, indexed | 1 hour from registration |
| confirmed_at | TIMESTAMP | nullable | NULL until email confirmed |
| created_at | TIMESTAMP | NOT NULL | Request timestamp |

**Indexes**:
- `(user_id)` - User's confirmation record
- `(token_hash)` - Lookup by token
- `(expires_at)` - Cleanup expired confirmations

**Validation Rules**:
- user_id: Valid, unconfirmed user
- token_hash: 64-char SHA256 hex string
- expires_at: now() + 1 hour

**State Transitions**:
- Created: After registration, confirmed_at = NULL
- Confirmed: User clicks link, confirmed_at = now(), User.email_confirmed_at = now()
- Expired: After 1 hour, can request new confirmation email
- Cleanup: Scheduled job deletes confirmed records >7 days old

**Relationships**:
- Many-to-One: User (FK)

---

### 5. UsageMetric

**Table**: `usage_metrics`

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| id | BIGINT | PK, Auto-increment | Unique metric identifier |
| user_id | BIGINT | FK(users), indexed | User being tracked |
| year_month | VARCHAR(7) | NOT NULL, e.g., '2025-11' | Year-month for metric |
| metric_type | ENUM | NOT NULL | 'images', 'videos', 'api_calls' |
| count | INT | DEFAULT 0 | Current month's usage |
| tier_limit | INT | NOT NULL | Max allowed this month |
| last_reset_at | TIMESTAMP | NOT NULL | Month start date |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last usage update |

**Composite Key**:
- UNIQUE(user_id, year_month, metric_type)

**Indexes**:
- `(user_id, year_month DESC)` - User's monthly usage
- `(year_month)` - Monthly reporting

**Validation Rules**:
- user_id: Valid user
- year_month: Format YYYY-MM, >= current month
- metric_type: One of {images, videos, api_calls}
- count: >= 0, <= tier_limit
- tier_limit: > 0, based on user's tier

**State Transitions**:
- Created: First usage of month, count = 0, tier_limit = tier-specific value
- Updated: Each action increments count
- Limit reached: count >= tier_limit, next action rejected
- Checked: Queries verify limit before allowing action
- Reset: Scheduled job runs on 1st of month, resets count = 0, updates tier_limit

**Tier Limits**:
- Free: 10 images/month, 5 videos/month, 100 API calls/month
- Pro: 200 images/month, 50 videos/month, 10k API calls/month
- Enterprise: Unlimited (tier_limit = 999999)

**Relationships**:
- Many-to-One: User (FK)

---

### 6. ApiToken

**Table**: `api_tokens`

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| id | BIGINT | PK, Auto-increment | Unique token identifier |
| user_id | BIGINT | FK(users), NOT NULL, indexed | Token owner |
| token_hash | VARCHAR(255) | NOT NULL, UNIQUE, indexed | Secure token hash |
| name | VARCHAR(255) | NOT NULL | User-friendly token name |
| scopes | JSON | NOT NULL | Array of scopes, e.g., ['read:profile', 'write:profile'] |
| created_at | TIMESTAMP | NOT NULL | Token creation date |
| last_used_at | TIMESTAMP | nullable, indexed | Last API call timestamp |
| revoked_at | TIMESTAMP | nullable, indexed | Revocation timestamp (if any) |
| expires_at | TIMESTAMP | nullable | Future: optional expiration |

**Indexes**:
- `(token_hash)` - Lookup on each API call
- `(user_id, revoked_at)` - User's active tokens
- `(user_id, created_at DESC)` - User's token history
- `(last_used_at)` - Usage analytics

**Validation Rules**:
- user_id: Pro or Enterprise tier only
- token_hash: Secure SHA256 hash (never store plaintext)
- name: Max 255 chars, non-empty
- scopes: Array of predefined scope strings
- revoked_at: NULL for active, set to now() for revoked

**State Transitions**:
- Created: new token, last_used_at = NULL, revoked_at = NULL
- Active: Can be used for API calls
- Used: last_used_at updated on successful authentication
- Revoked: revoked_at = now(), token becomes invalid
- Deleted: Can optionally hard-delete revoked tokens >90 days old

**Allowed Scopes**:
- `read:profile` - Get user profile
- `write:profile` - Update profile
- `read:usage` - View usage stats
- `generate:images` - Create image requests
- `generate:videos` - Create video requests
- `read:results` - Access generation results
- `admin:read` - Admin read operations

**Relationships**:
- Many-to-One: User (FK, tier-constrained)

---

### 7. AuditLog

**Table**: `audit_logs`

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| id | BIGINT | PK, Auto-increment | Unique log entry |
| user_id | BIGINT | nullable, indexed | User performing action (NULL for unauthenticated) |
| action | VARCHAR(100) | NOT NULL | Action type, e.g., 'login_success', 'register', etc. |
| ip_address | VARCHAR(45) | NOT NULL, indexed | Request source IP |
| user_agent | TEXT | NOT NULL | Browser/client identifier |
| success | BOOLEAN | NOT NULL | true/false outcome |
| metadata | JSON | nullable | Action-specific data (count, error_code, etc.) |
| created_at | TIMESTAMP | NOT NULL, indexed | Event timestamp |

**Indexes**:
- `(user_id, created_at DESC)` - User's action history
- `(action, created_at DESC)` - All instances of action type
- `(ip_address, created_at)` - Activities from IP
- `(created_at DESC)` - Recent activity feed

**Validation Rules**:
- user_id: NULL for unauthenticated, else valid user
- action: Predefined action type string
- ip_address: Valid IPv4 or IPv6
- success: Boolean
- created_at: now() when logged

**Immutable**: No updates after creation (APPEND-ONLY log)

**Allowed Actions**:
- `register` - New account registration
- `email_confirm_requested` - Confirmation email sent
- `email_confirmed` - Email confirmed
- `login_success` - Successful login
- `login_failure` - Failed login
- `login_failure_lockout` - Account locked after 5 failures
- `token_refresh_success` - Refresh token used
- `token_refresh_failure` - Invalid refresh token
- `logout` - User logged out
- `password_reset_requested` - Password reset email sent
- `password_reset_completed` - Password changed
- `profile_updated` - Profile information changed
- `profile_photo_uploaded` - Photo changed
- `session_terminated` - Session killed by user
- `api_token_created` - New API token generated
- `api_token_used` - API request authenticated
- `api_token_revoked` - API token deleted
- `account_deleted` - Account soft deleted
- `account_restored` - Soft deleted account restored
- `tier_changed` - Plan tier changed

**Retention**: 90 days (configurable), older records archived to cold storage

**Relationships**:
- Many-to-One: User (FK, nullable for unauthenticated events)

---

## Database Constraints & Rules

### Foreign Key Constraints

```sql
ALTER TABLE sessions ADD CONSTRAINT fk_sessions_user_id 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE password_resets ADD CONSTRAINT fk_password_resets_user_id 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE email_confirmations ADD CONSTRAINT fk_email_confirmations_user_id 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE usage_metrics ADD CONSTRAINT fk_usage_metrics_user_id 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE api_tokens ADD CONSTRAINT fk_api_tokens_user_id 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_user_id 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
```

### Unique Constraints

```sql
ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE(email);
ALTER TABLE api_tokens ADD CONSTRAINT uq_api_tokens_hash UNIQUE(token_hash);
ALTER TABLE usage_metrics ADD CONSTRAINT uq_usage_metrics_user_month_type 
  UNIQUE(user_id, year_month, metric_type);
```

### Check Constraints

```sql
ALTER TABLE users ADD CONSTRAINT ck_users_tier 
  CHECK(tier IN ('free', 'pro', 'enterprise'));

ALTER TABLE sessions ADD CONSTRAINT ck_sessions_device_type 
  CHECK(device_type IN ('browser', 'mobile', 'desktop'));

ALTER TABLE sessions ADD CONSTRAINT ck_sessions_expires_after_created 
  CHECK(expires_at > created_at);

ALTER TABLE usage_metrics ADD CONSTRAINT ck_usage_metrics_count 
  CHECK(count >= 0 AND count <= tier_limit);

ALTER TABLE api_tokens ADD CONSTRAINT ck_api_tokens_revoked_or_active 
  CHECK((revoked_at IS NULL) OR (revoked_at > created_at));
```

---

## Query Patterns & Performance

### Common Read Queries

**Get user by email (for login)**:
```sql
SELECT * FROM users WHERE email = ? AND deleted_at IS NULL;
-- Uses: UNIQUE(email) index
-- Expected: <5ms
```

**Get active sessions for user**:
```sql
SELECT * FROM sessions 
WHERE user_id = ? AND expires_at > NOW() 
ORDER BY last_accessed_at DESC;
-- Uses: (user_id, expires_at) index
-- Expected: <10ms
```

**Get current month's usage for user**:
```sql
SELECT * FROM usage_metrics 
WHERE user_id = ? AND year_month = DATE_FORMAT(NOW(), '%Y-%m');
-- Uses: UNIQUE(user_id, year_month, metric_type)
-- Expected: <5ms
```

**Get user's API tokens (non-revoked)**:
```sql
SELECT * FROM api_tokens 
WHERE user_id = ? AND revoked_at IS NULL 
ORDER BY created_at DESC;
-- Uses: (user_id, revoked_at) index
-- Expected: <10ms
```

**Get recent audit logs for user**:
```sql
SELECT * FROM audit_logs 
WHERE user_id = ? 
ORDER BY created_at DESC 
LIMIT 100;
-- Uses: (user_id, created_at DESC) index
-- Expected: <15ms
```

### Common Write Queries

**Create new session**:
```sql
INSERT INTO sessions (user_id, refresh_token, device_type, ip_address, user_agent, expires_at, created_at) 
VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW());
-- Expected: <10ms
-- Triggers: AuditLog entry (async job)
```

**Increment usage counter**:
```sql
UPDATE usage_metrics 
SET count = count + 1, updated_at = NOW() 
WHERE user_id = ? AND year_month = ? AND metric_type = ?;
-- Expected: <5ms
-- Transaction: Atomic to prevent race conditions
```

**Terminate session**:
```sql
UPDATE sessions SET expires_at = NOW() WHERE id = ? AND user_id = ?;
-- Expected: <5ms
-- Cascades: Refresh token becomes invalid
```

### Cleanup Operations

**Delete expired password reset tokens**:
```sql
DELETE FROM password_resets 
WHERE expires_at < NOW() AND used_at IS NULL 
  AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
-- Scheduled: Daily at 3 AM
-- Expected: <100ms
```

**Delete expired sessions**:
```sql
DELETE FROM sessions 
WHERE expires_at < NOW() AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
-- Scheduled: Daily at 3 AM
-- Expected: <200ms
```

**Archive old audit logs**:
```sql
INSERT INTO audit_logs_archive 
SELECT * FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
DELETE FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
-- Scheduled: Weekly on Sunday at 2 AM
-- Expected: <5 seconds
```

---

## Migration Strategy

All schema changes via versioned Laravel migrations:

```text
database/migrations/
├── 2025_11_04_000000_create_users_table.php
├── 2025_11_04_000001_create_sessions_table.php
├── 2025_11_04_000002_create_password_resets_table.php
├── 2025_11_04_000003_create_email_confirmations_table.php
├── 2025_11_04_000004_create_usage_metrics_table.php
├── 2025_11_04_000005_create_api_tokens_table.php
└── 2025_11_04_000006_create_audit_logs_table.php
```

Each migration:
- Version-controlled, timestamped
- Rollback tested before deployment
- Includes indexes and constraints
- Documented with comments
- Can be run in isolation (idempotent)

---

## Summary

**7 Core Entities**: User, Session, PasswordReset, EmailConfirmation, UsageMetric, ApiToken, AuditLog

**Total Tables**: 7 + 1 audit archive table = 8 total

**Indexes**: 20+ strategic indexes for performance

**Constraints**: Foreign keys, unique, check constraints for data integrity

**Queries**: Optimized for <20ms p95 latency

**Retention**: 90 days audit logs, 30-day grace for deleted accounts, permanent user data
