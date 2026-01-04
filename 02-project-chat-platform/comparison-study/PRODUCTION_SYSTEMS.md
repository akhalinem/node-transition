# Production Chat Systems: Comparison Study

Learn from how production chat platforms are built at scale.

---

## 1. Discord

### Architecture Overview

**Scale**:

- 5+ million concurrent users
- 850+ million messages per day
- Sub-second message delivery

### Technology Stack

- **Language**: Elixir (originally Python, migrated for scalability)
- **Database**: Cassandra (for messages), PostgreSQL (for users/guilds)
- **Cache**: Redis
- **WebSocket**: Custom Elixir WebSocket implementation
- **Message Queue**: Custom distributed system

### Key Architectural Decisions

**Why Elixir?**

- Erlang VM (BEAM) designed for distributed, fault-tolerant systems
- Lightweight processes (millions per server)
- Built-in supervision trees (auto-restart failed processes)
- Soft real-time guarantees

**Guilds Architecture**:

```
User connects → assigned to Gateway server
                → joins Guild (chat room)
                → Guild process handles all messages
                → Routes to all members
```

**Scaling Strategy**:

- Each guild runs as a separate Elixir process
- Process automatically placed on least-loaded server
- If server crashes, processes migrate to other servers
- No sticky sessions needed!

**Message Storage (Cassandra)**:

```
Partition key: (channel_id, bucket)
Clustering key: message_id

bucket = floor(message_id / 1000)
```

Why this schema?

- Efficient range queries (load messages 1000-2000)
- Hot partition problem solved (recent messages distributed)
- Deletion is cheap (drop partition)

### Lessons for Your Project

1. **Process-per-room model**: Each room could be a separate Node.js process/worker
2. **Partition messages by time buckets**: Better than single-partition-per-room
3. **Use Cassandra for append-only data at scale**: But PostgreSQL is fine for learning project
4. **Measure everything**: Discord obsesses over latency metrics

**Read More**:

- [How Discord Scaled Elixir to 5M Concurrent Users](https://discord.com/blog/how-discord-scaled-elixir-to-5-000-000-concurrent-users)
- [How Discord Stores Billions of Messages](https://discord.com/blog/how-discord-stores-billions-of-messages)

---

## 2. Slack

### Architecture Overview

**Scale**:

- 20+ million daily active users
- 10+ billion messages stored
- 99.99% uptime SLA

### Technology Stack

- **Language**: PHP (originally), Java, Go, Node.js (polyglot)
- **Database**: MySQL (sharded), Vitess
- **Cache**: Memcached, Redis
- **WebSocket**: Custom protocol over WebSocket
- **Message Queue**: Kafka, Redis

### Key Architectural Decisions

**Sharding Strategy**:

```
User → Team (workspace) → Shard

Shard contains:
- All users in team
- All channels
- All messages
```

**Why shard by team?**

- Most operations are within a team
- Reduces cross-shard queries
- Simpler than user-based sharding

**Message Delivery**:

1. Client sends message via HTTP POST
2. Server saves to MySQL (team's shard)
3. Publishes to Redis pub/sub
4. All WebSocket servers subscribed to team's channel
5. Servers broadcast to connected clients

**Presence System**:

- Uses Redis sorted sets
- Score = last active timestamp
- Periodically clean up expired entries
- Clients send heartbeat every 30 seconds

### Lessons for Your Project

1. **Shard by room/workspace, not by user**: Most interaction is within a room
2. **Separate read and write paths**: HTTP for writes, WebSocket for reads
3. **Use sorted sets for presence**: Efficient queries and auto-expiration
4. **Graceful degradation**: If presence system fails, app still works

**Read More**:

- [Scaling Slack's Infrastructure](https://slack.engineering/scaling-slacks-job-queue/)
- [Flannel: An Application-Level Edge Cache](https://slack.engineering/flannel-an-application-level-edge-cache/)

---

## 3. WhatsApp

### Architecture Overview

**Scale**:

- 2+ billion users
- 100+ billion messages per day
- 50+ million messages per second (peak)

### Technology Stack

- **Language**: Erlang (like Discord)
- **Database**: Mnesia (Erlang's built-in DB), MySQL
- **Protocol**: XMPP (originally), custom protocol
- **End-to-End Encryption**: Signal Protocol

### Key Architectural Decisions

**Erlang for Massive Concurrency**:

- 1 process per user connection
- 2+ million processes per server
- Hot code reloading (zero-downtime deployments)

**Message Routing**:

```
Sender → Routing Layer → Recipient's Server → Recipient

If recipient offline:
  → Store in offline queue (PostgreSQL)
  → Deliver on next connection
```

**Offline Message Handling**:

- Messages stored until delivered
- Push notification sent
- Messages deleted after delivery confirmation

**Encryption**:

- All messages encrypted end-to-end
- Server only routes encrypted payloads
- Keys never leave devices

### Lessons for Your Project

1. **Store-and-forward for offline messages**: Don't lose messages
2. **Delivery confirmation**: Track message states (sent, delivered, read)
3. **Think about encryption early**: Hard to add later
4. **Erlang/Elixir is great for real-time**: Consider for future projects

**Read More**:

- [WhatsApp Engineering: Erlang at Facebook](https://www.erlang-solutions.com/blog/whatsapp-erlang-at-facebook/)
- [Signal Protocol Documentation](https://signal.org/docs/)

---

## 4. Telegram

### Architecture Overview

**Scale**:

- 700+ million users
- Unlimited file storage (free!)
- 15+ data centers globally

### Technology Stack

- **Language**: C++, Java (MTProto protocol)
- **Database**: Custom key-value store
- **Protocol**: MTProto (custom)
- **CDN**: Global CDN for media

### Key Architectural Decisions

**MTProto Protocol**:

- Custom protocol over TCP
- Optional end-to-end encryption (Secret Chats)
- Client-server encryption for regular chats
- Prioritizes speed over paranoia

**File Storage**:

- Files stored in data center closest to uploader
- Replicated across 3 data centers
- Cached globally via CDN
- No file size limits!

**Data Center Architecture**:

```
User connects to nearest DC
Messages synced across all DCs
User can access messages from any DC
```

**Secret Chats** (E2E encrypted):

- Not synced to cloud
- Only on devices that created chat
- Self-destruct timers
- Screenshots prevented (mobile)

### Lessons for Your Project

1. **Separate file storage from message storage**: Different scalability needs
2. **Geo-distributed architecture**: Latency matters for global apps
3. **Offer tiers of security**: Not everyone needs E2E encryption
4. **Think about CDN early for file sharing**: Bandwidth is expensive

**Read More**:

- [Telegram FAQ for Developers](https://core.telegram.org/faq)
- [MTProto Mobile Protocol](https://core.telegram.org/mtproto)

---

## 5. Microsoft Teams

### Architecture Overview

**Scale**:

- 270+ million monthly active users
- Integrated with Office 365
- Enterprise focus (compliance, security)

### Technology Stack

- **Language**: TypeScript, C#, .NET
- **Database**: Azure Cosmos DB, Azure SQL
- **WebSocket**: SignalR (ASP.NET)
- **Cloud**: Azure (obviously)

### Key Architectural Decisions

**SignalR for WebSocket Abstraction**:

- Automatic fallback (WebSocket → SSE → Long Polling)
- Reconnection logic built-in
- Scales with Azure Service Bus

**Azure Cosmos DB**:

- Multi-region replication
- Tunable consistency (eventual, strong, etc.)
- Automatic partitioning

**Compliance-First Architecture**:

- All messages logged for compliance
- Data residency controls
- GDPR, HIPAA compliance
- eDiscovery support

**Integration with Office 365**:

- Single sign-on (Azure AD)
- SharePoint for file storage
- OneDrive integration
- Tight coupling with Microsoft ecosystem

### Lessons for Your Project

1. **Automatic fallback is UX win**: Not all networks support WebSocket
2. **Consider compliance early for enterprise**: GDPR, data retention
3. **Integration matters**: If building for business, integrate with existing tools
4. **Use managed services**: Less operational burden (Azure, AWS)

**Read More**:

- [Microsoft Teams Architecture](https://docs.microsoft.com/en-us/microsoftteams/teams-architecture-solutions-posters)
- [SignalR Documentation](https://docs.microsoft.com/en-us/aspnet/signalr/)

---

## Common Patterns Across All Systems

### 1. Message Persistence

All systems persist messages **before** delivering:

```javascript
async function sendMessage(userId, roomId, content) {
  // 1. Save to database FIRST
  const message = await db.messages.insert({
    id: generateId(),
    userId,
    roomId,
    content,
    timestamp: Date.now(),
  });

  // 2. Then publish for delivery
  await pubsub.publish(`room:${roomId}`, message);

  // 3. Return confirmation to sender
  return message;
}
```

**Why?**

- If delivery fails, message is not lost
- Can replay messages from DB
- Source of truth

### 2. Idempotent Message IDs

All systems use unique message IDs:

```javascript
// Client generates ID
const messageId = generateUUID();

sendMessage({
  id: messageId,
  content: "Hello",
});

// If network fails, retry with same ID
// Server deduplicates by ID
```

**Why?**

- Prevents duplicate messages on retry
- Client can optimistically show message

### 3. Presence Heartbeats

All systems use periodic heartbeats:

```javascript
// Client sends every 30s
setInterval(() => {
  ws.send(JSON.stringify({ type: "heartbeat" }));
}, 30000);

// Server marks online
await redis.setex(`presence:${userId}`, 60, "1");

// If no heartbeat for 60s, user is offline
```

### 4. Offline Message Queuing

All systems queue messages for offline users:

```javascript
async function deliverMessage(recipientId, message) {
  const connection = getConnection(recipientId);

  if (connection) {
    // Online: deliver immediately
    connection.send(JSON.stringify(message));
  } else {
    // Offline: queue for later
    await db.offlineQueue.insert({
      userId: recipientId,
      message,
    });

    // Send push notification
    await sendPushNotification(recipientId, message);
  }
}

// On user connects
async function onUserConnect(userId, ws) {
  // Deliver queued messages
  const queued = await db.offlineQueue.find({ userId });

  for (const msg of queued) {
    ws.send(JSON.stringify(msg.message));
  }

  // Clear queue
  await db.offlineQueue.delete({ userId });
}
```

### 5. Delivery Confirmation

All systems track message state:

```
Sent → Delivered → Read
  ↓        ↓         ↓
  1        2         3
```

**Implementation**:

```javascript
// Client sends
ws.send(
  JSON.stringify({
    type: "send_message",
    id: "msg-123",
    content: "Hello",
  })
);

// Server confirms received
ws.send(
  JSON.stringify({
    type: "message_sent",
    id: "msg-123",
    timestamp: Date.now(),
  })
);

// Recipient confirms delivered
ws.send(
  JSON.stringify({
    type: "message_delivered",
    id: "msg-123",
  })
);

// Sender receives delivery confirmation
ws.send(
  JSON.stringify({
    type: "delivery_confirmation",
    messageId: "msg-123",
    status: "delivered",
  })
);

// Recipient marks as read
ws.send(
  JSON.stringify({
    type: "message_read",
    id: "msg-123",
  })
);
```

---

## Scaling Strategies Comparison

| System       | Approach                                                   | Trade-offs                            |
| ------------ | ---------------------------------------------------------- | ------------------------------------- |
| **Discord**  | Process-per-guild, Elixir processes migrate across servers | Complex (Elixir), amazing scalability |
| **Slack**    | Shard by team, sticky sessions                             | Simpler, team limit per shard         |
| **WhatsApp** | Process-per-user, Erlang                                   | Great for P2P messaging               |
| **Telegram** | Multi-DC, geo-distributed                                  | Complex, global latency optimized     |
| **Teams**    | Azure-managed, SignalR + Service Bus                       | Vendor lock-in, less control          |

### For Your Learning Project

**Start Simple (Week 3-4)**:

- Single server
- PostgreSQL + Redis
- Basic WebSocket

**Scale Horizontally (Week 5)**:

- Multiple Node.js instances
- Redis pub/sub for cross-server messaging
- Nginx with sticky sessions

**Future Enhancements** (Post-Project):

- Cassandra for message storage (Discord approach)
- Shard by room (Slack approach)
- Global CDN for file delivery (Telegram approach)

---

## Performance Benchmarks

### Message Delivery Latency

| System   | P50    | P95    | P99    |
| -------- | ------ | ------ | ------ |
| Discord  | <100ms | <200ms | <500ms |
| Slack    | <200ms | <500ms | <1s    |
| WhatsApp | <100ms | <200ms | <300ms |
| Telegram | <150ms | <300ms | <600ms |

**Your Target**: <100ms P95 for local messages

### Concurrent Connections per Server

| System       | Connections/Server | Technology               |
| ------------ | ------------------ | ------------------------ |
| Discord      | ~1M                | Elixir/BEAM              |
| WhatsApp     | ~2M                | Erlang/BEAM              |
| Slack        | ~100K              | Java/Go                  |
| Your Project | ~10K               | Node.js (single process) |

**Note**: Node.js limited by event loop. Use clustering for more:

```javascript
const cluster = require("cluster");
const os = require("os");

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Worker process - start WebSocket server
  startServer();
}
```

---

## Features Comparison

| Feature                   | Discord       | Slack            | WhatsApp      | Telegram          | Teams           |
| ------------------------- | ------------- | ---------------- | ------------- | ----------------- | --------------- |
| **Public Rooms**          | ✅            | ✅               | ✅ (Groups)   | ✅ (Channels)     | ✅              |
| **Private Messages**      | ✅            | ✅               | ✅            | ✅                | ✅              |
| **File Sharing**          | ✅ (8MB free) | ✅ (Limits vary) | ✅ (16MB-2GB) | ✅ (No limit!)    | ✅ (Office 365) |
| **Voice/Video**           | ✅            | ✅               | ✅            | ✅                | ✅              |
| **End-to-End Encryption** | ❌            | ❌               | ✅            | ✅ (Secret Chats) | ❌              |
| **Read Receipts**         | ✅            | ✅               | ✅            | ✅                | ✅              |
| **Typing Indicators**     | ✅            | ✅               | ✅            | ✅                | ✅              |
| **Message Reactions**     | ✅            | ✅               | ✅            | ✅                | ✅              |
| **Message Editing**       | ✅            | ✅               | ❌            | ✅                | ✅              |
| **Message Threading**     | ✅            | ✅               | ❌            | ✅                | ✅              |
| **Search**                | ✅            | ✅               | ✅            | ✅                | ✅              |
| **Bots/Integrations**     | ✅            | ✅               | ❌            | ✅                | ✅              |

### For Your Project (Week 3-5)

**MVP Features**:

- [x] Public rooms
- [x] Private messages
- [x] File sharing (images, docs)
- [x] Read receipts (optional)
- [x] Typing indicators
- [ ] Voice/video (skip for now)
- [ ] E2E encryption (advanced, skip)

---

## Database Schema Comparison

### Discord (Cassandra)

```sql
CREATE TABLE messages (
  channel_id bigint,
  bucket int,
  message_id bigint,
  author_id bigint,
  content text,
  PRIMARY KEY ((channel_id, bucket), message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);
```

**Why this works**:

- Partition by (channel, bucket) distributes load
- Clustering by message_id allows range queries
- Descending order optimized for "recent messages"

### Slack (MySQL, sharded)

```sql
-- Shard determined by team_id
CREATE TABLE messages (
  id BIGINT PRIMARY KEY,
  team_id BIGINT NOT NULL,
  channel_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  text TEXT,
  created_at TIMESTAMP,
  INDEX idx_channel_created (channel_id, created_at DESC)
);
```

### Your Project (PostgreSQL)

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id),
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_room_created
  ON messages(room_id, created_at DESC);
```

**Optimization Tip**: Add partial index for recent messages:

```sql
CREATE INDEX idx_recent_messages
  ON messages(room_id, created_at DESC)
  WHERE created_at > NOW() - INTERVAL '7 days';
```

---

## Key Takeaways

### What to Copy

1. **Redis pub/sub for cross-server messaging** (Discord, Slack)
2. **Store messages before delivering** (everyone)
3. **Heartbeat for presence** (everyone)
4. **Offline message queuing** (WhatsApp, Telegram)
5. **Message state tracking** (sent → delivered → read)

### What to Avoid (For Now)

1. **Custom protocols** (MTProto, XMPP) - use WebSocket
2. **Elixir/Erlang** (amazing, but learn Node.js first)
3. **Cassandra** (PostgreSQL is fine for learning)
4. **Multi-region replication** (overkill for project)
5. **End-to-end encryption** (complex, needs crypto expertise)

### Your Competitive Advantage

After this project, you can confidently discuss:

> "I built a real-time chat platform handling 10,000 concurrent connections with sub-100ms message delivery. It uses WebSocket for bidirectional communication, Redis pub/sub for horizontal scaling, and PostgreSQL for persistence. I implemented authentication with JWT, typing indicators, file uploads, and comprehensive error handling."

**That's impressive in any interview!** 🚀

---

## Further Study

After completing your project, deep dive into:

- [Discord Engineering Blog](https://discord.com/category/engineering)
- [Slack Engineering Blog](https://slack.engineering/)
- [High Scalability: Chat Architecture](http://highscalability.com/blog/category/example)
- [System Design Primer: Chat System](https://github.com/donnemartin/system-design-primer)

Good luck building! 🎉
