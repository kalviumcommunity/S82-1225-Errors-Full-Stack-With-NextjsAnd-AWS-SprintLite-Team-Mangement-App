import dotenv from "dotenv";
// Must load environment before importing Prisma
dotenv.config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
const { Pool } = pkg;

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * ANTI-PATTERN: Over-fetching - retrieving all fields when only few are needed
 * BAD: Fetches all user fields including password hash
 */
export async function getUsersUnoptimized() {
  const startTime = Date.now();
  const users = await prisma.user.findMany(); // Fetches ALL fields
  const duration = Date.now() - startTime;

  return { users, duration, method: "unoptimized" };
}

/**
 * OPTIMIZED: Use select to fetch only required fields
 * GOOD: Only fetches necessary fields, reduces data transfer
 */
export async function getUsersOptimized() {
  const startTime = Date.now();
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
      // Excludes password, updatedAt, and relations
    },
    orderBy: { createdAt: "desc" },
  });
  const duration = Date.now() - startTime;

  return { users, duration, method: "optimized-select" };
}

/**
 * ANTI-PATTERN: N+1 Query Problem - fetching tasks then looping to get comments
 * BAD: Makes 1 query for tasks + N queries for each task's comments
 */
export async function getTasksWithCommentsUnoptimized() {
  const startTime = Date.now();

  const tasks = await prisma.task.findMany({
    take: 10,
  });

  // N+1 problem: Makes a separate query for each task
  const tasksWithComments = await Promise.all(
    tasks.map(async (task) => {
      const comments = await prisma.comment.findMany({
        where: { taskId: task.id },
      });
      return { ...task, comments };
    })
  );

  const duration = Date.now() - startTime;
  return { tasks: tasksWithComments, duration, method: "n-plus-1" };
}

/**
 * OPTIMIZED: Use include to fetch related data in single query
 * GOOD: Single query with JOIN, leverages @@index([taskId])
 */
export async function getTasksWithCommentsOptimized() {
  const startTime = Date.now();

  const tasks = await prisma.task.findMany({
    take: 10,
    include: {
      comments: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const duration = Date.now() - startTime;
  return { tasks, duration, method: "optimized-include" };
}

/**
 * OPTIMIZED: Paginated query with proper indexing
 * Uses cursor-based pagination for better performance at scale
 */
export async function getTasksPaginated(cursor = null, pageSize = 20) {
  const startTime = Date.now();

  const tasks = await prisma.task.findMany({
    take: pageSize,
    ...(cursor && {
      skip: 1, // Skip the cursor
      cursor: { id: cursor },
    }),
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      dueDate: true,
      createdAt: true,
      assignee: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const duration = Date.now() - startTime;

  return {
    tasks,
    nextCursor: tasks.length === pageSize ? tasks[tasks.length - 1].id : null,
    duration,
    method: "cursor-pagination",
  };
}

/**
 * OPTIMIZED: Filtered query leveraging compound indexes
 * Uses @@index([status, createdAt]) for efficient filtering and sorting
 */
export async function getTasksByStatusOptimized(status = "Todo", limit = 20) {
  const startTime = Date.now();

  const tasks = await prisma.task.findMany({
    where: { status },
    take: limit,
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      dueDate: true,
      createdAt: true,
      updatedAt: true,
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" }, // Uses compound index [status, createdAt]
  });

  const duration = Date.now() - startTime;
  return { tasks, duration, method: "indexed-filter", indexUsed: "[status, createdAt]" };
}

/**
 * OPTIMIZED: Bulk operations using createMany
 * Much faster than multiple create() calls
 */
export async function bulkCreateComments(commentsData) {
  const startTime = Date.now();

  const result = await prisma.comment.createMany({
    data: commentsData,
    skipDuplicates: true, // Skip records with unique constraint violations
  });

  const duration = Date.now() - startTime;
  return {
    count: result.count,
    duration,
    method: "createMany",
    recordsPerMs: (result.count / duration).toFixed(2),
  };
}

/**
 * OPTIMIZED: Complex query with multiple filters using compound indexes
 * Uses @@index([assigneeId, status]) for efficient user task filtering
 */
export async function getUserTasksByStatus(userId, status = "InProgress") {
  const startTime = Date.now();

  const tasks = await prisma.task.findMany({
    where: {
      assigneeId: userId,
      status: status,
    },
    select: {
      id: true,
      title: true,
      description: true,
      priority: true,
      dueDate: true,
      createdAt: true,
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: [
      { priority: "desc" }, // High priority first
      { dueDate: "asc" }, // Then by due date
    ],
  });

  const duration = Date.now() - startTime;
  return {
    tasks,
    duration,
    method: "compound-index-filter",
    indexUsed: "[assigneeId, status]",
  };
}

/**
 * OPTIMIZED: Aggregation query for dashboard statistics
 * Uses indexes for WHERE clauses and efficient counting
 */
export async function getDashboardStats(userId) {
  const startTime = Date.now();

  // Run aggregations in parallel
  const [totalTasks, todoTasks, inProgressTasks, doneTasks, highPriorityTasks, recentComments] =
    await prisma.$transaction([
      prisma.task.count({ where: { assigneeId: userId } }),
      prisma.task.count({ where: { assigneeId: userId, status: "Todo" } }),
      prisma.task.count({ where: { assigneeId: userId, status: "InProgress" } }),
      prisma.task.count({ where: { assigneeId: userId, status: "Done" } }),
      prisma.task.count({ where: { assigneeId: userId, priority: "High" } }),
      prisma.comment.count({ where: { userId } }),
    ]);

  const duration = Date.now() - startTime;

  return {
    stats: {
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      highPriorityTasks,
      recentComments,
    },
    duration,
    method: "parallel-aggregations",
  };
}

/**
 * Export for cleanup
 */
export async function cleanup() {
  await prisma.$disconnect();
  await pool.end();
}
