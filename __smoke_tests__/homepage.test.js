/**
 * Homepage Rendering Smoke Test
 * Validates that the homepage loads and responds correctly after deployment
 * 
 * Critical user flow verification - homepage is the entry point for all users
 */

const API_URL = process.env.APP_URL || 'http://localhost:3000';

describe('Homepage Rendering Smoke Tests', () => {
  jest.setTimeout(15000);

  test('homepage should return 200 OK status', async () => {
    const response = await fetch(`${API_URL}/`);
    expect(response.status).toBe(200);
  });

  test('homepage should contain HTML content', async () => {
    const response = await fetch(`${API_URL}/`);
    const contentType = response.headers.get('content-type');
    
    expect(contentType).toContain('text/html');
  });

  test('homepage should not have error meta tags', async () => {
    const response = await fetch(`${API_URL}/`);
    const html = await response.text();
    
    // Should not contain error indicators
    expect(html).not.toContain('500 Internal Server Error');
    expect(html).not.toContain('Application Error');
    expect(html).not.toContain('Error: ');
  });

  test('homepage should load within 5 seconds', async () => {
    const startTime = Date.now();
    const response = await fetch(`${API_URL}/`);
    const duration = Date.now() - startTime;
    
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(5000);
  });

  test('homepage should have proper security headers', async () => {
    const response = await fetch(`${API_URL}/`);
    
    // Check for key security headers
    const xContentTypeOptions = response.headers.get('x-content-type-options');
    const xFrameOptions = response.headers.get('x-frame-options');
    
    expect(xContentTypeOptions).toBeTruthy();
    expect(xFrameOptions).toBeTruthy();
  });

  test('homepage should have reasonable content length', async () => {
    const response = await fetch(`${API_URL}/`);
    const contentLength = response.headers.get('content-length');
    
    // Homepage HTML should be between 1KB and 500KB
    if (contentLength) {
      const length = parseInt(contentLength);
      expect(length).toBeGreaterThan(1024);
      expect(length).toBeLessThan(500000);
    }
  });

  test('homepage should not have redirect loops', async () => {
    const response = await fetch(`${API_URL}/`, {
      redirect: 'manual'
    });
    
    // Should either be 200 OK or a valid redirect (301, 302, etc.)
    expect([200, 301, 302, 307, 308]).toContain(response.status);
  });
});
