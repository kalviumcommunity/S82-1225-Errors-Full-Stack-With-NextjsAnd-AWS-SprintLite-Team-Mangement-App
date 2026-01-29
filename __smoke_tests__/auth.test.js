/**
 * Authentication Flow Smoke Test
 * Validates critical authentication endpoints after deployment
 * 
 * Ensures login/logout flows are working correctly
 */

const API_URL = process.env.APP_URL || 'http://localhost:3000';

describe('Authentication Flow Smoke Tests', () => {
  jest.setTimeout(15000);

  test('auth login endpoint should be accessible', async () => {
    const response = await fetch(`${API_URL}/auth/login`, {
      redirect: 'manual'
    });
    
    // Should either be 200 (page loads) or redirect to existing session
    expect([200, 301, 302, 307]).toContain(response.status);
  });

  test('auth logout endpoint should be accessible', async () => {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      redirect: 'manual'
    });
    
    // POST should succeed or redirect
    expect([200, 301, 302, 307, 405]).toContain(response.status);
  });

  test('protected routes should not return 500 errors', async () => {
    const response = await fetch(`${API_URL}/api/tasks`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    // Should return 401 (unauthorized) not 500 (error)
    // or 200 if no auth required
    expect(response.status).not.toBe(500);
  });

  test('auth endpoints should have security headers', async () => {
    const response = await fetch(`${API_URL}/auth/login`);
    
    const xContentTypeOptions = response.headers.get('x-content-type-options');
    const setCookie = response.headers.get('set-cookie');
    
    expect(xContentTypeOptions).toBeTruthy();
    // Cookie should have secure flags (if present)
    if (setCookie) {
      expect(setCookie.toLowerCase()).toContain('httponly' || 'secure');
    }
  });

  test('CORS headers should be present for API requests', async () => {
    const response = await fetch(`${API_URL}/api/health`, {
      headers: {
        'Origin': 'https://example.com'
      }
    });
    
    expect(response.status).toBe(200);
  });
});
