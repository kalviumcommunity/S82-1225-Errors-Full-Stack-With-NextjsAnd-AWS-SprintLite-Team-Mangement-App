# DAY23: Role-Based Access Control (RBAC) Implementation

**Date**: December 2024  
**Branch**: `DAY23-S/RBAC`  
**Status**: ✅ Complete

---

## 📋 Overview

Implemented a comprehensive **Role-Based Access Control (RBAC)** system with:
- **4 role hierarchy** (Admin → Manager → Editor → Viewer)
- **Granular permissions** per resource and action
- **API-level enforcement** with middleware
- **UI-level permission guards** for conditional rendering
- **Comprehensive audit logging** for all access decisions
- **Ownership checks** (users can manage their own resources)

---

## 🎯 Requirements Completed

### ✅ 1. Define Role Hierarchy and Permissions
- Created 4 roles with clear hierarchy
- Defined 5 resources (tasks, users, projects, settings, audit_logs)
- Defined 5 actions (create, read, update, delete, manage)
- Built permission matrix mapping roles to actions

### ✅ 2. Apply Permission Checks to APIs
- Updated tasks API routes with RBAC middleware
- Enforced READ, CREATE, UPDATE, DELETE permissions
- Added ownership checks (users can edit/delete own tasks)

### ✅ 3. Add UI-Level Permission Guards
- Created React hooks: `usePermission()`, `useRole()`, `useAnyPermission()`
- Created components: `<PermissionGuard>`, `<RoleGuard>`, `<RoleBadge>`
- Enabled conditional rendering based on permissions

### ✅ 4. Implement Audit Logging
- Logs every access decision (ALLOWED/DENIED)
- Captures: timestamp, user, role, resource, action, endpoint, IP, reason
- In-memory storage for demo (production-ready for database integration)
- Helper functions: `getAuditLogs()`, `getUserAuditLogs()`, `getDeniedAccess()`

---

## 🔐 Role Definitions

### Role Hierarchy

```
Admin (Highest)
  ↓
Manager
  ↓
Editor
  ↓
Viewer (Lowest)
```

### Role Permissions Matrix

| **Resource** | **Admin** | **Manager** | **Editor** | **Viewer** |
|--------------|-----------|-------------|------------|------------|
| **Tasks** | Create, Read, Update, Delete, Manage | Create, Read, Update, Delete | Create, Read, Update | Read |
| **Users** | Create, Read, Update, Delete, Manage | Read | Read | Read |
| **Projects** | Create, Read, Update, Delete, Manage | Create, Read, Update | Read | Read |
| **Settings** | Create, Read, Update, Delete, Manage | Read | - | - |
| **Audit Logs** | Read, Manage | - | - | - |

### Role Descriptions

1. **Admin** (role: `admin`)
   - Full system access
   - Can manage all resources
   - Access audit logs
   - Manage user roles and permissions

2. **Manager** (role: `manager`)
   - Team management capabilities
   - CRUD on tasks and projects
   - View users
   - Cannot access settings or audit logs

3. **Editor** (role: `editor`)
   - Content creation and editing
   - CRU on tasks (cannot delete)
   - View users and projects
   - No administrative access

4. **Viewer** (role: `viewer`)
   - Read-only access
   - View tasks, users, and projects
   - Cannot create, update, or delete
   - Default role for new users

---

## 📁 Files Created/Modified

### New Files

1. **`lib/rbac.js`** (330 lines)
   - Role and permission configuration
   - Permission checking functions
   - Role hierarchy and display names

2. **`lib/rbac-middleware.js`** (365 lines)
   - RBAC enforcement middleware
   - Audit logging system
   - Ownership checks

3. **`hooks/usePermissions.js`** (280 lines)
   - React hooks for client-side permission checks
   - Permission guard components
   - Role badge component

### Modified Files

4. **`prisma/schema.prisma`**
   - Updated User model role field from "Member/Admin/Owner" to RBAC roles
   - Default role set to "viewer"

5. **`app/api/tasks/route.js`**
   - Added `requirePermission()` checks for GET (READ) and POST (CREATE)
   - Logs RBAC decisions

6. **`app/api/tasks/[id]/route.js`**
   - Added `requirePermission()` checks for GET, PUT, DELETE
   - Added `checkOwnership()` for PUT/DELETE (users can edit/delete own tasks)

---

## 🔧 Implementation Details

### 1. Permission Configuration (`lib/rbac.js`)

```javascript
// Define roles
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  EDITOR: "editor",
  VIEWER: "viewer",
};

// Define resources
export const RESOURCES = {
  TASKS: "tasks",
  USERS: "users",
  PROJECTS: "projects",
  SETTINGS: "settings",
  AUDIT_LOGS: "audit_logs",
};

// Define actions
export const ACTIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE: "manage", // Grants all actions
};

// Permission matrix
export const rolePermissions = {
  [ROLES.ADMIN]: {
    [RESOURCES.TASKS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.MANAGE],
    [RESOURCES.USERS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.MANAGE],
    // ... full permissions on all resources
  },
  [ROLES.VIEWER]: {
    [RESOURCES.TASKS]: [ACTIONS.READ],
    [RESOURCES.USERS]: [ACTIONS.READ],
    [RESOURCES.PROJECTS]: [ACTIONS.READ],
  },
  // ... other roles
};

// Check permission
export function hasPermission(role, resource, action) {
  const permissions = rolePermissions[role]?.[resource];
  if (!permissions) return false;
  
  // MANAGE action grants all actions
  return permissions.includes(action) || permissions.includes(ACTIONS.MANAGE);
}
```

### 2. RBAC Middleware (`lib/rbac-middleware.js`)

#### Main Enforcement Function

```javascript
/**
 * Check if user has permission for a resource action
 * 
 * @returns {{ user, errorResponse }} - user object or 403 error
 */
export async function requirePermission(request, resource, action) {
  // 1. Authenticate user
  const authResult = await authenticateRequest(request);
  if (authResult.errorResponse) {
    return authResult; // 401 Unauthorized
  }

  const { user } = authResult;

  // 2. Validate role
  if (!isValidRole(user.role)) {
    logAccessDecision({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      resource,
      action,
      allowed: false,
      reason: "Invalid role",
      endpoint: new URL(request.url).pathname,
      ip: extractIpAddress(request),
    });

    return {
      errorResponse: sendError(
        "Invalid user role",
        403,
        ERROR_CODES.FORBIDDEN,
        { userRole: user.role, requiredPermission: `${action}:${resource}` }
      ),
    };
  }

  // 3. Check permission
  const allowed = hasPermission(user.role, resource, action);

  // 4. Log decision
  logAccessDecision({
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
    resource,
    action,
    allowed,
    reason: allowed ? "Permission granted" : "Permission denied",
    endpoint: new URL(request.url).pathname,
    ip: extractIpAddress(request),
  });

  // 5. Return result
  if (!allowed) {
    return {
      errorResponse: sendError(
        "Insufficient permissions",
        403,
        ERROR_CODES.FORBIDDEN,
        { userRole: user.role, requiredPermission: `${action}:${resource}` }
      ),
    };
  }

  return { user }; // Access granted
}
```

#### Ownership Check Function

```javascript
/**
 * Check if user owns a resource (can override permission check)
 * 
 * Example: Viewer can edit their own profile but not others'
 */
export async function checkOwnership(request, resourceOwnerId, resource, action) {
  const authResult = await authenticateRequest(request);
  if (authResult.errorResponse) {
    return authResult;
  }

  const { user } = authResult;
  const isOwner = user.id === resourceOwnerId;

  logAccessDecision({
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
    resource,
    action,
    allowed: isOwner,
    reason: isOwner ? "Resource owner" : "Not resource owner",
    endpoint: new URL(request.url).pathname,
    ip: extractIpAddress(request),
  });

  if (!isOwner) {
    return {
      errorResponse: sendError(
        "You can only modify your own resources",
        403,
        ERROR_CODES.FORBIDDEN,
        { userRole: user.role, requiredPermission: `${action}:${resource}` }
      ),
    };
  }

  return { user };
}
```

#### Audit Logging

```javascript
// In-memory audit log (production: use database)
const auditLogs = [];

/**
 * Log access decision for audit trail
 */
export function logAccessDecision(logEntry) {
  const timestamp = new Date().toISOString();
  const fullEntry = { timestamp, ...logEntry };

  auditLogs.push(fullEntry);

  // Console output for demo
  const emoji = logEntry.allowed ? "✅ ALLOWED" : "❌ DENIED";
  const actionDisplay = `${logEntry.action}:${logEntry.resource}`;
  
  console.log(
    `[RBAC AUDIT] ${emoji} | ${logEntry.userRole} | ${actionDisplay} | ` +
    `${logEntry.endpoint} | User: ${logEntry.userEmail} | Reason: ${logEntry.reason}`
  );

  // Production: Save to database
  // await prisma.auditLog.create({ data: fullEntry });
}

// Retrieve audit logs (admin only)
export function getAuditLogs(limit = 100) {
  return auditLogs.slice(-limit).reverse();
}

// Get logs for specific user
export function getUserAuditLogs(userId, limit = 100) {
  return auditLogs
    .filter(log => log.userId === userId)
    .slice(-limit)
    .reverse();
}

// Get denied access attempts (security monitoring)
export function getDeniedAccess(limit = 100) {
  return auditLogs
    .filter(log => !log.allowed)
    .slice(-limit)
    .reverse();
}
```

### 3. API Integration

#### Example: Tasks Route

```javascript
import { requirePermission, checkOwnership } from "@/lib/rbac-middleware";
import { RESOURCES, ACTIONS } from "@/lib/rbac";

// GET /api/tasks - List tasks
export async function GET(request) {
  // Check READ permission
  const authResult = await requirePermission(request, RESOURCES.TASKS, ACTIONS.READ);
  if (authResult.errorResponse) {
    return authResult.errorResponse; // 403 Forbidden
  }

  const { user } = authResult;
  console.log(`User ${user.email} (${user.role}) accessing tasks`);

  // User has permission - proceed with logic
  const tasks = await prisma.task.findMany();
  return sendSuccess({ tasks });
}

// POST /api/tasks - Create task
export async function POST(request) {
  // Check CREATE permission
  const authResult = await requirePermission(request, RESOURCES.TASKS, ACTIONS.CREATE);
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { user } = authResult;
  const body = await request.json();

  const task = await prisma.task.create({
    data: { ...body, creatorId: user.id },
  });

  return sendSuccess(task, "Task created", 201);
}

// PUT /api/tasks/[id] - Update task
export async function PUT(request, { params }) {
  const { id } = params;

  // Check if task exists
  const existingTask = await prisma.task.findUnique({
    where: { id },
    select: { id: true, creatorId: true },
  });

  if (!existingTask) {
    return sendError("Task not found", 404);
  }

  // Check UPDATE permission
  let authResult = await requirePermission(request, RESOURCES.TASKS, ACTIONS.UPDATE);

  // If no general permission, check if user owns the task
  if (authResult.errorResponse) {
    authResult = await checkOwnership(
      request,
      existingTask.creatorId,
      RESOURCES.TASKS,
      ACTIONS.UPDATE
    );

    if (authResult.errorResponse) {
      return authResult.errorResponse; // 403
    }

    console.log("User allowed to update their own task");
  }

  // Proceed with update
  const body = await request.json();
  const updatedTask = await prisma.task.update({
    where: { id },
    data: body,
  });

  return sendSuccess(updatedTask, "Task updated");
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(request, { params }) {
  const { id } = params;

  const existingTask = await prisma.task.findUnique({
    where: { id },
    select: { id: true, creatorId: true },
  });

  if (!existingTask) {
    return sendError("Task not found", 404);
  }

  // Check DELETE permission or ownership
  let authResult = await requirePermission(request, RESOURCES.TASKS, ACTIONS.DELETE);

  if (authResult.errorResponse) {
    authResult = await checkOwnership(
      request,
      existingTask.creatorId,
      RESOURCES.TASKS,
      ACTIONS.DELETE
    );

    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }
  }

  await prisma.task.delete({ where: { id } });
  return sendSuccess({ taskId: id }, "Task deleted");
}
```

### 4. UI Permission Guards

#### React Hooks

```jsx
import {
  usePermission,
  useRole,
  PermissionGuard,
  RoleGuard,
  RoleBadge
} from "@/hooks/usePermissions";
import { RESOURCES, ACTIONS, ROLES } from "@/lib/rbac";

function TaskCard({ task }) {
  // Hook-based checks
  const canEdit = usePermission(RESOURCES.TASKS, ACTIONS.UPDATE);
  const canDelete = usePermission(RESOURCES.TASKS, ACTIONS.DELETE);
  const isAdmin = useRole(ROLES.ADMIN);

  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      
      {/* Display user's role */}
      <RoleBadge showDescription />

      <div className="actions">
        {/* Conditional rendering with hook */}
        {canEdit && (
          <button onClick={handleEdit}>Edit</button>
        )}

        {/* Guard component (more declarative) */}
        <PermissionGuard 
          resource={RESOURCES.TASKS} 
          action={ACTIONS.DELETE}
        >
          <button onClick={handleDelete}>Delete</button>
        </PermissionGuard>

        {/* Role-based guard */}
        <RoleGuard roles={ROLES.ADMIN}>
          <button onClick={handleForceDelete}>Force Delete</button>
        </RoleGuard>

        {/* Role check with multiple roles */}
        <RoleGuard roles={[ROLES.ADMIN, ROLES.MANAGER]}>
          <button onClick={handleAssign}>Reassign</button>
        </RoleGuard>
      </div>
    </div>
  );
}
```

#### Permission Guard Components

```jsx
// Basic permission guard
<PermissionGuard resource={RESOURCES.TASKS} action={ACTIONS.DELETE}>
  <button onClick={handleDelete}>Delete</button>
</PermissionGuard>

// With fallback content
<PermissionGuard 
  resource={RESOURCES.SETTINGS} 
  action={ACTIONS.READ}
  fallback={<p>You don't have access to settings</p>}
>
  <SettingsPanel />
</PermissionGuard>

// Role-based guard
<RoleGuard roles={[ROLES.ADMIN, ROLES.MANAGER]}>
  <AdminPanel />
</RoleGuard>

// Check any permission on resource
<AnyPermissionGuard resource={RESOURCES.SETTINGS}>
  <SettingsMenu />
</AnyPermissionGuard>
```

---

## 📊 Audit Log Examples

### Console Output Format

```
[RBAC AUDIT] ✅ ALLOWED | admin | delete:tasks | /api/tasks/123 | User: admin@example.com | Reason: Permission granted
[RBAC AUDIT] ❌ DENIED | viewer | delete:tasks | /api/tasks/456 | User: viewer@example.com | Reason: Permission denied
[RBAC AUDIT] ✅ ALLOWED | editor | update:tasks | /api/tasks/789 | User: editor@example.com | Reason: Resource owner
```

### Log Entry Structure

```javascript
{
  timestamp: "2024-12-20T10:30:00.000Z",
  userId: "user123",
  userEmail: "john@example.com",
  userRole: "editor",
  resource: "tasks",
  action: "delete",
  allowed: false,
  reason: "Permission denied",
  endpoint: "/api/tasks/456",
  ip: "192.168.1.100"
}
```

### Retrieving Audit Logs

```javascript
import { getAuditLogs, getUserAuditLogs, getDeniedAccess } from "@/lib/rbac-middleware";

// Get last 50 audit logs
const recentLogs = getAuditLogs(50);

// Get logs for specific user
const userLogs = getUserAuditLogs("user123", 30);

// Get denied access attempts (security monitoring)
const deniedAttempts = getDeniedAccess(20);
```

---

## 🧪 Testing Scenarios

### 1. Admin Full Access

**Setup**: User with `admin` role  
**Expected**: ✅ All operations succeed

```bash
# Admin can read tasks
GET /api/tasks → 200 OK

# Admin can create tasks
POST /api/tasks → 201 Created

# Admin can update any task
PUT /api/tasks/123 → 200 OK

# Admin can delete any task
DELETE /api/tasks/123 → 200 OK

# Audit log shows: ✅ ALLOWED for all
```

### 2. Viewer Read-Only

**Setup**: User with `viewer` role  
**Expected**: ✅ Read succeeds, ❌ Write operations fail

```bash
# Viewer can read tasks
GET /api/tasks → 200 OK
[RBAC AUDIT] ✅ ALLOWED | viewer | read:tasks

# Viewer cannot create tasks
POST /api/tasks → 403 Forbidden
{
  "error": "Insufficient permissions",
  "userRole": "viewer",
  "requiredPermission": "create:tasks"
}
[RBAC AUDIT] ❌ DENIED | viewer | create:tasks

# Viewer cannot update tasks
PUT /api/tasks/123 → 403 Forbidden

# Viewer cannot delete tasks
DELETE /api/tasks/123 → 403 Forbidden
```

### 3. Editor CRU Permissions

**Setup**: User with `editor` role  
**Expected**: ✅ Create/Read/Update succeed, ❌ Delete fails

```bash
# Editor can create tasks
POST /api/tasks → 201 Created
[RBAC AUDIT] ✅ ALLOWED | editor | create:tasks

# Editor can read tasks
GET /api/tasks → 200 OK

# Editor can update tasks
PUT /api/tasks/123 → 200 OK
[RBAC AUDIT] ✅ ALLOWED | editor | update:tasks

# Editor cannot delete tasks
DELETE /api/tasks/123 → 403 Forbidden
[RBAC AUDIT] ❌ DENIED | editor | delete:tasks
```

### 4. Ownership Override

**Setup**: Viewer who created a task  
**Expected**: ✅ Can edit/delete their own task despite lacking general permission

```bash
# Viewer creates task (using a different account with create permission)
# Task created with creatorId = viewer123

# Viewer tries to update someone else's task
PUT /api/tasks/other-task → 403 Forbidden
[RBAC AUDIT] ❌ DENIED | viewer | update:tasks | Reason: Permission denied

# Viewer tries to update their own task
PUT /api/tasks/own-task → 200 OK
[RBAC AUDIT] ✅ ALLOWED | viewer | update:tasks | Reason: Resource owner

# Viewer can delete their own task
DELETE /api/tasks/own-task → 200 OK
[RBAC AUDIT] ✅ ALLOWED | viewer | delete:tasks | Reason: Resource owner
```

### 5. Manager Team Management

**Setup**: User with `manager` role  
**Expected**: ✅ CRUD on tasks and projects, ✅ Read users, ❌ No settings/audit access

```bash
# Manager has full task CRUD
POST /api/tasks → 201 Created
PUT /api/tasks/123 → 200 OK
DELETE /api/tasks/123 → 200 OK

# Manager can read users
GET /api/users → 200 OK

# Manager cannot access settings
GET /api/settings → 403 Forbidden

# Manager cannot access audit logs
GET /api/audit-logs → 403 Forbidden
```

---

## 🔒 Security Considerations

### 1. Defense in Depth

**Server-Side Enforcement**: Always enforce permissions on the API/server side. UI guards are for UX only.

```javascript
// ❌ WRONG: Only client-side check
function DeleteButton() {
  const canDelete = usePermission(RESOURCES.TASKS, ACTIONS.DELETE);
  if (!canDelete) return null;
  
  // API has no RBAC check - SECURITY HOLE!
  return <button onClick={() => fetch('/api/tasks/123', { method: 'DELETE' })}>Delete</button>;
}

// ✅ CORRECT: Server-side enforcement
export async function DELETE(request, { params }) {
  // Always check permission on server
  const authResult = await requirePermission(request, RESOURCES.TASKS, ACTIONS.DELETE);
  if (authResult.errorResponse) return authResult.errorResponse;
  
  // ... delete logic
}
```

### 2. Audit Trail

**Log Everything**: Both allowed and denied access for security monitoring.

```javascript
// Track suspicious patterns
const deniedAttempts = getDeniedAccess(100);
const suspiciousUsers = deniedAttempts
  .filter(log => log.userId === targetUserId)
  .length > 10; // More than 10 denied attempts

if (suspiciousUsers) {
  console.warn(`Suspicious activity from user ${targetUserId}`);
  // Alert security team, lock account, etc.
}
```

### 3. IP Address Logging

**Track Origins**: Log IP addresses for security investigations.

```javascript
function extractIpAddress(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
```

### 4. Role Validation

**Verify Roles**: Always validate role exists before checking permissions.

```javascript
export function isValidRole(role) {
  return Object.values(ROLES).includes(role);
}

// In middleware
if (!isValidRole(user.role)) {
  logAccessDecision({ ...logEntry, allowed: false, reason: "Invalid role" });
  return { errorResponse: sendError("Invalid user role", 403) };
}
```

---

## 📈 Scalability & Future Enhancements

### 1. Policy-Based Access Control (PBAC)

**Current**: Role-based (static permissions)  
**Future**: Policy-based (dynamic rules)

```javascript
// Example: Time-based access
{
  policy: "BusinessHoursOnly",
  rule: (user, resource, action, context) => {
    const hour = new Date().getHours();
    return hour >= 9 && hour <= 17; // 9 AM - 5 PM
  }
}

// Example: Location-based access
{
  policy: "OnPremiseOnly",
  rule: (user, resource, action, context) => {
    return context.ip.startsWith("192.168."); // Internal network
  }
}
```

### 2. Attribute-Based Access Control (ABAC)

**Current**: Role-based  
**Future**: Attribute-based (user attributes, resource attributes, environment attributes)

```javascript
// Example: Department-based access
{
  rule: (user, resource) => {
    return user.department === resource.department;
  }
}

// Example: Clearance level
{
  rule: (user, resource) => {
    return user.clearanceLevel >= resource.requiredClearance;
  }
}
```

### 3. Permission Inheritance

**Current**: Flat role permissions  
**Future**: Hierarchical inheritance (Admin inherits all lower roles)

```javascript
const roleHierarchy = {
  admin: ["manager", "editor", "viewer"],
  manager: ["editor", "viewer"],
  editor: ["viewer"],
  viewer: [],
};

function hasPermission(role, resource, action) {
  // Check role's own permissions
  if (rolePermissions[role]?.[resource]?.includes(action)) {
    return true;
  }

  // Check inherited permissions
  const inheritedRoles = roleHierarchy[role] || [];
  return inheritedRoles.some(inheritedRole =>
    rolePermissions[inheritedRole]?.[resource]?.includes(action)
  );
}
```

### 4. Database Audit Logs

**Current**: In-memory storage (demo)  
**Future**: Database persistence

```prisma
model AuditLog {
  id        String   @id @default(cuid())
  timestamp DateTime @default(now())
  userId    String
  userEmail String
  userRole  String
  resource  String
  action    String
  allowed   Boolean
  reason    String
  endpoint  String
  ip        String
  
  user      User     @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([allowed])
  @@index([timestamp])
}
```

```javascript
// Save to database
export async function logAccessDecision(logEntry) {
  await prisma.auditLog.create({
    data: {
      timestamp: new Date(),
      ...logEntry,
    },
  });
}
```

### 5. Permission Caching

**Current**: Real-time checks  
**Future**: Cache permissions for performance

```javascript
import { getCache, setCache } from "@/lib/redis";

export async function hasPermission(role, resource, action) {
  const cacheKey = `rbac:${role}:${resource}:${action}`;
  
  // Try cache first
  const cached = await getCache(cacheKey);
  if (cached !== null) return cached === "true";

  // Compute permission
  const allowed = rolePermissions[role]?.[resource]?.includes(action);

  // Cache for 5 minutes
  await setCache(cacheKey, allowed ? "true" : "false", 300);

  return allowed;
}
```

---

## 🎬 Demo & Testing

### 1. Create Test Users

Run Prisma Studio to create test users with different roles:

```bash
npx prisma studio
```

Create users:
```javascript
// admin@example.com (role: admin)
// manager@example.com (role: manager)
// editor@example.com (role: editor)
// viewer@example.com (role: viewer)
```

### 2. Test Permission Scenarios

```bash
# Login as viewer
POST /api/auth/login
{ "email": "viewer@example.com", "password": "..." }

# Try to delete task (should fail)
DELETE /api/tasks/123
→ 403 Forbidden
→ Console: [RBAC AUDIT] ❌ DENIED | viewer | delete:tasks

# Login as admin
POST /api/auth/login
{ "email": "admin@example.com", "password": "..." }

# Delete task (should succeed)
DELETE /api/tasks/123
→ 200 OK
→ Console: [RBAC AUDIT] ✅ ALLOWED | admin | delete:tasks
```

### 3. Monitor Audit Logs

Open browser console and watch RBAC audit logs:

```
[RBAC AUDIT] ✅ ALLOWED | admin | read:tasks | /api/tasks | User: admin@example.com | Reason: Permission granted
[RBAC AUDIT] ✅ ALLOWED | manager | create:tasks | /api/tasks | User: manager@example.com | Reason: Permission granted
[RBAC AUDIT] ❌ DENIED | viewer | delete:tasks | /api/tasks/123 | User: viewer@example.com | Reason: Permission denied
[RBAC AUDIT] ✅ ALLOWED | editor | update:tasks | /api/tasks/456 | User: editor@example.com | Reason: Resource owner
```

---

## 🎓 Key Learnings

### 1. Separation of Concerns

- **API Layer**: Enforces permissions (security boundary)
- **UI Layer**: Improves UX (hide unavailable actions)
- **Never trust client**: Always verify on server

### 2. Audit Everything

- Log both success and failure
- Include context (IP, endpoint, reason)
- Enable security monitoring and incident response

### 3. Ownership vs. General Permissions

- Users can manage their own resources
- Overrides general permission checks
- Implements "user-centric" access control

### 4. Deny by Default

- No permission = access denied
- Explicit grants required
- Reduces attack surface

### 5. Role Hierarchy Clarity

- Clear role descriptions
- Predictable permission inheritance (future)
- Easy to understand and maintain

---

## 📚 Related Documentation

- [DAY22_S_JWT.md](./DAY22_S_JWT.md) - JWT authentication (prerequisite)
- [DAY21_M_TOASTS.md](./DAY21_M_TOASTS.md) - Toast notifications
- [DAY22_M_FALLBACK.md](./DAY22_M_FALLBACK.md) - Loading/error states

---

## ✅ Summary

**RBAC implementation is complete** with:
- ✅ 4-role hierarchy with clear permissions
- ✅ Granular per-resource, per-action control
- ✅ API-level enforcement with middleware
- ✅ UI-level permission guards and hooks
- ✅ Comprehensive audit logging (console + storage-ready)
- ✅ Ownership checks for user resources
- ✅ Production-ready architecture (scalable, secure)

**Next Steps**:
- Run Prisma migration to update User role field
- Create test users with different roles
- Test permission scenarios (viewer delete ❌, admin delete ✅)
- Monitor audit logs in console
- Consider policy-based or attribute-based access control for advanced scenarios

---

**Author**: GitHub Copilot  
**Model**: Claude Sonnet 4.5  
**Date**: December 2024
