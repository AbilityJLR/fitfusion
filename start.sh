#!/bin/bash
set -e

echo "Starting services with ENVIRONMENT=${ENVIRONMENT:-development}"

# Start Nginx
service nginx start

# For production environment only
if [ "$ENVIRONMENT" = "production" ]; then
  # Collect Django static files
  cd /app/server
  echo "Collecting static files..."
  python manage.py collectstatic --noinput

  # Start Next.js server
  cd /app/client
  export PORT=3000
  echo "Starting Next.js production server on port $PORT..."
  if [ -f "server.js" ]; then
    node server.js &
  else
    echo "Error: server.js not found in $(pwd), falling back to npm start"
    npm start &
  fi

  # Start Django server with Gunicorn
  cd /app/server
  echo "Starting Django production server..."
  gunicorn server.wsgi:application --bind 0.0.0.0:8000 --workers 2 &
else
  # Start Next.js development server
  cd /app/client
  export PORT=3000
  echo "Starting Next.js development server on port $PORT..."
  npm run dev &

  # Start Django development server
  cd /app/server
  echo "Starting Django development server..."
  python manage.py runserver 0.0.0.0:8000 &
fi

# Wait for services to be available
echo "Waiting for services to start..."
sleep 10

# Keep the container running and echo logs
echo "All services started. Watching logs..."
tail -f /var/log/nginx/access.log /var/log/nginx/error.log 