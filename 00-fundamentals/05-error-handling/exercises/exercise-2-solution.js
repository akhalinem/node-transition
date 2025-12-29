/**
 * EXERCISE 2: Build Custom Error Hierarchy
 * Difficulty: ⭐⭐⭐
 *
 * Create a complete error hierarchy for an e-commerce application
 * with proper inheritance, custom properties, and error handling logic.
 */

console.log("=== Exercise 2: Custom Error Hierarchy ===\n");

// ============================================
// CHALLENGE 1: Base Error Classes
// ============================================

console.log("Challenge 1: Create Base Error Classes");
console.log("---------------------------------------");

/**
 * Task: Create a base ApplicationError class with:
 * - statusCode property
 * - isOperational flag (true for expected errors, false for bugs)
 * - timestamp
 * - toJSON() method for serialization
 * - toClientResponse() method for safe client responses
 */

class ApplicationError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super();
    this.message = message;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      error: {
        name: this.constructor.name,
        cause: this.cause,
        message: this.message,
        stack: this.stack,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        isOperational: this.isOperational,
      },
    };
  }

  toClientResponse() {
    return {
      error: {
        name: this.constructor.name,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
      },
    };
  }
}

/**
 * Task: Create ClientError (4xx) and ServerError (5xx) base classes
 * Both should extend ApplicationError
 */

class ClientError extends ApplicationError {
  constructor(message, statusCode = 400, isOperational = true) {
    super(message, statusCode, isOperational);
  }
}

class ServerError extends ApplicationError {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message, statusCode, isOperational);
  }
}

// Test your base classes
function testChallenge1() {
  try {
    const clientError = new ClientError("Invalid input", 400);
    const serverError = new ServerError("Database failed", 500);

    console.log("\n✓ ClientError created:");
    console.log(
      "  Is ApplicationError?",
      clientError instanceof ApplicationError
    );
    console.log("  Status:", clientError.statusCode);

    console.log("\n✓ ServerError created:");
    console.log(
      "  Is ApplicationError?",
      serverError instanceof ApplicationError
    );
    console.log("  Status:", serverError.statusCode);
  } catch (error) {
    console.log("✗ Test failed:", error.message);
  }
}

// Uncomment to test:
// testChallenge1();

// ============================================
// CHALLENGE 2: Specific Error Types
// ============================================

console.log("\nChallenge 2: Create Specific Error Types");
console.log("-----------------------------------------");

/**
 * Task: Create specific error classes for common scenarios:
 *
 * ValidationError - for input validation failures
 *   - Add: field, value, rule properties
 *
 * AuthenticationError - for login failures
 *   - Add: username, attempt properties
 *
 * AuthorizationError - for permission denials
 *   - Add: resource, action, userId properties
 *
 * NotFoundError - for missing resources
 *   - Add: resourceType, resourceId properties
 *
 * ConflictError - for duplicate resources
 *   - Add: field, value properties
 *
 * RateLimitError - for rate limiting
 *   - Add: limit, windowSeconds, retryAfter properties
 *
 * DatabaseError - for database failures
 *   - Add: query, dbCode properties
 *
 * ExternalServiceError - for third-party API failures
 *   - Add: service, endpoint, originalError properties
 */

class ValidationError extends ClientError {
  constructor(message, field, value, rule) {
    super(message);
    this.field = field;
    this.value = value;
    this.rule = rule;
  }
}

class AuthenticationError extends ClientError {
  constructor(message, username, attempts) {
    super(message, 401);
    this.username = username;
    this.attempts = attempts;
  }
}

class AuthorizationError extends ClientError {
  constructor(resource, action, userId) {
    super("Access Denied", 403);
    this.resource = resource;
    this.action = action;
    this.userId = userId;
  }
}

class NotFoundError extends ClientError {
  constructor(resourceType, resourceId) {
    super("Not Found", 404);
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

class ConflictError extends ClientError {
  constructor(field, value) {
    super("Conflict Error", 409);
    this.field = field;
    this.value = value;
  }
}

class RateLimitError extends ClientError {
  constructor(limit, windowSeconds, retryAfter) {
    super("Rate Limit Exceeded", 429);
    this.limit = limit;
    this.windowSeconds = windowSeconds;
    this.retryAfter = retryAfter;
  }
}

class DatabaseError extends ServerError {
  // Your implementation here (500)
  constructor(query, dbCode) {
    super("Database Error", 500);
    this.query = query;
    this.dbCode = dbCode;
  }
}

class ExternalServiceError extends ServerError {
  // Your implementation here (503)
  constructor(service, endpoint, originalError) {
    super("External Service Error");
    this.service = service;
    this.endpoint = endpoint;
    this.originalError = originalError;
  }
}

// Test your specific error classes
function testChallenge2() {
  try {
    const errors = [
      new ValidationError("Email is invalid", "email", "test@", "email_format"),
      new AuthenticationError("Invalid credentials", "john@example.com", 3),
      new NotFoundError("Product", 123),
      new RateLimitError(100, 60, 45),
      new DatabaseError(
        "Connection timeout",
        "SELECT * FROM users",
        "CONN_TIMEOUT"
      ),
    ];

    console.log("\n✓ All error types created successfully");
    errors.forEach((error) => {
      console.log(`  - ${error.name}: ${error.statusCode}`);
    });
  } catch (error) {
    console.log("✗ Test failed:", error.message);
  }
}

setTimeout(() => {
  // Uncomment to test:
  // testChallenge2();
}, 100);

// ============================================
// CHALLENGE 3: Error Handler
// ============================================

console.log("\nChallenge 3: Create Error Handler");
console.log("----------------------------------");

/**
 * Task: Create an ErrorHandler class that:
 * - Handles different error types appropriately
 * - Logs errors with appropriate severity
 * - Sends errors to monitoring service
 * - Returns proper HTTP responses
 * - Tracks error statistics
 */

class ErrorHandler {
  constructor() {
    this.errorCounts = new Map();
    this.logger = console; // In production, use real logger
  }

  handle(error) {
    // Log the error
    this.log(error);
    // Track statistics
    // Send to monitoring
    this.track(error);
    // Return response object
    return this.getResponse(error);
  }

  log(error) {
    // Different log levels for different errors

    // ClientError -> warn
    if (error instanceof ClientError) {
      this.logger.warn(JSON.stringify(error.toJSON(), null, 2));
    }

    // ServerError -> error
    if (error instanceof ServerError) {
      this.logger.error(JSON.stringify(error.toJSON(), null, 2));
    }

    if (!(error instanceof ApplicationError) && error instanceof Error) {
      // Generic Error -> error
      this.logger.error(JSON.stringify({ error: error.toString() }, null, 2));
    }

    // Unknown -> error
    this.logger.error(error);
  }

  getResponse(error) {
    // Return safe response for client
    // Include: statusCode, message, errorCode, etc.
    // Don't expose internal details in production

    if (error instanceof ApplicationError) {
      return error.toClientResponse();
    }

    return error.toString();
  }

  track(error) {
    // Count error occurrences by type
    if (error instanceof Error) {
      this.errorCounts.set(
        error.constructor.name,
        this.errorCounts.get(error.constructor.name) + 1 || 1
      );
    } else {
      this.errorCounts.set(
        "UnknownError",
        this.errorCounts.get("UnknownError") + 1 || 1
      );
    }

    // In production: send to monitoring service
    if (process.env.NODE_ENV === "production") {
      throw new Error("Not implemented");
    }
  }

  getStats() {
    // Return error statistics
    return this.errorCounts.entries();
  }
}

// Test your error handler
function testChallenge3() {
  try {
    const handler = new ErrorHandler();

    const errors = [
      new ValidationError("Invalid input", "email"),
      new NotFoundError("User", 123),
      new DatabaseError("Connection failed"),
      new ValidationError("Required field", "name"),
    ];

    console.log("\n✓ Handling errors:");
    errors.forEach((error) => {
      const response = handler.handle(error);
      console.log(`  ${error.name}:`, response);
    });

    console.log("\n✓ Error statistics:");
    console.log(handler.getStats());
  } catch (error) {
    console.log("✗ Test failed:", error.message);
  }
}

setTimeout(() => {
  // Uncomment to test:
  // testChallenge3();
}, 200);

// ============================================
// CHALLENGE 4: Real-World Scenario
// ============================================

console.log("\nChallenge 4: E-commerce Order Processing");
console.log("-----------------------------------------");

/**
 * Task: Implement an order processing system that uses your error hierarchy.
 *
 * The system should:
 * - Validate order data
 * - Check user authentication
 * - Verify user has permission
 * - Check product availability
 * - Process payment (may fail)
 * - Update inventory (database operation)
 *
 * Use appropriate error types for each failure scenario.
 */

class OrderService {
  constructor() {
    this.errorHandler = new ErrorHandler();
    this.inventory = new Map([
      ["PROD-1", 10],
      ["PROD-2", 5],
      ["PROD-3", 0],
    ]);
  }

  validateOrder(order) {
    if (order.quantity <= 0) {
      throw new ValidationError(
        "Quantity cannot be less or equal to 0",
        "quantity",
        order.quantity,
        "min"
      );
    }

    if (!/^PROD-\d+$/.test(order.productId)) {
      throw new ValidationError(
        "Invalid productId format",
        "productId",
        order.productId,
        "format"
      );
    }

    return true;
  }

  checkAuth(userId, token) {
    if (Math.random() < 0.1) {
      throw new AuthenticationError("Invalid User", userId);
    }

    return true;
  }

  checkPermission(userId, action) {
    if (Math.random() < 0.1) {
      throw new AuthorizationError("Product", action, userId);
    }

    return true;
  }

  checkAvailability(productId, quantity) {
    if (!this.inventory.has(productId)) {
      throw new NotFoundError("Product", productId);
    }

    const stock = this.inventory.get(productId);
    if (stock < quantity) {
      throw new ConflictError("quantity", stock);
    }

    return true;
  }

  async processPayment(amount, paymentMethod) {
    if (Math.random() < 0.2) {
      throw new ExternalServiceError("PaymentGateway", "/charge", "Timeout");
    }

    return true;
  }

  async updateInventory(productId, quantity) {
    try {
      this.inventory.set(productId, this.inventory.get(productId) - quantity);
    } catch (e) {
      throw new DatabaseError(e.message, e.cause);
    }
  }

  async processOrder(order, userId, token) {
    try {
      if (!this.checkAuth(userId, token)) {
        return;
      }

      if (!this.checkPermission(userId, "order")) {
        return;
      }

      if (!this.validateOrder(order)) {
        return;
      }

      if (!this.checkAvailability(order.productId, order.quantity)) {
        return;
      }

      await this.processPayment(100, "Visa");
      await this.updateInventory(order.productId, order.quantity);

      return true;
    } catch (e) {
      if (e instanceof ApplicationError) {
        throw e;
      }

      throw new Error("Unknown error", { cause: e });
    }
  }
}

// Test your implementation
async function testChallenge4() {
  const service = new OrderService();

  const testOrders = [
    {
      name: "Valid order",
      order: { productId: "PROD-1", quantity: 2 },
      userId: "USER-1",
      token: "valid-token",
    },
    {
      name: "Invalid quantity",
      order: { productId: "PROD-1", quantity: -1 },
      userId: "USER-1",
      token: "valid-token",
    },
    {
      name: "Product not found",
      order: { productId: "PROD-999", quantity: 1 },
      userId: "USER-1",
      token: "valid-token",
    },
    {
      name: "Out of stock",
      order: { productId: "PROD-3", quantity: 1 },
      userId: "USER-1",
      token: "valid-token",
    },
  ];

  console.log("\n✓ Processing test orders:");
  for (const test of testOrders) {
    console.log(`\n  ${test.name}:`);
    try {
      const result = await service.processOrder(
        test.order,
        test.userId,
        test.token
      );
      console.log("  ✓ Success:", result);
    } catch (error) {
      const response = service.errorHandler.handle(error);
      console.log("  ✗ Error:", response);
    }
  }

  console.log("\n✓ Final statistics:");
  console.log(service.errorHandler.getStats());
}

setTimeout(() => {
  // Uncomment to test:
  testChallenge4();
}, 300);

// // ============================================
// // HINTS & SOLUTIONS
// // ============================================

// setTimeout(() => {
//   console.log("\n\n=== HINTS ===\n");

//   console.log("Hint 1: ApplicationError base class");
//   console.log("- Use Error.captureStackTrace(this, this.constructor)");
//   console.log("- Set this.name = this.constructor.name");
//   console.log("- isOperational should default to true");
//   console.log();

//   console.log("Hint 2: Custom properties");
//   console.log("- Store them as instance properties in constructor");
//   console.log("- Include them in toJSON() for logging");
//   console.log("- Be careful what you include in toClientResponse()");
//   console.log();

//   console.log("Hint 3: Error Handler");
//   console.log("- Use instanceof to check error types");
//   console.log("- Map error types to HTTP status codes");
//   console.log("- Use Map for tracking error counts");
//   console.log();

//   console.log("Hint 4: Order Processing");
//   console.log("- Validate early, fail fast");
//   console.log("- Each validation should throw appropriate error type");
//   console.log("- Wrap the entire process in try-catch");
//   console.log("- Let the error handler format the response");
//   console.log();

//   console.log("For complete solutions, check the solutions file or:");
//   console.log("https://nodejs.org/api/errors.html");
// }, 400);

// console.log("\n=== Getting Started ===");
// console.log("1. Implement the base error classes first");
// console.log("2. Then create specific error types");
// console.log("3. Build the error handler");
// console.log("4. Finally, implement the order service");
// console.log("5. Test each challenge as you go");
// console.log("6. Run: node exercise-2-error-hierarchy.js\n");
