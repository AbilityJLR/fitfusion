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

# Ask for app name
read -p "Enter your app name: " APP_NAME
if [ -z "$APP_NAME" ]; then
    echo "App name is required."
    exit 1
fi

# Update fly.toml
sed -i.bak "s/app = \"fitfusion\"/app = \"$APP_NAME\"/" fly.toml

# Ask for region
read -p "Enter your preferred region (default: sin): " REGION
REGION=${REGION:-sin}
sed -i.bak "s/primary_region = \"sin\"/primary_region = \"$REGION\"/" fly.toml

# Create app if it doesn't exist
if ! flyctl apps list | grep -q "$APP_NAME"; then
    echo "Creating new app: $APP_NAME"
    flyctl apps create "$APP_NAME" --machines
fi

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
    
    # Attach database to the app
    flyctl postgres attach --app "$APP_NAME" "$APP_NAME-db"
fi

# Generate and display Fly.io API token
echo ""
echo "=== GITHUB ACTIONS SETUP ==="
echo "1. Generate a Fly.io API token by running: fly auth token"
echo "2. Add this token as a GitHub secret named FLY_API_TOKEN"
echo "3. Commit and push your changes to GitHub"
echo ""
echo "Your app will be deployed automatically when you push to the main branch."
echo "You can also trigger a deployment manually from the GitHub Actions tab." 