# Architecture Decision Records (ADR)

This document captures key architectural decisions made during the design of the Real-Time Chat Platform.

---

## ADR-001: WebSocket Library Choice

**Date**: Week 3, Day 1  
**Status**: Proposed  
**Decision Makers**: You

### Context

Need to choose between raw `ws` library and Socket.io for WebSocket implementation.

### Options Considered

#### Option 1: Socket.io

**Pros**:

- Built-in reconnection handling
- Automatic fallback to long-polling
- Event-based API (easy to use)
- Built-in room management
- Large community and ecosystem
- Built-in Redis adapter for scaling

**Cons**:

- Larger bundle size
- More abstraction (less control)
- Custom protocol (not pure WebSocket)
- May be overkill for simple use cases

#### Option 2: ws (raw WebSocket)

**Pros**:

- Lightweight and fast
- Pure WebSocket protocol (standard compliant)
- Full control over implementation
- Better for learning WebSocket internals
- Smaller footprint

**Cons**:

- Manual reconnection logic needed
- Manual room management
- Need to build Redis pub/sub integration
- More boilerplate code

### Decision

**Recommendation**: Start with `ws` library

**Reasoning**:

- Better learning experience (understand WebSocket protocol)
- More control over implementation
- Lighter weight
- Can always switch to Socket.io later if needed
- This is a learning project, depth > convenience

### Consequences

- Need to implement reconnection logic manually
- Need to build room management
- Need to integrate Redis pub/sub manually
- More code to write, but better understanding

**Fallback**: If complexity becomes unmanageable by Week 4, switch to Socket.io

---

## ADR-002: Database Schema Design

**Date**: Week 3, Day 1  
**Status**: Decided

### Context

Need to decide how to store messages and relationships.

### Decision

Use separate tables for:

- `messages` (room messages)
- `direct_messages` (one-on-one messages)

### Alternative Considered

Single `messages` table with nullable `room_id` and `recipient_id`.

### Reasoning

**Chosen approach (separate tables)**:

- Clearer separation of concerns
- Easier to optimize queries (different access patterns)
- Easier to add room-specific features
- Better index performance

**Why not single table**:

- Mixing room and direct messages complicates queries
- Different features may evolve differently
- Index overhead for handling both types

### Consequences

- More tables to manage
- Possible code duplication (mitigated with shared service layer)
- Clear separation makes reasoning easier

---

## ADR-003: Database Migration Strategy

**Date**: Week 3, Day 1
**Status**: Decided

### Context

Need a strategy for managing database schema changes over time.

### Decision

Do not use a migration tool for this learning project. Instead, manage schema changes manually with SQL scripts.

### Alternatives Considered

#### Option 1: Use a migration tool (e.g., node-pg-migrate)

**Pros**: Automated schema management, versioning, easy rollbacks  
**Cons**: Additional complexity, learning curve, overhead for small project

### Option 2: Use an ORM with built-in migrations (e.g., TypeORM, Prisma)

**Pros**: Simplifies data modeling, built-in migrations, active community  
**Cons**: Adds abstraction, potential performance overhead, learning curve

#### Option 3: Manual SQL scripts (chosen)

**Pros**: Full control, better learning experience, no extra dependencies  
**Cons**: More manual work, risk of human error, no automated rollback

### Reasoning

Manual SQL scripts provide the most control and a deeper understanding of the database schema. This approach aligns with the project's learning objectives by encouraging exploration of SQL and database design principles.

### Implementation

1. Create a `migrations/` directory in the project root.
2. For each schema change, create a new SQL script with a timestamped filename (e.g., `202409011430_add_typing_indicator_table.sql`).
3. Maintain a simple log file (`migrations/MIGRATION_LOG.md`) to track applied migrations.
4. Apply migrations manually by executing the SQL scripts against the database in order.

### Consequences

- Requires discipline to manage migrations manually
- No automated rollback; must create separate "down" scripts if needed
- Encourages learning of SQL and database concepts

### Lessons Learned (To Update During Project)

- [ ] How often did I need rollbacks?
- [ ] Did manual migrations slow down iteration?
- [ ] Would a migration tool have helped in Week 5?
- [ ] What's my recommendation for future projects?

---

## ADR-004: Authentication Strategy

**Date**: Week 3, Day 1  
**Status**: Decided

### Context

Need authentication for both HTTP API and WebSocket connections.

### Decision

Use JWT (JSON Web Tokens) with:

- Short-lived access tokens (15 minutes)
- Longer-lived refresh tokens (7 days)
- Separate secrets for access and refresh tokens

### Alternatives Considered

#### Option 1: Session-based auth

**Pros**: Easier to revoke, server has full control  
**Cons**: Doesn't scale well with multiple servers, needs sticky sessions or shared session store

#### Option 2: OAuth2

**Pros**: Industry standard, delegation support  
**Cons**: Overkill for this project, adds complexity

#### Option 3: Long-lived JWT only

**Pros**: Simple implementation  
**Cons**: Cannot revoke tokens easily, security risk

### Reasoning

JWT with refresh tokens provides:

- Stateless authentication (scales horizontally)
- Ability to revoke refresh tokens
- Short-lived access tokens limit exposure
- Works seamlessly with WebSocket connections
- Industry-standard approach

### Implementation Details

- Access token passed in `Authorization` header (HTTP) or in WebSocket handshake
- Refresh token stored in httpOnly cookie (if building web client)
- Token blacklist using Redis for logout

### Consequences

- Need to implement token refresh endpoint
- Need Redis for token blacklist
- Slightly more complex than session-based
- Better security and scalability

---

## ADR-005: WebSocket Authentication

**Date**: Week 3, Day 3  
**Status**: Decided

### Context

How to authenticate WebSocket connections?

### Decision

Send JWT token in first WebSocket message after connection:

```json
{
  "type": "authenticate",
  "token": "jwt_token_here"
}
```

### Alternatives Considered

#### Option 1: Token in connection URL query param

```
ws://localhost:3001?token=jwt_token
```

**Pros**: Simple, works with any WebSocket client  
**Cons**: Token in URL can be logged in proxies/servers, less secure

#### Option 2: Token in WebSocket subprotocol

**Pros**: Part of handshake, more "proper"  
**Cons**: Not all clients support it easily

#### Option 3: Token in first message (chosen)

**Pros**:

- Secure (not in URL)
- Flexible
- Works with all clients
- Can close connection if auth fails

**Cons**: Need to handle unauthenticated messages

### Implementation

1. Client connects to WebSocket
2. Server expects `authenticate` message within 5 seconds
3. Verify JWT token
4. Associate connection with user
5. Close connection if authentication fails

### Consequences

- Need timeout for authentication
- Need to handle messages before authentication
- Clear authentication flow

---

## ADR-006: Horizontal Scaling Strategy

**Date**: Week 5, Day 1  
**Status**: Proposed

### Context

Need to scale WebSocket connections across multiple server instances.

### Decision

Use Redis Pub/Sub for inter-server communication with sticky sessions.

### Architecture

```
Client 1 ──┐
Client 2 ──┼──> [Load Balancer] ──┬──> Server 1 ──┐
Client 3 ──┘    (Sticky by IP)     └──> Server 2 ──┼──> Redis Pub/Sub
                                                     └──> PostgreSQL
```

### How It Works

1. Load balancer uses sticky sessions (same IP → same server)
2. When Server 1 receives a message, it:
   - Saves to PostgreSQL
   - Publishes to Redis channel (e.g., `room:${roomId}`)
3. All servers subscribe to all room channels
4. Server 2 receives message from Redis and broadcasts to its connected clients

### Alternatives Considered

#### Option 1: Shared state in Redis

Store all connection state in Redis  
**Pros**: Truly stateless servers  
**Cons**: High Redis load, complex state management

#### Option 2: Service mesh (Linkerd, Istio)

**Pros**: Advanced features  
**Cons**: Overkill for this project, steep learning curve

### Implementation Plan

1. Set up Redis connection in each server
2. Subscribe to channels on startup
3. Publish messages to channels
4. Handle channel messages by broadcasting to local clients
5. Configure load balancer for sticky sessions

### Consequences

- Need Redis for pub/sub (dependency)
- Need load balancer configuration
- Messages duplicated (in DB and Redis)
- Slight latency increase (Redis hop)
- Scalable to many servers

---

## ADR-007: Message Delivery Guarantee

**Date**: Week 5, Day 2  
**Status**: Proposed

### Context

What delivery guarantee do we provide for messages?

### Decision

**At-least-once delivery** with client-side deduplication.

### Approach

1. Server saves message to database (gets message ID)
2. Server publishes to Redis with message ID
3. All servers broadcast to clients with message ID
4. Clients deduplicate by message ID

### Why At-Least-Once?

- **Not At-Most-Once**: Too much message loss risk
- **Not Exactly-Once**: Too complex for chat application
- **At-Least-Once**: Good balance
  - Messages may duplicate on network issues
  - Clients can deduplicate
  - Simpler to implement
  - Acceptable for chat

### Client-Side Deduplication

Clients maintain a Set of seen message IDs (last 1000 messages) and ignore duplicates.

### Failure Scenarios

**Scenario 1**: Client sends message, server crashes before saving

- **Result**: Message lost
- **Mitigation**: Client can retry, or accept loss (not critical for chat)

**Scenario 2**: Server saves message but crashes before broadcasting

- **Result**: Message saved but not delivered
- **Mitigation**: Clients fetch recent messages on reconnect

**Scenario 3**: Network partition during broadcast

- **Result**: Some clients get message, some don't
- **Mitigation**: Reconnect triggers message history fetch

### Consequences

- Simpler implementation than exactly-once
- Acceptable user experience (duplicates rare and handled)
- Need client-side deduplication logic
- Need reconnection message sync

---

## ADR-008: File Upload Storage

**Date**: Week 4, Day 4  
**Status**: Decided

### Context

Where to store uploaded files?

### Decision

**Phase 1 (Week 4)**: Local filesystem  
**Phase 2 (Post-project)**: Cloud storage (S3)

### Reasoning

**For learning project**:

- Local filesystem is simple and fast
- No cloud costs
- Easy to understand flow
- Sufficient for development and testing

**For production** (future):

- S3 or similar cloud storage
- CDN for fast delivery
- Better scalability
- Durability and backups

### Implementation (Phase 1)

```
uploads/
  ├── images/
  │   └── {uuid}.jpg
  ├── documents/
  │   └── {uuid}.pdf
  └── .gitkeep
```

### File Upload Flow

1. Client uploads file via multipart/form-data
2. Server validates file (size, type)
3. Generate UUID filename
4. Save to `uploads/{category}/{uuid}.{ext}`
5. Save file metadata to database
6. Return file URL: `/api/files/{uuid}`

### Security Measures

- Validate MIME type
- Validate file extension
- Limit file size (5MB)
- Sanitize filename
- Store outside web root (serve via API route)
- Scan for malware (optional, using ClamAV)

### Consequences

- Files stored locally (not scalable to multiple servers)
- Need shared volume or S3 for multi-server deployment
- Simple for development
- Clear upgrade path to cloud storage

---

## ADR-009: Typing Indicators Implementation

**Date**: Week 4, Day 2  
**Status**: Proposed

### Context

How to implement "User is typing..." indicators efficiently?

### Decision

Use transient events (don't persist to database) with debouncing.

### Flow

1. Client sends `typing_start` when user types
2. Server broadcasts to room members (except sender)
3. Client automatically sends `typing_stop` after 3 seconds of inactivity
4. Server broadcasts `typing_stop`

### Why Not Persist?

- Typing indicators are ephemeral
- No historical value
- High frequency (every keystroke could trigger)
- Persisting would overload database

### Debouncing Strategy

**Client-side**:

- Send `typing_start` on first keystroke
- Don't send again for 2 seconds (debounce)
- Auto-send `typing_stop` after 3 seconds of inactivity

**Server-side**:

- Track typing users in memory (Redis)
- Auto-expire after 5 seconds (safety)

### Data Structure (Redis)

```
Key: typing:{roomId}
Value: Set of user IDs
TTL: 5 seconds
```

### Scaling Consideration

With multiple servers:

- Each server tracks typing state in Redis
- Broadcasts received via pub/sub
- All servers read same Redis typing state

### Consequences

- Efficient (no database writes)
- Scales well
- Ephemeral by nature (matches use case)
- Need client-side debouncing logic

---

## ADR-010: Rate Limiting Strategy

**Date**: Week 5, Day 3  
**Status**: Proposed

### Context

How to prevent abuse and ensure fair usage?

### Decision

Multi-layer rate limiting:

1. **HTTP API**: express-rate-limit middleware
2. **WebSocket Messages**: Custom in-memory counter per user
3. **Authentication**: Strict limits on login/register

### Rate Limits

| Action             | Limit        | Window   | Scope    |
| ------------------ | ------------ | -------- | -------- |
| Registration       | 5 requests   | 1 hour   | Per IP   |
| Login              | 10 requests  | 1 hour   | Per IP   |
| HTTP API           | 100 requests | 1 minute | Per IP   |
| WebSocket Messages | 60 messages  | 1 minute | Per user |
| File Upload        | 10 uploads   | 1 hour   | Per user |

### Implementation

**HTTP (using express-rate-limit)**:

```typescript
import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: "Too many requests, please try again later.",
});
```

**WebSocket (custom)**:

```typescript
// In-memory map: userId -> { count, resetTime }
const messageLimits = new Map();

function checkMessageLimit(userId: string): boolean {
  const now = Date.now();
  const limit = messageLimits.get(userId);

  if (!limit || now > limit.resetTime) {
    messageLimits.set(userId, {
      count: 1,
      resetTime: now + 60000, // 1 minute
    });
    return true;
  }

  if (limit.count >= 60) {
    return false; // Rate limited
  }

  limit.count++;
  return true;
}
```

### Why Per-User for WebSocket?

- IP-based doesn't work (multiple users behind NAT)
- Authenticated users are identified
- Prevents individual user abuse

### Consequences

- Protected against abuse
- Need to handle rate limit errors gracefully
- May need to adjust limits based on usage
- In-memory limits reset on server restart (acceptable)

---

## ADR-011: Error Handling Strategy

**Date**: Week 3, Day 2  
**Status**: Decided

### Context

How to handle errors consistently across HTTP and WebSocket?

### Decision

Use custom error classes with consistent error response format.

### Error Classes

```typescript
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401);
  }
}

class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}
```

### HTTP Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "User not found",
    "code": "USER_NOT_FOUND",
    "statusCode": 404
  }
}
```

### WebSocket Error Format

```json
{
  "type": "error",
  "error": {
    "message": "Invalid message format",
    "code": "INVALID_MESSAGE"
  }
}
```

### Global Error Handler (Express)

```typescript
app.use((err, req, res, next) => {
  if (err.isOperational) {
    // Operational error (expected)
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
  } else {
    // Programming error (unexpected)
    console.error("ERROR:", err);
    res.status(500).json({
      success: false,
      error: {
        message: "Internal server error",
        statusCode: 500,
      },
    });
  }
});
```

### Consequences

- Consistent error handling
- Clear distinction between operational and programming errors
- Better client-side error handling
- Easier debugging

---

## Future ADRs to Consider

As you build the project, document these decisions:

- **ADR-012**: Logging strategy (structured logging format)
- **ADR-013**: Testing approach (unit vs integration test boundaries)
- **ADR-014**: Connection health check strategy (heartbeat interval)
- **ADR-015**: Message history pagination approach
- **ADR-016**: Deployment strategy (Docker, cloud platform)

---

## How to Use This Document

1. **Before making a decision**: Review existing ADRs for similar decisions
2. **When deciding**: Document your reasoning even if you change it later
3. **After building**: Update ADRs with actual implementation details
4. **When reviewing**: Use ADRs to understand why things are the way they are

**Remember**: These are not set in stone. Update them as you learn!
