import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
import { ZodError } from "zod";
import {
  sendSuccess,
  sendError,
  handlePrismaError,
  handleZodError,
  ERROR_CODES,
} from "@/lib/responseHandler";
import { createTaskSchema, taskQuerySchema } from "@/lib/schemas/taskSchema";

const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * GET /api/tasks
 * Fetch all tasks with pagination, filtering, and sorting
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - status: Filter by status (Todo, InProgress, Done)
 * - priority: Filter by priority (Low, Medium, High)
 * - assigneeId: Filter by assigned user
 * - creatorId: Filter by creator
 * - sortBy: Sort field (createdAt, dueDate, priority)
 * - sortOrder: Sort direction (asc, desc)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assigneeId = searchParams.get("assigneeId");
    const creatorId = searchParams.get("creatorId");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (creatorId) where.creatorId = creatorId;

    // Fetch tasks with pagination
    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.task.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendSuccess(
      {
        tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        filters: {
          status,
          priority,
          assigneeId,
          creatorId,
        },
        sorting: {
          sortBy,
          sortOrder,
        },
      },
      "Tasks fetched successfully"
    );
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return handlePrismaError(error);
  }
}

/**
 * POST /api/tasks
 * Create a new task
 *
 * Body:
 * - title: string (required)
 * - description: string (optional)
 * - status: string (optional, default: "Todo")
 * - priority: string (optional, default: "Medium")
 * - creatorId: string (required)
 * - assigneeId: string (optional)
 * - dueDate: string (optional, ISO date)
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const validatedData = createTaskSchema.parse(body);
    const { title, description, status, priority, creatorId, assigneeId, dueDate } = validatedData;

    // Create task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        creatorId,
        assigneeId,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return sendSuccess(task, "Task created successfully", 201);
  } catch (error) {
    console.error("POST /api/tasks error:", error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return handleZodError(error);
    }

    return handlePrismaError(error);
  }
}

export const dynamic = "force-dynamic";
