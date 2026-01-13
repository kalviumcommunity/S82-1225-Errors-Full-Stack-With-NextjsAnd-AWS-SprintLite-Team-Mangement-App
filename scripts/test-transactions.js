/**
 * Transaction Test Script
 *
 * Tests the transaction workflow endpoint to verify:
 * 1. Successful transaction creates task + comment + user data atomically
 * 2. Failed transaction rolls back all operations
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const API_URL = "http://localhost:3000";

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testSuccessfulTransaction() {
  log("\n📝 Test 1: Successful Transaction", "cyan");
  log("=".repeat(60), "cyan");

  try {
    // Get a valid user ID from seed data
    const userId = "cmk5dw9kv0000ecuedwosh7ir"; // Mohit's ID from seed

    const response = await fetch(`${API_URL}/api/transactions/create-task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Transaction Task",
        description: "This task is created via transaction",
        creatorId: userId,
        assigneeId: userId,
        priority: "High",
        status: "Todo",
        initialComment: "Task created successfully via transaction workflow",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      log("✅ Transaction succeeded!", "green");
      log(`   Task ID: ${data.task.id}`, "green");
      log(`   Task Title: ${data.task.title}`, "green");
      log(`   Comment ID: ${data.comment.id}`, "green");
      log(`   Comment: ${data.comment.content}`, "green");
      log(`   Creator: ${data.creator.name} (${data.creator.email})`, "green");
      return { success: true, data };
    } else {
      log(`❌ Transaction failed: ${data.error}`, "red");
      return { success: false, error: data.error };
    }
  } catch (error) {
    log(`❌ Request failed: ${error.message}`, "red");
    return { success: false, error: error.message };
  }
}

async function testRollbackTransaction() {
  log("\n🔄 Test 2: Transaction Rollback", "cyan");
  log("=".repeat(60), "cyan");

  try {
    const response = await fetch(`${API_URL}/api/transactions/create-task?testRollback=true`, {
      method: "GET",
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log("✅ Rollback test succeeded!", "green");
      log(`   Message: ${data.message}`, "green");
      log(`   Details: ${data.details}`, "green");
      log(`   Error triggered: ${data.error}`, "yellow");
      return { success: true, data };
    } else {
      log(`❌ Rollback test unexpected result`, "red");
      console.log(data);
      return { success: false, error: data };
    }
  } catch (error) {
    log(`❌ Request failed: ${error.message}`, "red");
    return { success: false, error: error.message };
  }
}

async function testFailedTransaction() {
  log("\n⚠️  Test 3: Transaction with Invalid Data", "cyan");
  log("=".repeat(60), "cyan");

  try {
    const response = await fetch(`${API_URL}/api/transactions/create-task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Invalid Transaction",
        description: "This should fail due to invalid creatorId",
        creatorId: "invalid-user-id-does-not-exist",
        priority: "Medium",
        status: "Todo",
      }),
    });

    const data = await response.json();

    if (!response.ok && data.error) {
      log("✅ Failed transaction handled correctly!", "green");
      log(`   Error: ${data.error}`, "yellow");
      log(`   Details: ${data.details || "N/A"}`, "yellow");
      return { success: true, data };
    } else {
      log(`❌ Transaction should have failed but succeeded`, "red");
      return { success: false, error: "Expected failure" };
    }
  } catch (error) {
    log(`❌ Request failed: ${error.message}`, "red");
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log("\n🚀 Starting Transaction Workflow Tests", "bold");
  log("=".repeat(60), "cyan");

  const results = {
    successfulTransaction: await testSuccessfulTransaction(),
    rollbackTransaction: await testRollbackTransaction(),
    failedTransaction: await testFailedTransaction(),
  };

  // Summary
  log("\n📊 Test Summary", "bold");
  log("=".repeat(60), "cyan");

  const allPassed = Object.values(results).every((r) => r.success);

  if (allPassed) {
    log("\n✅ All tests passed!", "green");
    log("\nTransaction Workflow Verified:", "cyan");
    log("  ✅ Successful transactions create all records atomically", "green");
    log("  ✅ Failed transactions roll back completely", "green");
    log("  ✅ Invalid data is rejected with proper error handling", "green");
  } else {
    log("\n❌ Some tests failed", "red");
    Object.entries(results).forEach(([name, result]) => {
      const status = result.success ? "✅" : "❌";
      log(`  ${status} ${name}`, result.success ? "green" : "red");
    });
  }

  log("\n" + "=".repeat(60), "cyan");
}

// Run tests
runTests().catch((error) => {
  log(`\n❌ Test suite failed: ${error.message}`, "red");
  console.error(error);
  process.exit(1);
});
