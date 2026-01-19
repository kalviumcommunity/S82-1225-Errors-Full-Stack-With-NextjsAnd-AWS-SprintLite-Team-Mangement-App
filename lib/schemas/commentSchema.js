/**
 * Comment Validation Schema
 *
 * Defines validation rules for comment creation and updates using Zod.
 * Ensures comment content integrity and proper associations.
 */

import { z } from "zod";

/**
 * Comment Creation Schema
 * Used for POST /api/comments
 */
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content cannot be empty")
    .max(1000, "Comment must not exceed 1000 characters")
    .refine((val) => val.trim().length > 0, "Comment cannot contain only whitespace"),

  taskId: z.string().uuid("Task ID must be a valid UUID").min(1, "Task ID is required"),

  userId: z.string().uuid("User ID must be a valid UUID").min(1, "User ID is required"),
});

/**
 * Comment Update Schema
 * Used for PUT /api/comments/[id]
 * Only content can be updated
 */
export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content cannot be empty")
    .max(1000, "Comment must not exceed 1000 characters")
    .refine((val) => val.trim().length > 0, "Comment cannot contain only whitespace"),
});

/**
 * Comment Query Parameters Schema
 * Used for GET /api/comments with filtering
 */
export const commentQuerySchema = z.object({
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

  taskId: z.string().uuid("Task ID must be a valid UUID").optional(),

  userId: z.string().uuid("User ID must be a valid UUID").optional(),
});

/**
 * Type inference helpers (for documentation)
 */
// type CreateCommentInput = z.infer<typeof createCommentSchema>;
// type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
// type CommentQueryParams = z.infer<typeof commentQuerySchema>;
