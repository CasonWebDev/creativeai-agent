# Implementation Tasks: Digital Media Projects and Campaigns Management

**Feature**: 003-projects-campaigns  
**Branch**: `003-projects-campaigns`  
**Generated**: 2025-11-05  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Overview

This feature adds a complete project and campaign management system with hierarchical structure (Project → Campaign → Asset), role-based collaboration, tier-based limits, and file upload management.

**Total User Stories**: 7 (P1: 3, P2: 2, P3: 2)  
**Estimated Tasks**: ~85 tasks  
**MVP Scope**: User Stories 1-3 (Projects, Campaigns, Briefs)

---

## Implementation Strategy

### Delivery Approach

1. **MVP First** (User Stories 1-3):
   - P1: Create and organize projects (US1)
   - P1: Create and manage campaigns (US2)
   - P1: Structured campaign briefs with auto-save (US3)
   
2. **Team Features** (User Stories 4-5):
   - P2: Role-based collaboration (US4)
   - P2: Tags and advanced search (US5)

3. **Advanced Features** (User Stories 6-7):
   - P3: Project statistics (US6)
   - P3: Export and archive (US7)

### Parallel Execution Strategy

**Phase 1 (Setup)**: Sequential (foundational setup)

**Phase 2 (Foundational)**: Parallelizable after database setup
- Team A: Backend models + services
- Team B: Frontend base components
- Team C: Authentication middleware

**Phase 3 (US1 - Projects)**: Parallelizable after models exist
- Team A: Backend API endpoints
- Team B: Frontend pages + components
- Team C: Integration tests

**Phase 4 (US2 - Campaigns)**: Parallelizable after US1 complete
- Team A: Campaign API
- Team B: Campaign UI
- Independent of US1 frontend (different pages)

**Phase 5 (US3 - Briefs)**: Depends on US2 (extends campaigns)
- Team A: Brief API + auto-save
- Team B: Brief editor UI
- Team C: File upload

**Phase 6 (US4 - Collaboration)**: Independent of US3
- Team A: Collaborator API
- Team B: Collaborator UI
- Team C: Email notifications

**Phase 7 (US5 - Search)**: Independent of US4
- Team A: Search API + indexing
- Team B: Search UI + filters
- Team C: Tag management

**Phase 8 (US6 - Statistics)**: Depends on all entities existing
**Phase 9 (US7 - Export)**: Depends on all entities existing

---

## Task Dependencies

### User Story Completion Order

```
Setup (Phase 1)
    ↓
Foundational (Phase 2) ← [Blocking for all user stories]
    ↓
    ├──→ US1 (Projects) ← [MVP Foundation]
    │       ↓
    │   US2 (Campaigns) ← [Extends US1]
    │       ↓
    │   US3 (Briefs) ← [Extends US2]
    │
    ├──→ US4 (Collaboration) ← [Independent, can start after Foundational]
    │
    ├──→ US5 (Search/Tags) ← [Independent, can start after Foundational]
    │
    ├──→ US6 (Statistics) ← [Depends on US1, US2, Asset entity]
    │
    └──→ US7 (Export/Archive) ← [Depends on US1, US2, US3 complete]
```

**Critical Path**: Setup → Foundational → US1 → US2 → US3 (MVP complete)

---

## Phase 1: Setup & Infrastructure

**Goal**: Initialize project structure and development environment

**Estimated**: 2-4 hours

### Tasks

- [ ] T001 Verify backend Docker environment running (Laravel, PostgreSQL, Redis)
- [ ] T002 Verify frontend development server working (Next.js 16)
- [ ] T003 Configure S3 storage credentials in backend/.env (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET)
- [ ] T004 Test S3 connection with Laravel Storage facade
- [ ] T005 Verify JWT authentication working from feature 002 (test with /api/auth/me endpoint)
- [ ] T006 Create feature branch checklist: migrations ready, models folder exists, frontend structure exists

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Database schema, base models, and shared services

**Estimated**: 1-2 days

**Blocking**: All user stories depend on this phase

### Database Migrations

- [ ] T007 Create migration: create_projects_table with columns (id, user_id FK, name, description, client, deadline, status enum, created_at, updated_at, deleted_at) in backend/database/migrations/
- [ ] T008 Create migration: create_campaigns_table with columns (id, project_id FK, name, objective enum, target_audience, tone_of_voice, platforms json, image_dimensions json, briefing text, status enum, version int, created_at, updated_at, deleted_at) in backend/database/migrations/
- [ ] T009 Create migration: create_campaign_briefs_table with columns (id, campaign_id FK UNIQUE, context, objective, audience_demographic, audience_psychographic, main_message, cta, visual_references json, restrictions, auto_saved_at, created_at, updated_at) in backend/database/migrations/
- [ ] T010 Create migration: create_campaign_versions_table with columns (id, campaign_id FK, version_number int, snapshot jsonb, created_at) in backend/database/migrations/
- [ ] T011 Create migration: create_assets_table with columns (id, campaign_id FK, type enum, file_url, file_size bigint, generation_metadata jsonb, created_at, deleted_at) in backend/database/migrations/
- [ ] T012 Create migration: create_project_collaborators_table with columns (id, project_id FK, user_id FK, role enum, invited_at, accepted_at, created_at) in backend/database/migrations/
- [ ] T013 Create migration: create_project_tags_table with columns (id, project_id FK, name string, created_at) in backend/database/migrations/
- [ ] T014 Create migration: add_search_vector_to_projects (add tsvector column + GIN index + trigger for full-text search) in backend/database/migrations/
- [ ] T015 Run migrations: php artisan migrate and verify all tables created in PostgreSQL

### Laravel Models

- [ ] T016 [P] Create Project model in backend/app/Models/Project.php with relationships (belongsTo User, hasMany Campaign, hasMany ProjectCollaborator, hasMany ProjectTag), SoftDeletes trait, fillable fields
- [ ] T017 [P] Create Campaign model in backend/app/Models/Campaign.php with relationships (belongsTo Project, hasOne CampaignBrief, hasMany Asset, hasMany CampaignVersion), casts for json fields (platforms, image_dimensions), SoftDeletes trait
- [ ] T018 [P] Create CampaignBrief model in backend/app/Models/CampaignBrief.php with relationship (belongsTo Campaign), casts for json (visual_references)
- [ ] T019 [P] Create CampaignVersion model in backend/app/Models/CampaignVersion.php with relationship (belongsTo Campaign), cast snapshot to array
- [ ] T020 [P] Create Asset model in backend/app/Models/Asset.php with relationship (belongsTo Campaign), SoftDeletes trait, cast generation_metadata to array
- [ ] T021 [P] Create ProjectCollaborator model in backend/app/Models/ProjectCollaborator.php with relationships (belongsTo Project, belongsTo User)
- [ ] T022 [P] Create ProjectTag model in backend/app/Models/ProjectTag.php with relationship (belongsTo Project)

### Core Services

- [ ] T023 [P] Create StorageQuotaService in backend/app/Services/StorageQuotaService.php with methods: checkQuota(User $user, int $bytes): bool, getUsage(User $user): array
- [ ] T024 [P] Create ProjectPolicy in backend/app/Policies/ProjectPolicy.php with methods: view, update, delete, manage (for owner-only actions)
- [ ] T025 [P] Create CampaignPolicy in backend/app/Policies/CampaignPolicy.php with methods: view, update, delete (check project access via collaborators)

### Frontend Base Types

- [ ] T026 [P] Create TypeScript types in frontend/lib/types/project.ts: Project, ProjectDetail, CreateProjectData, UpdateProjectData, ProjectFilters
- [ ] T027 [P] Create TypeScript types in frontend/lib/types/campaign.ts: Campaign, CampaignDetail, CreateCampaignData, CampaignBrief, BriefDraftData
- [ ] T028 [P] Create TypeScript types in frontend/lib/types/collaborator.ts: Collaborator, CollaboratorRole, AddCollaboratorData

---

## Phase 3: User Story 1 - Create and Organize Projects (P1)

**Goal**: Users can create, list, filter, edit, and archive projects

**Independent Test**: User can create project → appears in list → can filter/paginate → can edit → can archive

**Estimated**: 2-3 days

### Backend API - Projects CRUD

- [ ] T029 [US1] Create StoreProjectRequest in backend/app/Http/Requests/StoreProjectRequest.php with validation rules (name required max:100, description max:500, client max:255, deadline date)
- [ ] T030 [US1] Create UpdateProjectRequest in backend/app/Http/Requests/UpdateProjectRequest.php with validation rules (name max:100, status enum, etc.)
- [ ] T031 [US1] Create ProjectService in backend/app/Services/ProjectService.php with methods: create(User, array): Project (check tier limits), update(Project, array): Project, delete(Project): void (soft delete), restore(Project): Project
- [ ] T032 [US1] Create ProjectResource in backend/app/Http/Resources/ProjectResource.php to format API responses (include campaign_count, tags array)
- [ ] T033 [US1] Create ProjectController in backend/app/Http/Controllers/ProjectController.php with methods: index(Request) (list with pagination, filters), store(StoreProjectRequest), show($id), update($id, UpdateProjectRequest), destroy($id)
- [ ] T034 [US1] Add project routes to backend/routes/api.php: Route::apiResource('projects', ProjectController::class) under auth:sanctum middleware
- [ ] T035 [US1] Implement tier limit check in ProjectService::create() (Free: 5, Pro/Enterprise: unlimited) - throw TierLimitException if exceeded
- [ ] T036 [US1] Implement filtering in ProjectController::index() (status, tags, date ranges) using query scopes
- [ ] T037 [US1] Implement pagination (20 per page) in ProjectController::index() using Laravel paginate()
- [ ] T038 [US1] Add query scope accessibleBy(User) in Project model to filter by user_id OR collaborator records

### Frontend - Projects Pages

- [ ] T039 [P] [US1] Create API client functions in frontend/lib/api/projects.ts: getProjects(filters), createProject(data), getProject(id), updateProject(id, data), deleteProject(id)
- [ ] T040 [P] [US1] Create ProjectListPage component in frontend/app/dashboard/projects/page.tsx with useProjects hook, pagination controls, filter UI
- [ ] T041 [P] [US1] Create ProjectCard component in frontend/components/projects/project-card.tsx showing name, client, status badge, campaign count, last modified date
- [ ] T042 [P] [US1] Create ProjectForm component in frontend/components/projects/project-form.tsx with fields (name, description, client, deadline), Zod validation schema
- [ ] T043 [P] [US1] Create NewProjectPage in frontend/app/dashboard/projects/new/page.tsx with ProjectForm, submit to createProject API
- [ ] T044 [P] [US1] Create ProjectDetailPage in frontend/app/dashboard/projects/[id]/page.tsx showing project info, campaigns list (placeholder), edit/archive buttons
- [ ] T045 [US1] Implement project filters in ProjectListPage: status dropdown, date pickers, client search input
- [ ] T046 [US1] Implement pagination controls in ProjectListPage: previous/next buttons, page numbers, showing "X-Y of Z results"
- [ ] T047 [US1] Add "Archive Project" button with confirmation dialog in ProjectDetailPage
- [ ] T048 [US1] Show tier limit error toast when Free user tries to create 6th project

### Integration

- [ ] T049 [US1] Test end-to-end: Create project → appears in list → filter by status → paginate → edit project → archive → verify soft delete in database
- [ ] T050 [US1] Test tier limits: Free user cannot create 6th project, Pro user can create unlimited
- [ ] T051 [US1] Verify p95 latency < 500ms for project CRUD operations

---

## Phase 4: User Story 2 - Create and Manage Campaigns (P1)

**Goal**: Users can create campaigns within projects with all required fields

**Independent Test**: User can create campaign in project → campaign appears in project → can edit fields → can duplicate → can delete

**Estimated**: 2-3 days

**Dependencies**: Phase 3 (US1) must be complete

### Backend API - Campaigns CRUD

- [ ] T052 [US2] Create StoreCampaignRequest in backend/app/Http/Requests/StoreCampaignRequest.php with validation (name required, objective enum, briefing 50-2000 chars, platforms array, image_dimensions array)
- [ ] T053 [US2] Create UpdateCampaignRequest in backend/app/Http/Requests/UpdateCampaignRequest.php with validation rules
- [ ] T054 [US2] Create CampaignService in backend/app/Services/CampaignService.php with methods: create(Project, array): Campaign, update(Campaign, array): Campaign, delete(Campaign): void, duplicate(Campaign, ?Project): Campaign
- [ ] T055 [US2] Create CampaignResource in backend/app/Http/Resources/CampaignResource.php to format responses (include asset_count)
- [ ] T056 [US2] Create CampaignController in backend/app/Http/Controllers/CampaignController.php with methods: index($projectId), store($projectId, StoreCampaignRequest), show($id), update($id, UpdateCampaignRequest), destroy($id)
- [ ] T057 [US2] Add campaign routes to backend/routes/api.php: projects/{projectId}/campaigns (index, store), campaigns/{id} (show, update, destroy)
- [ ] T058 [US2] Add duplicate route: POST campaigns/{id}/duplicate in backend/routes/api.php pointing to CampaignController@duplicate
- [ ] T059 [US2] Implement campaign duplication logic in CampaignService: copy all fields, prefix name with "Copy of", optionally move to different project
- [ ] T060 [US2] Implement status enum validation in Campaign model (draft, in_production, completed)

### Frontend - Campaigns Pages

- [ ] T061 [P] [US2] Create API client functions in frontend/lib/api/campaigns.ts: getCampaigns(projectId), createCampaign(projectId, data), getCampaign(id), updateCampaign(id, data), deleteCampaign(id), duplicateCampaign(id, targetProjectId?)
- [ ] T062 [P] [US2] Create CampaignsListPage component in frontend/app/dashboard/projects/[id]/campaigns/page.tsx showing campaigns table/grid
- [ ] T063 [P] [US2] Create CampaignCard component in frontend/components/campaigns/campaign-card.tsx showing name, status badge, platforms, asset count
- [ ] T064 [P] [US2] Create CampaignForm component in frontend/components/campaigns/campaign-form.tsx with fields: name, objective dropdown, target_audience textarea, tone_of_voice input, platforms multi-select, image_dimensions multi-select, briefing textarea (50-2000 chars validation)
- [ ] T065 [P] [US2] Create NewCampaignPage in frontend/app/dashboard/projects/[id]/campaigns/new/page.tsx with CampaignForm
- [ ] T066 [P] [US2] Create CampaignDetailPage in frontend/app/dashboard/projects/[id]/campaigns/[campaignId]/page.tsx showing all campaign details
- [ ] T067 [US2] Create PlatformSelector component in frontend/components/campaigns/platform-selector.tsx with checkboxes for Instagram, Facebook, LinkedIn, TikTok, YouTube, Twitter
- [ ] T068 [US2] Create ImageDimensionsSelector component in frontend/components/campaigns/image-dimensions-selector.tsx with common presets (1080x1080, 1920x1080, 1080x1920)
- [ ] T069 [US2] Add "Duplicate Campaign" button in CampaignDetailPage with modal to select target project
- [ ] T070 [US2] Add "Delete Campaign" button with confirmation dialog in CampaignDetailPage
- [ ] T071 [US2] Add status dropdown in CampaignDetailPage to change campaign status (draft → in_production → completed)

### Integration

- [ ] T072 [US2] Test end-to-end: Create campaign in project → appears in campaign list → edit fields → change status → duplicate to another project → delete campaign
- [ ] T073 [US2] Verify briefing validation: cannot submit with <50 or >2000 characters
- [ ] T074 [US2] Verify platforms and dimensions are saved correctly as JSON arrays

---

## Phase 5: User Story 3 - Structured Briefs with Auto-Save (P1)

**Goal**: Users can create structured campaign briefs with auto-save every 30 seconds

**Independent Test**: User opens brief editor → fills sections → auto-saves after 30 seconds → reload page → data persists

**Estimated**: 2-3 days

**Dependencies**: Phase 4 (US2) must be complete

### Backend API - Brief Management

- [ ] T075 [US3] Create StoreBriefRequest in backend/app/Http/Requests/StoreBriefRequest.php with validation for all brief sections (context, objective, audience_demographic, audience_psychographic, main_message, cta, restrictions)
- [ ] T076 [US3] Create SaveBriefDraftRequest in backend/app/Http/Requests/SaveBriefDraftRequest.php with NO required fields (partial data allowed)
- [ ] T077 [US3] Create CampaignBriefResource in backend/app/Http/Resources/CampaignBriefResource.php
- [ ] T078 [US3] Create CampaignBriefController in backend/app/Http/Controllers/CampaignBriefController.php with methods: saveDraft($campaignId, SaveBriefDraftRequest), update($campaignId, StoreBriefRequest)
- [ ] T079 [US3] Add brief routes to backend/routes/api.php: POST campaigns/{id}/brief/draft (auto-save), PUT campaigns/{id}/brief (full update)
- [ ] T080 [US3] Implement saveDraft logic: CampaignBrief::updateOrCreate() with auto_saved_at timestamp, no validation
- [ ] T081 [US3] Implement full update logic: validate all required fields, update brief with created_at/updated_at

### Backend - File Upload

- [ ] T082 [US3] Create UploadFileRequest in backend/app/Http/Requests/UploadFileRequest.php with validation (file required, max:5120 KB, mimes:jpg,jpeg,png,gif,webp, max 5 files per campaign)
- [ ] T083 [US3] Create FileUploadService in backend/app/Services/FileUploadService.php with methods: upload(UploadedFile, User, Campaign): string (returns S3 URL), validateQuota(User, int $bytes): void
- [ ] T084 [US3] Create FileUploadController in backend/app/Http/Controllers/FileUploadController.php with methods: upload(UploadFileRequest), getQuota()
- [ ] T085 [US3] Add file upload routes: POST /api/files/upload, GET /api/files/quota in backend/routes/api.php
- [ ] T086 [US3] Implement S3 upload in FileUploadService: generate unique path (visual-references/{userId}/{uuid}.{ext}), use Storage::disk('s3')->put()
- [ ] T087 [US3] Implement storage quota check in FileUploadService::validateQuota(): query total file_size from assets + visual_references, compare to tier limit (Free: 100MB, Pro: 5GB, Enterprise: 50GB)
- [ ] T088 [US3] Implement quota display in FileUploadController::getQuota(): return used_bytes, quota_bytes, used_percent, tier

### Frontend - Brief Editor

- [ ] T089 [P] [US3] Create API client functions in frontend/lib/api/briefs.ts: saveDraft(campaignId, draftData), updateBrief(campaignId, briefData)
- [ ] T090 [P] [US3] Create API client functions in frontend/lib/api/uploads.ts: uploadFile(file, campaignId), getQuota()
- [ ] T091 [P] [US3] Create useAutosave hook in frontend/hooks/useAutosave.ts: setInterval 30 seconds, call saveDraft API with debounce
- [ ] T092 [P] [US3] Create BriefEditor component in frontend/components/campaigns/campaign-brief-editor.tsx with sections: context textarea, objective textarea, audience_demographic textarea, audience_psychographic textarea, main_message textarea, cta input, visual_references upload, restrictions textarea
- [ ] T093 [P] [US3] Create FileUploadZone component in frontend/components/uploads/file-upload-zone.tsx with drag-and-drop, file preview, delete uploaded file
- [ ] T094 [P] [US3] Create StorageQuotaIndicator component in frontend/components/uploads/storage-quota-indicator.tsx showing progress bar (used/total MB), tier label
- [ ] T095 [US3] Integrate useAutosave hook in BriefEditor: trigger auto-save every 30 seconds when form has changes
- [ ] T096 [US3] Implement file upload in FileUploadZone: call uploadFile API, validate size (5MB), show upload progress, add S3 URL to visual_references array
- [ ] T097 [US3] Show "Last saved at HH:MM:SS" indicator in BriefEditor after each auto-save
- [ ] T098 [US3] Validate max 5 files in FileUploadZone: disable upload button when 5 files uploaded, show error toast
- [ ] T099 [US3] Show storage quota exceeded error when upload fails with 403 response

### Integration

- [ ] T100 [US3] Test end-to-end: Open brief editor → fill context → wait 30 seconds → verify auto-save → reload page → data persists
- [ ] T101 [US3] Test file upload: Upload JPG file → appears in visual_references → delete file → verify removed from S3
- [ ] T102 [US3] Test storage quota: Free user uploads files totaling >100MB → upload fails with quota error
- [ ] T103 [US3] Verify auto-save operation completes in <200ms (SC success criteria)

---

## Phase 6: User Story 4 - Role-Based Collaboration (P2)

**Goal**: Project owners can add collaborators with roles (Owner/Editor/Viewer)

**Independent Test**: Owner adds collaborator → email sent → collaborator accepts → has appropriate permissions → owner can remove

**Estimated**: 2-3 days

**Dependencies**: Phase 2 (Foundational) - can start independently of US1-3

### Backend API - Collaboration

- [ ] T104 [US4] Create AddCollaboratorRequest in backend/app/Http/Requests/AddCollaboratorRequest.php with validation (email required, role enum:editor,viewer)
- [ ] T105 [US4] Create CollaboratorService in backend/app/Services/CollaboratorService.php with methods: invite(Project, string $email, string $role): ProjectCollaborator, remove(ProjectCollaborator): void, updateRole(ProjectCollaborator, string $role): void, transferOwnership(Project, User): void
- [ ] T106 [US4] Create CollaboratorResource in backend/app/Http/Resources/CollaboratorResource.php
- [ ] T107 [US4] Create CollaboratorController in backend/app/Http/Controllers/CollaboratorController.php with methods: index($projectId), store($projectId, AddCollaboratorRequest), update($projectId, $collaboratorId), destroy($projectId, $collaboratorId)
- [ ] T108 [US4] Add collaboration routes: GET/POST projects/{projectId}/collaborators, PUT/DELETE projects/{projectId}/collaborators/{id}, POST projects/{projectId}/transfer-ownership in backend/routes/api.php
- [ ] T109 [US4] Implement tier limit check in CollaboratorService::invite() (Free: 0, Pro: 5, Enterprise: unlimited)
- [ ] T110 [US4] Create CollaboratorInvitation mailable in backend/app/Mail/CollaboratorInvitation.php with project details, role, acceptance link
- [ ] T111 [US4] Send email in CollaboratorService::invite() using Mail::to($email)->send(new CollaboratorInvitation())
- [ ] T112 [US4] Implement ownership transfer in CollaboratorService::transferOwnership(): set old owner to editor role, set new owner to owner role
- [ ] T113 [US4] Update ProjectPolicy to check collaborator roles: view (any role), update (owner/editor), delete (owner only), manage (owner only)

### Frontend - Collaboration UI

- [ ] T114 [P] [US4] Create API client functions in frontend/lib/api/collaborators.ts: getCollaborators(projectId), addCollaborator(projectId, data), updateRole(projectId, collaboratorId, role), removeCollaborator(projectId, collaboratorId), transferOwnership(projectId, newOwnerId)
- [ ] T115 [P] [US4] Create CollaboratorList component in frontend/components/collaborators/collaborator-list.tsx showing table with email, name, role badge, actions (change role, remove)
- [ ] T116 [P] [US4] Create AddCollaboratorForm component in frontend/components/collaborators/add-collaborator-form.tsx with email input, role dropdown (Editor/Viewer)
- [ ] T117 [P] [US4] Create RoleSelector component in frontend/components/collaborators/role-selector.tsx with dropdown (Owner/Editor/Viewer)
- [ ] T118 [US4] Add "Manage Collaborators" section to ProjectDetailPage with CollaboratorList and AddCollaboratorForm
- [ ] T119 [US4] Show tier limit error when Pro user tries to add 6th collaborator
- [ ] T120 [US4] Add "Transfer Ownership" button in CollaboratorList for owner, with confirmation dialog
- [ ] T121 [US4] Implement role-based UI restrictions: hide "Manage Collaborators" for non-owners, hide "Edit" buttons for viewers
- [ ] T122 [US4] Show pending invitations with "Pending" badge in CollaboratorList (accepted_at IS NULL)

### Integration

- [ ] T123 [US4] Test end-to-end: Owner adds editor → email sent → editor accepts → can edit campaigns → owner changes role to viewer → editor can only view → owner removes collaborator → access revoked
- [ ] T124 [US4] Test tier limits: Free user cannot add any collaborators, Pro user can add 5
- [ ] T125 [US4] Test ownership transfer: Owner transfers to editor → new owner can manage collaborators → old owner is now editor

---

## Phase 7: User Story 5 - Tags and Advanced Search (P2)

**Goal**: Users can tag projects and search with full-text search (<300ms)

**Independent Test**: User adds tags → filters by tag → searches by name/description/client → results in <300ms

**Estimated**: 1-2 days

**Dependencies**: Phase 2 (Foundational) - can start independently of US1-4

### Backend API - Tags & Search

- [ ] T126 [US5] Create ProjectTagController in backend/app/Http/Controllers/ProjectTagController.php with methods: index($projectId), store($projectId, Request), destroy($projectId, $tagId)
- [ ] T127 [US5] Add tag routes: GET/POST projects/{projectId}/tags, DELETE projects/{projectId}/tags/{id} in backend/routes/api.php
- [ ] T128 [US5] Implement tag creation in ProjectTagController::store(): create ProjectTag with name validation (max 50 chars)
- [ ] T129 [US5] Add search endpoint: GET /api/projects/search?q={query} in ProjectController with full-text search using PostgreSQL tsvector
- [ ] T130 [US5] Implement full-text search in ProjectController::search(): query using whereRaw("search_vector @@ plainto_tsquery('english', ?)", [$query]), order by ts_rank
- [ ] T131 [US5] Verify GIN index on search_vector column exists (from migration T014)
- [ ] T132 [US5] Implement tag filtering in ProjectController::index(): accept tags[] query param, filter using whereHas('tags', function($q) use ($tags) { $q->whereIn('name', $tags); })

### Frontend - Search & Tags UI

- [ ] T133 [P] [US5] Create API client functions in frontend/lib/api/tags.ts: getTags(projectId), addTag(projectId, name), removeTag(projectId, tagId)
- [ ] T134 [P] [US5] Update projects.ts API client with searchProjects(query) function
- [ ] T135 [P] [US5] Create SearchBar component in frontend/components/projects/search-bar.tsx with debounced input (300ms delay)
- [ ] T136 [P] [US5] Create TagInput component in frontend/components/projects/tag-input.tsx for adding tags to project
- [ ] T137 [P] [US5] Create TagFilter component in frontend/components/projects/tag-filter.tsx showing all user's tags as clickable chips
- [ ] T138 [US5] Add SearchBar to ProjectListPage header
- [ ] T139 [US5] Add TagFilter to ProjectListPage sidebar showing all available tags
- [ ] T140 [US5] Implement search: on input change, debounce 300ms, call searchProjects API, update project list
- [ ] T141 [US5] Implement tag filtering: on tag click, add to filters, call getProjects with tags[] param, update list
- [ ] T142 [US5] Show active filters (search query + selected tags) with "Clear" button in ProjectListPage
- [ ] T143 [US5] Add tag badges to ProjectCard showing project's tags

### Integration

- [ ] T144 [US5] Test end-to-end: Add tags to project → filter by tag → projects with that tag appear → search by name → results appear in <300ms
- [ ] T145 [US5] Test combined filters: search "campaign" + filter by tag "urgent" + filter by status "active" → correct intersection shown
- [ ] T146 [US5] Verify p95 latency <300ms for search queries (SC-005)

---

## Phase 8: User Story 6 - Project Statistics (P3)

**Goal**: Display aggregate statistics (campaign count, asset count, generation time)

**Independent Test**: View project → statistics section shows correct counts → add campaign → statistics update

**Estimated**: 1 day

**Dependencies**: Phase 3 (US1), Phase 4 (US2) - needs Project, Campaign, Asset entities

### Backend API - Statistics

- [ ] T147 [US6] Add statistics calculation in ProjectController::show(): aggregate campaigns count, assets count, avg generation time from assets.generation_metadata
- [ ] T148 [US6] Implement storage usage calculation: sum file_size from assets where project_id = ?
- [ ] T149 [US6] Add credit/token usage tracking (Pro/Enterprise only): sum tokens from generation_metadata where project_id = ?

### Frontend - Statistics Display

- [ ] T150 [P] [US6] Create ProjectStats component in frontend/components/projects/project-stats.tsx showing cards: total campaigns, total assets, avg generation time, storage used, credit usage (if Pro/Enterprise)
- [ ] T151 [US6] Add ProjectStats to ProjectDetailPage below project info
- [ ] T152 [US6] Implement real-time statistics update: when campaign/asset added, refresh statistics

### Integration

- [ ] T153 [US6] Test end-to-end: View project statistics → add campaign → add assets → statistics update correctly → verify counts match database

---

## Phase 9: User Story 7 - Export and Archive (P3)

**Goal**: Export projects as JSON, archive/restore projects with 30-day window

**Independent Test**: Export project → JSON file downloaded → archive project → restore within 30 days → works

**Estimated**: 1 day

**Dependencies**: Phase 3 (US1), Phase 4 (US2), Phase 5 (US3) - needs all entities complete

### Backend API - Export & Archive

- [ ] T154 [US7] Implement export in ProjectController::export($id): return JSON with project, all campaigns, all briefs, all assets metadata
- [ ] T155 [US7] Implement restore in ProjectService::restore(Project): check deleted_at within 30 days, set deleted_at = null
- [ ] T156 [US7] Add export route: GET /api/projects/{id}/export in backend/routes/api.php
- [ ] T157 [US7] Add restore route: POST /api/projects/{id}/restore in backend/routes/api.php
- [ ] T158 [US7] Create scheduled job: CleanupArchivedProjects in backend/app/Console/Commands/ to permanently delete projects where deleted_at < 30 days ago

### Frontend - Export & Archive UI

- [ ] T159 [P] [US7] Update projects.ts API client with exportProject(id), restoreProject(id) functions
- [ ] T160 [US7] Add "Export Project" button in ProjectDetailPage that downloads JSON file
- [ ] T161 [US7] Show "Archived" section in ProjectListPage with archived projects (deleted_at NOT NULL)
- [ ] T162 [US7] Add "Restore" button in archived project cards (if within 30-day window)
- [ ] T163 [US7] Show countdown timer in archived projects: "Will be permanently deleted in X days"

### Integration

- [ ] T164 [US7] Test end-to-end: Export project → verify JSON contains all data → archive project → appears in archived section → restore → returns to active → wait >30 days → permanently deleted
- [ ] T165 [US7] Verify export completes in <10 seconds for project with <100 campaigns (SC-008)

---

## Phase 10: Polish & Cross-Cutting Concerns

**Goal**: Testing, performance optimization, error handling, documentation

**Estimated**: 2-3 days

### Backend - Testing & Optimization

- [ ] T166 [P] Create ProjectManagementTest in backend/tests/Feature/ProjectManagementTest.php testing: create, list, update, delete, tier limits
- [ ] T167 [P] Create CampaignManagementTest in backend/tests/Feature/CampaignManagementTest.php testing: create in project, update, duplicate, delete
- [ ] T168 [P] Create CollaborationTest in backend/tests/Feature/CollaborationTest.php testing: add collaborator, role permissions, remove, ownership transfer
- [ ] T169 [P] Create FileUploadTest in backend/tests/Feature/FileUploadTest.php testing: upload file, quota enforcement, file validation
- [ ] T170 [P] Create TierLimitsTest in backend/tests/Feature/TierLimitsTest.php testing all tier limits (projects, collaborators, storage)
- [ ] T171 Run php artisan test --coverage and verify 80%+ coverage
- [ ] T172 Add database indexes for performance: index on (project_id, deleted_at) in campaigns, (campaign_id, deleted_at) in assets, (project_id, role) in project_collaborators
- [ ] T173 Implement Redis caching for project lists in ProjectController::index() with cache invalidation on create/update/delete

### Frontend - Testing & Polish

- [ ] T174 [P] Create project-workflow.test.tsx in frontend/tests/integration/ testing full project creation flow
- [ ] T175 [P] Create campaign-workflow.test.tsx testing campaign creation and brief editing
- [ ] T176 [P] Create collaboration.test.tsx testing collaborator invitation flow
- [ ] T177 Add loading states to all async operations (buttons show Loader2 icon, skeleton loaders for lists)
- [ ] T178 Add error boundaries to all major pages (ProjectListPage, CampaignDetailPage, BriefEditor)
- [ ] T179 Implement toast notifications for all actions: success (green), error (red), info (blue) using existing toast system
- [ ] T180 Add form validation error messages (inline red text below fields) for all forms

### Documentation & Deployment

- [ ] T181 Update API_DOCUMENTATION.md with new endpoints (projects, campaigns, collaborators, files)
- [ ] T182 Update README.md with feature overview and setup instructions
- [ ] T183 Create database seed file with sample projects/campaigns for development: php artisan make:seeder ProjectsSeeder
- [ ] T184 Verify all migrations run cleanly: php artisan migrate:fresh --seed
- [ ] T185 Run full E2E test suite: Create project → add campaign → add brief → upload files → add collaborator → search → export → archive
- [ ] T186 Performance audit: Verify all p95 latency targets met (300ms search, 500ms CRUD, 200ms auto-save)
- [ ] T187 Create pull request with all changes, reference feature spec and plan documents

---

## Summary

**Total Tasks**: 187  
**By User Story**:
- Setup: 6 tasks
- Foundational: 22 tasks (blocking)
- US1 (Projects): 23 tasks
- US2 (Campaigns): 23 tasks
- US3 (Briefs): 29 tasks
- US4 (Collaboration): 22 tasks
- US5 (Search/Tags): 21 tasks
- US6 (Statistics): 7 tasks
- US7 (Export/Archive): 12 tasks
- Polish: 22 tasks

**MVP Scope** (US1-3): 77 tasks (~5-7 days with 1 developer, ~3-4 days with 2-3 developers in parallel)

**Full Feature** (US1-7): 187 tasks (~12-15 days with 1 developer, ~7-9 days with team in parallel)

**Parallel Opportunities**: 
- Setup: Sequential
- Foundational: Models (T016-T022) can be done in parallel
- US1: Backend (T029-T038) and Frontend (T039-T048) can be parallel
- US2: Backend and Frontend can be parallel
- US3: Backend and Frontend can be parallel
- US4: Independent of US1-3, can start after Foundational
- US5: Independent of US1-4, can start after Foundational

**Critical Path**: Setup → Foundational → US1 → US2 → US3 (MVP) → US4 → US5 → US6 → US7 → Polish

---

## Next Steps

1. Review and approve task breakdown
2. Assign tasks to team members based on parallel opportunities
3. Start with Phase 1 (Setup) to verify environment
4. Complete Phase 2 (Foundational) - blocking for all user stories
5. Implement MVP (US1, US2, US3) - can parallelize backend/frontend work
6. Continue with P2/P3 features incrementally
7. Complete Polish phase before merging to develop branch

**Ready to begin implementation!** 🚀
