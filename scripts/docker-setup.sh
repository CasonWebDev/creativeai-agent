#!/bin/bash

# CreativeAI Agent - Docker Setup Script
# Handles initial setup and composer dependencies

set -e

echo "🚀 CreativeAI Agent - Docker Setup"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found. Run from project root."
    exit 1
fi

# Step 1: Generate composer.lock if needed
echo ""
echo "📦 Step 1: Generating composer.lock..."
if [ ! -f "backend/composer.lock" ]; then
    echo "  Creating composer.lock..."
    cd backend
    composer install --no-dev --optimize-autoloader --no-scripts || true
    cd ..
fi

# Step 2: Create .env if needed
echo ""
echo "🔐 Step 2: Setting up environment..."
if [ ! -f "backend/.env" ]; then
    echo "  Creating backend/.env from backend/.env.local..."
    cp backend/.env.local backend/.env
fi

# Step 3: Start Docker Compose
echo ""
echo "🐳 Step 3: Starting Docker services..."
docker-compose up -d

# Step 4: Wait for services to be ready
echo ""
echo "⏳ Step 4: Waiting for services to be ready..."
sleep 10

# Step 5: Run migrations
echo ""
echo "🗄️  Step 5: Running database migrations..."
docker-compose exec -T app php artisan migrate --force 2>/dev/null || echo "  ℹ️  Migrations will run on next artisan command"

# Step 6: Display status
echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Services running:"
echo "  • Laravel API: http://localhost:8000"
echo "  • Mailhog UI: http://localhost:8025"
echo "  • PostgreSQL: localhost:5432"
echo "  • Redis: localhost:6379"
echo ""
echo "🚀 Next steps:"
echo "  • Access container: docker-compose exec app bash"
echo "  • View logs: docker-compose logs -f app"
echo "  • Run tests: docker-compose exec app php artisan test"
echo "  • Check health: curl http://localhost:8000/api/health"
