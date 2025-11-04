# 📚 Quick Reference - Node.js Backend Essentials

*Keep this handy for quick lookups!*

---

## 🚀 Common Commands

### Node.js
```bash
node script.js                    # Run a script
node --inspect script.js          # Debug with Chrome DevTools
node --expose-gc script.js        # Enable manual GC
node --trace-warnings script.js   # Show warning stack traces
node --prof script.js             # CPU profiling

# Check versions
node --version
npm --version
```

### NPM
```bash
npm init -y                       # Initialize package.json
npm install express               # Install package
npm install -D jest              # Install dev dependency
npm install                       # Install all dependencies
npm run dev                       # Run dev script
npm test                          # Run tests
npm outdated                      # Check outdated packages
```

### PostgreSQL
```bash
psql -U postgres                  # Connect to PostgreSQL
\l                               # List databases
\c database_name                 # Connect to database
\dt                              # List tables
\d table_name                    # Describe table
\q                               # Quit
```

### Redis
```bash
redis-cli                         # Connect to Redis
ping                             # Test connection
keys *                           # List all keys
get key                          # Get value
set key value                    # Set value
del key                          # Delete key
flushall                         # Clear all data (careful!)
```

### Docker
```bash
docker ps                         # List running containers
docker ps -a                      # List all containers
docker logs container_name        # View logs
docker exec -it container bash    # Enter container
docker-compose up -d              # Start services
docker-compose down               # Stop services
```

---

## ⚡ Node.js Patterns

### Async Patterns
```javascript
// Callback (old style)
fs.readFile('file.txt', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// Promise
fs.promises.readFile('file.txt')
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Async/Await (preferred)
try {
  const data = await fs.promises.readFile('file.txt');
  console.log(data);
} catch (err) {
  console.error(err);
}

// Promise.all - parallel execution
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts()
]);

// Promise.race - first to complete
const result = await Promise.race([
  fetchFromAPI(),
  timeout(5000)
]);
```

### Error Handling
```javascript
// Custom error class
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

// Try-catch with async/await
async function fetchUser(id) {
  try {
    const user = await db.findUser(id);
    if (!user) throw new NotFoundError('User not found');
    return user;
  } catch (error) {
    if (error instanceof NotFoundError) {
      // Handle not found
    }
    throw error; // Re-throw if unknown
  }
}

// Express error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message
  });
});
```

### Streams
```javascript
const fs = require('fs');
const { pipeline } = require('stream');

// Read stream
const readStream = fs.createReadStream('input.txt');

// Write stream
const writeStream = fs.createWriteStream('output.txt');

// Transform stream
const transformStream = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
});

// Pipeline (handles errors and cleanup)
pipeline(
  readStream,
  transformStream,
  writeStream,
  (err) => {
    if (err) console.error('Pipeline failed', err);
    else console.log('Pipeline succeeded');
  }
);
```

---

## 🗄️ Database Patterns

### PostgreSQL with pg
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mydb',
  password: 'password',
  port: 5432,
});

// Query with parameters (prevents SQL injection)
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  ['user@example.com']
);

// Transaction
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO users...');
  await client.query('INSERT INTO profiles...');
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
}
```

### Query Optimization
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user@example.com';

-- Create index
CREATE INDEX idx_users_email ON users(email);

-- Composite index
CREATE INDEX idx_users_name_age ON users(last_name, first_name);

-- Check indexes
SELECT * FROM pg_indexes WHERE tablename = 'users';
```

---

## 🔴 Redis Patterns

```javascript
const redis = require('redis');
const client = redis.createClient();

// Simple cache
await client.set('user:123', JSON.stringify(userData), {
  EX: 3600 // Expire in 1 hour
});

const cached = await client.get('user:123');
const user = cached ? JSON.parse(cached) : null;

// Rate limiting with sliding window
const key = `rate:${userId}:${Date.now()}`;
await client.incr(key);
await client.expire(key, 60); // 60 seconds window

// Pub/Sub
const publisher = redis.createClient();
const subscriber = redis.createClient();

await subscriber.subscribe('notifications', (message) => {
  console.log('Received:', message);
});

await publisher.publish('notifications', 'Hello World');
```

---

## 🧪 Testing Patterns

### Jest
```javascript
// Unit test
describe('User Service', () => {
  test('should create a user', async () => {
    const user = await userService.create({
      email: 'test@example.com'
    });
    
    expect(user).toHaveProperty('id');
    expect(user.email).toBe('test@example.com');
  });
  
  test('should throw error for duplicate email', async () => {
    await expect(
      userService.create({ email: 'existing@example.com' })
    ).rejects.toThrow('Email already exists');
  });
});

// Mock
jest.mock('../database');
const db = require('../database');
db.findUser.mockResolvedValue({ id: 1, name: 'John' });
```

### Supertest (API Testing)
```javascript
const request = require('supertest');
const app = require('../app');

describe('POST /api/users', () => {
  test('should create user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test' })
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
  });
});
```

---

## 📊 Monitoring & Debugging

### Logging
```javascript
// Structured logging with winston
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

logger.info('User created', { userId: 123, email: 'user@example.com' });
logger.error('Failed to process', { error: err.message });
```

### Performance
```javascript
// Measure execution time
console.time('operation');
await doSomething();
console.timeEnd('operation');

// Memory usage
const used = process.memoryUsage();
console.log(`Heap Used: ${Math.round(used.heapUsed / 1024 / 1024)} MB`);

// Event loop lag
const start = process.hrtime.bigint();
setImmediate(() => {
  const lag = Number(process.hrtime.bigint() - start) / 1e6;
  console.log(`Event loop lag: ${lag}ms`);
});
```

---

## 🔐 Security Essentials

```javascript
// Hash passwords (bcrypt)
const bcrypt = require('bcrypt');
const saltRounds = 10;

const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
const isValid = await bcrypt.compare(plainPassword, hashedPassword);

// JWT
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: 123, email: 'user@example.com' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

const decoded = jwt.verify(token, process.env.JWT_SECRET);

// Helmet (Express security headers)
const helmet = require('helmet');
app.use(helmet());

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

---

## 🎯 Environment Variables

```javascript
// .env file
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
JWT_SECRET=your-secret-key
NODE_ENV=development
PORT=3000

// Load with dotenv
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
const port = process.env.PORT || 3000;

// Type casting
const maxConnections = parseInt(process.env.MAX_CONNECTIONS || '10', 10);
const enableFeature = process.env.ENABLE_FEATURE === 'true';
```

---

## 📦 Useful Packages

### Essential
- `express` / `fastify` - Web frameworks
- `pg` - PostgreSQL client
- `redis` - Redis client
- `dotenv` - Environment variables
- `joi` / `zod` - Validation

### Testing
- `jest` - Test framework
- `supertest` - API testing
- `@faker-js/faker` - Test data generation

### Utilities
- `lodash` - Utility functions
- `dayjs` - Date manipulation
- `uuid` - Generate UUIDs

### Performance
- `clinic` - Performance profiling
- `autocannon` - HTTP benchmarking

### Monitoring
- `winston` - Logging
- `prom-client` - Prometheus metrics

---

## 🔍 Debugging Tips

```bash
# Debug mode
DEBUG=* node script.js

# Inspect with Chrome DevTools
node --inspect-brk script.js
# Then open chrome://inspect

# Trace async operations
node --trace-warnings --trace-async script.js

# Memory leak detection
node --inspect --expose-gc script.js
```

---

*Save this file and reference it whenever you're stuck!*

*Last Updated: November 2025*
