/**
 * 07 - Production Error Handling
 *
 * Learn production-ready error handling patterns including
 * logging, monitoring, graceful degradation, and user experience.
 */

console.log("=== Production Error Handling ===\n");

// ============================================
// 1. Production Error Class
// ============================================

console.log("1. Production-Ready Error Class:");

class ProductionError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = options.statusCode || 500;
    this.isOperational = options.isOperational !== false;
    this.code = options.code;
    this.timestamp = new Date().toISOString();
    this.context = options.context || {};

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      timestamp: this.timestamp,
      context: this.context,
      // Only include stack in development
      ...(process.env.NODE_ENV === "development" && {
        stack: this.stack,
      }),
    };
  }

  toClientResponse() {
    // Safe response for clients (no sensitive data)
    return {
      error: {
        message: this.isOperational ? this.message : "An error occurred",
        code: this.code,
        statusCode: this.statusCode,
      },
    };
  }
}

const error = new ProductionError("Database connection failed", {
  statusCode: 503,
  code: "DB_CONNECTION_ERROR",
  context: { host: "db.example.com", port: 5432 },
});

console.log(
  "  Full error (for logs):",
  JSON.stringify(error.toJSON(), null, 2)
);
console.log(
  "\n  Client response:",
  JSON.stringify(error.toClientResponse(), null, 2)
);
console.log();

// ============================================
// 2. Structured Logging
// ============================================

console.log("2. Structured Logging:");

class Logger {
  constructor(service) {
    this.service = service;
  }

  log(level, message, meta = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
      ...meta,
    };

    // In production, send to logging service (e.g., Winston, Bunyan)
    console.log(
      `  [${level.toUpperCase()}]`,
      JSON.stringify(logEntry, null, 2)
    );
  }

  error(message, error, meta = {}) {
    this.log("error", message, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...error,
      },
      ...meta,
    });
  }

  warn(message, meta = {}) {
    this.log("warn", message, meta);
  }

  info(message, meta = {}) {
    this.log("info", message, meta);
  }
}

const logger = new Logger("order-service");

try {
  throw new Error("Payment processing failed");
} catch (error) {
  logger.error("Order payment failed", error, {
    orderId: "ORD-123",
    userId: "USR-456",
    amount: 99.99,
  });
}

console.log();

// ============================================
// 3. Error Monitoring
// ============================================

console.log("3. Error Monitoring and Alerting:");

class ErrorMonitor {
  constructor() {
    this.errorCounts = new Map();
    this.errorThresholds = {
      warning: 5,
      critical: 10,
    };
  }

  track(error) {
    const errorType = error.name;
    const count = (this.errorCounts.get(errorType) || 0) + 1;
    this.errorCounts.set(errorType, count);

    console.log(`  📊 Error tracked: ${errorType} (count: ${count})`);

    // Check thresholds
    if (count === this.errorThresholds.warning) {
      this.sendAlert("warning", errorType, count);
    } else if (count === this.errorThresholds.critical) {
      this.sendAlert("critical", errorType, count);
    }

    // In production, send to monitoring service (e.g., Sentry, DataDog)
    this.sendToMonitoring(error);
  }

  sendAlert(level, errorType, count) {
    console.log(
      `  🚨 ${level.toUpperCase()} ALERT: ${errorType} occurred ${count} times`
    );
    // In production: Send to PagerDuty, Slack, etc.
  }

  sendToMonitoring(error) {
    // In production: Send to Sentry, DataDog, etc.
    console.log(`  → Sent to monitoring: ${error.name}`);
  }

  getStats() {
    return Array.from(this.errorCounts.entries()).map(([type, count]) => ({
      type,
      count,
    }));
  }
}

const monitor = new ErrorMonitor();

// Simulate multiple errors
for (let i = 0; i < 12; i++) {
  try {
    if (i % 3 === 0) {
      throw new Error("DatabaseError");
    } else {
      throw new Error("ValidationError");
    }
  } catch (error) {
    monitor.track(error);
  }
}

console.log("\n  Final stats:", monitor.getStats());
console.log();

// ============================================
// 4. Graceful Degradation
// ============================================

setTimeout(async () => {
  console.log("4. Graceful Degradation:");

  class CacheService {
    async get(key) {
      throw new Error("Cache service unavailable");
    }
  }

  class DatabaseService {
    async get(key) {
      // Simulate database delay
      await new Promise((resolve) => setTimeout(resolve, 100));
      return { id: key, name: "Data from DB" };
    }
  }

  class DataService {
    constructor() {
      this.cache = new CacheService();
      this.db = new DatabaseService();
      this.logger = new Logger("data-service");
    }

    async getData(key) {
      // Try cache first
      try {
        const data = await this.cache.get(key);
        console.log("  ✓ Served from cache (fast)");
        return data;
      } catch (cacheError) {
        this.logger.warn("Cache unavailable, falling back to database", {
          key,
          error: cacheError.message,
        });

        // Fallback to database
        try {
          const data = await this.db.get(key);
          console.log("  ✓ Served from database (slower)");
          return data;
        } catch (dbError) {
          this.logger.error("Both cache and database failed", dbError, { key });

          // Final fallback: return stale data or error
          return { error: "Service temporarily unavailable", key };
        }
      }
    }
  }

  const dataService = new DataService();
  const result = await dataService.getData("user:123");
  console.log("  Final result:", result);
}, 100);

// ============================================
// 5. Circuit Breaker Pattern
// ============================================

setTimeout(() => {
  console.log("\n5. Circuit Breaker Pattern:");

  class CircuitBreaker {
    constructor(options = {}) {
      this.failureThreshold = options.failureThreshold || 3;
      this.timeout = options.timeout || 60000; // 60 seconds
      this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
      this.failureCount = 0;
      this.nextAttempt = Date.now();
    }

    async execute(fn) {
      if (this.state === "OPEN") {
        if (Date.now() < this.nextAttempt) {
          console.log("  ⭕ Circuit OPEN - rejecting immediately");
          throw new Error("Circuit breaker is OPEN");
        }
        console.log("  🔄 Circuit HALF_OPEN - trying again...");
        this.state = "HALF_OPEN";
      }

      try {
        const result = await fn();
        this.onSuccess();
        return result;
      } catch (error) {
        this.onFailure();
        throw error;
      }
    }

    onSuccess() {
      console.log("  ✓ Operation succeeded");
      this.failureCount = 0;
      this.state = "CLOSED";
    }

    onFailure() {
      this.failureCount++;
      console.log(`  ✗ Failure ${this.failureCount}/${this.failureThreshold}`);

      if (this.failureCount >= this.failureThreshold) {
        this.state = "OPEN";
        this.nextAttempt = Date.now() + this.timeout;
        console.log("  🔴 Circuit OPEN - will retry in", this.timeout, "ms");
      }
    }

    getState() {
      return {
        state: this.state,
        failureCount: this.failureCount,
        nextAttempt: new Date(this.nextAttempt).toISOString(),
      };
    }
  }

  const breaker = new CircuitBreaker({ failureThreshold: 3 });

  async function unreliableService() {
    throw new Error("Service unavailable");
  }

  // Simulate multiple failures
  async function testCircuitBreaker() {
    for (let i = 0; i < 5; i++) {
      try {
        await breaker.execute(unreliableService);
      } catch (error) {
        console.log("    Caught:", error.message);
      }
      console.log("    State:", breaker.getState());
      console.log();
    }
  }

  testCircuitBreaker();
}, 500);

// ============================================
// 6. User-Friendly Error Messages
// ============================================

setTimeout(() => {
  console.log("6. User-Friendly Error Messages:");

  class ErrorFormatter {
    static toUserMessage(error) {
      const messages = {
        ECONNREFUSED:
          "Unable to connect to the server. Please try again later.",
        ETIMEDOUT: "The request took too long. Please try again.",
        ENOTFOUND: "Could not find the requested resource.",
        NetworkError: "Network connection failed. Please check your internet.",
        ValidationError: "Please check your input and try again.",
        UnauthorizedError: "You need to log in to access this resource.",
        ForbiddenError: "You don't have permission to access this resource.",
        NotFoundError: "The requested item could not be found.",
        DatabaseError:
          "We're experiencing technical difficulties. Please try again later.",
      };

      const userMessage =
        messages[error.code] ||
        messages[error.name] ||
        "Something went wrong. Please try again later.";

      return {
        message: userMessage,
        canRetry: this.isRetryable(error),
        supportReference: this.generateSupportReference(error),
      };
    }

    static isRetryable(error) {
      const retryableErrors = ["ETIMEDOUT", "ECONNREFUSED", "NetworkError"];
      return (
        retryableErrors.includes(error.code) ||
        retryableErrors.includes(error.name)
      );
    }

    static generateSupportReference(error) {
      // In production: generate unique reference for support tickets
      return `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  const errors = [
    Object.assign(new Error("Connection refused"), { code: "ECONNREFUSED" }),
    Object.assign(new Error("Not found"), { name: "NotFoundError" }),
    new Error("Unknown error"),
  ];

  errors.forEach((error) => {
    const userError = ErrorFormatter.toUserMessage(error);
    console.log("  Technical:", error.message);
    console.log("  User sees:", userError.message);
    console.log("  Can retry:", userError.canRetry);
    console.log("  Reference:", userError.supportReference);
    console.log();
  });
}, 1000);

// ============================================
// 7. Global Error Handler Setup
// ============================================

setTimeout(() => {
  console.log("7. Global Error Handler Setup:");

  function setupGlobalHandlers() {
    // Uncaught exceptions
    process.on("uncaughtException", (error) => {
      console.log("  🔥 UNCAUGHT EXCEPTION:");
      logger.error("Uncaught exception", error);
      monitor.track(error);

      // In production: graceful shutdown
      console.log("  → Initiating graceful shutdown...");
      process.exit(1);
    });

    // Unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      console.log("  ⚠️  UNHANDLED REJECTION:");
      logger.error("Unhandled promise rejection", reason);

      // In Node.js 15+, this will terminate the process
      // Handle it before that happens
    });

    // Warning events
    process.on("warning", (warning) => {
      logger.warn("Process warning", { warning: warning.message });
    });

    console.log("  ✓ Global error handlers set up");
  }

  setupGlobalHandlers();
}, 1200);

// ============================================
// Summary
// ============================================

setTimeout(() => {
  console.log("\n=== Key Takeaways ===");
  console.log("✓ Use structured logging for searchable logs");
  console.log("✓ Monitor error rates and set up alerts");
  console.log("✓ Implement graceful degradation and fallbacks");
  console.log("✓ Use circuit breakers to prevent cascade failures");
  console.log("✓ Provide user-friendly error messages");
  console.log("✓ Set up global handlers for uncaught errors");
  console.log("✓ Log context with errors for debugging");
  console.log("✓ Distinguish operational vs programmer errors");
  console.log("💡 Production error handling saves your app in the wild!");
}, 1400);
