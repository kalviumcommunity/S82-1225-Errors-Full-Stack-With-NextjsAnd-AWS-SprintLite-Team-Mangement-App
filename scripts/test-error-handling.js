/**
 * Test script for centralized error handling
 * Tests different error types in both development and production modes
 */

const BASE_URL = "http://localhost:3000";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
};

async function testErrorType(type) {
  console.log(`\n${colors.blue}Testing ${type} error...${colors.reset}`);

  try {
    const response = await fetch(`${BASE_URL}/api/test-error?type=${type}`);
    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));

    if (data.error) {
      console.log(`${colors.yellow}Error details:${colors.reset}`);
      console.log(`  Message: ${data.error.message}`);
      if (data.error.details) {
        console.log(`  Details:`, JSON.stringify(data.error.details, null, 2));
      }
      if (data.error.stack) {
        console.log(`${colors.magenta}  Stack trace available${colors.reset}`);
      }
    }
  } catch (error) {
    console.log(`${colors.red}Request failed: ${error.message}${colors.reset}`);
  }
}

async function runTests() {
  console.log(
    `${colors.bright}${colors.green}═══════════════════════════════════════════════${colors.reset}`
  );
  console.log(`${colors.bright}  ERROR HANDLING TEST SUITE${colors.reset}`);
  console.log(
    `${colors.bright}  Environment: ${process.env.NODE_ENV || "development"}${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.green}═══════════════════════════════════════════════${colors.reset}\n`
  );

  const errorTypes = ["database", "validation", "notfound", "unauthorized", "generic", "success"];

  for (const type of errorTypes) {
    await testErrorType(type);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay between requests
  }

  console.log(
    `\n${colors.bright}${colors.green}═══════════════════════════════════════════════${colors.reset}`
  );
  console.log(`${colors.bright}  TESTS COMPLETED${colors.reset}`);
  console.log(
    `${colors.bright}${colors.green}═══════════════════════════════════════════════${colors.reset}\n`
  );

  console.log(`${colors.yellow}Expected behavior:${colors.reset}`);
  console.log(
    `${colors.yellow}  Development mode:${colors.reset} Full error details + stack traces`
  );
  console.log(
    `${colors.yellow}  Production mode:${colors.reset} Generic "Something went wrong" messages\n`
  );
}

// Run tests
runTests().catch(console.error);
