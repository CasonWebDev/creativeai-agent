# CreativeAI Agent - Backend Authentication System

Backend authentication and user management system for CreativeAI Agent platform.

## Technology Stack

- **Language**: PHP 8.2+
- **Framework**: Laravel 11+
- **Database**: PostgreSQL 15
- **Cache/Sessions**: Redis 7
- **Authentication**: Laravel Sanctum + JWT (RS256)
- **Testing**: PHPUnit + Laravel Feature Tests

## Project Structure

```
backend/
├── app/                 # Application code
│   ├── Models/         # Eloquent models
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Requests/
│   │   └── Resources/
│   ├── Services/       # Business logic
│   ├── Jobs/          # Queued jobs
│   ├── Events/        # Event listeners
│   └── Exceptions/    # Custom exceptions
├── config/            # Configuration files
├── database/
│   └── migrations/    # Database migrations
├── routes/            # API routes
├── storage/           # Application storage
├── tests/             # Test suite
└── public/            # Web entry point
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Local Development Setup

```bash
# Copy environment file
cp .env.local .env

# Start Docker containers
docker-compose up -d

# Access container shell
docker-compose exec app bash

# Run migrations
php artisan migrate

# Seed database (optional)
php artisan db:seed
```

### Running Tests

```bash
# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test
php artisan test tests/Feature/Auth/RegistrationFlowTest.php
```

### API Documentation

Health check endpoint (no auth required):
```bash
curl http://localhost:8000/api/health
```

Visit http://localhost:8025 to access Mailhog email testing interface.

## Features

### Phase 1: Infrastructure ✅
- Docker containerization
- Multi-stage Dockerfile
- PostgreSQL + Redis setup
- Environment configuration

### Phase 2: Foundational (In Progress)
- Database migrations
- Models and relationships
- Service layer
- Middleware & authentication

### Phase 3-5: Core Features (Planned)
- User registration with email confirmation
- JWT-based login with refresh tokens
- Rate limiting and session management
- Password reset flow

### Phase 6-10: Extended Features (Planned)
- Profile management
- Session/device management
- Plan tier enforcement
- API token generation

## Configuration

Edit `.env` to configure:
- Database connection
- Redis connection
- JWT keys
- Email provider
- S3/file storage

## Troubleshooting

### PostgreSQL Connection Issues
```bash
# Check database connectivity
docker-compose exec db pg_isready -U creativeai

# View database logs
docker-compose logs db
```

### Redis Connection Issues
```bash
# Check redis connectivity
docker-compose exec redis redis-cli ping

# View redis logs
docker-compose logs redis
```

### Application Errors
```bash
# View application logs
docker-compose logs app

# SSH into container
docker-compose exec app bash
```

## Development Workflow

1. Create a branch: `git checkout -b feature/feature-name`
2. Make changes following PSR-12 standards
3. Write tests before implementation (TDD)
4. Ensure 80%+ test coverage
5. Run linting: `composer lint`
6. Commit with descriptive message
7. Push and create PR

## Code Standards

- **PSR-12**: Code formatting standard
- **Type Hints**: All PHP 8.2+ type hints required
- **Testing**: 80%+ coverage minimum
- **Documentation**: PHPDoc on all public methods

## Deployment

### Docker Build
```bash
docker build -t creativeai-backend:latest .
```

### Docker Run
```bash
docker run -p 8000:80 \
  -e DB_HOST=your-db-host \
  -e DB_PASSWORD=your-password \
  creativeai-backend:latest
```

## Support

For issues, refer to:
- [Laravel Documentation](https://laravel.com/docs)
- [Sanctum Documentation](https://laravel.com/docs/sanctum)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

## License

Proprietary - CreativeAI Agent
