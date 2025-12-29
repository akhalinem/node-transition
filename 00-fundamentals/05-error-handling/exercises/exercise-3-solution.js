/**
 * EXERCISE 3: Error Handling Middleware
 * Difficulty: ⭐⭐⭐
 *
 * Build a complete error handling middleware system for Express-like applications.
 * This simulates real-world API error handling.
 */

console.log("=== Exercise 3: Error Handling Middleware ===\n");

// ============================================
// SETUP: Simulated Express-like Framework
// ============================================

// Simplified request/response objects
class Request {
  constructor(data) {
    this.method = data.method || "GET";
    this.path = data.path || "/";
    this.body = data.body || {};
    this.headers = data.headers || {};
    this.params = data.params || {};
    this.query = data.query || {};
  }
}

class Response {
  constructor() {
    this.statusCode = 200;
    this.body = null;
    this.headers = {};
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  json(data) {
    this.body = data;
    return this;
  }

  send(data) {
    this.body = data;
    return this;
  }

  header(name, value) {
    this.headers[name] = value;
    return this;
  }
}

// Simplified middleware runner
class App {
  constructor() {
    this.middlewares = [];
    this.errorHandlers = [];
  }

  use(fn) {
    if (fn.length === 4) {
      this.errorHandlers.push(fn);
    } else {
      this.middlewares.push(fn);
    }
  }

  async handle(req) {
    const res = new Response();
    let error = null;

    // Run middlewares
    for (const middleware of this.middlewares) {
      try {
        await middleware(req, res, (err) => {
          if (err) error = err;
        });
        if (error) break;
      } catch (err) {
        error = err;
        break;
      }
    }

    // Run error handlers if there was an error
    if (error) {
      for (const handler of this.errorHandlers) {
        try {
          await handler(error, req, res, () => {});
        } catch (err) {
          console.error("Error in error handler:", err);
        }
      }
    }

    return res;
  }
}

// ============================================
// CHALLENGE 1: Request Validation Middleware
// ============================================

console.log("Challenge 1: Request Validation Middleware");
console.log("------------------------------------------");

/**
 * Task: Create middleware that validates incoming requests
 * - Check required fields
 * - Validate data types
 * - Validate formats (email, etc.)
 * - Pass validation errors to error handler
 */

class ValidationError extends Error {
  constructor(message, field, value) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
    this.field = field;
    this.value = value;
  }
}

function validateRequest(schema) {
  return async (req, res, next) => {
    for (field in schema) {
      switch (schema[field]) {
        case "email":
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body[field])) {
            throw new ValidationError("Invalid email", field, req.body[field]);
          }

          break;

        case "number":
          if (Number.isNaN(req.body[field])) {
            throw new ValidationError("Invalid number", field, req.body[field]);
          }

          break;
      }
    }

    next();
  };
}

// Test your validation middleware
function testChallenge1() {
  const app = new App();

  // Add validation middleware
  app.use(
    validateRequest({
      email: "email",
      age: "number",
    })
  );

  // Test cases
  const testRequests = [
    new Request({ body: { email: "test@example.com", age: 25 } }),
    new Request({ body: { email: "invalid-email", age: 25 } }),
    new Request({ body: { email: "test@example.com", age: "not-a-number" } }),
  ];

  console.log("\n✓ Testing validation:");
  // Uncomment to test
  testRequests.forEach(async (req, i) => {
    const res = await app.handle(req);
    console.log(`  Request ${i + 1}:`, res.statusCode, res.body);
  });
}

// Uncomment to test:
// testChallenge1();

// ============================================
// CHALLENGE 2: Error Logging Middleware
// ============================================

console.log("\nChallenge 2: Error Logging Middleware");
console.log("--------------------------------------");

/**
 * Task: Create middleware that logs errors with context
 * - Log different levels based on error type
 * - Include request details
 * - Include stack traces for server errors
 * - Format for easy parsing
 */

class Logger {
  log(level, message, meta = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    };
    console.log(JSON.stringify(entry, null, 2));
  }

  error(message, error, meta = {}) {
    this.log("error", message, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      ...meta,
    });
  }

  warn(message, meta = {}) {
    this.log("warn", message, meta);
  }
}

// TODO: Implement error logging middleware
function errorLogger(logger) {
  return (error, req, res, next) => {
    // Log error with request context
    // Include: method, path, body, headers
    // Use appropriate log level
    const meta = {
      method: req.method,
      path: req.path,
      body: req.body,
      headers: req.headers,
    };

    logger.error("An error occurred", error, meta);

    next(error); // Pass to next error handler
  };
}

// Test your logging middleware
function testChallenge2() {
  const app = new App();
  const logger = new Logger();

  // Add middleware that throws error
  app.use(async (req, res, next) => {
    next(new Error("Test error"));
  });

  // Add logging middleware
  app.use(errorLogger(logger));

  console.log("\n✓ Testing error logger:");
  // Uncomment to test
  const req = new Request({ method: "POST", path: "/api/test" });
  app.handle(req);
}

setTimeout(() => {
  // Uncomment to test:
  // testChallenge2();
}, 100);

// ============================================
// CHALLENGE 3: Error Response Formatter
// ============================================

console.log("\nChallenge 3: Error Response Formatter");
console.log("--------------------------------------");

/**
 * Task: Create middleware that formats error responses
 * - Convert errors to JSON responses
 * - Include appropriate status codes
 * - Hide sensitive information in production
 * - Include error codes for client handling
 * - Add helpful messages
 */

function errorResponseFormatter(options = {}) {
  const { includeStack = false, includeContext = false } = options;

  return (error, req, res, next) => {
    // Format error for client response
    // Set appropriate status code
    // Create JSON response
    // Consider environment (dev vs prod)
    const statusCode = error.statusCode || 500;
    const response = {
      error: {
        message:
          statusCode === 500
            ? "An internal server error occurred"
            : error.message,
        code: error.name || "Error",
      },
    };

    if (includeStack && error.stack) {
      response.error.stack = error.stack;
    }

    if (includeContext) {
      response.error.context = {
        method: req.method,
        path: req.path,
        body: req.body,
        headers: req.headers,
      };
    }

    res.status(statusCode).json(response);
  };
}

// Test your formatter
function testChallenge3() {
  const app = new App();

  // Middleware that throws different errors
  app.use(async (req, res, next) => {
    const errorType = req.path;
    switch (errorType) {
      case "/validation":
        next(new ValidationError("Invalid email", "email", "test"));
        break;
      case "/notfound":
        const err = new Error("Resource not found");
        err.statusCode = 404;
        next(err);
        break;
      default:
        next(new Error("Internal server error"));
    }
  });

  // Add formatter
  app.use(errorResponseFormatter({ includeStack: true }));

  console.log("\n✓ Testing error formatter:");
  // Uncomment to test
  ["/validation", "/notfound", "/error"].forEach(async (path) => {
    const req = new Request({ path });
    const res = await app.handle(req);
    console.log(`  ${path}:`, res.statusCode, res.body);
  });
}

setTimeout(() => {
  // Uncomment to test:
  // testChallenge3();
}, 200);

// ============================================
// CHALLENGE 4: Complete Error Handling System
// ============================================

console.log("\nChallenge 4: Complete Error Handling System");
console.log("--------------------------------------------");

/**
 * Task: Build a complete error handling system with:
 * - Custom error classes
 * - Async error wrapper
 * - Validation middleware
 * - Authentication middleware
 * - Error logging
 * - Error response formatting
 * - Error recovery
 * - Monitoring/alerting
 */

// Custom errors
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401);
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404);
    this.resource = resource;
  }
}

function asyncHandler(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

function authenticate(req, res, next) {
  // Check for auth token
  const token = req.headers["authorization"];
  if (!token) {
    next(new AuthenticationError("No token provided"));
    return;
  }

  // Validate token
  if (token === "valid-token") {
    next();
    return;
  }

  // Throw AuthenticationError if invalid
  next(new AuthenticationError("Invalid token"));
}

class ErrorMonitor {
  constructor() {
    this.errors = [];
  }

  track(error, req) {
    this.errors.push({ error, req, timestamp: new Date() });

    const errorCount = this.errors.filter((e) => e.req === req).length;
    if (errorCount > 5) {
      console.warn("Potential abuse detected!");
    }

    if (this.errors.length > 100) {
      console.warn("High error rate detected!");
    }
  }

  getStats() {
    return {
      total: this.errors.length,
      byStatus: this.errors.reduce((acc, { error }) => {
        acc[error.statusCode] = (acc[error.statusCode] || 0) + 1;
        return acc;
      }, {}),
    };
  }
}

function createErrorHandler(options = {}) {
  const logger = new Logger();
  const monitor = new ErrorMonitor();

  return (error, req, res, next) => {
    logger.log(options.level, "Handling error", {
      method: req.method,
      url: req.url,
      body: req.body,
      params: req.params,
      query: req.query,
      error,
    });
    monitor.track(error, req);
    if (error.statusCode === 500) {
      // Send alert to monitoring service
    }
  };
}

// Test complete system
async function testChallenge4() {
  const app = new App();

  // Business logic
  const userService = {
    async getUser(id) {
      if (id === "1") return { id: "1", name: "John" };
      throw new NotFoundError("User");
    },

    async createUser(data) {
      if (!data.email) {
        throw new ValidationError("Email required", "email");
      }
      return { id: "2", ...data };
    },
  };

  // Routes
  app.use(
    asyncHandler(async (req, res, next) => {
      if (req.path === "/users/:id") {
        const user = await userService.getUser(req.params.id);
        res.json(user);
      } else if (req.path === "/users" && req.method === "POST") {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
      } else {
        next();
      }
    })
  );

  // Error handling
  app.use(
    createErrorHandler({
      includeStack: true,
      logLevel: "debug",
    })
  );

  app.use(errorResponseFormatter({}));

  console.log("\n✓ Testing complete system:");

  const testRequests = [
    new Request({ path: "/users/:id", params: { id: "1" } }),
    new Request({ path: "/users/:id", params: { id: "999" } }),
    new Request({ method: "POST", path: "/users", body: {} }),
    new Request({
      method: "POST",
      path: "/users",
      body: { email: "test@example.com" },
    }),
  ];

  // Uncomment to test
  for (const req of testRequests) {
    const res = await app.handle(req);
    console.log(`  ${req.method} ${req.path}:`, res.statusCode);
    console.log("   ", JSON.stringify(res.body));
  }
}

setTimeout(() => {
  // Uncomment to test:
  // testChallenge4();
}, 300);

// // ============================================
// // HINTS & BEST PRACTICES
// // ============================================

// setTimeout(() => {
//   console.log("\n\n=== HINTS & BEST PRACTICES ===\n");

//   console.log("1. Validation Middleware:");
//   console.log("   - Create reusable validators for common types");
//   console.log("   - Return early with clear error messages");
//   console.log("   - Include field name and value in errors");
//   console.log();

//   console.log("2. Error Logging:");
//   console.log("   - Use structured logging (JSON)");
//   console.log("   - Include request ID for tracking");
//   console.log("   - Log different levels: error, warn, info");
//   console.log("   - Include stack traces for server errors");
//   console.log();

//   console.log("3. Error Responses:");
//   console.log("   - Never expose stack traces in production");
//   console.log("   - Use consistent error format");
//   console.log("   - Include error codes for programmatic handling");
//   console.log("   - Provide helpful messages");
//   console.log();

//   console.log("4. Async Handling:");
//   console.log("   - Always wrap async route handlers");
//   console.log("   - Use try-catch or .catch()");
//   console.log("   - Pass errors to next()");
//   console.log();

//   console.log("5. Error Monitoring:");
//   console.log("   - Track error rates");
//   console.log("   - Set up alerts for spikes");
//   console.log("   - Group errors by type");
//   console.log("   - Send to monitoring service (Sentry, DataDog)");
//   console.log();

//   console.log("6. Production Considerations:");
//   console.log("   - Distinguish operational vs programmer errors");
//   console.log("   - Graceful shutdown on programmer errors");
//   console.log("   - Return generic messages for server errors");
//   console.log("   - Log full details for debugging");
// }, 400);

// console.log("\n=== Getting Started ===");
// console.log("1. Start with validation middleware");
// console.log("2. Add logging middleware");
// console.log("3. Build response formatter");
// console.log("4. Integrate everything into complete system");
// console.log("5. Test with various error scenarios");
// console.log("6. Run: node exercise-3-error-middleware.js\n");
