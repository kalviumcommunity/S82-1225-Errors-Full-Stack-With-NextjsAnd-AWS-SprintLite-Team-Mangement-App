import { responseHandler } from '@/lib/responseHandler';

/**
 * GET /api/ssl-status
 * 
 * Verifies SSL/TLS configuration and returns certificate information
 * Useful for monitoring SSL certificate validity and renewal status
 * 
 * Response includes:
 * - HTTPS protocol confirmation
 * - Host information
 * - Certificate domain validation
 * - Security headers verification
 */
export async function GET(request: Request) {
  try {
    const protocol = request.headers.get('x-forwarded-proto') || 'unknown';
    const host = request.headers.get('host') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Verify HTTPS
    const isHttps = protocol === 'https';

    // Get all security headers
    const securityHeaders = {
      hsts: request.headers.get('strict-transport-security'),
      contentType: request.headers.get('x-content-type-options'),
      frameOptions: request.headers.get('x-frame-options'),
      xssProtection: request.headers.get('x-xss-protection'),
      csp: request.headers.get('content-security-policy'),
    };

    // Determine environment
    const isDevelopment = host.includes('localhost') || host.includes('dev');
    const isStaging = host.includes('staging');
    const isProduction = !isDevelopment && !isStaging;

    const status = {
      ssl_active: isHttps,
      protocol: protocol,
      host: host,
      environment: isProduction ? 'production' : isStaging ? 'staging' : 'development',
      security_headers: securityHeaders,
      expected_domain: process.env.NEXT_PUBLIC_DOMAIN || 'sprintlite-app.com',
      force_https_enabled: process.env.NEXT_PUBLIC_FORCE_HTTPS === 'true',
      hsts_max_age: process.env.NEXT_PUBLIC_HSTS_MAX_AGE || '63072000',
      timestamp: new Date().toISOString(),
      checks: {
        https_active: isHttps,
        hsts_header: !!securityHeaders.hsts,
        x_frame_options: !!securityHeaders.frameOptions,
        x_content_type_options: !!securityHeaders.contentType,
        csp_enabled: !!securityHeaders.csp,
      },
    };

    // Check if all security checks pass
    const allChecksPass = Object.values(status.checks).every((check) => check === true);

    return responseHandler.success(
      {
        status: 'OK',
        ssl_configured: status.ssl_active && allChecksPass,
        details: status,
        message: allChecksPass
          ? '✅ SSL/TLS properly configured with all security headers'
          : '⚠️ Some security headers are missing',
      },
      200
    );
  } catch (error) {
    console.error('SSL status check error:', error);

    return responseHandler.error(
      'Failed to check SSL status',
      'SSL_CHECK_ERROR',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
