import jwt from "jsonwebtoken";
import { ERROR_CODES, sendError } from "@/lib/responseHandler";

const DEFAULT_EXPIRY = process.env.JWT_EXPIRES_IN || "1h";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export const signAuthToken = (payload, options = {}) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: DEFAULT_EXPIRY,
    ...options,
  });
};

export const verifyAuthToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export const authenticateRequest = (request) => {
  const header = request.headers.get("authorization") || request.headers.get("Authorization");

  if (!header || !header.startsWith("Bearer ")) {
    return {
      errorResponse: sendError(
        "Authorization header missing or invalid",
        ERROR_CODES.UNAUTHORIZED,
        401
      ),
    };
  }

  const token = header.split(" ")[1];

  try {
    const decoded = verifyAuthToken(token);
    return { user: decoded };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return {
        errorResponse: sendError("Token has expired", ERROR_CODES.UNAUTHORIZED, 401),
      };
    }

    return {
      errorResponse: sendError("Invalid token", ERROR_CODES.UNAUTHORIZED, 401),
    };
  }
};
