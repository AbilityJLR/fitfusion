#!/bin/bash
set -e

# Navigate to server directory
cd "$(dirname "$0")"

# Check if DB_PASSWORD and SECRET_KEY env vars are set
if [ -z "$DB_PASSWORD" ]; then
  echo "Error: DB_PASSWORD environment variable must be set"
  exit 1
fi

if [ -z "$SECRET_KEY" ]; then
  echo "Error: SECRET_KEY environment variable must be set"
  exit 1
fi

# Set environment variables for fly.io deployment
echo "Setting environment variables for deployment..."
fly secrets set DB_PASSWORD="$DB_PASSWORD" SECRET_KEY="$SECRET_KEY" ENV="production"

# Deploy the application
echo "Deploying to fly.io..."
fly deploy

echo "Deployment complete!" 