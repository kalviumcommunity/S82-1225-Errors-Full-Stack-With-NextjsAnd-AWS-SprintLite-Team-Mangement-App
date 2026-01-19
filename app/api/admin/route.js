import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { sendSuccess, sendError, ERROR_CODES } from "@/lib/responseHandler";
import { handleError } from "@/lib/errorHandler";
import { logRequest, logResponse } from "@/lib/logger";

/**
 * GET /api/admin
 * Admin-only endpoint - Get system statistics
 *
 * Requires: Admin or Owner role
 */
export async function GET(request) {
  try {
    logRequest(request, "GET /api/admin");

    // Require Admin or Owner role
    const authResult = requireRole(request, ["Admin", "Owner"]);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    // Fetch admin statistics
    const [userCount, taskCount, commentCount, adminUsers] = await prisma.$transaction([
      prisma.user.count(),
      prisma.task.count(),
      prisma.comment.count(),
      prisma.user.findMany({
        where: {
          role: {
            in: ["Admin", "Owner"],
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    const stats = {
      totalUsers: userCount,
      totalTasks: taskCount,
      totalComments: commentCount,
      adminUsers: adminUsers,
      timestamp: new Date().toISOString(),
    };

    const response = sendSuccess(stats, "Admin statistics fetched successfully");
    logResponse(request, response, 200);
    return response;
  } catch (error) {
    return handleError(error, "GET /api/admin");
  }
}

/**
 * POST /api/admin
 * Admin-only endpoint - Perform admin actions
 *
 * Requires: Owner role only
 */
export async function POST(request) {
  try {
    logRequest(request, "POST /api/admin");

    // Require Owner role (highest privilege)
    const authResult = requireRole(request, "Owner");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const body = await request.json();
    const { action, userId, newRole } = body;

    // Example admin action: Change user role
    if (action === "changeRole" && userId && newRole) {
      const validRoles = ["Owner", "Admin", "Member"];
      if (!validRoles.includes(newRole)) {
        return sendError("Invalid role", ERROR_CODES.VALIDATION_ERROR, 400);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      const response = sendSuccess(updatedUser, `User role updated to ${newRole}`, 200);
      logResponse(request, response, 200);
      return response;
    }

    return sendError("Invalid action", ERROR_CODES.VALIDATION_ERROR, 400);
  } catch (error) {
    return handleError(error, "POST /api/admin");
  }
}
