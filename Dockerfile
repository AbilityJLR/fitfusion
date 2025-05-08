# Stage 1: Build the Next.js client
FROM node:20-alpine AS client-builder

WORKDIR /app/client

# Copy client package.json and install dependencies
COPY client/package*.json ./
RUN npm ci

# Copy the rest of the client code
COPY client/ ./

# Build the Next.js application
RUN npm run build

# Stage 2: Build the Django server
FROM python:3.11-slim AS server-builder

WORKDIR /app/server

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn

# Copy the Django project
COPY server/ .

# Stage 3: Final production image
FROM python:3.11-slim

WORKDIR /app

# Install Nginx for static file serving
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy Python environment from server-builder
COPY --from=server-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=server-builder /usr/local/bin /usr/local/bin

# Copy built Next.js files from client-builder
COPY --from=client-builder /app/client/.next/standalone /app/client
COPY --from=client-builder /app/client/.next/static /app/client/.next/static
COPY --from=client-builder /app/client/public /app/client/public

# Copy Django application from server-builder
COPY --from=server-builder /app/server /app/server

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/sites-available/default

# Add startup script
COPY start.sh /app/
RUN chmod +x /app/start.sh

# Expose port
EXPOSE 8080

# Start services
CMD ["/app/start.sh"] 