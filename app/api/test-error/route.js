import { handleError, NotFoundError } from "@/lib/errorHandler";
import { logInfo } from "@/lib/logger";
import { sendSuccess } from "@/lib/responseHandler";

/**
 * GET /api/test-error
 * Test route to demonstrate error handling in development vs production
 *
 * Query parameters:
 * - type: error type (database, validation, notfound, generic)
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const errorType = searchParams.get("type") || "generic";

  logInfo("Test error endpoint called", {
    errorType,
    environment: process.env.NODE_ENV,
  });

  try {
    // Simulate different error types
    switch (errorType) {
      case "database":
        throw new Error("Database connection failed! Unable to connect to PostgreSQL.");

      case "validation":
        const error = new Error("Invalid input data provided");
        error.name = "ValidationError";
        throw error;

      case "notfound":
        throw new NotFoundError("User", "12345");

      case "unauthorized":
        const authError = new Error("Token has expired");
        authError.name = "UnauthorizedError";
        throw authError;

      case "success":
        return sendSuccess({ message: "This endpoint is working correctly!" }, "Test successful");

      default:
        throw new Error("Something unexpected happened in the application");
    }
  } catch (error) {
    return handleError(error, {
      method: "GET",
      path: "/api/test-error",
      query: { errorType },
    });
  }
}
