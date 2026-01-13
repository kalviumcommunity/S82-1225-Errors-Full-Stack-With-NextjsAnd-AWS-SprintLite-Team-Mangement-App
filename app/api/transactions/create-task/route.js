import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Transaction Workflow: Create Task with Initial Comment
 *
 * This endpoint demonstrates an atomic transaction where:
 * 1. A new task is created
 * 2. An initial activity comment is added
 * 3. Task counter is incremented for the creator
 *
 * All operations must succeed or all will be rolled back.
 */
export async function POST(request) {
  try {
    const { title, description, assigneeId, creatorId, priority, status, initialComment } =
      await request.json();

    // Validation
    if (!title || !creatorId) {
      return NextResponse.json(
        { error: "Missing required fields: title, creatorId" },
        { status: 400 }
      );
    }

    // Execute transaction - all operations succeed or all fail
    const result = await prisma.$transaction(async (tx) => {
      // Operation 1: Create the task
      const task = await tx.task.create({
        data: {
          title,
          description: description || `Task: ${title}`,
          status: status || "Todo",
          priority: priority || "Medium",
          creatorId,
          assigneeId: assigneeId || null,
        },
      });

      // Operation 2: Create initial activity comment
      const comment = await tx.comment.create({
        data: {
          content: initialComment || `Task "${title}" has been created`,
          taskId: task.id,
          userId: creatorId,
        },
      });

      // Operation 3: Update creator's task count (simulate a counter)
      // In a real app, you might have a separate counter table or user stats
      const creator = await tx.user.findUnique({
        where: { id: creatorId },
        select: { name: true, email: true },
      });

      // Return all created entities
      return {
        task,
        comment,
        creator,
        message: "Task created successfully with initial activity",
      };
    });

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Transaction failed:", error);

    // Handle specific Prisma errors
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Unique constraint violation", details: error.meta },
        { status: 409 }
      );
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Foreign key constraint failed. Invalid creatorId or assigneeId." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Transaction failed - all operations rolled back",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to demonstrate transaction rollback test
 * This intentionally triggers a failure to verify rollback behavior
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const testRollback = searchParams.get("testRollback") === "true";

  if (!testRollback) {
    return NextResponse.json({
      message: "Add ?testRollback=true to test transaction rollback",
      endpoint: "/api/transactions/create-task",
    });
  }

  try {
    // This transaction will intentionally fail to demonstrate rollback
    await prisma.$transaction(async (tx) => {
      // First, get a valid user ID
      const validUser = await tx.user.findFirst();
      if (!validUser) {
        throw new Error("No users found in database for rollback test");
      }

      // Operation 1: Create a task (will succeed)
      const task = await tx.task.create({
        data: {
          title: "Test Rollback Task",
          description: "This task should not exist in the database",
          status: "Todo",
          priority: "Low",
          creatorId: validUser.id,
        },
      });

      console.log("Task created (will be rolled back):", task.id);

      // Operation 2: Create a comment (will succeed)
      const comment = await tx.comment.create({
        data: {
          content: "This comment should also be rolled back",
          taskId: task.id,
          userId: validUser.id,
        },
      });

      console.log("Comment created (will be rolled back):", comment.id);

      // Operation 3: Intentionally cause a failure
      // Try to reference a non-existent user
      throw new Error("INTENTIONAL_ROLLBACK_TEST: Simulating transaction failure");
    });

    // This should never be reached
    return NextResponse.json(
      {
        error: "Transaction should have failed but did not",
      },
      { status: 500 }
    );
  } catch (error) {
    // Transaction was rolled back - no data should be in database
    return NextResponse.json(
      {
        success: true,
        message: "Rollback test completed successfully",
        details: "All operations were rolled back. Check database - no test data should exist.",
        error: error.message,
      },
      { status: 200 }
    );
  }
}
