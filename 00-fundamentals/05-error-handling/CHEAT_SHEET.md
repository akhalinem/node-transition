# Error Handling Cheat Sheet

Quick reference for Node.js error handling patterns.

---

## 🎯 Quick Decision Tree

```
Is it synchronous code?
├─ YES → Use try-catch
└─ NO → Is it a callback?
    ├─ YES → Use error-first callback (err, data) => {}
    └─ NO → Is it a Promise?
        ├─ YES → Use .catch() or try-catch with await
        └─ Is it an EventEmitter/Stream?
            └─ YES → Listen for 'error' event
```

---

## 📚 Error Handling Patterns

### Synchronous Errors

```javascript
// Basic try-catch
try {
  const result = riskyOperation();
} catch (error) {
  console.error("Error:", error.message);
}

// With finally (cleanup)
try {
  openResource();
  useResource();
} catch (error) {
  handleError(error);
} finally {
  closeResource(); // Always runs
}
```

### Error-First Callbacks

```javascript
// Standard Node.js pattern
fs.readFile("file.txt", "utf8", (err, data) => {
  if (err) {
    console.error("Error:", err);
    return; // Always return early!
  }
  console.log("Data:", data);
});

// Creating your own
function asyncOperation(callback) {
  doSomethingAsync((err, result) => {
    if (err) return callback(err);
    return callback(null, result);
  });
}
```

### Promise Errors

```javascript
// Using .catch()
fetchData()
  .then(processData)
  .then(saveData)
  .catch((error) => {
    console.error("Error:", error);
  })
  .finally(() => {
    cleanup();
  });

// Promise creation
const promise = new Promise((resolve, reject) => {
  if (success) resolve(value);
  else reject(new Error("Failed"));
});
```

### Async/Await Errors

```javascript
// Basic try-catch
async function fetchUser(id) {
  try {
    const user = await db.getUser(id);
    return user;
  } catch (error) {
    console.error("Error:", error);
    throw error; // Re-throw or handle
  }
}

// Multiple operations
async function processOrder() {
  try {
    const user = await fetchUser();
    const product = await fetchProduct();
    const order = await createOrder(user, product);
    return order;
  } catch (error) {
    // Catches any error in the sequence
    handleError(error);
  }
}

// Parallel operations
async function fetchAll() {
  try {
    const [users, products] = await Promise.all([
      fetchUsers(),
      fetchProducts(),
    ]);
  } catch (error) {
    // First error will be caught
  }
}

// Graceful parallel (all or none)
async function fetchAllGraceful() {
  const results = await Promise.allSettled([fetchUsers(), fetchProducts()]);

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      console.log("Success:", result.value);
    } else {
      console.error("Failed:", result.reason);
    }
  });
}
```

---

## 🏗️ Custom Error Classes

### Basic Custom Error

```javascript
class CustomError extends Error {
  constructor(message) {
    super(message);
    this.name = "CustomError";
  }
}

throw new CustomError("Something went wrong");
```

### Error with Properties

```javascript
class ValidationError extends Error {
  constructor(message, field, value) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
    this.field = field;
    this.value = value;
  }
}

throw new ValidationError("Invalid email", "email", "test@");
```

### Error Hierarchy

```javascript
// Base application error
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Client errors (4xx)
class ClientError extends AppError {
  constructor(message, statusCode = 400) {
    super(message, statusCode);
  }
}

class ValidationError extends ClientError {
  constructor(message) {
    super(message, 400);
  }
}

class UnauthorizedError extends ClientError {
  constructor(message) {
    super(message, 401);
  }
}

class NotFoundError extends ClientError {
  constructor(message) {
    super(message, 404);
  }
}

// Server errors (5xx)
class ServerError extends AppError {
  constructor(message, statusCode = 500) {
    super(message, statusCode);
  }
}

class DatabaseError extends ServerError {
  constructor(message) {
    super(message, 500);
  }
}
```

---

## 🔄 Error Propagation

### Stopping Propagation (Handling)

```javascript
function handleError() {
  try {
    riskyOperation();
  } catch (error) {
    console.error("Handled:", error);
    return defaultValue; // Error stops here
  }
}
```

### Continuing Propagation (Re-throwing)

```javascript
function logAndPropagate() {
  try {
    riskyOperation();
  } catch (error) {
    console.error("Logging:", error);
    throw error; // Error continues up
  }
}
```

### Error Boundaries

```javascript
async function errorBoundary(fn, fallback) {
  try {
    return await fn();
  } catch (error) {
    console.error("Boundary caught:", error);
    return fallback;
  }
}

// Usage
const data = await errorBoundary(fetchData, { defaultValue: true });
```

---

## 🎨 Production Patterns

### Structured Logging

```javascript
class Logger {
  log(level, message, meta = {}) {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        ...meta,
      })
    );
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
}
```

### Circuit Breaker

```javascript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureThreshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.state = "CLOSED";
    this.nextAttempt = Date.now();
  }

  async execute(fn) {
    if (this.state === "OPEN") {
      if (Date.now() < this.nextAttempt) {
        throw new Error("Circuit breaker is OPEN");
      }
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
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}
```

### Retry with Backoff

```javascript
async function retry(fn, maxRetries = 3, baseDelay = 100) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = baseDelay * Math.pow(2, i);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Usage
const data = await retry(() => fetchData(), 5, 1000);
```

### Timeout

```javascript
async function withTimeout(promise, timeoutMs) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Timeout")), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

// Usage
const data = await withTimeout(fetchData(), 5000);
```

### Graceful Degradation

```javascript
async function fetchWithFallback() {
  try {
    return await primarySource.fetch();
  } catch (error) {
    console.warn("Primary failed, trying backup");
    try {
      return await backupSource.fetch();
    } catch (error) {
      console.error("Backup failed, using default");
      return defaultValue;
    }
  }
}
```

---

## 🌍 Global Handlers

```javascript
// Uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("UNCAUGHT EXCEPTION:", error);
  // Log to monitoring service
  // Graceful shutdown
  process.exit(1);
});

// Unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION:", reason);
  // Log to monitoring service
  // In Node 15+, this will exit the process
});

// Warnings
process.on("warning", (warning) => {
  console.warn("Warning:", warning);
});
```

---

## ⚠️ Common Pitfalls

### ❌ Wrong

```javascript
// Try-catch doesn't work with callbacks
try {
  setTimeout(() => {
    throw new Error('This is NOT caught');
  }, 100);
} catch (error) {
  // Never runs
}

// Forgetting await
try {
  fetchData(); // No await!
  console.log('Runs immediately');
} catch (error) {
  // Never catches the error
}

// Swallowing errors
.catch(error => {
  // Do nothing - BAD!
});

// Not returning in callback
if (err) {
  callback(err);
  // Code continues! May call callback twice!
}
```

### ✅ Correct

```javascript
// Async errors need async handling
setTimeout(() => {
  try {
    throw new Error('Now it works');
  } catch (error) {
    console.error(error);
  }
}, 100);

// Always await
try {
  await fetchData(); // Proper await
} catch (error) {
  // Catches the error
}

// Always handle or propagate
.catch(error => {
  console.error(error); // Log it
  throw error; // Or re-throw
});

// Always return after callback
if (err) {
  return callback(err);
}
// Safe - nothing after return
```

---

## 📊 Error Response Format

### Development

```javascript
{
  "error": {
    "name": "ValidationError",
    "message": "Email is invalid",
    "statusCode": 400,
    "field": "email",
    "value": "test@",
    "stack": "ValidationError: Email is invalid\n    at ..."
  }
}
```

### Production

```javascript
{
  "error": {
    "message": "Email is invalid",
    "code": "VALIDATION_ERROR",
    "statusCode": 400
  }
}
```

---

## 🔑 Key Principles

1. **Fail Fast** - Validate early, throw errors early
2. **Be Specific** - Use custom error classes
3. **Add Context** - Include relevant data in errors
4. **Log Everything** - But hide sensitive data
5. **Handle Gracefully** - Provide fallbacks
6. **Never Swallow** - Always log or re-throw
7. **User-Friendly** - Show helpful messages to users
8. **Monitor** - Track error rates and patterns

---

## 🚀 Quick Reference

| Context      | Pattern                 | Example                               |
| ------------ | ----------------------- | ------------------------------------- |
| Sync         | try-catch               | `try { ... } catch (e) { ... }`       |
| Callback     | Error-first             | `(err, data) => { if (err) ... }`     |
| Promise      | .catch()                | `promise.catch(e => ...)`             |
| Async/Await  | try-catch               | `try { await ... } catch (e) { ... }` |
| EventEmitter | .on('error')            | `emitter.on('error', e => ...)`       |
| Stream       | .on('error') + pipeline | `pipeline(..., err => ...)`           |

---

## 📖 Resources

- [Node.js Errors](https://nodejs.org/api/errors.html)
- [Error Handling Best Practices](https://www.joyent.com/node-js/production/design/errors)
- [Promise Error Handling](https://nodejs.org/api/process.html#process_event_unhandledrejection)
