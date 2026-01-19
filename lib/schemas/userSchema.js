/**
 * User Validation Schema
 *
 * Defines validation rules for user creation and updates using Zod.
 * Can be reused on both client and server for consistent validation.
 */

import { z } from "zod";

/**
 * User Creation Schema
 * Used for POST /api/users
 */
export const createUserSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),

  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must not exceed 100 characters"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password must not exceed 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  role: z
    .enum(["Owner", "Admin", "Member"], {
      errorMap: () => ({ message: "Role must be Owner, Admin, or Member" }),
    })
    .optional()
    .default("Member"),

  avatar: z.string().url("Avatar must be a valid URL").optional().nullable(),
});

/**
 * User Update Schema
 * Used for PUT /api/users/[id]
 * All fields are optional for partial updates
 */
export const updateUserSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(100, "Name must not exceed 100 characters")
      .optional(),

    role: z
      .enum(["Owner", "Admin", "Member"], {
        errorMap: () => ({ message: "Role must be Owner, Admin, or Member" }),
      })
      .optional(),

    avatar: z.string().url("Avatar must be a valid URL").optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

/**
 * User Query Parameters Schema
 * Used for GET /api/users with filtering
 */
export const userQuerySchema = z.object({
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

  role: z.enum(["Owner", "Admin", "Member"]).optional(),

  search: z
    .string()
    .min(1, "Search query must not be empty")
    .max(100, "Search query must not exceed 100 characters")
    .optional(),
});

/**
 * Type inference helpers (for documentation/IDE support)
 * These are just for reference in JavaScript projects
 */
// type CreateUserInput = z.infer<typeof createUserSchema>;
// type UpdateUserInput = z.infer<typeof updateUserSchema>;
// type UserQueryParams = z.infer<typeof userQuerySchema>;
