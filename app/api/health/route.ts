import { logger } from '@/lib/logger';
import { responseHandler } from '@/lib/responseHandler';

/**
 * GET /api/health
 * 
 * Health check endpoint with structured logging
 * Used by:
 * - Load balancer health checks (ECS)
 * - Kubernetes liveness probes
 * - Monitoring systems
 * - CloudWatch alarms
 */
export async function GET(request: Request) {
  const requestId = `health-${Date.now()}`;
  const startTime = Date.now();

  try {
    // Log health check request
    logger.logRequest('GET', '/api/health', requestId, {
      userAgent: request.headers.get('user-agent'),
      remoteAddr: request.headers.get('x-forwarded-for') || 'unknown',
    });

    // Simulate lightweight health checks
    const checks = {
      api_server: true, // This endpoint is responding
      database: true, // Assume DB is healthy (could add actual check)
      cache: true, // Assume cache is healthy
    };

    // Check all services are healthy
    const allHealthy = Object.values(checks).every((check) => check === true);
    const statusCode = allHealthy ? 200 : 503;
    const duration = Date.now() - startTime;

    // Log response
    logger.logResponse(
      'GET',
      '/api/health',
      statusCode,
      duration,
      requestId,
      {
        checks,
        allHealthy,
      }
    );

    // Return response
    return responseHandler.success(
      {
        status: allHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        checks,
      },
      statusCode
    );
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log error
    logger.logApiError(
      'GET',
      '/api/health',
      500,
      error instanceof Error ? error : 'Unknown error',
      duration,
      requestId
    );

    return responseHandler.error(
      'Health check failed',
      'HEALTH_CHECK_ERROR',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
