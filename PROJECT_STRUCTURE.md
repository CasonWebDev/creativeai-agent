# CreativeAI Agent - Project Structure

## Directory Organization

This project follows a clear separation of concerns with all backend and frontend code properly isolated:

```
creativeai-agent/
├── backend/                    # All backend code and infrastructure
│   ├── Dockerfile              # PHP-FPM application container
│   ├── docker-compose.yml      # Development services orchestration
│   ├── docker/                 # Docker configuration files
│   ├── app/                    # Laravel application code
│   ├── config/                 # Laravel configuration
│   ├── database/               # Migrations and seeders
│   ├── routes/                 # API and web routes
│   ├── tests/                  # PHPUnit tests
│   ├── composer.json           # PHP dependencies
│   ├── composer.lock           # Locked dependency versions
│   ├── phpunit.xml             # Test configuration
│   ├── README.md               # Backend quick start
│   └── DOCKER.md               # Docker setup guide
│
├── frontend/                   # All frontend code
│   ├── app/                    # Next.js pages and layouts
│   ├── components/             # React components
│   ├── lib/                    # Utilities and helpers
│   ├── package.json            # Node.js dependencies
│   ├── tsconfig.json           # TypeScript configuration
│   ├── next.config.mjs         # Next.js configuration
│   └── README.md               # Frontend quick start
│
├── specs/                      # Project specifications and documentation
│   └── 001-user-auth/          # User authentication feature spec
│       ├── plan.md             # Implementation plan
│       ├── data-model.md       # Database schema
│       ├── spec.md             # Requirements specification
│       ├── tasks.md            # Task breakdown (211 tasks)
│       └── checklists/         # Validation checklists
│
├── .github/                    # GitHub workflows and CI/CD
├── .env.example                # Environment template
├── .gitignore                  # Git ignore patterns
├── .dockerignore               # Docker build ignore patterns
├── docker.sh                   # Helper script for docker commands
└── README.md                   # Main project README
```

## Key Principles

### 1. **Backend Isolation** (`backend/`)
- All PHP/Laravel code and infrastructure
- Docker setup (`Dockerfile`, `docker-compose.yml`, `docker/`)
- Database migrations and models
- API services and business logic
- PHPUnit tests

**Run from root:**
```bash
./docker.sh up              # Start all services
./docker.sh exec app bash   # Enter app container
```

**Or directly from backend:**
```bash
cd backend
docker-compose up
```

### 2. **Frontend Isolation** (`frontend/`)
- All Next.js/React code
- TypeScript components
- UI components and pages
- Frontend tests
- Independent from backend during development

### 3. **Documentation & Specs** (`specs/`)
- Feature specifications
- Data models and diagrams
- Implementation plans
- Task breakdowns
- Quality checklists

### 4. **Docker Strategy**
- **Location**: All Docker files in `backend/` folder
- **Helper Script**: `./docker.sh` at root for convenience
- **Services**: PostgreSQL, Redis, Nginx, PHP-FPM, Mailhog
- **Development**: Use `docker-compose.yml` for local development

## Development Workflow

### Starting Development

```bash
# 1. From project root, start Docker services
./docker.sh up -d

# 2. Verify services are running
./docker.sh ps

# 3. Check API health
curl http://localhost:8000/api/health

# 4. Run migrations
./docker.sh exec app php artisan migrate

# 5. Run frontend (separate terminal)
cd frontend
npm install
npm run dev
```

### Common Tasks

```bash
# Backend (via docker.sh helper)
./docker.sh exec app php artisan tinker              # Run Artisan command
./docker.sh logs -f app                              # View logs
./docker.sh down                                     # Stop services

# Frontend
cd frontend
npm install                                          # Install dependencies
npm run dev                                          # Start dev server
npm run build                                        # Build for production
npm test                                             # Run tests

# Database
./docker.sh exec app php artisan migrate             # Run migrations
./docker.sh exec app php artisan make:migration      # Create migration
./docker.sh exec app php artisan db:seed             # Seed database
```

## File Locations Reference

| Purpose | Location |
|---------|----------|
| Backend API Code | `backend/app/` |
| Laravel Config | `backend/config/` |
| Database Migrations | `backend/database/` |
| API Routes | `backend/routes/api.php` |
| Frontend Pages | `frontend/app/` |
| React Components | `frontend/components/` |
| Project Specs | `specs/` |
| Docker Setup | `backend/docker/` |
| Docker Compose | `backend/docker-compose.yml` |
| Environment Config | `.env.example` → `.env.local` |

## Technology Stack

### Backend
- **Framework**: Laravel 11+
- **Language**: PHP 8.2
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **API Auth**: Sanctum + JWT RS256
- **Testing**: PHPUnit (80%+ coverage)

### Frontend
- **Framework**: Next.js 15+
- **Language**: TypeScript
- **UI Library**: React 19+
- **Component Lib**: Shadcn/ui
- **Styling**: Tailwind CSS
- **Package Manager**: npm/pnpm

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx
- **Email (Dev)**: Mailhog
- **Version Control**: Git
- **Package Managers**: Composer (PHP), npm/pnpm (Node)

## Accessing Services

| Service | URL | Purpose |
|---------|-----|---------|
| API Backend | http://localhost:8000 | PHP/Laravel API |
| Health Check | http://localhost:8000/api/health | Service health |
| Frontend Dev | http://localhost:3000 | Next.js dev server |
| Mailhog Web UI | http://localhost:8025 | Email testing |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache/Sessions |

## For More Details

- **Backend Setup**: See `backend/README.md` and `backend/DOCKER.md`
- **Frontend Setup**: See `frontend/README.md`
- **Project Specs**: See `specs/001-user-auth/`
- **Implementation Plan**: See `specs/001-user-auth/plan.md`

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes (backend, frontend, or both)
git add .
git commit -m "feat: description of changes"

# Push and create PR
git push origin feature/new-feature
```

## Docker Troubleshooting

If Docker services won't start:

```bash
# Check what's using the ports
lsof -i :8000          # Nginx
lsof -i :5432          # PostgreSQL
lsof -i :6379          # Redis

# Force cleanup and restart
./docker.sh down -v
./docker.sh up -d --build
```

For more details, see `backend/DOCKER.md`.
