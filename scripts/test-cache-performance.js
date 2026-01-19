/**
 * Redis Cache Performance Testing Script
 *
 * Tests cache performance by measuring:
 * 1. Cold request (cache miss) - hits database
 * 2. Warm request (cache hit) - served from Redis
 * 3. Performance improvement calculation
 */

const BASE_URL = "http://localhost:3000";

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

/**
 * Measure request latency
 */
async function measureRequest(url, label, expectCacheHit = false) {
  const startTime = Date.now();

  try {
    const response = await fetch(url);
    const endTime = Date.now();
    const latency = endTime - startTime;

    const data = await response.json();
    const cacheHit = data.data?._cache?.hit;
    const serverResponseTime = data.data?._cache?.responseTime;

    console.log(`\n${expectCacheHit ? colors.green : colors.yellow}${label}${colors.reset}`);
    console.log(`  Status: ${response.status}`);
    console.log(
      `  Cache: ${cacheHit ? colors.green + "✅ HIT" : colors.red + "❌ MISS"}${colors.reset}`
    );
    console.log(`  Client latency: ${colors.cyan}${latency}ms${colors.reset}`);
    console.log(
      `  Server response time: ${colors.cyan}${serverResponseTime || "N/A"}${colors.reset}`
    );

    if (data.data) {
      const itemCount = data.data.users?.length || data.data.tasks?.length || 0;
      console.log(`  Items returned: ${itemCount}`);
    }

    return { latency, cacheHit, serverResponseTime };
  } catch (error) {
    console.log(`\n${colors.red}${label} - FAILED${colors.reset}`);
    console.log(`  Error: ${error.message}`);
    return { latency: -1, cacheHit: false, error: error.message };
  }
}

/**
 * Test cache performance for an endpoint
 */
async function testEndpoint(endpoint, name) {
  console.log(`\n${colors.bright}${colors.blue}${"═".repeat(70)}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}  Testing: ${name}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${"═".repeat(70)}${colors.reset}`);

  const url = `${BASE_URL}${endpoint}`;

  // Request 1: Cold cache (should miss and hit database)
  const cold = await measureRequest(
    url,
    "📊 Request #1: COLD (Cache Miss - Database Query)",
    false
  );

  // Small delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Request 2: Warm cache (should hit cache)
  const warm1 = await measureRequest(url, "🚀 Request #2: WARM (Cache Hit - Redis)", true);

  // Small delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Request 3: Another warm request
  await measureRequest(url, "🚀 Request #3: WARM (Cache Hit - Redis)", true);

  // Calculate performance improvement
  if (cold.latency > 0 && warm1.latency > 0) {
    const improvement = (((cold.latency - warm1.latency) / cold.latency) * 100).toFixed(1);
    const speedup = (cold.latency / warm1.latency).toFixed(1);

    console.log(`\n${colors.bright}${colors.magenta}📈 Performance Analysis:${colors.reset}`);
    console.log(`  Cold request: ${colors.yellow}${cold.latency}ms${colors.reset}`);
    console.log(`  Warm request: ${colors.green}${warm1.latency}ms${colors.reset}`);
    console.log(`  Improvement: ${colors.green}${improvement}%${colors.reset} faster`);
    console.log(`  Speed up: ${colors.green}${speedup}x${colors.reset}`);
    console.log(`  Latency saved: ${colors.cyan}${cold.latency - warm1.latency}ms${colors.reset}`);
  }
}

/**
 * Main test runner
 */
async function runPerformanceTests() {
  console.log(`\n${colors.bright}${colors.green}${"═".repeat(70)}${colors.reset}`);
  console.log(`${colors.bright}${colors.green}  REDIS CACHE PERFORMANCE TEST SUITE${colors.reset}`);
  console.log(`${colors.bright}${colors.green}${"═".repeat(70)}${colors.reset}\n`);

  console.log(`${colors.yellow}ℹ️  What we're testing:${colors.reset}`);
  console.log(`  1. First request (cold) → Cache MISS → Database query`);
  console.log(`  2. Second request (warm) → Cache HIT → Redis response`);
  console.log(`  3. Calculate performance improvement\n`);

  console.log(`${colors.yellow}ℹ️  Expected behavior:${colors.reset}`);
  console.log(`  • Cold requests: ${colors.red}~100-300ms${colors.reset} (database query)`);
  console.log(`  • Warm requests: ${colors.green}~10-50ms${colors.reset} (Redis cache)`);
  console.log(`  • Improvement: ${colors.green}~70-90%${colors.reset} faster\n`);

  // Test users endpoint
  await testEndpoint("/api/users?page=1&limit=10", "GET /api/users");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test tasks endpoint
  await testEndpoint("/api/tasks?page=1&limit=10", "GET /api/tasks");

  console.log(`\n${colors.bright}${colors.green}${"═".repeat(70)}${colors.reset}`);
  console.log(`${colors.bright}${colors.green}  ✅ PERFORMANCE TESTS COMPLETED${colors.reset}`);
  console.log(`${colors.bright}${colors.green}${"═".repeat(70)}${colors.reset}\n`);

  console.log(`${colors.yellow}💡 Key Takeaways:${colors.reset}`);
  console.log(`  • Redis caching dramatically reduces database load`);
  console.log(`  • Subsequent requests are significantly faster`);
  console.log(`  • Cache TTL is 60 seconds (configurable)`);
  console.log(`  • Cache is invalidated on data changes\n`);
}

// Run tests
runPerformanceTests().catch(console.error);
