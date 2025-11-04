# Backend - CreativeAI Agent Authentication System

This directory contains all backend-related code and infrastructure for the CreativeAI Agent authentication system.

## Project Structure

```
backend/
├── Dockerfile              # Multi-stage Docker build for PHP-FPM application
├── docker-compose.yml      # Local development Docker services orchestration
├── docker/                 # Docker configuration files
│   ├── entrypoint.sh       # Container initialization script
│   ├── nginx.conf          # Nginx reverse proxy configuration
│   └── supervisord.conf    # Process supervision configuration
├── app/                    # Laravel application code
│   ├── Http/               # Controllers and middleware
│   ├── Models/             # Database models
│   └── Services/           # Business logic services
├── config/                 # Laravel configuration files
├── database/               # Database migrations and seeders
├── routes/                 # API and web routes
├── tests/                  # Test suites
├── composer.json           # PHP dependencies
├── composer.lock           # Locked dependency versions
├── phpunit.xml             # PHPUnit configuration
└── artisan                 # Laravel CLI entry point
```

## Quick Start

### From Root Directory

```bash
# Run any docker-compose command via helper script
./docker.sh up                 # Start services
./docker.sh down               # Stop services
./docker.sh build              # Build images
./docker.sh logs -f app        # View app logs
./docker.sh exec app bash      # Shell into app container
```

### From Backend Directory

```bash
cd backend

# Run docker-compose directly
docker-compose up              # Start services
docker-compose ps              # Show service status
docker-compose logs            # View logs
```

## Services

The `docker-compose.yml` orchestrates 5 services:

| Service | Port | Purpose |
|---------|------|---------|
| **app** | 9000 | PHP-FPM application server |
| **db** | 5432 | PostgreSQL 15 database |
| **redis** | 6379 | Redis cache & session store |
| **mailhog** | 8025 (UI) / 1025 (SMTP) | Local email testing |
| **nginx** | 8000 | Nginx reverse proxy |

## Environment Configuration

Development environment: `.env.local` (copied from `../.env.example`)

Key variables:
- `DB_HOST=db` (Docker service name)
- `DB_DATABASE=creativeai_auth`
- `REDIS_HOST=redis`
- `MAIL_HOST=mailhog`

## Database

### Running Migrations

```bash
./docker.sh exec app php artisan migrate
```

### Database Seeding

```bash
./docker.sh exec app php artisan db:seed
```

## Testing

### Run All Tests

```bash
./docker.sh exec app php artisan test
```

### Run Tests with Coverage

```bash
./docker.sh exec app php artisan test --coverage
```

### PHPUnit Configuration

See `phpunit.xml` for test configuration.

## Development

### Accessing the Application

- **API**: http://localhost:8000
- **Health Check**: http://localhost:8000/api/health
- **Mailhog UI**: http://localhost:8025

### Running Artisan Commands

```bash
./docker.sh exec app php artisan <command>
```

Examples:
```bash
./docker.sh exec app php artisan tinker           # Interactive shell
./docker.sh exec app php artisan make:model User # Generate model
./docker.sh exec app php artisan cache:clear     # Clear caches
```

### Debugging

View application logs:
```bash
./docker.sh logs -f app
```

Tail all service logs:
```bash
./docker.sh logs -f
```

## Troubleshooting

### Port Already in Use

If services fail to start due to port conflicts:

```bash
# Kill old containers
docker kill $(docker ps -q) 2>/dev/null || true

# Rebuild and restart
./docker.sh build --no-cache
./docker.sh up -d
```

### Rebuild All Services

```bash
./docker.sh down
./docker.sh up -d --build
```

### Clear All Data

```bash
./docker.sh down -v              # Remove volumes
./docker.sh up -d                # Recreate
```

## Documentation

- **API Routes**: See `routes/api.php`
- **Models**: See `app/Models/`
- **Services**: See `app/Services/`
- **Configuration**: See `config/`

## Architecture

- **Framework**: Laravel 11+
- **Language**: PHP 8.2
- **Database**: PostgreSQL 15
- **Cache/Sessions**: Redis 7
- **Package Manager**: Composer 2.6

For more details, see the main project README at `../README.md`
