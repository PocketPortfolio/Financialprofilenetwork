# Self-Hosting Pocket Portfolio

Pocket Portfolio is designed to be self-hosted, giving you complete control over your data and privacy. This guide will walk you through deploying Pocket Portfolio on your own infrastructure.

## Prerequisites

- Docker and Docker Compose installed
- At least 2GB RAM available
- 10GB disk space
- Domain name (optional, for production)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/PocketPortfolio/Financialprofilenetwork.git
cd Financialprofilenetwork
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Firebase Configuration (if using cloud sync)
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-auth-domain
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-storage-bucket
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id

# Optional: Database (for future use)
# DATABASE_URL=postgresql://user:password@postgres:5432/pocketportfolio
```

**Note:** For local-first usage (no cloud sync), you can skip Firebase configuration. The app will work entirely with localStorage.

### 3. Build and Run

```bash
# Build the Docker image
docker-compose build

# Start the application
docker-compose up -d

# View logs
docker-compose logs -f app
```

The application will be available at `http://localhost:3000`.

## Production Deployment

### Option 1: Docker Compose (Recommended for VPS)

1. **Update environment variables** for production:
   ```bash
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```

2. **Set up reverse proxy** (Nginx or Traefik):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable HTTPS** with Let's Encrypt:
   ```bash
   certbot --nginx -d your-domain.com
   ```

### Option 2: Railway

1. Connect your GitHub repository to Railway
2. Railway will automatically detect the Dockerfile
3. Add environment variables in Railway dashboard
4. Deploy!

### Option 3: Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `docker build -t pocket-portfolio .`
4. Set start command: `docker run -p 3000:3000 pocket-portfolio`
5. Add environment variables
6. Deploy!

### Option 4: DigitalOcean App Platform

1. Create a new App from GitHub
2. Select Docker as the source type
3. Configure environment variables
4. Deploy!

## Architecture

### Container Structure

- **app**: Next.js application (port 3000)
- **postgres** (optional): PostgreSQL database for future features

### Data Storage

- **Local-first**: All portfolio data stored in browser localStorage
- **Cloud sync** (optional): Firebase Firestore for authenticated users
- **No server-side storage required** for basic functionality

## Environment Variables

### Required

- `NEXT_PUBLIC_SITE_URL`: Your site URL (e.g., `https://your-domain.com`)

### Optional (for cloud sync)

- `FIREBASE_API_KEY`: Firebase API key
- `FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `FIREBASE_APP_ID`: Firebase app ID

### Optional (for database)

- `DATABASE_URL`: PostgreSQL connection string (for future features)

## Health Checks

The application includes a health check endpoint at `/api/health`:

```bash
curl http://localhost:3000/api/health
```

This endpoint returns:
- Status: `operational`, `degraded`, or `offline`
- Market data latency
- Database latency (if configured)
- Timestamp

## Troubleshooting

### Build Fails

**Issue:** Docker build fails with memory errors

**Solution:** Increase Docker memory limit to at least 4GB

```bash
# Docker Desktop: Settings > Resources > Memory > 4GB
```

### Port Already in Use

**Issue:** Port 3000 is already in use

**Solution:** Change the port in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Use port 3001 instead
```

### Environment Variables Not Loading

**Issue:** Environment variables not available in the app

**Solution:** Ensure `.env` file is in the root directory and restart containers:

```bash
docker-compose down
docker-compose up -d
```

### Health Check Fails

**Issue:** Health check endpoint returns 500

**Solution:** Check application logs:

```bash
docker-compose logs app
```

Common issues:
- Missing environment variables
- Firebase configuration errors
- Port conflicts

## Performance Optimization

### Caching

Next.js automatically caches:
- Static pages (ISR with 7-day revalidation)
- API responses (20s cache with stale-while-revalidate)
- Images (optimized and cached)

### Resource Limits

For production, consider setting resource limits in `docker-compose.yml`:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Security

### Firewall

Ensure only necessary ports are exposed:
- `3000`: Application (or use reverse proxy)
- `5432`: PostgreSQL (only if using, and restrict to internal network)

### Updates

Keep Docker images updated:

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose build
docker-compose up -d
```

### Secrets Management

Never commit `.env` files. Use:
- Docker secrets (for Docker Swarm)
- Kubernetes secrets (for Kubernetes)
- Environment variables in your hosting platform

## Backup

### Local Data

Since Pocket Portfolio is local-first, user data is stored in browser localStorage. For backups:

1. Users can export their portfolio data as JSON from the dashboard
2. Implement automated backups if using cloud sync (Firebase)

### Database (if using PostgreSQL)

```bash
# Backup
docker-compose exec postgres pg_dump -U pocketportfolio pocketportfolio > backup.sql

# Restore
docker-compose exec -T postgres psql -U pocketportfolio pocketportfolio < backup.sql
```

## Monitoring

### Logs

View application logs:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
```

### Metrics

Monitor container resources:

```bash
docker stats
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/PocketPortfolio/Financialprofilenetwork/issues
- Documentation: https://www.pocketportfolio.app/docs

## License

MIT License - see [LICENSE](https://github.com/PocketPortfolio/Financialprofilenetwork/blob/main/LICENSE) for details.









