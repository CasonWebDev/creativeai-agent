#!/bin/bash
set -e

echo "=== CreativeAI Agent Backend - Docker Entrypoint ==="

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
while ! pg_isready -h $DB_HOST -U $DB_USERNAME; do
    sleep 1
done
echo "PostgreSQL is ready!"

# Wait for Redis to be ready
echo "Waiting for Redis..."
while ! redis-cli -h $REDIS_HOST -p $REDIS_PORT ping > /dev/null 2>&1; do
    sleep 1
done
echo "Redis is ready!"

# Run migrations
echo "Running database migrations..."
php artisan migrate --force

# Cache configuration and routes
echo "Caching configuration..."
php artisan config:cache
php artisan route:cache

# Generate JWT keys if they don't exist
if [ ! -f storage/keys/private.key ] || [ ! -f storage/keys/public.key ]; then
    echo "Generating JWT keys..."
    mkdir -p storage/keys
    openssl genrsa -out storage/keys/private.key 2048
    openssl rsa -in storage/keys/private.key -pubout -out storage/keys/public.key
    chmod 600 storage/keys/private.key
    chmod 644 storage/keys/public.key
fi

# Seed database if in development
if [ "$APP_ENV" = "local" ] || [ "$APP_ENV" = "development" ]; then
    echo "Seeding database with test data..."
    php artisan db:seed || true
fi

echo "=== Backend is ready! ==="

# Start PHP-FPM
exec "$@"
