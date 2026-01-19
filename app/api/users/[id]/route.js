import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
import { sendSuccess, sendError, handlePrismaError, ERROR_CODES } from "@/lib/responseHandler";

const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * GET /api/users/[id]
 * Fetch a single user by ID with related data
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        createdTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        assignedTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            task: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            createdTasks: true,
            assignedTasks: true,
            comments: true,
            sessions: true,
          },
        },
      },
    });

    if (!user) {
      return sendError("User not found", ERROR_CODES.USER_NOT_FOUND, 404);
    }

    return sendSuccess(user, "User fetched successfully");
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return handlePrismaError(error);
  }
}

/**
 * PUT /api/users/[id]
 * Update a user's information
 *
 * Body (all optional):
 * - name: string
 * - role: string
 * - avatar: string
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, role, avatar } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return sendError("User not found", ERROR_CODES.USER_NOT_FOUND, 404);
    }

    // Build update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (avatar !== undefined) updateData.avatar = avatar;

    if (Object.keys(updateData).length === 0) {
      return sendError("No fields to update", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        updatedAt: true,
      },
    });

    return sendSuccess(user, "User updated successfully");
  } catch (error) {
    console.error("PUT /api/users/[id] error:", error);
    return handlePrismaError(error);
  }
}

/**
 * DELETE /api/users/[id]
 * Delete a user and cascade to related data
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            createdTasks: true,
            assignedTasks: true,
            comments: true,
          },
        },
      },
    });

    if (!existingUser) {
      return sendError("User not found", ERROR_CODES.USER_NOT_FOUND, 404);
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    return sendSuccess(
      {
        userId: id,
        cascaded: {
          createdTasks: existingUser._count.createdTasks,
          comments: existingUser._count.comments,
        },
      },
      "User deleted successfully"
    );
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error);
    return handlePrismaError(error);
  }
}
