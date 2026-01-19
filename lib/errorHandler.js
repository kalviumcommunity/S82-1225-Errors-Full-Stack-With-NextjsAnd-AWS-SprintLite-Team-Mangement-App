/**
 * Centralized Error Handler
 *
 * Provides consistent error handling across all API routes.
 * Logs detailed errors for debugging while showing safe messages to users.
 */

import { NextResponse } from "next/server";
import { logError } from "./logger.js";
import { ERROR_CODES } from "./errorCodes.js";

/**
 * Handle errors in API routes
 * @param {Error} error - Error object
 * @param {string|object} context - Context string (e.g., "GET /api/users") or context object
 * @returns {NextResponse} Formatted error response
 */
export const handleError = (error, context = {}) => {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Normalize context to object if it's a string
  const contextObj = typeof context === "string" ? { route: context } : context;

  // Extract error details
  const errorDetails = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: error.code,
    ...contextObj,
  };

  // Log the error with full details
  logError(`Error: ${error.message}`, {
    route: contextObj.route || contextObj.path || "Unknown",
    error: errorDetails,
    user: contextObj.user,
    body: contextObj.body,
    query: contextObj.query,
  });

  // Determine response based on environment
  const response = {
    success: false,
    timestamp: new Date().toISOString(),
  };

  if (isDevelopment) {
    // Development: Show detailed error information
    response.message = error.message || "An error occurred";
    response.error = {
      code: error.code || ERROR_CODES.INTERNAL_ERROR,
      name: error.name,
      stack: error.stack,
      details: errorDetails,
    };
  } else {
    // Production: Show safe, generic error message
    response.message = "Something went wrong. Please try again later.";
    response.error = {
      code: error.code || ERROR_CODES.INTERNAL_ERROR,
    };
  }

  // Determine status code
  let statusCode = 500;
  if (error.statusCode) {
    statusCode = error.statusCode;
  } else if (error.name === "ValidationError") {
    statusCode = 400;
  } else if (error.name === "UnauthorizedError") {
    statusCode = 401;
  } else if (error.name === "ForbiddenError") {
    statusCode = 403;
  } else if (error.name === "NotFoundError") {
    statusCode = 404;
  }

  return NextResponse.json(response, { status: statusCode });
};

/**
 * Create custom error classes for better error handling
 */
export class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
    this.code = ERROR_CODES.VALIDATION_ERROR;
    this.details = details;
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized access") {
    super(message);
    this.name = "UnauthorizedError";
    this.statusCode = 401;
    this.code = ERROR_CODES.UNAUTHORIZED;
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Access denied") {
    super(message);
    this.name = "ForbiddenError";
    this.statusCode = 403;
    this.code = ERROR_CODES.FORBIDDEN;
  }
}

export class NotFoundError extends Error {
  constructor(resource, id = null) {
    const message = id ? `${resource} with ID '${id}' not found` : `${resource} not found`;
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
    this.code = ERROR_CODES.NOT_FOUND;
    this.resource = resource;
  }
}

export class DatabaseError extends Error {
  constructor(message = "Database operation failed") {
    super(message);
    this.name = "DatabaseError";
    this.statusCode = 500;
    this.code = ERROR_CODES.DATABASE_ERROR;
  }
}

/**
 * Wrap async route handlers to catch errors
 * @param {Function} handler - Async route handler function
 * @returns {Function} Wrapped handler with error catching
 */
export const catchAsync = (handler) => {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      const { method } = request;
      const path = new URL(request.url).pathname;

      return handleError(error, {
        method,
        path,
        ...context,
      });
    }
  };
};

export default handleError;
