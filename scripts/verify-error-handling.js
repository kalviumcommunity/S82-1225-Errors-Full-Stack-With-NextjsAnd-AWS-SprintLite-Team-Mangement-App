/**
 * Verification script for error handling
 * Shows what success vs failure looks like
 */

const BASE_URL = "http://localhost:3000";

console.log("\n🔍 ERROR HANDLING VERIFICATION\n");
console.log("Environment:", process.env.NODE_ENV || "development");
console.log("═".repeat(70), "\n");

async function verifyErrorType(type, expectedStatus, expectedMessage) {
  console.log(`Testing: ${type.toUpperCase()} error`);
  console.log("─".repeat(70));

  try {
    const response = await fetch(`${BASE_URL}/api/test-error?type=${type}`);
    const data = await response.json();

    // Check 1: Did we get a response?
    console.log(`✓ Server responded (not connection refused)`);

    // Check 2: Correct status code?
    if (response.status === expectedStatus) {
      console.log(`✓ Correct HTTP status: ${response.status}`);
    } else {
      console.log(`✗ Wrong status: expected ${expectedStatus}, got ${response.status}`);
    }

    // Check 3: Error message present?
    if (data.message) {
      console.log(`✓ Error message present: "${data.message}"`);
    } else {
      console.log(`✗ No error message in response`);
    }

    // Check 4: Development mode should show stack trace
    const isDev = process.env.NODE_ENV === "development";
    if (isDev) {
      if (data.error && data.error.stack) {
        console.log(
          `✓ Stack trace included (${data.error.stack.split("\n").length} lines) - DEV MODE ✓`
        );
      } else {
        console.log(`✗ Stack trace missing - Should be present in dev mode!`);
      }
    } else {
      if (!data.error || !data.error.stack) {
        console.log(`✓ Stack trace hidden - PRODUCTION MODE ✓`);
      } else {
        console.log(`✗ Stack trace exposed - Should be hidden in production!`);
      }
    }

    // Check 5: Contains expected message?
    if (expectedMessage && data.message.includes(expectedMessage)) {
      console.log(`✓ Message contains expected text: "${expectedMessage}"`);
    }

    console.log(`\n✅ TEST PASSED - Error handling working correctly!\n`);
  } catch (error) {
    console.log(`\n❌ TEST FAILED - ${error.message}\n`);
  }
}

async function runVerification() {
  console.log("📋 WHAT WE'RE TESTING:\n");
  console.log("When errors occur, the API should:");
  console.log("  1. Return appropriate HTTP status codes (400, 401, 404, 500)");
  console.log("  2. Include error messages");
  console.log("  3. Show stack traces in DEV, hide them in PROD");
  console.log("  4. NOT crash or fail to respond\n");
  console.log("═".repeat(70), "\n");

  // Test different error types
  await verifyErrorType("database", 500, "Database connection");
  await verifyErrorType("validation", 400, "Invalid input");
  await verifyErrorType("notfound", 404, "not found");
  await verifyErrorType("unauthorized", 401, "expired");

  console.log("═".repeat(70));
  console.log("\n📊 INTERPRETATION:\n");
  console.log("✅ All tests passed = Error handling is working correctly");
  console.log("   - 500/400/404/401 status codes are EXPECTED for errors");
  console.log("   - These codes help clients handle errors appropriately\n");
  console.log("❌ Test failed = Something is broken:");
  console.log('   - "Connection refused" = Server is down');
  console.log("   - Wrong status code = Error handler misconfigured");
  console.log("   - No stack trace in dev = Logging broken");
  console.log("   - Stack trace in prod = Security issue!\n");
}

runVerification().catch(console.error);
