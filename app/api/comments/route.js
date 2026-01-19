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
import { createCommentSchema, commentQuerySchema } from "@/lib/schemas/commentSchema";

const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * GET /api/comments
 * Fetch all comments with pagination and filtering
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - taskId: Filter by task
 * - userId: Filter by user
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const taskId = searchParams.get("taskId");
    const userId = searchParams.get("userId");

    // Build where clause
    const where = {};
    if (taskId) where.taskId = taskId;
    if (userId) where.userId = userId;

    // Fetch comments with pagination
    const [comments, total] = await prisma.$transaction([
      prisma.comment.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.comment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendSuccess(
      {
        comments,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      "Comments fetched successfully"
    );
  } catch (error) {
    console.error("GET /api/comments error:", error);
    return handlePrismaError(error);
  }
}

/**
 * POST /api/comments
 * Create a new comment
 *
 * Body:
 * - content: string (required)
 * - taskId: string (required)
 * - userId: string (required)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { content, taskId, userId } = body;

    // Validation
    if (!content || !taskId || !userId) {
      return sendError(
        "Missing required fields: content, taskId, userId",
        ERROR_CODES.MISSING_REQUIRED_FIELDS,
        400,
        { required: ["content", "taskId", "userId"] }
      );
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        taskId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return sendSuccess(comment, "Comment created successfully", 201);
  } catch (error) {
    console.error("POST /api/comments error:", error);
    return handlePrismaError(error);
  }
}
