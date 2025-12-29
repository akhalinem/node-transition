/**
 * EXERCISE 2: Graceful Shutdown Implementation
 * Difficulty: ⭐⭐⭐
 *
 * Build a production-ready graceful shutdown system for a
 * multi-resource application.
 */

const http = require("http");
const { EventEmitter } = require("events");

console.log("=== Exercise 2: Graceful Shutdown ===\n");

// ============================================
// CHALLENGE 1: Resource Manager
// ============================================

console.log("Challenge 1: Resource Manager with Graceful Shutdown");
console.log("---------------------------------------------------");

/**
 * Task: Create a ResourceManager that:
 * - Manages multiple resources (DB, cache, message queue, etc.)
 * - Tracks resource state (connecting, connected, disconnecting, disconnected)
 * - Provides graceful shutdown for all resources
 * - Handles shutdown timeout
 * - Logs all shutdown steps
 */

class ResourceManager extends EventEmitter {
  constructor(options = {}) {
    super();
    this.resources = new Map();
    this.shutdownTimeout = options.shutdownTimeout || 10000;
    this.isShuttingDown = false;
  }

  register(name, resource) {
    // TODO: Register a resource
    // Resource must have: connect(), close(), and state property
    // Add to this.resources Map
    throw new Error("Not implemented");
  }

  async connectAll() {
    // TODO: Connect all resources in parallel
    // Handle connection errors gracefully
    // Emit 'connected' event for each
    throw new Error("Not implemented");
  }

  async shutdown(signal) {
    // TODO: Gracefully shutdown all resources
    // 1. Set isShuttingDown flag
    // 2. Set timeout for forced shutdown
    // 3. Close resources in reverse order of registration
    // 4. Wait for each to close
    // 5. Emit 'shutdown' event
    // 6. Clear timeout
    throw new Error("Not implemented");
  }

  getStatus() {
    // TODO: Return status of all resources
    throw new Error("Not implemented");
  }
}

// Example resources to manage
class Database {
  constructor(name) {
    this.name = name;
    this.state = "disconnected";
    this.activeQueries = new Set();
  }

  async connect() {
    console.log(`  📊 Connecting to ${this.name}...`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.state = "connected";
    console.log(`  ✓ ${this.name} connected`);
  }

  async query(sql) {
    if (this.state !== "connected") {
      throw new Error(`${this.name} not connected`);
    }
    const queryId = Math.random().toString(36).substring(7);
    this.activeQueries.add(queryId);

    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));

    this.activeQueries.delete(queryId);
    return { rows: [] };
  }

  async close() {
    console.log(`  🔌 Closing ${this.name}...`);
    this.state = "disconnecting";

    // Wait for active queries
    while (this.activeQueries.size > 0) {
      console.log(
        `  ⏳ ${this.name}: ${this.activeQueries.size} active queries...`
      );
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    this.state = "disconnected";
    console.log(`  ✓ ${this.name} closed`);
  }
}

class Cache {
  constructor(name) {
    this.name = name;
    this.state = "disconnected";
  }

  async connect() {
    console.log(`  🔥 Connecting to ${this.name}...`);
    await new Promise((resolve) => setTimeout(resolve, 300));
    this.state = "connected";
    console.log(`  ✓ ${this.name} connected`);
  }

  async close() {
    console.log(`  🔌 Closing ${this.name}...`);
    this.state = "disconnecting";
    await new Promise((resolve) => setTimeout(resolve, 200));
    this.state = "disconnected";
    console.log(`  ✓ ${this.name} closed`);
  }
}

// Test your implementation
async function testChallenge1() {
  try {
    const manager = new ResourceManager({ shutdownTimeout: 5000 });

    // Register resources
    const db = new Database("PostgreSQL");
    const redis = new Cache("Redis");
    const mongo = new Database("MongoDB");

    manager.register("database", db);
    manager.register("cache", redis);
    manager.register("mongodb", mongo);

    // Connect all
    await manager.connectAll();

    console.log("\n✓ All resources connected");
    console.log("  Status:", manager.getStatus());

    // Simulate some work
    console.log("\n  Simulating queries...");
    db.query("SELECT * FROM users");
    mongo.query("db.posts.find()");

    // Test shutdown
    console.log("\n  Testing shutdown...");
    await manager.shutdown("SIGTERM");

    console.log("\n✓ Challenge 1 complete!");
  } catch (error) {
    console.log("✗ Test failed:", error.message);
    console.error(error.stack);
  }
}

// Uncomment to test:
// testChallenge1().then(() => console.log('\n'));

// ============================================
// CHALLENGE 2: HTTP Server with Graceful Shutdown
// ============================================

setTimeout(() => {
  console.log("\nChallenge 2: HTTP Server Graceful Shutdown");
  console.log("-----------------------------------------");

  /**
   * Task: Create a GracefulHTTPServer that:
   * - Tracks active connections and requests
   * - Stops accepting new connections on shutdown
   * - Returns 503 for new requests during shutdown
   * - Waits for active requests to complete
   * - Closes idle connections immediately
   * - Force-closes connections after timeout
   * - Integrates with ResourceManager from Challenge 1
   */

  class GracefulHTTPServer {
    constructor(options = {}) {
      this.port = options.port || 3000;
      this.shutdownTimeout = options.shutdownTimeout || 10000;
      this.server = null;
      this.connections = new Set();
      this.activeRequests = 0;
      this.isShuttingDown = false;
      this.resourceManager = options.resourceManager || null;
    }

    // TODO: Implement these methods
    // trackConnection(socket) { }
    // handleRequest(req, res) { }
    // async start() { }
    // async shutdown(signal) { }

    async start() {
      throw new Error("Not implemented");
    }

    async shutdown(signal) {
      throw new Error("Not implemented");
    }
  }

  // Uncomment to test:
  // const server = new GracefulHTTPServer({ port: 3000 });
  // server.start();
}, 100);

// ============================================
// CHALLENGE 3: Signal Handler Registry
// ============================================

setTimeout(() => {
  console.log("\nChallenge 3: Signal Handler Registry");
  console.log("-----------------------------------");

  /**
   * Task: Create a SignalRegistry that:
   * - Allows registering multiple handlers for each signal
   * - Executes handlers in order (or parallel)
   * - Handles errors in individual handlers
   * - Prevents duplicate handlers
   * - Allows removing handlers
   * - Logs signal handling
   */

  class SignalRegistry {
    constructor() {
      this.handlers = new Map();
      this.setupDefaultHandlers();
    }

    register(signal, handler, options = {}) {
      // TODO: Register a signal handler
      // options: { name, priority, once }
      throw new Error("Not implemented");
    }

    unregister(signal, handlerName) {
      // TODO: Remove a specific handler
      throw new Error("Not implemented");
    }

    async execute(signal) {
      // TODO: Execute all handlers for a signal
      // Handle errors gracefully
      // Log execution
      throw new Error("Not implemented");
    }

    setupDefaultHandlers() {
      // TODO: Set up handlers for SIGTERM, SIGINT, etc.
      throw new Error("Not implemented");
    }

    getHandlers(signal) {
      // TODO: Return all handlers for a signal
      throw new Error("Not implemented");
    }
  }

  // Test your implementation
  async function testChallenge3() {
    try {
      const registry = new SignalRegistry();

      // Register handlers
      registry.register(
        "SIGTERM",
        async () => {
          console.log("  Handler 1: Stopping server");
          await new Promise((resolve) => setTimeout(resolve, 100));
        },
        { name: "stop-server", priority: 1 }
      );

      registry.register(
        "SIGTERM",
        async () => {
          console.log("  Handler 2: Closing database");
          await new Promise((resolve) => setTimeout(resolve, 100));
        },
        { name: "close-db", priority: 2 }
      );

      registry.register(
        "SIGTERM",
        async () => {
          console.log("  Handler 3: Flushing logs");
          await new Promise((resolve) => setTimeout(resolve, 100));
        },
        { name: "flush-logs", priority: 3 }
      );

      console.log("\n✓ Handlers registered");
      console.log("  Handlers:", registry.getHandlers("SIGTERM"));

      // Test execution
      console.log("\n  Testing SIGTERM execution...");
      await registry.execute("SIGTERM");

      console.log("\n✓ Challenge 3 complete!");
    } catch (error) {
      console.log("✗ Test failed:", error.message);
    }
  }

  // Uncomment to test:
  // testChallenge3().then(() => console.log('\n'));
}, 200);

// ============================================
// CHALLENGE 4: Complete Application
// ============================================

setTimeout(() => {
  console.log("\nChallenge 4: Complete Production App");
  console.log("------------------------------------");

  /**
   * Task: Combine everything into a production-ready app:
   * - HTTP server
   * - Multiple resources (DB, cache, queue)
   * - Signal handlers
   * - Health checks
   * - Metrics collection
   * - Graceful shutdown with timeout
   * - Proper logging
   */

  class ProductionApp {
    constructor() {
      // TODO: Initialize all components
      // - Resource manager
      // - HTTP server
      // - Signal registry
      // - Health check endpoint
    }

    async start() {
      // TODO: Start the application
      // 1. Connect resources
      // 2. Start HTTP server
      // 3. Set up signal handlers
      // 4. Log startup complete
    }

    async shutdown(signal) {
      // TODO: Graceful shutdown sequence
      // 1. Stop accepting requests
      // 2. Wait for active requests
      // 3. Close server
      // 4. Close resources
      // 5. Exit process
    }

    // Health check endpoint
    healthCheck(req, res) {
      // TODO: Return health status
      // Check all resources
      // Return 200 if healthy, 503 if not
    }
  }

  console.log("  ℹ️  See ProductionApp class above");
  console.log("  Implement a complete production-ready application");
  console.log("  with all best practices from previous challenges");
}, 300);

// ============================================
// GETTING STARTED
// ============================================

setTimeout(() => {
  console.log("\n=== Getting Started ===");
  console.log("1. Implement Challenge 1 (ResourceManager)");
  console.log("2. Test with testChallenge1()");
  console.log("3. Move to Challenge 2 (HTTP Server)");
  console.log("4. Implement Challenge 3 (Signal Registry)");
  console.log("5. Combine in Challenge 4 (Production App)");
  console.log("\n=== Testing ===");
  console.log("Run: node exercise-2-graceful-shutdown.js");
  console.log("Then in another terminal:");
  console.log("  kill -TERM <PID>");
  console.log("\n=== Solution ===");
  console.log("Compare with: exercise-2-solution.js");
}, 400);
