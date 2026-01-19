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
import { updateUserSchema } from "@/lib/schemas/userSchema";

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

    // Validate request body with Zod
    const validatedData = updateUserSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return sendError("User not found", ERROR_CODES.USER_NOT_FOUND, 404);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: validatedData,
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

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return handleZodError(error);
    }

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
