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

## Deployment to Fly.io

### Prerequisites

- Install [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/)
- Sign up for a Fly.io account

### GitHub Actions Deployment (Recommended)

This project is configured to automatically deploy to Fly.io using GitHub Actions whenever you push to the main branch.

To set up GitHub Actions deployment:

1. Fork or push this repository to your GitHub account

2. Create a Fly.io API token:
   ```bash
   fly auth token
   ```

3. Add the token as a GitHub secret:
   - Go to your GitHub repository
   - Navigate to Settings > Secrets and variables > Actions
   - Create a new secret named `FLY_API_TOKEN` with the value from step 2

4. Initial setup (only needed once):
   ```bash
   # Create a new app on Fly.io
   fly apps create your-app-name
   
   # Set up required secrets
   fly secrets set SECRET_KEY="$(openssl rand -hex 32)" \
     DEBUG="False" \
     ALLOWED_HOSTS="your-app-name.fly.dev,localhost,127.0.0.1" \
     CORS_ALLOWED_ORIGINS="https://your-app-name.fly.dev,http://localhost:3000"
   
   # Update app name in fly.toml
   sed -i 's/app = "fitfusion"/app = "your-app-name"/' fly.toml
   
   # Commit and push to GitHub
   git add fly.toml
   git commit -m "Update app name for deployment"
   git push
   ```

5. Optional: Set up a database:
   ```bash
   # Create a PostgreSQL database
   fly postgres create --name your-app-name-db
   
   # Attach the database to your app
   fly postgres attach --app your-app-name your-app-name-db
   ```

6. Push to the main branch to trigger deployment:
   ```bash
   git push origin main
   ```

7. Monitor the deployment in the Actions tab of your GitHub repository

### Manual Deployment

You can also deploy manually using the provided script:

```bash
./deploy.sh
```

Or manually with Fly CLI:

```bash
# Login to Fly
fly auth login

# Deploy
fly deploy
```

## Project Structure

- `/client` - Next.js frontend application
- `/server` - Django backend API
- `/docker-compose.yml` - Development environment configuration
- `/Dockerfile` - Production Docker configuration
- `/fly.toml` - Fly.io configuration
- `/.github/workflows` - GitHub Actions workflows 