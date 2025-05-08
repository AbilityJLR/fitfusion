#!/bin/bash
set -e

# Navigate to server directory
cd "$(dirname "$0")"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
  source venv/bin/activate
else
  echo "Virtual environment not found. Please run ./setup_dev.sh first."
  exit 1
fi

# Set environment variables
export ENV=development

# Run the server
echo "Starting development server..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000 