/**
 * 06 - Error Propagation
 *
 * Learn how errors propagate through your application and
 * how to implement proper error boundaries.
 */

console.log("=== Error Propagation ===\n");

// ============================================
// 1. Basic Error Propagation
// ============================================

console.log("1. Basic Error Propagation:");

function level3() {
  console.log("  → Level 3: throwing error...");
  throw new Error("Error from level 3");
}

function level2() {
  console.log("  → Level 2: calling level 3...");
  level3(); // Error propagates up
}

function level1() {
  console.log("  → Level 1: calling level 2...");
  try {
    level2();
  } catch (error) {
    console.log("  ✗ Caught in level 1:", error.message);
    console.log("    Stack trace shows propagation:");
    console.log("    " + error.stack.split("\n").slice(0, 4).join("\n    "));
  }
}

level1();
console.log();

// ============================================
// 2. Async Error Propagation
// ============================================

console.log("2. Async Error Propagation:");

async function asyncLevel3() {
  console.log("  → Async Level 3: rejecting...");
  await new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Async error from level 3")), 100);
  });
}

async function asyncLevel2() {
  console.log("  → Async Level 2: awaiting level 3...");
  await asyncLevel3(); // Error propagates if not caught
}

async function asyncLevel1() {
  console.log("  → Async Level 1: awaiting level 2...");
  try {
    await asyncLevel2();
  } catch (error) {
    console.log("  ✗ Caught in async level 1:", error.message);
  }
}

setTimeout(() => {
  asyncLevel1();
}, 100);

// ============================================
// 3. Stopping vs Continuing Propagation
// ============================================

setTimeout(() => {
  console.log("\n3. Stopping vs Continuing Propagation:");

  // Stopping propagation (handling the error)
  function stopPropagation() {
    try {
      throw new Error("Error that will be stopped");
    } catch (error) {
      console.log("  ✓ Error handled here, not propagated");
      return "recovered value";
    }
  }

  // Continuing propagation (re-throwing)
  function continuePropagation() {
    try {
      throw new Error("Error that will propagate");
    } catch (error) {
      console.log("  ⚠️  Logging error, then re-throwing...");
      throw error; // Re-throw to propagate
    }
  }

  const result1 = stopPropagation();
  console.log("  Result after stopping:", result1);
  console.log();

  try {
    continuePropagation();
  } catch (error) {
    console.log("  ✗ Caught propagated error:", error.message);
  }
}, 300);

// ============================================
// 4. Error Boundaries Pattern
// ============================================

setTimeout(async () => {
  console.log("\n4. Error Boundaries Pattern:");

  // Error boundary wrapper
  async function errorBoundary(fn, fallback, logger = console.log) {
    try {
      return await fn();
    } catch (error) {
      logger(`  ⚠️  Error boundary caught: ${error.message}`);
      return fallback;
    }
  }

  // Risky operations
  async function fetchUser() {
    throw new Error("User service down");
  }

  async function fetchPosts() {
    return ["post1", "post2"];
  }

  // Each operation has its own boundary
  const user = await errorBoundary(fetchUser, { name: "Guest", id: 0 });

  const posts = await errorBoundary(fetchPosts, []);

  console.log("  Final state:", { user, posts });
  console.log("  (App continues despite user service failure)");
}, 500);

// ============================================
// 5. Centralized Error Handler
// ============================================

setTimeout(() => {
  console.log("\n5. Centralized Error Handler:");

  // Custom error types
  class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.name = this.constructor.name;
    }
  }

  class ValidationError extends AppError {
    constructor(message) {
      super(message, 400);
    }
  }

  class NotFoundError extends AppError {
    constructor(message) {
      super(message, 404);
    }
  }

  class DatabaseError extends AppError {
    constructor(message) {
      super(message, 500);
    }
  }

  // Centralized error handler
  function centralErrorHandler(error) {
    console.log("  📋 Central Error Handler:");

    if (error instanceof ValidationError) {
      console.log("    Type: Validation Error");
      console.log("    Status:", error.statusCode);
      console.log("    Message:", error.message);
      console.log("    Action: Return error to client");
    } else if (error instanceof NotFoundError) {
      console.log("    Type: Not Found");
      console.log("    Status:", error.statusCode);
      console.log("    Message:", error.message);
      console.log("    Action: Return 404 to client");
    } else if (error instanceof DatabaseError) {
      console.log("    Type: Database Error");
      console.log("    Status:", error.statusCode);
      console.log("    Message:", error.message);
      console.log("    Action: Log error, alert team, return generic message");
    } else if (error instanceof AppError) {
      console.log("    Type: Application Error");
      console.log("    Status:", error.statusCode);
      console.log("    Message:", error.message);
    } else {
      console.log("    Type: Unknown Error");
      console.log("    Message:", error.message);
      console.log("    Action: Log stack trace, return 500");
    }
  }

  // Simulate different errors
  centralErrorHandler(new ValidationError("Email is invalid"));
  console.log();
  centralErrorHandler(new NotFoundError("User not found"));
  console.log();
  centralErrorHandler(new DatabaseError("Connection timeout"));
  console.log();
  centralErrorHandler(new Error("Unexpected error"));
}, 700);

// ============================================
// 6. Domain-Specific Error Handling
// ============================================

setTimeout(async () => {
  console.log("\n6. Domain-Specific Error Handling:");

  // User domain
  class UserService {
    async getUser(id) {
      if (id < 0) {
        throw new Error("USER_INVALID_ID");
      }
      if (id > 1000) {
        throw new Error("USER_NOT_FOUND");
      }
      return { id, name: "John" };
    }

    handleError(error) {
      console.log("  🔹 User Service Error Handler:");
      switch (error.message) {
        case "USER_INVALID_ID":
          console.log("    → Invalid user ID provided");
          return { error: "Invalid ID", code: 400 };
        case "USER_NOT_FOUND":
          console.log("    → User does not exist");
          return { error: "User not found", code: 404 };
        default:
          console.log("    → Unknown user error");
          return { error: "Internal error", code: 500 };
      }
    }
  }

  // Payment domain
  class PaymentService {
    async processPayment(amount) {
      if (amount <= 0) {
        throw new Error("PAYMENT_INVALID_AMOUNT");
      }
      if (amount > 10000) {
        throw new Error("PAYMENT_LIMIT_EXCEEDED");
      }
      return { success: true, amount };
    }

    handleError(error) {
      console.log("  💳 Payment Service Error Handler:");
      switch (error.message) {
        case "PAYMENT_INVALID_AMOUNT":
          console.log("    → Invalid payment amount");
          return { error: "Invalid amount", code: 400 };
        case "PAYMENT_LIMIT_EXCEEDED":
          console.log("    → Payment exceeds limit");
          return { error: "Amount too large", code: 400 };
        default:
          console.log("    → Unknown payment error");
          return { error: "Payment failed", code: 500 };
      }
    }
  }

  const userService = new UserService();
  const paymentService = new PaymentService();

  // Test user service
  try {
    await userService.getUser(-1);
  } catch (error) {
    const response = userService.handleError(error);
    console.log("    Response:", response);
  }

  console.log();

  // Test payment service
  try {
    await paymentService.processPayment(0);
  } catch (error) {
    const response = paymentService.handleError(error);
    console.log("    Response:", response);
  }
}, 1100);

// ============================================
// 7. Error Context Enrichment
// ============================================

setTimeout(() => {
  console.log("\n7. Error Context Enrichment:");

  class ContextError extends Error {
    constructor(message) {
      super(message);
      this.context = {};
    }

    addContext(key, value) {
      this.context[key] = value;
      return this;
    }
  }

  function enrichError(error, context) {
    if (error instanceof ContextError) {
      Object.entries(context).forEach(([key, value]) => {
        error.addContext(key, value);
      });
    } else {
      // Wrap standard errors
      const contextError = new ContextError(error.message);
      contextError.stack = error.stack;
      Object.entries(context).forEach(([key, value]) => {
        contextError.addContext(key, value);
      });
      return contextError;
    }
    return error;
  }

  async function processOrder(orderId, userId) {
    try {
      throw new Error("Payment processing failed");
    } catch (error) {
      const enrichedError = enrichError(error, {
        orderId,
        userId,
        timestamp: new Date().toISOString(),
        operation: "processOrder",
      });

      console.log("  ✗ Error with context:");
      console.log("    Message:", enrichedError.message);
      console.log("    Context:", enrichedError.context);
    }
  }

  processOrder("ORD-123", "USR-456");
}, 1300);

// ============================================
// 8. Global Error Handlers
// ============================================

setTimeout(() => {
  console.log("\n8. Global Error Handlers:");

  // Uncaught exception handler
  const uncaughtHandler = (error) => {
    console.log("  🔥 Uncaught Exception:");
    console.log("    Message:", error.message);
    console.log("    Action: Log, alert, graceful shutdown");
  };

  // Unhandled rejection handler
  const unhandledRejectionHandler = (reason, promise) => {
    console.log("  ⚠️  Unhandled Promise Rejection:");
    console.log("    Reason:", reason);
    console.log("    Action: Log, alert");
  };

  // Register handlers
  process.on("uncaughtException", uncaughtHandler);
  process.on("unhandledRejection", unhandledRejectionHandler);

  console.log("  ✓ Global handlers registered");
  console.log("  (They catch errors that escape local handling)");

  // Cleanup
  setTimeout(() => {
    process.removeListener("uncaughtException", uncaughtHandler);
    process.removeListener("unhandledRejection", unhandledRejectionHandler);
  }, 100);
}, 1500);

// ============================================
// Summary
// ============================================

setTimeout(() => {
  console.log("\n=== Key Takeaways ===");
  console.log("✓ Errors propagate up the call stack");
  console.log("✓ Use error boundaries for graceful degradation");
  console.log("✓ Centralized handlers provide consistent error handling");
  console.log("✓ Domain-specific handlers understand business context");
  console.log("✓ Enrich errors with context for better debugging");
  console.log("✓ Global handlers catch escaping errors");
  console.log("✓ Re-throw errors to continue propagation");
  console.log("💡 Think about error propagation paths when designing!");
}, 1700);
