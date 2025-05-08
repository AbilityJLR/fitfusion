FROM python:3.11-slim AS development

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

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir watchdog

# Copy the Django project
COPY . .

# Expose port
EXPOSE 8000

# Run Django development server with hot reloading
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000", "--noreload=False"] 