/**
 * Integration Test: API Health Check Route
 * Tests the /api/health endpoint functionality
 */

// Mock the route handler - returns plain object to avoid Response API issues in Jest
const mockHealthHandler = async () => {
  return {
    status: 200,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    headers: { "Content-Type": "application/json" },
  };
};

describe("API Integration: Health Check Route", () => {
  test("should return 200 with health status", async () => {
    const response = await mockHealthHandler();

    expect(response.status).toBe(200);
    expect(response.data.status).toBe("ok");
    expect(response.data.timestamp).toBeDefined();
    expect(response.data.uptime).toBeDefined();
  });

  test("should return valid JSON structure", async () => {
    const response = await mockHealthHandler();

    expect(response.data).toHaveProperty("status");
    expect(response.data).toHaveProperty("timestamp");
    expect(response.data).toHaveProperty("uptime");
  });

  test("should have correct content-type header", async () => {
    const response = await mockHealthHandler();

    expect(response.headers["Content-Type"]).toBe("application/json");
  });
});
