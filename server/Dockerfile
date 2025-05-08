FROM python:3.11-slim AS base

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ====================== DEVELOPMENT ======================
FROM base AS development

# Set environment variable for development
ENV ENVIRONMENT=development
ENV DEBUG=True

# Development specific dependencies
RUN pip install --no-cache-dir debugpy

# Copy the Django project for development
COPY . .

# Run the development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# ====================== PRODUCTION ======================
FROM base AS production

# Set environment variable for production
ENV ENVIRONMENT=production
ENV DEBUG=False

# Install Gunicorn for production
RUN pip install --no-cache-dir gunicorn

# Copy the Django project for production
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Run Gunicorn with workers in production
CMD ["gunicorn", "server.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2"] 