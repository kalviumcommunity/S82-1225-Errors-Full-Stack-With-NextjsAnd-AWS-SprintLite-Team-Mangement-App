import { clearAuthCookies } from "@/lib/auth";

/**
 * POST /api/auth/logout
 *
 * Logs out user by clearing authentication cookies
 *
 * Security:
 * - Clears both access and refresh tokens
 * - Sets Max-Age=0 to expire cookies immediately
 * - Maintains same security flags (HttpOnly, Secure, SameSite)
 *
 * Note: For additional security, consider:
 * - Blacklisting refresh tokens in Redis
 * - Tracking active sessions in database
 * - Logging logout events for audit trail
 *
 * @returns {Object} { success, message }
 */
export async function POST() {
  try {
    console.log("[LOGOUT] Logout requested");

    // Clear all authentication cookies
    const clearCookies = clearAuthCookies();

    console.log("[LOGOUT] Cookies cleared:", clearCookies.length);

    const response = new Response(
      JSON.stringify({
        success: true,
        message: "Logged out successfully",
        clearedCookies: ["accessToken", "refreshToken", "token (legacy)"],
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          // Clear all cookies by setting Max-Age=0
          "Set-Cookie": clearCookies.join(", "),
        },
      }
    );

    console.log("[LOGOUT] Response sent");
    return response;
  } catch (error) {
    console.error("[LOGOUT] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Logout failed",
        message: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * GET /api/auth/logout
 *
 * Not recommended but supported for convenience
 */
export async function GET() {
  console.warn("[LOGOUT] GET method used (POST recommended for security)");
  return POST();
}
