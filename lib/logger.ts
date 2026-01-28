/**
 * Structured Logger Utility
 * 
 * Provides JSON-formatted logging with correlation IDs, request tracking,
 * and multiple severity levels (info, warn, error, debug)
 * 
 * Integrates with AWS CloudWatch Logs via container logging driver
 * or directly via AWS SDK for Lambda/Fargate environments
 */

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  requestId: string;
  message: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  error?: string;
  errorStack?: string;
  userId?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

class StructuredLogger {
  private environment: string;
  private serviceName: string;
  private version: string;

  constructor(
    serviceName: string = 'sprintlite-app',
    version: string = '1.0.0',
    environment: string = process.env.NODE_ENV || 'development'
  ) {
    this.serviceName = serviceName;
    this.version = version;
    this.environment = environment;
  }

  /**
   * Generate unique request ID for tracing
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current timestamp in ISO 8601 format
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Create base log entry with common fields
   */
  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    requestId?: string,
    metadata?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: this.getTimestamp(),
      level,
      requestId: requestId || this.generateRequestId(),
      message,
      serviceName: this.serviceName,
      version: this.version,
      environment: this.environment,
      ...(metadata && { metadata }),
    };
  }

  /**
   * Log info level message
   */
  info(message: string, requestId?: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('info', message, requestId, metadata);
    console.log(JSON.stringify(entry));
  }

  /**
   * Log warning level message
   */
  warn(message: string, requestId?: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('warn', message, requestId, metadata);
    console.warn(JSON.stringify(entry));
  }

  /**
   * Log error level message with error details
   */
  error(
    message: string,
    error: Error | string,
    requestId?: string,
    metadata?: Record<string, any>
  ): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    const entry: LogEntry = {
      ...this.createLogEntry('error', message, requestId, metadata),
      error: errorMessage,
      ...(errorStack && { errorStack }),
    };

    console.error(JSON.stringify(entry));
  }

  /**
   * Log debug level message (only in development)
   */
  debug(message: string, requestId?: string, metadata?: Record<string, any>): void {
    if (this.environment === 'development' || process.env.DEBUG === 'true') {
      const entry = this.createLogEntry('debug', message, requestId, metadata);
      console.debug(JSON.stringify(entry));
    }
  }

  /**
   * Log API request received
   */
  logRequest(
    method: string,
    endpoint: string,
    requestId: string,
    metadata?: Record<string, any>
  ): void {
    this.info('API request received', requestId, {
      method,
      endpoint,
      ...metadata,
    });
  }

  /**
   * Log successful API response
   */
  logResponse(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    requestId: string,
    metadata?: Record<string, any>
  ): void {
    const level = statusCode >= 400 ? 'warn' : 'info';
    const message = `API request completed: ${method} ${endpoint}`;

    const entry: LogEntry = {
      ...this.createLogEntry(level, message, requestId, metadata),
      method,
      endpoint,
      statusCode,
      duration,
    };

    (level === 'warn' ? console.warn : console.log)(JSON.stringify(entry));
  }

  /**
   * Log API error with full context
   */
  logApiError(
    method: string,
    endpoint: string,
    statusCode: number,
    error: Error | string,
    duration: number,
    requestId: string,
    userId?: string,
    metadata?: Record<string, any>
  ): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    const entry: LogEntry = {
      ...this.createLogEntry('error', `API error: ${method} ${endpoint}`, requestId, metadata),
      method,
      endpoint,
      statusCode,
      duration,
      error: errorMessage,
      ...(errorStack && { errorStack }),
      ...(userId && { userId }),
    };

    console.error(JSON.stringify(entry));
  }

  /**
   * Log database operation
   */
  logDatabaseOperation(
    operation: string,
    table: string,
    duration: number,
    requestId: string,
    success: boolean = true,
    error?: Error,
    metadata?: Record<string, any>
  ): void {
    const message = `Database ${operation} on ${table}`;
    const level = success ? 'info' : 'error';

    const entry: LogEntry = {
      ...this.createLogEntry(level, message, requestId, metadata),
      operation,
      table,
      duration,
      success,
      ...(error && { error: error.message, errorStack: error.stack }),
    };

    (level === 'error' ? console.error : console.log)(JSON.stringify(entry));
  }

  /**
   * Log authentication event
   */
  logAuthEvent(
    event: 'login' | 'logout' | 'signup' | 'login_failed' | 'password_reset',
    userId: string,
    requestId: string,
    success: boolean = true,
    metadata?: Record<string, any>
  ): void {
    const level = success ? 'info' : 'warn';
    const message = `Authentication ${event}`;

    const entry: LogEntry = {
      ...this.createLogEntry(level, message, requestId, metadata),
      event,
      userId,
      success,
    };

    (level === 'warn' ? console.warn : console.log)(JSON.stringify(entry));
  }

  /**
   * Log business event (task creation, assignment, etc.)
   */
  logBusinessEvent(
    eventType: string,
    entityType: string,
    entityId: string,
    userId: string,
    requestId: string,
    metadata?: Record<string, any>
  ): void {
    this.info('Business event', requestId, {
      eventType,
      entityType,
      entityId,
      userId,
      ...metadata,
    });
  }

  /**
   * Log performance metric
   */
  logMetric(
    metricName: string,
    value: number,
    unit: string = 'ms',
    requestId?: string,
    metadata?: Record<string, any>
  ): void {
    this.debug(`Metric: ${metricName}`, requestId, {
      metric: metricName,
      value,
      unit,
      ...metadata,
    });
  }
}

// Export singleton instance
export const logger = new StructuredLogger(
  process.env.NEXT_PUBLIC_APP_NAME || 'sprintlite-app',
  process.env.APP_VERSION || '1.0.0',
  process.env.NODE_ENV || 'development'
);

export default StructuredLogger;
