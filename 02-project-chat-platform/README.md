# Project 2: Real-Time Collaborative Chat Platform

**Timeline**: Weeks 3-5 (3 weeks)  
**Difficulty**: Intermediate  
**Focus**: Real-time systems, WebSockets, authentication, horizontal scaling

---

## 🎯 Project Overview

Build a production-ready real-time chat platform that handles thousands of concurrent WebSocket connections, supports multiple chat rooms, and can scale horizontally across multiple server instances.

### Why This Project?

This project introduces you to:

- **Real-time bidirectional communication** (WebSockets)
- **Stateful connection management** at scale
- **JWT authentication** patterns
- **Horizontal scaling** with sticky sessions and pub/sub
- **Event-driven architecture**
- **File upload handling**

---

## 🎓 Learning Objectives

By the end of this project, you will:

✅ Understand WebSocket protocol and lifecycle  
✅ Implement secure JWT authentication for WebSockets  
✅ Handle real-time state synchronization across clients  
✅ Scale WebSocket servers horizontally with Redis pub/sub  
✅ Implement presence indicators and typing notifications  
✅ Handle file uploads securely  
✅ Build resilient reconnection logic  
✅ Test real-time systems effectively

---

## 📋 Core Requirements

### Phase 1: Authentication & Basic Chat (Week 3)

**User Authentication**:

- [ ] User registration (email/password)
- [ ] Login with JWT token generation
- [ ] Password hashing with bcrypt
- [ ] Token refresh mechanism
- [ ] Secure password reset flow (stretch)

**WebSocket Chat**:

- [ ] Establish WebSocket connections with authentication
- [ ] Send and receive messages in real-time
- [ ] Single chat room (lobby)
- [ ] Message persistence to database
- [ ] Load previous message history (pagination)

**Success Criteria**:

- Messages delivered in <100ms
- JWT authentication working for WebSocket connections
- Message history loaded correctly
- No message loss on connection drops

### Phase 2: Advanced Features (Week 4)

**Multiple Chat Rooms**:

- [ ] Create/join/leave chat rooms
- [ ] List available rooms
- [ ] Room member list
- [ ] Private (invite-only) rooms

**Presence & Activity**:

- [ ] Online/offline user status
- [ ] "User is typing..." indicators
- [ ] Last seen timestamp
- [ ] User list in room

**Direct Messaging**:

- [ ] One-on-one private chats
- [ ] DM notifications
- [ ] Unread message counts

**File Uploads**:

- [ ] Image uploads (JPEG, PNG, GIF)
- [ ] Document uploads (PDF, TXT)
- [ ] File size limits (5MB per file)
- [ ] File validation and sanitization
- [ ] Display inline images in chat

**Success Criteria**:

- Multiple rooms working independently
- Typing indicators appear/disappear correctly
- Files uploaded and accessible
- DMs isolated from public rooms

### Phase 3: Scale & Production-Ready (Week 5)

**Horizontal Scaling**:

- [ ] Multiple server instances running
- [ ] Redis pub/sub for cross-server messaging
- [ ] Sticky sessions for load balancing
- [ ] Connection migration on server restart

**Resilience**:

- [ ] Auto-reconnect on connection drop
- [ ] Message queue for offline users
- [ ] Graceful server shutdown
- [ ] Connection health checks (heartbeat/ping-pong)

**Performance & Monitoring**:

- [ ] Handle 10,000 concurrent connections
- [ ] Rate limiting (messages per minute)
- [ ] Message delivery confirmation
- [ ] Connection metrics (active connections, messages/sec)
- [ ] Error tracking and logging

**Security**:

- [ ] Input validation and sanitization
- [ ] XSS prevention in messages
- [ ] Rate limiting per user
- [ ] File upload security (MIME type validation)
- [ ] SQL injection prevention

**Success Criteria**:

- System handles 10k concurrent connections
- Messages delivered across server instances
- Server restart doesn't lose messages
- Comprehensive error handling
- Complete test coverage

---

## 🏗️ Architecture Overview

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ HTTP/WS
       │
┌──────▼──────────────────────────────┐
│      Load Balancer                  │
│  (Sticky Sessions by IP/Cookie)     │
└──────┬─────────────┬────────────────┘
       │             │
┌──────▼──────┐ ┌───▼─────────┐
│   Server 1  │ │  Server 2   │
│  (Node.js)  │ │  (Node.js)  │
└──────┬──────┘ └───┬─────────┘
       │            │
       │  ┌─────────▼────────┐
       └──►   Redis Pub/Sub  │
          │  (Message Broker)│
          └─────────┬────────┘
                    │
          ┌─────────▼────────┐
          │   PostgreSQL     │
          │  (Users, Msgs,   │
          │   Rooms, Files)  │
          └──────────────────┘
```

---

## 🗄️ Database Schema

### Users Table

```sql
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
```

### Rooms Table

```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rooms_created_by ON rooms(created_by);
```

### Messages Table

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'file'
  file_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_room_created ON messages(room_id, created_at DESC);
```

### Room Members Table

```sql
CREATE TABLE room_members (
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

CREATE INDEX idx_room_members_user_id ON room_members(user_id);
```

### Direct Messages Table

```sql
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
```

---

## 🚀 Technology Stack

### Backend

- **Runtime**: Node.js (v18+)
- **Language**: TypeScript
- **Framework**: Express.js
- **WebSocket**: ws or Socket.io
- **Database**: PostgreSQL
- **Caching/Pub-Sub**: Redis
- **Authentication**: jsonwebtoken, bcrypt
- **File Upload**: multer
- **Validation**: joi or zod

### DevOps

- **Containerization**: Docker & Docker Compose
- **Testing**: Jest, Supertest
- **Load Testing**: k6 or Artillery
- **Monitoring**: Prometheus, Grafana (optional)

---

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (blacklist token)

### Rooms

- `GET /api/rooms` - List all rooms
- `POST /api/rooms` - Create new room
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms/:id/join` - Join a room
- `DELETE /api/rooms/:id/leave` - Leave a room
- `GET /api/rooms/:id/members` - Get room members

### Messages

- `GET /api/rooms/:id/messages` - Get room message history (paginated)
- `POST /api/rooms/:id/messages` - Send message (fallback HTTP)
- `GET /api/direct-messages/:userId` - Get DM history with user

### Files

- `POST /api/upload` - Upload file
- `GET /api/files/:filename` - Download/view file

### User

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile

---

## 🔌 WebSocket Events

### Client → Server

```typescript
// Connection
{
  type: 'authenticate',
  token: 'jwt_token_here'
}

// Messaging
{
  type: 'send_message',
  roomId: 'room-uuid',
  content: 'Hello world',
  messageType: 'text'
}

{
  type: 'typing_start',
  roomId: 'room-uuid'
}

{
  type: 'typing_stop',
  roomId: 'room-uuid'
}

// Room management
{
  type: 'join_room',
  roomId: 'room-uuid'
}

{
  type: 'leave_room',
  roomId: 'room-uuid'
}

// Direct messages
{
  type: 'send_dm',
  recipientId: 'user-uuid',
  content: 'Private message'
}
```

### Server → Client

```typescript
// Authentication
{
  type: 'authenticated',
  userId: 'user-uuid',
  username: 'john_doe'
}

{
  type: 'auth_error',
  message: 'Invalid token'
}

// Messages
{
  type: 'new_message',
  message: {
    id: 'msg-uuid',
    roomId: 'room-uuid',
    userId: 'user-uuid',
    username: 'john_doe',
    content: 'Hello',
    messageType: 'text',
    createdAt: '2024-01-01T12:00:00Z'
  }
}

// Presence
{
  type: 'user_joined',
  roomId: 'room-uuid',
  user: { id: 'uuid', username: 'jane' }
}

{
  type: 'user_left',
  roomId: 'room-uuid',
  userId: 'user-uuid'
}

{
  type: 'user_typing',
  roomId: 'room-uuid',
  userId: 'user-uuid',
  username: 'john_doe'
}

{
  type: 'user_stopped_typing',
  roomId: 'room-uuid',
  userId: 'user-uuid'
}

// Direct messages
{
  type: 'new_dm',
  message: {
    id: 'dm-uuid',
    senderId: 'user-uuid',
    senderUsername: 'john_doe',
    content: 'Private message',
    createdAt: '2024-01-01T12:00:00Z'
  }
}

// System
{
  type: 'error',
  message: 'Error description'
}

{
  type: 'ping'
}
```

---

## 🧪 Testing Strategy

### Unit Tests

- [ ] JWT generation and validation
- [ ] Password hashing/comparison
- [ ] Message validation
- [ ] User model methods

### Integration Tests

- [ ] Registration flow
- [ ] Login flow
- [ ] Room creation and joining
- [ ] Message sending (HTTP)
- [ ] File upload

### WebSocket Tests

- [ ] Connection with valid JWT
- [ ] Connection rejection with invalid JWT
- [ ] Message broadcast to room members
- [ ] Typing indicators
- [ ] Reconnection handling

### Load Tests

- [ ] 100 concurrent connections
- [ ] 1,000 concurrent connections
- [ ] 10,000 concurrent connections
- [ ] Message throughput (messages/second)

### E2E Tests (Optional)

- [ ] Complete user journey: register → login → join room → send message
- [ ] Multi-user chat interaction
- [ ] File upload and viewing

---

## 📈 Performance Targets

| Metric                            | Target  |
| --------------------------------- | ------- |
| Message Delivery Latency          | < 100ms |
| Concurrent Connections            | 10,000+ |
| Messages per Second               | 1,000+  |
| API Response Time (p95)           | < 200ms |
| WebSocket Connection Success Rate | > 99%   |
| Message Delivery Success Rate     | > 99.9% |

---

## 🔐 Security Considerations

### Authentication

- ✅ Passwords hashed with bcrypt (salt rounds: 10)
- ✅ JWT with short expiration (15 min access, 7 day refresh)
- ✅ Secure token storage (httpOnly cookies for web)
- ✅ Token blacklisting on logout

### Input Validation

- ✅ Email validation
- ✅ Username: alphanumeric, 3-50 chars
- ✅ Message content: max 5000 chars
- ✅ XSS prevention (sanitize HTML)
- ✅ SQL injection prevention (parameterized queries)

### File Upload Security

- ✅ File size limit: 5MB
- ✅ Allowed MIME types whitelist
- ✅ File name sanitization
- ✅ Virus scanning (optional, using ClamAV)
- ✅ Store files outside web root

### Rate Limiting

- ✅ Registration: 5 requests/hour per IP
- ✅ Login: 10 requests/hour per IP
- ✅ Messages: 60 messages/minute per user
- ✅ File uploads: 10 uploads/hour per user

---

## 🚧 Development Roadmap

### Week 3: Foundation

**Days 1-2**: Setup & Authentication

- Project structure
- Database setup (PostgreSQL + migrations)
- User registration and login
- JWT implementation
- Basic API tests

**Days 3-4**: Basic WebSocket Chat

- WebSocket server setup
- WebSocket authentication
- Single room messaging
- Message persistence
- Load message history

**Days 5-7**: Testing & Refinement

- Unit and integration tests
- WebSocket connection tests
- Error handling
- Code cleanup

### Week 4: Features

**Days 8-10**: Rooms & Presence

- Multiple rooms
- Join/leave rooms
- Online/offline status
- Typing indicators
- User list per room

**Days 11-13**: Direct Messages & Files

- One-on-one messaging
- File upload implementation
- File validation
- Image display in chat

**Day 14**: Testing & Polish

- Test all features
- Bug fixes
- UI improvements (if building frontend)

### Week 5: Scale & Production

**Days 15-16**: Horizontal Scaling

- Redis pub/sub setup
- Multi-server message routing
- Sticky session configuration
- Test with multiple instances

**Days 17-18**: Resilience & Performance

- Reconnection logic
- Connection health checks
- Rate limiting
- Message queuing for offline users
- Load testing

**Days 19-21**: Production Ready

- Security audit
- Complete test suite
- Documentation
- Monitoring setup
- Deployment preparation
- Final load tests

---

## 🎁 Bonus Features (Optional)

- [ ] Message reactions (emoji)
- [ ] Message editing and deletion
- [ ] Rich text formatting (markdown)
- [ ] Voice messages
- [ ] Video calls (WebRTC)
- [ ] Message search
- [ ] User blocking
- [ ] Admin moderation tools
- [ ] Message encryption (E2E)
- [ ] Read receipts
- [ ] Message threads/replies
- [ ] Custom emoji
- [ ] Giphy integration

---

## 📖 Learning Resources

### WebSockets

- [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [WebSocket Protocol RFC 6455](https://datatracker.ietf.org/doc/html/rfc6455)
- [Socket.io Documentation](https://socket.io/docs/v4/)

### Authentication

- [JWT.io Introduction](https://jwt.io/introduction)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Bcrypt Explained](https://auth0.com/blog/hashing-in-action-understanding-bcrypt/)

### Scaling WebSockets

- [Scaling Socket.io with Redis](https://socket.io/docs/v4/redis-adapter/)
- [Discord: Scaling to Millions of Connections](https://discord.com/blog/how-discord-scaled-elixir-to-5-000-000-concurrent-users)
- [WebSocket Load Balancing](https://www.nginx.com/blog/websocket-nginx/)

### Performance

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Clinic.js for Node.js Performance](https://clinicjs.org/)

---

## 🎯 Success Checklist

### Week 3 Checkpoint

- [ ] Users can register and login
- [ ] JWT authentication working
- [ ] WebSocket connection established with auth
- [ ] Messages sent and received in real-time
- [ ] Message history loaded from database
- [ ] Basic tests passing

### Week 4 Checkpoint

- [ ] Multiple rooms functional
- [ ] Users can join/leave rooms
- [ ] Typing indicators working
- [ ] Online/offline status displayed
- [ ] Direct messages working
- [ ] Files can be uploaded and viewed
- [ ] All core features tested

### Week 5 Checkpoint (Final)

- [ ] Multiple server instances running
- [ ] Messages delivered across servers via Redis
- [ ] 10,000 concurrent connections tested
- [ ] Auto-reconnect working
- [ ] Rate limiting implemented
- [ ] Security audit complete
- [ ] Comprehensive test coverage
- [ ] Documentation complete
- [ ] Ready for deployment

---

## 🎓 Reflection Questions

After completing this project, answer:

1. **WebSocket Understanding**

   - How does the WebSocket handshake work?
   - What are the differences between WebSocket and HTTP long-polling?
   - When would you choose WebSocket over Server-Sent Events?

2. **Scaling Challenges**

   - How does Redis pub/sub enable horizontal scaling?
   - What happens if Redis goes down?
   - How would you handle WebSocket connections during a rolling deployment?

3. **Authentication**

   - Why is JWT suitable for WebSocket authentication?
   - What are the trade-offs of short vs long token expiration?
   - How would you implement token refresh without disrupting the WebSocket connection?

4. **Performance**

   - What was your biggest bottleneck?
   - How did you optimize message delivery?
   - What would you do differently to handle 100,000 connections?

5. **Architecture Decisions**
   - Why did you choose your WebSocket library (ws vs Socket.io)?
   - How did you handle message ordering?
   - What would you change if you built this again?

---

**Next Steps**: After completing this project, move to Project 3 (E-Commerce API) to learn complex domain modeling, transactions, and background job processing.

Good luck! 🚀
