#!/bin/bash
set -e

# Start Nginx
service nginx start

# Collect Django static files
cd /app/server
python manage.py collectstatic --noinput

# Start Next.js server
cd /app/client
export PORT=3000
echo "Starting Next.js server on port $PORT..."
if [ -f "server.js" ]; then
  node server.js &
else
  echo "Error: server.js not found in $(pwd)"
  ls -la
fi

# Start Django server with Gunicorn
cd /app/server
echo "Starting Django server..."
gunicorn server.wsgi:application --bind 0.0.0.0:8000 --workers 2 &

# Wait for services to be available
echo "Waiting for services to start..."
sleep 10

# Keep the container running and echo logs
echo "All services started. Watching logs..."
tail -f /var/log/nginx/access.log /var/log/nginx/error.log 