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

// TODO: Implement ApplicationError class
class ApplicationError extends Error {
  // Your implementation here
}

/**
 * Task: Create ClientError (4xx) and ServerError (5xx) base classes
 * Both should extend ApplicationError
 */

// TODO: Implement ClientError class (statusCode default 400)
class ClientError extends ApplicationError {
  // Your implementation here
}

// TODO: Implement ServerError class (statusCode default 500)
class ServerError extends ApplicationError {
  // Your implementation here
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

setTimeout(() => {
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

  // TODO: Implement all specific error classes

  class ValidationError extends ClientError {
    // Your implementation here
  }

  class AuthenticationError extends ClientError {
    // Your implementation here (401)
  }

  class AuthorizationError extends ClientError {
    // Your implementation here (403)
  }

  class NotFoundError extends ClientError {
    // Your implementation here (404)
  }

  class ConflictError extends ClientError {
    // Your implementation here (409)
  }

  class RateLimitError extends ClientError {
    // Your implementation here (429)
  }

  class DatabaseError extends ServerError {
    // Your implementation here (500)
  }

  class ExternalServiceError extends ServerError {
    // Your implementation here (503)
  }

  // Test your specific error classes
  function testChallenge2() {
    try {
      const errors = [
        new ValidationError(
          "Email is invalid",
          "email",
          "test@",
          "email_format"
        ),
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

  // Uncomment to test:
  // testChallenge2();
}, 100);

// ============================================
// CHALLENGE 3: Error Handler
// ============================================

setTimeout(() => {
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

    // TODO: Implement handle method
    handle(error) {
      // Log the error
      // Track statistics
      // Send to monitoring
      // Return response object
      throw new Error("Not implemented");
    }

    // TODO: Implement log method
    log(error) {
      // Different log levels for different errors
      // ClientError -> warn
      // ServerError -> error
      // Unknown -> error
      throw new Error("Not implemented");
    }

    // TODO: Implement getResponse method
    getResponse(error) {
      // Return safe response for client
      // Include: statusCode, message, errorCode, etc.
      // Don't expose internal details in production
      throw new Error("Not implemented");
    }

    // TODO: Implement track method
    track(error) {
      // Count error occurrences by type
      // In production: send to monitoring service
      throw new Error("Not implemented");
    }

    // TODO: Implement getStats method
    getStats() {
      // Return error statistics
      throw new Error("Not implemented");
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

  // Uncomment to test:
  // testChallenge3();
}, 200);

// ============================================
// CHALLENGE 4: Real-World Scenario
// ============================================

setTimeout(() => {
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

    // TODO: Implement validateOrder
    validateOrder(order) {
      // Check required fields
      // Validate quantity > 0
      // Validate productId format
      // Throw ValidationError if invalid
      throw new Error("Not implemented");
    }

    // TODO: Implement checkAuth
    checkAuth(userId, token) {
      // Simulate auth check
      // Throw AuthenticationError if invalid
      throw new Error("Not implemented");
    }

    // TODO: Implement checkPermission
    checkPermission(userId, action) {
      // Simulate permission check
      // Throw AuthorizationError if denied
      throw new Error("Not implemented");
    }

    // TODO: Implement checkAvailability
    checkAvailability(productId, quantity) {
      // Check inventory
      // Throw NotFoundError if product doesn't exist
      // Throw ConflictError if insufficient stock
      throw new Error("Not implemented");
    }

    // TODO: Implement processPayment
    async processPayment(amount, paymentMethod) {
      // Simulate payment processing
      // Throw ExternalServiceError if payment fails
      throw new Error("Not implemented");
    }

    // TODO: Implement updateInventory
    async updateInventory(productId, quantity) {
      // Update inventory
      // Throw DatabaseError if update fails
      throw new Error("Not implemented");
    }

    // TODO: Implement processOrder (main method)
    async processOrder(order, userId, token) {
      // Use all the methods above
      // Handle errors appropriately
      // Return success response or error response
      throw new Error("Not implemented");
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

  // Uncomment to test:
  // testChallenge4();
}, 300);

// ============================================
// HINTS & SOLUTIONS
// ============================================

setTimeout(() => {
  console.log("\n\n=== HINTS ===\n");

  console.log("Hint 1: ApplicationError base class");
  console.log("- Use Error.captureStackTrace(this, this.constructor)");
  console.log("- Set this.name = this.constructor.name");
  console.log("- isOperational should default to true");
  console.log();

  console.log("Hint 2: Custom properties");
  console.log("- Store them as instance properties in constructor");
  console.log("- Include them in toJSON() for logging");
  console.log("- Be careful what you include in toClientResponse()");
  console.log();

  console.log("Hint 3: Error Handler");
  console.log("- Use instanceof to check error types");
  console.log("- Map error types to HTTP status codes");
  console.log("- Use Map for tracking error counts");
  console.log();

  console.log("Hint 4: Order Processing");
  console.log("- Validate early, fail fast");
  console.log("- Each validation should throw appropriate error type");
  console.log("- Wrap the entire process in try-catch");
  console.log("- Let the error handler format the response");
  console.log();

  console.log("For complete solutions, check the solutions file or:");
  console.log("https://nodejs.org/api/errors.html");
}, 400);

console.log("\n=== Getting Started ===");
console.log("1. Implement the base error classes first");
console.log("2. Then create specific error types");
console.log("3. Build the error handler");
console.log("4. Finally, implement the order service");
console.log("5. Test each challenge as you go");
console.log("6. Run: node exercise-2-error-hierarchy.js\n");
