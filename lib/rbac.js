/**
 * Role-Based Access Control (RBAC) Configuration
 *
 * Defines user roles, permissions, and access control policies.
 *
 * Security Principles:
 * - Principle of Least Privilege: Users get minimum permissions needed
 * - Role Hierarchy: Roles inherit permissions from lower levels
 * - Explicit Deny: No permission = denied by default
 * - Audit Trail: All access decisions are logged
 */

/**
 * Permission Types
 *
 * Resource permissions are action-based:
 * - create: Create new resources
 * - read: View/list resources
 * - update: Modify existing resources
 * - delete: Remove resources
 * - manage: Full control (all above + assign permissions)
 */

/**
 * Role Definitions
 *
 * Roles define what a user can do in the system.
 * Each role has a set of permissions for different resources.
 */
export const ROLES = {
  /**
   * ADMIN - Full system access
   *
   * Capabilities:
   * - Manage all tasks (CRUD)
   * - Manage users (create, update, delete, view)
   * - Assign roles to users
   * - View system audit logs
   * - Manage system settings
   */
  ADMIN: "admin",

  /**
   * MANAGER - Team management access
   *
   * Capabilities:
   * - Manage team tasks (CRUD)
   * - View team members
   * - Assign tasks to team members
   * - View team reports
   * - Cannot manage users or system settings
   */
  MANAGER: "manager",

  /**
   * EDITOR - Content modification access
   *
   * Capabilities:
   * - Create new tasks
   * - Edit own tasks
   * - Edit tasks assigned to them
   * - View all tasks
   * - Cannot delete tasks or manage users
   */
  EDITOR: "editor",

  /**
   * VIEWER - Read-only access
   *
   * Capabilities:
   * - View tasks (read-only)
   * - View own profile
   * - Cannot create, edit, or delete anything
   */
  VIEWER: "viewer",
};

/**
 * Resource Types
 *
 * Resources that can be protected by RBAC
 */
export const RESOURCES = {
  TASKS: "tasks",
  USERS: "users",
  PROJECTS: "projects",
  SETTINGS: "settings",
  AUDIT_LOGS: "audit_logs",
};

/**
 * Actions (Permissions)
 *
 * Actions that can be performed on resources
 */
export const ACTIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE: "manage", // Includes all above + special permissions
};

/**
 * Role-Permission Matrix
 *
 * Maps each role to its allowed permissions per resource.
 *
 * Format: { [role]: { [resource]: [actions] } }
 */
export const rolePermissions = {
  [ROLES.ADMIN]: {
    [RESOURCES.TASKS]: [
      ACTIONS.CREATE,
      ACTIONS.READ,
      ACTIONS.UPDATE,
      ACTIONS.DELETE,
      ACTIONS.MANAGE,
    ],
    [RESOURCES.USERS]: [
      ACTIONS.CREATE,
      ACTIONS.READ,
      ACTIONS.UPDATE,
      ACTIONS.DELETE,
      ACTIONS.MANAGE,
    ],
    [RESOURCES.PROJECTS]: [
      ACTIONS.CREATE,
      ACTIONS.READ,
      ACTIONS.UPDATE,
      ACTIONS.DELETE,
      ACTIONS.MANAGE,
    ],
    [RESOURCES.SETTINGS]: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.MANAGE],
    [RESOURCES.AUDIT_LOGS]: [ACTIONS.READ],
  },

  [ROLES.MANAGER]: {
    [RESOURCES.TASKS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
    [RESOURCES.USERS]: [ACTIONS.READ],
    [RESOURCES.PROJECTS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE],
    [RESOURCES.SETTINGS]: [], // No access
    [RESOURCES.AUDIT_LOGS]: [], // No access
  },

  [ROLES.EDITOR]: {
    [RESOURCES.TASKS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE],
    [RESOURCES.USERS]: [ACTIONS.READ], // Can view users to assign tasks
    [RESOURCES.PROJECTS]: [ACTIONS.READ],
    [RESOURCES.SETTINGS]: [], // No access
    [RESOURCES.AUDIT_LOGS]: [], // No access
  },

  [ROLES.VIEWER]: {
    [RESOURCES.TASKS]: [ACTIONS.READ],
    [RESOURCES.USERS]: [ACTIONS.READ], // Can view users
    [RESOURCES.PROJECTS]: [ACTIONS.READ],
    [RESOURCES.SETTINGS]: [], // No access
    [RESOURCES.AUDIT_LOGS]: [], // No access
  },
};

/**
 * Role Hierarchy (for future role inheritance)
 *
 * Higher roles inherit permissions from lower roles.
 * Format: { [role]: parentRole }
 */
export const roleHierarchy = {
  [ROLES.ADMIN]: null, // Top level, no parent
  [ROLES.MANAGER]: ROLES.EDITOR, // Inherits from EDITOR
  [ROLES.EDITOR]: ROLES.VIEWER, // Inherits from VIEWER
  [ROLES.VIEWER]: null, // Base level, no parent
};

/**
 * Get all permissions for a role
 *
 * @param {string} role - User role
 * @returns {Object} Permissions object { [resource]: [actions] }
 */
export function getRolePermissions(role) {
  return rolePermissions[role] || {};
}

/**
 * Check if a role has permission for an action on a resource
 *
 * @param {string} role - User role
 * @param {string} resource - Resource type (e.g., "tasks")
 * @param {string} action - Action type (e.g., "create")
 * @returns {boolean} True if permission granted
 */
export function hasPermission(role, resource, action) {
  const permissions = rolePermissions[role];

  if (!permissions) {
    return false; // Unknown role = no permissions
  }

  const resourcePermissions = permissions[resource];

  if (!resourcePermissions) {
    return false; // No permissions for this resource
  }

  // Check if action is explicitly allowed
  // MANAGE permission grants all actions
  return resourcePermissions.includes(action) || resourcePermissions.includes(ACTIONS.MANAGE);
}

/**
 * Check if role can perform any action on a resource
 *
 * @param {string} role - User role
 * @param {string} resource - Resource type
 * @returns {boolean} True if role has any permission on resource
 */
export function hasAnyPermission(role, resource) {
  const permissions = rolePermissions[role];
  if (!permissions) return false;

  const resourcePermissions = permissions[resource];
  return resourcePermissions && resourcePermissions.length > 0;
}

/**
 * Get all roles (for admin UI)
 *
 * @returns {string[]} Array of role names
 */
export function getAllRoles() {
  return Object.values(ROLES);
}

/**
 * Validate if a role exists
 *
 * @param {string} role - Role to validate
 * @returns {boolean} True if role is valid
 */
export function isValidRole(role) {
  return Object.values(ROLES).includes(role);
}

/**
 * Role Display Names (for UI)
 */
export const roleDisplayNames = {
  [ROLES.ADMIN]: "Administrator",
  [ROLES.MANAGER]: "Manager",
  [ROLES.EDITOR]: "Editor",
  [ROLES.VIEWER]: "Viewer",
};

/**
 * Role Descriptions (for UI)
 */
export const roleDescriptions = {
  [ROLES.ADMIN]: "Full system access including user management and settings",
  [ROLES.MANAGER]: "Manage team tasks and view team members",
  [ROLES.EDITOR]: "Create and edit tasks, view all content",
  [ROLES.VIEWER]: "Read-only access to tasks and users",
};

/**
 * Default role for new users
 */
export const DEFAULT_ROLE = ROLES.VIEWER;

/**
 * Example Usage:
 *
 * // Check single permission
 * if (hasPermission(user.role, RESOURCES.TASKS, ACTIONS.DELETE)) {
 *   // Allow delete
 * }
 *
 * // Check any permission
 * if (hasAnyPermission(user.role, RESOURCES.SETTINGS)) {
 *   // Show settings menu
 * }
 *
 * // Get all permissions for role
 * const permissions = getRolePermissions(user.role);
 * console.log(permissions[RESOURCES.TASKS]); // ['create', 'read', 'update']
 */
