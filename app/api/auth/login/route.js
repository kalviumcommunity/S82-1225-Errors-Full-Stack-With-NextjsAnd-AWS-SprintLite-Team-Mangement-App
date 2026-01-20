import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { generateTokenPair, createAccessTokenCookie, createRefreshTokenCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/schemas/authSchema";
import { sendError, handlePrismaError, handleZodError, ERROR_CODES } from "@/lib/responseHandler";

/**
 * POST /api/auth/login
 *
 * Authenticates user and issues JWT tokens
 *
 * Security Features:
 * - Access Token: Short-lived (15 min), stored in HTTP-only cookie with SameSite=Lax
 * - Refresh Token: Long-lived (7 days), stored in HTTP-only cookie with SameSite=Strict
 * - Both tokens use different secrets for defense in depth
 * - Passwords compared using bcrypt (timing-attack resistant)
 *
 * @returns {Object} { success, data: { accessToken, user }, message }
 */
export async function POST(request) {
  try {
    console.log("[LOGIN] API called");
    const body = await request.json();
    console.log("[LOGIN] Request body received");

    // Validate input
    const { email, password } = loginSchema.parse(body);
    console.log("[LOGIN] Schema validated for:", email);

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    console.log("[LOGIN] User found:", user ? "yes" : "no");

    if (!user) {
      return sendError("Invalid email or password", ERROR_CODES.INVALID_CREDENTIALS, 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendError("Invalid email or password", ERROR_CODES.INVALID_CREDENTIALS, 401);
    }

    // Generate token pair (access + refresh)
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken } = generateTokenPair(payload);

    console.log("[LOGIN] Tokens generated");
    console.log("[LOGIN] Access token (preview):", accessToken.substring(0, 30) + "...");
    console.log("[LOGIN] Refresh token (preview):", refreshToken.substring(0, 30) + "...");

    // Create secure cookies
    const accessTokenCookie = createAccessTokenCookie(accessToken);
    const refreshTokenCookie = createRefreshTokenCookie(refreshToken);

    console.log("[LOGIN] Secure cookies created");
    console.log("[LOGIN] Access cookie:", accessTokenCookie.substring(0, 60) + "...");
    console.log("[LOGIN] Refresh cookie:", refreshTokenCookie.substring(0, 60) + "...");

    // Return response with both tokens in cookies
    const response = new Response(
      JSON.stringify({
        success: true,
        data: {
          accessToken, // Also return in body for Authorization header usage
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
          },
        },
        message: "Login successful",
        tokenInfo: {
          accessTokenExpiry: "15 minutes",
          refreshTokenExpiry: "7 days",
          storedIn: "HTTP-only cookies",
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          // Set both cookies (multiple Set-Cookie headers)
          "Set-Cookie": [accessTokenCookie, refreshTokenCookie].join(", "),
        },
      }
    );

    console.log("[LOGIN] Response created with Set-Cookie headers");
    return response;
  } catch (error) {
    console.error("[LOGIN] Error:", error);
    if (error instanceof ZodError) {
      return handleZodError(error);
    }

    return handlePrismaError(error);
  }
}
