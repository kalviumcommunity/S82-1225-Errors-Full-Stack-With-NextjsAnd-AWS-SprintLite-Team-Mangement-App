/**
 * Standardized Error Codes for API Responses
 *
 * Using a consistent error code system improves:
 * - Frontend error handling
 * - API documentation
 * - Logging and monitoring
 * - Debugging and troubleshooting
 */

export const ERROR_CODES = {
  // Client Errors (4xx)
  VALIDATION_ERROR: "E001",
  MISSING_REQUIRED_FIELDS: "E002",
  INVALID_INPUT: "E003",
  NOT_FOUND: "E004",
  CONFLICT: "E005",
  DUPLICATE_ENTRY: "E006",
  UNAUTHORIZED: "E007",
  FORBIDDEN: "E008",

  // Server Errors (5xx)
  INTERNAL_ERROR: "E500",
  DATABASE_ERROR: "E501",
  EXTERNAL_SERVICE_ERROR: "E502",

  // Resource-Specific Errors
  USER_NOT_FOUND: "E101",
  USER_ALREADY_EXISTS: "E102",
  INVALID_CREDENTIALS: "E103",

  TASK_NOT_FOUND: "E201",
  TASK_CREATE_FAILED: "E202",
  TASK_UPDATE_FAILED: "E203",
  TASK_DELETE_FAILED: "E204",

  COMMENT_NOT_FOUND: "E301",
  COMMENT_CREATE_FAILED: "E302",

  // Transaction Errors
  TRANSACTION_FAILED: "E401",
  ROLLBACK_REQUIRED: "E402",
};

/**
 * Get human-readable error message for an error code
 *
 * @param {string} code - Error code
 * @returns {string} Human-readable message
 */
export const getErrorMessage = (code) => {
  const messages = {
    [ERROR_CODES.VALIDATION_ERROR]: "Invalid input data provided",
    [ERROR_CODES.MISSING_REQUIRED_FIELDS]: "Required fields are missing",
    [ERROR_CODES.INVALID_INPUT]: "Input data format is invalid",
    [ERROR_CODES.NOT_FOUND]: "Requested resource not found",
    [ERROR_CODES.CONFLICT]: "Resource conflict detected",
    [ERROR_CODES.DUPLICATE_ENTRY]: "Duplicate entry detected",
    [ERROR_CODES.UNAUTHORIZED]: "Authentication required",
    [ERROR_CODES.FORBIDDEN]: "Insufficient permissions",

    [ERROR_CODES.INTERNAL_ERROR]: "Internal server error occurred",
    [ERROR_CODES.DATABASE_ERROR]: "Database operation failed",
    [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: "External service unavailable",

    [ERROR_CODES.USER_NOT_FOUND]: "User not found",
    [ERROR_CODES.USER_ALREADY_EXISTS]: "User already exists",
    [ERROR_CODES.INVALID_CREDENTIALS]: "Invalid email or password",

    [ERROR_CODES.TASK_NOT_FOUND]: "Task not found",
    [ERROR_CODES.TASK_CREATE_FAILED]: "Failed to create task",
    [ERROR_CODES.TASK_UPDATE_FAILED]: "Failed to update task",
    [ERROR_CODES.TASK_DELETE_FAILED]: "Failed to delete task",

    [ERROR_CODES.COMMENT_NOT_FOUND]: "Comment not found",
    [ERROR_CODES.COMMENT_CREATE_FAILED]: "Failed to create comment",

    [ERROR_CODES.TRANSACTION_FAILED]: "Transaction operation failed",
    [ERROR_CODES.ROLLBACK_REQUIRED]: "Transaction rolled back",
  };

  return messages[code] || "An error occurred";
};

/**
 * Map HTTP status code to appropriate error code
 *
 * @param {number} status - HTTP status code
 * @returns {string} Error code
 */
export const getErrorCodeFromStatus = (status) => {
  switch (status) {
    case 400:
      return ERROR_CODES.VALIDATION_ERROR;
    case 401:
      return ERROR_CODES.UNAUTHORIZED;
    case 403:
      return ERROR_CODES.FORBIDDEN;
    case 404:
      return ERROR_CODES.NOT_FOUND;
    case 409:
      return ERROR_CODES.CONFLICT;
    case 500:
      return ERROR_CODES.INTERNAL_ERROR;
    case 503:
      return ERROR_CODES.EXTERNAL_SERVICE_ERROR;
    default:
      return ERROR_CODES.INTERNAL_ERROR;
  }
};
