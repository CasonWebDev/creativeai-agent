# Data Model

**Feature**: Digital Media Projects and Campaigns Management  
**Branch**: 003-projects-campaigns  
**Date**: 2025-11-05

## Entity Relationship Diagram

```
┌─────────────────┐
│      User       │ (existing, from feature 002)
│─────────────────│
│ id: bigint PK   │
│ email: string   │
│ name: string    │
│ tier: enum      │ ◄──────── Tier: free|pro|enterprise
└─────────────────┘
         │
         │ 1:N (owner)
         │
         ▼
┌─────────────────────┐
│      Project        │
│─────────────────────│
│ id: bigint PK       │
│ user_id: bigint FK  │───┐
│ name: string(100)   │   │
│ description: text   │   │
│ client: string      │   │
│ deadline: date      │   │
│ status: enum        │   │ ◄─ Status: draft|active|archived
│ created_at          │   │
│ updated_at          │   │
│ deleted_at          │   │ (soft delete, 30-day recovery)
│ search_vector       │   │ (tsvector for full-text search)
└─────────────────────┘   │
         │                │
         │ 1:N            │ N:N (through ProjectCollaborator)
         │                │
         ▼                │
┌─────────────────────┐   │
│     Campaign        │   │
│─────────────────────│   │
│ id: bigint PK       │   │
│ project_id: FK      │───┘
│ name: string        │
│ objective: enum     │ ◄── Objective: awareness|conversion|engagement
│ target_audience     │
│ tone_of_voice       │
│ platforms: json[]   │ ◄── Array: Instagram, Facebook, LinkedIn, TikTok, YouTube, Twitter
│ image_dimensions    │ ◄── Array: 1080x1080, 1920x1080, etc.
│ briefing: text      │ (50-2000 chars, main brief text)
│ status: enum        │ ◄── Status: draft|in_production|completed
│ version: int        │ (current version number)
│ created_at          │
│ updated_at          │
│ deleted_at          │ (hard delete after 7 days)
└─────────────────────┘
         │
         │ 1:1
         │
         ▼
┌─────────────────────────┐
│   CampaignBrief         │
│─────────────────────────│
│ id: bigint PK           │
│ campaign_id: FK (unique)│
│ context: text           │ (client/brand context)
│ objective: text         │ (detailed campaign goal)
│ audience_demographic    │
│ audience_psychographic  │
│ main_message: text      │
│ cta: string             │ (call-to-action)
│ visual_references: json │ ◄── Array of file URLs (S3)
│ restrictions: text      │
│ auto_saved_at           │ (last auto-save timestamp)
│ created_at              │
│ updated_at              │
└─────────────────────────┘

┌─────────────────────┐
│  CampaignVersion    │ (Enterprise tier only)
│─────────────────────│
│ id: bigint PK       │
│ campaign_id: FK     │───┐ (points back to Campaign)
│ version_number: int │   │ (1-5, manual snapshots)
│ snapshot: json      │   │ (full campaign + brief state)
│ created_at          │   │
└─────────────────────┘   │
         ▲                │
         └────────────────┘

┌─────────────────────┐
│      Asset          │ (future: generated content)
│─────────────────────│
│ id: bigint PK       │
│ campaign_id: FK     │───┐ (points to Campaign)
│ type: enum          │   │ ◄── Type: image|text|video
│ file_url: string    │   │ (S3 URL)
│ file_size: bigint   │   │ (bytes, for quota tracking)
│ generation_metadata │   │ (JSON: model, prompt, etc.)
│ created_at          │   │
│ deleted_at          │   │ (soft delete, permanent after 7 days)
└─────────────────────┘   │
         ▲                │
         └────────────────┘

┌─────────────────────────┐
│ ProjectCollaborator     │
│─────────────────────────│
│ id: bigint PK           │
│ project_id: FK          │───┐ (N:N relationship)
│ user_id: FK             │   │
│ role: enum              │   │ ◄── Role: owner|editor|viewer
│ invited_at              │   │
│ accepted_at             │   │
│ created_at              │   │
└─────────────────────────┘   │
         ▲                    │
         │                    │
         └────────────────────┘

┌─────────────────────┐
│    ProjectTag       │
│─────────────────────│
│ id: bigint PK       │
│ project_id: FK      │───┐ (1:N tags per project)
│ name: string        │   │
│ created_at          │   │
└─────────────────────┘   │
         ▲                │
         └────────────────┘
```

---

## Table Specifications

### projects

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint | PK, auto-increment | Primary key |
| user_id | bigint | FK → users.id, NOT NULL | Project owner |
| name | varchar(100) | NOT NULL | Project name |
| description | text | NULLABLE | Optional description |
| client | varchar(255) | NULLABLE | Client name |
| deadline | date | NULLABLE | Optional deadline |
| status | enum('draft','active','archived') | NOT NULL, DEFAULT 'draft' | Project status |
| search_vector | tsvector | NULLABLE | Full-text search index |
| created_at | timestamp | NOT NULL | Creation timestamp |
| updated_at | timestamp | NOT NULL | Last update timestamp |
| deleted_at | timestamp | NULLABLE | Soft delete timestamp |

**Indexes**:
- PRIMARY KEY (id)
- INDEX (user_id, deleted_at) - For user's active projects
- INDEX USING GIN (search_vector) - For full-text search
- INDEX (status, deleted_at) - For filtering by status

**Validation Rules** (from FRs):
- FR-044: name required, max 100 chars
- FR-004: Tier limits enforced at service level (Free: 5, Pro/Enterprise: unlimited)
- FR-037: Soft delete with 30-day recovery window

---

### campaigns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint | PK, auto-increment | Primary key |
| project_id | bigint | FK → projects.id, NOT NULL, ON DELETE CASCADE | Parent project |
| name | varchar(255) | NOT NULL | Campaign name |
| objective | enum('awareness','conversion','engagement') | NOT NULL | Campaign goal |
| target_audience | text | NULLABLE | Audience description |
| tone_of_voice | varchar(100) | NULLABLE | Tone (professional/casual/creative) |
| platforms | json | NOT NULL, DEFAULT '[]' | Array of platform names |
| image_dimensions | json | NOT NULL, DEFAULT '[]' | Array of dimension strings |
| briefing | text | NOT NULL | Main brief text (50-2000 chars) |
| status | enum('draft','in_production','completed') | NOT NULL, DEFAULT 'draft' | Campaign status |
| version | integer | NOT NULL, DEFAULT 1 | Current version number |
| created_at | timestamp | NOT NULL | Creation timestamp |
| updated_at | timestamp | NOT NULL | Last update timestamp |
| deleted_at | timestamp | NULLABLE | Hard delete after 7 days |

**Indexes**:
- PRIMARY KEY (id)
- INDEX (project_id, deleted_at) - For project's campaigns
- INDEX (status) - For filtering by status

**Validation Rules** (from FRs):
- FR-045: name required
- FR-043: briefing 50-2000 chars
- FR-011: Status values validated
- FR-038: Hard delete after 7-day grace period

---

### campaign_briefs

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint | PK, auto-increment | Primary key |
| campaign_id | bigint | FK → campaigns.id, UNIQUE, NOT NULL, ON DELETE CASCADE | Parent campaign (1:1) |
| context | text | NULLABLE | Client/brand context |
| objective | text | NULLABLE | Detailed campaign objective |
| audience_demographic | text | NULLABLE | Demographic info |
| audience_psychographic | text | NULLABLE | Psychographic info |
| main_message | text | NULLABLE | Main campaign message |
| cta | varchar(255) | NULLABLE | Call-to-action |
| visual_references | json | NOT NULL, DEFAULT '[]' | Array of file URLs |
| restrictions | text | NULLABLE | Content restrictions |
| auto_saved_at | timestamp | NULLABLE | Last auto-save timestamp |
| created_at | timestamp | NOT NULL | Creation timestamp |
| updated_at | timestamp | NOT NULL | Last update timestamp |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE (campaign_id) - Enforces 1:1 relationship

**Validation Rules** (from FRs):
- FR-017: Structured template sections
- FR-046: visual_references max 5 files, 5MB each, JPG/PNG/GIF/WebP
- FR-018: Auto-save every 30 seconds

---

### campaign_versions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint | PK, auto-increment | Primary key |
| campaign_id | bigint | FK → campaigns.id, NOT NULL, ON DELETE CASCADE | Parent campaign |
| version_number | integer | NOT NULL | Version sequence (1-5) |
| snapshot | jsonb | NOT NULL | Full campaign + brief state |
| created_at | timestamp | NOT NULL | Snapshot creation timestamp |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE (campaign_id, version_number) - Prevents duplicate version numbers
- INDEX (campaign_id, version_number DESC) - For retrieving latest versions

**Validation Rules** (from FRs):
- FR-012: Last 5 versions maintained
- FR-051: Manual snapshots only (user clicks "Save Version")
- Enterprise tier only

---

### assets

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint | PK, auto-increment | Primary key |
| campaign_id | bigint | FK → campaigns.id, NOT NULL, ON DELETE CASCADE | Parent campaign |
| type | enum('image','text','video') | NOT NULL | Asset type |
| file_url | text | NOT NULL | S3 URL to asset |
| file_size | bigint | NOT NULL | File size in bytes |
| generation_metadata | jsonb | NULLABLE | AI generation details |
| created_at | timestamp | NOT NULL | Creation timestamp |
| deleted_at | timestamp | NULLABLE | Soft delete timestamp |

**Indexes**:
- PRIMARY KEY (id)
- INDEX (campaign_id, deleted_at) - For campaign's assets
- INDEX (created_at) - For chronological ordering

**Validation Rules** (from FRs):
- FR-040: Permanent deletion 7 days after campaign deletion
- FR-048: Contributes to user storage quota

---

### project_collaborators

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint | PK, auto-increment | Primary key |
| project_id | bigint | FK → projects.id, NOT NULL, ON DELETE CASCADE | Parent project |
| user_id | bigint | FK → users.id, NOT NULL, ON DELETE CASCADE | Collaborator user |
| role | enum('owner','editor','viewer') | NOT NULL | Access role |
| invited_at | timestamp | NOT NULL | Invitation timestamp |
| accepted_at | timestamp | NULLABLE | Acceptance timestamp (NULL = pending) |
| created_at | timestamp | NOT NULL | Record creation timestamp |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE (project_id, user_id) - One collaboration per user per project
- INDEX (user_id) - For user's collaborated projects
- INDEX (project_id, role) - For filtering by role

**Validation Rules** (from FRs):
- FR-023: Three roles: owner, editor, viewer
- FR-025: Tier limits (Free: 0, Pro: 5, Enterprise: unlimited)
- FR-026: Immediate access revocation on removal

---

### project_tags

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint | PK, auto-increment | Primary key |
| project_id | bigint | FK → projects.id, NOT NULL, ON DELETE CASCADE | Parent project |
| name | varchar(50) | NOT NULL | Tag name |
| created_at | timestamp | NOT NULL | Creation timestamp |

**Indexes**:
- PRIMARY KEY (id)
- INDEX (project_id) - For project's tags
- INDEX (name) - For filtering by tag

**Validation Rules** (from FRs):
- FR-029: Add/edit/remove tags
- FR-030: Filter by single or multiple tags

---

## State Transitions

### Project Status

```
draft ──────► active ──────► archived
  │              │              │
  └──────────────┴──────────────┘
         (any status can transition to any other)
```

- **draft**: Initial state, project created but not in use
- **active**: Project actively worked on
- **archived**: Soft-deleted, recoverable for 30 days (FR-037)

### Campaign Status

```
draft ──────► in_production ──────► completed
  │                 │                    │
  └─────────────────┴────────────────────┘
         (any status can transition to any other)
```

- **draft**: Initial state, campaign created but not finalized
- **in_production**: Campaign brief finalized, assets being generated
- **completed**: All assets generated, campaign finished

### Collaborator Invitation

```
invited (accepted_at = NULL) ──────► accepted (accepted_at = timestamp)
         │
         └──────► revoked (record deleted)
```

---

## Data Integrity Rules

1. **Cascading Deletes**:
   - Delete project → soft-delete all campaigns (FR-039)
   - Delete campaign → soft-delete all assets (FR-039)
   - Delete user → hard-delete collaborator records (cleanup)

2. **Soft Delete Cleanup** (scheduled jobs):
   - Projects: Permanent deletion after 30 days (FR-037)
   - Campaigns: Hard delete after 7 days (FR-038)
   - Assets: Permanent deletion 7 days after campaign deletion (FR-040)

3. **Tier Enforcement** (service layer):
   - Check project count before creation (FR-041)
   - Check collaborator count before addition (FR-042)
   - Check storage quota before file upload (FR-048, FR-049)

4. **Version History Maintenance**:
   - Keep only 5 most recent versions per campaign (FR-012)
   - Delete oldest when creating 6th version
   - Enterprise tier only (FR-051)

---

## Storage Quota Calculation

```sql
-- Calculate user's total storage usage
SELECT 
    p.user_id,
    SUM(a.file_size) AS total_bytes,
    u.tier,
    CASE u.tier
        WHEN 'free' THEN 104857600       -- 100 MB
        WHEN 'pro' THEN 5368709120       -- 5 GB
        WHEN 'enterprise' THEN 53687091200 -- 50 GB
    END AS quota_bytes,
    (SUM(a.file_size)::float / 
     CASE u.tier
        WHEN 'free' THEN 104857600
        WHEN 'pro' THEN 5368709120
        WHEN 'enterprise' THEN 53687091200
     END * 100) AS usage_percent
FROM users u
LEFT JOIN projects p ON p.user_id = u.id AND p.deleted_at IS NULL
LEFT JOIN campaigns c ON c.project_id = p.id AND c.deleted_at IS NULL
LEFT JOIN assets a ON a.campaign_id = c.id AND a.deleted_at IS NULL
WHERE u.id = ?
GROUP BY p.user_id, u.tier;
```

---

## Migration Sequence

Migrations must be applied in this order to respect foreign key dependencies:

1. `2025_11_05_000001_create_projects_table.php`
2. `2025_11_05_000002_create_campaigns_table.php`
3. `2025_11_05_000003_create_campaign_briefs_table.php`
4. `2025_11_05_000004_create_campaign_versions_table.php`
5. `2025_11_05_000005_create_assets_table.php`
6. `2025_11_05_000006_create_project_collaborators_table.php`
7. `2025_11_05_000007_create_project_tags_table.php`
8. `2025_11_05_000008_add_search_vector_to_projects.php` (tsvector + GIN index)

Each migration includes:
- Table creation with all columns
- Foreign key constraints
- Indexes for performance
- Trigger for `search_vector` update (projects only)

---

## Next Steps

1. Generate API contracts in `/contracts/` directory
2. Create quickstart guide for developers
3. Implement Laravel models with relationships
4. Write feature tests validating data integrity rules
