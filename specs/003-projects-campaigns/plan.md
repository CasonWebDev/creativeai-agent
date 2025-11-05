# Implementation Plan: Digital Media Projects and Campaigns Management

**Branch**: `003-projects-campaigns` | **Date**: 2025-11-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-projects-campaigns/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Authenticated users need a complete system to create, organize, and manage digital media projects with hierarchical structure (Project → Campaign → Asset). System provides role-based collaboration (Owner/Editor/Viewer), tier-based limitations (Free/Pro/Enterprise), structured campaign briefs with auto-save, file upload management, and integration with existing JWT authentication. Technical approach extends existing Laravel + Next.js architecture with new database entities, RESTful API endpoints, and frontend components for project/campaign management.

## Technical Context

**Language/Version**: PHP 8.2+ (backend), TypeScript (frontend)
**Primary Dependencies**: Laravel 11+, Next.js 16, React 19, PostgreSQL 14+, Redis (caching/sessions)
**Storage**: PostgreSQL (relational data), S3-compatible storage (file uploads for visual references)
**Testing**: PHPUnit (backend unit/integration), Jest/React Testing Library (frontend)
**Target Platform**: Web application (desktop browsers, responsive design)
**Project Type**: Web (frontend + backend separation)
**Performance Goals**: 
  - API response p95 < 300ms (list/search endpoints)
  - Project/campaign CRUD p95 < 500ms
  - File upload validation < 100ms
  - Auto-save operation < 200ms
**Constraints**: 
  - Storage quotas enforced per tier (Free: 100MB, Pro: 5GB, Enterprise: 50GB)
  - File upload limits (5MB per file, 5 files max per brief)
  - Campaign version history limited to 5 versions (Enterprise only)
  - Tier-based project limits (Free: 5, Pro/Enterprise: unlimited)
**Scale/Scope**: 
  - 7 new database entities (Project, Campaign, CampaignBrief, CampaignVersion, Asset, ProjectCollaborator, ProjectTag)
  - 51 functional requirements across 8 categories
  - ~15 new API endpoints (projects CRUD, campaigns CRUD, collaborators, file uploads)
  - ~10 new frontend pages/components (project list/detail, campaign list/detail, brief editor)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Architecture & Design ✅ PASS
- ✅ Frontend (Next.js) and backend (Laravel) separation maintained (extends existing architecture)
- ✅ RESTful API principles followed (new endpoints follow existing patterns)
- ✅ Backend runs in Docker container (already configured in existing system)
- ✅ PostgreSQL runs in Docker container (already configured)
- ✅ Docker Compose used for local development (existing setup)

### II. Code Quality ✅ PASS
- ✅ PSR-12 coding standards (existing standard enforced)
- ✅ Type hints on all PHP 8.2+ methods (will be enforced in new code)
- ✅ PHPUnit unit test coverage 80%+ target (existing practice)
- ✅ PHPDoc comments required (existing standard)

### III. Security ✅ PASS
- ✅ JWT authentication with existing auth system (FR-047)
- ✅ Rate limiting on API endpoints (existing middleware applies)
- ✅ Input validation via Laravel Form Requests (existing pattern)
- ✅ File upload validation (FR-046: size, format, count limits)
- ✅ CORS configured (existing configuration)

### IV. Performance ✅ PASS
- ✅ Redis for caching (FR-033: project list caching)
- ✅ Database indexes required (will be added for frequently-queried columns)
- ✅ Pagination mandatory (FR-002: 20 projects per page)
- ✅ Performance targets defined (SC-004, SC-005, SC-012: <300-500ms p95)

### V. AI Agents ⚠️ PARTIAL
- ⚠️ AI brief suggestions (FR-020) will use existing AI agent system
- ✅ Out of scope: Asset generation (separate feature)
- **Note**: AI integration minimal in this feature; mainly structural setup

### VI. Integrations ✅ PASS
- ✅ S3-compatible storage for file uploads (visual references)
- ✅ Email service for collaborator notifications (FR-024, existing Resend integration)
- ✅ JWT authentication reuses existing system (FR-047)

### VII. Data & Database ✅ PASS
- ✅ PostgreSQL primary database (existing)
- ✅ Migrations version-controlled (existing practice)
- ✅ Soft deletes applied (FR-037, FR-038, FR-040)
- ✅ Backup strategy assumed (existing infrastructure)

### VIII. Monitoring ⚠️ NEEDS CLARIFICATION
- ⚠️ Health check endpoint exists at `/api/health` (extend for new entities?)
- ⚠️ APM instrumentation on new endpoints (existing or requires setup?)
- ✅ Storage usage metrics required (FR-049, SC-015)

### IX. Development Workflow ✅ PASS
- ✅ Git flow used (feature branch: 003-projects-campaigns)
- ✅ Semantic commits (existing practice)
- ✅ CI/CD pipeline (existing GitHub Actions)
- ✅ Deployment environments (local/staging/production)

### X. Costs & Usage Limits ✅ PASS
- ✅ Tier-based project limits (FR-004: Free 5, Pro/Enterprise unlimited)
- ✅ Storage quotas enforced (FR-048: Free 100MB, Pro 5GB, Enterprise 50GB)
- ✅ Collaborator limits enforced (FR-025: Free 0, Pro 5, Enterprise unlimited)

**GATE STATUS**: ✅ **PASS** (2 items need clarification in research phase)

**Post-Phase 1 Re-check**:

### VIII. Monitoring ✅ RESOLVED
- ✅ Health check extension documented in research.md (Section 1)
- ✅ APM instrumentation approach defined in research.md (Section 2)
- ✅ Storage usage metrics implementation specified (FR-049, SC-015)

**FINAL GATE STATUS**: ✅ **PASS** (All items resolved)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── Models/
│   │   ├── Project.php
│   │   ├── Campaign.php
│   │   ├── CampaignBrief.php
│   │   ├── CampaignVersion.php
│   │   ├── Asset.php
│   │   ├── ProjectCollaborator.php
│   │   └── ProjectTag.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── ProjectController.php
│   │   │   ├── CampaignController.php
│   │   │   ├── CampaignBriefController.php
│   │   │   ├── CollaboratorController.php
│   │   │   ├── FileUploadController.php
│   │   │   └── ProjectTagController.php
│   │   ├── Requests/
│   │   │   ├── StoreProjectRequest.php
│   │   │   ├── UpdateProjectRequest.php
│   │   │   ├── StoreCampaignRequest.php
│   │   │   ├── UpdateCampaignRequest.php
│   │   │   ├── StoreBriefRequest.php
│   │   │   ├── AddCollaboratorRequest.php
│   │   │   └── UploadFileRequest.php
│   │   └── Resources/
│   │       ├── ProjectResource.php
│   │       ├── CampaignResource.php
│   │       ├── CampaignBriefResource.php
│   │       └── CollaboratorResource.php
│   ├── Services/
│   │   ├── ProjectService.php
│   │   ├── CampaignService.php
│   │   ├── CampaignVersionService.php
│   │   ├── CollaboratorService.php
│   │   ├── FileUploadService.php
│   │   └── StorageQuotaService.php
│   └── Mail/
│       └── CollaboratorInvitation.php
├── database/
│   └── migrations/
│       ├── 2025_11_05_create_projects_table.php
│       ├── 2025_11_05_create_campaigns_table.php
│       ├── 2025_11_05_create_campaign_briefs_table.php
│       ├── 2025_11_05_create_campaign_versions_table.php
│       ├── 2025_11_05_create_assets_table.php
│       ├── 2025_11_05_create_project_collaborators_table.php
│       └── 2025_11_05_create_project_tags_table.php
├── routes/
│   └── api.php (extend with new project/campaign routes)
└── tests/
    ├── Feature/
    │   ├── ProjectManagementTest.php
    │   ├── CampaignManagementTest.php
    │   ├── CollaborationTest.php
    │   ├── FileUploadTest.php
    │   └── TierLimitsTest.php
    └── Unit/
        ├── ProjectServiceTest.php
        ├── CampaignServiceTest.php
        ├── StorageQuotaServiceTest.php
        └── CollaboratorServiceTest.php

frontend/
├── app/
│   └── dashboard/
│       ├── projects/
│       │   ├── page.tsx (projects list)
│       │   ├── [id]/
│       │   │   ├── page.tsx (project detail)
│       │   │   └── campaigns/
│       │   │       ├── page.tsx (campaigns list)
│       │   │       └── [campaignId]/
│       │   │           └── page.tsx (campaign detail)
│       │   └── new/
│       │       └── page.tsx (create project)
│       └── campaigns/ (existing structure - may be deprecated or merged)
├── components/
│   ├── projects/
│   │   ├── project-list.tsx
│   │   ├── project-card.tsx
│   │   ├── project-form.tsx
│   │   ├── project-filters.tsx
│   │   └── project-stats.tsx
│   ├── campaigns/
│   │   ├── campaign-list.tsx
│   │   ├── campaign-card.tsx
│   │   ├── campaign-form.tsx
│   │   ├── campaign-brief-editor.tsx
│   │   ├── campaign-version-history.tsx
│   │   └── platform-selector.tsx
│   ├── collaborators/
│   │   ├── collaborator-list.tsx
│   │   ├── add-collaborator-form.tsx
│   │   └── role-selector.tsx
│   └── uploads/
│       ├── file-upload-zone.tsx
│       ├── file-preview.tsx
│       └── storage-quota-indicator.tsx
├── lib/
│   ├── api/
│   │   ├── projects.ts
│   │   ├── campaigns.ts
│   │   ├── collaborators.ts
│   │   └── uploads.ts
│   └── types/
│       ├── project.ts
│       ├── campaign.ts
│       └── collaborator.ts
└── tests/
    └── integration/
        ├── project-workflow.test.tsx
        ├── campaign-workflow.test.tsx
        └── collaboration.test.tsx
```

**Structure Decision**: Web application structure (Option 2) selected. Feature extends existing backend/ and frontend/ directories with new models, controllers, services, and React components. Projects are treated as a new dashboard section under `/dashboard/projects` with nested campaign routes. Existing `/dashboard/campaigns` may be deprecated or redirected to projects-based navigation.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations. All constitution requirements met.

---

## Phase 0: Research Complete ✅

**Output**: `research.md` (8 technical decisions documented)

**Key Decisions**:
1. Health check extended with database connectivity test
2. APM via Laravel logging (dedicated service post-MVP)
3. File uploads use Laravel Storage + S3 driver
4. Collaboration uses Laravel Policies + query scopes
5. Auto-save with frontend debounced POST
6. Versioning uses JSON snapshots
7. Tier limits checked in service layer
8. Full-text search uses PostgreSQL tsvector + GIN index

---

## Phase 1: Design & Contracts Complete ✅

**Outputs**:
- `data-model.md` (7 entities, ERD, migration sequence)
- `contracts/projects-api.yaml` (OpenAPI 3.0 spec)
- `contracts/campaigns-api.yaml` (OpenAPI 3.0 spec)
- `contracts/collaborators-files-api.yaml` (OpenAPI 3.0 spec)
- `quickstart.md` (8-phase implementation guide)
- `.github/copilot-instructions.md` (updated with new technologies)

**API Endpoints Defined**: 15 total
- Projects: 8 endpoints (list, create, update, delete, duplicate, export, restore, search)
- Campaigns: 5 endpoints (list, create, update, delete, duplicate, brief draft/update, versions)
- Collaborators: 4 endpoints (list, add, update, remove, transfer ownership)
- Files: 2 endpoints (upload, quota)
- Tags: 3 endpoints (list, add, remove)

**Database Schema**: 7 tables with complete specifications
- projects (with tsvector for search)
- campaigns
- campaign_briefs
- campaign_versions
- assets
- project_collaborators
- project_tags

---

## Next Steps

**Command**: Run `/speckit.tasks` to generate phased task breakdown

This planning phase is complete. All requirements from the specification have been:
- ✅ Validated against constitution (no violations)
- ✅ Researched for technical unknowns (8 decisions documented)
- ✅ Designed with complete data model
- ✅ Specified with OpenAPI contracts
- ✅ Documented with quickstart guide
- ✅ Integrated into agent context

The feature is ready for task breakdown and implementation.
