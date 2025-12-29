# Process & Global Objects

**Time**: 2-3h | **Difficulty**: ⭐⭐ | **Status**: ✅ Complete
**Topics**: Environment vars | Process signals | Graceful shutdown | Global objects
**Resources**: [Node.js Process Documentation](https://nodejs.org/api/process.html)

---

## 📋 Overview

Learn how to interact with the Node.js process, manage environment variables, handle OS signals, implement graceful shutdown, and work with global objects. These skills are **critical** for production applications.

### Why This Matters

- **Environment Variables**: Configuration without hardcoding secrets
- **Process Signals**: Graceful shutdown in production (Docker, Kubernetes)
- **Process Info**: Monitoring, debugging, and health checks
- **Global Objects**: Understanding what's available without imports

---

## 🎯 Learning Objectives

By the end of this module, you will:

- [ ] Understand the `process` object and its properties
- [ ] Use environment variables for configuration
- [ ] Handle process signals (SIGTERM, SIGINT, SIGUSR1, etc.)
- [ ] Implement production-ready graceful shutdown
- [ ] Work with global objects (console, Buffer, timers, etc.)
- [ ] Monitor process health and resource usage
- [ ] Debug production issues using process signals

---

## � Examples

Work through these examples in order:

### 1. Process Basics (30 min)

**File**: `examples/01-process-basics.js`

Learn about:

- Process information (PID, platform, architecture)
- Command line arguments (`process.argv`)
- Memory usage tracking
- CPU usage monitoring
- Working directory management
- Process exit codes

**Run**: `node examples/01-process-basics.js --name=Alice --age=30`

### 2. Environment Variables (30 min)

**File**: `examples/02-environment-variables.js`

Learn about:

- Reading environment variables
- Configuration patterns
- Type conversion (string → number → boolean)
- Secrets management
- .env file pattern
- Feature flags
- Multi-environment configuration

**Run**: `NODE_ENV=production PORT=8080 node examples/02-environment-variables.js`

### 3. Process Signals (30 min)

**File**: `examples/03-process-signals.js`

Learn about:

- Common signals (SIGINT, SIGTERM, SIGUSR1, SIGUSR2)
- Signal handlers
- Graceful shutdown patterns
- Multiple handlers
- Debugging with signals
- Windows compatibility

**Run**:

```bash
node examples/03-process-signals.js
# In another terminal:
kill -USR1 <PID>
kill -TERM <PID>
```

### 4. Graceful Shutdown (45 min)

**File**: `examples/04-graceful-shutdown.js`

Production-ready graceful shutdown with:

- HTTP server
- Database connections
- Cache connections
- Request tracking
- Shutdown timeout
- Signal handling
- Resource cleanup sequence

**Run**:

```bash
node examples/04-graceful-shutdown.js
# Test with:
curl http://localhost:3000/users
kill -TERM <PID>
```

### 5. Global Objects (30 min)

**File**: `examples/05-global-objects.js`

Learn about:

- Console methods (log, table, time, trace)
- Timers (setTimeout, setInterval, setImmediate)
- process.nextTick()
- Buffer
- URL and URLSearchParams
- TextEncoder/TextDecoder
- Web APIs in Node.js (fetch, crypto, performance)

**Run**: `node examples/05-global-objects.js`

---

## 💪 Exercises

Complete these exercises to solidify your understanding:

### Exercise 1: Environment Configuration (⭐⭐)

**File**: `exercises/exercise-1-environment.js`

Build a robust configuration system:

- ConfigLoader with type conversion
- Multi-environment configuration
- Secret management with masking
- Feature flag system with rollouts

**Time**: 60-90 min

### Exercise 2: Graceful Shutdown (⭐⭐⭐)

**File**: `exercises/exercise-2-graceful-shutdown.js`

Implement production-ready shutdown:

- ResourceManager for multiple resources
- HTTP server with connection tracking
- Signal handler registry
- Complete production app

**Time**: 90-120 min

### Exercise 3: Process Monitoring (⭐⭐)

**File**: `exercises/exercise-3-monitoring.js`

Build a monitoring system:

- Health monitor with event loop lag detection
- Process inspector with heap snapshots
- Resource leak detector
- Complete monitoring dashboard

**Time**: 60-90 min

---

## 🔑 Key Concepts

### Process Object

```javascript
// Process information
process.pid; // Process ID
process.platform; // OS platform
process.version; // Node.js version
process.uptime(); // Process uptime
process.memoryUsage(); // Memory usage
process.cpuUsage(); // CPU usage

// Arguments and environment
process.argv; // Command line arguments
process.env; // Environment variables
process.cwd(); // Current working directory

// Control
process.exit(code); // Exit with code
process.exitCode = 1; // Set exit code
```

### Environment Variables

```javascript
// Read with defaults
const port = process.env.PORT || 3000;
const nodeEnv = process.env.NODE_ENV || "development";

// Type conversion
const maxConns = parseInt(process.env.MAX_CONNECTIONS || "100", 10);
const debug = process.env.DEBUG === "true";

// Required variables
function requireEnv(name) {
  if (!process.env[name]) {
    throw new Error(`Missing: ${name}`);
  }
  return process.env[name];
}

// Use .env files (with dotenv package)
require("dotenv").config();
```

### Process Signals

```javascript
// Graceful shutdown on SIGTERM (from Docker/k8s)
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down...");

  // 1. Stop accepting new requests
  server.close();

  // 2. Finish active requests
  await waitForRequests();

  // 3. Close database
  await db.close();

  // 4. Exit
  process.exit(0);
});

// User interrupt (Ctrl+C)
process.on("SIGINT", () => {
  console.log("Received SIGINT");
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

### Graceful Shutdown Pattern

```javascript
class GracefulShutdown {
  async shutdown(signal) {
    console.log(`Received ${signal}`);

    // Set timeout for forced exit
    setTimeout(() => {
      console.error("Forced exit!");
      process.exit(1);
    }, 10000).unref();

    try {
      // 1. Stop accepting new work
      await this.stopServer();

      // 2. Wait for current work
      await this.waitForRequests();

      // 3. Close resources
      await this.closeDatabase();
      await this.closeCache();

      // 4. Success
      process.exit(0);
    } catch (error) {
      console.error("Shutdown error:", error);
      process.exit(1);
    }
  }
}
```

### Global Objects

```javascript
// Available without require/import:
console.log(); // Logging
setTimeout(); // Timers
setInterval();
setImmediate();
process.nextTick(); // Next tick

Buffer.from(); // Binary data
URL; // URL parsing
TextEncoder; // Text encoding
crypto.randomUUID(); // Web Crypto
fetch(); // HTTP requests (Node 18+)
performance.now(); // High-res time

// Module-scoped (look global, aren't):
__dirname; // Current directory
__filename; // Current file
require(); // Module loader
module, exports; // Module system
```

---

## ✅ Success Criteria

You've mastered this module when you can:

- [ ] Explain what the `process` object is and its key properties
- [ ] Use environment variables for all configuration
- [ ] Implement graceful shutdown that:
  - Stops accepting new requests
  - Finishes active requests
  - Closes resources in correct order
  - Has a timeout for forced exit
- [ ] Handle SIGTERM, SIGINT, and custom signals
- [ ] Monitor process health (memory, CPU, event loop)
- [ ] Use global objects appropriately
- [ ] Debug production issues using signals
- [ ] Explain the difference between global and module-scoped objects

---

## 🔗 Related Concepts

- **Event Loop** (01-runtime-architecture): Understand how `process.nextTick()` works
- **Error Handling** (05-error-handling): Handle errors during shutdown
- **Streams** (03-streams): Process signals during stream processing
- **HTTP Servers** (Week 1 Project): Implement graceful shutdown in APIs

---

## 📖 Additional Resources

### Documentation

- [Node.js Process Docs](https://nodejs.org/api/process.html)
- [Node.js Globals](https://nodejs.org/api/globals.html)
- [dotenv Package](https://www.npmjs.com/package/dotenv)

### Articles

- [Graceful Shutdown in Node.js](https://blog.risingstack.com/graceful-shutdown-node-js-kubernetes/)
- [Environment Variables Best Practices](https://12factor.net/config)
- [Node.js Signals Guide](https://www.linux.com/training-tutorials/sending-signals-linux/)

### Production Examples

- Docker SIGTERM handling
- Kubernetes readiness/liveness probes
- PM2 process management
- Production monitoring patterns

---

## 🎯 Next Steps

After completing this module:

1. ✅ Complete all examples
2. ✅ Finish all 3 exercises
3. ✅ Build the mini-project: `mini-projects/03-graceful-shutdown/`
4. → Move to **07-async-patterns** for advanced async handling
5. → Apply these patterns in **Project 1: URL Shortener**

---

## 💡 Pro Tips

1. **Always handle SIGTERM** - Required for Docker/Kubernetes
2. **Set shutdown timeout** - Don't wait forever for cleanup
3. **Never hardcode secrets** - Always use environment variables
4. **Validate config at startup** - Fail fast if misconfigured
5. **Use .env for local dev** - Never commit .env to git
6. **Monitor event loop lag** - Key indicator of process health
7. **Use SIGUSR1/SIGUSR2** - Custom debugging signals
8. **Test your shutdown** - Send signals during active requests

---

**Ready to build production-ready Node.js applications!** 🚀
