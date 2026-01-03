/**
 * Error Handler Middleware
 * Centralized error handling for the application
 */

const { ApiError } = require("../utils/errors");

/**
 * Error logger
 * Logs error details for debugging
 */
const errorLogger = (err, req) => {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    error: {
      name: err.name,
      message: err.message,
      statusCode: err.statusCode,
      isOperational: err.isOperational,
    },
  };

  // Log operational errors as warnings
  if (err.isOperational) {
    console.warn("Operational Error:", JSON.stringify(errorDetails, null, 2));
  } else {
    // Log programming errors as errors with stack trace
    console.error("Programming Error:", JSON.stringify(errorDetails, null, 2));
    console.error("Stack:", err.stack);
  }
};

/**
 * Error response formatter
 * Formats error response consistently
 */
const errorResponder = (err, req, res, next) => {
  // Log the error
  errorLogger(err, req);

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Determine if we should expose error details
  const isDevelopment =
    process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

  // Build error response
  const errorResponse = {
    success: false,
    error: err.message || "Internal server error",
    statusCode,
    timestamp: err.timestamp || new Date().toISOString(),
  };

  // Add stack trace in development
  if (isDevelopment && err.stack) {
    errorResponse.stack = err.stack;
  }

  // Add request ID if available (useful for debugging)
  if (req.id) {
    errorResponse.requestId = req.id;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Catch-all for unhandled errors
 * Converts non-ApiError errors to ApiError
 */
const errorConverter = (err, req, res, next) => {
  // If it's already an ApiError, pass it through
  if (err instanceof ApiError) {
    return next(err);
  }

  // Convert to ApiError
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  const apiError = new ApiError(statusCode, message, false);

  // Preserve stack trace
  apiError.stack = err.stack;

  next(apiError);
};

/**
 * 404 Not Found handler
 * Handles routes that don't exist
 */
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorLogger,
  errorResponder,
  errorConverter,
  notFoundHandler,
  asyncHandler,
};
