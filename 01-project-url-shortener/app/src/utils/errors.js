/**
 * Custom Error Classes
 * Provides consistent error handling across the application
 */

/**
 * Base API Error
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request
 * Client sent invalid data
 */
class BadRequestError extends ApiError {
  constructor(message = "Bad Request") {
    super(400, message);
    this.name = "BadRequestError";
  }
}

/**
 * 404 Not Found
 * Resource doesn't exist
 */
class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

/**
 * 409 Conflict
 * Resource already exists or conflict with current state
 */
class ConflictError extends ApiError {
  constructor(message = "Resource conflict") {
    super(409, message);
    this.name = "ConflictError";
  }
}

/**
 * 410 Gone
 * Resource existed but is no longer available
 */
class GoneError extends ApiError {
  constructor(message = "Resource is no longer available") {
    super(410, message);
    this.name = "GoneError";
  }
}

/**
 * 413 Payload Too Large
 * Request entity is too large
 */
class PayloadTooLargeError extends ApiError {
  constructor(message = "Request payload too large") {
    super(413, message);
    this.name = "PayloadTooLargeError";
  }
}

/**
 * 429 Too Many Requests
 * Rate limit exceeded
 */
class TooManyRequestsError extends ApiError {
  constructor(message = "Too many requests") {
    super(429, message);
    this.name = "TooManyRequestsError";
  }
}

/**
 * 500 Internal Server Error
 * Unexpected server error
 */
class InternalServerError extends ApiError {
  constructor(message = "Internal server error", isOperational = false) {
    super(500, message, isOperational);
    this.name = "InternalServerError";
  }
}

/**
 * 503 Service Unavailable
 * Service temporarily unavailable (database down, etc.)
 */
class ServiceUnavailableError extends ApiError {
  constructor(message = "Service temporarily unavailable") {
    super(503, message);
    this.name = "ServiceUnavailableError";
  }
}

module.exports = {
  ApiError,
  BadRequestError,
  NotFoundError,
  ConflictError,
  GoneError,
  PayloadTooLargeError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError,
};
