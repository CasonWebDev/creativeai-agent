# CreativeAI Agent Constitution

<!--
SYNC IMPACT REPORT
==================
Version Change: 1.0.0 → 1.1.0 (MINOR - Expanded Architecture principle)
Ratification Date: 2025-11-04
Last Amendment: 2025-11-04

Modified Principles:
- I. Architecture & Design (expanded with 4 new containerization rules)

Amendment Summary:
- Added mandatory Docker containerization for backend (Laravel) in all environments
- Added mandatory Docker containerization for PostgreSQL database in all environments
- Added Docker Compose requirement for local development orchestration
- Added multi-stage Dockerfile and health check requirements

Impact:
- Development workflow now requires Docker Desktop (local environment consistency)
- CI/CD pipeline must build and push Docker images
- Deployment must support container orchestration (Kubernetes, Docker Swarm, etc.)

Templates Requiring Review:
- ⚠ .specify/templates/plan-template.md: Add Docker/container setup to Phase 1
- ⚠ .specify/templates/tasks-template.md: Add Dockerfile creation tasks to foundational phase
-->

## Core Principles

### I. Architecture & Design

**Non-negotiable rules:**
- Frontend (Next.js) and backend (Laravel) MUST maintain clear separation of concerns
- API communication MUST follow RESTful principles with OpenAPI 3.0 documentation
- Event-driven architecture MUST be used for inter-agent communication
- Design patterns (Repository, Service Layer, Factory) MUST be applied for AI agent implementations
- Microservices separation MUST be enforced: API Laravel and Worker CrewAI processes run independently
- Backend Laravel application MUST run inside a Docker container in all environments (local, staging, production)
- PostgreSQL database MUST run inside a Docker container in all environments (local, staging, production)
- Docker Compose MUST be used for local development to orchestrate backend and database services
- All Dockerfiles MUST use multi-stage builds to minimize image size and include health checks

**Rationale**: Architectural clarity enables independent scaling, testing, and maintenance of frontend and backend systems. Event-driven patterns allow agents to communicate asynchronously, improving resilience and throughput. Containerization ensures environment consistency (dev/staging/prod parity), simplifies deployment, enables orchestration, and provides process isolation for reliability.

---

### II. Code Quality

**Non-negotiable rules:**
- All PHP code MUST comply with PSR-12 coding standards
- Type hints MUST be present on all PHP 8.2+ method signatures and return types
- Unit test coverage MUST be minimum 80% (verified by PHPUnit)
- Integration tests MUST cover all AI agent workflow paths
- PHPDoc comments MUST document all public methods and complex logic
- Code review MUST be mandatory before any merge to develop/main branches

**Rationale**: Strict code quality standards prevent technical debt, reduce bugs in AI-driven features, and ensure maintainability across a team. Type hints enable IDE support and catch errors early.

---

### III. Security

**Non-negotiable rules:**
- Authentication MUST use JWT with refresh token rotation (max 15-min access token TTL)
- Rate limiting MUST be enforced on all API endpoints (default 60 requests/minute per IP/user)
- Input validation MUST use Laravel Form Requests with strict allowlist/deny patterns
- CORS MUST be configured to allow only approved domains (whitelist-only approach)
- AI prompt sanitization MUST strip/escape user-controlled input before sending to Gemini/Imagen APIs
- Audit logging MUST record all security-relevant actions (auth, data access, agent invocation)

**Rationale**: JWT ensures secure, stateless authentication. Rate limiting prevents abuse and DDoS vectors. Prompt sanitization prevents prompt injection attacks targeting AI models. Audit logs enable forensics and compliance.

---

### IV. Performance

**Non-negotiable rules:**
- Redis MUST be used for session storage and frequently-accessed data caching
- Asynchronous job processing MUST use Redis-backed queue system (for AI generation tasks)
- Database indexes MUST be applied strategically to frequently-queried columns
- Eloquent relationships MUST use lazy loading or explicit eager loading; N+1 queries are forbidden
- Rate limiting per user tier MUST be implemented (free, pro, enterprise quota enforcement)
- Paginated responses MUST be mandatory for list endpoints (maximum 50 items per page)

**Rationale**: Caching and async queues reduce response latency for long-running AI tasks. Strategic indexing improves query performance at scale. Pagination prevents memory exhaustion and improves user experience.

---

### V. AI Agents

**Non-negotiable rules:**
- Each agent MUST execute in an isolated process to prevent one failing agent from crashing others
- Task timeouts MUST be configurable per task type (maximum 5 minutes absolute timeout)
- Retry logic MUST implement exponential backoff with maximum 3 retry attempts
- Fallback models MUST be available for each critical task (e.g., DALL-E fallback for Imagen)
- Structured logging MUST capture all AI interactions (prompts, model responses, latency, tokens used)
- Prompt versions MUST be stored in database with timestamp/hash for reproducibility and debugging

**Rationale**: Process isolation prevents cascading failures. Timeouts prevent runaway processes. Exponential backoff reduces server load on transient failures. Structured logs enable monitoring and cost analysis.

---

### VI. Integrations

**Non-negotiable rules:**
- Google Gemini API MUST be used for task validation and coordination; all requests MUST include API key rotation logging
- Image generation MUST primarily use Nano Imagen 3 with DALL-E as documented fallback
- CrewAI MUST be used for multi-step agent orchestration (workflow composition)
- Webhook system MUST be available for asynchronous notifications with retry-on-failure logic
- Generated assets MUST be stored in S3-compatible storage with metadata (owner, creation timestamp, expiration policy)

**Rationale**: Centralized integrations enable consistent error handling and monitoring. Fallbacks ensure service continuity. Webhooks decouple services. S3 storage enables scalable, durable asset management.

---

### VII. Data & Database

**Non-negotiable rules:**
- PostgreSQL MUST be the primary database (no alternatives except in development/testing)
- Migrations MUST be version-controlled and tested for rollback correctness before deployment
- Soft deletes MUST be applied to all critical entities (users, projects, prompts, results)
- Daily automated backups MUST be configured with point-in-time recovery capability
- Data retention policy MUST enforce: logs retained 90 days, projects/assets retained indefinitely

**Rationale**: PostgreSQL provides ACID guarantees for financial and security-sensitive operations. Tested migrations prevent data loss during deployments. Soft deletes enable recovery and audit trails. Backups ensure disaster recovery.

---

### VIII. Monitoring

**Non-negotiable rules:**
- Application Performance Monitoring (APM) MUST be instrumented on all critical paths
- Health check endpoint MUST be available at `/api/health` returning service status and dependencies
- AI usage metrics MUST be tracked: tokens consumed, latency per model, estimated costs
- Automated alerts MUST trigger when: agent timeout rate >5%, cost >80% of monthly budget
- Real-time metrics dashboard MUST display: active agents, queue depth, error rates, token usage trends

**Rationale**: APM enables identification of performance bottlenecks. Health checks enable orchestration (K8s, load balancers). Usage metrics enable cost optimization and budget planning. Dashboards provide visibility for operations teams.

---

### IX. Development Workflow

**Non-negotiable rules:**
- Git flow MUST be used: main (production), develop (staging), feature/* (development branches)
- Commit messages MUST use semantic format: feat:, fix:, docs:, refactor:, test:, chore:
- CI/CD pipeline MUST run automated tests, linting, and security checks on all PRs
- Deployment environments MUST be: local (development), staging (pre-production), production
- Feature flags MUST be used for gradual rollout of non-breaking features (max 5% → 25% → 100%)

**Rationale**: Git flow provides clear branch strategy and deployment confidence. Semantic commits enable automated changelog generation and revert capability. CI/CD prevents broken code from reaching production. Feature flags enable safe experimentation.

---

### X. Costs & Usage Limits

**Non-negotiable rules:**
- Budget tracking MUST be enforced per project and per user with monthly reset
- Usage limits MUST be tier-enforced: free (1k tokens/month), pro (100k), enterprise (unlimited with approval)
- AI request throttling MUST be based on user's available credit balance (reject if insufficient)
- Cost alerts MUST fire at 80% and 100% of monthly budget, with admin dashboard visibility
- Cost attribution MUST be logged per: agent type, model (Gemini/Imagen), date, user account

**Rationale**: Budget tracking prevents unexpected cloud costs. Tiered limits enable fair resource sharing. Alerts enable proactive budget management. Cost attribution enables chargeback and optimization.

---

## Implementation Standards

**Technology Stack:**
- Backend: Laravel 11+, PHP 8.2+, PostgreSQL, Redis
- Frontend: Next.js 14+, React 18+, TypeScript
- AI Orchestration: CrewAI, Google Gemini API, Nano Imagen 3
- Infrastructure: Docker, GitHub Actions (CI/CD), S3-compatible storage

**Testing Requirements:**
- Unit tests: PHPUnit with 80%+ coverage requirement
- Integration tests: Feature tests for AI workflows and API contracts
- E2E tests: Critical user journeys (auth, agent execution, result delivery)

**Documentation Standards:**
- API: OpenAPI 3.0 specification auto-generated from code
- Code: PHPDoc on all public methods and complex logic blocks
- Architecture: Decision records (ADRs) for major design choices
- Runbooks: Incident response procedures for common failure modes

---

## Governance

**Amendment Procedure:**
1. Proposed change MUST be submitted as a GitHub issue tagged `constitution-amendment`
2. Change requires rationale explaining: why current rule insufficient, impact, migration plan
3. Amendment MUST be approved by tech lead + at least one other senior developer
4. Upon approval, constitution MUST be updated with new `LAST_AMENDED_DATE`
5. All affected teams MUST be notified; documentation/templates updated within 1 sprint

**Compliance Review:**
- All code reviews MUST verify compliance with applicable principles
- Architecture decisions MUST explicitly reference governing principles
- Monthly review: PRs flagged for constitution violations are summarized and discussed
- Waivers: Temporary exceptions require written justification + time-bounded expiration date

**Constitution Versioning:**
- MAJOR: Backward-incompatible principle removals or redefinitions
- MINOR: New principle/section added or materially expanded guidance
- PATCH: Clarifications, wording, typo fixes, non-semantic refinements

---

**Version**: 1.1.0 | **Ratified**: 2025-11-04 | **Last Amended**: 2025-11-04
