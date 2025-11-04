# Docker vs Direct Install - Complete Guide

Understanding when to use Docker containers vs direct installation for databases.

---

## Quick Comparison

| Aspect                | Direct Install   | Docker                               |
| --------------------- | ---------------- | ------------------------------------ |
| **Setup Time**        | 5-10 minutes     | 1-2 minutes (after Docker installed) |
| **Performance**       | Native (fastest) | ~5-10% overhead                      |
| **Data Persistence**  | Automatic        | Requires volumes                     |
| **Multiple Versions** | Complex          | Easy                                 |
| **Cleanup**           | Difficult        | Simple (`docker rm`)                 |
| **Production-Like**   | No               | Yes                                  |
| **Learning Curve**    | Database only    | Database + Docker                    |

---

## PostgreSQL

### Direct Install (Recommended for Weeks 1-2)

**macOS**:

```bash
# Install
brew install postgresql@15

# Start service
brew services start postgresql@15

# Connect
psql postgres

# Create database
createdb mydb

# Stop service
brew services stop postgresql@15
```

**Ubuntu/Debian**:

```bash
# Install
sudo apt update
sudo apt install postgresql-15

# Start service
sudo systemctl start postgresql

# Connect
sudo -u postgres psql

# Create user
sudo -u postgres createuser --interactive
```

**Windows**:

- Download installer from https://www.postgresql.org/download/windows/
- Run installer, follow prompts
- Use pgAdmin or `psql` from Start menu

**Pros**:

- ✅ Always available (runs as service)
- ✅ Best performance
- ✅ Simple connection (`psql` just works)
- ✅ Data persists automatically
- ✅ Focus on learning Postgres, not Docker

**Cons**:

- ❌ System-wide installation
- ❌ Harder to remove completely
- ❌ One version at a time

---

### Docker (Recommended for Week 3+)

**Basic Setup**:

```bash
# Run Postgres container
docker run -d \
  --name postgres \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=password \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:15

# Connect
docker exec -it postgres psql -U postgres

# Or from host (need psql installed)
psql -h localhost -U postgres
```

**With docker-compose.yml** (Recommended):

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:15
    container_name: postgres
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_USER: postgres
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres-data:
```

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Stop and remove data
docker-compose down -v
```

**Pros**:

- ✅ Isolated per project
- ✅ Easy to start/stop
- ✅ Easy cleanup
- ✅ Run multiple versions
- ✅ Matches production
- ✅ Portable across platforms

**Cons**:

- ❌ Need to learn Docker
- ❌ Need psql installed separately for host connections
- ❌ Data lost if no volumes (easy mistake)
- ❌ Slight performance overhead

---

## Redis

### Direct Install

**macOS**:

```bash
# Install
brew install redis

# Start service
brew services start redis

# Test
redis-cli ping
# Should return: PONG

# Stop service
brew services stop redis
```

**Ubuntu/Debian**:

```bash
# Install
sudo apt install redis-server

# Start
sudo systemctl start redis-server

# Test
redis-cli ping
```

**Windows**:

- Use WSL2 or Docker (no native Windows build)

---

### Docker

**Basic Setup**:

```bash
# Run Redis container
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7

# Test
docker exec -it redis redis-cli ping
```

**With docker-compose.yml**:

```yaml
services:
  redis:
    image: redis:7
    container_name: redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  redis-data:
```

---

## MongoDB

### Direct Install

**macOS**:

```bash
# Install
brew tap mongodb/brew
brew install mongodb-community

# Start service
brew services start mongodb-community

# Connect
mongosh

# Stop service
brew services stop mongodb-community
```

**Ubuntu/Debian**:

```bash
# Import GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add repo
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install
sudo apt update
sudo apt install mongodb-org

# Start
sudo systemctl start mongod
```

---

### Docker

**Basic Setup**:

```bash
# Run MongoDB container
docker run -d \
  --name mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -v mongo-data:/data/db \
  mongo:7

# Connect
docker exec -it mongo mongosh -u admin -p password
```

**With docker-compose.yml**:

```yaml
services:
  mongo:
    image: mongo:7
    container_name: mongo
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

volumes:
  mongo-data:
```

---

## Recommended Strategy for Your 20-Week Journey

### Weeks 1-2: URL Shortener

**Use**: Direct Install (Postgres + Redis)

- **Why**: Focus on Node.js and database fundamentals
- **Benefit**: Less complexity, faster development
- **Install**: `brew install postgresql redis` (Mac)

### Weeks 3-5: Chat Platform

**Switch to**: Docker

- **Why**: Start learning Docker, need isolated environments
- **Benefit**: Easy cleanup, better organization
- **Setup**: Create `docker-compose.yml` per project

### Weeks 6-10: E-Commerce API

**Use**: Docker Compose

- **Why**: Multiple services (Postgres, Redis, maybe Mongo)
- **Benefit**: One command to start everything

### Weeks 11-15: Microservices

**Use**: Docker Compose (essential)

- **Why**: Multiple services that need to communicate
- **Benefit**: Simulate production-like environment

### Weeks 16-20: Analytics API

**Use**: Docker Compose + production considerations

- **Why**: Performance testing, scaling scenarios
- **Benefit**: Can simulate distributed systems

---

## Common Issues & Solutions

### Direct Install Issues

**"Connection refused" on localhost**:

```bash
# Check if service is running (Mac)
brew services list

# Start if not running
brew services start postgresql
```

**"psql: command not found"**:

```bash
# Add to PATH (Mac)
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Permission denied**:

```bash
# Fix permissions (Mac)
chmod 700 /usr/local/var/postgres
```

---

### Docker Issues

**"Cannot connect to Docker daemon"**:

- Make sure Docker Desktop is running
- Restart Docker Desktop

**"Port already in use"**:

```bash
# Check what's using the port
lsof -i :5432

# Change port mapping
docker run -p 5433:5432 postgres  # Use 5433 on host
```

**"Data lost after restart"**:

- Always use named volumes: `-v postgres-data:/var/lib/postgresql/data`
- Or bind mounts: `-v $(pwd)/data:/var/lib/postgresql/data`

**Container won't start**:

```bash
# Check logs
docker logs postgres

# Common fix: remove old container
docker rm -f postgres
docker volume rm postgres-data
# Then recreate
```

---

## Performance Comparison

**Benchmark Results** (typical dev machine):

| Operation     | Direct Install | Docker |
| ------------- | -------------- | ------ |
| Connection    | ~1ms           | ~1-2ms |
| Simple Query  | ~0.5ms         | ~0.6ms |
| Complex Query | ~10ms          | ~11ms  |
| Bulk Insert   | ~100ms         | ~110ms |

**Verdict**: Docker overhead is negligible for development. Performance difference only matters at scale.

---

## Data Persistence

### Direct Install

- **Data location**:
  - Mac: `/usr/local/var/postgres`
  - Linux: `/var/lib/postgresql`
  - Windows: `C:\Program Files\PostgreSQL\data`
- **Automatic**: Yes, data persists across restarts
- **Backup**: Use `pg_dump` / `pg_restore`

### Docker

- **Without volumes**: Data lost when container deleted
- **With named volumes**: Data persists in Docker volume
- **With bind mounts**: Data persists in host directory
- **Backup**: Copy volume or use `pg_dump`

**Example - Backing up Docker Postgres**:

```bash
# Dump database
docker exec postgres pg_dump -U postgres mydb > backup.sql

# Restore
docker exec -i postgres psql -U postgres mydb < backup.sql
```

---

## When to Switch

### Stay with Direct Install If:

- You're struggling with Docker concepts
- You want maximum performance (competitive programming, benchmarks)
- You're only building one project
- You have a powerful machine and don't mind services running

### Switch to Docker If:

- You're comfortable with containers
- You need multiple database versions
- You want easy project isolation
- You're preparing for production deployment
- You need to simulate distributed systems

---

## Complete Setup Examples

### Week 1 Setup (Direct Install)

```bash
# macOS
brew install postgresql@15 redis

# Start services
brew services start postgresql@15
brew services start redis

# Verify
psql postgres -c "SELECT version();"
redis-cli ping

# Create project database
createdb url_shortener_db
```

---

### Week 3 Setup (Docker)

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: chat_platform
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpass
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dev"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres-data:
  redis-data:
```

```bash
# Start everything
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

---

## Best Practices

### Direct Install

1. **Use version managers** when possible
2. **Document setup steps** in project README
3. **Create separate databases** per project
4. **Regular backups** of data directory
5. **Stop services** when not in use (save resources)

### Docker

1. **Always use volumes** for data persistence
2. **Use docker-compose** for multi-container setups
3. **Name containers** for easy reference
4. **Use healthchecks** to ensure services are ready
5. **Document compose file** with comments
6. **Commit compose file** to git
7. **Add .env file** for secrets (add to .gitignore)

---

## Conclusion

**For your learning journey**:

- **Simple is better**: Start with direct install
- **Progressive complexity**: Add Docker as you grow
- **Production-ready**: End with Docker Compose

Both approaches are valid. The key is matching the tool to your current learning phase.

---

_Last Updated: November 2025_
