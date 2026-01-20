/**
 * RBAC Middleware and Audit Logging
 *
 * Provides middleware functions to enforce role-based access control
 * and log all access decisions for security auditing.
 */

import { authenticateRequest } from "./auth";
import { hasPermission, isValidRole } from "./rbac";
import { sendError, ERROR_CODES } from "./responseHandler";

/**
 * Audit Log Storage
 *
 * In production, send to:
 * - Database (PostgreSQL/MongoDB)
 * - Logging service (CloudWatch, Datadog, Splunk)
 * - SIEM system (Security Information and Event Management)
 */
const auditLogs = [];

/**
 * Log access decision (allow/deny)
 *
 * @param {Object} logEntry - Log entry details
 * @param {string} logEntry.userId - User ID
 * @param {string} logEntry.email - User email
 * @param {string} logEntry.role - User role
 * @param {string} logEntry.resource - Resource being accessed
 * @param {string} logEntry.action - Action being performed
 * @param {boolean} logEntry.allowed - Whether access was granted
 * @param {string} logEntry.endpoint - API endpoint
 * @param {string} logEntry.ip - Client IP address
 * @param {string} logEntry.reason - Reason for decision
 */
export function logAccessDecision(logEntry) {
  const timestamp = new Date().toISOString();
  const status = logEntry.allowed ? "✅ ALLOWED" : "🚫 DENIED";

  const fullLog = {
    timestamp,
    ...logEntry,
  };

  // Store log (in-memory for demo, use database in production)
  auditLogs.push(fullLog);

  // Console output for demo/development
  console.log(
    `[RBAC AUDIT] ${status} | ${logEntry.role} | ${logEntry.action}:${logEntry.resource} | ${logEntry.endpoint} | User: ${logEntry.email} | Reason: ${logEntry.reason || "Policy check"}`
  );

  // In production, send to logging service
  // await sendToLoggingService(fullLog);
}

/**
 * Get all audit logs (admin only)
 *
 * @param {number} limit - Maximum logs to return
 * @returns {Array} Audit log entries
 */
export function getAuditLogs(limit = 100) {
  return auditLogs.slice(-limit).reverse(); // Most recent first
}

/**
 * Get audit logs for specific user
 *
 * @param {string} userId - User ID to filter by
 * @param {number} limit - Maximum logs to return
 * @returns {Array} Audit log entries for user
 */
export function getUserAuditLogs(userId, limit = 50) {
  return auditLogs
    .filter((log) => log.userId === userId)
    .slice(-limit)
    .reverse();
}

/**
 * Get denied access attempts (security monitoring)
 *
 * @param {number} limit - Maximum logs to return
 * @returns {Array} Denied access log entries
 */
export function getDeniedAccess(limit = 100) {
  return auditLogs
    .filter((log) => !log.allowed)
    .slice(-limit)
    .reverse();
}

/**
 * Require permission middleware
 *
 * Checks if authenticated user has required permission before allowing access.
 *
 * Usage in API route:
 * ```javascript
 * export async function DELETE(request, { params }) {
 *   // Check authentication + permission
 *   const authResult = requirePermission(request, RESOURCES.TASKS, ACTIONS.DELETE);
 *   if (authResult.errorResponse) {
 *     return authResult.errorResponse;
 *   }
 *
 *   const user = authResult.user;
 *   // Proceed with delete...
 * }
 * ```
 *
 * @param {Request} request - Next.js request object
 * @param {string} resource - Resource being accessed (e.g., RESOURCES.TASKS)
 * @param {string} action - Action being performed (e.g., ACTIONS.DELETE)
 * @returns {Object} { user, errorResponse } - Returns user if allowed, errorResponse if denied
 */
export function requirePermission(request, resource, action) {
  const url = new URL(request.url);
  const endpoint = url.pathname;
  const ip =
    request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

  // Step 1: Authenticate user
  const authResult = authenticateRequest(request);

  if (authResult.errorResponse) {
    // Authentication failed - log it
    logAccessDecision({
      userId: "unknown",
      email: "unknown",
      role: "none",
      resource,
      action,
      allowed: false,
      endpoint,
      ip,
      reason: "Authentication failed",
    });

    return authResult; // Return authentication error
  }

  const { user } = authResult;

  // Step 2: Validate role exists
  if (!isValidRole(user.role)) {
    logAccessDecision({
      userId: user.userId,
      email: user.email,
      role: user.role || "none",
      resource,
      action,
      allowed: false,
      endpoint,
      ip,
      reason: `Invalid role: ${user.role}`,
    });

    return {
      errorResponse: sendError(
        "Invalid user role. Please contact administrator.",
        ERROR_CODES.FORBIDDEN,
        403
      ),
    };
  }

  // Step 3: Check permission
  const allowed = hasPermission(user.role, resource, action);

  // Log decision
  logAccessDecision({
    userId: user.userId,
    email: user.email,
    role: user.role,
    resource,
    action,
    allowed,
    endpoint,
    ip,
    reason: allowed ? "Permission granted" : `Missing permission: ${action} on ${resource}`,
  });

  // Step 4: Return result
  if (!allowed) {
    return {
      errorResponse: sendError(
        `Access denied. Your role (${user.role}) does not have permission to ${action} ${resource}.`,
        ERROR_CODES.FORBIDDEN,
        403,
        {
          requiredPermission: `${action}:${resource}`,
          userRole: user.role,
        }
      ),
    };
  }

  // Permission granted
  return { user };
}

/**
 * Require specific role middleware
 *
 * Checks if authenticated user has one of the allowed roles.
 *
 * Usage:
 * ```javascript
 * export async function GET(request) {
 *   // Only admins and managers can access
 *   const authResult = requireRole(request, [ROLES.ADMIN, ROLES.MANAGER]);
 *   if (authResult.errorResponse) {
 *     return authResult.errorResponse;
 *   }
 *   // Proceed...
 * }
 * ```
 *
 * @param {Request} request - Next.js request object
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @param {string} resource - Resource name for audit log (optional)
 * @returns {Object} { user, errorResponse }
 */
export function requireRole(request, allowedRoles, resource = "endpoint") {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const url = new URL(request.url);
  const endpoint = url.pathname;
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  // Authenticate
  const authResult = authenticateRequest(request);

  if (authResult.errorResponse) {
    logAccessDecision({
      userId: "unknown",
      email: "unknown",
      role: "none",
      resource,
      action: "access",
      allowed: false,
      endpoint,
      ip,
      reason: "Authentication failed",
    });

    return authResult;
  }

  const { user } = authResult;

  // Check role
  const allowed = roles.includes(user.role);

  logAccessDecision({
    userId: user.userId,
    email: user.email,
    role: user.role,
    resource,
    action: "access",
    allowed,
    endpoint,
    ip,
    reason: allowed
      ? `Role ${user.role} allowed`
      : `Role ${user.role} not in allowed roles: [${roles.join(", ")}]`,
  });

  if (!allowed) {
    return {
      errorResponse: sendError(
        `Access denied. Required role(s): ${roles.join(" or ")}. Your role: ${user.role}.`,
        ERROR_CODES.FORBIDDEN,
        403,
        {
          requiredRoles: roles,
          userRole: user.role,
        }
      ),
    };
  }

  return { user };
}

/**
 * Check ownership middleware
 *
 * Allows users to access their own resources even without general permission.
 * Useful for "users can edit their own profile" scenarios.
 *
 * @param {Request} request - Next.js request object
 * @param {string} resourceOwnerId - ID of resource owner
 * @param {string} resource - Resource type
 * @param {string} action - Action being performed
 * @returns {Object} { user, errorResponse, isOwner }
 */
export function checkOwnership(request, resourceOwnerId, resource, action) {
  const authResult = requirePermission(request, resource, action);

  // If permission check passed, return success
  if (!authResult.errorResponse) {
    return { ...authResult, isOwner: authResult.user.userId === resourceOwnerId };
  }

  // Permission check failed - check if user is owner
  const simpleAuthResult = authenticateRequest(request);
  if (simpleAuthResult.errorResponse) {
    return simpleAuthResult; // Auth failed
  }

  const user = simpleAuthResult.user;
  const isOwner = user.userId === resourceOwnerId;

  if (isOwner) {
    // Owner can access their own resource
    logAccessDecision({
      userId: user.userId,
      email: user.email,
      role: user.role,
      resource,
      action,
      allowed: true,
      endpoint: new URL(request.url).pathname,
      ip: request.headers.get("x-forwarded-for") || "unknown",
      reason: "Resource owner",
    });

    return { user, isOwner: true };
  }

  // Not owner and no permission
  return authResult; // Return original permission error
}

/**
 * Example API Route with RBAC:
 *
 * ```javascript
 * // app/api/tasks/[id]/route.js
 * import { requirePermission } from '@/lib/rbac-middleware';
 * import { RESOURCES, ACTIONS } from '@/lib/rbac';
 *
 * export async function DELETE(request, { params }) {
 *   // Require delete permission on tasks
 *   const authResult = requirePermission(request, RESOURCES.TASKS, ACTIONS.DELETE);
 *
 *   if (authResult.errorResponse) {
 *     return authResult.errorResponse; // 403 Forbidden
 *   }
 *
 *   const user = authResult.user;
 *
 *   // User has permission - proceed with delete
 *   await prisma.task.delete({ where: { id: params.id } });
 *
 *   return Response.json({ success: true });
 * }
 * ```
 */
