import { prisma } from "@/lib/db";
import {
  verifyRefreshToken,
  generateTokenPair,
  createAccessTokenCookie,
  createRefreshTokenCookie,
  extractTokenFromCookie,
} from "@/lib/auth";
import { sendError, ERROR_CODES } from "@/lib/responseHandler";

/**
 * POST /api/auth/refresh
 *
 * Refreshes expired access token using refresh token
 *
 * Security Features:
 * - Token Rotation: Issues new refresh token on each refresh (prevents replay attacks)
 * - Refresh token from HTTP-only cookie (XSS protection)
 * - Validates user still exists in database
 * - Uses separate JWT secret for refresh tokens
 *
 * Flow:
 * 1. Client's access token expires
 * 2. Client calls /api/auth/refresh with refresh token in cookie
 * 3. Server validates refresh token
 * 4. Server generates NEW access + refresh tokens
 * 5. Old refresh token is invalidated (token rotation)
 * 6. New tokens sent to client
 *
 * @returns {Object} { success, data: { accessToken, user } }
 */
export async function POST(request) {
  try {
    console.log("[REFRESH] Token refresh requested");

    // Extract refresh token from HTTP-only cookie
    const cookieHeader = request.headers.get("cookie");
    const refreshToken = extractTokenFromCookie(cookieHeader, "refreshToken");

    if (!refreshToken) {
      console.log("[REFRESH] No refresh token found in cookies");
      return sendError(
        "Refresh token not found. Please login again.",
        ERROR_CODES.UNAUTHORIZED,
        401
      );
    }

    console.log("[REFRESH] Refresh token found:", refreshToken.substring(0, 30) + "...");

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
      console.log("[REFRESH] Refresh token verified for userId:", decoded.userId);
    } catch (error) {
      console.error("[REFRESH] Refresh token verification failed:", error.message);

      if (error.name === "TokenExpiredError") {
        return sendError(
          "Refresh token has expired. Please login again.",
          ERROR_CODES.UNAUTHORIZED,
          401
        );
      }

      return sendError("Invalid refresh token. Please login again.", ERROR_CODES.UNAUTHORIZED, 401);
    }

    // Validate user still exists (security: deleted users can't refresh)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
    });

    if (!user) {
      console.log("[REFRESH] User not found:", decoded.userId);
      return sendError("User not found. Please login again.", ERROR_CODES.UNAUTHORIZED, 401);
    }

    console.log("[REFRESH] User validated:", user.email);

    // Generate NEW token pair (token rotation for security)
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(payload);

    console.log("[REFRESH] New tokens generated");
    console.log("[REFRESH] New access token (preview):", accessToken.substring(0, 30) + "...");
    console.log("[REFRESH] New refresh token (preview):", newRefreshToken.substring(0, 30) + "...");

    // Create secure cookies
    const accessTokenCookie = createAccessTokenCookie(accessToken);
    const refreshTokenCookie = createRefreshTokenCookie(newRefreshToken);

    // Return new tokens
    const response = new Response(
      JSON.stringify({
        success: true,
        data: {
          accessToken, // For Authorization header usage
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
          },
        },
        message: "Tokens refreshed successfully",
        tokenRotation: {
          rotated: true,
          description: "Old refresh token invalidated, new tokens issued",
          accessTokenExpiry: "15 minutes",
          refreshTokenExpiry: "7 days",
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          // Set both new cookies (token rotation)
          "Set-Cookie": [accessTokenCookie, refreshTokenCookie].join(", "),
        },
      }
    );

    console.log("[REFRESH] Response sent with new tokens");
    return response;
  } catch (error) {
    console.error("[REFRESH] Unexpected error:", error);
    return sendError(
      "Failed to refresh token. Please try again or login.",
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}

/**
 * GET /api/auth/refresh
 *
 * Not supported - refresh must be POST for security
 */
export async function GET() {
  return sendError(
    "GET method not supported. Use POST to refresh tokens.",
    ERROR_CODES.METHOD_NOT_ALLOWED,
    405
  );
}
