# Quick Start Checklist

Use this checklist to track your progress through Project 2: Real-Time Chat Platform.

---

## Pre-Project (Before Week 3)

### Knowledge Prerequisites

- [ ] Completed Project 1 (URL Shortener) or equivalent
- [ ] Comfortable with async/await and Promises
- [ ] Basic understanding of HTTP and REST APIs
- [ ] Familiar with PostgreSQL and SQL queries
- [ ] Understand JWT basics (read theory/JWT_AUTHENTICATION.md if not)

### Environment Setup

- [ ] Node.js v18+ installed
- [ ] PostgreSQL 14+ installed
- [ ] Redis installed
- [ ] Docker & Docker Compose installed (optional but recommended)
- [ ] Git configured
- [ ] Code editor ready (VS Code recommended)

### Reading Assignments (3-4 hours)

- [ ] Read README.md (project overview)
- [ ] Read theory/WEBSOCKET_DEEP_DIVE.md (essential!)
- [ ] Read theory/JWT_AUTHENTICATION.md
- [ ] Skim planning/ARCHITECTURE_DECISIONS.md
- [ ] Review comparison-study/PRODUCTION_SYSTEMS.md

---

## Week 3: Foundation

### Day 1: Project Setup & User Model

- [ ] Follow planning/PROJECT_SETUP.md steps 1-10
- [ ] Project initialized with TypeScript
- [ ] Database created and running
- [ ] Redis running
- [ ] User model created with basic CRUD functions
- [ ] Can query database successfully
- [ ] Committed code to git

**Time Check**: Should take 3-4 hours. If stuck >30 min, ask for help or skip and come back.

---

### Day 2: Authentication

- [ ] Password hashing service created (bcrypt)
- [ ] JWT generation and verification functions working
- [ ] Registration endpoint implemented
- [ ] Login endpoint implemented
- [ ] Input validation middleware created
- [ ] Can register a user via Postman/curl
- [ ] Can login and receive JWT token
- [ ] Basic unit tests for auth service
- [ ] Code committed

**Test Yourself**:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"password123"}'

# Login (should return JWT)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

**Expected**: Both requests succeed, login returns `{token: "eyJ..."}`

---

### Day 3: WebSocket Server

- [ ] WebSocket server created on port 3001
- [ ] WebSocket connection lifecycle handled (open, message, close, error)
- [ ] WebSocket authentication implemented (token in first message)
- [ ] Authentication timeout (5 seconds) working
- [ ] Connection manager tracks active connections
- [ ] Can connect via wscat or browser
- [ ] Can authenticate successfully
- [ ] Invalid token rejected
- [ ] Code committed

**Test Yourself**:

```bash
npm install -g wscat
wscat -c ws://localhost:3001

# Should see connection open
# Send within 5 seconds:
{"type":"authenticate","token":"YOUR_JWT_TOKEN_HERE"}

# Should receive:
{"type":"authenticated","userId":"..."}
```

---

### Day 4: Room & Messaging

- [ ] Room model created
- [ ] Message model created
- [ ] Default "Lobby" room exists in database
- [ ] Can send message to room via WebSocket
- [ ] Message saved to database
- [ ] Message broadcast to all room members
- [ ] Only authenticated users can send messages
- [ ] Messages have proper structure (id, userId, content, timestamp)
- [ ] Code committed

**Test Yourself**:

- Open 2 WebSocket connections
- Authenticate both
- Send message from connection 1
- Verify connection 2 receives the message

---

### Day 5: Message History & HTTP Endpoints

- [ ] Room list endpoint (GET /api/rooms)
- [ ] Room details endpoint (GET /api/rooms/:id)
- [ ] Message history endpoint (GET /api/rooms/:id/messages)
- [ ] Pagination working (limit, offset)
- [ ] Auth middleware protecting endpoints
- [ ] When joining room via WebSocket, message history loaded
- [ ] Integration tests for room endpoints
- [ ] Code committed

**Test Yourself**:

```bash
# Get rooms (use token from login)
curl http://localhost:3000/api/rooms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get message history
curl "http://localhost:3000/api/rooms/ROOM_ID/messages?limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Day 6-7: Testing & Refinement

- [ ] Unit tests for auth service (password hashing, JWT)
- [ ] Integration tests for auth endpoints
- [ ] Integration tests for room endpoints
- [ ] WebSocket connection tests
- [ ] WebSocket messaging tests
- [ ] All tests passing
- [ ] Code cleaned up (removed console.logs, improved naming)
- [ ] Error handling reviewed and improved
- [ ] README.md updated with current progress
- [ ] Week 3 features demo-able

**Week 3 Checkpoint Questions**:

- Can you register and login?
- Can you connect via WebSocket and authenticate?
- Can you send messages and see them in database?
- Can you load message history?
- Are tests passing?

**If all yes, proceed to Week 4!**

---

## Week 4: Advanced Features

### Day 8: Multiple Rooms

- [ ] Create room endpoint (POST /api/rooms)
- [ ] Join room functionality (WebSocket + HTTP)
- [ ] Leave room functionality
- [ ] Room member list tracking
- [ ] Messages isolated per room
- [ ] User can be in multiple rooms
- [ ] join_room WebSocket handler implemented
- [ ] leave_room WebSocket handler implemented
- [ ] Code committed

**Test Yourself**:

- Create 2 different rooms
- Join room A with user 1
- Join room B with user 2
- Send message in room A
- Verify user 2 doesn't receive it

---

### Day 9: Presence & Online Status

- [ ] Redis presence tracking implemented (online:{userId})
- [ ] Heartbeat/ping mechanism working
- [ ] user_joined events broadcast
- [ ] user_left events broadcast
- [ ] Online user list endpoint
- [ ] Presence updates in real-time
- [ ] User goes offline after 30s of inactivity
- [ ] Code committed

---

### Day 10: Typing Indicators

- [ ] Typing state stored in Redis (typing:{roomId})
- [ ] typing_start handler implemented
- [ ] typing_stop handler implemented
- [ ] Typing events broadcast to room (except sender)
- [ ] Auto-stop after 3 seconds (client-side documented)
- [ ] Multiple users can type simultaneously
- [ ] Code committed

---

### Day 11: Direct Messages

- [ ] DirectMessage model created
- [ ] send_dm WebSocket handler
- [ ] DM conversation endpoint (GET /api/direct-messages/:userId)
- [ ] Unread count endpoint
- [ ] Mark as read functionality
- [ ] DMs isolated from room messages
- [ ] Offline DM queuing working
- [ ] Code committed

---

### Day 12: File Uploads

- [ ] Multer configured for file uploads
- [ ] Upload endpoint (POST /api/upload)
- [ ] File serving endpoint (GET /api/files/:filename)
- [ ] File size validation (5MB limit)
- [ ] File type validation (images, PDF, txt)
- [ ] Files stored in uploads/ directory
- [ ] Can send file messages via WebSocket
- [ ] Images displayed in chat (frontend or tested)
- [ ] Code committed

---

### Day 13: Rate Limiting

- [ ] HTTP rate limiting (express-rate-limit)
- [ ] WebSocket message rate limiting (custom)
- [ ] Login rate limiting (10/hour per IP)
- [ ] Upload rate limiting (10/hour per user)
- [ ] Rate limit errors handled gracefully
- [ ] Code committed

---

### Day 14: Week 4 Testing

- [ ] All new features tested manually
- [ ] Integration tests for new endpoints
- [ ] WebSocket tests for new events
- [ ] Bug fixes completed
- [ ] Code refactored and cleaned
- [ ] Week 4 features demo-able

**Week 4 Checkpoint Questions**:

- Can you create and join multiple rooms?
- Do typing indicators work?
- Is online/offline status accurate?
- Can you send direct messages?
- Can you upload and view files?
- Are rate limits preventing abuse?

**If all yes, proceed to Week 5!**

---

## Week 5: Scale & Production

### Day 15-16: Horizontal Scaling

- [ ] Redis pub/sub client created
- [ ] Message publishing to Redis implemented
- [ ] Subscription to room channels implemented
- [ ] Can run multiple server instances
- [ ] Messages delivered across servers
- [ ] Nginx load balancer configured (or Docker Compose)
- [ ] Sticky sessions working
- [ ] Tested with 2+ server instances
- [ ] Code committed

**Test Yourself**:

- Start 2 server instances (port 3000 and 3001)
- Connect client to server 1
- Connect client to server 2
- Send message from client 1
- Verify client 2 receives it (through Redis)

---

### Day 17-18: Resilience & Performance

- [ ] Heartbeat/ping-pong implemented (server-side)
- [ ] Graceful shutdown on SIGTERM
- [ ] Connection cleanup on server restart
- [ ] Auto-reconnect documented (client-side)
- [ ] Offline message delivery on reconnect
- [ ] Database queries optimized (EXPLAIN ANALYZE run)
- [ ] Indexes added where needed
- [ ] Query result caching implemented
- [ ] Load test with k6 or Artillery
- [ ] Performance metrics documented
- [ ] Code committed

**Load Test**:

```javascript
// k6 script
export let options = {
  stages: [
    { duration: "1m", target: 100 },
    { duration: "3m", target: 1000 },
    { duration: "1m", target: 0 },
  ],
};
```

**Target**: <100ms message delivery at 1000 concurrent connections

---

### Day 19-21: Production Ready

- [ ] Security audit completed (checklist below)
- [ ] All tests passing (unit + integration + WebSocket)
- [ ] Load test to 10k connections successful
- [ ] Error handling comprehensive
- [ ] Logging structured (JSON format)
- [ ] Monitoring endpoints added (/health, /metrics)
- [ ] Dockerfile created
- [ ] docker-compose.yml for full stack
- [ ] README.md complete and detailed
- [ ] API documentation created (OpenAPI/Swagger)
- [ ] Architecture diagrams added
- [ ] Deployment guide written
- [ ] Project demo-able

### Security Audit Checklist

- [ ] Passwords hashed with bcrypt (10+ rounds)
- [ ] JWT secrets strong and in env vars
- [ ] Input validation on all endpoints
- [ ] XSS prevention (sanitize HTML in messages)
- [ ] SQL injection prevention (parameterized queries)
- [ ] Rate limiting on all endpoints
- [ ] CORS configured properly
- [ ] File uploads validated (size, type)
- [ ] No sensitive data in logs
- [ ] HTTPS documented for production
- [ ] Error messages don't leak info

---

## Final Checklist

### Core Features ✅

- [ ] User registration and authentication
- [ ] JWT-based auth for HTTP and WebSocket
- [ ] Real-time messaging in rooms
- [ ] Message history with pagination
- [ ] Multiple chat rooms
- [ ] Join/leave rooms
- [ ] Direct messages
- [ ] File uploads (images, documents)
- [ ] Online/offline presence
- [ ] Typing indicators
- [ ] Message delivery confirmation

### Technical Requirements ✅

- [ ] Handles 10,000 concurrent connections
- [ ] Message delivery <100ms (P95)
- [ ] Horizontal scaling (multiple servers)
- [ ] Redis pub/sub for cross-server messaging
- [ ] Graceful shutdown and reconnection
- [ ] Rate limiting
- [ ] Comprehensive error handling

### Code Quality ✅

- [ ] TypeScript throughout
- [ ] Tests >80% coverage on critical paths
- [ ] No TypeScript errors
- [ ] No ESLint errors (if configured)
- [ ] Code documented (comments where needed)
- [ ] Git history clean (good commit messages)

### Documentation ✅

- [ ] README with setup instructions
- [ ] API documentation
- [ ] WebSocket events documented
- [ ] Architecture diagrams
- [ ] Performance characteristics documented
- [ ] Deployment guide

### Learning Outcomes ✅

- [ ] Understand WebSocket protocol
- [ ] Comfortable with JWT authentication
- [ ] Know how to scale WebSocket apps
- [ ] Understand Redis pub/sub
- [ ] Can implement real-time features
- [ ] Know how to handle presence
- [ ] Understand file upload security
- [ ] Can load test and optimize

---

## Troubleshooting Common Issues

### WebSocket won't connect

- [ ] Check WebSocket server is running (port 3001)
- [ ] Verify no firewall blocking port
- [ ] Check browser console for errors
- [ ] Try wscat to isolate client vs server issue

### Messages not persisting

- [ ] Check database connection
- [ ] Verify SQL queries are correct
- [ ] Check for errors in server logs
- [ ] Run queries directly in psql to test

### Redis pub/sub not working

- [ ] Verify Redis is running (`redis-cli ping`)
- [ ] Check Redis connection config
- [ ] Test pub/sub directly with redis-cli
- [ ] Check server logs for errors

### Tests failing

- [ ] Run tests individually to isolate
- [ ] Check test database is separate from dev DB
- [ ] Verify test setup/teardown is correct
- [ ] Check for timing issues (add delays if needed)

### Performance issues

- [ ] Run EXPLAIN ANALYZE on slow queries
- [ ] Check database indexes
- [ ] Profile with clinic.js
- [ ] Monitor Redis memory usage
- [ ] Check event loop lag

---

## Next Steps After Completion

### Immediate (Same Week)

- [ ] Deploy to cloud (Heroku, Railway, DigitalOcean)
- [ ] Add to GitHub with excellent README
- [ ] Share on LinkedIn/Twitter
- [ ] Get feedback from peers

### Short Term (Next 2 Weeks)

- [ ] Build simple frontend (React/Vue)
- [ ] Add message reactions
- [ ] Implement message editing
- [ ] Add message search

### Medium Term (Next Month)

- [ ] Add voice/video chat (WebRTC)
- [ ] Implement end-to-end encryption
- [ ] Build mobile app (React Native)
- [ ] Add bot support/webhooks

### Long Term

- [ ] Write blog post about what you learned
- [ ] Give talk at local meetup
- [ ] Open source and promote
- [ ] Move to Project 3 (E-Commerce API)

---

## Reflection Questions

After completing the project, answer these:

1. **What was the hardest part?**
2. **What surprised you most?**
3. **What would you do differently if starting over?**
4. **What are you most proud of?**
5. **What did you learn about WebSockets?**
6. **What did you learn about scaling?**
7. **What production chat systems impressed you most and why?**
8. **Are you ready for Project 3?**

---

## Success Metrics

You've successfully completed this project if you can:

- ✅ Demo the chat app working in real-time
- ✅ Explain the WebSocket protocol
- ✅ Explain how horizontal scaling works
- ✅ Show load test results (10k connections)
- ✅ Explain JWT authentication flow
- ✅ Discuss architectural trade-offs you made
- ✅ Handle technical interview questions about real-time systems

**Congratulations! You're now a WebSocket expert!** 🎉

Move on to **Project 3: E-Commerce API** to learn complex domain modeling, transactions, and background job processing.

---

## Resources Quick Links

- [README.md](../README.md) - Project overview
- [PROJECT_SETUP.md](../planning/PROJECT_SETUP.md) - Setup instructions
- [IMPLEMENTATION_GUIDE.md](../planning/IMPLEMENTATION_GUIDE.md) - Day-by-day guide
- [WEBSOCKET_DEEP_DIVE.md](../theory/WEBSOCKET_DEEP_DIVE.md) - WebSocket theory
- [JWT_AUTHENTICATION.md](../theory/JWT_AUTHENTICATION.md) - JWT theory
- [PRODUCTION_SYSTEMS.md](../comparison-study/PRODUCTION_SYSTEMS.md) - Learn from Discord, Slack, etc.

**Good luck! You've got this!** 🚀
