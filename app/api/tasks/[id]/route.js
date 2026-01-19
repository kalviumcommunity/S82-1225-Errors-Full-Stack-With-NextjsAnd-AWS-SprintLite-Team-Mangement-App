import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
import { sendSuccess, sendError, handlePrismaError, ERROR_CODES } from "@/lib/responseHandler";

const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * GET /api/tasks/[id]
 * Fetch a single task by ID with all related data
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const task = await prisma.task.findUnique({
      where: { id },
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
        comments: {
          include: {
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
      },
    });

    if (!task) {
      return sendError("Task not found", ERROR_CODES.TASK_NOT_FOUND, 404);
    }

    return sendSuccess(task, "Task fetched successfully");
  } catch (error) {
    console.error("GET /api/tasks/[id] error:", error);
    return handlePrismaError(error);
  }
}

/**
 * PUT /api/tasks/[id]
 * Update a task
 *
 * Body (all optional):
 * - title: string
 * - description: string
 * - status: string (Todo, InProgress, Done)
 * - priority: string (Low, Medium, High)
 * - assigneeId: string
 * - dueDate: string (ISO date)
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, description, status, priority, assigneeId, dueDate } = body;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return sendError("Task not found", ERROR_CODES.TASK_NOT_FOUND, 404);
    }

    // Validate status
    if (status) {
      const validStatuses = ["Todo", "InProgress", "Done"];
      if (!validStatuses.includes(status)) {
        return sendError("Invalid status value", ERROR_CODES.INVALID_INPUT, 400, {
          validValues: validStatuses,
          provided: status,
        });
      }
    }

    // Validate priority
    if (priority) {
      const validPriorities = ["Low", "Medium", "High"];
      if (!validPriorities.includes(priority)) {
        return sendError("Invalid priority value", ERROR_CODES.INVALID_INPUT, 400, {
          validValues: validPriorities,
          provided: priority,
        });
      }
    }

    // Build update data
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    if (Object.keys(updateData).length === 0) {
      return sendError("No fields to update", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // Update task
    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return sendSuccess(task, "Task updated successfully");
  } catch (error) {
    console.error("PUT /api/tasks/[id] error:", error);
    return handlePrismaError(error);
  }
}

/**
 * DELETE /api/tasks/[id]
 * Delete a task and cascade to comments
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        _count: {
          select: { comments: true },
        },
      },
    });

    if (!existingTask) {
      return sendError("Task not found", ERROR_CODES.TASK_NOT_FOUND, 404);
    }

    // Delete task (cascade will handle comments)
    await prisma.task.delete({
      where: { id },
    });

    return sendSuccess(
      {
        taskId: id,
        cascaded: {
          comments: existingTask._count.comments,
        },
      },
      "Task deleted successfully"
    );
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return handlePrismaError(error);
  }
}
