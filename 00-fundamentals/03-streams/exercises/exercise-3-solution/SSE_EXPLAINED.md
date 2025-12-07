# Server-Sent Events (SSE) - Complete Guide

## 🌟 What Are Server-Sent Events?

**Server-Sent Events (SSE)** is a standard that allows servers to **push real-time updates to clients** over a single HTTP connection. It's part of the HTML5 specification and is surprisingly simple yet powerful.

### The Elevator Pitch

> "SSE lets your server continuously send data to the browser over a regular HTTP connection, without the browser having to ask for it repeatedly."

Think of it like a **one-way radio broadcast** - the server talks, the client listens.

---

## 🤔 Why Haven't You Heard About It?

Good question! SSE is often overshadowed by **WebSockets**, but here's why it deserves attention:

### WebSockets vs SSE

| Feature               | WebSockets                   | Server-Sent Events                |
| --------------------- | ---------------------------- | --------------------------------- |
| **Direction**         | Bi-directional (full-duplex) | Uni-directional (server → client) |
| **Protocol**          | Custom (ws://)               | Standard HTTP                     |
| **Complexity**        | Higher                       | Much simpler                      |
| **Reconnection**      | Manual                       | **Automatic** ✨                  |
| **Browser Support**   | Good                         | Excellent (except IE)             |
| **HTTP/2 Support**    | N/A                          | Yes (multiplexing!)               |
| **Firewalls/Proxies** | Often blocked                | Works everywhere HTTP works       |
| **Event IDs**         | No                           | **Yes** (built-in resume!)        |
| **Text Data**         | Binary + Text                | Text only                         |

### When to Use What?

**Use SSE when:**

- ✅ Server needs to push updates to client
- ✅ Client doesn't need to send much data back
- ✅ You want simplicity
- ✅ You need automatic reconnection
- ✅ Working with existing HTTP infrastructure

**Use WebSockets when:**

- ✅ Bi-directional communication needed
- ✅ Real-time chat, gaming, collaboration
- ✅ Binary data transfer
- ✅ Low-latency critical

**Use polling when:**

- ✅ You hate yourself 😅

---

## 📡 How SSE Works

### The Protocol (It's Beautifully Simple!)

SSE uses a special HTTP response format:

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: Hello, this is a message!\n\n

data: Another message\n\n

data: {"type": "progress", "percent": 50}\n\n
```

That's it! Each message:

- Starts with `data: `
- Ends with **two newlines** (`\n\n`)
- Can be JSON or plain text

### Complete Example Flow

```
┌─────────────┐                      ┌─────────────┐
│   Browser   │                      │   Server    │
└──────┬──────┘                      └──────┬──────┘
       │                                    │
       │  GET /events HTTP/1.1              │
       │  Accept: text/event-stream         │
       ├───────────────────────────────────>│
       │                                    │
       │  HTTP/1.1 200 OK                   │
       │  Content-Type: text/event-stream   │
       │  Connection: keep-alive            │
       │<───────────────────────────────────┤
       │                                    │
       │  data: {"message": "Connected"}\n\n│
       │<───────────────────────────────────┤
       │                                    │
       │  data: {"progress": 25}\n\n        │
       │<───────────────────────────────────┤
       │                                    │
       │  data: {"progress": 50}\n\n        │
       │<───────────────────────────────────┤
       │                                    │
       │  data: {"progress": 100}\n\n       │
       │<───────────────────────────────────┤
       │                                    │
       │  Connection stays open...          │
       │                                    │
```

---

## 💻 Code Examples

### Server Side (Node.js)

```javascript
import http from "http";

const server = http.createServer((req, res) => {
  if (req.url === "/events") {
    // Set SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*", // For CORS if needed
    });

    // Send initial message
    res.write("data: Connected to SSE stream\n\n");

    // Send updates every second
    let count = 0;
    const interval = setInterval(() => {
      count++;

      const data = {
        type: "update",
        count: count,
        timestamp: new Date().toISOString(),
      };

      // Send as SSE message
      res.write(`data: ${JSON.stringify(data)}\n\n`);

      if (count >= 10) {
        clearInterval(interval);
        res.end();
      }
    }, 1000);

    // Clean up on disconnect
    req.on("close", () => {
      clearInterval(interval);
      console.log("Client disconnected");
    });
  }
});

server.listen(3000);
```

### Client Side (Browser)

```javascript
// Create EventSource (built into browsers!)
const eventSource = new EventSource("http://localhost:3000/events");

// Listen for messages
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);

  // Update UI
  document.getElementById("count").textContent = data.count;
};

// Handle connection open
eventSource.onopen = () => {
  console.log("✅ Connected to SSE");
};

// Handle errors
eventSource.onerror = (error) => {
  console.error("❌ SSE Error:", error);

  // EventSource automatically reconnects!
  // You just need to handle the error state in UI
};

// Close when done
// eventSource.close();
```

### Client Side (Node.js - What We Did!)

```javascript
const req = http.request(options, (res) => {
  let buffer = "";

  res.on("data", (chunk) => {
    buffer += chunk.toString();

    // Split on double newlines
    const lines = buffer.split("\n");
    buffer = lines.pop(); // Keep incomplete line

    lines.forEach((line) => {
      if (line.startsWith("data: ")) {
        // Remove 'data: ' prefix
        const jsonData = line.substring(6);
        const data = JSON.parse(jsonData);

        // Handle different event types
        if (data.type === "progress") {
          updateProgress(data.percent);
        } else if (data.type === "complete") {
          showSuccess(data);
        }
      }
    });
  });
});
```

---

## 🎯 Advanced SSE Features

### 1. Event Types (Named Events)

You can send different event types:

**Server:**

```javascript
// Default event
res.write("data: This is a default message\n\n");

// Named event
res.write("event: userJoined\n");
res.write('data: {"name": "Alice"}\n\n');

res.write("event: userLeft\n");
res.write('data: {"name": "Bob"}\n\n');
```

**Client:**

```javascript
const es = new EventSource("/events");

// Listen to specific events
es.addEventListener("userJoined", (event) => {
  const user = JSON.parse(event.data);
  console.log(`${user.name} joined!`);
});

es.addEventListener("userLeft", (event) => {
  const user = JSON.parse(event.data);
  console.log(`${user.name} left!`);
});
```

### 2. Event IDs (Automatic Resume!)

This is **super powerful** - SSE can automatically resume from where it left off:

**Server:**

```javascript
let eventId = 0;

res.write(`id: ${eventId}\n`);
res.write(`data: Message ${eventId}\n\n`);
eventId++;

res.write(`id: ${eventId}\n`);
res.write(`data: Message ${eventId}\n\n`);
eventId++;
```

**Client:**

```javascript
const es = new EventSource("/events");

// Browser automatically sends Last-Event-ID header on reconnect!
// Server can resume from that ID
```

**Server Handling Resume:**

```javascript
const server = http.createServer((req, res) => {
  const lastEventId = req.headers["last-event-id"];

  if (lastEventId) {
    console.log(`Resuming from event ${lastEventId}`);
    // Send only events after lastEventId
  } else {
    // Send all events
  }
});
```

### 3. Retry Timeout

Tell the browser how long to wait before reconnecting:

```javascript
res.write("retry: 5000\n"); // Wait 5 seconds before reconnect
res.write("data: Connection will retry in 5s if lost\n\n");
```

### 4. Multi-line Messages

```javascript
res.write("data: Line 1\n");
res.write("data: Line 2\n");
res.write("data: Line 3\n\n");

// Client receives: "Line 1\nLine 2\nLine 3"
```

### 5. Comments (Keep-Alive)

```javascript
// Send comment to keep connection alive
// (doesn't trigger events on client)
setInterval(() => {
  res.write(": keep-alive\n\n");
}, 15000); // Every 15 seconds
```

---

## 🔥 Real-World Use Cases

### 1. Live Sports Scores

```javascript
// Server
const scoreUpdates = setInterval(() => {
  const score = getLatestScore();
  res.write(`data: ${JSON.stringify(score)}\n\n`);
}, 5000);
```

### 2. Stock Tickers

```javascript
// Server pushes stock prices
res.write(`event: stockUpdate\n`);
res.write(`data: {"symbol": "AAPL", "price": 175.43}\n\n`);
```

### 3. Live Notifications

```javascript
// Server
userNotifications.on("new", (notification) => {
  res.write(`event: notification\n`);
  res.write(`data: ${JSON.stringify(notification)}\n\n`);
});
```

### 4. **File Upload Progress** (What We Built! 🎉)

```javascript
// Server tracks upload and sends progress
const progressTransform = new ProgressTransform(fileSize, (data) => {
  res.write(
    `data: ${JSON.stringify({
      type: "progress",
      percent: data.percent,
      speed: data.speed,
    })}\n\n`
  );
});
```

### 5. Live Logs/Monitoring

```javascript
// Server
tail.on("line", (line) => {
  res.write(`data: ${line}\n\n`);
});
```

### 6. Live Dashboards

```javascript
// Server sends metrics every second
setInterval(() => {
  const metrics = {
    cpu: getCPU(),
    memory: getMemory(),
    requests: getRequestCount(),
  };
  res.write(`data: ${JSON.stringify(metrics)}\n\n`);
}, 1000);
```

---

## 🎨 Complete Working Example

### File Upload with SSE Progress

**Server:**

```javascript
import http from "http";
import fs from "fs";

http
  .createServer((req, res) => {
    if (req.url === "/upload") {
      // SSE Headers
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      const totalSize = parseInt(req.headers["content-length"]);
      let uploaded = 0;
      const start = Date.now();

      // Write to file and track progress
      const fileStream = fs.createWriteStream("upload.bin");

      req.on("data", (chunk) => {
        uploaded += chunk.length;
        fileStream.write(chunk);

        const percent = ((uploaded / totalSize) * 100).toFixed(1);
        const elapsed = (Date.now() - start) / 1000;
        const speed = uploaded / elapsed;
        const remaining = (totalSize - uploaded) / speed;

        // Send SSE update
        res.write(
          `data: ${JSON.stringify({
            type: "progress",
            percent: parseFloat(percent),
            uploaded,
            total: totalSize,
            speed: (speed / 1024 / 1024).toFixed(2) + " MB/s",
            eta: Math.ceil(remaining) + "s",
          })}\n\n`
        );
      });

      req.on("end", () => {
        fileStream.end();
        res.write(
          `data: ${JSON.stringify({
            type: "complete",
            totalSize,
            duration: ((Date.now() - start) / 1000).toFixed(1) + "s",
          })}\n\n`
        );
        res.end();
      });
    }
  })
  .listen(3000);
```

**Client (HTML):**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>SSE Upload</title>
  </head>
  <body>
    <input type="file" id="fileInput" />
    <button onclick="upload()">Upload</button>

    <div id="progress">
      <div
        id="progressBar"
        style="width: 0%; background: green; height: 20px;"
      ></div>
      <div id="stats"></div>
    </div>

    <script>
      function upload() {
        const file = document.getElementById("fileInput").files[0];

        // Start SSE connection
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/upload");
        xhr.setRequestHeader("Content-Length", file.size);

        // Listen for SSE events from response
        let buffer = "";
        xhr.onprogress = () => {
          buffer += xhr.responseText.substring(buffer.length);

          const lines = buffer.split("\n");
          lines.forEach((line) => {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.substring(6));

              if (data.type === "progress") {
                document.getElementById("progressBar").style.width =
                  data.percent + "%";
                document.getElementById(
                  "stats"
                ).innerHTML = `${data.percent}% | ${data.speed} | ETA: ${data.eta}`;
              } else if (data.type === "complete") {
                alert("Upload complete in " + data.duration);
              }
            }
          });
        };

        xhr.send(file);
      }
    </script>
  </body>
</html>
```

---

## 🛡️ SSE vs Polling

Let's see why SSE is **massively better** than polling:

### Traditional Polling (Old Way)

```javascript
// Client keeps asking "any updates?"
setInterval(() => {
  fetch("/api/check-updates")
    .then((res) => res.json())
    .then((data) => {
      if (data.hasUpdate) {
        updateUI(data);
      }
    });
}, 1000); // Every second!
```

**Problems:**

- ❌ Wasteful - 1000 requests/second even if nothing changed
- ❌ Latency - Up to 1 second delay
- ❌ Server load - Handling thousands of requests
- ❌ Battery drain on mobile
- ❌ Bandwidth waste

### SSE (Modern Way)

```javascript
// Client listens, server pushes when ready
const es = new EventSource("/events");
es.onmessage = (event) => {
  updateUI(JSON.parse(event.data));
};
```

**Benefits:**

- ✅ Efficient - One connection, updates pushed instantly
- ✅ No latency - Immediate updates
- ✅ Low server load - One connection per client
- ✅ Battery friendly
- ✅ Bandwidth efficient

---

## 📊 Browser Support

| Browser         | Support |
| --------------- | ------- |
| Chrome          | ✅ Yes  |
| Firefox         | ✅ Yes  |
| Safari          | ✅ Yes  |
| Edge            | ✅ Yes  |
| IE 11           | ❌ No   |
| Mobile browsers | ✅ Yes  |

**Polyfill for IE:**

```html
<script src="https://cdn.jsdelivr.net/npm/event-source-polyfill@1.0.25/src/eventsource.min.js"></script>
```

---

## 🔒 Security Considerations

### 1. CORS

```javascript
res.writeHead(200, {
  "Content-Type": "text/event-stream",
  "Access-Control-Allow-Origin": "https://yourdomain.com",
  "Access-Control-Allow-Credentials": "true",
});
```

### 2. Authentication

```javascript
// Option 1: Query parameter (not recommended for sensitive data)
const es = new EventSource("/events?token=abc123");

// Option 2: Use credentials (cookies)
const es = new EventSource("/events", { withCredentials: true });

// Server verifies
const token = url.parse(req.url, true).query.token;
if (!isValidToken(token)) {
  res.writeHead(401);
  res.end();
}
```

### 3. Rate Limiting

```javascript
const clients = new Map();

// Limit connections per IP
if (clients.get(ip) > MAX_CONNECTIONS) {
  res.writeHead(429, { "Content-Type": "text/plain" });
  res.end("Too many connections");
  return;
}
```

---

## 💡 Pro Tips

### 1. Connection Management

```javascript
const clients = new Set();

// Add client
clients.add(res);

// Remove on disconnect
req.on("close", () => {
  clients.delete(res);
});

// Broadcast to all clients
function broadcast(message) {
  clients.forEach((client) => {
    client.write(`data: ${JSON.stringify(message)}\n\n`);
  });
}
```

### 2. Heartbeat (Keep-Alive)

```javascript
// Prevent proxies from timing out
const heartbeat = setInterval(() => {
  res.write(": heartbeat\n\n");
}, 30000); // Every 30 seconds

req.on("close", () => {
  clearInterval(heartbeat);
});
```

### 3. Error Handling

```javascript
// Client
const es = new EventSource("/events");

es.onerror = (error) => {
  if (es.readyState === EventSource.CLOSED) {
    console.log("Connection closed permanently");
  } else {
    console.log("Connection error, will retry...");
  }
};
```

### 4. Graceful Shutdown

```javascript
// Server
process.on("SIGTERM", () => {
  clients.forEach((client) => {
    client.write('data: {"type": "shutdown"}\n\n');
    client.end();
  });
});
```

---

## 🎓 Key Takeaways

1. **SSE is perfect for server → client updates** (dashboards, notifications, progress)
2. **Much simpler than WebSockets** for one-way communication
3. **Automatic reconnection** is built-in (huge win!)
4. **Works with standard HTTP** (proxies, load balancers, CDNs)
5. **Event IDs enable resume** from last received event
6. **HTTP/2 makes SSE even better** (multiplexing!)

---

## 🚀 When to Use SSE (Checklist)

Use SSE if you answer **YES** to these:

- ✅ Do you need to push updates from server to client?
- ✅ Is one-way communication sufficient?
- ✅ Do you want automatic reconnection?
- ✅ Do you want to use standard HTTP infrastructure?
- ✅ Is text data sufficient (JSON, HTML, etc.)?

Don't use SSE if:

- ❌ You need bi-directional real-time communication (use WebSockets)
- ❌ You need binary data (use WebSockets)
- ❌ You need ultra-low latency (<10ms) (use WebSockets)

---

## 📚 Further Reading

- [MDN - Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [HTML5 SSE Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [Can I Use - SSE Browser Support](https://caniuse.com/eventsource)

---

**Bottom Line**: SSE is an underrated technology that's **perfect for real-time updates** when you don't need bi-directional communication. It's simpler, more reliable, and works better with existing infrastructure than WebSockets for many use cases!

In our upload example, SSE was the **perfect choice** because:

- ✅ Server needs to push progress updates
- ✅ Client doesn't need to send data back (except the file itself, which is HTTP POST)
- ✅ Automatic reconnection on network issues
- ✅ Works with any HTTP client (browsers, Node.js, curl, etc.)

Pretty cool, right? 🚀
