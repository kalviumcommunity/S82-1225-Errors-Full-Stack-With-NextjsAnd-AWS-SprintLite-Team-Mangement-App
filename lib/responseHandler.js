import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ERROR_CODES, getErrorMessage, getErrorCodeFromStatus } from "./errorCodes.js";

/**
 * Standardized Response Handler Utility
 *
 * Provides consistent API response format across all endpoints
 * with success/error envelopes and timestamps.
 */

/**
 * Send a standardized success response
 *
 * @param {any} data - The response data
 * @param {string} message - Success message
 * @param {number} status - HTTP status code (default: 200)
 * @returns {NextResponse} Formatted success response
 *
 * @example
 * return sendSuccess(users, "Users fetched successfully", 200);
 */
export const sendSuccess = (data, message = "Success", status = 200) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

/**
 * Send a standardized error response
 *
 * @param {string} message - Error message for users
 * @param {string} code - Error code identifier (default: status-based)
 * @param {number} status - HTTP status code (default: 500)
 * @param {any} details - Additional error details (optional)
 * @returns {NextResponse} Formatted error response
 *
 * @example
 * return sendError("User not found", ERROR_CODES.USER_NOT_FOUND, 404);
 */
export const sendError = (message = "Something went wrong", code, status = 500, details = null) => {
  // If no code provided, use status-based default
  const errorCode = code || getErrorCodeFromStatus(status);

  // If no message provided but code exists, use default message
  const errorMessage = message || getErrorMessage(errorCode);

  const response = {
    success: false,
    message: errorMessage,
    error: {
      code: errorCode,
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
};

/**
 * Handle Prisma errors and convert to standardized response
 *
 * @param {Error} error - Prisma error object
 * @returns {NextResponse} Formatted error response
 *
 * @example
 * catch (error) {
 *   return handlePrismaError(error);
 * }
 */
export const handlePrismaError = (error) => {
  // Prisma P2002: Unique constraint violation
  if (error.code === "P2002") {
    return sendError(
      `Duplicate entry detected for field: ${error.meta?.target || "unknown"}`,
      ERROR_CODES.DUPLICATE_ENTRY,
      409,
      error.message
    );
  }

  // Prisma P2025: Record not found
  if (error.code === "P2025") {
    return sendError(error.message || "Record not found", ERROR_CODES.NOT_FOUND, 404, error.meta);
  }

  // Prisma P2003: Foreign key constraint violation
  if (error.code === "P2003") {
    return sendError(
      `Invalid reference: ${error.meta?.field_name || "foreign key violation"}`,
      ERROR_CODES.VALIDATION_ERROR,
      400,
      error.message
    );
  }

  // Generic database error
  return sendError("Database operation failed", ERROR_CODES.DATABASE_ERROR, 500, error.message);
};

/**
 * Handle Zod validation errors and convert to standardized response
 *
 * @param {ZodError} error - Zod validation error object
 * @returns {NextResponse} Formatted validation error response
 *
 * @example
 * catch (error) {
 *   if (error instanceof ZodError) {
 *     return handleZodError(error);
 *   }
 * }
 */
export const handleZodError = (error) => {
  if (!(error instanceof ZodError)) {
    return sendError("Invalid error type", ERROR_CODES.INTERNAL_ERROR, 500);
  }

  // Transform Zod errors into our standard format
  const validationErrors = error.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
    code: err.code,
  }));

  return NextResponse.json(
    {
      success: false,
      message: "Validation failed",
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        details: validationErrors,
      },
      timestamp: new Date().toISOString(),
    },
    { status: 400 }
  );
};

// Export ERROR_CODES for convenience
export { ERROR_CODES };

/**
 * Send a validation error response
 *
 * @param {string} message - Validation error message
 * @param {object} fields - Field-specific validation errors
 * @returns {NextResponse} Formatted validation error response
 */
export const sendValidationError = (message, fields) => {
  return NextResponse.json(
    {
      success: false,
      message,
      error: {
        code: "VALIDATION_ERROR",
        fields,
      },
      timestamp: new Date().toISOString(),
    },
    { status: 400 }
  );
};

/**
 * Send a not found error response
 *
 * @param {string} resource - Resource type that was not found
 * @param {string} id - Resource identifier (optional)
 * @returns {NextResponse} Formatted not found response
 */
export const sendNotFound = (resource, id = null) => {
  const message = id ? `${resource} with ID '${id}' not found` : `${resource} not found`;

  return NextResponse.json(
    {
      success: false,
      message,
      error: {
        code: "NOT_FOUND",
        resource,
        ...(id && { id }),
      },
      timestamp: new Date().toISOString(),
    },
    { status: 404 }
  );
};

/**
 * Send a conflict error response (e.g., duplicate entry)
 *
 * @param {string} message - Conflict error message
 * @param {string} field - Field causing the conflict
 * @returns {NextResponse} Formatted conflict response
 */
export const sendConflict = (message, field = null) => {
  return NextResponse.json(
    {
      success: false,
      message,
      error: {
        code: "CONFLICT",
        ...(field && { field }),
      },
      timestamp: new Date().toISOString(),
    },
    { status: 409 }
  );
};

/**
 * Send a created response (for POST requests)
 *
 * @param {any} data - Created resource data
 * @param {string} message - Success message
 * @returns {NextResponse} Formatted created response
 */
export const sendCreated = (data, message = "Resource created successfully") => {
  return sendSuccess(data, message, 201);
};
