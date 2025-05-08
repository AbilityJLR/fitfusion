#!/bin/bash
set -e

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment process for FitFusion app${NC}"

# Check for required environment variables
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}Error: DATABASE_URL environment variable is required${NC}"
  echo "Please set DATABASE_URL to your PostgreSQL connection string"
  echo "Example: export DATABASE_URL=postgres://username:password@hostname:port/database"
  exit 1
fi

# Check for deployment configuration
if [ ! -f "Dockerfile.production" ]; then
  echo -e "${RED}Error: Dockerfile.production not found${NC}"
  exit 1
fi

if [ ! -f "fly.toml" ]; then
  echo -e "${YELLOW}Warning: fly.toml not found. Running 'fly launch' to initialize...${NC}"
  fly launch --dockerfile Dockerfile.production --no-deploy
fi

# Set production environment variables
echo -e "${GREEN}Setting environment variables on Fly.io${NC}"
fly secrets set \
  ENVIRONMENT=production \
  DEBUG=False \
  DATABASE_URL="$DATABASE_URL" \
  ALLOWED_HOSTS=".fly.dev,localhost,127.0.0.1" \
  CORS_ALLOWED_ORIGINS="https://$(fly info -j | jq -r '.Hostname'),http://localhost:3000" \
  SECRET_KEY="$(openssl rand -hex 32)"

# Deploy the app
echo -e "${GREEN}Deploying application to Fly.io${NC}"
fly deploy --dockerfile Dockerfile.production --strategy immediate

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "Your application should be available at: ${YELLOW}https://$(fly info -j | jq -r '.Hostname')${NC}" 