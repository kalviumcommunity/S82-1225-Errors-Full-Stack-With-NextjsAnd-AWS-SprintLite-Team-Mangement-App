/**
 * Structured Logger Utility
 *
 * Provides consistent logging across the application with structured JSON output.
 * Supports different log levels: info, warn, error, debug.
 */

const LOG_LEVELS = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
};

/**
 * Format log entry as structured JSON
 * @param {string} level - Log level (error, warn, info, debug)
 * @param {string} message - Log message
 * @param {object} meta - Additional metadata
 * @returns {object} Structured log entry
 */
const formatLog = (level, message, meta = {}) => {
  return {
    level,
    message,
    meta: {
      ...meta,
      environment: process.env.NODE_ENV || "development",
    },
    timestamp: new Date().toISOString(),
  };
};

/**
 * Log error message
 * @param {string} message - Error message
 * @param {object} meta - Additional metadata (error object, context, etc.)
 */
export const logError = (message, meta = {}) => {
  const logEntry = formatLog(LOG_LEVELS.ERROR, message, meta);

  // In production, redact sensitive information
  if (process.env.NODE_ENV === "production") {
    if (logEntry.meta.stack) {
      logEntry.meta.stack = "REDACTED";
    }
    if (logEntry.meta.error) {
      logEntry.meta.error = {
        message: logEntry.meta.error.message,
        name: logEntry.meta.error.name,
      };
    }
  }

  console.error(JSON.stringify(logEntry, null, 2));
  return logEntry;
};

/**
 * Log warning message
 * @param {string} message - Warning message
 * @param {object} meta - Additional metadata
 */
export const logWarn = (message, meta = {}) => {
  const logEntry = formatLog(LOG_LEVELS.WARN, message, meta);
  console.warn(JSON.stringify(logEntry, null, 2));
  return logEntry;
};

/**
 * Log info message
 * @param {string} message - Info message
 * @param {object} meta - Additional metadata
 */
export const logInfo = (message, meta = {}) => {
  const logEntry = formatLog(LOG_LEVELS.INFO, message, meta);
  console.log(JSON.stringify(logEntry, null, 2));
  return logEntry;
};

/**
 * Log debug message (only in development)
 * @param {string} message - Debug message
 * @param {object} meta - Additional metadata
 */
export const logDebug = (message, meta = {}) => {
  if (process.env.NODE_ENV === "development") {
    const logEntry = formatLog(LOG_LEVELS.DEBUG, message, meta);
    console.log(JSON.stringify(logEntry, null, 2));
    return logEntry;
  }
};

/**
 * Log API request
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 * @param {object} meta - Additional request metadata
 */
export const logRequest = (method, path, meta = {}) => {
  logInfo(`${method} ${path}`, {
    type: "request",
    method,
    path,
    ...meta,
  });
};

/**
 * Log API response
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 * @param {number} status - Response status code
 * @param {number} duration - Request duration in ms
 */
export const logResponse = (method, path, status, duration) => {
  logInfo(`${method} ${path} - ${status}`, {
    type: "response",
    method,
    path,
    status,
    duration: `${duration}ms`,
  });
};

const logger = {
  error: logError,
  warn: logWarn,
  info: logInfo,
  debug: logDebug,
  request: logRequest,
  response: logResponse,
};

export default logger;
