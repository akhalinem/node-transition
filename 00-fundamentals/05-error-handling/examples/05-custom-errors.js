/**
 * 05 - Custom Error Classes
 *
 * Learn how to create custom error classes for better error handling
 * and more meaningful error messages in your applications.
 */

console.log("=== Custom Error Classes ===\n");

// ============================================
// 1. Basic Custom Error
// ============================================

console.log("1. Basic Custom Error:");

class CustomError extends Error {
  constructor(message) {
    super(message);
    this.name = "CustomError";
  }
}

try {
  throw new CustomError("This is a custom error");
} catch (error) {
  console.log("  Type:", error.name);
  console.log("  Message:", error.message);
  console.log("  Is CustomError?", error instanceof CustomError);
  console.log("  Is Error?", error instanceof Error);
}

console.log();

// ============================================
// 2. Error with Additional Properties
// ============================================

console.log("2. Error with Additional Properties:");

class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
    this.timestamp = new Date();
  }
}

class NotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} with id ${id} not found`);
    this.name = "NotFoundError";
    this.resource = resource;
    this.id = id;
    this.statusCode = 404;
  }
}

try {
  throw new ValidationError("Email is invalid", "email");
} catch (error) {
  console.log("  Type:", error.name);
  console.log("  Message:", error.message);
  console.log("  Field:", error.field);
  console.log("  Timestamp:", error.timestamp.toISOString());
}

console.log();

try {
  throw new NotFoundError("User", 123);
} catch (error) {
  console.log("  Type:", error.name);
  console.log("  Message:", error.message);
  console.log("  Resource:", error.resource);
  console.log("  ID:", error.id);
  console.log("  Status Code:", error.statusCode);
}

console.log();

// ============================================
// 3. Error Hierarchy
// ============================================

console.log("3. Error Hierarchy:");

// Base application error
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true; // Operational vs programmer error
    Error.captureStackTrace(this, this.constructor);
  }
}

// Client errors (4xx)
class ClientError extends AppError {
  constructor(message, statusCode = 400) {
    super(message, statusCode);
  }
}

// Server errors (5xx)
class ServerError extends AppError {
  constructor(message, statusCode = 500) {
    super(message, statusCode);
  }
}

// Specific client errors
class BadRequestError extends ClientError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

class UnauthorizedError extends ClientError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

class ForbiddenError extends ClientError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

class ResourceNotFoundError extends ClientError {
  constructor(resource, id) {
    super(`${resource} with id ${id} not found`, 404);
    this.resource = resource;
    this.id = id;
  }
}

// Specific server errors
class DatabaseError extends ServerError {
  constructor(message, query = null) {
    super(message, 500);
    this.query = query;
  }
}

class ExternalServiceError extends ServerError {
  constructor(service, message) {
    super(`External service ${service} failed: ${message}`, 503);
    this.service = service;
  }
}

// Test the hierarchy
const errors = [
  new BadRequestError("Invalid input"),
  new UnauthorizedError(),
  new ResourceNotFoundError("Product", 456),
  new DatabaseError("Connection failed", "SELECT * FROM users"),
  new ExternalServiceError("PaymentAPI", "Timeout"),
];

errors.forEach((error) => {
  console.log(`  ${error.name}:`);
  console.log(`    Message: ${error.message}`);
  console.log(`    Status: ${error.statusCode}`);
  console.log(`    Is AppError: ${error instanceof AppError}`);
  console.log(`    Is ClientError: ${error instanceof ClientError}`);
  console.log(`    Is ServerError: ${error instanceof ServerError}`);
  console.log();
});

// ============================================
// 4. Handling Different Error Types
// ============================================

console.log("4. Handling Different Error Types:");

function handleError(error) {
  if (error instanceof ValidationError) {
    console.log(`  ⚠️  Validation failed on field: ${error.field}`);
  } else if (error instanceof ResourceNotFoundError) {
    console.log(`  ⚠️  Resource not found: ${error.resource} #${error.id}`);
  } else if (error instanceof DatabaseError) {
    console.log(`  🔥 Database error: ${error.message}`);
    console.log(`     Query: ${error.query}`);
  } else if (error instanceof ClientError) {
    console.log(`  ⚠️  Client error (${error.statusCode}): ${error.message}`);
  } else if (error instanceof ServerError) {
    console.log(`  🔥 Server error (${error.statusCode}): ${error.message}`);
  } else if (error instanceof AppError) {
    console.log(`  ⚠️  Application error: ${error.message}`);
  } else {
    console.log(`  ❌ Unknown error: ${error.message}`);
  }
}

handleError(new ValidationError("Invalid email", "email"));
handleError(new ResourceNotFoundError("Order", 789));
handleError(new DatabaseError("Timeout", "UPDATE products SET ..."));
handleError(new UnauthorizedError());
handleError(new Error("Unexpected error"));

console.log();

// ============================================
// 5. Async Custom Errors
// ============================================

console.log("5. Custom Errors with Async/Await:");

async function getUserById(id) {
  // Simulate database lookup
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (id < 0) {
    throw new BadRequestError("User ID must be positive");
  }

  if (id > 1000) {
    throw new ResourceNotFoundError("User", id);
  }

  if (id === 500) {
    throw new DatabaseError("Connection lost", "SELECT * FROM users");
  }

  return { id, name: "John Doe", email: "john@example.com" };
}

async function testAsyncErrors() {
  const testCases = [-1, 500, 1001, 100];

  for (const id of testCases) {
    try {
      console.log(`  → Fetching user ${id}...`);
      const user = await getUserById(id);
      console.log(`  ✓ Success:`, user);
    } catch (error) {
      handleError(error);
    }
    console.log();
  }
}

setTimeout(() => {
  testAsyncErrors();
}, 100);

// ============================================
// 6. Error Factory Pattern
// ============================================

setTimeout(() => {
  console.log("6. Error Factory Pattern:");

  class ErrorFactory {
    static badRequest(message = "Bad Request") {
      return new BadRequestError(message);
    }

    static unauthorized(message = "Unauthorized") {
      return new UnauthorizedError(message);
    }

    static notFound(resource, id) {
      return new ResourceNotFoundError(resource, id);
    }

    static database(message, query) {
      return new DatabaseError(message, query);
    }

    static externalService(service, message) {
      return new ExternalServiceError(service, message);
    }
  }

  // Usage
  try {
    throw ErrorFactory.notFound("Post", 123);
  } catch (error) {
    console.log("  Created via factory:", error.message);
  }

  try {
    throw ErrorFactory.database("Timeout", "SELECT ...");
  } catch (error) {
    console.log("  Created via factory:", error.message);
  }
}, 800);

// ============================================
// 7. Error Serialization for APIs
// ============================================

setTimeout(() => {
  console.log("\n7. Error Serialization for APIs:");

  class ApiError extends AppError {
    toJSON() {
      return {
        error: {
          name: this.name,
          message: this.message,
          statusCode: this.statusCode,
          timestamp: new Date().toISOString(),
          // Include stack trace only in development
          ...(process.env.NODE_ENV === "development" && {
            stack: this.stack,
          }),
        },
      };
    }
  }

  class ApiNotFoundError extends ApiError {
    constructor(resource, id) {
      super(`${resource} not found`, 404);
      this.resource = resource;
      this.id = id;
    }

    toJSON() {
      return {
        ...super.toJSON(),
        error: {
          ...super.toJSON().error,
          resource: this.resource,
          id: this.id,
        },
      };
    }
  }

  const error = new ApiNotFoundError("Product", 999);
  console.log("  API Response:", JSON.stringify(error.toJSON(), null, 2));
}, 1000);

// ============================================
// Summary
// ============================================

setTimeout(() => {
  console.log("\n=== Key Takeaways ===");
  console.log("✓ Extend Error class for custom errors");
  console.log("✓ Add meaningful properties (statusCode, field, etc.)");
  console.log("✓ Create error hierarchies for better organization");
  console.log("✓ Use instanceof to handle specific error types");
  console.log("✓ Error factories provide clean error creation");
  console.log("✓ Serialize errors properly for API responses");
  console.log("💡 Custom errors make your code more maintainable!");
}, 1200);
