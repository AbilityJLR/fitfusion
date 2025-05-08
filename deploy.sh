#!/bin/bash
set -e

# Check if fly CLI is installed
if ! command -v flyctl &> /dev/null
then
    echo "Fly CLI is not installed. Please install it first:"
    echo "https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

# Login to Fly.io if not already logged in
flyctl auth whoami &> /dev/null || flyctl auth login

# Ask for app name if not already set in fly.toml
APP_NAME=$(grep "app =" fly.toml | cut -d'"' -f2 2>/dev/null || echo "")
if [ -z "$APP_NAME" ]; then
    read -p "Enter your app name: " APP_NAME
    sed -i '' "s/app = \"fitfusion\"/app = \"$APP_NAME\"/" fly.toml
fi

# Check if app already exists or needs to be created
if ! flyctl apps list | grep -q "$APP_NAME"; then
    echo "Creating new app: $APP_NAME"
    flyctl apps create "$APP_NAME" --machines
fi

# Ask for region if needed
read -p "Enter your preferred region (default: sin): " REGION
REGION=${REGION:-sin}
sed -i '' "s/primary_region = \"sin\"/primary_region = \"$REGION\"/" fly.toml

# Set secrets
echo "Setting up secrets..."
flyctl secrets set SECRET_KEY="$(openssl rand -hex 32)" \
    DEBUG="False" \
    ALLOWED_HOSTS="$APP_NAME.fly.dev,localhost,127.0.0.1" \
    CORS_ALLOWED_ORIGINS="https://$APP_NAME.fly.dev,http://localhost:3000"

# Optional: Set up a database
read -p "Do you want to set up a PostgreSQL database? (y/n): " SETUP_DB
if [ "$SETUP_DB" = "y" ]; then
    echo "Creating PostgreSQL database..."
    flyctl postgres create --name "$APP_NAME-db" --region "$REGION"
    
    # Get the DATABASE_URL
    DB_URL=$(flyctl postgres attach --app "$APP_NAME" "$APP_NAME-db" | grep "DATABASE_URL" | cut -d'=' -f2-)
    
    # Set the DATABASE_URL secret
    flyctl secrets set DATABASE_URL="$DB_URL"
fi

# Deploy the app
echo "Deploying the application..."
flyctl deploy

echo "Deployment complete!"
echo "Your app is available at: https://$APP_NAME.fly.dev" 