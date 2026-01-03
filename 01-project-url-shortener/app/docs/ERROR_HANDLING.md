# Error Handling Documentation

## Overview

The application uses a **centralized error handling system** with custom error classes and middleware for consistent error responses across all endpoints.

## Architecture

### 1. Custom Error Classes (`src/utils/errors.js`)

All custom errors extend from `ApiError` base class:

```javascript
class ApiError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
  }
}
```

**Available Error Classes:**

| Error Class               | Status Code | Use Case                           |
| ------------------------- | ----------- | ---------------------------------- |
| `BadRequestError`         | 400         | Invalid input, validation failures |
| `NotFoundError`           | 404         | Resource not found                 |
| `ConflictError`           | 409         | Duplicate custom alias             |
| `GoneError`               | 410         | Expired short URL                  |
| `PayloadTooLargeError`    | 413         | Request body too large             |
| `TooManyRequestsError`    | 429         | Rate limit exceeded (future)       |
| `InternalServerError`     | 500         | Server errors                      |
| `ServiceUnavailableError` | 503         | Database/Redis unavailable         |

### 2. Error Handling Middleware (`src/middleware/errorHandler.js`)

**Middleware Chain:**

1. **errorLogger** - Logs errors with context
2. **errorResponder** - Formats error responses
3. **notFoundHandler** - Handles 404s for unknown routes

**Error Types:**

- **Operational Errors** (`isOperational: true`)
  - Expected errors (validation, not found, etc.)
  - Logged as warnings
  - Safe to continue running
- **Programming Errors** (`isOperational: false`)
  - Unexpected errors (bugs, system failures)
  - Logged as errors with stack traces
  - May require investigation

### 3. Using Errors in Controllers

Controllers throw custom errors and pass them to the error middleware via `next()`:

```javascript
async shortenUrl(req, res, next) {
  try {
    const urlValidation = validateUrl(url);
    if (!urlValidation.valid) {
      throw new BadRequestError(urlValidation.error);
    }
    // ... rest of logic
  } catch (err) {
    next(err); // Pass to error middleware
  }
}
```

### 4. Error Response Format

**Success Response:**

```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Error message here",
  "timestamp": "2026-01-03T20:22:27.391Z"
}
```

**Development Mode:** Includes stack trace
**Production Mode:** Hides internal details

## Common Error Scenarios

### Validation Errors (400)

- Invalid URL format
- Missing required fields
- Custom alias too short/long
- Invalid short code format

### Not Found Errors (404)

- Short code doesn't exist
- Unknown API endpoint

### Conflict Errors (409)

- Custom alias already in use

### Gone Errors (410)

- Short URL has expired

### Payload Errors (413)

- Request body exceeds size limit

## Benefits

✅ **Consistency** - All errors follow same format  
✅ **Proper HTTP Status Codes** - Semantic status codes (409 for conflicts, 410 for expired)  
✅ **Developer-Friendly** - Stack traces in development  
✅ **Production-Ready** - Hides internal details in production  
✅ **Logging** - Automatic error logging with context  
✅ **Type Safety** - Named error classes prevent mistakes

## Environment Variables

```bash
NODE_ENV=development  # Shows stack traces
NODE_ENV=production   # Hides stack traces
```

## Testing

All error scenarios are tested in:

- `tests/integration/api.test.js` - Integration tests for error responses
- `tests/unit/inputValidator.test.js` - Validation error cases

## Future Enhancements

- [ ] Rate limiting with `TooManyRequestsError`
- [ ] Error monitoring integration (Sentry, etc.)
- [ ] Custom error codes for API versioning
- [ ] Error metrics/dashboards
