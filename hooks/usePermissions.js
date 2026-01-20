"use client";

/**
 * RBAC React Hooks
 *
 * Client-side hooks for conditional rendering based on user permissions.
 *
 * Security Note:
 * - UI-level checks are for UX only (hide buttons, menus)
 * - Always enforce permissions on the API/server side
 * - Never trust client-side permission checks for security
 */

import { useAuth } from "@/hooks/useAuth";
import {
  hasPermission,
  hasAnyPermission,
  ROLES,
  getRolePermissions,
  roleDisplayNames,
  roleDescriptions,
} from "@/lib/rbac";

/**
 * Check if current user has specific permission
 *
 * @param {string} resource - Resource type (e.g., "tasks")
 * @param {string} action - Action type (e.g., "delete")
 * @returns {boolean} True if user has permission
 *
 * @example
 * ```jsx
 * function TaskCard({ task }) {
 *   const canDelete = usePermission(RESOURCES.TASKS, ACTIONS.DELETE);
 *
 *   return (
 *     <div>
 *       <h3>{task.title}</h3>
 *       {canDelete && <button onClick={handleDelete}>Delete</button>}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermission(resource, action) {
  const { user } = useAuth();

  if (!user || !user.role) {
    return false;
  }

  return hasPermission(user.role, resource, action);
}

/**
 * Check if current user has any permission on a resource
 *
 * @param {string} resource - Resource type
 * @returns {boolean} True if user has any permission
 *
 * @example
 * ```jsx
 * function SettingsMenu() {
 *   const canAccessSettings = useAnyPermission(RESOURCES.SETTINGS);
 *
 *   if (!canAccessSettings) {
 *     return null; // Hide settings menu
 *   }
 *
 *   return <SettingsLink />;
 * }
 * ```
 */
export function useAnyPermission(resource) {
  const { user } = useAuth();

  if (!user || !user.role) {
    return false;
  }

  return hasAnyPermission(user.role, resource);
}

/**
 * Check if current user has specific role(s)
 *
 * @param {string|string[]} allowedRoles - Role or array of roles
 * @returns {boolean} True if user has one of the roles
 *
 * @example
 * ```jsx
 * function AdminPanel() {
 *   const isAdmin = useRole(ROLES.ADMIN);
 *
 *   if (!isAdmin) {
 *     return <AccessDenied />;
 *   }
 *
 *   return <AdminDashboard />;
 * }
 * ```
 */
export function useRole(allowedRoles) {
  const { user } = useAuth();

  if (!user || !user.role) {
    return false;
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
}

/**
 * Get all permissions for current user
 *
 * @returns {Object} Permissions object { [resource]: [actions] }
 *
 * @example
 * ```jsx
 * function PermissionsList() {
 *   const permissions = useUserPermissions();
 *
 *   return (
 *     <div>
 *       <h3>Your Permissions:</h3>
 *       {Object.entries(permissions).map(([resource, actions]) => (
 *         <div key={resource}>
 *           <strong>{resource}:</strong> {actions.join(', ')}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useUserPermissions() {
  const { user } = useAuth();

  if (!user || !user.role) {
    return {};
  }

  return getRolePermissions(user.role);
}

/**
 * Permission Guard Component
 *
 * Conditionally renders children based on permission check.
 *
 * @param {Object} props
 * @param {string} props.resource - Resource type
 * @param {string} props.action - Action type
 * @param {React.ReactNode} props.children - Content to render if allowed
 * @param {React.ReactNode} props.fallback - Content to render if denied (optional)
 *
 * @example
 * ```jsx
 * <PermissionGuard resource={RESOURCES.TASKS} action={ACTIONS.DELETE}>
 *   <button onClick={handleDelete}>Delete Task</button>
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({ resource, action, children, fallback = null }) {
  const hasAccess = usePermission(resource, action);

  if (!hasAccess) {
    return fallback;
  }

  return children;
}

/**
 * Role Guard Component
 *
 * Conditionally renders children based on role check.
 *
 * @param {Object} props
 * @param {string|string[]} props.roles - Required role(s)
 * @param {React.ReactNode} props.children - Content to render if allowed
 * @param {React.ReactNode} props.fallback - Content to render if denied (optional)
 *
 * @example
 * ```jsx
 * <RoleGuard roles={[ROLES.ADMIN, ROLES.MANAGER]}>
 *   <AdminPanel />
 * </RoleGuard>
 * ```
 */
export function RoleGuard({ roles, children, fallback = null }) {
  const hasRole = useRole(roles);

  if (!hasRole) {
    return fallback;
  }

  return children;
}

/**
 * Any Permission Guard Component
 *
 * Renders children if user has ANY permission on a resource.
 *
 * @param {Object} props
 * @param {string} props.resource - Resource type
 * @param {React.ReactNode} props.children - Content to render if allowed
 * @param {React.ReactNode} props.fallback - Content to render if denied (optional)
 *
 * @example
 * ```jsx
 * <AnyPermissionGuard resource={RESOURCES.SETTINGS}>
 *   <SettingsMenu />
 * </AnyPermissionGuard>
 * ```
 */
export function AnyPermissionGuard({ resource, children, fallback = null }) {
  const hasAccess = useAnyPermission(resource);

  if (!hasAccess) {
    return fallback;
  }

  return children;
}

/**
 * Role Badge Component
 *
 * Displays user's role as a styled badge.
 *
 * @param {Object} props
 * @param {string} props.role - User role (optional, uses current user if not provided)
 * @param {boolean} props.showDescription - Show role description on hover
 *
 * @example
 * ```jsx
 * <RoleBadge />
 * <RoleBadge role={ROLES.ADMIN} showDescription />
 * ```
 */
export function RoleBadge({ role: propRole, showDescription = false }) {
  const { user } = useAuth();
  const role = propRole || user?.role;

  if (!role) {
    return null;
  }

  const roleColors = {
    [ROLES.ADMIN]: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    [ROLES.MANAGER]: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    [ROLES.EDITOR]: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    [ROLES.VIEWER]: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
  };

  const colorClass = roleColors[role] || "bg-gray-100 text-gray-800";
  const displayName = roleDisplayNames[role] || role;
  const description = roleDescriptions[role] || "";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      title={showDescription ? description : undefined}
    >
      {displayName}
    </span>
  );
}

/**
 * Example Usage in a Component:
 *
 * ```jsx
 * "use client";
 *
 * import {
 *   usePermission,
 *   useRole,
 *   PermissionGuard,
 *   RoleGuard,
 *   RoleBadge
 * } from '@/hooks/usePermissions';
 * import { RESOURCES, ACTIONS, ROLES } from '@/lib/rbac';
 *
 * export default function TaskCard({ task }) {
 *   const canEdit = usePermission(RESOURCES.TASKS, ACTIONS.UPDATE);
 *   const canDelete = usePermission(RESOURCES.TASKS, ACTIONS.DELETE);
 *   const isAdmin = useRole(ROLES.ADMIN);
 *
 *   return (
 *     <div className="task-card">
 *       <h3>{task.title}</h3>
 *       <RoleBadge />
 *
 *       <div className="actions">
 *         {canEdit && <button onClick={handleEdit}>Edit</button>}
 *
 *         <PermissionGuard resource={RESOURCES.TASKS} action={ACTIONS.DELETE}>
 *           <button onClick={handleDelete}>Delete</button>
 *         </PermissionGuard>
 *
 *         <RoleGuard roles={ROLES.ADMIN}>
 *           <button onClick={handleForceDelete}>Force Delete</button>
 *         </RoleGuard>
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
