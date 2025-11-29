# Docker Setup

This project includes Docker Compose configurations for both development and production environments.

## Quick Start

### Production Build

```bash
docker-compose up --build
```

This will:
- Build and start the backend API on `http://localhost:8000`
- Build and start the frontend on `http://localhost:3000`
- Create a persistent SQLite database volume

### Development Mode (with hot reload)

```bash
docker-compose -f docker-compose.dev.yml up --build
```

This will:
- Start both services with hot reload enabled
- Mount source code as volumes for live updates
- Use development configurations

## Services

### Backend
- **Port**: 8000
- **Health Check**: `http://localhost:8000/healthz`
- **API Docs**: `http://localhost:8000/docs`
- **Database**: SQLite (persisted in `./backend/data.db`)

### Frontend
- **Port**: 3000
- **URL**: `http://localhost:3000`

## Environment Variables

You can set environment variables in a `.env` file in the project root:

```env
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

## Useful Commands

```bash
# Start services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build --force-recreate

# Remove volumes (clears database)
docker-compose down -v
```

## Development vs Production

- **Production** (`docker-compose.yml`): Optimized builds, no hot reload
- **Development** (`docker-compose.dev.yml`): Hot reload, source code mounted as volumes



