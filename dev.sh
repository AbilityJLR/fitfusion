#!/bin/bash
set -e

echo "Starting FitFusion development environment..."

# Ensure dev environment is set
export ENVIRONMENT=development
export NODE_ENV=development

# Start the development services with docker-compose
docker-compose down
docker-compose up -d

echo "Development environment started!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000/api/"
echo "Django Admin: http://localhost:8000/admin/"
echo "Database: postgres://postgres:postgres@localhost:5432/fitfusion"

# Watch logs if requested
if [ "$1" = "--logs" ]; then
  docker-compose logs -f
fi 