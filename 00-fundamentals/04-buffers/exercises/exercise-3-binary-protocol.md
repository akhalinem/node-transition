# Exercise 3: Binary Protocol Client/Server

**Difficulty**: ⭐⭐⭐⭐  
**Time**: 60-90 minutes

## Goal

Build a client and server that communicate using a custom binary protocol over TCP. This simulates real-world protocols like Redis, MySQL, or game servers.

## Protocol Specification

### Message Format

```
┌────────┬──────┬─────────┬────────────┬──────────┐
│ Magic  │ Len  │ Type    │ Request ID │ Payload  │
│ 2 bytes│ 4 b  │ 1 byte  │ 4 bytes    │ Variable │
└────────┴──────┴─────────┴────────────┴──────────┘

Magic: 0xBEEF (identifies protocol)
Length: Total message length including header (big-endian)
Type: Message type (1 byte)
Request ID: For matching responses (big-endian)
Payload: Message-specific data
```

### Message Types

```
0x01 - PING (keep-alive)
0x02 - PONG (ping response)
0x03 - GET (retrieve value)
0x04 - SET (store value)
0x05 - DELETE (remove value)
0x06 - RESPONSE (operation result)
0x07 - ERROR (error message)
```

### Payload Formats

**SET Message**:

```
┌──────────┬───────────┬───────┐
│ Key Len  │ Key       │ Value │
│ 2 bytes  │ Variable  │ Rest  │
└──────────┴───────────┴───────┘
```

**GET Message**:

```
┌──────────┬───────────┐
│ Key Len  │ Key       │
│ 2 bytes  │ Variable  │
└──────────┴───────────┘
```

**RESPONSE Message**:

```
┌──────────┬───────────┐
│ Status   │ Data      │
│ 1 byte   │ Variable  │
└──────────┴───────────┘

Status: 0=Success, 1=Not Found, 2=Error
```

## Tasks

### Part 1: Message Builder

```javascript
// TODO: Implement message building functions

const MAGIC = 0xbeef;
const MSG_TYPES = {
  PING: 0x01,
  PONG: 0x02,
  GET: 0x03,
  SET: 0x04,
  DELETE: 0x05,
  RESPONSE: 0x06,
  ERROR: 0x07,
};

function buildMessage(type, requestId, payload) {
  // Calculate total length
  // Create header buffer (11 bytes)
  // Write magic number (2 bytes, big-endian)
  // Write length (4 bytes, big-endian)
  // Write type (1 byte)
  // Write request ID (4 bytes, big-endian)
  // Concatenate with payload
  // Return complete message buffer
}

function buildSetMessage(requestId, key, value) {
  // Create payload:
  //   - Key length (2 bytes, big-endian)
  //   - Key (bytes)
  //   - Value (bytes)
  // Return buildMessage(SET, requestId, payload)
}

function buildGetMessage(requestId, key) {
  // Create payload:
  //   - Key length (2 bytes, big-endian)
  //   - Key (bytes)
  // Return buildMessage(GET, requestId, payload)
}
```

### Part 2: Message Parser

```javascript
// TODO: Implement message parsing

function parseMessage(buffer) {
  // Validate minimum length (11 bytes)
  // Read magic number
  // Validate magic number
  // Read length
  // Read type
  // Read request ID
  // Extract payload
  // Return { type, requestId, payload }
}

function parseSetMessage(payload) {
  // Read key length (2 bytes)
  // Extract key
  // Extract value (rest of payload)
  // Return { key, value }
}

function parseGetMessage(payload) {
  // Read key length
  // Extract key
  // Return { key }
}
```

### Part 3: Protocol Server

```javascript
const net = require("net");

// TODO: Implement protocol server

class ProtocolServer {
  constructor(port) {
    this.port = port;
    this.store = new Map(); // In-memory key-value store
    this.server = null;
  }

  start() {
    // Create TCP server
    // Handle connections
    // Parse incoming messages
    // Process commands (GET, SET, DELETE, PING)
    // Send responses
  }

  handleConnection(socket) {
    // Setup data buffer for incomplete messages
    // Handle 'data' events
    // Parse complete messages
    // Route to appropriate handler
  }

  handleGet(socket, requestId, key) {
    // Look up key in store
    // Build RESPONSE message
    // Send to client
  }

  handleSet(socket, requestId, key, value) {
    // Store key-value
    // Build RESPONSE message
    // Send to client
  }

  handlePing(socket, requestId) {
    // Send PONG response
  }
}
```

### Part 4: Protocol Client

```javascript
// TODO: Implement protocol client

class ProtocolClient {
  constructor(host, port) {
    this.host = host;
    this.port = port;
    this.socket = null;
    this.requestId = 0;
    this.pendingRequests = new Map();
  }

  connect() {
    // Create TCP connection
    // Setup data handler
    // Return promise
  }

  send(type, payload) {
    // Generate request ID
    // Build message
    // Send over socket
    // Return promise that resolves when response received
  }

  async get(key) {
    // Build GET message
    // Send and wait for response
    // Return value or null
  }

  async set(key, value) {
    // Build SET message
    // Send and wait for response
    // Return success boolean
  }

  async ping() {
    // Send PING
    // Wait for PONG
    // Return latency
  }
}
```

### Part 5: Message Framing

```javascript
// TODO: Handle message framing

class MessageFramer {
  constructor() {
    this.buffer = Buffer.alloc(0);
  }

  addData(chunk) {
    // Append chunk to buffer
    // Return array of complete messages
  }

  extractMessages() {
    const messages = [];

    while (this.buffer.length >= 6) {
      // Read magic number
      // Validate magic
      // Read length
      // Check if complete message available
      // If yes: extract and add to messages
      // If no: break
    }

    return messages;
  }
}
```

### Part 6: Testing Suite

```javascript
// TODO: Implement tests

async function runTests() {
  const server = new ProtocolServer(5000);
  server.start();

  const client = new ProtocolClient("localhost", 5000);
  await client.connect();

  console.log("Testing PING...");
  const latency = await client.ping();
  console.log(`✅ PING/PONG: ${latency}ms`);

  console.log("Testing SET...");
  await client.set("name", "Alice");
  console.log("✅ SET successful");

  console.log("Testing GET...");
  const value = await client.get("name");
  console.log(`✅ GET: ${value}`);

  console.log("Testing GET (not found)...");
  const missing = await client.get("nonexistent");
  console.log(`✅ GET (missing): ${missing}`);

  // More tests...
}
```

## Expected Output

### Server:

```
🚀 Protocol server listening on port 5000

Client connected: 127.0.0.1:54321
  ← PING (ID: 1)
  → PONG (ID: 1)

  ← SET (ID: 2): name = Alice
  → RESPONSE (ID: 2): Success

  ← GET (ID: 3): name
  → RESPONSE (ID: 3): Alice

  ← GET (ID: 4): nonexistent
  → RESPONSE (ID: 4): Not Found

Client disconnected
```

### Client:

```
Connected to server

PING test...
  Latency: 2ms ✅

SET test...
  SET name=Alice: Success ✅

GET test...
  GET name: Alice ✅

GET (not found) test...
  GET missing: null ✅

All tests passed! 🎉
```

## Bonus Challenges

1. **Authentication**: Add AUTH message type
2. **Compression**: Compress large payloads
3. **Encryption**: Add TLS/SSL
4. **Pub/Sub**: Implement SUBSCRIBE/PUBLISH
5. **Persistence**: Save store to disk
6. **Clustering**: Multiple servers with replication
7. **TTL**: Add expiration to keys
8. **Transactions**: Multi-command transactions
9. **Pipelining**: Send multiple requests without waiting
10. **Binary Values**: Support binary data, not just strings

## Protocol Extensions

### TTL Support:

```
SET with TTL payload:
┌──────────┬───────────┬─────────┬───────┐
│ Key Len  │ Key       │ TTL (s) │ Value │
│ 2 bytes  │ Variable  │ 4 bytes │ Rest  │
└──────────┴───────────┴─────────┴───────┘
```

### Batch Operations:

```
MGET (multi-get) payload:
┌───────────┬──────────┬───────────┬─────┐
│ Num Keys  │ Key1 Len │ Key1      │ ... │
│ 2 bytes   │ 2 bytes  │ Variable  │     │
└───────────┴──────────┴───────────┴─────┘
```

## Testing

```bash
# Terminal 1: Start server
node server.js

# Terminal 2: Run client
node client.js

# Terminal 3: Monitor traffic
tcpdump -i lo -X port 5000
```

## Performance Test

```javascript
// Benchmark throughput
async function benchmark() {
  const client = new ProtocolClient("localhost", 5000);
  await client.connect();

  const start = Date.now();
  const operations = 10000;

  for (let i = 0; i < operations; i++) {
    await client.set(`key${i}`, `value${i}`);
  }

  const elapsed = Date.now() - start;
  const opsPerSec = (operations / elapsed) * 1000;

  console.log(`${opsPerSec.toFixed(0)} operations/second`);
}
```

## Hints

1. TCP streams are byte streams - handle partial messages
2. Use a buffer to accumulate incomplete messages
3. Always check magic number before parsing
4. Big-endian for network protocols
5. Handle socket errors and disconnections
6. Use promises for async request/response
7. Keep request ID unique per client

## Common Mistakes

- ❌ Not handling partial messages (TCP streams!)
- ❌ Assuming one message per 'data' event
- ❌ Not validating magic number
- ❌ Wrong endianness
- ❌ Not cleaning up pending requests on disconnect
- ❌ Blocking operations in handler
- ❌ Not handling backpressure

## Success Criteria

- ✅ Messages encode/decode correctly
- ✅ Client and server communicate
- ✅ Handles all message types
- ✅ Proper message framing
- ✅ Request/response matching works
- ✅ Handles errors gracefully
- ✅ Multiple clients supported

## Real-World Protocols

This exercise simulates real protocols:

- **Redis**: RESP protocol
- **MySQL**: Binary protocol
- **gRPC**: Protocol Buffers
- **Game servers**: Custom binary protocols
- **IoT devices**: MQTT, CoAP

Good luck! 🚀
