# Tapestry Deployment Runbook

This document provides step-by-step instructions for deploying and managing the Tapestry application in production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Deployment Methods](#deployment-methods)
4. [Database Operations](#database-operations)
5. [Monitoring & Health Checks](#monitoring--health-checks)
6. [Troubleshooting](#troubleshooting)
7. [Rollback Procedures](#rollback-procedures)
8. [Security Checklist](#security-checklist)

---

## Prerequisites

### Required Tools
- Docker 24.0+ and Docker Compose v2
- Access to the deployment server(s)
- PostgreSQL client (for database operations)
- Git access to the repository

### Required Secrets
Ensure these secrets are configured in your deployment environment:

| Secret | Description | Example |
|--------|-------------|---------|
| `SECRET_KEY` | JWT signing key (min 32 chars) | Generated via `python -c 'import secrets; print(secrets.token_urlsafe(32))'` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/tapestry` |
| `CORS_ORIGINS` | Allowed frontend origins | `https://app.example.com` |

---

## Environment Setup

### 1. Generate Secrets

```bash
# Generate a secure secret key
export SECRET_KEY=$(python -c 'import secrets; print(secrets.token_urlsafe(32))')
echo "SECRET_KEY=$SECRET_KEY"

# Or using openssl
openssl rand -base64 32
```

### 2. Create Environment File

Create a `.env` file (do NOT commit to git):

```bash
# Application
ENVIRONMENT=production
SECRET_KEY=your-generated-secret-key

# Database
DATABASE_URL=postgresql://tapestry:secure_password@db:5432/tapestry
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20

# CORS
CORS_ORIGINS=https://your-domain.com

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=1 minute

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# Security
ENABLE_SECURITY_HEADERS=true
```

### 3. Frontend Environment

```bash
# For the frontend container
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
```

---

## Deployment Methods

### Method 1: Docker Compose (Recommended for Single Server)

```bash
# Pull latest images
docker compose pull

# Start services
docker compose up -d

# View logs
docker compose logs -f

# Check health
docker compose ps
```

### Method 2: Manual Docker Deployment

```bash
# Build images
docker build -t tapestry-backend:latest ./backend
docker build -t tapestry-frontend:latest ./frontend \
  --build-arg NEXT_PUBLIC_API_URL=https://api.your-domain.com/api

# Create network
docker network create tapestry-net

# Run PostgreSQL
docker run -d \
  --name tapestry-db \
  --network tapestry-net \
  -e POSTGRES_USER=tapestry \
  -e POSTGRES_PASSWORD=secure_password \
  -e POSTGRES_DB=tapestry \
  -v tapestry-data:/var/lib/postgresql/data \
  postgres:16-alpine

# Run Backend
docker run -d \
  --name tapestry-backend \
  --network tapestry-net \
  -p 8000:8000 \
  --env-file .env \
  tapestry-backend:latest

# Run Frontend
docker run -d \
  --name tapestry-frontend \
  --network tapestry-net \
  -p 3000:3000 \
  tapestry-frontend:latest
```

### Method 3: CI/CD Deployment

Deployments are automated via GitHub Actions:

1. **Staging**: Push to `main` branch triggers automatic deployment
2. **Production**: Create a version tag (e.g., `v1.0.0`) or manually trigger workflow

```bash
# Create a release tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

---

## Database Operations

### Running Migrations

```bash
# Via Docker Compose
docker compose exec backend alembic upgrade head

# Check current revision
docker compose exec backend alembic current

# View migration history
docker compose exec backend alembic history

# Create new migration
docker compose exec backend alembic revision --autogenerate -m "description"
```

### Database Backup

```bash
# Create backup
docker compose exec db pg_dump -U tapestry tapestry > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
docker compose exec db pg_dump -U tapestry tapestry | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Database Restore

```bash
# Restore from backup
docker compose exec -T db psql -U tapestry tapestry < backup.sql

# From compressed backup
gunzip -c backup.sql.gz | docker compose exec -T db psql -U tapestry tapestry
```

---

## Monitoring & Health Checks

### Health Endpoints

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `GET /healthz` | Basic health check | `{"status": "ok"}` |
| `GET /readyz` | Readiness check | `{"status": "ready"}` |

### Manual Health Check

```bash
# Check backend health
curl -s http://localhost:8000/healthz | jq .

# Check with timeout
curl -s --max-time 5 http://localhost:8000/healthz || echo "Health check failed"
```

### Log Monitoring

```bash
# View all logs
docker compose logs -f

# Backend logs only
docker compose logs -f backend

# Filter for errors
docker compose logs backend 2>&1 | grep -i error

# JSON log parsing (if using JSON format)
docker compose logs backend 2>&1 | jq -r 'select(.level == "ERROR")'
```

### Container Resource Usage

```bash
# Check resource usage
docker stats tapestry-backend tapestry-frontend tapestry-db

# Check container health
docker inspect --format='{{.State.Health.Status}}' tapestry-backend
```

---

## Troubleshooting

### Common Issues

#### 1. Application Won't Start

```bash
# Check logs for errors
docker compose logs backend --tail 100

# Verify environment variables
docker compose exec backend env | grep -E "(SECRET|DATABASE|CORS)"

# Test database connection
docker compose exec backend python -c "from app.db.session import engine; engine.connect(); print('DB OK')"
```

#### 2. Database Connection Issues

```bash
# Test database connectivity
docker compose exec db pg_isready -U tapestry

# Check database logs
docker compose logs db --tail 50

# Verify database exists
docker compose exec db psql -U tapestry -c "\l"
```

#### 3. Rate Limiting Issues

```bash
# Check current rate limit status in logs
docker compose logs backend | grep -i "rate limit"

# Temporarily disable rate limiting (not recommended for production)
# Set RATE_LIMIT_ENABLED=false in environment
```

#### 4. CORS Errors

```bash
# Verify CORS configuration
docker compose exec backend python -c "from app.config import settings; print(settings.cors_origins_list)"

# Test CORS headers
curl -I -X OPTIONS http://localhost:8000/api/auth/login \
  -H "Origin: https://your-frontend.com" \
  -H "Access-Control-Request-Method: POST"
```

### Debug Mode

For detailed debugging (use temporarily only):

```bash
# Enable debug logging
docker compose exec backend \
  LOG_LEVEL=DEBUG \
  python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## Rollback Procedures

### Application Rollback

```bash
# List available image tags
docker images tapestry-backend --format "{{.Tag}}"

# Rollback to previous version
docker compose down
docker tag tapestry-backend:previous tapestry-backend:latest
docker compose up -d

# Or specify version in docker-compose
# image: tapestry-backend:v1.0.0
```

### Database Rollback

```bash
# Rollback one migration
docker compose exec backend alembic downgrade -1

# Rollback to specific revision
docker compose exec backend alembic downgrade <revision_id>

# Restore from backup (last resort)
docker compose exec -T db psql -U tapestry tapestry < backup.sql
```

---

## Security Checklist

### Pre-Deployment

- [ ] SECRET_KEY is unique and securely generated (32+ characters)
- [ ] DATABASE_URL uses a strong password
- [ ] CORS_ORIGINS only includes trusted domains
- [ ] SSL/TLS certificates are valid and configured
- [ ] Firewall rules restrict database access
- [ ] Environment files are not committed to git

### Post-Deployment

- [ ] Health endpoints are responding
- [ ] HTTPS is enforced (HTTP redirects to HTTPS)
- [ ] Security headers are present (check with security scanner)
- [ ] Rate limiting is active
- [ ] Logs are being collected (no sensitive data exposed)
- [ ] Database backups are scheduled

### Verification Commands

```bash
# Check security headers
curl -I https://your-api.com/healthz

# Expected headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Strict-Transport-Security: max-age=...
# Content-Security-Policy: ...

# Test rate limiting
for i in {1..150}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/healthz; done | sort | uniq -c
# Should see 429 responses after limit exceeded
```

---

## Contact & Escalation

For production incidents:

1. Check this runbook for common solutions
2. Review application logs for error details
3. Check monitoring dashboards for anomalies
4. If unable to resolve, escalate to the development team

---

**Last Updated**: Production deployment setup
**Document Version**: 1.0

