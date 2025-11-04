# Multi-stage Dockerfile for CreativeAI Agent Backend

# Stage 1: Builder
FROM php:8.2-fpm-alpine AS builder

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    build-base

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    zip \
    bcmath \
    pcntl \
    posix

# Install Composer
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy composer files
COPY composer.json composer.lock* ./

# Install dependencies (including dev for tinker, etc.)
RUN composer install --optimize-autoloader --no-scripts 2>&1

# Copy application code
COPY . .

# Generate Laravel key and optimize
RUN php artisan key:generate --force 2>/dev/null || true && \
    php artisan config:cache 2>/dev/null || true

# Stage 2: Runtime
FROM php:8.2-fpm-alpine

# Install build dependencies and runtime dependencies
RUN apk add --no-cache \
    libpq \
    curl \
    postgresql-client \
    supervisor \
    postgresql-dev \
    libzip-dev \
    oniguruma-dev \
    libzip \
    oniguruma \
    git \
    $PHPIZE_DEPS

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    zip \
    bcmath \
    pcntl \
    posix \
    mbstring

# Install Redis extension for caching
RUN pecl install redis && \
    docker-php-ext-enable redis

# Clean up build dependencies (keep runtime libs)
RUN apk del $PHPIZE_DEPS postgresql-dev libzip-dev oniguruma-dev

# Copy composer from builder
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

# Create app user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

# Set working directory
WORKDIR /app

# Copy application from builder
COPY --from=builder --chown=appuser:appuser /app .

# Create necessary directories
RUN mkdir -p storage/logs storage/framework/sessions storage/framework/views storage/framework/cache && \
    chown -R appuser:appuser storage bootstrap/cache

# Copy supervisord configuration
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/api/health || exit 1

# Switch to app user
USER appuser

# Expose port
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm"]
