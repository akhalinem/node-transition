# Process & Global Objects - Cheat Sheet

Quick reference for Node.js process management and global objects.

---

## Process Object

### Basic Info

```javascript
process.pid; // Process ID
process.ppid; // Parent process ID
process.platform; // 'darwin', 'linux', 'win32'
process.arch; // 'x64', 'arm', etc.
process.version; // Node.js version
process.cwd(); // Current working directory
process.uptime(); // Process uptime in seconds
```

### Arguments & Environment

```javascript
// Command line arguments
process.argv; // ['node', 'script.js', ...args]
process.argv[0]; // Path to node
process.argv[1]; // Path to script
process.argv.slice(2); // Your arguments

// Environment variables
process.env.NODE_ENV;
process.env.PORT;
const port = process.env.PORT || 3000; // With default
```

### Memory & CPU

```javascript
// Memory usage
const mem = process.memoryUsage();
mem.rss; // Resident set size
mem.heapTotal; // Total heap size
mem.heapUsed; // Used heap
mem.external; // C++ objects
mem.arrayBuffers; // ArrayBuffers

// CPU usage
const cpu = process.cpuUsage();
cpu.user; // Microseconds in user mode
cpu.system; // Microseconds in system mode
```

### Exit Codes

```javascript
process.exit(0); // Success
process.exit(1); // General error
process.exitCode = 1; // Set exit code without exiting

// Exit codes:
// 0   = Success
// 1   = Uncaught fatal exception
// 3   = Internal JavaScript parse error
// 9   = Invalid argument
// 130 = Terminated by Ctrl+C
```

---

## Environment Variables

### Reading

```javascript
// Basic
process.env.API_KEY;

// With default
const port = process.env.PORT || 3000;

// Type conversion
const port = parseInt(process.env.PORT || "3000", 10);
const debug = process.env.DEBUG === "true";
const hosts = (process.env.ALLOWED_HOSTS || "").split(",");

// Required
function requireEnv(name) {
  if (!process.env[name]) {
    throw new Error(`Missing: ${name}`);
  }
  return process.env[name];
}
```

### Setting

```javascript
// In code (current process only)
process.env.MY_VAR = 'value';

// Command line
NODE_ENV=production PORT=8080 node app.js

// .env file (with dotenv package)
require('dotenv').config();
```

### Best Practices

```javascript
// ✅ Good
const apiKey = process.env.API_KEY || "development-key";
const port = parseInt(process.env.PORT || "3000", 10);

// ❌ Bad
const apiKey = "sk_live_1234..."; // Hardcoded secret
const port = 3000; // Hardcoded config
```

---

## Process Signals

### Common Signals

```javascript
SIGINT; // Ctrl+C (interrupt)
SIGTERM; // Termination (graceful)
SIGHUP; // Terminal closed
SIGUSR1; // User-defined 1
SIGUSR2; // User-defined 2
SIGKILL; // Cannot be caught!
```

### Handling Signals

```javascript
// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received");
  await cleanup();
  process.exit(0);
});

// Ctrl+C
process.on("SIGINT", () => {
  console.log("SIGINT received");
  process.exit(0);
});

// Custom debug signal
process.on("SIGUSR1", () => {
  console.log("Status:", {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});
```

### Sending Signals

```bash
# Graceful shutdown
kill -TERM <PID>
kill <PID>           # TERM is default

# Interrupt
kill -INT <PID>

# Custom
kill -USR1 <PID>
kill -USR2 <PID>

# Force kill (cannot be caught!)
kill -9 <PID>
kill -KILL <PID>
```

---

## Graceful Shutdown

### Basic Pattern

```javascript
async function gracefulShutdown(signal) {
  console.log(`${signal} received`);

  // 1. Stop accepting new requests
  server.close();

  // 2. Wait for active requests
  await waitForRequests();

  // 3. Close database
  await db.close();

  // 4. Close other resources
  await redis.quit();

  // 5. Exit
  process.exit(0);
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
```

### With Timeout

```javascript
async function gracefulShutdown(signal) {
  console.log(`${signal} received`);

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error("Forced exit!");
    process.exit(1);
  }, 10000).unref();

  try {
    await cleanup();
    process.exit(0);
  } catch (error) {
    console.error("Shutdown error:", error);
    process.exit(1);
  }
}
```

### HTTP Server Shutdown

```javascript
const server = http.createServer(handler);

async function shutdown() {
  // Stop accepting new connections
  server.close((err) => {
    if (err) console.error(err);
  });

  // Wait for active connections
  await new Promise((resolve) => {
    server.on("close", resolve);
  });
}
```

---

## Global Objects

### Console

```javascript
console.log("message"); // General output
console.error("error"); // Error (stderr)
console.warn("warning"); // Warning
console.info("info"); // Info

console.table(array); // Table format
console.time("label"); // Start timer
console.timeEnd("label"); // End timer
console.count("label"); // Count calls
console.trace("trace"); // Stack trace

console.assert(condition, "msg"); // Assert
```

### Timers

```javascript
// setTimeout - Execute after delay
const timeout = setTimeout(() => {
  console.log("Delayed");
}, 1000);
clearTimeout(timeout);

// setInterval - Execute repeatedly
const interval = setInterval(() => {
  console.log("Tick");
}, 1000);
clearInterval(interval);

// setImmediate - Next event loop tick
setImmediate(() => {
  console.log("Immediate");
});

// process.nextTick - Before next phase
process.nextTick(() => {
  console.log("Next tick");
});

// Order: nextTick → setImmediate → setTimeout(0)
```

### Buffer

```javascript
// Create
const buf = Buffer.from("Hello");
const buf = Buffer.alloc(10); // Filled with 0
const buf = Buffer.allocUnsafe(10); // Faster, old data

// Convert
buf.toString(); // To string
buf.toString("hex"); // To hex
buf.toString("base64"); // To base64

// Read/Write
buf[0]; // Read byte
buf[0] = 65; // Write byte
```

### URL

```javascript
const url = new URL("https://example.com:8080/path?foo=bar#hash");

url.protocol; // 'https:'
url.hostname; // 'example.com'
url.port; // '8080'
url.pathname; // '/path'
url.search; // '?foo=bar'
url.hash; // '#hash'

// Query params
const params = new URLSearchParams(url.search);
params.get("foo"); // 'bar'
params.set("baz", "qux");
params.toString(); // 'foo=bar&baz=qux'
```

### Crypto

```javascript
// Random values
const array = new Uint32Array(10);
crypto.getRandomValues(array);

// UUID
const uuid = crypto.randomUUID();
// '123e4567-e89b-12d3-a456-426614174000'
```

### Performance

```javascript
// High-resolution time
const start = performance.now();
// ... do work ...
const end = performance.now();
console.log(`Took ${end - start}ms`);

// Marks and measures
performance.mark("start");
// ... do work ...
performance.mark("end");
performance.measure("work", "start", "end");
```

### Fetch (Node.js 18+)

```javascript
// HTTP requests
const response = await fetch("https://api.example.com/data");
const data = await response.json();

// With options
const response = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ key: "value" }),
});
```

---

## Module-Scoped "Globals"

### Not Actually Global

```javascript
__dirname; // Current directory
__filename; // Current file path
require(); // Module loader
module; // Current module
exports; // Module exports

// These look global but are actually
// injected into each module!
```

### ES Modules Alternative

```javascript
// In ES modules, use:
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

---

## Error Handling

### Uncaught Exceptions

```javascript
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  // Log, alert, then exit
  process.exit(1);
});
```

### Unhandled Rejections

```javascript
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection:", reason);
  // Log, alert, potentially exit
});
```

### Exit Events

```javascript
process.on("exit", (code) => {
  // Synchronous only!
  console.log(`Exiting with code: ${code}`);
});

process.on("beforeExit", async (code) => {
  // Can perform async operations
  await cleanup();
});
```

---

## Configuration Pattern

```javascript
class Config {
  get database() {
    return {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432", 10),
      password: this.required("DB_PASSWORD"),
    };
  }

  required(name) {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Missing: ${name}`);
    }
    return value;
  }

  validate() {
    // Check all required values at startup
    if (process.env.NODE_ENV === "production") {
      this.required("DB_PASSWORD");
      this.required("API_KEY");
    }
  }
}
```

---

## Health Check Pattern

```javascript
async function healthCheck() {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkMemory(),
  ]);

  const healthy = checks.every((r) => r.status === "fulfilled");

  return {
    status: healthy ? "healthy" : "unhealthy",
    uptime: process.uptime(),
    checks: checks.map((r) => ({
      status: r.status,
      details: r.value || r.reason,
    })),
  };
}
```

---

## Common Patterns

### Validate Config at Startup

```javascript
function validateConfig() {
  const required = ["DB_HOST", "DB_PASSWORD", "API_KEY"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("Missing required env vars:", missing);
    process.exit(1);
  }
}

validateConfig();
```

### Monitor Memory

```javascript
setInterval(() => {
  const mem = process.memoryUsage();
  const heapPercent = (mem.heapUsed / mem.heapTotal) * 100;

  if (heapPercent > 90) {
    console.warn(`High memory: ${heapPercent}%`);
  }
}, 30000);
```

### Feature Flags

```javascript
const features = {
  newUI: process.env.FEATURE_NEW_UI === "true",
  betaAPI: process.env.FEATURE_BETA_API === "true",
};

if (features.newUI) {
  // Use new UI
}
```

---

## Testing Signals

```bash
# Start your app
node app.js

# In another terminal:
# Get PID
ps aux | grep node

# Send signals
kill -TERM <PID>    # Graceful shutdown
kill -INT <PID>     # Interrupt
kill -USR1 <PID>    # Custom signal 1
kill -USR2 <PID>    # Custom signal 2

# Force kill (last resort!)
kill -9 <PID>
```

---

## Docker/Kubernetes

### Dockerfile

```dockerfile
# Use signals properly
CMD ["node", "app.js"]

# NOT:
# CMD ["npm", "start"]  # npm doesn't forward signals!
```

### Kubernetes

```yaml
# Readiness probe (health check)
readinessProbe:
  httpGet:
    path: /health
    port: 3000

# Liveness probe
livenessProbe:
  httpGet:
    path: /health
    port: 3000

# Graceful shutdown
terminationGracePeriodSeconds: 30
```

---

## Quick Reference

| Task              | Code                             |
| ----------------- | -------------------------------- |
| Get env var       | `process.env.VAR`                |
| Exit successfully | `process.exit(0)`                |
| Exit with error   | `process.exit(1)`                |
| Handle Ctrl+C     | `process.on('SIGINT', handler)`  |
| Graceful shutdown | `process.on('SIGTERM', handler)` |
| Custom signal     | `process.on('SIGUSR1', handler)` |
| Memory usage      | `process.memoryUsage()`          |
| CPU usage         | `process.cpuUsage()`             |
| Uptime            | `process.uptime()`               |
| Current dir       | `process.cwd()`                  |
| High-res time     | `performance.now()`              |
| Random UUID       | `crypto.randomUUID()`            |

---

## Common Mistakes

### ❌ Don't

```javascript
// Don't hardcode secrets
const apiKey = "sk_live_1234...";

// Don't ignore SIGTERM
// (Required for Docker/Kubernetes)

// Don't use npm in Docker CMD
CMD[("npm", "start")]; // npm doesn't forward signals!

// Don't exit in uncaughtException without cleanup
process.on("uncaughtException", () => {
  process.exit(1); // No cleanup!
});
```

### ✅ Do

```javascript
// Use environment variables
const apiKey = process.env.API_KEY;

// Handle SIGTERM
process.on("SIGTERM", gracefulShutdown);

// Use node directly in Docker
CMD[("node", "app.js")];

// Cleanup before exit
process.on("uncaughtException", async (error) => {
  console.error(error);
  await cleanup();
  process.exit(1);
});
```

---

**Remember**: Process management is critical for production apps!
