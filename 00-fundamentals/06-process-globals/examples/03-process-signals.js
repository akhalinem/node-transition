/**
 * 03 - Process Signals
 *
 * Learn how to handle operating system signals sent to your process.
 * Critical for graceful shutdowns, handling user interrupts, and
 * process management in production.
 */

console.log("=== Process Signals ===\n");

// ============================================
// 1. Common Signals Overview
// ============================================

console.log("1. Common Process Signals:");

console.log("  SIGINT  (Ctrl+C)     - Interrupt from keyboard");
console.log("  SIGTERM (kill)       - Termination signal");
console.log("  SIGHUP               - Hangup (terminal closed)");
console.log("  SIGUSR1              - User-defined signal 1");
console.log("  SIGUSR2              - User-defined signal 2");
console.log("  SIGQUIT (Ctrl+\\)     - Quit from keyboard");
console.log("  SIGKILL              - Cannot be caught!");
console.log("  SIGSTOP              - Cannot be caught!");

console.log();

// ============================================
// 2. Catching SIGINT (Ctrl+C)
// ============================================

console.log("2. Handling SIGINT (Ctrl+C):");

let sigintCount = 0;

process.on("SIGINT", () => {
  sigintCount++;

  console.log(`\n  ⚠️  Caught SIGINT (attempt ${sigintCount})`);

  if (sigintCount === 1) {
    console.log("  Press Ctrl+C again to force quit");
    console.log("  Or wait for graceful shutdown...");

    // Simulate cleanup work
    console.log("  Cleaning up resources...");
    setTimeout(() => {
      console.log("  ✓ Cleanup complete");
      process.exit(0);
    }, 2000);
  } else {
    console.log("  ⚠️  Forcing immediate exit!");
    process.exit(1);
  }
});

console.log("  ℹ️  Try pressing Ctrl+C (SIGINT handler installed)");

console.log();

// ============================================
// 3. Catching SIGTERM
// ============================================

console.log("3. Handling SIGTERM:");

process.on("SIGTERM", () => {
  console.log("\n  ⚠️  Received SIGTERM signal");
  console.log("  Initiating graceful shutdown...");

  // In production, this is where you:
  // - Stop accepting new requests
  // - Finish processing current requests
  // - Close database connections
  // - Close message queue connections
  // - Flush logs

  setTimeout(() => {
    console.log("  ✓ Graceful shutdown complete");
    process.exit(0);
  }, 1000);
});

console.log("  ℹ️  Send with: kill -TERM", process.pid);

console.log();

// ============================================
// 4. Custom Signal Handlers
// ============================================

console.log("4. User-Defined Signals:");

process.on("SIGUSR1", () => {
  console.log("\n  📊 Received SIGUSR1 - Logging status:");
  console.log("  Process uptime:", process.uptime().toFixed(2), "seconds");
  console.log(
    "  Memory usage:",
    process.memoryUsage().heapUsed / 1024 / 1024,
    "MB"
  );
  console.log(
    "  Active handles:",
    process._getActiveHandles?.().length || "N/A"
  );
  console.log(
    "  Active requests:",
    process._getActiveRequests?.().length || "N/A"
  );
});

process.on("SIGUSR2", () => {
  console.log("\n  🔄 Received SIGUSR2 - Reloading configuration:");
  console.log("  (In production, reload config files here)");
  console.log("  ✓ Configuration reloaded");
});

console.log("  ℹ️  Test with:");
console.log("    kill -USR1", process.pid, "(print status)");
console.log("    kill -USR2", process.pid, "(reload config)");

console.log();

// ============================================
// 5. Signal Handler Best Practices
// ============================================

console.log("5. Signal Handler Best Practices:");

class GracefulShutdown {
  constructor() {
    this.isShuttingDown = false;
    this.connections = new Set();
  }

  // Track active connections
  trackConnection(conn) {
    this.connections.add(conn);
    conn.on("close", () => this.connections.delete(conn));
  }

  // Start shutdown process
  async shutdown(signal) {
    if (this.isShuttingDown) {
      console.log("  ⚠️  Already shutting down...");
      return;
    }

    this.isShuttingDown = true;
    console.log(`\n  🛑 Received ${signal}, starting graceful shutdown...`);

    try {
      // Step 1: Stop accepting new connections
      console.log("  1️⃣  Stopping new connections...");
      // In real app: server.close()

      // Step 2: Wait for active connections to finish
      console.log(
        `  2️⃣  Waiting for ${this.connections.size} active connections...`
      );
      // In real app: await Promise.all(activeRequests)

      // Step 3: Close database connections
      console.log("  3️⃣  Closing database connections...");
      // In real app: await db.close()

      // Step 4: Close other resources
      console.log("  4️⃣  Closing other resources...");
      // In real app: await redis.quit(), await messageQueue.close()

      // Step 5: Flush logs
      console.log("  5️⃣  Flushing logs...");
      // In real app: await logger.flush()

      console.log("  ✅ Graceful shutdown complete");
      process.exit(0);
    } catch (error) {
      console.error("  ❌ Error during shutdown:", error);
      process.exit(1);
    }
  }

  // Set up signal handlers
  setupHandlers() {
    // Graceful shutdown signals
    const shutdownSignals = ["SIGTERM", "SIGINT"];

    shutdownSignals.forEach((signal) => {
      process.on(signal, () => this.shutdown(signal));
    });

    // Prevent process from exiting on unhandled errors during shutdown
    process.on("uncaughtException", (error) => {
      console.error("  ❌ Uncaught exception:", error);
      if (!this.isShuttingDown) {
        this.shutdown("uncaughtException");
      }
    });

    process.on("unhandledRejection", (reason) => {
      console.error("  ❌ Unhandled rejection:", reason);
      if (!this.isShuttingDown) {
        this.shutdown("unhandledRejection");
      }
    });
  }
}

// Example usage (commented out to not interfere with other handlers)
// const gracefulShutdown = new GracefulShutdown();
// gracefulShutdown.setupHandlers();

console.log("  ✓ See GracefulShutdown class above for production pattern");

console.log();

// ============================================
// 6. Timeout for Graceful Shutdown
// ============================================

console.log("6. Shutdown Timeout Pattern:");

function shutdownWithTimeout(cleanup, timeoutMs = 10000) {
  const timeout = setTimeout(() => {
    console.error("  ⏰ Shutdown timeout! Forcing exit...");
    process.exit(1);
  }, timeoutMs);

  // Don't let the timeout keep the process alive
  timeout.unref();

  cleanup()
    .then(() => {
      clearTimeout(timeout);
      console.log("  ✓ Cleanup complete");
      process.exit(0);
    })
    .catch((error) => {
      clearTimeout(timeout);
      console.error("  ❌ Cleanup failed:", error);
      process.exit(1);
    });
}

console.log("  Pattern: Set a timeout for shutdown");
console.log("  If cleanup takes too long, force exit");
console.log("  Prevents hung processes in production");

console.log();

// ============================================
// 7. Multiple Signal Handlers
// ============================================

console.log("7. Multiple Handler Pattern:");

const signalHandlers = {
  SIGINT: [],
  SIGTERM: [],
  SIGUSR1: [],
  SIGUSR2: [],
};

function registerSignalHandler(signal, handler) {
  if (!signalHandlers[signal]) {
    signalHandlers[signal] = [];

    // Set up the actual signal handler
    process.on(signal, async () => {
      console.log(
        `\n  📡 Executing ${signalHandlers[signal].length} handlers for ${signal}`
      );

      for (const handler of signalHandlers[signal]) {
        try {
          await handler();
        } catch (error) {
          console.error(`  ❌ Handler error:`, error.message);
        }
      }
    });
  }

  signalHandlers[signal].push(handler);
}

// Example: Register multiple handlers
// registerSignalHandler('SIGUSR1', async () => {
//   console.log('  Handler 1: Logging stats');
// });
//
// registerSignalHandler('SIGUSR1', async () => {
//   console.log('  Handler 2: Dumping heap');
// });

console.log("  ✓ Can register multiple handlers for the same signal");
console.log("  ✓ Execute them in sequence (or parallel)");

console.log();

// ============================================
// 8. Debugging with Signals
// ============================================

console.log("8. Debugging with Signals:");

// SIGUSR1 triggers the debugger in Node.js (built-in)
console.log("  Built-in: SIGUSR1 triggers debugger (if --inspect)");
console.log("  Example: kill -USR1", process.pid);

// Custom debugging signal
process.on("SIGUSR2", () => {
  console.log("\n  🐛 Debug info:");
  console.log("  Event loop lag:", /* some monitoring library */ "N/A");
  console.log("  Memory:", process.memoryUsage());
  console.log("  CPU:", process.cpuUsage());

  // Take heap snapshot
  console.log("  💾 Taking heap snapshot...");
  // In real app: use v8.writeHeapSnapshot()
});

console.log();

// ============================================
// 9. Windows Compatibility
// ============================================

console.log("9. Windows Signal Handling:");

console.log("  ⚠️  Windows has limited signal support:");
console.log("    • SIGINT works (Ctrl+C)");
console.log("    • SIGTERM can be sent but may not work");
console.log("    • SIGKILL is not supported");
console.log("    • SIGHUP, SIGUSR1, SIGUSR2 do not work");

console.log("\n  Platform detection:");
const isWindows = process.platform === "win32";
console.log("  Current platform:", process.platform);
console.log("  Is Windows:", isWindows);

if (isWindows) {
  console.log("  ℹ️  Use process.exit() or task manager on Windows");
}

console.log();

// ============================================
// 10. Signal Testing
// ============================================

console.log("10. Testing Signal Handlers:");

console.log("  Commands to test this script:");
console.log("    1. Run this script");
console.log("    2. In another terminal:");
console.log("       kill -INT ", process.pid, " (Ctrl+C equivalent)");
console.log("       kill -TERM", process.pid, " (graceful shutdown)");
console.log("       kill -USR1", process.pid, " (print status)");
console.log("       kill -USR2", process.pid, " (reload config)");

console.log("\n  Or just press Ctrl+C while this is running!");

console.log("\n=== Key Takeaways ===");
console.log("✓ SIGINT = Ctrl+C (user interrupt)");
console.log("✓ SIGTERM = Graceful shutdown (kill command)");
console.log("✓ SIGKILL = Cannot be caught (kill -9)");
console.log("✓ Always implement graceful shutdown for production");
console.log("✓ Set a timeout for shutdown (prevent hung process)");
console.log(
  "✓ Clean up resources in order: stop accepting → finish work → close connections"
);
console.log(
  "✓ Use SIGUSR1/SIGUSR2 for custom operations (debugging, config reload)"
);
console.log("✓ Windows has limited signal support");

// Keep process alive to test signals
console.log("\n⏳ Process running... (PID:", process.pid, ")");
console.log(
  "Press Ctrl+C to test signal handling, or send signals from another terminal"
);

setInterval(() => {
  // Keep alive
}, 5000);
