# Quickstart Guide: Projects & Campaigns Feature

**Feature**: Digital Media Projects and Campaigns Management  
**Branch**: `003-projects-campaigns`  
**Target Audience**: Developers implementing this feature

## Overview

This feature adds a complete project and campaign management system to the CreativeAI Agent platform. Users can create projects, organize campaigns within projects, collaborate with team members, and manage AI-generated assets.

**Key Capabilities**:
- Hierarchical structure: Project → Campaign → Asset
- Role-based collaboration (Owner/Editor/Viewer)
- Tier-based limits (Free/Pro/Enterprise)
- Auto-save for campaign briefs
- File upload with storage quotas
- Full-text search and tagging

---

## Prerequisites

Before starting implementation, ensure you have:

1. ✅ Feature 002 (User Authentication) complete and working
2. ✅ PostgreSQL 14+ running in Docker
3. ✅ Redis running (for caching)
4. ✅ S3-compatible storage configured (AWS S3 or MinIO for local dev)
5. ✅ Laravel 11+ backend
6. ✅ Next.js 16+ frontend
7. ✅ Email service configured (Resend)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                  │
│  /dashboard/projects → ProjectsList                     │
│  /dashboard/projects/[id] → ProjectDetail               │
│  /dashboard/projects/[id]/campaigns/[cid] → Campaign    │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP + JWT Bearer Token
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Backend API (Laravel)                       │
│  Routes:                                                 │
│    GET  /api/v1/projects           (list)               │
│    POST /api/v1/projects           (create)             │
│    GET  /api/v1/projects/{id}      (detail)             │
│    POST /api/v1/projects/{id}/campaigns                 │
│    POST /api/v1/files/upload       (visual references)  │
│                                                          │
│  Services:                                               │
│    ProjectService → business logic                       │
│    CampaignService → campaign CRUD                       │
│    StorageQuotaService → quota enforcement               │
│                                                          │
│  Models: Project, Campaign, CampaignBrief, Asset, etc.  │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
    ┌────▼────┐   ┌────▼────┐   ┌───▼────┐
    │PostgreSQL│   │  Redis  │   │   S3   │
    │ (data)  │   │ (cache) │   │(files) │
    └─────────┘   └─────────┘   └────────┘
```

---

## Implementation Phases

### Phase 1: Database & Models (Days 1-2)

**Goal**: Create database structure and Laravel models

1. **Run migrations** (in order):
   ```bash
   cd backend
   php artisan make:migration create_projects_table
   php artisan make:migration create_campaigns_table
   php artisan make:migration create_campaign_briefs_table
   php artisan make:migration create_campaign_versions_table
   php artisan make:migration create_assets_table
   php artisan make:migration create_project_collaborators_table
   php artisan make:migration create_project_tags_table
   php artisan make:migration add_search_vector_to_projects
   ```

2. **Create Eloquent models** with relationships:
   ```bash
   php artisan make:model Project
   php artisan make:model Campaign
   php artisan make:model CampaignBrief
   php artisan make:model CampaignVersion
   php artisan make:model Asset
   php artisan make:model ProjectCollaborator
   php artisan make:model ProjectTag
   ```

3. **Define relationships** in models (see data-model.md for ERD)

4. **Test migrations**:
   ```bash
   php artisan migrate:fresh
   php artisan tinker
   >>> Project::factory()->count(5)->create()
   ```

**Reference**: `specs/003-projects-campaigns/data-model.md`

---

### Phase 2: Backend API - Projects CRUD (Days 3-4)

**Goal**: Implement core project endpoints

1. **Create controller**:
   ```bash
   php artisan make:controller ProjectController --api
   ```

2. **Create form requests** (validation):
   ```bash
   php artisan make:request StoreProjectRequest
   php artisan make:request UpdateProjectRequest
   ```

3. **Create service layer**:
   ```bash
   php artisan make:class Services/ProjectService
   ```

4. **Implement routes** in `routes/api.php`:
   ```php
   Route::middleware('auth:sanctum')->group(function () {
       Route::apiResource('projects', ProjectController::class);
       Route::post('projects/{id}/duplicate', [ProjectController::class, 'duplicate']);
       Route::get('projects/{id}/export', [ProjectController::class, 'export']);
       Route::get('projects/search', [ProjectController::class, 'search']);
   });
   ```

5. **Write feature tests**:
   ```bash
   php artisan make:test ProjectManagementTest
   ```

**Success Criteria**:
- ✅ `POST /api/v1/projects` creates project
- ✅ `GET /api/v1/projects` returns paginated list
- ✅ `GET /api/v1/projects/{id}` returns project details
- ✅ `PUT /api/v1/projects/{id}` updates project
- ✅ `DELETE /api/v1/projects/{id}` soft-deletes project
- ✅ Tier limits enforced (Free: 5 projects)

**Reference**: `specs/003-projects-campaigns/contracts/projects-api.yaml`

---

### Phase 3: Backend API - Campaigns (Days 5-6)

**Goal**: Implement campaign endpoints and brief auto-save

1. **Create controller & requests**:
   ```bash
   php artisan make:controller CampaignController --api
   php artisan make:controller CampaignBriefController
   php artisan make:request StoreCampaignRequest
   ```

2. **Create service**:
   ```bash
   php artisan make:class Services/CampaignService
   ```

3. **Implement routes**:
   ```php
   Route::get('projects/{projectId}/campaigns', [CampaignController::class, 'index']);
   Route::post('projects/{projectId}/campaigns', [CampaignController::class, 'store']);
   Route::put('campaigns/{id}', [CampaignController::class, 'update']);
   Route::post('campaigns/{id}/duplicate', [CampaignController::class, 'duplicate']);
   
   // Brief auto-save endpoint
   Route::post('campaigns/{id}/brief/draft', [CampaignBriefController::class, 'saveDraft']);
   ```

4. **Test auto-save** with 30-second frontend intervals

**Success Criteria**:
- ✅ Create campaign with all fields
- ✅ Brief auto-saves every 30 seconds
- ✅ Briefing validation (50-2000 chars)
- ✅ Campaign duplication works

**Reference**: `specs/003-projects-campaigns/contracts/campaigns-api.yaml`

---

### Phase 4: File Uploads & Storage Quotas (Day 7)

**Goal**: Implement file upload with S3 and quota enforcement

1. **Configure S3 driver** in `config/filesystems.php`:
   ```php
   's3' => [
       'driver' => 's3',
       'key' => env('AWS_ACCESS_KEY_ID'),
       'secret' => env('AWS_SECRET_ACCESS_KEY'),
       'region' => env('AWS_DEFAULT_REGION'),
       'bucket' => env('AWS_BUCKET'),
   ],
   ```

2. **Create upload service**:
   ```bash
   php artisan make:class Services/FileUploadService
   php artisan make:class Services/StorageQuotaService
   ```

3. **Implement upload endpoint**:
   ```php
   Route::post('files/upload', [FileUploadController::class, 'upload']);
   Route::get('files/quota', [FileUploadController::class, 'quota']);
   ```

4. **Test quota enforcement**:
   - Free tier: 100MB limit
   - Upload exceeding quota should return 403

**Success Criteria**:
- ✅ Upload JPG/PNG/GIF/WebP files (5MB max)
- ✅ Storage quota calculated correctly
- ✅ Uploads rejected when quota exceeded
- ✅ Files stored in S3 with unique paths

**Reference**: `specs/003-projects-campaigns/research.md` (Section 3)

---

### Phase 5: Collaboration (Days 8-9)

**Goal**: Implement role-based project collaboration

1. **Create controller**:
   ```bash
   php artisan make:controller CollaboratorController
   php artisan make:class Services/CollaboratorService
   ```

2. **Create email notification**:
   ```bash
   php artisan make:mail CollaboratorInvitation
   ```

3. **Implement routes**:
   ```php
   Route::get('projects/{projectId}/collaborators', [CollaboratorController::class, 'index']);
   Route::post('projects/{projectId}/collaborators', [CollaboratorController::class, 'store']);
   Route::delete('projects/{projectId}/collaborators/{id}', [CollaboratorController::class, 'destroy']);
   ```

4. **Create Policy** for authorization:
   ```bash
   php artisan make:policy ProjectPolicy
   ```

5. **Test role permissions**:
   - Owner: Full control
   - Editor: Can't manage collaborators
   - Viewer: Read-only

**Success Criteria**:
- ✅ Add collaborator sends email
- ✅ Tier limits enforced (Free: 0, Pro: 5)
- ✅ Role-based access works
- ✅ Remove collaborator revokes access immediately

**Reference**: `specs/003-projects-campaigns/contracts/collaborators-files-api.yaml`

---

### Phase 6: Frontend - Project List & Creation (Days 10-12)

**Goal**: Build frontend project management UI

1. **Create API client** in `frontend/lib/api/projects.ts`:
   ```typescript
   export async function getProjects(params: ProjectFilters) {
     return client.get('/projects', { params });
   }
   
   export async function createProject(data: CreateProjectData) {
     return client.post('/projects', data);
   }
   ```

2. **Create pages**:
   - `app/dashboard/projects/page.tsx` (list view)
   - `app/dashboard/projects/new/page.tsx` (create form)
   - `app/dashboard/projects/[id]/page.tsx` (detail view)

3. **Create components**:
   ```
   components/projects/
   ├── project-list.tsx
   ├── project-card.tsx
   ├── project-form.tsx
   └── project-filters.tsx
   ```

4. **Implement features**:
   - Pagination (20 per page)
   - Filtering by status, tags
   - Sorting (created_at, name, updated_at)
   - Search bar with debounce

**Success Criteria**:
- ✅ List shows user's projects
- ✅ Create project form validates input
- ✅ Filters and search work
- ✅ Pagination navigates correctly

---

### Phase 7: Frontend - Campaigns & Brief Editor (Days 13-15)

**Goal**: Build campaign management and brief editor with auto-save

1. **Create API client** in `frontend/lib/api/campaigns.ts`

2. **Create pages**:
   - `app/dashboard/projects/[id]/campaigns/page.tsx`
   - `app/dashboard/projects/[id]/campaigns/[cid]/page.tsx`

3. **Create components**:
   ```
   components/campaigns/
   ├── campaign-list.tsx
   ├── campaign-form.tsx
   ├── campaign-brief-editor.tsx  ← Auto-save logic here
   └── platform-selector.tsx
   ```

4. **Implement auto-save hook**:
   ```typescript
   // hooks/useAutosave.ts
   export function useAutosave(campaignId: string, briefData: BriefData) {
     useEffect(() => {
       const interval = setInterval(async () => {
         await saveDraft(campaignId, briefData);
       }, 30000); // 30 seconds
       return () => clearInterval(interval);
     }, [campaignId, briefData]);
   }
   ```

**Success Criteria**:
- ✅ Create campaign with all fields
- ✅ Brief editor auto-saves every 30 seconds
- ✅ Visual references upload (drag-and-drop)
- ✅ Campaign status updates

---

### Phase 8: Testing & Polish (Days 16-17)

**Goal**: Comprehensive testing and bug fixes

1. **Backend tests**:
   ```bash
   php artisan test --coverage
   ```
   - Target: 80%+ coverage
   - Test all success criteria from spec

2. **Frontend tests**:
   ```bash
   cd frontend
   npm test
   ```
   - Test key user flows
   - Test auto-save logic

3. **Performance testing**:
   - Verify p95 latency < 300ms (search, list)
   - Verify p95 latency < 500ms (CRUD)

4. **Polish**:
   - Error messages user-friendly
   - Loading states on all async operations
   - Success toasts on actions

---

## Development Environment Setup

### Backend (.env additions)

```bash
# S3 Storage
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=creativeai-assets

# Storage Quotas (bytes)
STORAGE_QUOTA_FREE=104857600      # 100MB
STORAGE_QUOTA_PRO=5368709120      # 5GB
STORAGE_QUOTA_ENTERPRISE=53687091200  # 50GB

# Project Limits
PROJECT_LIMIT_FREE=5
PROJECT_LIMIT_PRO=999999
PROJECT_LIMIT_ENTERPRISE=999999

# Collaborator Limits
COLLABORATOR_LIMIT_FREE=0
COLLABORATOR_LIMIT_PRO=5
COLLABORATOR_LIMIT_ENTERPRISE=999999
```

### Local S3 with MinIO (Docker Compose)

```yaml
# Add to backend/docker-compose.yml
minio:
  image: minio/minio
  ports:
    - "9000:9000"
    - "9001:9001"
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin
  command: server /data --console-address ":9001"
  volumes:
    - minio_data:/data

volumes:
  minio_data:
```

Then access MinIO console at `http://localhost:9001` and create bucket `creativeai-assets`.

---

## Testing Checklist

Use this checklist to verify implementation:

### Backend API
- [ ] All migrations run without errors
- [ ] Models have correct relationships
- [ ] Projects CRUD endpoints work
- [ ] Campaigns CRUD endpoints work
- [ ] Brief auto-save endpoint works
- [ ] File upload validates size/format/quota
- [ ] Collaborator endpoints work
- [ ] Tier limits enforced correctly
- [ ] Search returns results in <300ms
- [ ] PHPUnit tests pass with 80%+ coverage

### Frontend
- [ ] Project list displays and paginates
- [ ] Project creation form validates
- [ ] Project filters and search work
- [ ] Campaign creation works
- [ ] Brief editor auto-saves every 30 seconds
- [ ] File upload works with drag-and-drop
- [ ] Collaborator management UI works
- [ ] Storage quota displayed accurately
- [ ] Error messages are user-friendly

### Integration
- [ ] JWT authentication works on all endpoints
- [ ] Email notifications sent for collaborators
- [ ] Files stored in S3 correctly
- [ ] Soft deletes work with recovery window
- [ ] Version history creates snapshots (Enterprise)

---

## Common Issues & Solutions

### Issue: Migrations fail with foreign key constraint error
**Solution**: Check migration order. Projects must exist before campaigns.

### Issue: File upload returns 500 error
**Solution**: Verify S3 credentials in `.env` and bucket exists.

### Issue: Search queries are slow (>300ms)
**Solution**: Ensure GIN index on `search_vector` column exists. Run `ANALYZE projects;` in PostgreSQL.

### Issue: Auto-save doesn't work
**Solution**: Check browser console for errors. Verify `POST /campaigns/{id}/brief/draft` endpoint exists and returns 200.

### Issue: Tier limits not enforced
**Solution**: Verify user model has `tier` field populated correctly (from feature 002).

---

## API Documentation

Full OpenAPI 3.0 specifications available in:
- `specs/003-projects-campaigns/contracts/projects-api.yaml`
- `specs/003-projects-campaigns/contracts/campaigns-api.yaml`
- `specs/003-projects-campaigns/contracts/collaborators-files-api.yaml`

Import these into Swagger UI or Postman for interactive testing.

---

## Next Steps After Implementation

1. ✅ Complete `/speckit.tasks` to break down into granular tasks
2. Implement Phase 1 (Database & Models)
3. Implement Phase 2 (Projects API)
4. Continue through phases sequentially
5. Run full test suite before merging to `develop`

**Questions?** Refer to:
- `specs/003-projects-campaigns/spec.md` (requirements)
- `specs/003-projects-campaigns/research.md` (technical decisions)
- `specs/003-projects-campaigns/data-model.md` (database schema)
