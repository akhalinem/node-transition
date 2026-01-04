# Week-by-Week Implementation Guide

This guide breaks down the 3-week project into daily tasks with clear objectives and deliverables.

---

## Week 3: Foundation (Authentication & Basic Chat)

### Day 1: Project Setup & User Model

**Time**: 3-4 hours

**Objectives**:

- ✅ Project structure created
- ✅ Database and Redis running
- ✅ User model implemented
- ✅ Basic server running

**Tasks**:

1. Follow PROJECT_SETUP.md steps 1-13
2. Create `src/models/User.ts`:
   ```typescript
   interface User {
     id: string;
     email: string;
     username: string;
     password_hash: string;
     created_at: Date;
     updated_at: Date;
   }
   ```
3. Create database helper functions in `src/models/User.ts`:
   - `findByEmail(email: string): Promise<User | null>`
   - `findById(id: string): Promise<User | null>`
   - `create(userData): Promise<User>`
4. Test database queries manually

**Deliverable**: Server starts, database queries work

---

### Day 2: Authentication (Register & Login)

**Time**: 4-5 hours

**Objectives**:

- ✅ User registration working
- ✅ User login with JWT working
- ✅ Password hashing implemented
- ✅ Auth middleware created

**Tasks**:

1. **Create auth service** (`src/services/authService.ts`):

   - `hashPassword(password: string): Promise<string>`
   - `comparePassword(password: string, hash: string): Promise<boolean>`
   - `generateAccessToken(userId: string): string`
   - `generateRefreshToken(userId: string): string`
   - `verifyToken(token: string): { userId: string }`

2. **Create auth controller** (`src/controllers/authController.ts`):

   - `register(req, res, next)`
   - `login(req, res, next)`

3. **Create validation middleware** (`src/middleware/validation.ts`):

   - Validate email format
   - Validate password strength (min 8 chars)
   - Validate username (alphanumeric, 3-50 chars)

4. **Create auth routes** (`src/routes/auth.ts`):

   - `POST /api/auth/register`
   - `POST /api/auth/login`

5. **Create Express app** (`src/app.ts`):

   - Set up middleware (cors, helmet, express.json)
   - Register routes
   - Global error handler

6. **Update server.ts** to start HTTP server

**Testing**:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

**Deliverable**: Can register and login, receive JWT token

---

### Day 3: WebSocket Server & Authentication

**Time**: 4-5 hours

**Objectives**:

- ✅ WebSocket server running
- ✅ WebSocket authentication working
- ✅ Connection lifecycle managed

**Tasks**:

1. **Create WebSocket server** (`src/websocket/server.ts`):

   ```typescript
   import WebSocket from "ws";

   const wss = new WebSocket.Server({ port: 3001 });

   wss.on("connection", (ws) => {
     console.log("New connection");

     ws.on("message", (data) => {
       // Handle messages
     });

     ws.on("close", () => {
       console.log("Connection closed");
     });
   });
   ```

2. **Create WebSocket authentication** (`src/websocket/middleware/wsAuth.ts`):

   - Parse authenticate message
   - Verify JWT token
   - Associate connection with user
   - Close connection if auth fails after 5 seconds

3. **Create connection manager** (`src/websocket/connectionManager.ts`):

   ```typescript
   class ConnectionManager {
     private connections: Map<string, WebSocket> = new Map();

     addConnection(userId: string, ws: WebSocket) {
       this.connections.set(userId, ws);
     }

     removeConnection(userId: string) {
       this.connections.delete(userId);
     }

     getConnection(userId: string): WebSocket | undefined {
       return this.connections.get(userId);
     }

     getUsersInRoom(roomId: string): string[] {
       // Track room memberships
     }
   }
   ```

4. **Define WebSocket event types** (`src/websocket/events.ts`):

   ```typescript
   type ClientMessage =
     | { type: "authenticate"; token: string }
     | { type: "send_message"; roomId: string; content: string }
     | { type: "join_room"; roomId: string }
     | { type: "leave_room"; roomId: string };

   type ServerMessage =
     | { type: "authenticated"; userId: string; username: string }
     | { type: "auth_error"; message: string }
     | { type: "new_message"; message: Message }
     | { type: "error"; message: string };
   ```

5. **Update server.ts** to start both HTTP and WebSocket servers

**Testing**:
Use a WebSocket client (Postman, wscat, or create simple HTML page):

```bash
npm install -g wscat
wscat -c ws://localhost:3001

# Send authentication message
{"type":"authenticate","token":"YOUR_JWT_TOKEN"}
```

**Deliverable**: WebSocket server accepts connections and authenticates users

---

### Day 4: Room Model & Basic Messaging

**Time**: 4-5 hours

**Objectives**:

- ✅ Room model created
- ✅ Can send messages to room
- ✅ Messages persisted to database
- ✅ Messages broadcast to room members

**Tasks**:

1. **Create Room model** (`src/models/Room.ts`):

   - `findAll(): Promise<Room[]>`
   - `findById(id: string): Promise<Room | null>`
   - `create(data): Promise<Room>`
   - `getMembers(roomId: string): Promise<User[]>`
   - `addMember(roomId: string, userId: string): Promise<void>`

2. **Create Message model** (`src/models/Message.ts`):

   - `create(data): Promise<Message>`
   - `findByRoom(roomId: string, limit, offset): Promise<Message[]>`

3. **Create message handler** (`src/websocket/handlers/messageHandler.ts`):

   ```typescript
   async function handleSendMessage(
     userId: string,
     data: { roomId: string; content: string },
     connectionManager: ConnectionManager
   ) {
     // 1. Validate message
     // 2. Check user is member of room
     // 3. Save message to database
     // 4. Broadcast to room members
   }
   ```

4. **Update WebSocket server** to handle send_message events

5. **Create room service** (`src/services/roomService.ts`):
   - Logic for room operations
   - Ensure user is room member before sending

**Testing**:

```bash
# Connect two WebSocket clients
# Both authenticate
# Both join same room (lobby)
# Send message from one client
# Verify other client receives message
```

**Deliverable**: Messages sent and received in real-time, saved to database

---

### Day 5: Message History & HTTP Endpoints

**Time**: 3-4 hours

**Objectives**:

- ✅ Load message history on join
- ✅ HTTP endpoints for rooms
- ✅ Pagination working

**Tasks**:

1. **Implement message history**:

   - When user joins room, send recent messages (last 50)
   - Implement pagination (offset/limit)

2. **Create room controller** (`src/controllers/roomController.ts`):

   - `getRooms(req, res, next)` - List all rooms
   - `getRoom(req, res, next)` - Get room details
   - `createRoom(req, res, next)` - Create new room
   - `getRoomMessages(req, res, next)` - Get message history

3. **Create room routes** (`src/routes/rooms.ts`):

   - `GET /api/rooms`
   - `GET /api/rooms/:id`
   - `POST /api/rooms`
   - `GET /api/rooms/:id/messages`

4. **Add auth middleware** to protect routes:

   ```typescript
   // src/middleware/auth.ts
   export function requireAuth(req, res, next) {
     const token = req.headers.authorization?.split(" ")[1];
     if (!token) {
       throw new UnauthorizedError("No token provided");
     }

     try {
       const decoded = verifyToken(token);
       req.userId = decoded.userId;
       next();
     } catch (error) {
       throw new UnauthorizedError("Invalid token");
     }
   }
   ```

5. **Update join_room handler** to send message history

**Testing**:

```bash
# Get rooms
curl http://localhost:3000/api/rooms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get message history
curl http://localhost:3000/api/rooms/ROOM_ID/messages?limit=20&offset=0 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Deliverable**: Message history loads when joining room, HTTP endpoints work

---

### Day 6-7: Testing & Refinement

**Time**: 4-6 hours

**Objectives**:

- ✅ Unit tests written
- ✅ Integration tests written
- ✅ WebSocket tests written
- ✅ Bugs fixed
- ✅ Code cleaned up

**Tasks**:

1. **Unit tests**:

   - `authService.test.ts`:
     - Test password hashing
     - Test JWT generation
     - Test token verification
   - `validation.test.ts`:
     - Test email validation
     - Test password validation

2. **Integration tests**:

   - `auth.test.ts`:
     - Test registration flow
     - Test login flow
     - Test validation errors
   - `rooms.test.ts`:
     - Test getting rooms
     - Test getting messages
     - Test authentication required

3. **WebSocket tests** (`src/tests/websocket/connection.test.ts`):

   ```typescript
   describe("WebSocket Connection", () => {
     it("should reject connection without authentication", async () => {
       // Test unauthenticated connection closes
     });

     it("should accept connection with valid token", async () => {
       // Test authenticated connection succeeds
     });

     it("should reject connection with invalid token", async () => {
       // Test invalid token rejected
     });
   });
   ```

4. **Code cleanup**:

   - Remove console.logs
   - Add proper error handling
   - Improve variable names
   - Add comments to complex logic

5. **Documentation**:
   - Update README with current state
   - Document API endpoints
   - Add setup instructions

**Deliverable**: Tests passing, code clean, Week 3 features complete

---

## Week 4: Advanced Features

### Day 8: Multiple Rooms

**Time**: 3-4 hours

**Objectives**:

- ✅ Can create custom rooms
- ✅ Can join/leave rooms
- ✅ Messages isolated per room
- ✅ Room member list working

**Tasks**:

1. **Update Room model**:

   - Add `removeMember(roomId, userId)`
   - Add `isUserMember(roomId, userId)`

2. **Create room handler** (`src/websocket/handlers/roomHandler.ts`):

   ```typescript
   async function handleJoinRoom(userId, { roomId }, connectionManager) {
     // 1. Check if room exists
     // 2. Add user to room_members
     // 3. Add user to in-memory room tracking
     // 4. Send room history to user
     // 5. Broadcast user_joined to room members
   }

   async function handleLeaveRoom(userId, { roomId }, connectionManager) {
     // 1. Remove from room_members
     // 2. Remove from in-memory tracking
     // 3. Broadcast user_left to room members
   }
   ```

3. **Update ConnectionManager**:

   - Track which rooms each user is in
   - Method to get all connections in a room
   - Method to broadcast to room

4. **Update message handler**:

   - Verify user is in room before allowing send
   - Only broadcast to users in that room

5. **Add room creation HTTP endpoint**:
   - Create room
   - Automatically join creator to room

**Testing**:

- Create multiple rooms
- Join different rooms
- Send messages to each room
- Verify isolation

**Deliverable**: Multiple rooms working, messages isolated per room

---

### Day 9: Presence & Online Status

**Time**: 3-4 hours

**Objectives**:

- ✅ Online/offline status working
- ✅ User list shows online users
- ✅ Connection/disconnection events broadcast

**Tasks**:

1. **Track online status**:

   - Use Redis: `SET online:{userId} 1 EX 30`
   - Refresh every 20 seconds (heartbeat)
   - On disconnect, delete key

2. **Create presence handler** (`src/websocket/handlers/presenceHandler.ts`):

   ```typescript
   async function setUserOnline(userId: string) {
     await redisClient.setex(`online:${userId}`, 30, "1");
   }

   async function setUserOffline(userId: string) {
     await redisClient.del(`online:${userId}`);
   }

   async function getOnlineUsers(userIds: string[]): Promise<string[]> {
     const pipeline = redisClient.pipeline();
     userIds.forEach((id) => pipeline.exists(`online:${id}`));
     const results = await pipeline.exec();
     return userIds.filter((_, i) => results[i][1] === 1);
   }
   ```

3. **Implement heartbeat**:

   - Client sends `ping` every 20 seconds
   - Server responds with `pong`
   - Server refreshes online status

4. **Send presence events**:

   - On user joins room: `user_joined` event
   - On user leaves room: `user_left` event
   - Include online status in events

5. **Add user list endpoint**:
   - `GET /api/rooms/:id/members`
   - Include online status for each member

**Testing**:

- Connect user, verify online
- Disconnect, verify offline after 30 seconds
- Check user list shows online status

**Deliverable**: Online/offline status working reliably

---

### Day 10: Typing Indicators

**Time**: 2-3 hours

**Objectives**:

- ✅ Typing indicators working
- ✅ Auto-stop after 3 seconds
- ✅ Multiple users can type simultaneously

**Tasks**:

1. **Create typing handler** (`src/websocket/handlers/typingHandler.ts`):

   ```typescript
   async function handleTypingStart(
     userId: string,
     username: string,
     roomId: string,
     connectionManager: ConnectionManager
   ) {
     // 1. Add to Redis: SADD typing:{roomId} {userId}
     // 2. Set expiration: EXPIRE typing:{roomId} 5
     // 3. Broadcast to room members (except sender)
   }

   async function handleTypingStop(
     userId: string,
     roomId: string,
     connectionManager: ConnectionManager
   ) {
     // 1. Remove from Redis: SREM typing:{roomId} {userId}
     // 2. Broadcast to room members
   }
   ```

2. **Add typing events to WebSocket**:

   - Handle `typing_start`
   - Handle `typing_stop`

3. **Auto-expiration**:

   - Use Redis EXPIRE (5 seconds safety)
   - Client should send `typing_stop` after 3 seconds

4. **Get currently typing users**:
   ```typescript
   async function getTypingUsers(roomId: string): Promise<string[]> {
     return await redisClient.smembers(`typing:${roomId}`);
   }
   ```

**Client-side logic** (for reference):

```typescript
let typingTimeout: NodeJS.Timeout;

function onUserType() {
  if (!typingTimeout) {
    sendMessage({ type: "typing_start", roomId });
  }

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    sendMessage({ type: "typing_stop", roomId });
    typingTimeout = null;
  }, 3000);
}
```

**Deliverable**: Typing indicators work smoothly

---

### Day 11: Direct Messages

**Time**: 3-4 hours

**Objectives**:

- ✅ Can send DMs to specific users
- ✅ DMs isolated from public rooms
- ✅ Unread count working
- ✅ DM history loading

**Tasks**:

1. **Create DirectMessage model** (`src/models/DirectMessage.ts`):

   - `create(data): Promise<DirectMessage>`
   - `getConversation(userId1, userId2, limit, offset): Promise<DirectMessage[]>`
   - `markAsRead(messageId): Promise<void>`
   - `getUnreadCount(userId): Promise<number>`

2. **Create DM handler** (`src/websocket/handlers/dmHandler.ts`):

   ```typescript
   async function handleSendDM(
     senderId: string,
     data: { recipientId: string; content: string },
     connectionManager: ConnectionManager
   ) {
     // 1. Save to direct_messages table
     // 2. Send to recipient if online
     // 3. Increment unread count
   }
   ```

3. **Add DM events**:

   - `send_dm` (client → server)
   - `new_dm` (server → client)

4. **Create DM endpoints**:

   - `GET /api/direct-messages/:userId` - Get conversation with user
   - `POST /api/direct-messages/:userId/read` - Mark messages as read
   - `GET /api/direct-messages/unread` - Get unread count

5. **Notifications**:
   - If recipient is online, deliver immediately
   - If offline, store and deliver on next connection

**Testing**:

- Send DM between two users
- Verify isolation from rooms
- Check unread count
- Mark as read

**Deliverable**: Direct messaging fully functional

---

### Day 12: File Uploads

**Time**: 3-4 hours

**Objectives**:

- ✅ Can upload images
- ✅ Can upload documents
- ✅ File validation working
- ✅ Files displayed in chat

**Tasks**:

1. **Set up multer**:

   ```typescript
   import multer from "multer";

   const storage = multer.diskStorage({
     destination: (req, file, cb) => {
       const type = file.mimetype.startsWith("image/") ? "images" : "documents";
       cb(null, `uploads/${type}`);
     },
     filename: (req, file, cb) => {
       const uuid = generateUUID();
       const ext = path.extname(file.originalname);
       cb(null, `${uuid}${ext}`);
     },
   });

   const upload = multer({
     storage,
     limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
     fileFilter: (req, file, cb) => {
       const allowed = [
         "image/jpeg",
         "image/png",
         "image/gif",
         "application/pdf",
       ];
       if (allowed.includes(file.mimetype)) {
         cb(null, true);
       } else {
         cb(new Error("Invalid file type"));
       }
     },
   });
   ```

2. **Create upload endpoint** (`src/routes/upload.ts`):

   ```typescript
   router.post(
     "/api/upload",
     requireAuth,
     upload.single("file"),
     async (req, res) => {
       // 1. File is already saved by multer
       // 2. Return file URL and metadata
       res.json({
         success: true,
         file: {
           id: req.file.filename,
           url: `/api/files/${req.file.filename}`,
           type: req.file.mimetype,
           size: req.file.size,
         },
       });
     }
   );
   ```

3. **Create file serving endpoint**:

   ```typescript
   router.get("/api/files/:filename", (req, res) => {
     const filePath = path.join(uploadsDir, req.params.filename);

     if (!fs.existsSync(filePath)) {
       throw new NotFoundError("File not found");
     }

     res.sendFile(filePath);
   });
   ```

4. **Update message model** to support file messages:

   - Add `file_url` field
   - Add `message_type` field ('text', 'image', 'file')

5. **Send file messages via WebSocket**:
   - First upload file via HTTP
   - Then send message with file URL via WebSocket

**Security**:

- Validate file types
- Limit file size
- Sanitize filename
- Store outside web root

**Testing**:

- Upload different file types
- Try uploading disallowed types
- Try uploading oversized files
- View files in chat

**Deliverable**: File uploads working securely

---

### Day 13: Rate Limiting

**Time**: 2-3 hours

**Objectives**:

- ✅ HTTP rate limiting working
- ✅ WebSocket message rate limiting working
- ✅ Upload rate limiting working

**Tasks**:

1. **HTTP rate limiting**:

   ```typescript
   import rateLimit from "express-rate-limit";

   const authLimiter = rateLimit({
     windowMs: 60 * 60 * 1000, // 1 hour
     max: 10,
     message: "Too many login attempts, please try again later.",
   });

   const apiLimiter = rateLimit({
     windowMs: 60 * 1000, // 1 minute
     max: 100,
   });
   ```

2. **WebSocket message rate limiting**:

   ```typescript
   class RateLimiter {
     private limits = new Map<string, { count: number; resetTime: number }>();

     checkLimit(userId: string, maxCount: number, windowMs: number): boolean {
       const now = Date.now();
       const limit = this.limits.get(userId);

       if (!limit || now > limit.resetTime) {
         this.limits.set(userId, { count: 1, resetTime: now + windowMs });
         return true;
       }

       if (limit.count >= maxCount) {
         return false; // Rate limited
       }

       limit.count++;
       return true;
     }
   }
   ```

3. **Apply rate limits**:

   - Before sending message, check rate limit
   - If limited, send error to user
   - Different limits for different actions

4. **Add cleanup**:
   - Periodically clean up old entries from rate limiter
   - Use `setInterval` to run every 5 minutes

**Testing**:

- Send 100+ messages rapidly
- Verify rate limit kicks in
- Wait and verify limit resets

**Deliverable**: Rate limiting prevents abuse

---

### Day 14: Testing & Bug Fixes

**Time**: 3-4 hours

**Objectives**:

- ✅ All Week 4 features tested
- ✅ Bugs fixed
- ✅ Code cleaned up

**Tasks**:

1. **Test all features**:

   - Create room
   - Join/leave rooms
   - Send messages to different rooms
   - Send direct messages
   - Upload files
   - Typing indicators
   - Online/offline status

2. **Write tests**:

   - Integration tests for new endpoints
   - WebSocket tests for new events
   - Unit tests for services

3. **Fix bugs**:

   - Edge cases
   - Error handling
   - Validation

4. **Code review**:
   - Refactor duplicated code
   - Improve error messages
   - Add missing validations

**Deliverable**: All Week 4 features working smoothly

---

## Week 5: Scale & Production-Ready

### Day 15-16: Horizontal Scaling with Redis

**Time**: 6-8 hours

**Objectives**:

- ✅ Multiple server instances running
- ✅ Redis pub/sub implemented
- ✅ Messages delivered across servers
- ✅ Sticky sessions configured

**Tasks**:

**Day 15**:

1. **Set up Redis pub/sub** (`src/websocket/pubsub.ts`):

   ```typescript
   import Redis from "ioredis";

   const publisher = new Redis(config.redis);
   const subscriber = new Redis(config.redis);

   export class PubSub {
     async publish(channel: string, message: any) {
       await publisher.publish(channel, JSON.stringify(message));
     }

     subscribe(channel: string, handler: (message: any) => void) {
       subscriber.subscribe(channel);
       subscriber.on("message", (ch, msg) => {
         if (ch === channel) {
           handler(JSON.parse(msg));
         }
       });
     }
   }
   ```

2. **Update message handler**:

   ```typescript
   async function handleSendMessage(userId, data, connectionManager, pubsub) {
     // 1. Save message to database
     const message = await Message.create({...});

     // 2. Publish to Redis
     await pubsub.publish(`room:${data.roomId}`, {
       type: 'new_message',
       message,
     });

     // Note: Don't broadcast here, wait for Redis message
   }
   ```

3. **Subscribe to room channels**:

   ```typescript
   // When user joins room
   async function handleJoinRoom(
     userId,
     { roomId },
     connectionManager,
     pubsub
   ) {
     // ...existing logic...

     // Subscribe to room channel (once per server, not per user)
     if (!subscriptions.has(roomId)) {
       pubsub.subscribe(`room:${roomId}`, (data) => {
         // Broadcast to local connections in this room
         const connections = connectionManager.getConnectionsInRoom(roomId);
         connections.forEach((conn) => {
           conn.send(JSON.stringify(data));
         });
       });
       subscriptions.add(roomId);
     }
   }
   ```

4. **Test with multiple servers**:
   - Run server on port 3000 and 3001
   - Connect to each server
   - Send message from one, verify received on other

**Day 16**:

5. **Set up load balancer** (Nginx):

   ```nginx
   upstream chat_backend {
     ip_hash;  # Sticky sessions
     server localhost:3000;
     server localhost:3001;
   }

   server {
     listen 80;

     location / {
       proxy_pass http://chat_backend;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
       proxy_set_header Host $host;
     }
   }
   ```

6. **Docker Compose** for multi-server testing:

   ```yaml
   version: "3.8"
   services:
     server1:
       build: .
       environment:
         PORT: 3000
         WS_PORT: 3001
       depends_on:
         - postgres
         - redis

     server2:
       build: .
       environment:
         PORT: 3000
         WS_PORT: 3001
       depends_on:
         - postgres
         - redis

     nginx:
       image: nginx:alpine
       ports:
         - "80:80"
       volumes:
         - ./nginx.conf:/etc/nginx/nginx.conf
       depends_on:
         - server1
         - server2
   ```

7. **Test scaling**:
   - Start multiple instances
   - Connect clients to different instances
   - Verify message delivery
   - Verify typing indicators work
   - Verify presence works

**Deliverable**: Multiple servers working together via Redis

---

### Day 17-18: Resilience & Performance

**Time**: 6-8 hours

**Objectives**:

- ✅ Auto-reconnect working
- ✅ Message queuing for offline users
- ✅ Connection health checks
- ✅ Graceful shutdown
- ✅ Performance optimized

**Day 17 Tasks**:

1. **Connection health checks**:

   ```typescript
   // Server-side heartbeat
   setInterval(() => {
     wss.clients.forEach((ws) => {
       if (ws.isAlive === false) {
         return ws.terminate();
       }

       ws.isAlive = false;
       ws.ping();
     });
   }, 30000);

   ws.on("pong", () => {
     ws.isAlive = true;
   });
   ```

2. **Client reconnection logic** (documentation):

   ```typescript
   class ChatClient {
     connect() {
       this.ws = new WebSocket("ws://localhost:3001");

       this.ws.onclose = () => {
         console.log("Disconnected, reconnecting...");
         setTimeout(() => this.connect(), 1000);
       };
     }
   }
   ```

3. **Graceful shutdown**:
   ```typescript
   process.on("SIGTERM", async () => {
     console.log("SIGTERM received, closing connections...");

     // Stop accepting new connections
     wss.close(() => {
       console.log("WebSocket server closed");
     });

     // Close existing connections gracefully
     wss.clients.forEach((ws) => {
       ws.send(JSON.stringify({ type: "server_shutdown" }));
       ws.close();
     });

     // Close database connections
     await pool.end();

     // Close Redis connections
     await redisClient.quit();

     process.exit(0);
   });
   ```

**Day 18 Tasks**:

4. **Message queue for offline users**:

   ```typescript
   // When sending DM to offline user
   async function handleSendDM(senderId, data, connectionManager) {
     const message = await DirectMessage.create({...});

     const recipientConnection = connectionManager.getConnection(data.recipientId);

     if (recipientConnection) {
       // User is online, deliver immediately
       recipientConnection.send(JSON.stringify({
         type: 'new_dm',
         message,
       }));
     } else {
       // User is offline, they'll get it on next connection
       // (Messages are in database, will be fetched on login)
     }
   }

   // On user connects
   async function onUserAuthenticated(userId, ws) {
     // Send unread DMs
     const unreadDMs = await DirectMessage.getUnread(userId);
     ws.send(JSON.stringify({
       type: 'unread_dms',
       messages: unreadDMs,
     }));
   }
   ```

5. **Performance optimizations**:

   - Add database indexes if missing
   - Optimize queries (use EXPLAIN ANALYZE)
   - Cache room member lists in Redis
   - Batch database operations
   - Use connection pooling efficiently

6. **Load testing**:

   ```javascript
   // Using k6
   import ws from "k6/ws";
   import { check } from "k6";

   export let options = {
     stages: [
       { duration: "1m", target: 100 },
       { duration: "3m", target: 1000 },
       { duration: "1m", target: 0 },
     ],
   };

   export default function () {
     const url = "ws://localhost:3001";
     const params = { tags: { name: "WSLoadTest" } };

     ws.connect(url, params, function (socket) {
       socket.on("open", () => {
         // Authenticate
         socket.send(
           JSON.stringify({
             type: "authenticate",
             token: "YOUR_JWT_TOKEN",
           })
         );
       });

       socket.on("message", (data) => {
         check(data, { "message received": (r) => r.length > 0 });
       });
     });
   }
   ```

**Deliverable**: System is resilient and performant

---

### Day 19-21: Production Ready

**Time**: 6-8 hours

**Objectives**:

- ✅ Security audit complete
- ✅ All tests passing
- ✅ Documentation complete
- ✅ Monitoring set up
- ✅ Ready for deployment

**Day 19: Security & Testing**:

1. **Security audit checklist**:

   - [ ] Passwords hashed with bcrypt
   - [ ] JWT secrets are strong and in env vars
   - [ ] Input validation on all endpoints
   - [ ] XSS prevention (sanitize HTML)
   - [ ] SQL injection prevention (parameterized queries)
   - [ ] Rate limiting on all endpoints
   - [ ] CORS configured properly
   - [ ] File uploads validated
   - [ ] No sensitive data in logs
   - [ ] HTTPS in production (document)

2. **Complete test suite**:
   - Unit tests: 80%+ coverage
   - Integration tests: All endpoints
   - WebSocket tests: All events
   - Load tests: 10k connections

**Day 20: Documentation & Monitoring**:

3. **Documentation**:

   - Update README with:
     - Complete setup instructions
     - API documentation
     - WebSocket events documentation
     - Architecture diagrams
     - Performance characteristics
   - Add code comments
   - Create deployment guide

4. **Monitoring** (optional but recommended):

   ```typescript
   import prometheus from "prom-client";

   const register = new prometheus.Registry();

   // Metrics
   const messageCounter = new prometheus.Counter({
     name: "chat_messages_total",
     help: "Total number of messages sent",
     labelNames: ["type"],
   });

   const activeConnections = new prometheus.Gauge({
     name: "chat_active_connections",
     help: "Number of active WebSocket connections",
   });

   // Expose metrics endpoint
   app.get("/metrics", async (req, res) => {
     res.set("Content-Type", register.contentType);
     res.end(await register.metrics());
   });
   ```

**Day 21: Final Testing & Deployment Prep**:

5. **Final load test**:

   - 10,000 concurrent connections
   - 1,000 messages per second
   - Monitor performance
   - Document results

6. **Create Dockerfile**:

   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci --only=production

   COPY . .
   RUN npm run build

   EXPOSE 3000 3001

   CMD ["node", "dist/server.js"]
   ```

7. **Deployment documentation**:
   - Environment variables
   - Database migrations
   - Scaling guide
   - Monitoring setup
   - Backup strategy

**Deliverable**: Production-ready chat platform!

---

## Daily Routine

Each day:

1. **Start** (15 min): Review plan for the day
2. **Build** (2-3 hours): Implement features
3. **Test** (30 min): Verify it works
4. **Document** (15 min): Update notes on what you learned
5. **Commit** (10 min): Commit with descriptive message

---

## Troubleshooting Guide

### WebSocket Connection Issues

- Check CORS settings
- Verify JWT token is valid
- Check WebSocket server is running
- Verify port is correct

### Messages Not Persisting

- Check database connection
- Verify SQL queries are correct
- Check for errors in logs

### Redis Issues

- Verify Redis is running: `redis-cli ping`
- Check Redis connection config
- Look for connection errors in logs

### Performance Issues

- Use `EXPLAIN ANALYZE` on slow queries
- Check database indexes
- Profile with clinic.js
- Monitor Redis memory usage

---

**You've got this!** Follow this guide day by day, and you'll have a production-ready chat platform in 3 weeks. 🚀
