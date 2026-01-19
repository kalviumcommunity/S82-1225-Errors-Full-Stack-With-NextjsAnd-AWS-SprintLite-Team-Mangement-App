/**
 * Simple demo script for error handling
 * Shows the difference between development and production error responses
 */

const BASE_URL = "http://localhost:3000";

console.log("\n🧪 TESTING ERROR HANDLING\n");
console.log("Environment:", process.env.NODE_ENV || "development");
console.log("─".repeat(60), "\n");

async function testError(type, label) {
  console.log(`📝 Testing: ${label}`);

  try {
    const response = await fetch(`${BASE_URL}/api/test-error?type=${type}`);
    const data = await response.json();

    console.log(`   Status: ${response.status}`);

    if (data.success) {
      console.log(`   ✅ Success: ${data.message}`);
    } else {
      console.log(`   ❌ Error: ${data.message}`);
      if (data.error && data.error.stack) {
        console.log(`   📚 Stack trace: Available (${data.error.stack.split("\n").length} lines)`);
      } else {
        console.log(`   📚 Stack trace: Hidden (production mode)`);
      }
    }
  } catch (error) {
    console.log(`   ⚠️  Request failed: ${error.message}`);
  }

  console.log("");
}

async function runDemo() {
  await testError("success", "Success response");
  await testError("database", "Database error (500)");
  await testError("validation", "Validation error (400)");
  await testError("notfound", "Not found error (404)");
  await testError("unauthorized", "Unauthorized error (401)");

  console.log("─".repeat(60));
  console.log("\n✨ Demo completed!\n");
  console.log("💡 In development: You see full error details + stack traces");
  console.log('🔒 In production:  You see generic "Something went wrong"');
  console.log("\n");
}

runDemo().catch(console.error);
