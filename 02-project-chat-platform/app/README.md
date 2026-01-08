# Docker Quick Reference

## Development

```bash
# Start development environment (with hot reload)
docker compose up

# Or using npm script
npm run docker:dev

# Start in detached mode
docker compose up -d

# View logs
docker compose logs -f app
npm run docker:logs

# Rebuild after dependency changes
docker compose up --build

# Stop and remove volumes (clean slate)
docker compose down -v
npm run docker:dev:down

# Execute commands in running container
docker compose exec app npm install <package>
docker compose exec app sh
```

## Production

```bash
# Start production environment
docker compose -f docker-compose.prod.yml up --build -d
npm run docker:prod

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop production
docker compose -f docker-compose.prod.yml down
npm run docker:prod:down

# Scale application (multiple instances)
docker compose -f docker-compose.prod.yml up -d --scale app=3
```

## Useful Commands

```bash
# Check running containers
docker compose ps

# Check resource usage
docker stats

# Access postgres
docker compose exec postgres psql -U postgres -d chatapp

# Access redis
docker compose exec redis redis-cli

# Clean up everything
docker compose down -v --rmi all
docker system prune -a --volumes
```

## Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

## Key Features

- ✅ **Hot Reload**: Source code changes reflect immediately in dev
- ✅ **Health Checks**: All services monitored
- ✅ **Volume Persistence**: Data survives container restarts
- ✅ **Network Isolation**: Services communicate via private network
- ✅ **Multi-stage Builds**: Optimized production images
- ✅ **Security**: Non-root user in production
- ✅ **Resource Limits**: Production has CPU/memory constraints
