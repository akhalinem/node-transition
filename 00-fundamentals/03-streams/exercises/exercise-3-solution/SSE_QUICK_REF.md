# SSE Quick Reference Card

## 🎯 One-Pager Summary

### What is SSE?

Server-Sent Events = **HTTP-based** real-time **one-way** communication (server → client)

### When to Use?

- ✅ Real-time updates (dashboards, notifications, progress)
- ✅ Server needs to push to client
- ✅ Don't need client → server messages
- ✅ Want automatic reconnection

### Basic Server (Node.js)

```javascript
res.writeHead(200, {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
});

res.write("data: Hello World!\n\n");
res.write('data: {"message": "JSON works!"}\n\n');
```

### Basic Client (Browser)

```javascript
const es = new EventSource("/events");
es.onmessage = (event) => {
  console.log(event.data);
};
```

## 📝 Message Format

```
data: message content\n\n
```

That's it! **Two newlines** end the message.

## 🎨 Advanced Features

### Named Events

```javascript
// Server
res.write('event: userJoined\n');
res.write('data: {"name": "Alice"}\n\n');

// Client
es.addEventListener('userJoined', (e) => { ... });
```

### Event IDs (Auto-Resume!)

```javascript
// Server
res.write("id: 123\n");
res.write("data: Message 123\n\n");

// Browser auto-sends Last-Event-ID on reconnect!
```

### Retry Timeout

```javascript
res.write("retry: 5000\n"); // Wait 5s before retry
res.write("data: Message\n\n");
```

### Comments (Keep-Alive)

```javascript
res.write(": heartbeat\n\n"); // Won't trigger event
```

## 🆚 SSE vs WebSockets

| Feature    | SSE                    | WebSocket      |
| ---------- | ---------------------- | -------------- |
| Direction  | One-way                | Two-way        |
| Protocol   | HTTP                   | Custom (ws://) |
| Reconnect  | Auto                   | Manual         |
| Complexity | Simple                 | Complex        |
| Use case   | Updates, notifications | Chat, gaming   |

## ⚡ Quick Patterns

### Broadcast to All Clients

```javascript
const clients = new Set();

// Add client
clients.add(res);

// Broadcast
clients.forEach((c) => {
  c.write("data: Hello all!\n\n");
});

// Remove on disconnect
req.on("close", () => clients.delete(res));
```

### Progress Updates

```javascript
stream.on("data", (chunk) => {
  const percent = (uploaded / total) * 100;
  res.write(`data: {"percent": ${percent}}\n\n`);
});
```

### Error Handling

```javascript
// Client
es.onerror = () => {
  if (es.readyState === EventSource.CLOSED) {
    console.log("Closed permanently");
  } else {
    console.log("Error, will retry");
  }
};
```

## 🎓 Key Points

1. **Format**: `data: content\n\n` (double newline!)
2. **Headers**: `Content-Type: text/event-stream`
3. **Connection**: Keep alive, don't close
4. **Auto-reconnect**: Built into browser EventSource
5. **Event IDs**: Enable resume from last event
6. **Comments**: Use `:` for keep-alive

## 🚀 Try It Now

```bash
# Run demo server
node sse-demo.js

# Open browser
open http://localhost:3001
```

---

**Remember**: SSE is perfect when you need **simple, reliable, one-way push updates**! 🎯
