# FitFusion

A fitness application with Next.js frontend and Django backend.

## Development

### Prerequisites

- Docker and Docker Compose
- Node.js (for local client development)
- Python (for local server development)

### Setup with Docker

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/fitfusion.git
   cd fitfusion
   ```

2. Start development environment:
   ```bash
   docker-compose up
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### Local Development

#### Client (Next.js)

```bash
cd client
npm install
npm run dev
```

#### Server (Django)

```bash
cd server
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Environment Setup

FitFusion supports separate development and production environments:

### Development Environment

The development environment is optimized for local development with:
- Hot reloading for both Next.js and Django
- SQLite or PostgreSQL database options
- Debug mode enabled
- Easy setup with Docker Compose

To start the development environment:

```bash
./dev.sh
```

This will start all services in development mode. You can access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/
- Django Admin: http://localhost:8000/admin/

To view logs while developing:

```bash
./dev.sh --logs
```

### Production Environment

The production environment is optimized for deployment with:
- Built and minified frontend assets
- Production-ready Django with Gunicorn
- PostgreSQL database required
- Enhanced security settings
- Nginx for serving static files and proxying requests

To test the production environment locally:

```bash
./prod-local.sh
```

This will build and start all services in production mode locally. You can access:
- Application: http://localhost
- API: http://localhost/api/
- Admin: http://localhost/admin/

### Deployment to Fly.io

To deploy to Fly.io:

1. Ensure you have the Fly CLI installed and are logged in
2. Set up your PostgreSQL database on Fly.io or elsewhere
3. Run the deployment script:

```bash
export DATABASE_URL=postgres://username:password@hostname:port/database
./deploy.sh
```

The script will set all necessary environment variables and deploy your application.

## Project Structure

- `/client` - Next.js frontend application
- `/server` - Django backend API
- `/docker-compose.yml` - Development environment configuration
- `/Dockerfile` - Production Docker configuration
- `/fly.toml` - Fly.io configuration
- `/.github/workflows` - GitHub Actions workflows 