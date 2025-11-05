# Research & Technical Decisions

**Feature**: Digital Media Projects and Campaigns Management  
**Branch**: 003-projects-campaigns  
**Date**: 2025-11-05

## Overview

This document resolves technical unknowns identified during planning and establishes patterns/best practices for implementation.

---

## Research Tasks

### 1. Health Check Endpoint Extension

**Question**: Should `/api/health` be extended to monitor new project/campaign entities?

**Decision**: Yes, extend existing health check with optional database connectivity tests

**Rationale**: 
- Existing `/api/health` endpoint likely checks database, Redis, and basic service status
- Adding a lightweight query (e.g., `SELECT COUNT(*) FROM projects WHERE deleted_at IS NULL`) ensures new tables are accessible
- Health check remains fast (<100ms) with count-only queries
- Orchestration systems (K8s, load balancers) rely on this for routing decisions

**Implementation**:
```php
// backend/app/Http/Controllers/HealthController.php
public function check() {
    $checks = [
        'database' => DB::connection()->getPdo() !== null,
        'redis' => Redis::ping(),
        'projects_table' => DB::table('projects')->whereNull('deleted_at')->count() >= 0,
    ];
    return response()->json(['status' => 'healthy', 'checks' => $checks]);
}
```

**Alternatives Considered**:
- Skip extension: Risk undetected migration failures
- Deep health checks: Too slow, defeats purpose of fast health endpoint

---

### 2. APM Instrumentation

**Question**: Is APM (Application Performance Monitoring) already configured, or does it need setup?

**Decision**: Assume basic Laravel logging exists; add custom performance tracking for critical paths

**Rationale**:
- Constitution requires APM on critical paths (Section VIII)
- Laravel provides built-in logging to `storage/logs/laravel.log`
- For MVP, use Laravel's `Log::info()` with timing data (start/end timestamps) on slow operations
- Post-MVP: Integrate dedicated APM (New Relic, Datadog, Scout APM)

**Implementation**:
```php
// Track performance in services
$startTime = microtime(true);
$result = $this->executeOperation();
$duration = (microtime(true) - $startTime) * 1000; // ms

Log::info('Project created', [
    'user_id' => $userId,
    'project_id' => $projectId,
    'duration_ms' => $duration,
    'timestamp' => now()
]);
```

**Success Criteria**: Log entries enable post-hoc analysis of p95 latency (SC-004, SC-005, SC-012)

**Alternatives Considered**:
- Full APM service (New Relic): Adds cost, complexity; overkill for MVP
- No instrumentation: Violates constitution monitoring requirement

---

### 3. File Upload Handling with S3

**Question**: What's the best pattern for Laravel file uploads to S3-compatible storage?

**Decision**: Use Laravel's Filesystem abstraction with S3 driver + chunked uploads for large files

**Rationale**:
- Laravel's `Storage` facade abstracts filesystem operations (local/S3 interchangeable)
- S3 driver configured via `config/filesystems.php` with AWS SDK
- Validation happens before upload (FR-046: 5MB max, 5 files, specific formats)
- Generate pre-signed URLs for direct frontend-to-S3 uploads (reduces backend load)

**Implementation Pattern**:
```php
// backend/app/Services/FileUploadService.php
public function upload(UploadedFile $file, int $userId): string {
    // Validate
    if ($file->getSize() > 5 * 1024 * 1024) {
        throw new ValidationException('File exceeds 5MB limit');
    }
    
    // Check storage quota
    $quotaService = app(StorageQuotaService::class);
    $quotaService->checkAndReserve($userId, $file->getSize());
    
    // Upload with unique path
    $path = 'visual-references/' . $userId . '/' . Str::uuid() . '.' . $file->extension();
    Storage::disk('s3')->put($path, file_get_contents($file), 'public');
    
    return Storage::disk('s3')->url($path);
}
```

**Configuration**:
```php
// config/filesystems.php
's3' => [
    'driver' => 's3',
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'bucket' => env('AWS_BUCKET'),
],
```

**Alternatives Considered**:
- Local storage: Doesn't scale, violates constitution (S3-compatible required)
- Direct S3 uploads without backend: Skips quota validation, security checks

---

### 4. Multi-Tenant Project Collaboration Patterns

**Question**: How to efficiently enforce role-based access (Owner/Editor/Viewer) in queries?

**Decision**: Use Laravel Policy classes + eager loading of collaborator relationships

**Rationale**:
- Laravel Policies centralize authorization logic per model
- Query scopes filter projects based on user's collaborator records
- Eager loading prevents N+1 queries when checking access for lists

**Implementation Pattern**:
```php
// backend/app/Policies/ProjectPolicy.php
class ProjectPolicy {
    public function view(User $user, Project $project): bool {
        return $project->collaborators()
            ->where('user_id', $user->id)
            ->whereIn('role', ['owner', 'editor', 'viewer'])
            ->exists();
    }
    
    public function update(User $user, Project $project): bool {
        return $project->collaborators()
            ->where('user_id', $user->id)
            ->whereIn('role', ['owner', 'editor'])
            ->exists();
    }
}

// backend/app/Models/Project.php
public function scopeAccessibleBy($query, User $user) {
    return $query->whereHas('collaborators', function($q) use ($user) {
        $q->where('user_id', $user->id);
    });
}
```

**Usage in Controller**:
```php
$projects = Project::with('collaborators')
    ->accessibleBy(auth()->user())
    ->paginate(20);
```

**Alternatives Considered**:
- Middleware-based checks: Doesn't scale for list endpoints
- Database views: Less flexible, harder to test

---

### 5. Auto-Save Implementation (30-Second Drafts)

**Question**: How to implement FR-018 (auto-save brief drafts every 30 seconds)?

**Decision**: Frontend-driven debounced POST to dedicated `/api/campaigns/{id}/brief/draft` endpoint

**Rationale**:
- Frontend controls timing (JavaScript `setInterval` + debounce on user input)
- Separate draft endpoint vs. full update (avoids validation failures on incomplete data)
- Backend stores draft in `campaign_briefs` table with `auto_saved_at` timestamp
- Upsert pattern (update if exists, insert if not)

**Implementation Pattern**:

Frontend:
```typescript
// frontend/lib/hooks/useAutosave.ts
export function useAutosave(campaignId: string, briefData: BriefData) {
  useEffect(() => {
    const interval = setInterval(async () => {
      if (briefData.hasChanges) {
        await fetch(`/api/campaigns/${campaignId}/brief/draft`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(briefData)
        });
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [campaignId, briefData]);
}
```

Backend:
```php
// backend/app/Http/Controllers/CampaignBriefController.php
public function saveDraft(Request $request, int $campaignId) {
    CampaignBrief::updateOrCreate(
        ['campaign_id' => $campaignId],
        array_merge($request->all(), ['auto_saved_at' => now()])
    );
    
    return response()->json(['status' => 'draft_saved']);
}
```

**Success Criteria**: SC-003 (100% data retention on auto-save)

**Alternatives Considered**:
- Backend-driven auto-save: Requires WebSocket connection, more complex
- LocalStorage fallback: Adds complexity, doesn't meet "saved to server" requirement

---

### 6. Campaign Versioning Patterns

**Question**: How to implement FR-012/FR-051 (manual version snapshots, last 5 versions)?

**Decision**: Snapshot entire campaign + brief as JSON in `campaign_versions` table on "Save Version" action

**Rationale**:
- Manual trigger (user clicks button) simplifies logic
- JSON column stores full campaign state (all fields, brief content)
- Chronological ordering by `version_number` (auto-increment per campaign)
- Limit enforced at application level (delete oldest when >5 versions exist)

**Implementation Pattern**:
```php
// backend/app/Services/CampaignVersionService.php
public function createVersion(Campaign $campaign): CampaignVersion {
    // Enforce 5-version limit
    $existingVersions = CampaignVersion::where('campaign_id', $campaign->id)
        ->orderBy('version_number', 'desc')
        ->get();
    
    if ($existingVersions->count() >= 5) {
        $existingVersions->last()->delete(); // Remove oldest
    }
    
    // Create new version
    $versionNumber = $existingVersions->first()?->version_number + 1 ?? 1;
    
    return CampaignVersion::create([
        'campaign_id' => $campaign->id,
        'version_number' => $versionNumber,
        'snapshot' => [
            'campaign' => $campaign->toArray(),
            'brief' => $campaign->brief->toArray(),
        ]
    ]);
}
```

**Database Schema**:
```php
Schema::create('campaign_versions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('campaign_id')->constrained()->onDelete('cascade');
    $table->integer('version_number');
    $table->json('snapshot'); // Full campaign + brief data
    $table->timestamps();
    
    $table->unique(['campaign_id', 'version_number']);
});
```

**Success Criteria**: SC-011 (view and restore 5 previous versions), SC-016 (<2 second snapshot creation)

**Alternatives Considered**:
- Event sourcing: Overkill for 5-version requirement
- Auto-versioning on every change: Violates FR-051 (manual only)

---

### 7. Tier-Based Rate Limiting

**Question**: How to enforce tier-based limits (project count, collaborators, storage)?

**Decision**: Service-level checks before operations + database constraints where possible

**Rationale**:
- Database constraints enforce hard limits (e.g., `CHECK` constraint on project count)
- Service layer checks tier before create/update operations
- Middleware validates tier on expensive operations (file uploads)
- User model includes `tier` field (from auth system: free/pro/enterprise)

**Implementation Pattern**:
```php
// backend/app/Services/ProjectService.php
public function create(User $user, array $data): Project {
    // Check tier limit (FR-004)
    $tierLimits = ['free' => 5, 'pro' => PHP_INT_MAX, 'enterprise' => PHP_INT_MAX];
    $currentCount = Project::where('user_id', $user->id)
        ->whereNull('deleted_at')
        ->count();
    
    if ($currentCount >= $tierLimits[$user->tier]) {
        throw new TierLimitException("You've reached your plan's project limit");
    }
    
    return Project::create(array_merge($data, ['user_id' => $user->id]));
}
```

**Storage Quota Pattern**:
```php
// backend/app/Services/StorageQuotaService.php
public function checkAndReserve(User $user, int $bytes): void {
    $quotas = ['free' => 100 * 1024 * 1024, 'pro' => 5 * 1024 * 1024 * 1024, 'enterprise' => 50 * 1024 * 1024 * 1024];
    
    $used = DB::table('assets')
        ->join('campaigns', 'assets.campaign_id', '=', 'campaigns.id')
        ->join('projects', 'campaigns.project_id', '=', 'projects.id')
        ->where('projects.user_id', $user->id)
        ->sum('assets.file_size');
    
    if (($used + $bytes) > $quotas[$user->tier]) {
        throw new StorageQuotaException("Storage quota exceeded");
    }
}
```

**Success Criteria**: SC-009 (tier enforcement), SC-014 (storage quota enforcement)

**Alternatives Considered**:
- Database-only constraints: Doesn't provide user-friendly error messages
- Frontend-only checks: Insecure, can be bypassed

---

### 8. Full-Text Search Optimization in PostgreSQL

**Question**: How to implement FR-031 (full-text search <300ms p95)?

**Decision**: PostgreSQL `tsvector` + GIN index on concatenated search fields

**Rationale**:
- PostgreSQL's full-text search is faster than `LIKE %query%` pattern matching
- GIN (Generalized Inverted Index) optimizes text search queries
- Concatenate searchable fields (name, description, client) into single `tsvector` column
- Update `tsvector` via database trigger on insert/update

**Implementation Pattern**:

Migration:
```php
Schema::table('projects', function (Blueprint $table) {
    $table->tsvector('search_vector')->nullable();
});

DB::statement("
    CREATE INDEX projects_search_idx ON projects USING GIN(search_vector);
    
    CREATE TRIGGER projects_search_update BEFORE INSERT OR UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION
    tsvector_update_trigger(search_vector, 'pg_catalog.english', name, description, client);
");
```

Query:
```php
// backend/app/Http/Controllers/ProjectController.php
public function search(Request $request) {
    $query = $request->input('q');
    
    $projects = Project::whereRaw("search_vector @@ plainto_tsquery('english', ?)", [$query])
        ->orderByRaw("ts_rank(search_vector, plainto_tsquery('english', ?)) DESC", [$query])
        ->paginate(20);
    
    return ProjectResource::collection($projects);
}
```

**Performance Benchmark Target**: SC-005 (<300ms p95 for search results)

**Alternatives Considered**:
- Elasticsearch: Overkill for MVP, adds infrastructure complexity
- `LIKE` queries: Too slow at scale, doesn't meet <300ms requirement

---

## Summary

All technical unknowns resolved:

1. ✅ Health check extended with lightweight database connectivity test
2. ✅ APM via Laravel logging with performance metrics (upgrade to dedicated APM post-MVP)
3. ✅ File uploads use Laravel Storage + S3 driver with pre-upload validation
4. ✅ Collaboration uses Laravel Policies + query scopes for role-based access
5. ✅ Auto-save implemented with frontend debounced POST to draft endpoint
6. ✅ Versioning uses JSON snapshots with 5-version limit enforced in service layer
7. ✅ Tier limits checked in service layer before operations
8. ✅ Full-text search uses PostgreSQL tsvector + GIN index

**Next Step**: Phase 1 - Generate data model, API contracts, and quickstart guide.
