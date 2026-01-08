# Project Setup Guide

This guide will walk you through setting up the Real-Time Chat Platform project from scratch.

---

## Prerequisites

- Node.js v18+ installed
- PostgreSQL 14+ installed
- Redis installed
- Docker & Docker Compose (optional but recommended)
- Git
- VS Code or your preferred editor

---

## Step 1: Project Initialization

```bash
# Create project directory (if not exists)
cd /Users/akhalinem/Programming/learning/NodeJS/node-transition/02-project-chat-platform/src

# Initialize Node.js project
npm init -y

# Install TypeScript and development dependencies
npm install -D typescript @types/node ts-node nodemon @types/express @types/ws @types/bcrypt @types/jsonwebtoken

# Install production dependencies
npm install express ws pg redis bcrypt jsonwebtoken dotenv cors helmet express-rate-limit zod multer

# Install testing dependencies
npm install -D jest @types/jest ts-jest supertest @types/supertest

# Create TypeScript config
npx tsc --init
```

---

## Step 2: TypeScript Configuration

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

---

## Step 3: Project Structure

Create the following directory structure:

```
src/
├── config/
│   ├── database.ts        # Database configuration
│   ├── redis.ts           # Redis configuration
│   └── environment.ts     # Environment variables
├── models/
│   ├── User.ts
│   ├── Room.ts
│   ├── Message.ts
│   └── DirectMessage.ts
├── controllers/
│   ├── authController.ts
│   ├── roomController.ts
│   ├── messageController.ts
│   └── userController.ts
├── middleware/
│   ├── auth.ts            # JWT authentication
│   ├── errorHandler.ts    # Global error handler
│   ├── validation.ts      # Input validation
│   └── rateLimiter.ts     # Rate limiting
├── services/
│   ├── authService.ts
│   ├── roomService.ts
│   ├── messageService.ts
│   └── fileService.ts
├── websocket/
│   ├── server.ts          # WebSocket server
│   ├── handlers/
│   │   ├── messageHandler.ts
│   │   ├── roomHandler.ts
│   │   ├── presenceHandler.ts
│   │   └── typingHandler.ts
│   ├── middleware/
│   │   └── wsAuth.ts      # WebSocket authentication
│   └── events.ts          # Event type definitions
├── routes/
│   ├── auth.ts
│   ├── rooms.ts
│   ├── messages.ts
│   ├── users.ts
│   └── upload.ts
├── database/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── pool.ts            # Database connection pool
├── utils/
│   ├── logger.ts
│   ├── validation.ts
│   └── errors.ts
├── types/
│   ├── express.d.ts       # Express type extensions
│   └── websocket.d.ts     # WebSocket type definitions
├── tests/
│   ├── unit/
│   ├── integration/
│   └── websocket/
├── app.ts                 # Express app setup
└── server.ts              # Main entry point
```

Create directories:

```bash
mkdir -p src/{config,models,controllers,middleware,services,websocket/handlers,websocket/middleware,routes,database/migrations,utils,types,tests/{unit,integration,websocket}}
```

---

## Step 4: Environment Variables

Create `.env` file in project root:

```env
# Server
NODE_ENV=development
PORT=3000
WS_PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chatapp
DB_USER=postgres
DB_PASSWORD=postgres
DB_POOL_MIN=2
DB_POOL_MAX=10

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,text/plain

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
MESSAGE_RATE_LIMIT=60

# CORS
CORS_ORIGIN=http://localhost:5173
```

Create `.env.example` (for version control):

```bash
cp .env .env.example
# Then remove sensitive values from .env.example
```

---

## Step 5: Database Setup

### Option A: Using Docker (Recommended)

Create `docker-compose.yml` in project root:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    container_name: chatapp-postgres
    environment:
      POSTGRES_DB: chatapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./src/database/migrations:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: chatapp-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

Start services:

```bash
docker-compose up -d
```

### Option B: Manual Installation

**PostgreSQL**:

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb chatapp
```

**Redis**:

```bash
# macOS
brew install redis
brew services start redis
```

---

## Step 6: Database Migrations

Create initial schema in `src/database/migrations/001_initial_schema.sql`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rooms_created_by ON rooms(created_by);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  file_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_room_created ON messages(room_id, created_at DESC);

-- Room members table
CREATE TABLE room_members (
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  last_read_at TIMESTAMP,
  PRIMARY KEY (room_id, user_id)
);

CREATE INDEX idx_room_members_user_id ON room_members(user_id);

-- Direct messages table
CREATE TABLE direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id),
  recipient_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  file_url VARCHAR(500),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dm_sender ON direct_messages(sender_id);
CREATE INDEX idx_dm_recipient ON direct_messages(recipient_id);
CREATE INDEX idx_dm_conversation ON direct_messages(sender_id, recipient_id, created_at DESC);

-- Insert default lobby room
INSERT INTO rooms (name, description, is_private)
VALUES ('Lobby', 'Welcome to the chat! This is the general discussion room.', FALSE);
```

Run migrations:

```bash
# If using Docker
docker exec -i chatapp-postgres psql -U postgres -d chatapp < src/database/migrations/001_initial_schema.sql

# If using local PostgreSQL
psql -U postgres -d chatapp < src/database/migrations/001_initial_schema.sql
```

---

## Step 7: Package.json Scripts

Update `package.json`:

```json
{
  "name": "chat-platform",
  "version": "1.0.0",
  "description": "Real-time collaborative chat platform",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "db:migrate": "psql -U postgres -d chatapp < src/database/migrations/001_initial_schema.sql",
    "db:reset": "psql -U postgres -c 'DROP DATABASE IF EXISTS chatapp' && psql -U postgres -c 'CREATE DATABASE chatapp' && npm run db:migrate"
  },
  "keywords": ["chat", "websocket", "real-time"],
  "author": "",
  "license": "MIT"
}
```

---

## Step 8: Jest Configuration

Create `jest.config.js`:

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/tests/**"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  moduleFileExtensions: ["ts", "js", "json"],
  verbose: true,
};
```

---

## Step 9: ESLint & Prettier (Optional but Recommended)

```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier eslint-plugin-prettier
```

Create `.eslintrc.js`:

```javascript
module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  rules: {
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  },
};
```

Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## Step 10: Git Setup

Create `.gitignore`:

```
# Dependencies
node_modules/

# Build
dist/
build/

# Environment
.env
.env.local

# Logs
logs/
*.log
npm-debug.log*

# Testing
coverage/
.nyc_output/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Uploads
uploads/*
!uploads/.gitkeep

# Redis
dump.rdb
```

Create uploads directory:

```bash
mkdir -p uploads
touch uploads/.gitkeep
```

---

## Step 11: Initial Files

Create basic configuration files to verify setup:

### `src/config/environment.ts`

```typescript
import dotenv from "dotenv";

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  wsPort: parseInt(process.env.WS_PORT || "3001", 10),

  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "chatapp",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    poolMin: parseInt(process.env.DB_POOL_MIN || "2", 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || "10", 10),
  },

  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  jwt: {
    secret: process.env.JWT_SECRET || "change-this-secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || "change-this-refresh-secret",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  upload: {
    directory: process.env.UPLOAD_DIR || "./uploads",
    maxSize: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10),
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || "").split(","),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
    messageLimit: parseInt(process.env.MESSAGE_RATE_LIMIT || "60", 10),
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },
};
```

### `src/server.ts`

```typescript
import { config } from "./config/environment";

console.log("🚀 Starting Chat Platform Server...");
console.log(`Environment: ${config.env}`);
console.log(`Port: ${config.port}`);
console.log(`WebSocket Port: ${config.wsPort}`);

// TODO: Implement Express app and WebSocket server
```

---

## Step 12: Verify Setup

```bash
# Install dependencies
npm install

# Run TypeScript compiler to check for errors
npm run build

# Run the development server
npm run dev
```

You should see:

```
🚀 Starting Chat Platform Server...
Environment: development
Port: 3000
WebSocket Port: 3001
```

---

## Step 13: Test Database Connection

Create `src/database/pool.ts`:

```typescript
import { Pool } from "pg";
import { config } from "../config/environment";

export const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  min: config.database.poolMin,
  max: config.database.poolMax,
});

// Test connection
pool.on("connect", () => {
  console.log("✅ Database connected");
});

pool.on("error", (err) => {
  console.error("❌ Database error:", err);
});

export default pool;
```

Update `src/server.ts`:

```typescript
import { config } from "./config/environment";
import pool from "./database/pool";

async function start() {
  console.log("🚀 Starting Chat Platform Server...");
  console.log(`Environment: ${config.env}`);
  console.log(`Port: ${config.port}`);
  console.log(`WebSocket Port: ${config.wsPort}`);

  // Test database connection
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Database connected at:", result.rows[0].now);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

start();
```

Run again:

```bash
npm run dev
```

---

## Step 14: Next Steps

Now you're ready to start building! Follow this order:

1. **Week 3, Day 1-2**: Authentication

   - Implement user registration
   - Implement login with JWT
   - Create auth middleware

2. **Week 3, Day 3-4**: WebSocket Setup

   - Create WebSocket server
   - Implement WebSocket authentication
   - Basic message sending

3. **Week 3, Day 5-7**: Message Persistence
   - Save messages to database
   - Load message history
   - Testing

Continue following the README.md roadmap!

---

## Troubleshooting

### Database connection fails

- Check if PostgreSQL is running: `pg_isready`
- Verify credentials in `.env`
- Check if database exists: `psql -l`

### Redis connection fails

- Check if Redis is running: `redis-cli ping`
- Should return `PONG`

### TypeScript errors

- Run `npm run build` to see all errors
- Check `tsconfig.json` configuration

### Port already in use

- Change PORT in `.env`
- Or kill the process: `lsof -ti:3000 | xargs kill`

---

**Ready to code!** 🎉
