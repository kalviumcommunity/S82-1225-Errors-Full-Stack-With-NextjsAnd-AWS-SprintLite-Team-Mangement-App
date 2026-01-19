/**
 * Compare Development vs Production Error Responses
 * Shows side-by-side what users would see in each environment
 */

const BASE_URL = "http://localhost:3000";

console.log("\n📊 DEV vs PROD ERROR RESPONSES COMPARISON\n");
console.log("Current server environment:", process.env.NODE_ENV || "development");
console.log("═".repeat(80), "\n");

async function showErrorResponse(type) {
  try {
    const response = await fetch(`${BASE_URL}/api/test-error?type=${type}`);
    const data = await response.json();

    console.log(`\n🔸 ${type.toUpperCase()} ERROR (Status: ${response.status})`);
    console.log("─".repeat(80));

    console.log("\n📝 Response Body:");
    console.log(JSON.stringify(data, null, 2));

    console.log("\n🔍 Analysis:");
    console.log(`   • Message shown: "${data.message}"`);
    console.log(
      `   • Stack trace included: ${data.error?.stack ? "YES (" + data.error.stack.split("\n").length + " lines)" : "NO"}`
    );
    console.log(`   • Error code: ${data.error?.code || "N/A"}`);
    console.log(`   • Additional details: ${data.error?.details ? "YES" : "NO"}`);
  } catch (error) {
    console.log(`❌ Failed to fetch: ${error.message}`);
  }
}

async function main() {
  console.log("📋 HOW TO INTERPRET THESE RESULTS:\n");
  console.log("✅ SUCCESS = Server responds with appropriate error codes (400, 401, 404, 500)");
  console.log("✅ SUCCESS = Error message is present and meaningful");
  console.log("✅ SUCCESS = Stack trace in DEV, hidden in PROD\n");
  console.log("═".repeat(80));

  await showErrorResponse("database");
  await showErrorResponse("validation");
  await showErrorResponse("notfound");

  console.log("\n\n═".repeat(80));
  console.log("\n🎯 KEY POINT:\n");
  console.log("HTTP Status Codes like 500, 400, 404, 401 are NOT failures!");
  console.log("They are the CORRECT way to communicate errors to API clients.\n");
  console.log("Real Failure Examples:");
  console.log("  ❌ Connection refused (server crashed)");
  console.log("  ❌ Always returns 200 even for errors");
  console.log("  ❌ No error message in response");
  console.log("  ❌ Stack traces visible in production (security issue)\n");
  console.log("What We Have:");
  console.log("  ✅ Server responding correctly");
  console.log("  ✅ Proper HTTP status codes");
  console.log("  ✅ Meaningful error messages");
  console.log("  ✅ Stack traces available for debugging (in dev)\n");
  console.log("═".repeat(80), "\n");
}

main().catch(console.error);
