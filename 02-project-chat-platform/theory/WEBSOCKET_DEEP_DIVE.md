# WebSocket Deep Dive

Understanding WebSockets is critical for building real-time applications. This guide covers everything you need to know.

---

## What is WebSocket?

WebSocket is a **bidirectional**, **full-duplex** communication protocol that operates over a single TCP connection. Unlike HTTP, which follows a request-response pattern, WebSocket allows **both client and server** to send messages independently at any time.

### Key Characteristics

- **Persistent Connection**: Connection stays open
- **Low Latency**: No overhead of repeated HTTP handshakes
- **Bidirectional**: Both client and server can initiate communication
- **Full-Duplex**: Data flows in both directions simultaneously
- **Lightweight**: Minimal framing overhead (2 bytes)

---

## WebSocket vs Other Technologies

### HTTP Long-Polling

**How it works**:

1. Client sends HTTP request
2. Server holds request open until new data
3. Server responds with data
4. Client immediately sends another request

**Problems**:

- High latency (repeated HTTP overhead)
- Wastes bandwidth (HTTP headers on every poll)
- One-way communication (client → server)

### Server-Sent Events (SSE)

**How it works**:

- Client opens HTTP connection
- Server sends events as they occur
- Text-based protocol

**Limitations**:

- One-way only (server → client)
- Limited to text data
- Max 6 connections per browser (HTTP/1.1 limit)

**When to use**: Real-time notifications, live feeds (read-only)

### WebSocket

**Advantages**:

- True bidirectional communication
- Low latency
- Binary and text data
- No connection limit per domain

**When to use**: Chat apps, gaming, collaborative editing, live trading

---

## WebSocket Protocol

### Handshake (Upgrade from HTTP)

**Client Request**:

```http
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Origin: http://example.com
```

**Server Response**:

```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

### Key Header Explanation

- **Upgrade**: Indicates protocol upgrade to WebSocket
- **Connection: Upgrade**: Must be present
- **Sec-WebSocket-Key**: Random base64-encoded value
- **Sec-WebSocket-Accept**: Server's computed response (proves it's a WebSocket server)
- **Sec-WebSocket-Version**: Protocol version (13 is current)

### Handshake Validation

Server computes accept key:

```javascript
const crypto = require("crypto");

function generateAcceptKey(clientKey) {
  const GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
  const hash = crypto
    .createHash("sha1")
    .update(clientKey + GUID)
    .digest("base64");
  return hash;
}
```

---

## WebSocket Frame Structure

After handshake, data is sent in **frames**:

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-------+-+-------------+-------------------------------+
|F|R|R|R| opcode|M| Payload len |    Extended payload length    |
|I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
|N|V|V|V|       |S|             |   (if payload len==126/127)   |
| |1|2|3|       |K|             |                               |
+-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
|     Extended payload length continued, if payload len == 127  |
+ - - - - - - - - - - - - - - - +-------------------------------+
|                               |Masking-key, if MASK set to 1  |
+-------------------------------+-------------------------------+
| Masking-key (continued)       |          Payload Data         |
+-------------------------------- - - - - - - - - - - - - - - - +
:                     Payload Data continued ...                :
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
|                     Payload Data continued ...                |
+---------------------------------------------------------------+
```

### Frame Fields

- **FIN (1 bit)**: Final fragment flag (1 = last fragment)
- **RSV1-3 (3 bits)**: Reserved for extensions
- **Opcode (4 bits)**:
  - `0x0`: Continuation frame
  - `0x1`: Text frame
  - `0x2`: Binary frame
  - `0x8`: Close frame
  - `0x9`: Ping frame
  - `0xA`: Pong frame
- **MASK (1 bit)**: Payload is masked (client → server must be 1)
- **Payload length (7 bits)**: Actual length or indicator for extended length
- **Masking key (32 bits)**: Used to XOR payload (client → server only)

### Why Masking?

Client-to-server frames **must** be masked to prevent cache poisoning attacks in proxies.

---

## Connection Lifecycle

### 1. Opening Handshake

```javascript
const ws = new WebSocket("ws://localhost:3001");

ws.addEventListener("open", (event) => {
  console.log("Connected to server");
});
```

### 2. Message Exchange

```javascript
// Send message
ws.send("Hello server");

// Receive message
ws.addEventListener("message", (event) => {
  console.log("Received:", event.data);
});
```

### 3. Ping/Pong (Heartbeat)

```javascript
// Server-side (Node.js ws library)
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping(); // Send ping
  });
}, 30000);

ws.on("pong", () => {
  ws.isAlive = true; // Received pong
});
```

**Purpose**:

- Detect broken connections
- Keep connection alive through firewalls/proxies

### 4. Closing Handshake

```javascript
// Client initiates close
ws.close(1000, "Normal closure");

// Server receives close event
ws.on("close", (code, reason) => {
  console.log(`Connection closed: ${code} - ${reason}`);
});
```

### Close Codes

| Code | Meaning                                |
| ---- | -------------------------------------- |
| 1000 | Normal closure                         |
| 1001 | Going away (browser navigating away)   |
| 1002 | Protocol error                         |
| 1003 | Unsupported data                       |
| 1006 | Abnormal closure (no close frame sent) |
| 1007 | Invalid frame payload data             |
| 1008 | Policy violation                       |
| 1009 | Message too big                        |
| 1011 | Server error                           |

---

## WebSocket in Node.js

### Using `ws` Library

```javascript
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3001 });

wss.on("connection", (ws, req) => {
  console.log("New connection from", req.socket.remoteAddress);

  // Send message to client
  ws.send(JSON.stringify({ type: "welcome", message: "Hello!" }));

  // Receive message from client
  ws.on("message", (data) => {
    console.log("Received:", data.toString());

    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  // Handle errors
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  // Handle close
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
```

### Connection States

```javascript
ws.readyState === WebSocket.CONNECTING; // 0
ws.readyState === WebSocket.OPEN; // 1
ws.readyState === WebSocket.CLOSING; // 2
ws.readyState === WebSocket.CLOSED; // 3
```

---

## Scaling WebSockets

### Problem: Sticky Sessions Required

WebSocket connections are **stateful**. If you have multiple servers:

```
Client 1 ──┬──> Server 1 (has Client 1's connection)
Client 2 ──┘    Server 2 (has Client 2's connection)
```

If Client 1 sends a message to Client 2:

- Message arrives at Server 1
- Server 1 doesn't have Client 2's connection
- **Message won't be delivered!**

### Solution 1: Sticky Sessions

**How it works**: Load balancer always routes same client to same server.

**Methods**:

- **IP Hash**: Hash client IP → server
- **Cookie**: Set cookie on first connection, use for routing

**Nginx config**:

```nginx
upstream websocket {
  ip_hash;  # Sticky by IP
  server server1:3001;
  server server2:3001;
}

server {
  location /ws {
    proxy_pass http://websocket;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

**Limitation**: If server crashes, all its clients disconnect.

### Solution 2: Shared State with Redis Pub/Sub

**How it works**:

1. All servers subscribe to Redis channels
2. When Server 1 receives message, it publishes to Redis
3. All servers (including Server 1) receive from Redis
4. Each server broadcasts to its local connections

```javascript
const Redis = require("ioredis");
const publisher = new Redis();
const subscriber = new Redis();

// Subscribe to channel
subscriber.subscribe("chat-room-1");

// Receive messages from Redis
subscriber.on("message", (channel, message) => {
  const data = JSON.parse(message);

  // Broadcast to local WebSocket connections
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
});

// When receiving WebSocket message
ws.on("message", (data) => {
  // Publish to Redis (all servers will receive)
  publisher.publish("chat-room-1", data);
});
```

**Advantages**:

- Messages delivered even if sender and recipient on different servers
- Better fault tolerance
- Horizontal scaling

**Architecture**:

```
┌─────────┐     ┌─────────┐
│ Client1 │────►│ Server1 │───┐
└─────────┘     └─────────┘   │
                              │
┌─────────┐     ┌─────────┐   │   ┌──────────┐
│ Client2 │────►│ Server2 │───┼──►│  Redis   │
└─────────┘     └─────────┘   │   │  Pub/Sub │
                              │   └──────────┘
┌─────────┐     ┌─────────┐   │         │
│ Client3 │────►│ Server3 │───┘         │
└─────────┘     └─────────┘◄────────────┘
                     ▲
                     │
              (all servers subscribe)
```

---

## Security Considerations

### 1. Origin Validation

Validate `Origin` header during handshake:

```javascript
wss.on("connection", (ws, req) => {
  const origin = req.headers.origin;
  const allowedOrigins = ["http://localhost:3000", "https://myapp.com"];

  if (!allowedOrigins.includes(origin)) {
    ws.close(1008, "Origin not allowed");
    return;
  }

  // Continue...
});
```

### 2. Authentication

WebSocket doesn't have built-in auth. Options:

**Option A: Token in first message**:

```javascript
ws.on("message", (data) => {
  const message = JSON.parse(data);

  if (message.type === "auth") {
    const user = verifyJWT(message.token);
    if (user) {
      ws.userId = user.id; // Attach to connection
    } else {
      ws.close(1008, "Invalid token");
    }
  }
});
```

**Option B: Token in query param** (less secure):

```javascript
const url = new URL(req.url, "http://localhost");
const token = url.searchParams.get("token");
```

### 3. Rate Limiting

Prevent abuse:

```javascript
const rateLimits = new Map();

ws.on("message", (data) => {
  const userId = ws.userId;
  const now = Date.now();

  if (!rateLimits.has(userId)) {
    rateLimits.set(userId, { count: 1, resetTime: now + 60000 });
  } else {
    const limit = rateLimits.get(userId);

    if (now > limit.resetTime) {
      limit.count = 1;
      limit.resetTime = now + 60000;
    } else if (limit.count >= 60) {
      ws.send(JSON.stringify({ error: "Rate limit exceeded" }));
      return;
    } else {
      limit.count++;
    }
  }

  // Process message...
});
```

### 4. Input Validation

Always validate and sanitize:

```javascript
ws.on("message", (data) => {
  let message;

  try {
    message = JSON.parse(data);
  } catch (error) {
    ws.send(JSON.stringify({ error: "Invalid JSON" }));
    return;
  }

  if (!message.type || typeof message.type !== "string") {
    ws.send(JSON.stringify({ error: "Invalid message format" }));
    return;
  }

  // Sanitize content
  if (message.content) {
    message.content = sanitizeHtml(message.content);
  }

  // Process message...
});
```

---

## Performance Optimization

### 1. Binary vs Text

Binary is more efficient for structured data:

```javascript
// Text (JSON)
ws.send(JSON.stringify({ type: "message", content: "Hello" }));
// ~40 bytes

// Binary (Protocol Buffers, MessagePack)
const buffer = encode({ type: 1, content: "Hello" });
ws.send(buffer, { binary: true });
// ~20 bytes
```

### 2. Message Batching

Reduce frame overhead:

```javascript
const queue = [];
let timeout;

function sendMessage(message) {
  queue.push(message);

  if (!timeout) {
    timeout = setTimeout(() => {
      ws.send(JSON.stringify(queue));
      queue.length = 0;
      timeout = null;
    }, 10); // Batch every 10ms
  }
}
```

### 3. Compression

Enable per-message compression:

```javascript
const wss = new WebSocket.Server({
  port: 3001,
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024,
    },
    threshold: 1024, // Only compress messages > 1KB
  },
});
```

**Trade-off**: CPU cost vs bandwidth savings.

---

## Error Handling & Resilience

### Automatic Reconnection (Client)

```javascript
class ResilientWebSocket {
  constructor(url) {
    this.url = url;
    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 30000;
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("Connected");
      this.reconnectDelay = 1000; // Reset delay
    };

    this.ws.onclose = () => {
      console.log(`Disconnected, reconnecting in ${this.reconnectDelay}ms...`);
      setTimeout(() => this.connect(), this.reconnectDelay);

      // Exponential backoff
      this.reconnectDelay = Math.min(
        this.reconnectDelay * 2,
        this.maxReconnectDelay
      );
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.ws.close();
    };
  }

  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      console.warn("Cannot send, not connected");
    }
  }
}
```

### Graceful Degradation

If WebSocket fails, fallback to polling:

```javascript
class ChatClient {
  constructor() {
    this.useWebSocket = true;
    this.connect();
  }

  connect() {
    if (this.useWebSocket) {
      try {
        this.ws = new WebSocket("ws://localhost:3001");
        this.ws.onerror = () => {
          console.warn("WebSocket failed, falling back to polling");
          this.useWebSocket = false;
          this.startPolling();
        };
      } catch (error) {
        this.useWebSocket = false;
        this.startPolling();
      }
    }
  }

  startPolling() {
    setInterval(async () => {
      const messages = await fetch("/api/messages").then((r) => r.json());
      this.handleMessages(messages);
    }, 2000);
  }
}
```

---

## Common Pitfalls

### 1. Not Handling Backpressure

```javascript
// BAD: Can overwhelm clients
setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(generateLargeData());
  });
}, 10);

// GOOD: Check bufferedAmount
setInterval(() => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.bufferedAmount === 0) {
      client.send(generateLargeData());
    }
  });
}, 10);
```

### 2. Memory Leaks

```javascript
// BAD: Event listeners not cleaned up
wss.on("connection", (ws) => {
  const interval = setInterval(() => {
    ws.ping();
  }, 30000);

  // Memory leak! Interval keeps running after close
});

// GOOD: Clean up on close
wss.on("connection", (ws) => {
  const interval = setInterval(() => {
    ws.ping();
  }, 30000);

  ws.on("close", () => {
    clearInterval(interval);
  });
});
```

### 3. Not Handling Errors

```javascript
// BAD: Unhandled errors crash server
ws.on("message", (data) => {
  const message = JSON.parse(data); // Can throw!
  // Process...
});

// GOOD: Try-catch
ws.on("message", (data) => {
  try {
    const message = JSON.parse(data);
    // Process...
  } catch (error) {
    console.error("Invalid message:", error);
    ws.send(JSON.stringify({ error: "Invalid message format" }));
  }
});
```

---

## Further Reading

- [RFC 6455: The WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)
- [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [ws Library Documentation](https://github.com/websockets/ws)
- [Socket.io Documentation](https://socket.io/docs/v4/)

---

**Key Takeaways**:

1. WebSocket provides low-latency bidirectional communication
2. Handshake upgrades from HTTP to WebSocket protocol
3. Frames are lightweight (2-byte header minimum)
4. Scaling requires sticky sessions or Redis pub/sub
5. Security requires origin validation, authentication, rate limiting
6. Always handle errors and implement reconnection logic

This knowledge will help you build robust real-time applications! 🚀
