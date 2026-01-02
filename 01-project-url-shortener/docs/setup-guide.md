# URL Shortener - Setup Guide

## ✅ Prerequisites Check

Make sure you have installed:

- ✅ Node.js v18+
- ✅ PostgreSQL
- ✅ Redis

## 🚀 Setup Steps

### 1. Create the Database

```bash
# Create database
createdb url_shortener

# Or using psql
psql -U postgres
CREATE DATABASE url_shortener;
\q
```

### 2. Set Up Database Schema

```bash
# From the src/ directory
npm run db:setup

# Or manually
psql -U postgres -d url_shortener -f database/schema.sql
```

### 3. Configure Environment Variables

```bash
# Copy the example .env file
cp .env.example .env

# Edit .env with your settings (if different from defaults)
```

### 4. Start Redis

```bash
# Start Redis server
redis-server

# Or if installed via Homebrew on macOS
brew services start redis
```

### 5. Install Dependencies (Already Done)

```bash
npm install
```

### 6. Run the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

The server should start on http://localhost:3000

## 🧪 Testing the API

### Health Check

```bash
curl http://localhost:3000/health
```

### Create a Short URL

```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.google.com"
  }'
```

### Create with Custom Alias

```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.github.com",
    "customAlias": "gh"
  }'
```

### Redirect (use browser or curl)

```bash
curl -L http://localhost:3000/abc123
```

### Get Statistics

```bash
curl http://localhost:3000/api/stats/abc123
```

## 🐛 Troubleshooting

### Database Connection Error

- Make sure PostgreSQL is running
- Check your .env credentials
- Verify database exists: `psql -U postgres -l`

### Redis Connection Error

- Make sure Redis is running: `redis-cli ping` should return `PONG`
- Start Redis: `redis-server`

### Port Already in Use

- Change PORT in .env file
- Or kill the process using port 3000

## 📁 Project Structure

```
src/
├── index.js              # Main server file
├── config/
│   ├── database.js       # PostgreSQL connection
│   └── redis.js          # Redis connection
├── routes/
│   ├── api.js            # API routes
│   └── redirect.js       # Redirect routes
├── controllers/
│   └── urlController.js  # Request handlers
├── services/
│   └── urlService.js     # Business logic
├── utils/
│   ├── shortCodeGenerator.js
│   └── urlValidator.js
└── database/
    └── schema.sql        # Database schema
```

## ✅ Next Steps

Once everything is working:

1. ✅ Try creating several short URLs
2. ✅ Test the redirect functionality
3. ✅ Check the statistics endpoint
4. ✅ Review the code to understand the flow
5. ✅ Start working on Week 1 features (expiration, validation, etc.)

## 🎯 Current Status

You have completed:

- [x] Project setup
- [x] Database schema
- [x] Core API endpoints (POST /api/shorten, GET /:shortCode)
- [x] Click tracking
- [x] Statistics endpoint

Still to do (Week 1):

- [ ] Add comprehensive error handling
- [ ] Add input validation middleware
- [ ] Add expiration functionality (basic implementation exists)
- [ ] Write tests
- [ ] Add API documentation

Good luck! 🚀
