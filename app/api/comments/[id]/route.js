import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
import { sendSuccess, sendError, handlePrismaError, ERROR_CODES } from "@/lib/responseHandler";

const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * GET /api/comments/[id]
 * Fetch a single comment by ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const comment = await prisma.comment.findUnique({
      where: { id },
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
    });

    if (!comment) {
      return sendError("Comment not found", ERROR_CODES.COMMENT_NOT_FOUND, 404);
    }

    return sendSuccess(comment, "Comment fetched successfully");
  } catch (error) {
    console.error("GET /api/comments/[id] error:", error);
    return handlePrismaError(error);
  }
}

/**
 * PUT /api/comments/[id]
 * Update a comment's content
 *
 * Body:
 * - content: string (required)
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return sendError("Content is required", ERROR_CODES.MISSING_REQUIRED_FIELDS, 400, {
        required: ["content"],
      });
    }

    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      return sendError("Comment not found", ERROR_CODES.COMMENT_NOT_FOUND, 404);
    }

    // Update comment
    const comment = await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        user: {
          select: { id: true, name: true },
        },
        task: {
          select: { id: true, title: true },
        },
      },
    });

    return sendSuccess(comment, "Comment updated successfully");
  } catch (error) {
    console.error("PUT /api/comments/[id] error:", error);
    return handlePrismaError(error);
  }
}

/**
 * DELETE /api/comments/[id]
 * Delete a comment
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      return sendError("Comment not found", ERROR_CODES.COMMENT_NOT_FOUND, 404);
    }

    // Delete comment
    await prisma.comment.delete({
      where: { id },
    });

    return sendSuccess({ commentId: id }, "Comment deleted successfully");
  } catch (error) {
    console.error("DELETE /api/comments/[id] error:", error);
    return handlePrismaError(error);
  }
}
