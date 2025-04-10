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

// Handle MongoDB validation errors
const handleMongooseValidationError = (error) => {
  const errors = {};
  
  // Extract validation error messages
  if (error.errors) {
    Object.keys(error.errors).forEach(key => {
      errors[key] = error.errors[key].message;
    });
  }
  
  return {
    status: 400,
    message: 'Validation error',
    errors
  };
};

// Handle MongoDB duplicate key errors
const handleMongooseDuplicateKeyError = (error) => {
  // Extract the duplicate field
  const field = Object.keys(error.keyPattern)[0];
  const value = error.keyValue[field];
  
  return {
    status: 400,
    message: `${field} "${value}" already exists`,
    errors: {
      [field]: `${field} already exists`
    }
  };
};

// Handle JWT errors
const handleJWTError = (error) => {
  return {
    status: 401,
    message: 'Invalid token. Please log in again.',
    errors: {
      authentication: 'Invalid token'
    }
  };
};

// Handle expired JWT
const handleJWTExpiredError = (error) => {
  return {
    status: 401,
    message: 'Your token has expired! Please log in again.',
    errors: {
      authentication: 'Token expired'
    }
  };
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log error for debugging
  console.error('Error:', err);
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    error = handleMongooseValidationError(error);
  }
  
  // Mongoose duplicate key error
  if (error.code === 11000) {
    error = handleMongooseDuplicateKeyError(error);
  }
  
  // Mongoose cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    error = {
      status: 400,
      message: `Invalid ${error.path}: ${error.value}`,
      errors: {
        [error.path]: `Invalid format for ${error.path}`
      }
    };
  }
  
  // JWT error handling
  if (error.name === 'JsonWebTokenError') {
    error = handleJWTError(error);
  }
  
  // JWT expired error
  if (error.name === 'TokenExpiredError') {
    error = handleJWTExpiredError(error);
  }
  
  // Send error response
  res.status(error.status || 500).json({
    message: error.message || 'Server Error',
    errors: error.errors || {},
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = {
  ApiError,
  errorConverter,
  errorHandler,
};