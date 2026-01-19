/**
 * Task Validation Schema
 *
 * Defines validation rules for task creation and updates using Zod.
 * Ensures data integrity for task management operations.
 */

import { z } from "zod";

/**
 * Task Creation Schema
 * Used for POST /api/tasks
 */
export const createTaskSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters long")
      .max(200, "Title must not exceed 200 characters"),

    description: z
      .string()
      .max(2000, "Description must not exceed 2000 characters")
      .optional()
      .nullable(),

    status: z
      .enum(["Todo", "InProgress", "Done"], {
        errorMap: () => ({ message: "Status must be Todo, InProgress, or Done" }),
      })
      .optional()
      .default("Todo"),

    priority: z
      .enum(["Low", "Medium", "High"], {
        errorMap: () => ({ message: "Priority must be Low, Medium, or High" }),
      })
      .optional()
      .default("Medium"),

    creatorId: z.string().uuid("Creator ID must be a valid UUID").min(1, "Creator ID is required"),

    assigneeId: z.string().uuid("Assignee ID must be a valid UUID").optional().nullable(),

    dueDate: z
      .string()
      .datetime("Due date must be a valid ISO 8601 datetime")
      .or(z.date())
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      // If dueDate is provided, ensure it's in the future
      if (data.dueDate) {
        const dueDate = typeof data.dueDate === "string" ? new Date(data.dueDate) : data.dueDate;
        return dueDate > new Date();
      }
      return true;
    },
    {
      message: "Due date must be in the future",
      path: ["dueDate"],
    }
  );

/**
 * Task Update Schema
 * Used for PUT /api/tasks/[id]
 * All fields are optional for partial updates
 */
export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters long")
      .max(200, "Title must not exceed 200 characters")
      .optional(),

    description: z
      .string()
      .max(2000, "Description must not exceed 2000 characters")
      .optional()
      .nullable(),

    status: z
      .enum(["Todo", "InProgress", "Done"], {
        errorMap: () => ({ message: "Status must be Todo, InProgress, or Done" }),
      })
      .optional(),

    priority: z
      .enum(["Low", "Medium", "High"], {
        errorMap: () => ({ message: "Priority must be Low, Medium, or High" }),
      })
      .optional(),

    assigneeId: z.string().uuid("Assignee ID must be a valid UUID").optional().nullable(),

    dueDate: z
      .string()
      .datetime("Due date must be a valid ISO 8601 datetime")
      .or(z.date())
      .optional()
      .nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

/**
 * Task Query Parameters Schema
 * Used for GET /api/tasks with filtering and sorting
 */
export const taskQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a positive number")
    .transform(Number)
    .refine((n) => n >= 1, "Page must be at least 1")
    .optional()
    .default("1"),

  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a positive number")
    .transform(Number)
    .refine((n) => n >= 1 && n <= 100, "Limit must be between 1 and 100")
    .optional()
    .default("10"),

  status: z.enum(["Todo", "InProgress", "Done"]).optional(),

  priority: z.enum(["Low", "Medium", "High"]).optional(),

  assigneeId: z.string().uuid("Assignee ID must be a valid UUID").optional(),

  creatorId: z.string().uuid("Creator ID must be a valid UUID").optional(),

  sortBy: z
    .enum(["createdAt", "dueDate", "priority", "title"], {
      errorMap: () => ({ message: "Sort by must be createdAt, dueDate, priority, or title" }),
    })
    .optional()
    .default("createdAt"),

  sortOrder: z
    .enum(["asc", "desc"], {
      errorMap: () => ({ message: "Sort order must be asc or desc" }),
    })
    .optional()
    .default("desc"),
});

/**
 * Type inference helpers (for documentation)
 */
// type CreateTaskInput = z.infer<typeof createTaskSchema>;
// type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
// type TaskQueryParams = z.infer<typeof taskQuerySchema>;
