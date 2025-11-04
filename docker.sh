#!/bin/bash
# Docker Compose Helper - Delegates commands to backend/docker-compose.yml
# Usage: ./docker.sh [command] [args...]

cd "$(dirname "$0")/backend"

if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    echo "CreativeAI Agent - Docker Helper"
    echo "Usage: $(basename "$0") [command] [args...]"
    echo ""
    echo "Common commands:"
    echo "  $(basename "$0") up          Start all services"
    echo "  $(basename "$0") down        Stop all services"
    echo "  $(basename "$0") build       Build Docker images"
    echo "  $(basename "$0") logs        Show service logs"
    echo "  $(basename "$0") exec app    Execute command in app container"
    echo ""
    echo "See: docker compose --help for more options"
    exit 0
fi

docker compose "$@"
