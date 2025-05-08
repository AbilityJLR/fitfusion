# FitFusion API

This is the FastAPI backend for FitFusion application.

## Development Setup

1. Run the setup script:
```bash
./setup_dev.sh
```

This script will:
- Create a virtual environment
- Install dependencies
- Create a .env file
- Run database migrations

2. Run the server:
```bash
source venv/bin/activate
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

## Database Configuration

### Local Development
For local development, you need PostgreSQL installed and running with:
- Database name: fitfusion
- Username: postgres
- Password: postgres

You can adjust these settings in development.env.

### Production (fly.io)
The production environment uses a PostgreSQL database on fly.io:
- Host: fitfusion-db.flycast
- Database name: fitfusion

Environment variables needed for production:
- DB_PASSWORD: PostgreSQL database password
- SECRET_KEY: JWT secret key

## Deployment to fly.io

1. Install the fly CLI:
```bash
# MacOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

2. Login to fly.io:
```bash
fly auth login
```

3. Deploy the application:
```bash
# Set required environment variables
export DB_PASSWORD=your_password_here
export SECRET_KEY=your_secret_key_here

# Deploy
./deploy.sh
```

## API Documentation

Once the server is running, you can access:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database Migrations

This project uses Alembic for database migrations:

Create a new migration:
```bash
alembic revision --autogenerate -m "description"
```

Apply migrations:
```bash
alembic upgrade head
``` 