# Feature Specification: Digital Media Projects and Campaigns Management

**Feature Branch**: `003-projects-campaigns`  
**Created**: 2025-11-05  
**Status**: Draft  
**Input**: User description: "Gestão de Projetos e Campanhas de Mídia Digital com hierarquia clara, permissões de colaboração e integração com sistema de agentes IA"

## Executive Summary

Authenticated users need a complete system to create, organize, and manage digital media projects. Each project contains multiple campaigns, and each campaign generates various AI-assisted assets (images, texts, videos). The system provides role-based collaboration, tier-based limitations, and integration with an AI agent system for asset generation.

## User Scenarios & Testing

### User Story 1 - Create and Organize Digital Media Projects (Priority: P1)

Users need to create new projects to organize their digital media work. A project serves as a container for related campaigns targeting specific clients or internal initiatives.

**Why this priority**: Core functionality - without projects, users cannot organize their work. This is the foundational feature.

**Independent Test**: User can create a project with name, description, and optional client; project appears in their projects list; user can view project details.

**Acceptance Scenarios**:

1. **Given** user is authenticated on dashboard, **When** user clicks "Create Project", **Then** form appears with fields for name, description, client, and deadline
2. **Given** user fills project form with valid data, **When** user submits form, **Then** project is created, user is shown success message, and redirected to project details
3. **Given** user is on projects list, **When** user applies filters (status, date, client), **Then** list updates to show matching projects
4. **Given** user has projects created, **When** user views projects list, **Then** projects are paginated (20 per page) with navigation controls
5. **Given** user is viewing a project, **When** user edits project information, **Then** changes are saved and confirmed in UI
6. **Given** user selects a project, **When** user archives it, **Then** project is marked as archived (recoverable for 30 days) and removed from active list

---

### User Story 2 - Create and Manage Campaigns within Projects (Priority: P1)

Users need to create campaigns within projects to define specific marketing initiatives. Each campaign has targeted objectives, audience, platforms, and creative specifications.

**Why this priority**: Core functionality - campaigns are where AI asset generation occurs. Essential for MVP.

**Independent Test**: User can create a campaign in a project with all required fields; campaign appears in project; user can view campaign with all generated assets; user can edit campaign details.

**Acceptance Scenarios**:

1. **Given** user is viewing a project, **When** user clicks "Create Campaign", **Then** form appears with fields for campaign name, objective, target audience, tone, platforms, image dimensions, and briefing
2. **Given** user fills campaign form with valid briefing (50-2000 chars), **When** user submits, **Then** campaign is created with "Draft" status
3. **Given** user is in campaign creation, **When** user selects multiple platforms (Instagram, Facebook, LinkedIn), **Then** all platforms are saved to campaign
4. **Given** user selects image dimensions, **When** user selects multiple dimensions (1080x1080, 1920x1080), **Then** all dimensions are saved and used for asset generation
5. **Given** campaign is created, **When** user views campaign details, **Then** campaign displays all fields, status, creation date, and list of generated assets
6. **Given** user is viewing campaign, **When** user duplicates campaign, **Then** new campaign is created with same settings (name prefixed with "Copy of") in same or selected target project
7. **Given** user selects a campaign, **When** user changes campaign status to "Em Produção" or "Concluída", **Then** status updates and timeline reflects change

---

### User Story 3 - Structured Campaign Briefs with AI Assistance (Priority: P1)

Users need a structured template to write comprehensive campaign briefs. System auto-saves drafts and suggests AI-powered completions for incomplete briefs.

**Why this priority**: Briefs determine asset quality. Structured approach ensures consistency. Auto-save prevents data loss. P1 for MVP quality.

**Independent Test**: User can create structured brief; brief auto-saves every 30 seconds; incomplete brief can receive AI suggestions; brief can be saved as template for reuse.

**Acceptance Scenarios**:

1. **Given** user is creating a campaign, **When** user accesses brief editor, **Then** template shows sections: context, objective, audience (demographic/psychographic), main message, CTA, visual references, restrictions
2. **Given** user is editing a brief, **When** 30 seconds pass without changes, **Then** draft is auto-saved (no user action required)
3. **Given** user has completed some brief fields, **When** user clicks "AI Suggestions", **Then** system suggests completions for empty sections based on filled content
4. **Given** user has previously created briefs, **When** creating new campaign, **Then** previous briefs appear as templates to duplicate or adapt
5. **Given** user completes a brief successfully, **When** user saves brief, **Then** it can be loaded as template in future campaigns

---

### User Story 4 - Role-Based Project Collaboration (Priority: P2)

Users can invite collaborators to projects with defined roles (Owner, Editor, Viewer), enabling team-based campaign management.

**Why this priority**: Important for team workflows but not essential for solo users. Tier-limited feature (Free: 0, Pro: 5, Enterprise: unlimited).

**Independent Test**: Project owner can add collaborators with different roles; collaborators receive notifications; collaborators can access project according to role permissions; owner can modify or revoke access.

**Acceptance Scenarios**:

1. **Given** user is project owner, **When** user clicks "Add Collaborator", **Then** form appears requesting collaborator email and role selection
2. **Given** user enters valid email and role, **When** user submits, **Then** collaborator receives email invitation with project details and access link
3. **Given** collaborator receives invitation, **When** collaborator clicks link and accepts, **Then** project appears in their project list with assigned role
4. **Given** collaborator has "Editor" role, **When** collaborator accesses project, **Then** they can create/edit campaigns but cannot change project settings or manage collaborators
5. **Given** collaborator has "Viewer" role, **When** collaborator accesses project, **Then** they can view campaigns and assets but cannot edit anything
6. **Given** project owner is managing collaborators, **When** owner removes a collaborator, **Then** collaborator loses access immediately and is notified
7. **Given** project owner wants to transfer ownership, **When** owner selects transfer option and confirms, **Then** new owner gains full control, previous owner becomes Editor

---

### User Story 5 - Organize Projects with Tags and Advanced Search (Priority: P2)

Users can organize projects using custom tags and search across all their projects using full-text search to quickly find relevant work.

**Why this priority**: Improves discoverability for power users with many projects. Not essential for MVP but valuable for usability.

**Independent Test**: User can add/remove tags to projects; user can filter by tags; user can search by project name, description, or client name; search results appear within 300ms.

**Acceptance Scenarios**:

1. **Given** user is editing a project, **When** user adds tags (e.g., "product launch", "client-acme"), **Then** tags are saved and display as badges
2. **Given** projects list is displayed, **When** user clicks tag filter, **Then** list shows only projects with that tag
3. **Given** user is on projects dashboard, **When** user types in search box (project name, client, or description), **Then** matching projects appear (filtered full-text search)
4. **Given** search is performed, **When** results load, **Then** results appear in under 300ms
5. **Given** user applies multiple filters (tags + search + status), **When** filters are applied, **Then** list shows intersection of all filter criteria
6. **Given** user has sorted results, **When** user sorts by "Most Recent", "Alphabetical", or "Last Modified", **Then** results reorder accordingly

---

### User Story 6 - Project Statistics and Insights (Priority: P3)

Users can view aggregate statistics about their projects to understand project scope and resource usage.

**Why this priority**: Valuable for reporting and project planning but not critical for basic functionality. P3 for post-MVP.

**Independent Test**: Project dashboard displays statistics; statistics update when campaigns/assets are added; statistics are accurate against database records.

**Acceptance Scenarios**:

1. **Given** user is viewing a project, **When** user scrolls to statistics section, **Then** display shows: total campaigns, total assets, creation date, last modified date, average asset generation time
2. **Given** statistics view is open, **When** new campaign or assets are added, **Then** statistics update in real-time or on refresh
3. **Given** project is selected, **When** user views statistics, **Then** display shows tier-relevant metrics (e.g., credit usage for Pro/Enterprise)

---

### User Story 7 - Export and Archive Projects (Priority: P3)

Users can export projects as JSON for backup or external use, and archive old projects without losing data.

**Why this priority**: Support for advanced workflows and data portability. Not essential for MVP.

**Independent Test**: User can export project with all campaigns and assets to JSON; exported file is valid JSON; user can archive project; archived project can be recovered within 30 days; after 30 days, project is hard-deleted.

**Acceptance Scenarios**:

1. **Given** user is viewing a project, **When** user clicks "Export Project", **Then** JSON file downloads containing all project, campaign, and asset data
2. **Given** user archives a project, **When** user navigates to projects list, **Then** archived project appears in separate "Archived" section
3. **Given** project is archived and within 30-day recovery window, **When** user clicks "Restore" on archived project, **Then** project returns to active status
4. **Given** 30 days have passed since archival, **When** system performs cleanup, **Then** archived project is permanently deleted

---

### Edge Cases

- What happens when user reaches tier project limit (e.g., Free tier with 5 projects limit)? → Show error message, suggest upgrade
- How does system handle concurrent edits to same campaign? → Last write wins with conflict notification (P3 feature)
- What happens when collaborator is removed mid-edit of campaign? → Collaborator loses access immediately; draft work is lost (acceptable for MVP)
- How are assets handled when campaign is deleted? → Assets are soft-deleted, permanently removed after 7 days
- What if user tries to duplicate project to tier with insufficient capacity? → Show error explaining limit

## Requirements

### Functional Requirements

**Projects Management:**

- **FR-001**: System MUST allow authenticated users to create projects with: name (required, max 100 chars), description (optional, max 500 chars), client (optional), deadline (optional date)
- **FR-002**: System MUST display projects list with pagination (20 projects per page) showing: project name, status, client, last modified date, campaign count
- **FR-003**: System MUST support project status: "Rascunho" (Draft), "Ativo" (Active), "Arquivado" (Archived)
- **FR-004**: System MUST enforce tier-based project limits: Free (5 active), Pro (unlimited), Enterprise (unlimited + versioning)
- **FR-005**: System MUST allow users to edit project information (name, description, client, deadline)
- **FR-006**: System MUST allow users to soft-delete (archive) projects with 30-day recovery window
- **FR-007**: System MUST allow users to duplicate entire project with all campaigns and assets
- **FR-008**: System MUST allow users to export projects as JSON file containing all campaigns and assets

**Campaigns Management:**

- **FR-009**: System MUST allow users to create campaigns within projects with: name (required), objective (awareness/conversion/engagement), target audience description, tone of voice (professional/casual/creative/etc), target platforms (multi-select: Instagram, Facebook, LinkedIn, TikTok, YouTube, Twitter), image dimensions (multi-select: common presets), briefing (required, 50-2000 chars)
- **FR-010**: System MUST display campaigns list by project showing: campaign name, status, platforms, asset count, creation date
- **FR-011**: System MUST support campaign status: "Rascunho" (Draft), "Em Produção" (In Production), "Concluída" (Completed)
- **FR-012**: System MUST maintain campaign version history (last 5 versions) with ability to view previous versions and restore
- **FR-013**: System MUST allow users to edit campaign information (all fields except creation date)
- **FR-014**: System MUST allow users to duplicate campaigns within same project or to another project (if user has access)
- **FR-015**: System MUST allow users to delete campaigns (with confirmation); assets are soft-deleted and permanently removed after 7 days
- **FR-016**: System MUST display detailed campaign view showing: all campaign fields, current status, list of generated assets, version history

**Campaign Briefs:**

- **FR-017**: System MUST provide structured brief template with sections: client/brand context, campaign objective, audience (demographic + psychographic), main message, call-to-action, visual references (URLs or uploads), content restrictions
- **FR-018**: System MUST auto-save brief drafts every 30 seconds (without user action)
- **FR-019**: System MUST allow users to load previous briefs as templates for new campaigns
- **FR-020**: System MUST provide AI-powered suggestions to complete incomplete brief sections based on filled content
- **FR-021**: System MUST validate briefing has minimum 50 characters and maximum 2000 characters

**Collaboration:**

- **FR-022**: System MUST allow project owner to add collaborators via email address
- **FR-023**: System MUST support three collaborator roles: Owner (full control), Editor (create/edit campaigns), Viewer (view-only)
- **FR-024**: System MUST send email notification when user is added as collaborator to project
- **FR-025**: System MUST enforce tier-based collaborator limits: Free (0 collaborators), Pro (5 per project), Enterprise (unlimited)
- **FR-026**: System MUST allow project owner to remove collaborators (revoke access immediately)
- **FR-027**: System MUST allow project owner to transfer project ownership to another collaborator
- **FR-028**: System MUST prevent non-owner collaborators from modifying project settings or managing collaborators

**Organization & Search:**

- **FR-029**: System MUST allow users to add/edit/remove custom tags on projects
- **FR-030**: System MUST allow filtering projects list by tags (single or multiple)
- **FR-031**: System MUST provide full-text search across projects (name, description, client) returning results in < 300ms (p95)
- **FR-032**: System MUST allow sorting projects list by: creation date, alphabetical, last modified date
- **FR-033**: System MUST cache project lists and invalidate cache on create/update/delete operations

**Statistics:**

- **FR-034**: System MUST display project statistics: total campaigns, total assets, creation date, last modified date
- **FR-035**: System MUST calculate and display average asset generation time per project
- **FR-036**: System MUST track and display credit/token usage per project (Pro/Enterprise tiers)

**Data Management:**

- **FR-037**: System MUST use soft delete for projects (recoverable for 30 days, permanent deletion after)
- **FR-038**: System MUST use hard delete for campaigns after 7-day grace period
- **FR-039**: System MUST cascade delete: deleting project deletes all associated campaigns and their assets
- **FR-040**: System MUST maintain orphaned assets and permanently delete them 7 days after campaign deletion

**Validations:**

- **FR-041**: System MUST validate user tier before allowing project creation (reject if limit reached)
- **FR-042**: System MUST validate user tier before allowing collaborator addition (reject if limit reached)
- **FR-043**: System MUST validate briefing length (50-2000 chars) before saving campaign
- **FR-044**: System MUST validate project name (required, max 100 chars) before saving
- **FR-045**: System MUST validate campaign name (required) before saving

### Key Entities

- **Project**: Container for related campaigns. Attributes: id, user_id (owner), name, description, client, deadline, status, tags, created_at, updated_at, deleted_at (soft delete)
  
- **Campaign**: Marketing initiative within a project. Attributes: id, project_id, name, objective, target_audience, tone_of_voice, platforms (array), image_dimensions (array), briefing, status, version (current), created_at, updated_at, deleted_at
  
- **CampaignBrief**: Detailed brief for campaign. Attributes: id, campaign_id, context, objective, audience_demographic, audience_psychographic, main_message, cta, visual_references, restrictions, auto_saved_at, created_at, updated_at
  
- **CampaignVersion**: Version history for campaigns. Attributes: id, campaign_id, version_number, snapshot (full campaign data), created_at
  
- **Asset**: Generated content (image, text, video). Attributes: id, campaign_id, type (image/text/video), file_url, generation_metadata, created_at, deleted_at
  
- **ProjectCollaborator**: User access to project. Attributes: id, project_id, user_id, role (owner/editor/viewer), invited_at, accepted_at, created_at
  
- **ProjectTag**: Tags for organization. Attributes: id, project_id, name, created_at

- **Relationship Graph**:
  - User (1) → (N) Projects
  - User (1) → (N) ProjectCollaborators
  - Project (1) → (N) Campaigns
  - Project (1) → (N) ProjectCollaborators
  - Project (1) → (N) ProjectTags
  - Campaign (1) → (N) Assets
  - Campaign (1) → (N) CampaignVersions
  - Campaign (1) → (1) CampaignBrief

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can complete project creation workflow in under 2 minutes (from click to project appearing in list)
- **SC-002**: Users can create a campaign with all required fields in under 3 minutes
- **SC-003**: Brief auto-save captures all changes (100% data retention on auto-save)
- **SC-004**: Project list displays and filters results in under 300ms (p95 latency)
- **SC-005**: Full-text search returns relevant results in under 300ms (p95 latency)
- **SC-006**: Collaborators receive email notifications within 5 minutes of being added to project
- **SC-007**: Campaign duplication completes in under 5 seconds (all campaigns and assets copied)
- **SC-008**: Project export to JSON completes in under 10 seconds for projects with < 100 campaigns
- **SC-009**: Tier limits are enforced (Free user cannot create 6th project; Pro user can create unlimited)
- **SC-010**: Archived projects can be restored within 30-day window; permanently deleted after 30 days
- **SC-011**: Version history preserves all campaign changes; users can view and restore 5 previous versions
- **SC-012**: 95% of project operations (create, read, update) complete within 500ms
- **SC-013**: UI pagination works correctly with 20 projects per page across all filter/sort combinations

## Assumptions

1. **AI Agent System Integration**: Assumes existing AI agent system is available for asset generation (separate feature). This spec only handles project/campaign structure and briefing; actual AI calls are out of scope.

2. **Email Service**: Assumes functional email service is available for sending collaborator invitations (Resend or similar already configured).

3. **Frontend Structure**: Assumes existing `/dashboard/campaigns` frontend structure will be extended/modified (not replaced) to accommodate projects-campaigns hierarchy.

4. **User Tiers**: Assumes user tier information (`tier: free|pro|enterprise`) is already available from authentication system.

5. **Soft Delete Implementation**: Uses `deleted_at` timestamp pattern (already established in user auth system).

6. **Timeline**: Assumes 30-day recovery window and 7-day grace period are acceptable business rules; can be configured via environment variables.

## Out of Scope (For Future Phases)

1. **AI Asset Generation**: Actual AI agent calls and asset generation (separate feature)
2. **Real-time Collaboration**: Live editing conflict resolution
3. **Advanced Analytics**: Detailed performance metrics, engagement tracking
4. **Approval Workflows**: Multi-step approval process for campaigns
5. **Budget Tracking**: Detailed budget management and forecasting
6. **Social Media Publishing**: Direct posting to social platforms
7. **Mobile App**: Only web app (Next.js) is in scope

## Context & Decisions

This feature directly extends the existing authentication system (feature 002) and maintains consistency with established patterns:
- Uses same Laravel + Next.js tech stack
- Extends existing user model without modification
- Follows established role-based access patterns
- Uses same error handling and validation approach
- Maintains same UI/UX design language

The hierarchical structure (Project → Campaign → Asset) mirrors real-world digital agency workflows and provides natural scaling from solo users to enterprise teams.

## Notes for Implementation Planning

1. **Phased Approach Recommended**: Implement projects-campaigns core (FR-001 to FR-016) in Phase 1, then collaborations (FR-022-028), then search/organization (FR-029-032), then analytics (FR-034-036)

2. **Database Migrations Priority**: Project, Campaign, Asset, CampaignBrief tables are minimum viable (others can follow)

3. **API Endpoint Structure**: Natural RESTful structure suggests `/api/v1/projects`, `/api/v1/projects/{id}/campaigns`, `/api/v1/campaigns/{id}/assets`

4. **Frontend Component Reuse**: Likely can extend existing auth form components for project/campaign creation flows

5. **Testing Strategy**: Start with project CRUD (testable independently), then campaign CRUD, then collaborations (dependency on notification system)
