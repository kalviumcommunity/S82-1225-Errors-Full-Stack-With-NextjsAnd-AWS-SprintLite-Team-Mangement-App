import jwt from "jsonwebtoken";
import { ERROR_CODES, sendError } from "@/lib/responseHandler";

// Security Configuration
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-in-production";

// Token Expiry Configuration
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m"; // 15 minutes
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d"; // 7 days

/**
 * Generate Access Token (Short-lived)
 *
 * @param {Object} payload - User data to encode (userId, email, role)
 * @param {Object} options - Additional JWT options
 * @returns {string} JWT access token
 *
 * Access tokens are short-lived (15 minutes) to minimize risk if compromised.
 * They should be stored in memory or HTTP-only cookies.
 */
export const generateAccessToken = (payload, options = {}) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    ...options,
  });
};

/**
 * Generate Refresh Token (Long-lived)
 *
 * @param {Object} payload - User data to encode (userId)
 * @param {Object} options - Additional JWT options
 * @returns {string} JWT refresh token
 *
 * Refresh tokens are long-lived (7 days) and used to obtain new access tokens.
 * They MUST be stored in secure, HTTP-only cookies with SameSite=Strict.
 */
export const generateRefreshToken = (payload, options = {}) => {
  // Only store minimal data in refresh token (userId)
  const refreshPayload = {
    userId: payload.userId,
    type: "refresh", // Distinguish from access tokens
  };

  return jwt.sign(refreshPayload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    ...options,
  });
};

/**
 * Generate both Access and Refresh tokens
 *
 * @param {Object} payload - User data (userId, email, role)
 * @returns {Object} { accessToken, refreshToken }
 */
export const generateTokenPair = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { accessToken, refreshToken };
};

/**
 * Verify Access Token
 *
 * @param {string} token - JWT access token
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Verify Refresh Token
 *
 * @param {string} token - JWT refresh token
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

/**
 * DEPRECATED: Use generateAccessToken instead
 * Kept for backwards compatibility
 */
export const signAuthToken = (payload, options = {}) => {
  console.warn("signAuthToken is deprecated. Use generateAccessToken instead.");
  return generateAccessToken(payload, options);
};

/**
 * DEPRECATED: Use verifyAccessToken instead
 * Kept for backwards compatibility
 */
export const verifyAuthToken = (token) => {
  console.warn("verifyAuthToken is deprecated. Use verifyAccessToken instead.");
  return verifyAccessToken(token);
};

/**
 * Create secure HTTP-only cookie configuration
 *
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {Object} options - Cookie options
 * @returns {string} Set-Cookie header value
 *
 * Security Features:
 * - HttpOnly: Prevents JavaScript access (XSS protection)
 * - Secure: HTTPS only in production (prevents man-in-the-middle)
 * - SameSite=Strict: Prevents CSRF attacks
 * - Path=/: Available across entire domain
 */
export const createSecureCookie = (name, value, options = {}) => {
  const {
    maxAge = 60 * 60 * 24 * 7, // 7 days default
    path = "/",
    sameSite = "Strict",
    secure = process.env.NODE_ENV === "production",
  } = options;

  const cookieParts = [
    `${name}=${value}`,
    "HttpOnly",
    `Path=${path}`,
    `Max-Age=${maxAge}`,
    `SameSite=${sameSite}`,
  ];

  if (secure) {
    cookieParts.push("Secure");
  }

  return cookieParts.join("; ");
};

/**
 * Create access token cookie (short-lived)
 *
 * @param {string} token - Access token
 * @returns {string} Set-Cookie header value
 */
export const createAccessTokenCookie = (token) => {
  return createSecureCookie("accessToken", token, {
    maxAge: 15 * 60, // 15 minutes (matches token expiry)
    sameSite: "Lax", // Lax for access tokens (allows top-level navigation)
  });
};

/**
 * Create refresh token cookie (long-lived)
 *
 * @param {string} token - Refresh token
 * @returns {string} Set-Cookie header value
 */
export const createRefreshTokenCookie = (token) => {
  return createSecureCookie("refreshToken", token, {
    maxAge: 60 * 60 * 24 * 7, // 7 days (matches token expiry)
    sameSite: "Strict", // Strict for refresh tokens (CSRF protection)
  });
};

/**
 * Clear authentication cookies (logout)
 *
 * @returns {Array<string>} Array of Set-Cookie headers to clear tokens
 */
export const clearAuthCookies = () => {
  return [
    createSecureCookie("accessToken", "", { maxAge: 0 }),
    createSecureCookie("refreshToken", "", { maxAge: 0 }),
    createSecureCookie("token", "", { maxAge: 0 }), // Legacy token
  ];
};

/**
 * Extract token from cookie string
 *
 * @param {string} cookieString - Cookie header value
 * @param {string} name - Cookie name to extract
 * @returns {string|null} Token value or null
 */
export const extractTokenFromCookie = (cookieString, name = "accessToken") => {
  if (!cookieString) return null;

  const cookies = cookieString.split(";").map((cookie) => cookie.trim());
  const targetCookie = cookies.find((cookie) => cookie.startsWith(`${name}=`));

  if (!targetCookie) return null;

  return targetCookie.split("=")[1];
};

/**
 * Authenticate incoming request
 *
 * Checks for access token in:
 * 1. Authorization header (Bearer token)
 * 2. HTTP-only cookie (accessToken)
 *
 * @param {Request} request - Next.js request object
 * @returns {Object} { user, errorResponse }
 *
 * Error codes:
 * - UNAUTHORIZED (401): Missing or invalid token
 * - TOKEN_EXPIRED (401): Token has expired (client should refresh)
 */
export const authenticateRequest = (request) => {
  let token = null;

  // Try to get token from Authorization header first (priority)
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // Fallback to cookie if no Authorization header
  if (!token) {
    const cookieHeader = request.headers.get("cookie");
    token = extractTokenFromCookie(cookieHeader, "accessToken");
  }

  // No token found anywhere
  if (!token) {
    return {
      errorResponse: sendError(
        "Authentication required. Please login.",
        ERROR_CODES.UNAUTHORIZED,
        401,
        { tokenExpired: false }
      ),
    };
  }

  // Verify token
  try {
    const decoded = verifyAccessToken(token);
    return { user: decoded };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return {
        errorResponse: sendError(
          "Access token has expired. Please refresh your token.",
          ERROR_CODES.UNAUTHORIZED,
          401,
          { tokenExpired: true } // Flag for client to trigger refresh
        ),
      };
    }

    if (error.name === "JsonWebTokenError") {
      return {
        errorResponse: sendError(
          "Invalid access token. Please login again.",
          ERROR_CODES.UNAUTHORIZED,
          401,
          { tokenExpired: false }
        ),
      };
    }

    return {
      errorResponse: sendError("Token verification failed.", ERROR_CODES.UNAUTHORIZED, 401, {
        tokenExpired: false,
      }),
    };
  }
};

/**
 * Check if user has required role
 * @param {object} user - Decoded JWT user object
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @returns {boolean} True if user has required role
 */
export const hasRole = (user, allowedRoles) => {
  if (!user || !user.role) return false;

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
};

/**
 * Authenticate request and check for required role(s)
 * @param {Request} request - Next.js request object
 * @param {string|string[]} allowedRoles - Required role(s) for access
 * @returns {object} {user, errorResponse}
 */
export const requireRole = (request, allowedRoles) => {
  // First authenticate
  const authResult = authenticateRequest(request);
  if (authResult.errorResponse) {
    return authResult;
  }

  // Check role
  if (!hasRole(authResult.user, allowedRoles)) {
    return {
      errorResponse: sendError(
        "Access denied. Insufficient permissions.",
        ERROR_CODES.FORBIDDEN,
        403
      ),
    };
  }

  return { user: authResult.user };
};
