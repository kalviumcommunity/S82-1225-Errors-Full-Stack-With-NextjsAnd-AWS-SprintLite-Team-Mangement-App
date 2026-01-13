import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
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
      return NextResponse.json({ success: false, error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error("GET /api/comments/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch comment",
        message: error.message,
      },
      { status: 500 }
    );
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
      return NextResponse.json({ success: false, error: "Content is required" }, { status: 400 });
    }

    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      return NextResponse.json({ success: false, error: "Comment not found" }, { status: 404 });
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

    return NextResponse.json({
      success: true,
      message: "Comment updated successfully",
      data: comment,
    });
  } catch (error) {
    console.error("PUT /api/comments/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update comment",
        message: error.message,
      },
      { status: 500 }
    );
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
      return NextResponse.json({ success: false, error: "Comment not found" }, { status: 404 });
    }

    // Delete comment
    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
      deleted: {
        commentId: id,
      },
    });
  } catch (error) {
    console.error("DELETE /api/comments/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete comment",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
