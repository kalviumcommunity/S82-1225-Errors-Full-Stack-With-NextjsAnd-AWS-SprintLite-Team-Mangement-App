/**
 * Health Check Smoke Test
 * Validates that the health check endpoint is responsive and returns correct status
 * 
 * This test runs after deployment to verify the service is alive and healthy
 */

const API_URL = process.env.APP_URL || 'http://localhost:3000';

describe('Health Check Smoke Tests', () => {
  jest.setTimeout(15000);

  test('should return 200 with status "ok" from /api/health', async () => {
    const response = await fetch(`${API_URL}/api/health`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data.status).toBe('ok');
  });

  test('should include uptime in health check response', async () => {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();
    
    expect(data).toHaveProperty('uptime');
    expect(typeof data.uptime).toBe('number');
    expect(data.uptime).toBeGreaterThan(0);
  });

  test('should include service checks in health response', async () => {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();
    
    expect(data).toHaveProperty('checks');
    expect(data.checks).toHaveProperty('api_server');
    expect(data.checks).toHaveProperty('database');
    expect(data.checks).toHaveProperty('cache');
  });

  test('health endpoint should respond within 2 seconds', async () => {
    const startTime = Date.now();
    const response = await fetch(`${API_URL}/api/health`);
    const duration = Date.now() - startTime;
    
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(2000);
  });

  test('should have proper content-type headers', async () => {
    const response = await fetch(`${API_URL}/api/health`);
    const contentType = response.headers.get('content-type');
    
    expect(contentType).toContain('application/json');
  });
});
