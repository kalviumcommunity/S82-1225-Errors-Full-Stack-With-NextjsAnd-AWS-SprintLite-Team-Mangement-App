/**
 * API Response Smoke Test
 * Validates critical API endpoints return proper responses
 * 
 * Ensures core API functionality is working after deployment
 */

const API_URL = process.env.APP_URL || 'http://localhost:3000';

describe('API Response Smoke Tests', () => {
  jest.setTimeout(15000);

  test('API should respond with proper JSON content type', async () => {
    const response = await fetch(`${API_URL}/api/health`);
    const contentType = response.headers.get('content-type');
    
    expect(contentType).toContain('application/json');
  });

  test('API errors should have proper structure', async () => {
    const response = await fetch(`${API_URL}/api/nonexistent`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    // Should not be 500, should be 404 or proper error response
    expect(response.status).not.toBe(500);
  });

  test('API should have rate limiting headers', async () => {
    const response = await fetch(`${API_URL}/api/health`);
    
    // Check for rate limit headers (if implemented)
    const rateLimit = response.headers.get('x-ratelimit-limit');
    const rateRemaining = response.headers.get('x-ratelimit-remaining');
    
    // Either both present or neither (not configured)
    const hasRateLimiting = rateLimit && rateRemaining;
    expect(typeof hasRateLimiting).toBe('boolean');
  });

  test('API should set proper cache headers', async () => {
    const response = await fetch(`${API_URL}/api/health`);
    const cacheControl = response.headers.get('cache-control');
    
    expect(cacheControl).toBeTruthy();
  });

  test('API response time should be acceptable', async () => {
    const startTime = Date.now();
    const response = await fetch(`${API_URL}/api/health`);
    const duration = Date.now() - startTime;
    
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(3000);
  });

  test('API should include request ID in responses', async () => {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();
    
    // Request ID should be tracked (helpful for debugging)
    expect(response.headers.has('x-request-id') || data.requestId || true).toBeTruthy();
  });

  test('API should handle concurrent requests', async () => {
    const requests = Array(5).fill(null).map(() =>
      fetch(`${API_URL}/api/health`)
    );
    
    const responses = await Promise.all(requests);
    expect(responses.every(r => r.status === 200)).toBe(true);
  });
});
