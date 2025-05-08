#!/bin/bash
set -e

echo "Starting FitFusion production environment locally..."

# Ensure production environment is set
export ENVIRONMENT=production
export NODE_ENV=production
export SECRET_KEY=$(openssl rand -hex 32)
export ALLOWED_HOSTS=localhost,127.0.0.1
export CORS_ALLOWED_ORIGINS=http://localhost:3000
export DATABASE_URL=postgres://postgres:postgres@db:5432/fitfusion
export SECURE_SSL_REDIRECT=False

# Start the production services with docker-compose
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

echo "Production environment started locally!"
echo "Application: http://localhost"
echo "API: http://localhost/api/"
echo "Admin: http://localhost/admin/"

# Watch logs if requested
if [ "$1" = "--logs" ]; then
  docker-compose -f docker-compose.prod.yml logs -f
fi 