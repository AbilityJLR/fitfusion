#!/bin/bash
set -e

# Navigate to server directory
cd "$(dirname "$0")"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
  echo "Creating .env file from development.env..."
  cp development.env .env
fi

# Run database migrations
echo "Setting up the database..."
export ENV=development
if command -v alembic &> /dev/null; then
  alembic upgrade head
else
  pip install alembic
  alembic upgrade head
fi

echo "Setup complete! Run the server with:"
echo "source venv/bin/activate && uvicorn main:app --reload" 