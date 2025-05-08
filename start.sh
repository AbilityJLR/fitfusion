#!/bin/bash
set -e

# Start Nginx
service nginx start

# Start Next.js server
cd /app/client
node server.js &

# Start Django server with Gunicorn
cd /app/server
gunicorn server.wsgi:application --bind 0.0.0.0:8000 --workers 2 &

# Keep the container running
tail -f /dev/null 