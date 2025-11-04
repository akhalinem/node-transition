# 🔗 Project 1: High-Performance URL Shortener

**Phase**: 1 | **Weeks**: 1-2 | **Difficulty**: ⭐⭐⭐

---

## 🎯 Project Overview

Build a production-ready URL shortening service that handles 1,000 requests/second with sub-50ms response times.

**Why This Project**: Forces you to think about scale, database design, caching, and API design from day one.

---

## 📋 Core Requirements

### Functional Requirements
- [ ] Create short URLs from long URLs
- [ ] Redirect short URLs to original URLs (must be <50ms)
- [ ] Track click analytics (views per link, last accessed)
- [ ] Custom aliases (user can choose their short code)
- [ ] Link expiration
- [ ] Rate limiting (100 requests per IP per minute)

### Non-Functional Requirements
- [ ] Handle 1,000 requests/second
- [ ] Response time <50ms consistently
- [ ] Proper error handling
- [ ] API documentation
- [ ] Basic monitoring

---

## ✅ Success Criteria

- [ ] Load test shows consistent <50ms response time at 1000 req/sec
- [ ] Database queries are optimized (show EXPLAIN plans)
- [ ] Proper error handling (invalid URLs, collisions, etc.)
- [ ] API documentation with examples
- [ ] Basic monitoring (track response times, error rates)
- [ ] Code is clean and well-structured
- [ ] Tests cover critical paths

---

## 🛠️ Technology Stack

**Recommended**:
- **Runtime**: Node.js 18+
- **Framework**: Express or Fastify
- **Database**: PostgreSQL
- **Cache**: Redis
- **Testing**: Jest + Supertest
- **Load Testing**: k6 or Artillery
- **API Docs**: Swagger/OpenAPI (optional but recommended)

*You can swap technologies, but document why!*

---

## 📅 Week-by-Week Plan

### Week 1: Build (Get It Working)

**Days 1-2: Setup & Core Logic**
- [ ] Project initialization (package.json, folder structure)
- [ ] Database setup (PostgreSQL)
- [ ] Schema design (URLs table)
- [ ] Basic API routes (POST /shorten, GET /:shortCode)
- [ ] Short code generation algorithm

**Days 3-4: Features**
- [ ] Redirect functionality
- [ ] Click tracking
- [ ] Custom aliases
- [ ] Link expiration
- [ ] Input validation

**Days 5-7: Testing & Documentation**
- [ ] Basic tests
- [ ] Error handling
- [ ] API documentation
- [ ] README with setup instructions

### Week 2: Break & Optimize (Make It Production-Ready)

**Days 8-9: Load Testing**
- [ ] Set up k6/Artillery
- [ ] Run load tests
- [ ] Identify bottlenecks
- [ ] Document performance issues

**Days 10-11: Optimization**
- [ ] Database query optimization (add indexes)
- [ ] Implement Redis caching
- [ ] Connection pooling
- [ ] Query optimization (EXPLAIN ANALYZE)

**Days 12-13: Hardening**
- [ ] Rate limiting implementation
- [ ] Comprehensive error handling
- [ ] Input sanitization
- [ ] Edge case handling

**Day 14: Polish**
- [ ] Code review and refactoring
- [ ] Complete documentation
- [ ] Final load test
- [ ] Write retrospective

---

## 📖 Theory Checkpoints

**Before you start coding, study**: (See `THEORY_CHECKPOINTS.md`)
- HTTP/1.1 protocol basics
- RESTful API design principles
- Basic SQL and database concepts

**While building, pause and study when you encounter**:
- Database schema design → Study indexing strategies
- Slow queries → Study query performance
- Need for speed → Study caching strategies
- Too many requests → Study rate limiting
- API structure → Study API design patterns

*Detailed theory materials are in the `theory/` folder with study guides.*

---

## 🗂️ Project Structure

```
01-project-url-shortener/
├── README.md (this file)
├── THEORY_CHECKPOINTS.md
├── RETROSPECTIVE_TEMPLATE.md
│
├── planning/
│   ├── requirements.md
│   ├── api-design.md
│   ├── database-schema.md
│   └── architecture-diagram.png
│
├── theory/
│   ├── http-protocol/
│   ├── database-design/
│   ├── query-performance/
│   ├── caching-strategies/
│   ├── rate-limiting/
│   └── api-design/
│
├── src/
│   ├── index.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── services/
│   ├── middleware/
│   ├── utils/
│   └── config/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── load/
│
├── docs/
│   ├── api-documentation.md
│   ├── setup-guide.md
│   ├── performance-report.md
│   └── lessons-learned.md
│
└── comparison-study/
    └── analysis.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
```bash
# Check versions
node --version  # v18+
npm --version
psql --version  # PostgreSQL
redis-cli --version
```

### 2. Initial Setup
```bash
cd src/
npm init -y
npm install express pg redis
npm install -D jest supertest nodemon
```

### 3. Database Setup
```sql
CREATE DATABASE url_shortener;
-- Design your schema!
```

### 4. Start Building
- Design your database schema first
- Sketch your API routes
- Then start coding!

---

## 🎨 Design Decisions to Make

### 1. Short Code Generation
**Options**:
- Random string (check collisions)
- Base62 encoding of auto-increment ID
- Hash-based (MD5/SHA + truncate)

**Consider**: Collision probability, predictability, length

### 2. Database Schema
**Think about**:
- What fields do you need?
- What should be indexed?
- How to track analytics efficiently?
- Soft delete vs hard delete?

### 3. Caching Strategy
**Decide**:
- What to cache? (hot URLs)
- Cache invalidation strategy
- TTL values
- Cache-aside vs write-through

### 4. Rate Limiting
**Choose**:
- Token bucket vs sliding window
- Storage (memory vs Redis)
- Per-IP vs per-user
- Limits and timeframes

*Document your decisions and why!*

---

## 🧪 Testing Strategy

### Unit Tests
- URL validation
- Short code generation
- Analytics calculation

### Integration Tests
- API endpoints
- Database operations
- Cache operations

### Load Tests
```javascript
// k6 example
import http from 'k6/http';
export default function() {
  http.get('http://localhost:3000/abc123');
}
```

**Target**: 1,000 req/sec with <50ms p95 latency

---

## 📊 Monitoring & Metrics

Track these metrics:
- Request rate (req/sec)
- Response time (p50, p95, p99)
- Error rate
- Cache hit rate
- Database query time
- Most popular URLs

*Set up basic logging and consider Prometheus + Grafana*

---

## 🔍 Code Review Checklist

Before considering the project done:
- [ ] Code is clean and readable
- [ ] No duplicated logic
- [ ] Error handling is comprehensive
- [ ] All edge cases are handled
- [ ] Tests are passing
- [ ] Documentation is complete
- [ ] Performance targets are met
- [ ] Security basics covered (input validation, no SQL injection)
- [ ] Can explain all design decisions

---

## 📚 Learning Outcomes

After completing this project, you'll understand:
- ✅ HTTP protocol and RESTful API design
- ✅ Database schema design and optimization
- ✅ Query performance and indexing
- ✅ Caching strategies and Redis
- ✅ Rate limiting implementations
- ✅ Load testing and performance profiling
- ✅ Production-ready error handling
- ✅ API documentation best practices

---

## 🎯 Stretch Goals (Optional)

If you finish early or want to go deeper:
- [ ] User accounts and authentication
- [ ] Analytics dashboard (views over time)
- [ ] QR code generation for URLs
- [ ] Batch URL shortening
- [ ] URL preview before redirect
- [ ] Geographic analytics
- [ ] Docker containerization
- [ ] Deployment to cloud (AWS/Heroku/Vercel)

---

## 🔗 Comparison Study

After building, study 3 URL shortener implementations on GitHub:

**Document**:
1. How did they handle short code generation?
2. What database schema did they choose?
3. How do they handle collisions?
4. What's different from your approach and why?
5. What would you borrow from their implementation?

*Add your findings to `comparison-study/analysis.md`*

---

## 💡 Common Pitfalls & Tips

### Pitfalls to Avoid
- ❌ Not indexing database properly
- ❌ Caching everything (cache wisely!)
- ❌ Ignoring collision handling
- ❌ Over-engineering too early
- ❌ Not testing with realistic data volumes

### Pro Tips
- ✅ Start simple, optimize based on profiling
- ✅ Use EXPLAIN ANALYZE on every query
- ✅ Test with realistic URLs (various lengths)
- ✅ Monitor cache hit rates
- ✅ Load test early and often

---

## 📝 Retrospective

At the end of Week 2, complete `RETROSPECTIVE_TEMPLATE.md`:
1. What patterns did I learn this week?
2. What concepts do I still not fully understand?
3. What would I do differently if I started over?
4. What was my biggest debugging challenge and what did I learn?
5. What surprised me most?

---

## 🆘 Need Help?

### Stuck on Implementation?
1. Review the theory checkpoints
2. Check `00-fundamentals/` for core concepts
3. Read official documentation
4. Search for the specific error/problem

### Performance Issues?
1. Profile with Node.js --inspect
2. Check database query plans (EXPLAIN)
3. Monitor cache hit rates
4. Review the optimization checklist in theory materials

---

## ✅ Project Completion Checklist

Mark done when:
- [ ] All requirements implemented
- [ ] Success criteria met
- [ ] Tests passing
- [ ] Documentation complete
- [ ] Load test successful
- [ ] Code reviewed and refactored
- [ ] Comparison study done
- [ ] Retrospective completed
- [ ] Committed to Git with good commit messages
- [ ] Ready to showcase in portfolio

---

**Next Project**: `02-project-chat-platform/` (Real-time WebSockets)

*Estimated Time: 40-50 hours over 2 weeks*

---

*Last Updated: November 2025*
