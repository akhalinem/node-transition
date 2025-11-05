# Setup Log - Redis Installation

**Date**: November 6, 2025  
**Action**: Redis cache installation for development  
**System**: macOS (Apple Silicon - ARM64)

---

## Installation Summary

### Redis 8.2.3 Installation via Homebrew

**Command Used**:

```bash
brew install redis
```

**Installation Details**:

- **Version**: Redis 8.2.3 (Stable)
- **Architecture**: arm64 (Apple Silicon native)
- **OS**: Darwin 25.0.0 arm64
- **Mode**: Standalone
- **Default Port**: 6379
- **API**: kqueue (macOS native event notification)

---

## Service Configuration

**Start Service**:

```bash
brew services start redis
```

**Result**: Successfully started as background service  
**Launch Agent**: `~/Library/LaunchAgents/homebrew.mxcl.redis.plist`

**Service Status**:

```bash
brew services list | grep redis
# Output: redis started akhalinem ~/Library/LaunchAgents/homebrew.mxcl.redis.plist
```

---

## Verification Tests

### Version Check

```bash
redis-cli --version
```

**Output**: `redis-cli 8.2.3`

### Connection Test

```bash
redis-cli ping
```

**Output**: `PONG` ✅

### Server Information

```bash
redis-cli INFO server
```

**Key Details**:

- Redis Version: 8.2.3
- Process ID: Running as daemon
- Uptime: Active since service start
- TCP Port: 6379 (default)
- Supervised: No (managed by launchctl)

### Basic Operations Test

```bash
# Set a key
redis-cli SET test "Hello Redis"
# Output: OK

# Get the key
redis-cli GET test
# Output: "Hello Redis"

# Check if Redis is working
redis-cli PING
# Output: PONG
```

---

## Configuration Details

### Data Directory

- **Location**: `/opt/homebrew/var/db/redis/`
- **Persistence**: RDB snapshots + AOF (Append Only File)
- **Config File**: `/opt/homebrew/etc/redis.conf`

### Default Settings

- **Port**: 6379
- **Bind**: 127.0.0.1 (localhost only - secure by default)
- **Protected Mode**: Yes (only local connections)
- **Max Memory**: Not set (uses available RAM)
- **Persistence**: Enabled (saves data to disk)

### View Configuration

```bash
# View config file
cat /opt/homebrew/etc/redis.conf

# Check runtime config
redis-cli CONFIG GET "*"

# Check memory settings
redis-cli CONFIG GET maxmemory
```

---

## Key Findings

### ✅ Successful Aspects

1. **Clean Installation**:

   - No conflicts with existing software
   - Dependencies resolved automatically
   - Version 8.2.3 is latest stable

2. **Apple Silicon Native**:

   - ARM64 native build (no Rosetta needed)
   - Optimal performance on M-series chips
   - Uses native kqueue for event notification

3. **Service Management**:

   - Integrated with `brew services`
   - Auto-starts on login
   - Runs as daemon in background

4. **Security Defaults**:
   - Binds only to localhost (127.0.0.1)
   - Protected mode enabled
   - No password required for local connections
   - Secure by default for development

### 📝 Configuration Notes

1. **No Password Required**:

   - Local development uses default config
   - No authentication needed (protected mode handles security)
   - Can add password if needed: `redis-cli CONFIG SET requirepass "yourpassword"`

2. **Data Persistence**:

   - RDB snapshots saved periodically
   - AOF (Append Only File) for durability
   - Data survives restarts
   - Location: `/opt/homebrew/var/db/redis/`

3. **Port Configuration**:

   - Default Port: 6379
   - Available for connections on localhost
   - No conflicts with PostgreSQL (5432)

4. **Memory Management**:
   - No max memory limit by default
   - Can set with: `redis-cli CONFIG SET maxmemory 256mb`
   - Eviction policies available when memory full

### 🎯 Use Cases for Your Projects

1. **URL Shortener (Weeks 1-2)**:

   - Cache shortened URLs
   - Rate limiting counters
   - Analytics tracking

2. **Chat Platform (Weeks 3-5)**:

   - Pub/Sub for real-time messages
   - Session storage
   - Presence tracking (online users)
   - Message queues

3. **Microservices (Weeks 11-15)**:
   - Service discovery
   - Distributed caching
   - Inter-service communication
   - Queue management

---

## Quick Reference Commands

### Service Management

```bash
# Start service
brew services start redis

# Stop service
brew services stop redis

# Restart service
brew services restart redis

# Check status
brew services list | grep redis
```

### Redis CLI Operations

```bash
# Connect to Redis
redis-cli

# Test connection
redis-cli ping

# Set a key
redis-cli SET key value

# Get a key
redis-cli GET key

# List all keys
redis-cli KEYS "*"

# Delete a key
redis-cli DEL key

# Clear all data (careful!)
redis-cli FLUSHALL

# Get server info
redis-cli INFO

# Monitor commands in real-time
redis-cli MONITOR
```

### Common Data Types

```bash
# Strings
redis-cli SET name "John"
redis-cli GET name

# Lists
redis-cli LPUSH mylist "item1"
redis-cli LPUSH mylist "item2"
redis-cli LRANGE mylist 0 -1

# Sets
redis-cli SADD myset "member1"
redis-cli SMEMBERS myset

# Hashes
redis-cli HSET user:1 name "John"
redis-cli HSET user:1 age 30
redis-cli HGETALL user:1

# Sorted Sets
redis-cli ZADD leaderboard 100 "player1"
redis-cli ZRANGE leaderboard 0 -1 WITHSCORES
```

---

## Performance Characteristics

### Redis 8.2.3 Features

- **Speed**: In-memory data structure store (microsecond latency)
- **Persistence**: Optional RDB snapshots + AOF logging
- **Pub/Sub**: Built-in message broker
- **Atomic Operations**: All operations are atomic
- **Expiration**: Keys can auto-expire (TTL)
- **Transactions**: MULTI/EXEC for grouped operations

### Benchmarking

```bash
# Run benchmark (if redis-benchmark installed)
redis-benchmark -q -n 10000

# Expected results on Apple Silicon:
# SET: ~100,000 requests/second
# GET: ~100,000 requests/second
# INCR: ~100,000 requests/second
```

---

## Development Workflow

### For Node.js Projects

1. **Install Node.js Redis Client**:

   ```bash
   npm install redis
   ```

2. **Basic Connection Example**:

   ```javascript
   const redis = require("redis");
   const client = redis.createClient({
     host: "localhost",
     port: 6379,
   });

   await client.connect();
   await client.set("key", "value");
   const value = await client.get("key");
   console.log(value); // 'value'
   await client.disconnect();
   ```

3. **With Connection Pooling**:

   ```javascript
   const redis = require("redis");
   const client = redis.createClient({
     socket: {
       host: "localhost",
       port: 6379,
     },
   });

   client.on("error", (err) => console.log("Redis Client Error", err));
   await client.connect();
   ```

---

## Troubleshooting

### If redis-cli command not found

```bash
# Check installation
brew list redis

# Verify PATH
which redis-cli

# Should be at:
/opt/homebrew/bin/redis-cli
```

### If service won't start

```bash
# Check logs
tail -f /opt/homebrew/var/log/redis.log

# Check if port is in use
lsof -i :6379

# Try manual start to see errors
redis-server /opt/homebrew/etc/redis.conf
```

### If connection refused

```bash
# Check if running
ps aux | grep redis

# Check port
lsof -i :6379

# Restart service
brew services restart redis
```

### Clear all data (fresh start)

```bash
redis-cli FLUSHALL
# Or stop service and delete data directory
brew services stop redis
rm -rf /opt/homebrew/var/db/redis/*
brew services start redis
```

---

## Comparison: PostgreSQL vs Redis

| Aspect             | PostgreSQL          | Redis                           |
| ------------------ | ------------------- | ------------------------------- |
| **Type**           | Relational Database | In-Memory Data Store            |
| **Storage**        | Disk-based          | Memory-based (with persistence) |
| **Speed**          | Milliseconds        | Microseconds                    |
| **Data Structure** | Tables/Rows         | Key-Value, Lists, Sets, Hashes  |
| **Query Language** | SQL                 | Redis commands                  |
| **Use Case**       | Persistent data     | Caching, sessions, queues       |
| **Port**           | 5432                | 6379                            |
| **Durability**     | ACID compliant      | Optional persistence            |

### When to Use Which

**PostgreSQL**:

- Long-term data storage
- Complex queries and relationships
- ACID transactions required
- Data must survive server restarts

**Redis**:

- Temporary/cached data
- Session storage
- Real-time features (pub/sub)
- Rate limiting, counters
- Fast lookups needed

**Together** (common pattern):

- PostgreSQL: Source of truth (persistent data)
- Redis: Cache layer (fast access to frequently used data)

---

## Environment Details

**System Information**:

- OS: macOS 15.0 (Darwin 25.0.0)
- Architecture: arm64 (Apple Silicon)
- Shell: zsh
- User: akhalinem

**Installation Time**: ~2 minutes (including setup)

**Disk Space Used**: ~10MB (Redis is lightweight!)

---

## Next Steps

### For URL Shortener Project (Weeks 1-2)

1. **Install Node.js Redis Client**:

   ```bash
   cd 01-project-url-shortener
   npm install redis
   ```

2. **Test Connection**:

   ```javascript
   const redis = require("redis");
   const client = redis.createClient();

   await client.connect();
   await client.set("test", "Hello Redis!");
   const value = await client.get("test");
   console.log(value);
   await client.disconnect();
   ```

3. **Use Cases**:
   - Cache shortened URL mappings
   - Store click analytics in real-time
   - Rate limiting (prevent abuse)
   - Session management

---

## Decision Log

### Why Redis 8.2.3?

- ✅ Latest stable version (released 2024)
- ✅ Performance improvements over 7.x
- ✅ New features: improved memory efficiency
- ✅ Production-ready and battle-tested

### Why Direct Install vs Docker (for now)?

- ✅ Consistent with PostgreSQL approach
- ✅ Simpler for initial learning
- ✅ Better performance (no virtualization)
- ✅ Can switch to Docker in Week 3+

### Why Redis for Development?

- ✅ Essential for modern web applications
- ✅ Fast caching layer (reduces database load)
- ✅ Built-in pub/sub (real-time features)
- ✅ Industry standard (used by Twitter, GitHub, etc.)

---

## References

- Redis Documentation: https://redis.io/docs/
- Redis Commands: https://redis.io/commands/
- Homebrew Redis Formula: https://formulae.brew.sh/formula/redis
- Redis Node.js Client: https://github.com/redis/node-redis

---

_Installation completed successfully on November 6, 2025_  
_Redis and PostgreSQL now ready for URL Shortener project_
