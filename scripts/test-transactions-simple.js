/**
 * Simple Transaction Verification Script
 * Directly tests transaction behavior without API calls
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Colors
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
  log("\n✅ Test 1: Successful Transaction", "cyan");
  log("=".repeat(60), "cyan");

  try {
    // Get a valid user
    const user = await prisma.user.findFirst();
    if (!user) {
      throw new Error("No users in database. Run seed script first.");
    }

    // Execute atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create task
      const task = await tx.task.create({
        data: {
          title: "Transaction Test Task",
          description: "Testing atomic transaction",
          status: "Todo",
          priority: "High",
          creatorId: user.id,
          assigneeId: user.id,
        },
      });

      // Create comment
      const comment = await tx.comment.create({
        data: {
          content: "Task created via transaction",
          taskId: task.id,
          userId: user.id,
        },
      });

      return { task, comment };
    });

    log(`✅ Transaction succeeded!`, "green");
    log(`   Task: ${result.task.title} (${result.task.id})`, "green");
    log(`   Comment: ${result.comment.content} (${result.comment.id})`, "green");

    // Verify in database
    const taskExists = await prisma.task.findUnique({
      where: { id: result.task.id },
      include: { comments: true },
    });

    log(`✅ Verified: Task exists with ${taskExists.comments.length} comment(s)`, "green");
    return true;
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, "red");
    return false;
  }
}

async function testRollbackTransaction() {
  log("\n🔄 Test 2: Transaction Rollback", "cyan");
  log("=".repeat(60), "cyan");

  let createdTaskId = null;

  try {
    const user = await prisma.user.findFirst();

    // This should rollback
    await prisma.$transaction(async (tx) => {
      // Create task (succeeds)
      const task = await tx.task.create({
        data: {
          title: "Rollback Test Task",
          description: "This should be rolled back",
          status: "Todo",
          priority: "Low",
          creatorId: user.id,
        },
      });
      createdTaskId = task.id;

      // Create comment (succeeds)
      await tx.comment.create({
        data: {
          content: "This comment should be rolled back",
          taskId: task.id,
          userId: user.id,
        },
      });

      // Intentionally fail
      throw new Error("ROLLBACK_TEST: Intentional failure");
    });

    log(`❌ Transaction should have rolled back but didn't`, "red");
    return false;
  } catch (error) {
    if (error.message.includes("ROLLBACK_TEST")) {
      // Transaction was rolled back, verify nothing exists
      const taskExists = await prisma.task.findUnique({
        where: { id: createdTaskId },
      });

      if (!taskExists) {
        log(`✅ Rollback successful!`, "green");
        log(`   Task was rolled back (does not exist in database)`, "green");
        return true;
      } else {
        log(`❌ Rollback failed: Task still exists`, "red");
        return false;
      }
    } else {
      log(`❌ Unexpected error: ${error.message}`, "red");
      return false;
    }
  }
}

async function runTests() {
  log("\n🚀 Transaction Workflow Tests", "bold");
  log("=".repeat(60), "cyan");

  const test1 = await testSuccessfulTransaction();
  const test2 = await testRollbackTransaction();

  log("\n📊 Summary", "bold");
  log("=".repeat(60), "cyan");
  log(`Test 1 (Success): ${test1 ? "✅ PASSED" : "❌ FAILED"}`, test1 ? "green" : "red");
  log(`Test 2 (Rollback): ${test2 ? "✅ PASSED" : "❌ FAILED"}`, test2 ? "green" : "red");

  if (test1 && test2) {
    log("\n✅ All transaction tests passed!", "green");
    log("\nTransaction Guarantees Verified:", "cyan");
    log("  ✅ Atomic commits (all operations succeed together)", "green");
    log("  ✅ Automatic rollbacks (nothing persists on failure)", "green");
    log("  ✅ Data consistency maintained", "green");
  }

  await prisma.$disconnect();
  await pool.end();
  log("\n🏁 Tests complete\n", "cyan");
}

runTests().catch(console.error);
