/**
 * 04 - Graceful Shutdown
 *
 * Production-ready graceful shutdown pattern with HTTP server,
 * database connections, and proper cleanup sequence.
 */

const http = require("http");
const { EventEmitter } = require("events");

console.log("=== Graceful Shutdown Pattern ===\n");

// ============================================
// 1. Simulated Resources
// ============================================

// Simulate a database connection
class Database extends EventEmitter {
  constructor() {
    super();
    this.connected = false;
    this.activeQueries = new Set();
  }

  async connect() {
    console.log("  📊 Connecting to database...");
    await this.delay(500);
    this.connected = true;
    console.log("  ✓ Database connected");
  }

  async query(sql) {
    if (!this.connected) {
      throw new Error("Database not connected");
    }

    const queryId = Math.random().toString(36).substring(7);
    this.activeQueries.add(queryId);

    console.log(`  🔍 Query ${queryId}: ${sql}`);
    await this.delay(Math.random() * 2000 + 500);

    this.activeQueries.delete(queryId);
    return { rows: [], queryId };
  }

  async close() {
    console.log(
      `  🔌 Closing database (${this.activeQueries.size} active queries)...`
    );

    // Wait for active queries to complete
    while (this.activeQueries.size > 0) {
      console.log(`  ⏳ Waiting for ${this.activeQueries.size} queries...`);
      await this.delay(200);
    }

    this.connected = false;
    console.log("  ✓ Database closed");
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Simulate a cache (Redis)
class Cache {
  constructor() {
    this.connected = false;
  }

  async connect() {
    console.log("  🔥 Connecting to cache...");
    await this.delay(300);
    this.connected = true;
    console.log("  ✓ Cache connected");
  }

  async close() {
    console.log("  🔌 Closing cache connection...");
    await this.delay(200);
    this.connected = false;
    console.log("  ✓ Cache closed");
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================
// 2. HTTP Server with Graceful Shutdown
// ============================================

class GracefulServer {
  constructor(options = {}) {
    this.port = options.port || 3000;
    this.shutdownTimeout = options.shutdownTimeout || 10000;
    this.isShuttingDown = false;

    this.db = new Database();
    this.cache = new Cache();
    this.server = null;
    this.activeConnections = new Set();
    this.activeRequests = 0;
  }

  // Track connections
  trackConnection(socket) {
    this.activeConnections.add(socket);

    socket.on("close", () => {
      this.activeConnections.delete(socket);
    });
  }

  // HTTP request handler
  async handleRequest(req, res) {
    // Reject new requests if shutting down
    if (this.isShuttingDown) {
      res.writeHead(503, { "Content-Type": "text/plain" });
      res.end("Server is shutting down");
      return;
    }

    this.activeRequests++;
    const requestId = Math.random().toString(36).substring(7);

    try {
      console.log(`  📥 Request ${requestId}: ${req.method} ${req.url}`);

      // Simulate database query
      await this.db.query(`SELECT * FROM ${req.url}`);

      // Simulate some processing time
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Hello from graceful server!",
          requestId,
          timestamp: new Date().toISOString(),
        })
      );

      console.log(`  ✓ Request ${requestId} completed`);
    } catch (error) {
      console.error(`  ❌ Request ${requestId} failed:`, error.message);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } finally {
      this.activeRequests--;
    }
  }

  // Start the server
  async start() {
    // Connect to resources
    await this.db.connect();
    await this.cache.connect();

    // Create HTTP server
    this.server = http.createServer((req, res) => this.handleRequest(req, res));

    // Track connections for graceful shutdown
    this.server.on("connection", (socket) => {
      this.trackConnection(socket);
    });

    // Start listening
    await new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log(`  🚀 Server listening on port ${this.port}`);
        console.log(`  ℹ️  PID: ${process.pid}`);
        console.log(`  ℹ️  Try: curl http://localhost:${this.port}/users\n`);
        resolve();
      });
    });

    // Set up signal handlers
    this.setupSignalHandlers();
  }

  // Graceful shutdown
  async shutdown(signal) {
    if (this.isShuttingDown) {
      console.log("  ⚠️  Already shutting down...");
      return;
    }

    this.isShuttingDown = true;
    console.log(`\n  🛑 Received ${signal}, starting graceful shutdown...\n`);

    // Set a timeout for forced shutdown
    const forceShutdownTimeout = setTimeout(() => {
      console.error("  ⏰ Shutdown timeout exceeded! Forcing exit...");
      process.exit(1);
    }, this.shutdownTimeout);

    // Don't let timeout keep process alive
    forceShutdownTimeout.unref();

    try {
      // Step 1: Stop accepting new connections
      console.log("  1️⃣  Stopping server (no new connections)...");
      await new Promise((resolve, reject) => {
        this.server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log("  ✓ Server stopped accepting new connections\n");

      // Step 2: Wait for active requests to complete
      console.log(
        `  2️⃣  Waiting for ${this.activeRequests} active requests...`
      );
      while (this.activeRequests > 0) {
        console.log(`  ⏳ ${this.activeRequests} requests still processing...`);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      console.log("  ✓ All requests completed\n");

      // Step 3: Close database connections
      console.log("  3️⃣  Closing database connections...");
      await this.db.close();
      console.log();

      // Step 4: Close cache connections
      console.log("  4️⃣  Closing cache connections...");
      await this.cache.close();
      console.log();

      // Step 5: Close remaining sockets
      console.log(
        `  5️⃣  Closing ${this.activeConnections.size} remaining connections...`
      );
      for (const socket of this.activeConnections) {
        socket.destroy();
      }
      console.log("  ✓ All connections closed\n");

      // Clear the timeout
      clearTimeout(forceShutdownTimeout);

      console.log("  ✅ Graceful shutdown complete!\n");
      process.exit(0);
    } catch (error) {
      console.error("  ❌ Error during shutdown:", error);
      clearTimeout(forceShutdownTimeout);
      process.exit(1);
    }
  }

  // Setup signal handlers
  setupSignalHandlers() {
    // Graceful shutdown on SIGTERM and SIGINT
    process.on("SIGTERM", () => this.shutdown("SIGTERM"));
    process.on("SIGINT", () => this.shutdown("SIGINT"));

    // Health check / status on SIGUSR1
    process.on("SIGUSR1", () => {
      console.log("\n  📊 Server Status:");
      console.log("  Active requests:", this.activeRequests);
      console.log("  Active connections:", this.activeConnections.size);
      console.log("  Active DB queries:", this.db.activeQueries.size);
      console.log("  Uptime:", process.uptime().toFixed(2), "seconds");
      console.log(
        "  Memory:",
        (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
        "MB\n"
      );
    });

    // Handle uncaught errors
    process.on("uncaughtException", (error) => {
      console.error("  ❌ Uncaught Exception:", error);
      this.shutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("  ❌ Unhandled Rejection at:", promise, "reason:", reason);
      this.shutdown("unhandledRejection");
    });
  }
}

// ============================================
// 3. Start the Server
// ============================================

async function main() {
  const server = new GracefulServer({
    port: 3000,
    shutdownTimeout: 10000, // 10 seconds max
  });

  await server.start();

  console.log("=== Test Commands ===");
  console.log("In another terminal, try:");
  console.log("  # Make requests");
  console.log("  curl http://localhost:3000/users");
  console.log("  curl http://localhost:3000/posts");
  console.log();
  console.log("  # Check status");
  console.log(`  kill -USR1 ${process.pid}`);
  console.log();
  console.log("  # Graceful shutdown");
  console.log(`  kill -TERM ${process.pid}`);
  console.log("  # OR press Ctrl+C");
  console.log();
  console.log("  # Load test (install 'hey' or 'ab' first)");
  console.log("  hey -n 100 -c 10 http://localhost:3000/users");
  console.log("  # Then quickly send SIGTERM to test shutdown under load");
  console.log();
}

// Run the server
main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

// ============================================
// Key Takeaways
// ============================================

/*
=== Graceful Shutdown Pattern ===

1. Stop Accepting New Connections
   - Call server.close()
   - Reject new requests with 503

2. Wait for Active Requests
   - Track request count
   - Wait for all to complete
   - Set a timeout (don't wait forever)

3. Close Resources in Order
   - Database connections (wait for queries)
   - Cache connections
   - Message queue connections
   - File handles
   - Timers and intervals

4. Force Exit if Timeout
   - Set shutdown timeout (e.g., 10 seconds)
   - If exceeded, force exit
   - Log what was still active

5. Handle Multiple Signals
   - SIGTERM (graceful shutdown)
   - SIGINT (Ctrl+C)
   - SIGUSR1 (status check)
   - uncaughtException / unhandledRejection

6. Production Considerations
   - Log everything during shutdown
   - Notify load balancer (health check)
   - Send metrics/alerts
   - Save state if needed
   - Set proper exit codes

This pattern ensures:
✓ No requests are dropped
✓ No data is lost
✓ Resources are cleaned up
✓ Process exits cleanly
✓ Works with container orchestration (Docker, Kubernetes)
*/
