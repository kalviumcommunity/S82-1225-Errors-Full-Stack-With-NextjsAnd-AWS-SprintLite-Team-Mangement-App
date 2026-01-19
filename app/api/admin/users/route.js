import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { sendSuccess, sendError, handlePrismaError, ERROR_CODES } from "@/lib/responseHandler";

/**
 * GET /api/admin/users
 * Admin-only endpoint - Get all users with detailed information
 *
 * Requires: Admin or Owner role
 */
export async function GET(request) {
  try {
    // Require Admin or Owner role
    const authResult = requireRole(request, ["Admin", "Owner"]);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (role) {
      where.role = role;
    }

    // Fetch users with full details
    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              createdTasks: true,
              assignedTasks: true,
              comments: true,
              sessions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendSuccess(
      {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      "Admin users list fetched successfully"
    );
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return handlePrismaError(error);
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Admin-only endpoint - Delete any user (Owner only)
 *
 * Requires: Owner role
 */
export async function DELETE(request) {
  try {
    // Require Owner role
    const authResult = requireRole(request, "Owner");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return sendError("User ID is required", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // Prevent self-deletion
    if (authResult.user.userId === userId) {
      return sendError("Cannot delete your own account", ERROR_CODES.FORBIDDEN, 403);
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      return sendError("User not found", ERROR_CODES.USER_NOT_FOUND, 404);
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    return sendSuccess(
      {
        userId,
        deletedUser: {
          name: user.name,
          email: user.email,
        },
        cascaded: {
          createdTasks: user._count.createdTasks,
          comments: user._count.comments,
        },
      },
      "User deleted successfully"
    );
  } catch (error) {
    console.error("DELETE /api/admin/users error:", error);
    return handlePrismaError(error);
  }
}
