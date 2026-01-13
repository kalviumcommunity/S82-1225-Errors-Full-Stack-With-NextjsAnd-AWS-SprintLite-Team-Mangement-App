import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
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

    return NextResponse.json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("GET /api/comments error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch comments",
        message: error.message,
      },
      { status: 500 }
    );
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
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          required: ["content", "taskId", "userId"],
        },
        { status: 400 }
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

    return NextResponse.json(
      {
        success: true,
        message: "Comment created successfully",
        data: comment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/comments error:", error);

    // Handle foreign key constraint violations
    if (error.code === "P2003") {
      return NextResponse.json(
        { success: false, error: "Invalid taskId or userId" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create comment",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
