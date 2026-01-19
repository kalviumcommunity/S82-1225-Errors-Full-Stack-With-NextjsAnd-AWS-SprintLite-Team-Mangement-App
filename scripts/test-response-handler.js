/**
 * Test Response Handler Utility
 *
 * Validates that all API endpoints return standardized responses
 * with proper structure, error codes, and timestamps.
 *
 * Usage: node scripts/test-response-handler.js
 */

const BASE_URL = "http://localhost:3000";

// Color codes for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  bold: "\x1b[1m",
};

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
  testsPassed++;
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
  testsFailed++;
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

/**
 * Validate response structure
 */
function validateResponseStructure(json, expectedSuccess) {
  const issues = [];

  // Check required fields
  if (typeof json.success !== "boolean") {
    issues.push('Missing or invalid "success" field');
  }
  if (json.success !== expectedSuccess) {
    issues.push(`Expected success=${expectedSuccess}, got success=${json.success}`);
  }
  if (!json.message || typeof json.message !== "string") {
    issues.push('Missing or invalid "message" field');
  }
  if (!json.timestamp) {
    issues.push('Missing "timestamp" field');
  } else {
    // Validate ISO 8601 format
    const isValidDate = !isNaN(Date.parse(json.timestamp));
    if (!isValidDate) {
      issues.push("Invalid timestamp format (not ISO 8601)");
    }
  }

  // Success-specific checks
  if (json.success && !json.data) {
    issues.push('Success response missing "data" field');
  }

  // Error-specific checks
  if (!json.success) {
    if (!json.error) {
      issues.push('Error response missing "error" object');
    } else {
      if (!json.error.code) {
        issues.push('Error object missing "code" field');
      }
      // Validate error code format (E### pattern)
      if (json.error.code && !/^E\d+$/.test(json.error.code)) {
        issues.push(`Error code "${json.error.code}" doesn't match E### pattern`);
      }
    }
  }

  return issues;
}

/**
 * Test a success response
 */
async function testSuccessResponse(name, url, options = {}) {
  testsRun++;
  logInfo(`Testing: ${name}`);

  try {
    const response = await fetch(url, options);
    const json = await response.json();

    // Validate structure
    const issues = validateResponseStructure(json, true);

    if (issues.length === 0) {
      logSuccess(`${name} - Response structure valid`);

      // Log timestamp age
      const age = Date.now() - new Date(json.timestamp).getTime();
      log(`   Timestamp age: ${age}ms`, colors.yellow);

      return json;
    } else {
      logError(`${name} - Invalid structure:`);
      issues.forEach((issue) => log(`   - ${issue}`, colors.red));
      return null;
    }
  } catch (error) {
    logError(`${name} - Request failed: ${error.message}`);
    return null;
  }
}

/**
 * Test an error response
 */
async function testErrorResponse(name, url, expectedCode, options = {}) {
  testsRun++;
  logInfo(`Testing: ${name}`);

  try {
    const response = await fetch(url, options);
    const json = await response.json();

    // Validate structure
    const issues = validateResponseStructure(json, false);

    if (issues.length === 0) {
      // Check error code
      if (expectedCode && json.error.code !== expectedCode) {
        logError(`${name} - Expected code ${expectedCode}, got ${json.error.code}`);
        return null;
      }

      logSuccess(`${name} - Error response structure valid`);
      log(`   Error code: ${json.error.code}`, colors.yellow);
      log(`   Message: ${json.message}`, colors.yellow);

      return json;
    } else {
      logError(`${name} - Invalid structure:`);
      issues.forEach((issue) => log(`   - ${issue}`, colors.red));
      return null;
    }
  } catch (error) {
    logError(`${name} - Request failed: ${error.message}`);
    return null;
  }
}

/**
 * Main test suite
 */
async function runTests() {
  log("\n" + "=".repeat(60), colors.bold);
  log("Response Handler Utility Tests", colors.bold);
  log("=".repeat(60) + "\n", colors.bold);

  // Test 1: Success response with data
  log("\n📦 Testing Success Responses", colors.bold);
  log("-".repeat(60));

  await testSuccessResponse(
    "GET /api/users (success with pagination)",
    `${BASE_URL}/api/users?page=1&limit=5`
  );

  await testSuccessResponse(
    "GET /api/tasks (success with filters)",
    `${BASE_URL}/api/tasks?status=InProgress&page=1&limit=5`
  );

  // Test 2: Validation errors
  log("\n🚨 Testing Validation Error Responses", colors.bold);
  log("-".repeat(60));

  await testErrorResponse(
    "POST /api/users (missing required fields)",
    `${BASE_URL}/api/users`,
    "E002",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    }
  );

  await testErrorResponse(
    "POST /api/users (invalid email format)",
    `${BASE_URL}/api/users`,
    "E003",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "invalid-email",
        name: "Test User",
        password: "password123",
      }),
    }
  );

  await testErrorResponse(
    "POST /api/tasks (missing required fields)",
    `${BASE_URL}/api/tasks`,
    "E002",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test Task" }),
    }
  );

  await testErrorResponse("POST /api/tasks (invalid status)", `${BASE_URL}/api/tasks`, "E003", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Test Task",
      status: "InvalidStatus",
      creatorId: "user_123",
    }),
  });

  // Test 3: Not Found errors
  log("\n🔍 Testing Not Found Error Responses", colors.bold);
  log("-".repeat(60));

  await testErrorResponse(
    "GET /api/users/[invalid-id] (user not found)",
    `${BASE_URL}/api/users/00000000-0000-0000-0000-000000000000`,
    "E004"
  );

  await testErrorResponse(
    "GET /api/tasks/[invalid-id] (task not found)",
    `${BASE_URL}/api/tasks/00000000-0000-0000-0000-000000000000`,
    "E004"
  );

  // Test 4: Duplicate entry errors
  log("\n🔄 Testing Duplicate Entry Error Responses", colors.bold);
  log("-".repeat(60));

  // First, create a user
  const createRes = await fetch(`${BASE_URL}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "duplicate-test@example.com",
      name: "Duplicate Test",
      password: "password123",
    }),
  });

  if (createRes.ok) {
    // Try to create the same user again
    await testErrorResponse("POST /api/users (duplicate email)", `${BASE_URL}/api/users`, "E006", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "duplicate-test@example.com",
        name: "Duplicate Test 2",
        password: "password456",
      }),
    });
  }

  // Test 5: Response timing
  log("\n⏱️  Testing Response Timing", colors.bold);
  log("-".repeat(60));

  testsRun++;
  const start = Date.now();
  const res = await fetch(`${BASE_URL}/api/users?page=1&limit=10`);
  const json = await res.json();
  const end = Date.now();
  const requestTime = end - start;
  const timestampTime = new Date(json.timestamp).getTime();
  const timestampAge = end - timestampTime;

  logSuccess("Response timing test completed");
  log(`   Request time: ${requestTime}ms`, colors.yellow);
  log(`   Timestamp age: ${timestampAge}ms`, colors.yellow);
  log(`   Timestamp: ${json.timestamp}`, colors.yellow);

  if (timestampAge > 5000) {
    logError("⚠️  Warning: Timestamp is more than 5 seconds old!");
  }

  // Test 6: Consistency across endpoints
  log("\n🔗 Testing Consistency Across Endpoints", colors.bold);
  log("-".repeat(60));

  testsRun++;
  const endpoints = [`${BASE_URL}/api/users`, `${BASE_URL}/api/tasks`, `${BASE_URL}/api/comments`];

  const responses = await Promise.all(endpoints.map((url) => fetch(url).then((r) => r.json())));

  const fields = ["success", "message", "data", "timestamp"];
  const allHaveFields = responses.every((res) =>
    fields.every((field) => res.hasOwnProperty(field))
  );

  if (allHaveFields) {
    logSuccess("All endpoints have consistent response structure");
    log(`   Checked fields: ${fields.join(", ")}`, colors.yellow);
  } else {
    logError("Inconsistent response structure across endpoints");
  }

  // Summary
  log("\n" + "=".repeat(60), colors.bold);
  log("Test Summary", colors.bold);
  log("=".repeat(60), colors.bold);
  log(`Total tests: ${testsRun}`, colors.blue);
  log(`Passed: ${testsPassed}`, colors.green);
  log(`Failed: ${testsFailed}`, colors.red);

  if (testsFailed === 0) {
    log("\n🎉 All tests passed!", colors.green + colors.bold);
  } else {
    log(`\n⚠️  ${testsFailed} test(s) failed`, colors.red + colors.bold);
  }

  log("");
}

// Run tests
runTests().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
