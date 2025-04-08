/**
 * Custom error handling utility
 */

// Custom API error class
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Error converter to make sure all errors have consistent format
const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  const { statusCode, message, isOperational, stack } = err;
  
  // Set status code
  res.status(statusCode || 500);
  
  // Create error response
  const response = {
    status: 'error',
    message,
  };
  
  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && !isOperational) {
    response.stack = stack;
  }
  
  // Log error for server-side review
  console.error(err);
  
  // Send response
  res.json(response);
};

module.exports = {
  ApiError,
  errorConverter,
  errorHandler,
};